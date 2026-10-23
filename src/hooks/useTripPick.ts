import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAiRecommendations, fetchAiCommentary } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';
import type { TravelDestination } from '../lib/travelDestinations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { EscrowBroadcastPayload } from '../types/procurement';

export interface Room {
  id: string;
  created_at: string;
  status: 'waiting' | 'swiping' | 'matched';
  destinations_deck: TravelDestination[] | null;
  vibe?: string;
  host_id?: string;
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
}

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

  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { swipesRef.current = swipes; }, [swipes]);
  useEffect(() => { matchedDestinationRef.current = matchedDestination; }, [matchedDestination]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { depositStatusRef.current = depositStatus; }, [depositStatus]);
  useEffect(() => { depositReceiptRef.current = depositReceipt; }, [depositReceipt]);

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
  }, [roomId, step, room, users, swipes, messages, matchedDestination, currentUser, isHost, depositStatus, depositReceipt]);

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

  const isWaitingForOthers = Boolean(
    currentUser &&
    (room?.destinations_deck?.length ?? 0) > 0 &&
    unswipedDestinations.length === 0 &&
    step === 'swiping' &&
    !matchedDestination
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
        setUsers(prev => prev.map(u => u.id === payload.userId ? {
          ...u,
          lastHeartbeat: Number(payload.timestamp) || Date.now(),
          isHost: typeof payload.isHost === 'boolean' ? payload.isHost : u.isHost
        } : u));
      }
    } else if (type === 'LEADER_PROMOTED') {
      if (payload.newHostId) {
        setUsers(prev => prev.map(u => ({ ...u, isHost: u.id === payload.newHostId })));
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
        };
        setUsers(prev => {
          if (prev.some(u => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });

        // Host Authority: Send authoritative room snapshot to newcomer
        if (isHostRef.current && roomRef.current) {
          broadcastEvent('SYNC_ROOM_STATE', {
            room: roomRef.current,
            users: usersRef.current,
            swipes: swipesRef.current,
            matchedDestination: matchedDestinationRef.current,
            isHostAuthority: true,
            timestamp: Date.now()
          });
        }
      }
    } else if (type === 'SESSION_STARTED') {
      if (payload.room) {
        setRoom(payload.room);
        setStep('swiping');
        setCompilingDeck(false);
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

        if (payload.room.status === 'swiping' && stepRef.current === 'lobby') {
          setStep('swiping');
        }
      }

      if (payload.users && Array.isArray(payload.users)) {
        setUsers(prev => {
          const map = new Map<string, RoomUser>();
          prev.forEach(u => map.set(u.id, u));
          payload.users?.forEach((u: RoomUser) => {
            if (u && u.id) map.set(u.id, u);
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
        .on('broadcast', { event: 'SESSION_STARTED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SESSION_STARTED', payload))
        .on('broadcast', { event: 'SWIPE_SUBMITTED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SWIPE_SUBMITTED', payload))
        .on('broadcast', { event: 'MATCH_FOUND' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('MATCH_FOUND', payload))
        .on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('CHAT_MESSAGE', payload))
        .on('broadcast', { event: 'BROADCAST_EMOJI' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('BROADCAST_EMOJI', payload))
        .on('broadcast', { event: 'REQUEST_ROOM_STATE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('REQUEST_ROOM_STATE', payload))
        .on('broadcast', { event: 'SYNC_ROOM_STATE' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('SYNC_ROOM_STATE', payload))
        .on('broadcast', { event: 'DEPOSIT_COMPLETED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('DEPOSIT_COMPLETED', payload))
        .on('broadcast', { event: 'ESCROW_LOCKED' }, ({ payload }: { payload: unknown }) => handleIncomingEvent('ESCROW_LOCKED', payload))
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
              prev.forEach(u => map.set(u.id, u));
              presenceUsers.forEach(u => map.set(u.id, u));
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
              newUsers.forEach(u => map.set(u.id, u));
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
  }, [roomId, handleIncomingEvent]);

  // Dynamic Host Failover & Resilient Heartbeat Watchdog
  useEffect(() => {
    if (!roomId || step === 'landing' || !currentUser) return;

    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      const currentUsers = usersRef.current;

      // Broadcast heartbeat to all peers
      broadcastEvent('HEARTBEAT', {
        userId: currentUser.id,
        isHost: isHostRef.current,
        timestamp: now
      });

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
            setUsers(prev => prev.map(u => ({ ...u, isHost: u.id === currentUser.id })));

            broadcastEvent('LEADER_PROMOTED', {
              newHostId: currentUser.id,
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
          }
        }
      }
    }, 2500);

    return () => clearInterval(watchdogInterval);
  }, [roomId, step, currentUser, broadcastEvent]);

  // Consensus Calculation supporting 1 to 30+ team members with atomic lock
  useEffect(() => {
    if (step !== 'swiping' || !room?.destinations_deck || matchedDestination) return;

    const deck = room.destinations_deck;
    const activeCount = users.length;

    // Consensus rule:
    // 1 person -> 1 like (solo demo)
    // 2 people -> 2 likes (both must like)
    // 3 to 10+ people -> at least 60% of active teammates must like it
    const requiredLikes = activeCount <= 2
      ? Math.max(1, activeCount)
      : Math.max(2, Math.ceil(activeCount * 0.6));

    for (const destination of deck) {
      const likesForDest = swipes.filter(s => s.destination_id === destination.id && s.is_like);
      const isVetoed = swipes.some(s => s.destination_id === destination.id && s.is_veto);

      if (!isVetoed && likesForDest.length >= requiredLikes) {
        // Atomic guard: Lock local match first
        if (matchedDestinationRef.current) break;

        setMatchedDestination(destination);
        setStep('matched');

        // Broadcast authoritative match to all tabs and connected devices
        broadcastEvent('MATCH_FOUND', {
          destination,
          hostId: currentUserRef.current?.id,
          timestamp: Date.now()
        });
        break;
      }
    }
  }, [swipes, users, room, step, matchedDestination, broadcastEvent]);

  // Clear Session cleanly
  const leaveRoom = useCallback(() => {
    const activeCode = roomId || localStorage.getItem('trippick_room_id');
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
  }, [roomId]);

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
      const user: RoomUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
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

      // 1. Broadcast join to other peers
      broadcastEvent('USER_JOINED', user);

      // 2. Track in Supabase Realtime Presence
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.track({ user });
      }

      // 3. Request current room state from Host
      broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: user.id });

      // Add welcoming chat
      const welcome = await fetchAiCommentary('join', user.user_name);
      const welcomeMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        room_id: roomId,
        sender_name: 'AI ผู้ช่วย TripPick',
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

  // Start Session (Host compiles retreat deck)
  const startSession = useCallback(async (
    vibe: string,
    minBudget?: number,
    maxBudget?: number
  ): Promise<boolean> => {
    if (!roomId) return false;
    setCompilingDeck(true);
    setLoading(true);

    try {
      // Gather team amenity preferences
      const allSelectedAmenities = Array.from(
        new Set(usersRef.current.flatMap(u => u.preferred_amenities))
      );

      const deck = await fetchAiRecommendations(
        allSelectedAmenities,
        vibe,
        minBudget,
        maxBudget
      );

      const updatedRoom: Room = {
        id: roomId,
        created_at: roomRef.current?.created_at || new Date().toISOString(),
        status: 'swiping',
        destinations_deck: deck,
        vibe,
      };

      setRoom(updatedRoom);
      setStep('swiping');

      // Broadcast session start to all connected teammates
      broadcastEvent('SESSION_STARTED', { room: updatedRoom });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถสร้างชุดสถานที่จัดทริปได้';
      setError(message);
      return false;
    } finally {
      setCompilingDeck(false);
      setLoading(false);
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

    return true;
  }, [roomId, currentUser, broadcastEvent]);

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
    broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: currentUser?.id });
    return true;
  }, [roomId, currentUser, broadcastEvent]);

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
  };
}