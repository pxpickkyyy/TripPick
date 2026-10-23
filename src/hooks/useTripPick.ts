import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAiRecommendations, fetchAiCommentary } from '../lib/ai';
import type { RoomContextInfo } from '../lib/ai';
import type { TravelDestination } from '../lib/travelDestinations';

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

  // Cross-tab broadcast channel for local multi-user testing
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

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

  // Setup BroadcastChannel for zero-config multi-tab synchronization
  useEffect(() => {
    if (!roomId) return;

    const channelName = `trippick_room_${roomId}`;
    const channel = new BroadcastChannel(channelName);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'USER_JOINED') {
        setUsers(prev => {
          if (prev.some(u => u.id === payload.id)) return prev;
          return [...prev, payload];
        });
      } else if (type === 'SESSION_STARTED') {
        setRoom(payload.room);
        setStep('swiping');
        setCompilingDeck(false);
      } else if (type === 'SWIPE_SUBMITTED') {
        setSwipes(prev => {
          if (prev.some(s => s.id === payload.id)) return prev;
          return [...prev, payload];
        });
      } else if (type === 'MATCH_FOUND') {
        setMatchedDestination(payload.destination);
        setStep('matched');
      } else if (type === 'CHAT_MESSAGE') {
        setMessages(prev => [...prev, payload]);
      } else if (type === 'BROADCAST_EMOJI') {
        setReceivedEmojis(prev => [...prev, payload]);
        setTimeout(() => {
          setReceivedEmojis(prev => prev.filter(e => e.id !== payload.id));
        }, 3000);
      } else if (type === 'REQUEST_ROOM_STATE' && isHost) {
        // Host broadcasts current state to newly joined tabs
        channel.postMessage({
          type: 'SYNC_ROOM_STATE',
          payload: { room, users, swipes, matchedDestination }
        });
      } else if (type === 'SYNC_ROOM_STATE') {
        if (payload.room) setRoom(payload.room);
        if (payload.users) setUsers(payload.users);
        if (payload.swipes) setSwipes(payload.swipes);
        if (payload.matchedDestination) {
          setMatchedDestination(payload.matchedDestination);
          setStep('matched');
        }
      }
    };

    // Request state from existing host tab
    channel.postMessage({ type: 'REQUEST_ROOM_STATE' });

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [roomId, isHost, room, users, swipes, matchedDestination]);

  // Check for Consensus Match whenever swipes or users update
  useEffect(() => {
    if (step !== 'swiping' || !room?.destinations_deck || matchedDestination) return;

    const deck = room.destinations_deck;
    const activeUsers = users;
    // Consensus requirement: at least 2 users like the same destination (or 1 if solo testing)
    const requiredLikes = Math.max(1, Math.min(2, activeUsers.length));

    for (const destination of deck) {
      const likesForDest = swipes.filter(s => s.destination_id === destination.id && s.is_like);
      const isVetoed = swipes.some(s => s.destination_id === destination.id && s.is_veto);

      if (!isVetoed && likesForDest.length >= requiredLikes) {
        setMatchedDestination(destination);
        setStep('matched');

        // Broadcast match to all tabs
        broadcastChannelRef.current?.postMessage({
          type: 'MATCH_FOUND',
          payload: { destination }
        });
        break;
      }
    }
  }, [swipes, users, room, step, matchedDestination]);

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
      const code = Math.random().toString(36).substring(2, 6).toUpperCase(); // e.g. "TRIP"
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
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
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
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถเข้าร่วมห้องได้ กรุณาตรวจสอบรหัสห้อง');
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
      setUsers(prev => {
        if (prev.some(u => u.id === user.id)) return prev;
        return [...prev, user];
      });

      localStorage.setItem('trippick_user_id', user.id);

      // Broadcast join to other tabs
      broadcastChannelRef.current?.postMessage({
        type: 'USER_JOINED',
        payload: user
      });

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

      setStep('lobby');
      return true;
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถลงทะเบียนข้อมูลได้');
      return false;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Start Session (Host compiles retreat deck)
  const startSession = useCallback(async (
    vibe: string,
    minBudget?: number,
    maxBudget?: number,
    _categoryFilter?: string
  ): Promise<boolean> => {
    if (!roomId) return false;
    setCompilingDeck(true);
    setLoading(true);

    try {
      // Gather team amenity preferences
      const allSelectedAmenities = Array.from(
        new Set(users.flatMap(u => u.preferred_amenities))
      );

      const deck = await fetchAiRecommendations(
        allSelectedAmenities,
        vibe,
        minBudget,
        maxBudget
      );

      const updatedRoom: Room = {
        id: roomId,
        created_at: room?.created_at || new Date().toISOString(),
        status: 'swiping',
        destinations_deck: deck,
        vibe,
      };

      setRoom(updatedRoom);
      setStep('swiping');

      // Broadcast session start to all tabs
      broadcastChannelRef.current?.postMessage({
        type: 'SESSION_STARTED',
        payload: { room: updatedRoom }
      });

      return true;
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถสร้างชุดสถานที่จัดทริปได้');
      return false;
    } finally {
      setCompilingDeck(false);
      setLoading(false);
    }
  }, [roomId, room, users]);

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

    // Broadcast swipe to other tabs
    broadcastChannelRef.current?.postMessage({
      type: 'SWIPE_SUBMITTED',
      payload: swipe
    });

    return true;
  }, [roomId, currentUser]);

  // Send Broadcast Emoji Reaction
  const sendBroadcastEmoji = useCallback((emoji: string) => {
    const payload = {
      id: 'emoji_' + Math.random().toString(36).substring(2, 9),
      emoji
    };
    setReceivedEmojis(prev => [...prev, payload]);
    broadcastChannelRef.current?.postMessage({
      type: 'BROADCAST_EMOJI',
      payload
    });
    setTimeout(() => {
      setReceivedEmojis(prev => prev.filter(e => e.id !== payload.id));
    }, 3000);
  }, []);

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
    broadcastChannelRef.current?.postMessage({
      type: 'CHAT_MESSAGE',
      payload: newMsg
    });
  }, [roomId, currentUser]);

  // Reset Session
  const resetRoomSession = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    setSwipes([]);
    setMatchedDestination(null);
    setStep('lobby');
    broadcastChannelRef.current?.postMessage({
      type: 'REQUEST_ROOM_STATE'
    });
    return true;
  }, [roomId]);

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
