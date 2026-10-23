import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAiRecommendations, fetchAiCommentary } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';
import type { TravelDestination } from '../lib/travelDestinations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Room {
  id: string;
  created_at: string;
  status: 'waiting' | 'swiping' | 'matched';
  destinations_deck: TravelDestination[] | null;
  vibe?: string;
}

export interface RoomUser {
  id: string;
  room_id: string;
  user_name: string;
  role: string;
  preferred_amenities: string[];
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

export function useTripPick() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [step, setStep] = useState<StepType>('landing');
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matchedDestination, setMatchedDestination] = useState<TravelDestination | null>(null);
  const [currentUser, setCurrentUser] = useState<RoomUser | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [compilingDeck, setCompilingDeck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedEmojis, setReceivedEmojis] = useState<{ id: string; emoji: string }[]>([]);

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

  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { swipesRef.current = swipes; }, [swipes]);
  useEffect(() => { matchedDestinationRef.current = matchedDestination; }, [matchedDestination]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

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

  // Update room context ref
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
    // 1. Local BroadcastChannel
    try {
      broadcastChannelRef.current?.postMessage({ type, payload });
    } catch {
      // Local channel unavailable
    }

    // 2. Supabase Realtime WebSocket broadcast
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

  // Universal Event Handler
  const handleIncomingEvent = useCallback((type: string, payload: any) => {
    if (!type || !payload) return;

    if (type === 'USER_JOINED') {
      if (payload.id) {
        setUsers(prev => {
          if (prev.some(u => u.id === payload.id)) return prev;
          return [...prev, payload];
        });

        // If we are Host, respond with full room state so the newcomer is fully synchronized
        if (isHostRef.current && roomRef.current) {
          broadcastEvent('SYNC_ROOM_STATE', {
            room: roomRef.current,
            users: usersRef.current,
            swipes: swipesRef.current,
            matchedDestination: matchedDestinationRef.current
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
      if (payload.id) {
        setSwipes(prev => {
          if (prev.some(s => s.id === payload.id)) return prev;
          return [...prev, payload];
        });
      }
    } else if (type === 'MATCH_FOUND') {
      if (payload.destination) {
        setMatchedDestination(payload.destination);
        setStep('matched');
      }
    } else if (type === 'CHAT_MESSAGE') {
      if (payload.id) {
        setMessages(prev => [...prev, payload]);
      }
    } else if (type === 'BROADCAST_EMOJI') {
      if (payload.id) {
        setReceivedEmojis(prev => [...prev, payload]);
        setTimeout(() => {
          setReceivedEmojis(prev => prev.filter(e => e.id !== payload.id));
        }, 3000);
      }
    } else if (type === 'REQUEST_ROOM_STATE') {
      // Send current state to requesting peer
      if (isHostRef.current || roomRef.current) {
        broadcastEvent('SYNC_ROOM_STATE', {
          room: roomRef.current,
          users: usersRef.current,
          swipes: swipesRef.current,
          matchedDestination: matchedDestinationRef.current
        });
      }
    } else if (type === 'SYNC_ROOM_STATE') {
      if (payload.room) {
        setRoom(payload.room);
        if (payload.room.status === 'swiping' && step === 'lobby') {
          setStep('swiping');
        }
      }
      if (payload.users && Array.isArray(payload.users)) {
        setUsers(prev => {
          const map = new Map<string, RoomUser>();
          prev.forEach(u => map.set(u.id, u));
          payload.users.forEach((u: RoomUser) => {
            if (u && u.id) map.set(u.id, u);
          });
          return Array.from(map.values());
        });
      }
      if (payload.swipes && Array.isArray(payload.swipes)) {
        setSwipes(prev => {
          const map = new Map<string, Swipe>();
          prev.forEach(s => map.set(s.id, s));
          payload.swipes.forEach((s: Swipe) => {
            if (s && s.id) map.set(s.id, s);
          });
          return Array.from(map.values());
        });
      }
      if (payload.matchedDestination) {
        setMatchedDestination(payload.matchedDestination);
        setStep('matched');
      }
    }
  }, [broadcastEvent, step]);

  // Connect Realtime Synchronization (BroadcastChannel + Supabase WebSockets)
  useEffect(() => {
    if (!roomId) return;

    // 1. Local BroadcastChannel
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
        .on('broadcast', { event: 'USER_JOINED' }, ({ payload }: any) => handleIncomingEvent('USER_JOINED', payload))
        .on('broadcast', { event: 'SESSION_STARTED' }, ({ payload }: any) => handleIncomingEvent('SESSION_STARTED', payload))
        .on('broadcast', { event: 'SWIPE_SUBMITTED' }, ({ payload }: any) => handleIncomingEvent('SWIPE_SUBMITTED', payload))
        .on('broadcast', { event: 'MATCH_FOUND' }, ({ payload }: any) => handleIncomingEvent('MATCH_FOUND', payload))
        .on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }: any) => handleIncomingEvent('CHAT_MESSAGE', payload))
        .on('broadcast', { event: 'BROADCAST_EMOJI' }, ({ payload }: any) => handleIncomingEvent('BROADCAST_EMOJI', payload))
        .on('broadcast', { event: 'REQUEST_ROOM_STATE' }, ({ payload }: any) => handleIncomingEvent('REQUEST_ROOM_STATE', payload))
        .on('broadcast', { event: 'SYNC_ROOM_STATE' }, ({ payload }: any) => handleIncomingEvent('SYNC_ROOM_STATE', payload))
        .on('presence', { event: 'sync' }, () => {
          const state = activeChannel.presenceState();
          const presenceUsers: RoomUser[] = [];
          Object.values(state).forEach((items: any) => {
            items.forEach((item: any) => {
              if (item.user && item.user.id) {
                presenceUsers.push(item.user);
              }
            });
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
        .on('presence', { event: 'join' }, ({ newPresences }: any) => {
          const newUsers: RoomUser[] = [];
          newPresences.forEach((p: any) => {
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

    // Request state from existing host tab
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

  // Periodic resync check while in lobby to ensure all 10+ members stay in sync
  useEffect(() => {
    if (!roomId || step !== 'lobby') return;

    const interval = setInterval(() => {
      broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: currentUserRef.current?.id });
    }, 4000);

    return () => clearInterval(interval);
  }, [roomId, step, broadcastEvent]);

  // Consensus Calculation supporting 2 to 10+ people
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
        setMatchedDestination(destination);
        setStep('matched');

        // Broadcast match to all tabs and connected devices
        broadcastEvent('MATCH_FOUND', { destination });
        break;
      }
    }
  }, [swipes, users, room, step, matchedDestination, broadcastEvent]);

  // Clear Session
  const leaveRoom = useCallback(() => {
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
    setCompilingDeck(false);
    setStep('landing');
    setError(null);
  }, []);

  // Re-enter Session
  const reenterSession = useCallback(async (): Promise<boolean> => {
    const cachedRoomId = localStorage.getItem('trippick_room_id');
    if (!cachedRoomId) return false;
    setRoomId(cachedRoomId);
    setStep('lobby');
    return true;
  }, []);

  // Create Room
  const createRoom = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase(); // e.g. "30J8"
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
      setCurrentUser(null);
      localStorage.setItem('trippick_room_id', code);
      localStorage.setItem('trippick_is_host', 'true');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join Room
  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 4) {
      setError('รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดีครับ');
      setLoading(false);
      return false;
    }

    try {
      setRoomId(normalized);
      setIsHost(false);
      setStep('profile');
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
      const user: RoomUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        room_id: roomId,
        user_name: name.trim(),
        role: role || 'Team Member',
        preferred_amenities: preferredAmenities,
      };

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

      // 3. Request current room state so guest receives the room info
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

  // Reset Session
  const resetRoomSession = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    setSwipes([]);
    setMatchedDestination(null);
    setStep('lobby');
    broadcastEvent('REQUEST_ROOM_STATE', { fromUserId: currentUser?.id });
    return true;
  }, [roomId, currentUser, broadcastEvent]);

  return {
    roomId,
    step,
    room,
    users,
    currentUser,
    isHost,
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
