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
import { RevenueMetricsHUD } from './components/RevenueMetricsHUD';
import { ProcurementModal } from './components/ProcurementModal';
import { useLanguage } from './lib/i18n';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const {
    roomId,
    step,
    room,
    users,
    currentUser,
    isHost,
    loading,
    destinationsDeck,
    unswipedDestinations,
    isWaitingForOthers,
    peersStillSwiping,
    matchedDestination,
    depositStatus,
    depositReceipt,
    confirmDepositEscrow,
    escrowNotification,
    clearEscrowNotification,
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
    selectDestination,
    discoveryMode,
    isFetchingMore,
    discoveryStatus,
  } = useTripPick();

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);

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
      case 'lobby': {
        const isAuthoritativeHost = Boolean(
          isHost && currentUser?.isHost && (!room?.host_id || room.host_id === currentUser?.id)
        );
        return (
          <WaitingLobbyView
            key="lobby"
            roomId={roomId || ''}
            users={users}
            currentUser={currentUser}
            isHost={isAuthoritativeHost}
            onStartSession={startSession}
            onLeave={leaveRoom}
            loading={loading}
            error={error}
          />
        );
      }
      case 'swiping':
        return (
          <SwiperView
            key="swiping"
            destinationsDeck={destinationsDeck}
            unswipedDestinations={unswipedDestinations}
            isWaitingForOthers={isWaitingForOthers}
            peersStillSwiping={peersStillSwiping}
            onSubmitSwipe={submitSwipe}
            onLeave={leaveRoom}
            roomId={roomId || ''}
            receivedEmojis={receivedEmojis}
            sendBroadcastEmoji={sendBroadcastEmoji}
            isHost={isHost}
            onRestartSession={resetRoomSession}
            onSelectDestination={selectDestination}
            users={users}
            swipes={swipes}
            discoveryMode={discoveryMode}
            isFetchingMore={isFetchingMore}
            discoveryStatus={discoveryStatus}
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
            roomId={roomId || ''}
            depositStatus={depositStatus}
            depositReceipt={depositReceipt}
            onConfirmDeposit={confirmDepositEscrow}
            onOpenProcurement={() => setIsProcurementOpen(true)}
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

          {/* Center / Right: Language Toggle & Live Room Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher: 🇹🇭 TH | 🇬🇧 EN */}
            <div
              className="flex items-center bg-[#11111b] border border-[#313244] p-0.5 rounded-xl shadow-inner"
              role="group"
              aria-label={t.switchLanguage}
            >
              <button
                type="button"
                data-testid="lang-th-btn"
                onClick={() => setLanguage('th')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'th'
                    ? 'bg-[#cba6f7] text-[#11111b] shadow-sm'
                    : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                }`}
                title="เปลี่ยนเป็นภาษาไทย"
              >
                🇹🇭 TH
              </button>
              <button
                type="button"
                data-testid="lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#cba6f7] text-[#11111b] shadow-sm'
                    : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
            </div>

            {roomId ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#a6adc8] font-mono">{t.roomLabel}</span>
                <span className="font-mono font-bold text-[#cba6f7] tracking-wider tabular-data">{roomId}</span>
                {Boolean(isHost && currentUser?.isHost && (!room?.host_id || room.host_id === currentUser?.id)) && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#cba6f7]/20 text-[#cba6f7] font-medium ml-1">
                    {t.hostBadge}
                  </span>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1e2e] border border-[#313244] text-[10px] font-mono text-[#a6adc8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                <span>{t.b2bConsensus}</span>
              </div>
            )}
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

      {/* Live Pitch Revenue HUD Widget (B2B Take-Rate & Escrow Proof) */}
      <RevenueMetricsHUD
        matchedDestination={matchedDestination}
        step={step}
        usersCount={users.length}
        depositStatus={depositStatus}
        depositReceipt={depositReceipt}
        onOpenProcurement={() => setIsProcurementOpen(true)}
      />

      {/* Enterprise Procurement & Escrow Modal */}
      <ProcurementModal
        isOpen={isProcurementOpen}
        onClose={() => setIsProcurementOpen(false)}
        matchedDestination={matchedDestination}
        users={users}
        roomId={roomId || 'TRIP'}
        depositStatus={depositStatus}
        depositReceipt={depositReceipt}
        onConfirmDeposit={confirmDepositEscrow}
      />

      {/* Real-Time Peer Sync Notification Toast */}
      <AnimatePresence>
        {escrowNotification && (
          <div className="fixed top-16 sm:top-20 inset-x-4 max-w-md mx-auto z-50 p-3 rounded-xl bg-[#181825] border border-[#a6e3a1] shadow-2xl text-center flex items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2 text-xs font-bold text-[#a6e3a1]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1] animate-ping" />
              <span>{escrowNotification}</span>
            </div>
            <button
              onClick={clearEscrowNotification}
              className="text-[#a6adc8] hover:text-[#cdd6f4] text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
