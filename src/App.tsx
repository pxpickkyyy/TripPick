import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTripPick } from './hooks/useTripPick';
import { LandingView } from './components/LandingView';
import { ProfileSelectorView } from './components/ProfileSelectorView';
import { WaitingLobbyView } from './components/WaitingLobbyView';
import { SwiperView } from './components/SwiperView';
import { MatchOverlayView } from './components/MatchOverlayView';
import { ConciergeDrawer } from './components/ConciergeDrawer';
import { BusinessModelModal } from './components/BusinessModelModal';

function App() {
  const {
    roomId,
    step,
    users,
    currentUser,
    isHost,
    loading,
    destinationsDeck,
    unswipedDestinations,
    isWaitingForOthers,
    matchedDestination,
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
    leaveRoom,
    reenterSession,
    resetRoomSession,
  } = useTripPick();

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // Auto-join from URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.length === 4) {
      const targetRoom = roomParam.toUpperCase();
      if (roomId !== targetRoom) {
        joinRoom(targetRoom);
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [joinRoom, roomId]);

  const renderView = () => {
    switch (step) {
      case 'landing':
        return (
          <LandingView
            key="landing"
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onReenterSession={reenterSession}
            loading={loading}
            error={error}
            onOpenBusinessModel={() => setIsBusinessModalOpen(true)}
          />
        );
      case 'profile':
        return (
          <ProfileSelectorView
            key="profile"
            onSubmit={submitProfile}
            onBack={leaveRoom}
            loading={loading}
            error={error}
          />
        );
      case 'lobby':
        return (
          <WaitingLobbyView
            key="lobby"
            roomId={roomId || ''}
            users={users}
            currentUser={currentUser}
            isHost={isHost}
            onStartSession={startSession}
            onLeave={leaveRoom}
            loading={loading}
            error={error}
          />
        );
      case 'swiping':
        return (
          <SwiperView
            key="swiping"
            destinationsDeck={destinationsDeck}
            unswipedDestinations={unswipedDestinations}
            isWaitingForOthers={isWaitingForOthers}
            onSubmitSwipe={submitSwipe}
            onLeave={leaveRoom}
            roomId={roomId || ''}
            receivedEmojis={receivedEmojis}
            sendBroadcastEmoji={sendBroadcastEmoji}
            isHost={isHost}
            onRestartSession={resetRoomSession}
          />
        );
      case 'matched':
        return (
          <MatchOverlayView
            key="matched"
            matchedDestination={matchedDestination}
            users={users}
            onReset={leaveRoom}
            swipes={swipes}
            destinationsDeck={destinationsDeck}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-dvh w-full flex flex-col bg-[#0b0e14] text-slate-100 antialiased">
      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      {/* AI Concierge Drawer (Available across all views) */}
      <ConciergeDrawer
        roomContext={roomContextRef}
        isOpen={isConciergeOpen}
        onToggle={() => setIsConciergeOpen((prev) => !prev)}
      />

      {/* Business Model / Pitch Dossier Modal */}
      <BusinessModelModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />
    </div>
  );
}

export default App;
