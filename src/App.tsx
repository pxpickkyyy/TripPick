import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
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
import {
  ParticleGravityField,
  type ParticleFieldTelemetry,
} from './components/ParticleGravityField';
import { useLanguage } from './lib/i18n';

const NAV_SPRING = {
  mass: 0.8,
  stiffness: 280,
  damping: 24,
} as const;

const STEP_EDITORIAL_LABELS: Record<string, string> = {
  landing: 'Curated Retreats · SOTD',
  profile: '01 · Executive Profile',
  lobby: '02 · Quorum Lounge',
  swiping: '03 · Venue Curation',
  matched: '04 · Consensus & RFP',
};

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

  const [telemetry, setTelemetry] = useState<ParticleFieldTelemetry>({
    fps: 60,
    particleCount: 48,
    cursorX: 640,
    cursorY: 400,
    cursorZ: 0.85,
    lowPowerMode: false,
    latencyMs: 11.4,
    gpuThroughputGbps: 14.8,
  });

  const handleTelemetryUpdate = useCallback((next: ParticleFieldTelemetry) => {
    setTelemetry(next);
  }, []);

  const navMagBtnRef = useRef<HTMLButtonElement | null>(null);
  const navMagX = useMotionValue(0);
  const navMagY = useMotionValue(0);
  const springNavMagX = useSpring(navMagX, NAV_SPRING);
  const springNavMagY = useSpring(navMagY, NAV_SPRING);

  const handleNavMagneticMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = navMagBtnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    navMagX.set(Math.max(-12, Math.min(12, (e.clientX - cx) * 0.25)));
    navMagY.set(Math.max(-12, Math.min(12, (e.clientY - cy) * 0.3)));
  };

  const handleNavMagneticLeave = () => {
    navMagX.set(0);
    navMagY.set(0);
  };

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
            telemetry={telemetry}
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
    <div className="relative min-h-dvh w-full flex flex-col bg-[#1e1e2e] text-[#cdd6f4] antialiased selection:bg-[#cba6f7]/25 selection:text-[#cdd6f4] overflow-x-hidden">
      {/* Global Catppuccin Mocha Ambient Dust Field */}
      <ParticleGravityField
        repelRadius={135}
        repelStrength={0.85}
        onTelemetryUpdate={handleTelemetryUpdate}
      />
      <div className="pointer-events-none fixed top-16 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#cba6f7]/[0.07] blur-[140px] z-0 no-print" />
      <div className="pointer-events-none fixed top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#b4befe]/[0.06] blur-[140px] z-0 no-print" />

      {/* Awwwards-Tier Floating Island Navigation Bar (Catppuccin Mocha Double-Bezel) */}
      <header className="sticky top-0 z-30 pt-3.5 sm:pt-5 px-3 sm:px-6 flex justify-center w-full pointer-events-none no-print">
        <div className="pointer-events-auto w-full max-w-6xl p-1 rounded-full bg-[#181825]/85 backdrop-blur-2xl border border-[#313244]/90 shadow-[0_20px_50px_rgba(17,17,27,0.65)]">
          <div className="w-full flex items-center justify-between py-1.5 px-3.5 sm:px-5 rounded-full bg-[#1e1e2e]/90 border border-[#cdd6f4]/[0.06]">
            {/* Left: Editorial Brand Monogram & Curated Stage Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#313244] border border-[#45475a] text-[#f5e0dc] font-display font-bold text-xs tracking-tight">
                <span>TP</span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#a6e3a1] ring-2 ring-[#1e1e2e]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-sm sm:text-base font-extrabold tracking-[-0.03em] text-[#cdd6f4]">
                  TripPick
                </span>
                <span className="hidden lg:inline font-editorial italic text-sm text-[#a6adc8]">
                  Retreat Studio
                </span>
              </div>
              <span
                data-testid="nav-route-stage-pill"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#181825] border border-[#313244] text-[11px] font-medium text-[#bac2de]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7]" />
                <span>{STEP_EDITORIAL_LABELS[step] || 'Curated Edition'}</span>
              </span>
            </div>

            {/* Right: Bilingual Switcher & Magnetic Action / Room Code Pill */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="flex items-center bg-[#181825] border border-[#313244] p-0.5 rounded-full"
                role="group"
                aria-label={t.switchLanguage}
              >
                <button
                  type="button"
                  data-testid="lang-th-btn"
                  onClick={() => setLanguage('th')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                    language === 'th'
                      ? 'bg-[#cba6f7] text-[#11111b]'
                      : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                  }`}
                  title="เปลี่ยนเป็นภาษาไทย"
                >
                  TH · ไทย
                </button>
                <button
                  type="button"
                  data-testid="lang-en-btn"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#cba6f7] text-[#11111b]'
                      : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
              </div>

              {roomId ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#181825] border border-[#313244] text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-[#a6adc8] font-medium">
                    {t.roomLabel}
                  </span>
                  <span className="font-mono font-bold text-[#cba6f7] tracking-wider tabular-data">
                    {roomId}
                  </span>
                  {Boolean(
                    isHost &&
                      currentUser?.isHost &&
                      (!room?.host_id || room.host_id === currentUser?.id)
                  ) && (
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/40 text-[#cba6f7] font-mono font-semibold ml-0.5">
                      {t.hostBadge}
                    </span>
                  )}
                </div>
              ) : (
                <motion.button
                  ref={navMagBtnRef}
                  type="button"
                  data-testid="nav-magnetic-cta"
                  onPointerMove={handleNavMagneticMove}
                  onPointerLeave={handleNavMagneticLeave}
                  onClick={() => createRoom()}
                  disabled={loading}
                  style={{ x: springNavMagX, y: springNavMagY }}
                  whileTap={{ scale: 0.97 }}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#313244]/80 hover:bg-[#cba6f7] border border-[#45475a] hover:border-[#cba6f7] text-xs font-semibold text-[#cdd6f4] hover:text-[#11111b] transition-colors duration-300 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                  <span>{t.b2bConsensus}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

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
          <div className="fixed top-16 sm:top-20 inset-x-4 max-w-md mx-auto z-[80] p-3.5 rounded-2xl bg-[#181825]/95 backdrop-blur-2xl border border-[#a6e3a1] shadow-[0_20px_50px_rgba(17,17,27,0.85)] text-center flex items-center justify-between gap-2 no-print">
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
