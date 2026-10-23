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
      {/* Ambient Radial Gradient Mesh Lighting (Catppuccin Mocha Ethereal Glass) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="glow-orb w-[540px] h-[540px] -top-36 -left-36 bg-[#cba6f7]/12" />
        <div className="glow-orb w-[680px] h-[680px] -bottom-48 -right-48 bg-[#74c7ec]/10" />
        <div className="glow-orb w-[420px] h-[420px] top-1/3 right-1/4 bg-[#b4befe]/[0.06]" />
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-noise z-10 opacity-35" />

      {/* Fluid Island Floating Nav (Catppuccin Mocha Detached Glass Pill) */}
      <header className="relative z-30 pt-4 sm:pt-6 px-4 flex justify-center w-full">
        <div className="w-full max-w-4xl flex items-center justify-between p-1.5 rounded-full bg-[#181825]/80 ring-1 ring-[#cba6f7]/20 border border-[#313244]/60 backdrop-blur-2xl shadow-[0_10px_35px_rgba(17,17,27,0.7)]">
          {/* Brand Monogram & Subtitle */}
          <div className="flex items-center gap-3 pl-3 pr-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-[#cba6f7] font-bold text-xs tracking-wider">
              <span>TP</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#cdd6f4] flex items-center gap-1.5">
                TripPick
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#cba6f7]/15 text-[#cba6f7] font-semibold border border-[#cba6f7]/25 hidden sm:inline-block">
                  Mocha Edition
                </span>
              </span>
            </div>
          </div>

          {/* Center: Live Room Badge (if active) */}
          {roomId && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e1e2e]/90 border border-[#45475a]/70 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#a6adc8] font-mono">ห้อง:</span>
              <span className="font-mono font-bold text-[#cba6f7] tracking-wider tabular-data">{roomId}</span>
              {isHost && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-[#cba6f7]/25 text-[#cba6f7] font-medium ml-1">
                  Host
                </span>
              )}
            </div>
          )}

          {/* Right Action Pills: Concierge & Business Model */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Business Model Pill */}
            <button
              onClick={() => setIsBusinessModalOpen(true)}
              className="group flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#1e1e2e]/80 hover:bg-[#313244] border border-[#45475a]/60 hover:border-[#cba6f7]/40 text-xs font-medium text-[#bac2de] hover:text-[#cdd6f4] transition-all duration-300 ease-spring cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] group-hover:scale-125 transition-transform duration-300" />
              <span className="hidden sm:inline">แผนธุรกิจ</span>
              <span className="text-[10px] uppercase font-mono text-[#a6e3a1] font-semibold tracking-wider">
                Make Me Money
              </span>
            </button>

            {/* AI Concierge Pill */}
            <button
              onClick={() => setIsConciergeOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#cba6f7]/20 to-[#b4befe]/20 hover:from-[#cba6f7]/30 hover:to-[#b4befe]/30 border border-[#cba6f7]/40 text-xs font-semibold text-[#cba6f7] transition-all duration-300 ease-spring cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(203,166,247,0.2)]"
            >
              <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
              <span>AI Concierge</span>
            </button>
          </div>
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
