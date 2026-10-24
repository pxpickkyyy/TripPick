import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAiRecommendations, fetchAiCommentary } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';
import { CURATED_DESTINATIONS, type TravelDestination } from '../lib/travelDestinations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { EscrowBroadcastPayload } from '../types/procurement';
import { fetchNextBatchDestinations as fetchNextBatchDestinationsService } from '../services/discoveryService.ts';

export interface Room {
  id: string;
  created_at: string;
  status: 'waiting' | 'swiping' | 'matched';
  destinations_deck: TravelDestination[] | null;
  vibe?: string;
  host_id?: string;
  discovery_mode?: 'rapid' | 'infinite';
  deck_batch_version?: number;
  min_budget?: number;
  max_budget?: number;
}

export interface RoomUser {
  id: string;
  room_id: string;
  user_name: string;
  role: string;
  preferred_amenities: string[];
  joinedAt?: number;
  lastHeartbeat?: number;
  isHost?: boolean;
  isSimulated?: boolean;
}

export interface Swipe {
  id: string;
  room_id: string;
  user_id: string;
  destination_id: number;
  is_like: boolean;
  is_veto?: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_name: string;
  message_text: string;
  created_at: string;
}

export type StepType = 'landing' | 'profile' | 'lobby' | 'swiping' | 'matched';

export interface DepositReceipt {
  receiptNo: string;
  amount: number;
  paidAt: string;
  taxId: string;
}

export interface CachedSessionState {
  roomId: string;
  step: StepType;
  room: Room | null;
  users: RoomUser[];
  swipes: Swipe[];
  messages: ChatMessage[];
  matchedDestination: TravelDestination | null;
  currentUser: RoomUser | null;
  isHost: boolean;
  lastUpdated: number;
  depositStatus?: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt?: DepositReceipt | null;
  discoveryMode?: 'rapid' | 'infinite';
  deckBatchVersion?: number;
}

export const MAX_ROOM_CAPACITY = 20;

interface PresenceItem {
  user?: RoomUser;
}

interface IncomingPayload {
  id?: string;
  room?: Room;
  destination?: TravelDestination;
  destination_id?: number;
  user_id?: string;
  userId?: string;
  user?: RoomUser;
  newHostId?: string;
  is_like?: boolean;
  is_veto?: boolean;
  message_text?: string;
  sender_name?: string;
  emoji?: string;
  fromUserId?: string;
  users?: RoomUser[];
  swipes?: Swipe[];
  matchedDestination?: TravelDestination | null;
  isHostAuthority?: boolean;
  isHost?: boolean;
  timestamp?: number;
  user_name?: string;
  role?: string;
  preferred_amenities?: string[];
  newDestinations?: TravelDestination[];
  batchVersion?: number;
  discoveryMode?: 'rapid' | 'infinite';
  discovery_mode?: 'rapid' | 'infinite';
  [key: string]: unknown;
}

// Unambiguous character set eliminating 0/O and 1/I confusion
const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += ROOM_CODE_CHARSET.charAt(Math.floor(Math.random() * ROOM_CODE_CHARSET.length));
  }
  return result;
}

export function normalizeRoomCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);
}

function loadCachedSession(targetRoomId?: string | null): CachedSessionState | null {
  try {
    const activeCode = targetRoomId || localStorage.getItem('trippick_room_id');
    if (!activeCode) return null;
    const raw = localStorage.getItem(`trippick_session_${activeCode}`);
    if (!raw) return null;
    const parsed: CachedSessionState = JSON.parse(raw);
    // Ignore sessions older than 24 hours
    if (Date.now() - parsed.lastUpdated > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`trippick_session_${activeCode}`);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('TripPick: Could not parse cached session:', err);
    return null;
  }
}

export function useTripPick() {
  // Pre-load from cached session if available on page refresh
  const initialCache = loadCachedSession();

  const [roomId, setRoomId] = useState<string | null>(() => initialCache?.roomId || null);
  const [step, setStep] = useState<StepType>(() => initialCache?.step || 'landing');
  const [room, setRoom] = useState<Room | null>(() => initialCache?.room || null);
  const [users, setUsers] = useState<RoomUser[]>(() => initialCache?.users || []);
  const [swipes, setSwipes] = useState<Swipe[]>(() => initialCache?.swipes || []);
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialCache?.messages || []);
  const [matchedDestination, setMatchedDestination] = useState<TravelDestination | null>(
    () => initialCache?.matchedDestination || null
  );
  const [currentUser, setCurrentUser] = useState<RoomUser | null>(
    () => initialCache?.currentUser || null
  );
  const [isHost, setIsHost] = useState<boolean>(() => {
    if (!initialCache) return false;
    return Boolean(
      initialCache.isHost &&
      initialCache.currentUser?.isHost &&
      (!initialCache.room?.host_id || initialCache.room.host_id === initialCache.currentUser?.id)
    );
  });
  const [depositStatus, setDepositStatus] = useState<'UNPAID' | 'PENDING' | 'SECURED_ESCROW'>(
    () => initialCache?.depositStatus || 'UNPAID'
  );
  const [depositReceipt, setDepositReceipt] = useState<DepositReceipt | null>(
    () => initialCache?.depositReceipt || null
  );
  const [loading, setLoading] = useState(false);
  const [compilingDeck, setCompilingDeck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedEmojis, setReceivedEmojis] = useState<{ id: string; emoji: string }[]>([]);
  const [escrowNotification, setEscrowNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Infinite Live Discovery State
  const [discoveryMode, setDiscoveryMode] = useState<'rapid' | 'infinite'>(
    () => initialCache?.discoveryMode || 'rapid'
  );
  const [deckBatchVersion, setDeckBatchVersion] = useState<number>(
    () => initialCache?.deckBatchVersion || initialCache?.room?.deck_batch_version || 1
  );
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [seenPlaceIds, setSeenPlaceIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    (initialCache?.room?.destinations_deck || []).forEach(d => {
      if (d.google_place_id) set.add(d.google_place_id);
    });
    return set;
  });
  const [discoveryStatus, setDiscoveryStatus] = useState<string | null>(null);

  // Dual Realtime Channel Refs: Browser BroadcastChannel + Supabase WebSockets
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);

  // Sync references to prevent stale closures in event listeners
  const roomRef = useRef<Room | null>(room);
  const usersRef = useRef<RoomUser[]>(users);
  const swipesRef = useRef<Swipe[]>(swipes);
  const matchedDestinationRef = useRef<TravelDestination | null>(matchedDestination);
  const isHostRef = useRef<boolean>(isHost);
  const currentUserRef = useRef<RoomUser | null>(currentUser);
  const stepRef = useRef<StepType>(step);
  const depositStatusRef = useRef<'UNPAID' | 'PENDING' | 'SECURED_ESCROW'>(depositStatus);
  const depositReceiptRef = useRef<DepositReceipt | null>(depositReceipt);
  const discoveryModeRef = useRef<'rapid' | 'infinite'>(discoveryMode);
  const deckBatchVersionRef = useRef<number>(deckBatchVersion);
  const lastFetchedBatchVersionRef = useRef<number>(deckBatchVersion);
  const isFetchingMoreRef = useRef<boolean>(isFetchingMore);
  const seenPlaceIdsRef = useRef<Set<string>>(seenPlaceIds);
  const fetchNextBatchRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { swipesRef.current = swipes; }, [swipes]);
  useEffect(() => { matchedDestinationRef.current = matchedDestination; }, [matchedDestination]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { depositStatusRef.current = depositStatus; }, [depositStatus]);
  useEffect(() => { depositReceiptRef.current = depositReceipt; }, [depositReceipt]);
  useEffect(() => { discoveryModeRef.current = discoveryMode; }, [discoveryMode]);
  useEffect(() => { deckBatchVersionRef.current = deckBatchVersion; }, [deckBatchVersion]);
  useEffect(() => { isFetchingMoreRef.current = isFetchingMore; }, [isFetchingMore]);
  useEffect(() => { seenPlaceIdsRef.current = seenPlaceIds; }, [seenPlaceIds]);

  // Persist State Snapshot on every state update to protect against page refreshes & sleep mode
  useEffect(() => {
    if (!roomId) return;
    try {
      const snapshot: CachedSessionState = {
        roomId,
        step,
        room,
        users,
        swipes,
        messages,
        matchedDestination,
        currentUser,
        isHost,
        lastUpdated: Date.now(),
        depositStatus,
        depositReceipt,
        discoveryMode,
        deckBatchVersion,
      };
      localStorage.setItem(`trippick_session_${roomId}`, JSON.stringify(snapshot));
      localStorage.setItem('trippick_room_id', roomId);
      localStorage.setItem('trippick_is_host', isHost ? 'true' : 'false');
      if (currentUser?.id) {
        localStorage.setItem('trippick_user_id', currentUser.id);
      }
    } catch (e) {
      console.warn('TripPick: LocalStorage quota or access error:', e);
    }
  }, [roomId, step, room, users, swipes, messages, matchedDestination, currentUser, isHost, depositStatus, depositReceipt, discoveryMode, deckBatchVersion]);

  const roomContextRef = useRef<RoomContextInfo>({
    roomCode: '',
    roomStatus: 'waiting',
    users: [],
    progress: { swipedCount: 0, totalCount: 0, isWaitingForOthers: false }
  });

  // Calculate unswiped destinations for current user
  const unswipedDestinations = (room?.destinations_deck || []).filter(dest => {
    if (!currentUser) return true;
    return !swipes.some(s => s.user_id === currentUser.id && s.destination_id === dest.id);
  });

  // Calculate active peers who are currently swiping
  const activeTeammates = users.filter(u => {
    if (u.id === currentUser?.id) return true;
    if (currentTime === 0) return true;
    const lastSeen = u.lastHeartbeat || u.joinedAt || 0;
    return (currentTime - lastSeen) < 12000;
  });

  const peersStillSwiping = activeTeammates.filter(u => {
    if (u.id === currentUser?.id) return false;
    const userSwipes = swipes.filter(s => s.user_id === u.id);
    const deck = room?.destinations_deck || [];
    return deck.some(dest => !userSwipes.some(s => s.destination_id === dest.id));
  });

  const allActiveUsersFinished = Boolean(
    currentUser &&
    (room?.destinations_deck?.length ?? 0) > 0 &&
    activeTeammates.length > 0 &&
    activeTeammates.every(u => {
      const userSwipes = swipes.filter(s => s.user_id === u.id);
      const deck = room?.destinations_deck || [];
      return deck.length > 0 && deck.every(dest => userSwipes.some(s => s.destination_id === dest.id));
    })
  );

  const isWaitingForOthers = Boolean(
    currentUser &&
    (room?.destinations_deck?.length ?? 0) > 0 &&
    unswipedDestinations.length === 0 &&
    step === 'swiping' &&
    !matchedDestination &&
    peersStillSwiping.length > 0
  );

  // Update room context ref for AI Concierge telemetry
  useEffect(() => {
    roomContextRef.current = {
      roomCode: roomId || '',
      roomStatus: room?.status || 'waiting',
      users: users,
      currentUser: currentUser || undefined,
      currentDestination: unswipedDestinations[0] || null,
      matchedDestination: matchedDestination,
      vibe: room?.vibe,
      progress: {
        swipedCount: (room?.destinations_deck?.length || 0) - unswipedDestinations.length,
        totalCount: room?.destinations_deck?.length || 0,
        isWaitingForOthers
      }
    };
  }, [roomId, room, users, currentUser, unswipedDestinations, matchedDestination, isWaitingForOthers]);

  // Universal Broadcast helper: Dispatches to local tabs AND remote devices via Supabase
  const broadcastEvent = useCallback((type: string, payload?: unknown) => {
    // 1. Local BroadcastChannel (cross-tab zero-config)
    try {
      broadcastChannelRef.current?.postMessage({ type, payload });
    } catch {
      // Local channel closed
    }

    // 2. Supabase Realtime WebSocket broadcast (cross-device cloud)
    try {
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: type,
          payload
        });
      }
    } catch (err) {
      console.warn('Supabase Realtime broadcast error:', err);
    }
  }, []);

  // Universal Event Handler with Split-Brain & Leader-Priority Protection
  const handleIncomingEvent = useCallback((type: string, rawPayload: unknown) => {
    if (!type || !rawPayload || typeof rawPayload !== 'object') return;
    const payload = rawPayload as IncomingPayload;

    if (type === 'HEARTBEAT') {
      if (payload.userId) {
        const now = Date.now();
        setUsers(prev => {
          const exists = prev.some(u => u.id === payload.userId);
          if (exists) {
            return prev.map(u => u.id === payload.userId ? {
              ...u,
              lastHeartbeat: Number(payload.timestamp) || now,
              isHost: typeof payload.isHost === 'boolean' ? payload.isHost : u.isHost,
              user_name: payload.user?.user_name || u.user_name,
              role: payload.user?.role || u.role,
              preferred_amenities: payload.user?.preferred_amenities || u.preferred_amenities,
            } : u);
          } else if (payload.user && payload.user.id) {
            // Proactive self-healing: Add peer discovered via heartbeat
            const recovered: RoomUser = {
              id: payload.user.id,
              room_id: payload.user.room_id || roomId || '',
              user_name: payload.user.user_name || 'Teammate',
              role: payload.user.role || 'Team Member',
              preferred_amenities: Array.isArray(payload.user.preferred_amenities) ? payload.user.preferred_amenities : [],
              joinedAt: payload.user.joinedAt || now,
              lastHeartbeat: Number(payload.timestamp) || now,
              isHost: typeof payload.isHost === 'boolean' ? payload.isHost : Boolean(payload.user.isHost),
              isSimulated: Boolean(payload.user.isSimulated),
            };
            return [...prev, recovered];
          }
          return prev;
        });
      }
    } else if (type === 'LEADER_PROMOTED') {
      if (payload.newHostId) {
        setUsers(prev => prev.map(u => ({ ...u, isHost: u.id === payload.newHostId })));
        if (typeof payload.batchVersion === 'number') {
          setDeckBatchVersion(payload.batchVersion);
          deckBatchVersionRef.current = payload.batchVersion;
        }
        if (payload.newHostId === currentUserRef.current?.id) {
          setIsHost(true);
        } else if (isHostRef.current) {
          const newHost = usersRef.current.find(u => u.id === payload.newHostId);
          const self = currentUserRef.current;
          if (newHost && self && (newHost.joinedAt || 0) < (self.joinedAt || 0)) {
            setIsHost(false);
          }
        }
      }
    } else if (type === 'USER_JOINED') {
      if (payload.id && typeof payload.user_name === 'string') {
        const newUser: RoomUser = {
          id: payload.id,
          room_id: payload.room_id ? String(payload.room_id) : (roomId || ''),
          user_name: payload.user_name,
          role: payload.role || 'Team Member',
          preferred_amenities: Array.isArray(payload.preferred_amenities) ? payload.preferred_amenities : [],
          joinedAt: typeof payload.joinedAt === 'number' ? payload.joinedAt : Date.now(),
          lastHeartbeat: Date.now(),
          isHost: Boolean(payload.isHost),
          isSimulated: Boolean(payload.isSimulated),
        };
        setUsers(prev => {
          const map = new Map<string, RoomUser>();
          prev.forEach(u => map.set(u.id, u));
          map.set(newUser.id, { ...map.get(newUser.id), ...newUser, lastHeartbeat: Date.now() });
          return Array.from(map.values());
        });

        // Host Authority: Send authoritative room snapshot with all known users to newcomer
        if (isHostRef.current && roomRef.current) {
          const allKnownUsers = [
            ...usersRef.current.filter(u => u.id !== newUser.id),
            newUser,
          ];
          broadcastEvent('SYNC_ROOM_STATE', {
            room: roomRef.current,
            users: allKnownUsers,
            swipes: swipesRef.current,
            matchedDestination: matchedDestinationRef.current,
            depositStatus: depositStatusRef.current,
            depositReceipt: depositReceiptRef.current,
            isHostAuthority: true,
            timestamp: Date.now()
          });
        }
      }
    } else if (type === 'SESSION_STARTED') {
      if (payload.room) {
        setRoom(payload.room);
        if (payload.room.discovery_mode) {
          setDiscoveryMode(payload.room.discovery_mode);
          discoveryModeRef.current = payload.room.discovery_mode;
        }
        if (typeof payload.room.deck_batch_version === 'number') {
          setDeckBatchVersion(payload.room.deck_batch_version);
          deckBatchVersionRef.current = payload.room.deck_batch_version;
        }
        if (payload.room.destinations_deck) {
          setSeenPlaceIds(prev => {
            const next = new Set(prev);
            payload.room?.destinations_deck?.forEach(d => {
              if (d.google_place_id) next.add(d.google_place_id);
            });
            return next;
          });
        }
        setStep('swiping');
        setCompilingDeck(false);
      }
    } else if (type === 'DECK_EXPANDED') {
      if (Array.isArray(payload.newDestinations) && payload.newDestinations.length > 0) {
        const newCards: TravelDestination[] = payload.newDestinations;
        const nextVersion = typeof payload.batchVersion === 'number' ? payload.batchVersion : (deckBatchVersionRef.current + 1);

        setRoom(prev => {
          if (!prev) return prev;
          const currentDeck = prev.destinations_deck || [];
          const filteredNew = newCards.filter(nc =>
            !currentDeck.some(ed => ed.id === nc.id || (nc.google_place_id && ed.google_place_id === nc.google_place_id))
          );
          if (filteredNew.length === 0) return prev;
          return {
            ...prev,
            destinations_deck: [...currentDeck, ...filteredNew],
            deck_batch_version: nextVersion,
          };
        });

        setDeckBatchVersion(nextVersion);
        deckBatchVersionRef.current = nextVersion;
        setSeenPlaceIds(prev => {
          const next = new Set(prev);
          newCards.forEach(d => {
            if (d.google_place_id) next.add(d.google_place_id);
          });
          return next;
        });
      }
    } else if (type === 'SESSION_RESET') {
      setSwipes([]);
      setMatchedDestination(null);
      setStep('lobby');
      setDeckBatchVersion(1);
      deckBatchVersionRef.current = 1;
      lastFetchedBatchVersionRef.current = 1;
      setRoom(prev => prev ? { ...prev, status: 'waiting', destinations_deck: null, deck_batch_version: 1 } : null);
    } else if (type === 'USER_LEFT') {
      if (payload.userId) {
        setUsers(prev => prev.filter(u => u.id !== payload.userId));
      }
    } else if (type === 'SWIPE_SUBMITTED') {
      if (payload.id && typeof payload.destination_id === 'number' && typeof payload.user_id === 'string') {
        const newSwipe: Swipe = {
          id: payload.id,
          room_id: String(payload.room_id || roomId || ''),
          user_id: payload.user_id,
          destination_id: payload.destination_id,
          is_like: Boolean(payload.is_like),
          is_veto: Boolean(payload.is_veto),
        };
        setSwipes(prev => {
          if (prev.some(s => s.id === newSwipe.id)) return prev;
          return [...prev, newSwipe];
        });

        // If host receives peer swipe in infinite mode, check pre-fetch trigger
        if (discoveryModeRef.current === 'infinite' && isHostRef.current && !isFetchingMoreRef.current) {
          const currentDeck = roomRef.current?.destinations_deck || [];
          const totalDeck = currentDeck.length;
          if (totalDeck > 0) {
            const peerSwipes = [...swipesRef.current, newSwipe].filter(s => s.user_id === payload.user_id);
            const swipedCount = new Set(peerSwipes.map(s => s.destination_id)).size;
            const remaining = Math.max(0, totalDeck - swipedCount);
            if (remaining <= 3 || swipedCount > totalDeck * 0.5) {
              fetchNextBatchRef.current?.();
            }
          }
        }
      }
    } else if (type === 'MATCH_FOUND') {
      // Idempotent lock: Only accept first match to prevent split-brain conflicts
      if (payload.destination && !matchedDestinationRef.current) {
        setMatchedDestination(payload.destination);
        setStep('matched');
      }
    } else if (type === 'CHAT_MESSAGE') {
      if (payload.id && typeof payload.message_text === 'string') {
        const newMsg: ChatMessage = {
          id: payload.id,
          room_id: String(payload.room_id || roomId || ''),
          sender_name: payload.sender_name || 'AI ผู้ช่วย',
          message_text: payload.message_text,
          created_at: String(payload.created_at || new Date().toISOString())
        };
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } else if (type === 'BROADCAST_EMOJI') {
      if (payload.id && typeof payload.emoji === 'string') {
        const emojiItem = { id: payload.id, emoji: payload.emoji };
        setReceivedEmojis(prev => [...prev, emojiItem]);
        setTimeout(() => {
          setReceivedEmojis(prev => prev.filter(e => e.id !== emojiItem.id));
        }, 3000);
      }
    } else if (type === 'ESCROW_LOCKED' || type === 'DEPOSIT_COMPLETED') {
      const receiptNo = typeof payload.depositId === 'string'
        ? payload.depositId
        : (typeof payload.receipt_no === 'string' ? payload.receipt_no : `DEP-TP-${Date.now().toString().slice(-6)}`);
      const amount = typeof payload.amount === 'number' ? payload.amount : 5000;
      const paidAt = typeof payload.timestamp === 'number'
        ? new Date(payload.timestamp).toISOString()
        : (typeof payload.paidAt === 'string' ? payload.paidAt : new Date().toISOString());
      const taxId = typeof payload.companyTaxId === 'string' ? payload.companyTaxId : '0105558123456';
      setDepositStatus('SECURED_ESCROW');
      setDepositReceipt({ receiptNo, amount, paidAt, taxId });
      setEscrowNotification('🎉 บริษัทวางมัดจำล็อกสถานที่เรียบร้อยแล้ว');
      setTimeout(() => {
        setEscrowNotification(prev => prev === '🎉 บริษัทวางมัดจำล็อกสถานที่เรียบร้อยแล้ว' ? null : prev);
      }, 5000);
    } else if (type === 'REQUEST_ROOM_STATE') {
      // Authoritative response from Host or latest peer
      if (isHostRef.current || roomRef.current) {
        broadcastEvent('SYNC_ROOM_STATE', {
          room: roomRef.current,
          users: usersRef.current,
          swipes: swipesRef.current,
          matchedDestination: matchedDestinationRef.current,
          depositStatus: depositStatusRef.current,
          depositReceipt: depositReceiptRef.current,
          isHostAuthority: isHostRef.current,
          timestamp: Date.now()
        });
      }
    } else if (type === 'SYNC_ROOM_STATE') {
      if (payload.depositStatus === 'SECURED_ESCROW') {
        setDepositStatus('SECURED_ESCROW');
        if (payload.depositReceipt && typeof payload.depositReceipt === 'object') {
          setDepositReceipt(payload.depositReceipt as DepositReceipt);
        }
      }

      if (payload.room) {
        setRoom(prev => {
          // If we are not host or payload is authoritative, accept new room deck
          if (!prev || payload.isHostAuthority) return payload.room ?? null;
          return prev;
        });

        if (payload.room.discovery_mode) {
          setDiscoveryMode(payload.room.discovery_mode);
          discoveryModeRef.current = payload.room.discovery_mode;
        }

        if (typeof payload.room.deck_batch_version === 'number') {
          setDeckBatchVersion(payload.room.deck_batch_version);
          deckBatchVersionRef.current = payload.room.deck_batch_version;
          lastFetchedBatchVersionRef.current = Math.max(lastFetchedBatchVersionRef.current, payload.room.deck_batch_version);
        }

        if (Array.isArray(payload.room.destinations_deck)) {
          setSeenPlaceIds(prev => {
            const next = new Set(prev);
            payload.room?.destinations_deck?.forEach(d => {
              if (d.google_place_id) next.add(d.google_place_id);
            });
            return next;
          });
        }

        if (payload.room.status === 'swiping' && stepRef.current === 'lobby') {
          setStep('swiping');
        }
      }

      if (payload.users && Array.isArray(payload.users)) {
        setUsers(prev => {
          const map = new Map<string, RoomUser>();
          prev.forEach(u => map.set(u.id, u));
          if (currentUserRef.current) {
            map.set(currentUserRef.current.id, currentUserRef.current);
          }
          payload.users?.forEach((u: RoomUser) => {
            if (u && u.id) {
              const existing = map.get(u.id);
              map.set(u.id, {
                ...existing,
                ...u,
                lastHeartbeat: Math.max(existing?.lastHeartbeat || 0, u.lastHeartbeat || Date.now())
              });
            }
          });
          return Array.from(map.values());
        });
      }

      if (payload.swipes && Array.isArray(payload.swipes)) {
        setSwipes(prev => {
          const map = new Map<string, Swipe>();
          prev.forEach(s => map.set(s.id, s));
          payload.swipes?.forEach((s: Swipe) => {
            if (s && s.id) map.set(s.id, s);
          });
          return Array.from(map.values());
        });
      }

      if (payload.matchedDestination && !matchedDestinationRef.current) {
        setMatchedDestination(payload.matchedDestination);
        setStep('matched');
      }
    }
  }, [broadcastEvent, roomId]);

  // Connect Realtime Synchronization (BroadcastChannel + Supabase WebSockets)
  useEffect(() => {
    if (!roomId) return;

    // 1. Local Cross-Tab Channel
    const channelName = `trippick_room_${roomId}`;
    const localChannel = new BroadcastChannel(channelName);
    broadcastChannelRef.current = localChannel;

    localChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      handleIncomingEvent(type, payload);
    };

    // 2. Supabase Realtime WebSockets Channel
    let sbChannel: RealtimeChannel | null = null;
    if (isSupabaseConfigured) {
      const activeChannel = supabase.channel(`trippick_${roomId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: currentUserRef.current?.id || `user_${Math.random().toString(36).substring(2, 8)}` }
        }
      });
      sbChannel = activeChannel;

      activeChannel
        .on('broadcast', { event: 'USER_JOINED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('USER_JOINED', payload))
        .on('broadcast', { event: 'USER_LEFT' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('USER_LEFT', payload))
        .on('broadcast', { event: 'SESSION_STARTED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SESSION_STARTED', payload))
        .on('broadcast', { event: 'SESSION_RESET' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SESSION_RESET', payload))
        .on('broadcast', { event: 'SWIPE_SUBMITTED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SWIPE_SUBMITTED', payload))
        .on('broadcast', { event: 'MATCH_FOUND' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('MATCH_FOUND', payload))
        .on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('CHAT_MESSAGE', payload))
        .on('broadcast', { event: 'BROADCAST_EMOJI' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('BROADCAST_EMOJI', payload))
        .on('broadcast', { event: 'REQUEST_ROOM_STATE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('REQUEST_ROOM_STATE', payload))
        .on('broadcast', { event: 'SYNC_ROOM_STATE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SYNC_ROOM_STATE', payload))
        .on('broadcast', { event: 'DEPOSIT_COMPLETED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('DEPOSIT_COMPLETED', payload))
        .on('broadcast', { event: 'ESCROW_LOCKED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('ESCROW_LOCKED', payload))
        .on('broadcast', { event: 'DECK_EXPANDED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('DECK_EXPANDED', payload))
        .on('broadcast', { event: 'LEADER_PROMOTED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('LEADER_PROMOTED', payload))
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'trippick_rooms',
            filter: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId)
              ? `id=eq.${roomId}`
              : `room_code=eq.${roomId}`,
          },
          (payload: { new?: { status?: string; winning_destination_id?: string } }) => {
            if (payload.new?.status === 'CONSENSUS_REACHED' && payload.new.winning_destination_id) {
              const winningDestId = payload.new.winning_destination_id;
              const allVenues = [...(roomRef.current?.destinations_deck || []), ...CURATED_DESTINATIONS];
              const winner = allVenues.find(d => d.id.toString() === winningDestId || d.google_place_id === winningDestId);
              if (winner && !matchedDestinationRef.current) {
                setMatchedDestination(winner);
                setStep('matched');
                broadcastEvent('MATCH_FOUND', { destination: winner });
              }
            } else if (payload.new?.status === 'LOCKED_ESCROW') {
              setDepositStatus('SECURED_ESCROW');
              broadcastEvent('ESCROW_LOCKED', { roomId, timestamp: Date.now() });
            }
          }
        )
        .on('presence', { event: 'leave' }, () => {
          // Do not aggressively prune on transient leave; let explicit USER_LEFT or 30s heartbeat timeout manage exits
        })
        .on('presence', { event: 'sync' }, () => {
          const state = activeChannel.presenceState();
          const presenceUsers: RoomUser[] = [];
          Object.values(state).forEach((items: unknown) => {
            if (Array.isArray(items)) {
              items.forEach((item: PresenceItem) => {
                if (item.user && item.user.id) {
                  presenceUsers.push(item.user);
                }
              });
            }
          });
          if (presenceUsers.length > 0) {
            setUsers(prev => {
              const map = new Map<string, RoomUser>();
              // Preserve all already-known peers to prevent wipeouts during transient delays
              prev.forEach(u => map.set(u.id, u));
              if (currentUserRef.current) {
                map.set(currentUserRef.current.id, currentUserRef.current);
              }
              presenceUsers.forEach(u => {
                if (u && u.id) {
                  const existing = map.get(u.id);
                  map.set(u.id, {
                    ...existing,
                    ...u,
                    lastHeartbeat: Date.now()
                  });
                }
              });
              return Array.from(map.values());
            });
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: PresenceItem[] }) => {
          const newUsers: RoomUser[] = [];
          newPresences.forEach((p) => {
            if (p.user && p.user.id) newUsers.push(p.user);
          });
          if (newUsers.length > 0) {
            setUsers(prev => {
              const map = new Map<string, RoomUser>();
              prev.forEach(u => map.set(u.id, u));
              if (currentUserRef.current) {
                map.set(currentUserRef.current.id, currentUserRef.current);
              }
              newUsers.forEach(u => map.set(u.id, { ...map.get(u.id), ...u, lastHeartbeat: Date.now() }));
              return Array.from(map.values());
            });
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            if (currentUserRef.current) {
              activeChannel.track({ user: currentUserRef.current });
              activeChannel.send({
                type: 'broadcast',
                event: 'USER_JOINED',
                payload: currentUserRef.current
              });
            }
            activeChannel.send({
              type: 'broadcast',
              event: 'REQUEST_ROOM_STATE',
              payload: { fromUserId: currentUserRef.current?.id }
            });
          }
        });

      supabaseChannelRef.current = activeChannel;
    }

    // Request state from existing host or peer
    localChannel.postMessage({ type: 'REQUEST_ROOM_STATE' });

    return () => {
      localChannel.close();
      broadcastChannelRef.current = null;
      if (sbChannel) {
        supabase.removeChannel(sbChannel);
        supabaseChannelRef.current = null;
      }
    };
  }, [roomId, handleIncomingEvent, broadcastEvent]);

  // Proactively track presence whenever currentUser or roomId is available
  useEffect(() => {
    if (!roomId || !currentUser) return;

    // Broadcast join to peers
    broadcastEvent('USER_JOINED', currentUser);

    // Track in Supabase Realtime channel
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.track({ user: currentUser });
      } catch {
        // Channel may still be connecting
      }
    }

    // Request current room state
    broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: currentUser.id });
  }, [roomId, currentUser, broadcastEvent]);

  // Dynamic Host Failover & Resilient Heartbeat Watchdog
  useEffect(() => {
    if (!roomId || step === 'landing' || !currentUser) return;

    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      const currentUsers = usersRef.current;

      // Broadcast heartbeat to all peers including full user object for self-healing
      broadcastEvent('HEARTBEAT', {
        userId: currentUser.id,
        isHost: isHostRef.current,
        user: currentUser,
        timestamp: now
      });

      // Refresh participant presence in PostgreSQL authoritative ledger
      if (isSupabaseConfigured && roomId && currentUser.id) {
        Promise.resolve(supabase.rpc('touch_participant_heartbeat', {
          p_room_id: roomId,
          p_user_id: currentUser.id,
        })).catch(() => {});
      }

      // Periodically prune dead peers if inactive > 30s (except self and simulated)
      setUsers(prev => prev.filter(u => {
        if (u.id === currentUser.id) return true;
        if (u.isSimulated) return true;
        const lastSeen = u.lastHeartbeat || u.joinedAt || 0;
        return (now - lastSeen) < 30000;
      }));

      // Periodic state sync request if in lobby
      if (stepRef.current === 'lobby') {
        broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: currentUser.id });
      }

      // If we are already host, we maintain authority
      if (isHostRef.current) return;

      // CRITICAL: NEVER promote a leader while in 'lobby' or 'profile'!
      // Only the original room creator has authority to configure vibes & start.
      // Dynamic leader failover is strictly for recovery during active swiping/consensus.
      if (stepRef.current !== 'swiping') return;

      // Check if known host has timed out (>6000ms silence)
      const currentHost = currentUsers.find(u => u.isHost);
      const isHostSilent = !currentHost || (now - (currentHost.lastHeartbeat || currentHost.joinedAt || 0) > 6000);

      if (isHostSilent) {
        // Collect currently connected alive peers (heartbeat within 7s or self)
        const alivePeers = currentUsers.filter(u => {
          const diff = now - (u.lastHeartbeat || u.joinedAt || now);
          return diff < 7000 || u.id === currentUser.id;
        });

        if (alivePeers.length > 0) {
          // Sort by joinedAt ascending (earliest joined becomes the next leader)
          alivePeers.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
          const nextLeader = alivePeers[0];

          if (nextLeader.id === currentUser.id) {
            console.log('TripPick: Host timed out (>6s). Dynamic Leader Failover: Promoting self to Host Authority.');
            setIsHost(true);
            isHostRef.current = true;
            const currentBatchVersion = roomRef.current?.deck_batch_version || deckBatchVersionRef.current || 1;
            deckBatchVersionRef.current = currentBatchVersion;
            setDeckBatchVersion(currentBatchVersion);
            lastFetchedBatchVersionRef.current = Math.max(lastFetchedBatchVersionRef.current, currentBatchVersion);
            setUsers(prev => prev.map(u => ({ ...u, isHost: u.id === currentUser.id })));

            broadcastEvent('LEADER_PROMOTED', {
              newHostId: currentUser.id,
              batchVersion: currentBatchVersion,
              timestamp: now
            });

            if (roomRef.current) {
              broadcastEvent('SYNC_ROOM_STATE', {
                room: roomRef.current,
                users: currentUsers.map(u => u.id === currentUser.id ? { ...u, isHost: true } : { ...u, isHost: false }),
                swipes: swipesRef.current,
                matchedDestination: matchedDestinationRef.current,
                isHostAuthority: true,
                timestamp: now
              });
            }

            // If newly promoted host is in infinite mode, verify and pre-fetch if needed
            if (discoveryModeRef.current === 'infinite' && !isFetchingMoreRef.current) {
              const currentDeck = roomRef.current?.destinations_deck || [];
              const totalDeck = currentDeck.length;
              if (totalDeck > 0) {
                const mySwipes = swipesRef.current.filter(s => s.user_id === currentUser.id);
                const swipedCount = new Set(mySwipes.map(s => s.destination_id)).size;
                const remaining = Math.max(0, totalDeck - swipedCount);
                if ((remaining <= 3 || swipedCount > totalDeck * 0.5) && lastFetchedBatchVersionRef.current <= currentBatchVersion) {
                  fetchNextBatchRef.current?.();
                }
              }
            }
          }
        }
      }

      setCurrentTime(now);

      // Automatically prune inactive peers (>25s silent) during active sessions (except self and simulated)
      if (stepRef.current === 'swiping' || stepRef.current === 'matched') {
        setUsers(prev => {
          const alive = prev.filter(u => {
            if (u.id === currentUser.id) return true;
            if (u.isSimulated) return true;
            const diff = now - (u.lastHeartbeat || u.joinedAt || now);
            return diff < 25000;
          });
          return alive.length !== prev.length ? alive : prev;
        });
      }
    }, 2500);

    return () => clearInterval(watchdogInterval);
  }, [roomId, step, currentUser, broadcastEvent]);

  // Consensus Calculation supporting 1 to 20+ team members with atomic lock
  useEffect(() => {
    if (step !== 'swiping' || !room?.destinations_deck || matchedDestination) return;

    const deck = room.destinations_deck;
    const now = Date.now();
    // Count active teammates (received heartbeat within last 15s, self, or simulated)
    const activeTeammates = users.filter(u => {
      if (u.id === currentUser?.id) return true;
      if (u.isSimulated) return true;
      const lastSeen = u.lastHeartbeat || u.joinedAt || 0;
      return (now - lastSeen) < 15000;
    });
    const activeCount = Math.max(1, activeTeammates.length);

    // Consensus rule:
    // 1 person -> 1 like (solo demo)
    // 2 people -> 2 likes (both must like - unanimous)
    // 3 to 20+ people -> at least 60% of active teammates must like it
    const requiredLikes = activeCount <= 2
      ? Math.max(1, activeCount)
      : Math.max(2, Math.ceil(activeCount * 0.6));

    for (const destination of deck) {
      const likesForDest = swipes.filter(s => s.destination_id === destination.id && s.is_like);
      const isVetoed = swipes.some(s => s.destination_id === destination.id && s.is_veto);

      if (!isVetoed && likesForDest.length >= requiredLikes) {
        // Atomic guard: Lock local match first
        if (matchedDestinationRef.current) return;

        queueMicrotask(() => {
          if (matchedDestinationRef.current) return;
          setMatchedDestination(destination);
          setStep('matched');
        });

        // Broadcast authoritative match to all tabs and connected devices
        broadcastEvent('MATCH_FOUND', {
          destination,
          hostId: currentUserRef.current?.id,
          timestamp: Date.now()
        });
        return;
      }
    }

    // Fallback Majority Consensus Check:
    // If all active users have swiped all cards, or if >= 80% have finished in a large group (>=4):
    const finishedUsers = activeTeammates.filter(u => {
      const userSwipes = swipes.filter(s => s.user_id === u.id);
      return deck.every(dest => userSwipes.some(s => s.destination_id === dest.id));
    });

    const isConsensusReady =
      (activeTeammates.length > 0 && finishedUsers.length === activeTeammates.length) ||
      (activeTeammates.length >= 4 && (finishedUsers.length / activeTeammates.length) >= 0.8);

    if (isConsensusReady && !matchedDestinationRef.current) {
      const nonVetoed = deck.filter(dest => !swipes.some(s => s.destination_id === dest.id && s.is_veto));
      if (nonVetoed.length > 0) {
        const scored = nonVetoed.map(dest => ({
          dest,
          likes: swipes.filter(s => s.destination_id === dest.id && s.is_like).length
        }));
        scored.sort((a, b) => b.likes - a.likes);

        // If the top destination received at least 1 positive vote, award majority consensus!
        if (scored[0].likes > 0) {
          const winner = scored[0].dest;
          queueMicrotask(() => {
            if (matchedDestinationRef.current) return;
            setMatchedDestination(winner);
            setStep('matched');
          });
          broadcastEvent('MATCH_FOUND', {
            destination: winner,
            hostId: currentUserRef.current?.id,
            timestamp: Date.now()
          });
          return;
        }
      }
    }
  }, [swipes, users, room, step, matchedDestination, broadcastEvent, currentUser]);

  // Clear Session cleanly
  const leaveRoom = useCallback(() => {
    const activeCode = roomId || localStorage.getItem('trippick_room_id');
    if (currentUser?.id) {
      broadcastEvent('USER_LEFT', { userId: currentUser.id, roomId: activeCode });
      if (supabaseChannelRef.current) {
        try {
          supabaseChannelRef.current.untrack();
        } catch {
          // ignore
        }
      }
    }
    if (activeCode) {
      localStorage.removeItem(`trippick_session_${activeCode}`);
    }
    localStorage.removeItem('trippick_room_id');
    localStorage.removeItem('trippick_user_id');
    localStorage.removeItem('trippick_is_host');

    setRoomId(null);
    setRoom(null);
    setUsers([]);
    setSwipes([]);
    setMessages([]);
    setMatchedDestination(null);
    setCurrentUser(null);
    setIsHost(false);
    setDepositStatus('UNPAID');
    setDepositReceipt(null);
    setCompilingDeck(false);
    setStep('landing');
    setError(null);
  }, [roomId, currentUser, broadcastEvent]);

  // Re-enter Session with Full Snapshot Restoration
  const reenterSession = useCallback(async (): Promise<boolean> => {
    const cached = loadCachedSession();
    if (!cached || !cached.roomId) return false;

    setRoomId(cached.roomId);
    setStep(cached.step === 'landing' ? 'lobby' : cached.step);
    if (cached.room) setRoom(cached.room);
    if (cached.users && cached.users.length > 0) setUsers(cached.users);
    if (cached.swipes && cached.swipes.length > 0) setSwipes(cached.swipes);
    if (cached.messages && cached.messages.length > 0) setMessages(cached.messages);
    if (cached.matchedDestination) setMatchedDestination(cached.matchedDestination);
    if (cached.currentUser) setCurrentUser(cached.currentUser);
    setIsHost(cached.isHost);

    // Ask peers to sync any updates that occurred while away
    broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: cached.currentUser?.id });
    return true;
  }, [broadcastEvent]);

  // Create Room with collision-resistant normalized code
  const createRoom = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const code = generateRoomCode();
      const newRoom: Room = {
        id: code,
        created_at: new Date().toISOString(),
        status: 'waiting',
        destinations_deck: null,
      };

      setRoom(newRoom);
      setRoomId(code);
      setIsHost(true);
      setStep('profile');
      setUsers([]);
      setSwipes([]);
      setMessages([]);
      setMatchedDestination(null);
      setCurrentUser(null);

      localStorage.setItem('trippick_room_id', code);
      localStorage.setItem('trippick_is_host', 'true');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถสร้างห้องทริปได้';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join Room with strict normalization
  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const normalized = normalizeRoomCode(code);
    if (normalized.length !== 4) {
      setError('รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดีครับ (เช่น TRIP)');
      setLoading(false);
      return false;
    }

    try {
      setRoomId(normalized);
      setIsHost(false);
      isHostRef.current = false;
      setStep('profile');
      setUsers([]);
      setSwipes([]);
      setRoom(null);
      setCurrentUser(null);
      currentUserRef.current = null;

      localStorage.setItem('trippick_room_id', normalized);
      localStorage.setItem('trippick_is_host', 'false');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถเข้าร่วมห้องได้ กรุณาตรวจสอบรหัสห้อง';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit Profile / Preferences
  const submitProfile = useCallback(async (name: string, role: string, preferredAmenities: string[]): Promise<boolean> => {
    if (!roomId) return false;
    setLoading(true);
    try {
      const isActuallyHost = Boolean(isHostRef.current);
      const generatedUserId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : 'user_' + Math.random().toString(36).substring(2, 9);

      const user: RoomUser = {
        id: generatedUserId,
        room_id: roomId,
        user_name: name.trim(),
        role: role || 'Team Member',
        preferred_amenities: preferredAmenities,
        joinedAt: Date.now(),
        lastHeartbeat: Date.now(),
        isHost: isActuallyHost,
      };

      if (isActuallyHost) {
        setRoom(prev => prev ? { ...prev, host_id: user.id } : {
          id: roomId,
          created_at: new Date().toISOString(),
          status: 'waiting',
          destinations_deck: null,
          host_id: user.id,
        });
      }

      setCurrentUser(user);
      currentUserRef.current = user;

      setUsers(prev => {
        const map = new Map<string, RoomUser>();
        prev.forEach(u => map.set(u.id, u));
        map.set(user.id, user);
        return Array.from(map.values());
      });

      localStorage.setItem('trippick_user_id', user.id);

      // Register presence in PostgreSQL authoritative participant ledger
      if (isSupabaseConfigured && roomId && user.id) {
        Promise.resolve(supabase.rpc('touch_participant_heartbeat', {
          p_room_id: roomId,
          p_user_id: user.id,
        })).catch(() => {});
      }

      // 1. Broadcast join to other peers
      broadcastEvent('USER_JOINED', user);

      // 2. Track in Supabase Realtime Presence
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.track({ user });
      }

      // 3. Request current room state from Host
      broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: user.id });

      // Add welcoming chat
      const activeLang = (typeof window !== 'undefined' && (localStorage.getItem('trippick_lang') as 'th' | 'en')) || 'th';
      const welcome = await fetchAiCommentary('join', user.user_name, activeLang);
      const welcomeMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        room_id: roomId,
        sender_name: activeLang === 'en' ? 'TripPick AI Concierge' : 'AI ผู้ช่วย TripPick',
        message_text: welcome,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, welcomeMsg]);
      broadcastEvent('CHAT_MESSAGE', welcomeMsg);

      setStep('lobby');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถลงทะเบียนข้อมูลได้';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [roomId, broadcastEvent]);

  // Fetch Next Batch of Destinations for Infinite Discovery Mode
  const fetchNextBatch = useCallback(async () => {
    if (!roomId) return;
    if (isFetchingMoreRef.current) return;
    if (!isHostRef.current) return;

    const currentVersion = roomRef.current?.deck_batch_version || deckBatchVersionRef.current || 1;
    if (lastFetchedBatchVersionRef.current > currentVersion) {
      return;
    }
    lastFetchedBatchVersionRef.current = currentVersion + 1;

    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);
    setDiscoveryStatus('กำลังค้นหา MICE Retreats สดใหม่...');

    try {
      const activeVibe = roomRef.current?.vibe || 'tech-summit';
      const activeHeadcount = Math.max(1, usersRef.current.length);
      const activeBudget = roomRef.current?.max_budget || 8000;
      const existingPlaceIds = Array.from(seenPlaceIdsRef.current);
      const existingNames = (roomRef.current?.destinations_deck || []).map(d => d.title);

      const archetypes: Array<'coastal' | 'mountain' | 'urban' | 'regional_apac'> = [
        'coastal', 'mountain', 'urban', 'regional_apac'
      ];
      const targetArchetype = archetypes[(currentVersion - 1) % archetypes.length];

      const result = await fetchNextBatchDestinationsService({
        archetype: targetArchetype,
        vibe: activeVibe,
        headcount: activeHeadcount,
        maxBudgetPerHead: activeBudget,
        minBudgetPerHead: roomRef.current?.min_budget,
        excludedPlaceIds: existingPlaceIds,
        excludedNames: existingNames,
        batchVersion: currentVersion,
      });

      const newCards = result.destinations;
      const nextVersion = result.batchVersion || currentVersion + 1;

      if (Array.isArray(newCards) && newCards.length > 0) {
        setRoom(prev => {
          if (!prev) return prev;
          const currentDeck = prev.destinations_deck || [];
          const filtered = newCards.filter(nd =>
            !currentDeck.some(ed =>
              ed.id === nd.id ||
              ed.title.toLowerCase() === nd.title.toLowerCase() ||
              (nd.google_place_id && ed.google_place_id === nd.google_place_id)
            )
          );
          if (filtered.length === 0) return prev;
          return {
            ...prev,
            destinations_deck: [...currentDeck, ...filtered],
            deck_batch_version: nextVersion,
          };
        });

        setDeckBatchVersion(nextVersion);
        deckBatchVersionRef.current = nextVersion;

        newCards.forEach(d => {
          if (d.google_place_id) seenPlaceIdsRef.current.add(d.google_place_id);
        });

        setSeenPlaceIds(prev => {
          const next = new Set(prev);
          newCards.forEach(d => {
            if (d.google_place_id) next.add(d.google_place_id);
          });
          return next;
        });

        broadcastEvent('DECK_EXPANDED', {
          batchVersion: nextVersion,
          newDestinations: newCards,
          hostId: currentUserRef.current?.id,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.warn('TripPick: Error fetching next destination batch:', err);
    } finally {
      setIsFetchingMore(false);
      isFetchingMoreRef.current = false;
      setDiscoveryStatus(null);
    }
  }, [roomId, broadcastEvent]);

  useEffect(() => {
    fetchNextBatchRef.current = fetchNextBatch;
  }, [fetchNextBatch]);

  // Start Session (Host compiles retreat deck)
  const startSession = useCallback(async (
    vibe: string,
    minBudget?: number,
    maxBudget?: number,
    _categoryFilter?: string,
    mode: 'rapid' | 'infinite' = 'rapid'
  ): Promise<boolean> => {
    if (!roomId) return false;
    setCompilingDeck(true);
    setLoading(true);

    try {
      setDiscoveryMode(mode);
      discoveryModeRef.current = mode;
      setDeckBatchVersion(1);
      deckBatchVersionRef.current = 1;
      lastFetchedBatchVersionRef.current = 1;

      let deck: TravelDestination[] = [];

      // In Infinite Discovery Mode: fetch live venues from Gemini + Google Places
      if (mode === 'infinite') {
        const activeHeadcount = Math.max(1, usersRef.current.length);
        const activeBudget = maxBudget || 8000;
        setDiscoveryStatus('กำลังค้นหา MICE Retreats สดใหม่...');
        try {
          const result = await fetchNextBatchDestinationsService({
            vibe,
            headcount: activeHeadcount,
            maxBudgetPerHead: activeBudget,
            minBudgetPerHead: minBudget,
            excludedPlaceIds: [],
            excludedNames: [],
            batchVersion: 1,
          });
          if (result && Array.isArray(result.destinations) && result.destinations.length > 0) {
            deck = result.destinations;
          }
        } catch (e) {
          console.warn('TripPick: Initial infinite batch fetch error, falling back to curated:', e);
        }
      }

      // If rapid consensus mode or if infinite discovery initial batch returned empty, fall back to curated recommendations
      if (!deck || deck.length === 0) {
        // Gather team amenity preferences
        const allSelectedAmenities = Array.from(
          new Set(usersRef.current.flatMap(u => u.preferred_amenities))
        );

        deck = await fetchAiRecommendations(
          allSelectedAmenities,
          vibe,
          minBudget,
          maxBudget
        );
      }

      const updatedRoom: Room = {
        id: roomId,
        created_at: roomRef.current?.created_at || new Date().toISOString(),
        status: 'swiping',
        destinations_deck: deck,
        vibe,
        discovery_mode: mode,
        deck_batch_version: 1,
        min_budget: minBudget,
        max_budget: maxBudget,
      };

      setRoom(updatedRoom);
      setStep('swiping');

      // Populate seen place IDs
      const initialSeen = new Set<string>();
      deck.forEach(d => {
        if (d.google_place_id) initialSeen.add(d.google_place_id);
      });
      setSeenPlaceIds(initialSeen);
      seenPlaceIdsRef.current = initialSeen;

      // Broadcast session start to all connected teammates
      broadcastEvent('SESSION_STARTED', { room: updatedRoom });

      // If simulated teammates exist in room, schedule realistic automated votes
      const simUsers = usersRef.current.filter(u => u.isSimulated && u.id !== currentUserRef.current?.id);
      if (simUsers.length > 0 && deck && deck.length > 0) {
        simUsers.forEach((sim, userIdx) => {
          deck.forEach((dest, destIdx) => {
            const delayMs = 1200 + (userIdx * 350) + (destIdx * 700) + Math.floor(Math.random() * 500);
            setTimeout(() => {
              // High probability (80%) of liking to reach consensus smoothly
              const isLike = Math.random() > 0.18;
              const isVeto = !isLike && Math.random() < 0.08;
              const swipePayload: Swipe = {
                id: `swipe_${sim.id}_${dest.id}`,
                room_id: roomId,
                user_id: sim.id,
                destination_id: dest.id,
                is_like: isLike,
                is_veto: isVeto,
              };
              setSwipes(prev => {
                if (prev.some(s => s.id === swipePayload.id)) return prev;
                return [...prev, swipePayload];
              });
              broadcastEvent('SWIPE_SUBMITTED', swipePayload);
            }, delayMs);
          });
        });
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถสร้างชุดสถานที่จัดทริปได้';
      setError(message);
      return false;
    } finally {
      setCompilingDeck(false);
      setLoading(false);
      setDiscoveryStatus(null);
    }
  }, [roomId, broadcastEvent]);

  // Submit Swipe
  const submitSwipe = useCallback(async (destinationId: number, isLike: boolean, isVeto: boolean = false): Promise<boolean> => {
    if (!roomId || !currentUser) return false;

    const swipe: Swipe = {
      id: 'swipe_' + Math.random().toString(36).substring(2, 9),
      room_id: roomId,
      user_id: currentUser.id,
      destination_id: destinationId,
      is_like: isLike,
      is_veto: isVeto,
    };

    setSwipes(prev => [...prev, swipe]);

    // Broadcast swipe to all connected teammates
    broadcastEvent('SWIPE_SUBMITTED', swipe);

    // Database Atomic Consensus Execution (Pillar 1 & Critical Fix 2)
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.rpc('record_vote_and_check_consensus', {
          p_room_id: roomId,
          p_destination_id: String(destinationId),
          p_user_id: currentUser.id,
          p_vote_type: isVeto ? 'VETO' : isLike ? 'LIKE' : 'DISLIKE',
        })
      ).then((res: unknown) => {
        const response = res as { data?: { matched?: boolean; winning_destination_id?: string }; error?: unknown };
        if (!response.error && response.data?.matched && response.data?.winning_destination_id) {
          const allVenues = [...(roomRef.current?.destinations_deck || []), ...CURATED_DESTINATIONS];
          const winningDest = allVenues.find(d => d.id.toString() === response.data?.winning_destination_id || d.google_place_id === response.data?.winning_destination_id);
          if (winningDest && !matchedDestinationRef.current) {
            setMatchedDestination(winningDest);
            setStep('matched');
          }
        }
      }).catch((err: unknown) => {
        console.warn('TripPick: Supabase consensus RPC fallback to local consensus:', err);
      });
    }

    // Infinite Mode Pre-fetch Trigger:
    if (discoveryModeRef.current === 'infinite' && isHostRef.current && !isFetchingMoreRef.current) {
      const currentDeck = roomRef.current?.destinations_deck || [];
      const totalDeck = currentDeck.length;
      if (totalDeck > 0) {
        const userSwipes = [...swipesRef.current, swipe].filter(s => s.user_id === currentUser.id);
        const swipedCountAfter = new Set(userSwipes.map(s => s.destination_id)).size;
        const remainingUnswiped = Math.max(0, totalDeck - swipedCountAfter);

        if (remainingUnswiped <= 3 || swipedCountAfter > totalDeck * 0.5) {
          fetchNextBatch();
        }
      }
    }

    return true;
  }, [roomId, currentUser, broadcastEvent, fetchNextBatch]);


  // Send Broadcast Emoji Reaction
  const sendBroadcastEmoji = useCallback((emoji: string) => {
    const payload = {
      id: 'emoji_' + Math.random().toString(36).substring(2, 9),
      emoji
    };
    setReceivedEmojis(prev => [...prev, payload]);
    broadcastEvent('BROADCAST_EMOJI', payload);
    setTimeout(() => {
      setReceivedEmojis(prev => prev.filter(e => e.id !== payload.id));
    }, 3000);
  }, [broadcastEvent]);

  // Send Chat Message
  const sendChatMessage = useCallback(async (text: string) => {
    if (!roomId || !currentUser || !text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      room_id: roomId,
      sender_name: currentUser.user_name,
      message_text: text.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    broadcastEvent('CHAT_MESSAGE', newMsg);
  }, [roomId, currentUser, broadcastEvent]);

  // Reset Session back to lobby for another round
  const resetRoomSession = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    setSwipes([]);
    setMatchedDestination(null);
    setStep('lobby');
    setDeckBatchVersion(1);
    deckBatchVersionRef.current = 1;
    lastFetchedBatchVersionRef.current = 1;
    setRoom(prev => prev ? { ...prev, status: 'waiting', destinations_deck: null, deck_batch_version: 1 } : null);

    broadcastEvent('SESSION_RESET', {
      roomId,
      hostId: currentUserRef.current?.id,
      timestamp: Date.now()
    });
    return true;
  }, [roomId, broadcastEvent]);

  // Manually or dynamically select winner / top recommendation
  const selectDestination = useCallback((destination: TravelDestination) => {
    setMatchedDestination(destination);
    setStep('matched');
    broadcastEvent('MATCH_FOUND', {
      destination,
      hostId: currentUserRef.current?.id,
      timestamp: Date.now()
    });
  }, [broadcastEvent]);

  // Confirm Corporate Deposit Escrow & Broadcast across all devices
  const confirmDepositEscrow = useCallback((
    receiptNo: string,
    taxId: string,
    amount: number = 5000,
    companyName: string = 'บริษัท บีทูบี เทคเวนเจอร์ จำกัด'
  ) => {
    const paidAt = new Date().toISOString();
    const receipt: DepositReceipt = { receiptNo, amount, paidAt, taxId };
    setDepositStatus('SECURED_ESCROW');
    setDepositReceipt(receipt);

    // 1. Authoritative EscrowBroadcastPayload per Requirement 3
    const escrowPayload: EscrowBroadcastPayload = {
      type: 'ESCROW_LOCKED',
      roomId: roomId || 'TRIP',
      depositId: receiptNo,
      companyName,
      amount,
      timestamp: Date.now(),
    };

    broadcastEvent('ESCROW_LOCKED', escrowPayload);

    // 2. Legacy event for backward compatibility
    const legacyPayload = {
      roomId: roomId || 'TRIP',
      deposit_status: 'SECURED_ESCROW',
      receipt_no: receiptNo,
      amount,
      paidAt,
      companyTaxId: taxId,
      companyName,
    };
    broadcastEvent('DEPOSIT_COMPLETED', legacyPayload);

    setEscrowNotification('🎉 บริษัทวางมัดจำล็อกสถานที่เรียบร้อยแล้ว');
    setTimeout(() => {
      setEscrowNotification(prev => prev === '🎉 บริษัทวางมัดจำล็อกสถานที่เรียบร้อยแล้ว' ? null : prev);
    }, 5000);
  }, [roomId, broadcastEvent]);

  // Host Instant Consensus Trigger (for large rooms up to 20 pax)
  const callEarlyConsensus = useCallback(() => {
    if (!roomRef.current?.destinations_deck || matchedDestinationRef.current) return;
    const deck = roomRef.current.destinations_deck;
    const nonVetoed = deck.filter(dest => !swipesRef.current.some(s => s.destination_id === dest.id && s.is_veto));
    if (nonVetoed.length === 0) return;

    const scored = nonVetoed.map(dest => ({
      dest,
      likes: swipesRef.current.filter(s => s.destination_id === dest.id && s.is_like).length
    }));
    scored.sort((a, b) => b.likes - a.likes);
    const winner = scored[0].dest;

    setMatchedDestination(winner);
    setStep('matched');
    broadcastEvent('MATCH_FOUND', {
      destination: winner,
      hostId: currentUserRef.current?.id,
      timestamp: Date.now()
    });
  }, [broadcastEvent]);

  // Add realistic corporate teammates up to 20 pax for demos and stress-testing
  const simulateTeammates = useCallback((targetCount: number = 20) => {
    if (!roomId) return;
    const currentList = usersRef.current;
    const currentCount = currentList.length;
    if (currentCount >= targetCount) return;

    const mockCorporateRoster = [
      { name: 'Sarah Chen', role: 'Head of People & Culture' },
      { name: 'Alex Thompson', role: 'VP Engineering' },
      { name: 'Pitchakorn P.', role: 'Chief Product Officer' },
      { name: 'David Reynolds', role: 'Director of Finance' },
      { name: 'Nattaya Siri', role: 'Lead DevOps & Cloud' },
      { name: 'Somchai T.', role: 'Senior UX Architect' },
      { name: 'Elena Rostova', role: 'Head of Growth' },
      { name: 'Marcus Vance', role: 'Security & Compliance Lead' },
      { name: 'Ploy Pailin', role: 'Executive Assistant to CEO' },
      { name: 'Kenji Sato', role: 'Head of Mobile' },
      { name: 'Apinya Wong', role: 'Principal AI Researcher' },
      { name: 'Lucas Meyer', role: 'Strategic Partnerships Director' },
      { name: 'Kornkanok M.', role: 'Creative Director' },
      { name: 'Anan Prasert', role: 'Procurement Specialist' },
      { name: 'Liam O’Connor', role: 'Enterprise Account Executive' },
      { name: 'Siriporn K.', role: 'Operations & Logistics Manager' },
      { name: 'Thanakorn B.', role: 'Staff Infrastructure Engineer' },
      { name: 'Chloe Dubois', role: 'Design Systems Lead' },
      { name: 'Worawan S.', role: 'General Counsel & Legal' },
      { name: 'Phurinat C.', role: 'Data Analytics Lead' },
    ];

    const needed = targetCount - currentCount;
    const existingNames = new Set(currentList.map(u => u.user_name));
    const available = mockCorporateRoster.filter(m => !existingNames.has(m.name));

    const newSimUsers: RoomUser[] = [];
    for (let i = 0; i < needed && i < available.length; i++) {
      const preset = available[i];
      const simUser: RoomUser = {
        id: `sim_${Date.now()}_${i}`,
        room_id: roomId,
        user_name: preset.name,
        role: preset.role,
        preferred_amenities: ['wifi', 'boardroom'],
        joinedAt: Date.now() + i * 10,
        lastHeartbeat: Date.now(),
        isHost: false,
        isSimulated: true,
      };
      newSimUsers.push(simUser);
    }

    if (newSimUsers.length > 0) {
      setUsers(prev => [...prev, ...newSimUsers]);
      newSimUsers.forEach(u => {
        broadcastEvent('USER_JOINED', u);
      });
    }
  }, [roomId, broadcastEvent]);

  // Remove simulated demo teammates
  const removeSimulatedTeammates = useCallback(() => {
    setUsers(prev => prev.filter(u => !u.isSimulated || u.id === currentUserRef.current?.id));
  }, []);

  return {
    roomId,
    step,
    room,
    users,
    currentUser,
    isHost,
    depositStatus,
    depositReceipt,
    confirmDepositEscrow,
    escrowNotification,
    clearEscrowNotification: () => setEscrowNotification(null),
    loading,
    compilingDeck,
    destinationsDeck: room?.destinations_deck || [],
    unswipedDestinations,
    isWaitingForOthers,
    allActiveUsersFinished,
    peersStillSwiping,
    matchedDestination,
    messages,
    swipes,
    error,
    receivedEmojis,
    roomContextRef,
    syncStatus: "ระบบซิงค์อัตโนมัติ (Zero-Latency Realtime)",
    sendBroadcastEmoji,
    createRoom,
    joinRoom,
    submitProfile,
    startSession,
    submitSwipe,
    sendChatMessage,
    leaveRoom,
    reenterSession,
    resetRoomSession,
    selectDestination,
    discoveryMode,
    deckBatchVersion,
    isFetchingMore,
    discoveryStatus,
    fetchNextBatch,
    simulateTeammates,
    removeSimulatedTeammates,
    callEarlyConsensus,
  };
}