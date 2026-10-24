import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser, Swipe } from '../hooks/useTripPick';
import { playJackboxHostAnnouncement, generateJackboxAnnouncerScript } from '../lib/audioConcierge';
import { useLanguage } from '../lib/i18n';

interface SwiperViewProps {
  destinationsDeck: TravelDestination[];
  unswipedDestinations: TravelDestination[];
  isWaitingForOthers: boolean;
  onSubmitSwipe: (destinationId: number, isLike: boolean, isVeto?: boolean) => Promise<boolean>;
  onLeave: () => void;
  roomId: string;
  receivedEmojis?: { id: string; emoji: string }[];
  sendBroadcastEmoji?: (emoji: string) => void;
  isHost?: boolean;
  onRestartSession?: () => Promise<boolean>;
  onSelectDestination?: (destination: TravelDestination) => void;
  users?: RoomUser[];
  swipes?: Swipe[];
  peersStillSwiping?: RoomUser[];
  discoveryMode?: 'rapid' | 'infinite';
  isFetchingMore?: boolean;
  discoveryStatus?: string | null;
  onCallEarlyConsensus?: () => void;
}

export function SwiperView({
  destinationsDeck,
  unswipedDestinations,
  isWaitingForOthers,
  onSubmitSwipe,
  roomId,
  receivedEmojis = [],
  sendBroadcastEmoji,
  isHost = false,
  onRestartSession,
  onSelectDestination,
  onCallEarlyConsensus,
  users = [],
  swipes = [],
  peersStillSwiping = [],
  discoveryMode = 'rapid',
  isFetchingMore = false,
  discoveryStatus = null,
}: SwiperViewProps) {
  const { language, t, localizeDestination, localizeAmenity } = useLanguage();

  const [activePhotoIdx, setActivePhotoIdx] = useState<{ [key: number]: number }>({});
  const [showTour, setShowTour] = useState<TravelDestination | null>(null);

  // Motion values for swipe drag physics (GPU-accelerated transforms)
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.88, 1, 1, 1, 0.88]);
  const likeBadgeOpacity = useTransform(x, [20, 120], [0, 1]);
  const rejectBadgeOpacity = useTransform(x, [-20, -120], [0, 1]);

  const rawTopCard = unswipedDestinations[0] || null;
  const topCard = rawTopCard ? { ...rawTopCard, ...localizeDestination(rawTopCard) } : null;

  useLayoutEffect(() => {
    x.set(0);
  }, [rawTopCard?.id, x]);

  const handleSwipe = useCallback(
    async (destinationId: number, isLike: boolean, isVeto: boolean = false) => {
      x.set(0);
      await onSubmitSwipe(destinationId, isLike, isVeto);
    },
    [onSubmitSwipe, x]
  );

  const [hostAnnouncement, setHostAnnouncement] = useState<string | null>(null);
  const hostTimerRef = useRef<number | null>(null);
  const lastAnnouncedMilestoneRef = useRef<{ [key: string]: number }>({});

  const playAnnouncer = useCallback((displayScript: string, englishAudioScript: string) => {
    playJackboxHostAnnouncement(displayScript, language === 'th' ? 'th' : 'en', englishAudioScript);
    setHostAnnouncement(displayScript);

    if (hostTimerRef.current) clearTimeout(hostTimerRef.current);
    hostTimerRef.current = window.setTimeout(() => {
      setHostAnnouncement(null);
    }, 4500);
  }, [language]);

  const announceNearConsensus = useCallback((destination: TravelDestination, remaining: number) => {
    const key = `${destination.id}_${remaining}`;
    const now = Date.now();
    if (lastAnnouncedMilestoneRef.current[key] && now - lastAnnouncedMilestoneRef.current[key] < 12000) {
      return;
    }
    lastAnnouncedMilestoneRef.current[key] = now;
    const destLoc = localizeDestination(destination);
    const script = generateJackboxAnnouncerScript(destLoc.title, destination.wifi_speed_mbps, remaining, language === 'th' ? 'th' : 'en');
    const englishScript = generateJackboxAnnouncerScript(destLoc.title, destination.wifi_speed_mbps, remaining, 'en');
    playAnnouncer(script, englishScript);
  }, [playAnnouncer, language, localizeDestination]);

  useEffect(() => {
    if (!swipes || swipes.length === 0 || !destinationsDeck) return;
    const activeCount = users?.length || 1;
    const requiredLikes = activeCount <= 2 ? Math.max(1, activeCount) : Math.max(2, Math.ceil(activeCount * 0.6));

    for (const dest of destinationsDeck) {
      const likes = swipes.filter(s => s.destination_id === dest.id && s.is_like).length;
      const isVetoed = swipes.some(s => s.destination_id === dest.id && s.is_veto);
      const remaining = requiredLikes - likes;

      if (!isVetoed && remaining > 0 && remaining <= 2 && likes > 0) {
        announceNearConsensus(dest, remaining);
        break;
      }
    }
  }, [swipes, users, destinationsDeck, announceNearConsensus]);

  const reactionTags = language === 'en'
    ? ['Beachfront', 'Boardroom', 'Great Value', 'Luxury', 'Fast WiFi']
    : ['วิวทะเล', 'ห้องประชุมดี', 'คุ้มค่า', 'หรูหรา', 'เน็ตเร็ว'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-3 sm:px-6 py-3 sm:py-5 relative select-none">
      {/* Top HUD Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#cba6f7] bg-[#181825] border border-[#313244] px-2.5 py-0.5 rounded-full tabular-data">
            #{roomId}
          </span>
          <span className="text-xs font-mono text-[#cdd6f4] font-medium px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#313244] tabular-data">
            {Math.min(destinationsDeck.length, destinationsDeck.length - unswipedDestinations.length + (unswipedDestinations.length > 0 ? 1 : 0))} / {destinationsDeck.length}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#a6e3a1]/35 text-[#a6e3a1] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
            <span>{users.length} {language === 'th' ? 'คน' : 'Pax'}</span>
          </span>
          {discoveryMode === 'infinite' ? (
            <span
              data-testid="infinite-discovery-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#cba6f7]/40 text-[#cba6f7] text-[10px] font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-pulse" />
              <span>{t.infiniteDeckNotice}</span>
            </span>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#a6e3a1]/35 text-[#a6e3a1] text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
              <span>{t.realtimeRadar}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] text-[#a6adc8] uppercase font-bold tracking-wider">
            {t.swipeDeckProgress}:
          </span>
          <span className="text-[#cba6f7] font-bold tabular-data">
            {Math.round(((destinationsDeck.length - unswipedDestinations.length) / destinationsDeck.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Non-blocking Live Discovery Pre-fetch Status Badge */}
      <AnimatePresence>
        {isFetchingMore && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="w-full max-w-md mb-2.5 px-3.5 py-2 rounded-2xl bg-[#181825] border border-[#cba6f7]/40 flex items-center justify-between text-xs text-[#cba6f7]"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#cba6f7] animate-ping" />
              <span className="font-medium text-[11px] sm:text-xs">{discoveryStatus || t.discoveringLiveVenues}</span>
            </div>
            <span className="text-[10px] font-mono text-[#bac2de] bg-[#1e1e2e] border border-[#313244] px-2 py-0.5 rounded-full">
              Google Places
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Host Consensus Banner / Announcement Toast */}
      {hostAnnouncement && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full max-w-md mb-3 p-3 rounded-2xl bg-[#181825] border border-[#cba6f7]/60 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#cba6f7]">
            <span className="w-2 h-2 rounded-full bg-[#cba6f7] animate-ping" />
            <span>[ANNOUNCEMENT] {hostAnnouncement}</span>
          </div>
        </motion.div>
      )}

      {/* Floating Emojis Overlay */}
      <div className="pointer-events-none fixed inset-x-0 top-24 bottom-24 flex items-center justify-center overflow-hidden z-30">
        <AnimatePresence>
          {receivedEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 1, scale: 0.5, y: 20 }}
              animate={{ opacity: 0, scale: 1.4, y: -120 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#181825] border border-[#cba6f7] text-[#cba6f7] shadow-lg"
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Swiper Deck Area */}
      <div className="relative w-full max-w-md h-[560px] flex items-center justify-center">
        <div className="absolute -inset-6 bg-gradient-to-tr from-[#cba6f7]/10 via-transparent to-[#fab387]/10 blur-3xl rounded-[3rem] pointer-events-none -z-10" />

        {isWaitingForOthers ? (
          <div className="w-full h-full p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_28px_80px_-16px_rgba(17,17,27,0.85)] flex items-center justify-center">
            <div className="w-full h-full rounded-[calc(2rem-6px)] p-6 bg-[#1e1e2e] border border-[#313244] flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#cba6f7]/15 border border-[#cba6f7]/35 flex items-center justify-center text-[#cba6f7] mb-3">
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-[#cdd6f4] mb-2 tracking-[-0.03em]">
                {t.waitingPeersTitle}
              </h3>
              {peersStillSwiping && peersStillSwiping.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-[#bac2de]">
                    {language === 'th'
                      ? `ระบบกำลังรอสมาชิกอีก ${peersStillSwiping.length} ท่านปัดเลือกให้ครบ:`
                      : `Waiting for ${peersStillSwiping.length} teammate(s) to finish voting:`}
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
                    {peersStillSwiping.map(p => (
                      <span key={p.id} className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/35 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-ping" />
                        {p.user_name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6c7086] font-mono">
                    {language === 'th' ? 'ระบบจะคำนวณฉันทามติเอกฉันท์ทันทีเมื่อทุกคนปัดเลือกครบ' : 'Consensus will compute in real time once everyone finishes.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#bac2de] leading-relaxed mb-5 max-w-xs text-balance">
                  {t.waitingPeersDesc}
                </p>
              )}
              {isHost && (
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                  {onCallEarlyConsensus && (
                    <button
                      onClick={onCallEarlyConsensus}
                      data-testid="call-early-consensus-btn"
                      className="py-2.5 px-5 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] text-xs font-bold rounded-full transition-all cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(203,166,247,0.3)]"
                    >
                      {language === 'th' ? '[QUORUM] สรุปผลฉันทามติเสียงส่วนใหญ่ทันที' : '[QUORUM] Call Early Majority Consensus'}
                    </button>
                  )}
                  {onRestartSession && (
                    <button
                      onClick={onRestartSession}
                      data-testid="restart-session-btn"
                      className="py-2.5 px-5 bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] text-xs font-semibold rounded-full transition-colors cursor-pointer active:scale-95"
                    >
                      {t.restartSessionBtn}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : topCard ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={rawTopCard?.id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, pointerEvents: 'none', transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onDragEnd={(_e, info) => {
                if (info.offset.x > 90) {
                  handleSwipe(topCard.id, true, false);
                } else if (info.offset.x < -90) {
                  handleSwipe(topCard.id, false, false);
                }
              }}
              className="absolute inset-0 p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_28px_80px_-16px_rgba(17,17,27,0.85)] cursor-grab active:cursor-grabbing flex flex-col will-change-transform select-none [transform:translateZ(0)]"
            >
              <div className="w-full h-full rounded-[calc(2rem-6px)] overflow-hidden bg-[#1e1e2e] flex flex-col border border-[#313244]">
                {/* Top Photo Viewport */}
                <div className="relative w-full h-[235px] bg-[#11111b] overflow-hidden shrink-0">
                  <img
                    src={
                      topCard.gallery && topCard.gallery.length > 0
                        ? topCard.gallery[activePhotoIdx[topCard.id] || 0] || topCard.hero_image
                        : topCard.hero_image
                    }
                    alt={topCard.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="eager"
                  />

                  {/* Dark Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-transparent to-[#11111b]/45 pointer-events-none" />

                  {/* Location & Rating Overlaid on Photo */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-[#11111b]/85 backdrop-blur-md border border-[#313244] text-[#cdd6f4] text-[11px] font-medium">
                      {topCard.city}, {topCard.country}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#11111b]/85 backdrop-blur-md border border-[#fab387]/40 text-[#fab387] text-[11px] font-semibold tabular-data font-mono flex items-center gap-1">
                      <svg className="w-3 h-3 fill-current text-[#fab387]" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span>{topCard.rating} ({topCard.reviews_count})</span>
                    </span>
                  </div>

                  {/* Photo Gallery Navigation Controls */}
                  {topCard.gallery && topCard.gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label={language === 'th' ? 'ภาพก่อนหน้า' : 'Previous photo'}
                        onClick={(e) => {
                          e.stopPropagation();
                          const current = activePhotoIdx[topCard.id] || 0;
                          const next = (current - 1 + topCard.gallery.length) % topCard.gallery.length;
                          setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: next }));
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#11111b]/85 backdrop-blur-md border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer z-10 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        aria-label={language === 'th' ? 'ภาพถัดไป' : 'Next photo'}
                        onClick={(e) => {
                          e.stopPropagation();
                          const current = activePhotoIdx[topCard.id] || 0;
                          const next = (current + 1) % topCard.gallery.length;
                          setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: next }));
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#11111b]/85 backdrop-blur-md border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer z-10 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 px-2.5 py-1 rounded-full bg-[#11111b]/85 border border-[#313244]">
                        {topCard.gallery.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Photo ${idx + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: idx }));
                            }}
                            className={`h-1 rounded-full transition-all cursor-pointer ${
                              (activePhotoIdx[topCard.id] || 0) === idx ? 'bg-[#cba6f7] w-3.5' : 'bg-[#6c7086] w-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Like / Reject Badges on Drag */}
                <motion.div
                  style={{ opacity: likeBadgeOpacity }}
                  className="absolute top-5 right-5 px-3.5 py-1 rounded-full bg-[#a6e3a1] text-[#11111b] font-black text-xs uppercase rotate-6 pointer-events-none z-20 shadow-md"
                >
                  {language === 'th' ? 'ถูกใจ ->' : 'LIKE ->'}
                </motion.div>
                <motion.div
                  style={{ opacity: rejectBadgeOpacity }}
                  className="absolute top-5 left-5 px-3.5 py-1 rounded-full bg-[#f38ba8] text-[#11111b] font-black text-xs uppercase -rotate-6 pointer-events-none z-20 shadow-md"
                >
                  {language === 'th' ? 'ผ่าน ✕' : 'PASS ✕'}
                </motion.div>

                {/* Bottom Content Info */}
                <div className="p-4 text-left flex-1 flex flex-col justify-between space-y-2 bg-[#1e1e2e]">
                  {/* Category & Verified WiFi */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#cdd6f4] font-medium px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#313244]">
                      {topCard.category}
                    </span>
                    <span className="text-[11px] text-[#a6e3a1] font-semibold px-2.5 py-0.5 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/35 tabular-data font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                      Starlink {topCard.wifi_speed_mbps} Mbps
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-base sm:text-lg font-bold text-[#cdd6f4] leading-snug tracking-[-0.02em]">
                    {topCard.title}
                  </h2>

                  {/* AI Rationale */}
                  <div className="p-2.5 rounded-xl bg-[#181825] border border-[#313244] text-[#bac2de] text-xs leading-relaxed">
                    <span className="text-[#cba6f7] font-semibold font-mono text-[10px] uppercase tracking-[0.14em] block mb-0.5">
                      CURATOR INSIGHT:
                    </span>
                    <p className="line-clamp-2 text-[11px]">{topCard.ai_reason}</p>
                  </div>

                  {/* Business Amenities Pills */}
                  <div className="flex flex-wrap gap-1">
                    {topCard.business_amenities.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#313244] text-[#a6adc8]"
                      >
                        {localizeAmenity(a)}
                      </span>
                    ))}
                  </div>

                  {/* Pricing & Details Button */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#313244]">
                    <div>
                      <span className="text-base font-bold text-[#f5e0dc] tabular-data font-mono">
                        ฿{topCard.price_per_person.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#a6adc8]"> {language === 'th' ? '/คน/คืน' : '/person/night'}</span>
                      <span className="block text-[10px] text-[#a6e3a1] font-mono tabular-data font-medium">
                        {language === 'th' ? '✓ รวม VAT 7% & หัก ณ ที่จ่าย 3%' : '✓ VAT 7% & WHT 3% Compliant'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTour(topCard)}
                      className="py-1.5 px-3.5 rounded-full bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] text-xs font-medium cursor-pointer transition-colors active:scale-95"
                    >
                      {t.viewDetailsBtn}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full h-full p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_28px_80px_-16px_rgba(17,17,27,0.85)] flex items-center justify-center">
            <div className="w-full h-full rounded-[calc(2rem-6px)] p-5 bg-[#1e1e2e] border border-[#313244] flex flex-col items-center justify-between text-center overflow-y-auto">
              <div className="w-full">
                <div className="w-12 h-12 rounded-2xl bg-[#cba6f7]/15 border border-[#cba6f7]/35 flex items-center justify-center text-[#cba6f7] mx-auto mb-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0H9.496m5.004 0a3 3 0 002.996-2.67V6.75A3.75 3.75 0 0013.75 3h-3.5A3.75 3.75 0 006.5 6.75v5.955a3 3 0 002.996 2.67" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[#cdd6f4] mb-1 tracking-[-0.03em]">
                  {t.roundCompleteTitle}
                </h3>
                <p className="text-xs text-[#bac2de] leading-relaxed mb-4 max-w-xs mx-auto">
                  {t.roundCompletePassedDesc}
                </p>

                {/* Featured Top AI Recommendation Preview */}
                {destinationsDeck[0] && (
                  <div className="w-full p-3.5 rounded-2xl bg-[#181825] border border-[#313244] text-left mb-4">
                    <div className="text-[10px] font-mono text-[#cba6f7] font-bold uppercase tracking-wider mb-1.5">
                      [TOP PICK] {language === 'th' ? 'สถานที่แนะนำอันดับ 1 ของ AI' : 'Top AI Recommended Venue'}
                    </div>
                    <div className="flex items-center gap-3">
                      {destinationsDeck[0].hero_image && (
                        <img
                          src={destinationsDeck[0].hero_image}
                          alt={destinationsDeck[0].title}
                          className="w-16 h-16 rounded-xl object-cover border border-[#313244] shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-[#cdd6f4] truncate">
                          {localizeDestination(destinationsDeck[0]).title}
                        </div>
                        <div className="text-[10px] text-[#a6adc8] truncate">
                          {destinationsDeck[0].city}, {destinationsDeck[0].country}
                        </div>
                        <div className="text-[10px] font-mono text-[#fab387] mt-0.5 tabular-data">
                          ฿{destinationsDeck[0].price_per_person.toLocaleString()}/คน • {destinationsDeck[0].wifi_speed_mbps} Mbps (Starlink SLA)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2 pt-2">
                {destinationsDeck[0] && onSelectDestination && (
                  <button
                    onClick={() => onSelectDestination(destinationsDeck[0])}
                    data-testid="select-top-venue-btn"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] font-extrabold text-xs rounded-full shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{t.confirmTopAiVenueBtn}</span>
                    <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                )}

                {isHost && onRestartSession && (
                  <button
                    onClick={onRestartSession}
                    data-testid="restart-round-btn"
                    className="w-full py-2.5 px-4 bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] text-xs font-semibold rounded-full transition-colors cursor-pointer active:scale-95"
                  >
                    {t.restartRoundBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Action Island Bar */}
      {topCard && !isWaitingForOthers && (
        <div className="flex items-center justify-center gap-3 mt-4 z-20">
          {/* Reject */}
          <button
            onClick={() => handleSwipe(topCard.id, false, false)}
            className="group h-12 px-5 rounded-full bg-[#181825] hover:bg-[#f38ba8]/15 border border-[#f38ba8]/40 hover:border-[#f38ba8] text-[#f38ba8] text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-lg active:scale-[0.96] transition-all cursor-pointer"
          >
            <span>{t.swipePass}</span>
            <div className="w-6 h-6 rounded-full bg-[#f38ba8]/20 flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
              ✕
            </div>
          </button>

          {/* Veto */}
          <button
            onClick={() => handleSwipe(topCard.id, false, true)}
            className="group h-12 px-4 rounded-full bg-[#181825] hover:bg-[#fab387]/20 border border-[#313244] hover:border-[#fab387] text-[#bac2de] hover:text-[#fab387] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg active:scale-[0.96] transition-all cursor-pointer"
            title={t.vetoTooltip}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider">{t.swipeVeto}</span>
            <div className="w-5 h-5 rounded-full bg-[#fab387]/20 text-[#fab387] flex items-center justify-center text-[10px] group-hover:scale-105 transition-transform font-mono font-bold">
              !
            </div>
          </button>

          {/* Like */}
          <button
            onClick={() => handleSwipe(topCard.id, true, false)}
            className="group h-12 px-6 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#a6e3a1] text-[#11111b] text-xs sm:text-sm font-extrabold flex items-center justify-between gap-3 shadow-[0_8px_28px_rgba(203,166,247,0.3)] active:scale-[0.96] transition-all cursor-pointer"
          >
            <span className="tracking-tight">{t.swipeLike}</span>
            <div className="w-6 h-6 rounded-full bg-[#11111b]/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Team Reaction Tags */}
      {sendBroadcastEmoji && (
        <div className="flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-full bg-[#181825] border border-[#313244]">
          <span className="text-[10px] text-[#a6adc8] font-mono mr-1">{t.reactionLabel}</span>
          {reactionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => sendBroadcastEmoji(tag)}
              className="text-[10px] text-[#bac2de] hover:text-[#cba6f7] px-2.5 py-0.5 rounded-full bg-[#1e1e2e] hover:bg-[#cba6f7]/15 border border-[#313244] hover:border-[#cba6f7]/40 transition-colors cursor-pointer active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[#11111b]/85 backdrop-blur-[24px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
              className="w-full max-w-lg p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_32px_96px_rgba(17,17,27,0.9)]"
            >
              <div className="w-full max-h-[85dvh] overflow-y-auto rounded-[calc(2rem-6px)] p-6 bg-[#1e1e2e] border border-[#313244] text-left">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#cdd6f4] tracking-[-0.02em]">{showTour.title}</h3>
                    <p className="text-xs text-[#a6adc8]">{showTour.city}, {showTour.country}</p>
                  </div>
                  <button
                    onClick={() => setShowTour(null)}
                    className="w-7 h-7 rounded-full bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <img
                  src={showTour.hero_image}
                  alt={showTour.title}
                  className="w-full h-44 object-cover rounded-2xl mb-3 border border-[#313244]"
                />

                <p className="text-xs text-[#bac2de] leading-relaxed mb-4">{showTour.overview}</p>

                <h4 className="text-[10px] uppercase font-mono tracking-[0.14em] text-[#cba6f7] font-semibold mb-2">
                  {t.amenitiesHeading}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                  {showTour.business_amenities.map((a, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4]">
                      {localizeAmenity(a)}
                    </div>
                  ))}
                </div>

                <h4 className="text-[10px] uppercase font-mono tracking-[0.14em] text-[#a6adc8] font-semibold mb-2">
                  {t.highlightsHeading}
                </h4>
                <div className="space-y-1.5 mb-5">
                  {showTour.tourism_highlights.map((tHighlight, i) => (
                    <p key={i} className="text-xs text-[#bac2de] flex items-start gap-1.5">
                      <span className="text-[#cba6f7]">•</span>
                      <span>{tHighlight}</span>
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => setShowTour(null)}
                  className="w-full py-3 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] text-xs font-extrabold rounded-full transition-all cursor-pointer active:scale-98"
                >
                  {t.closeTourBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
