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
    <div className="relative min-h-dvh w-full flex flex-col bg-[#11111b] text-[#cdd6f4] antialiased selection:bg-[#cba6f7]/30 selection:text-[#cba6f7] overflow-x-hidden">
      {/* Fluid Island Floating Nav (Minimalist & Low-End Optimized) */}
      <header className="relative z-30 pt-3 sm:pt-5 px-3 sm:px-4 flex justify-center w-full">
        <div className="w-full max-w-4xl flex items-center justify-between p-1.5 px-3 rounded-2xl bg-[#181825] border border-[#313244] shadow-sm">
          {/* Brand Monogram */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-[#cba6f7] font-bold text-xs tracking-wider">
              <span>TP</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#a6e3a1]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#cdd6f4]">
              TripPick
            </span>
          </div>

          {/* Center / Right: Live Room Badge or Status */}
          {roomId ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#a6adc8] font-mono">ห้อง:</span>
              <span className="font-mono font-bold text-[#cba6f7] tracking-wider tabular-data">{roomId}</span>
              {isHost && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#cba6f7]/20 text-[#cba6f7] font-medium ml-1">
                  Host
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#1e1e2e] border border-[#313244] text-[10px] font-mono text-[#a6adc8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
              <span>B2B CONSENSUS</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex flex-col justify-center relative z-20">
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
