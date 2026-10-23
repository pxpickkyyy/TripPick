import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';

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
}

export function SwiperView({
  destinationsDeck,
  unswipedDestinations,
  isWaitingForOthers,
  onSubmitSwipe,
  onLeave,
  roomId,
  receivedEmojis = [],
  sendBroadcastEmoji,
  isHost = false,
  onRestartSession,
}: SwiperViewProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState<{ [key: number]: number }>({});
  const [showTour, setShowTour] = useState<TravelDestination | null>(null);

  // Motion values for swipe drag physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.8, 1, 1, 1, 0.8]);
  const likeBadgeOpacity = useTransform(x, [20, 120], [0, 1]);
  const rejectBadgeOpacity = useTransform(x, [-20, -120], [0, 1]);

  const topCard = unswipedDestinations[0] || null;

  const handleSwipe = useCallback(
    async (destinationId: number, isLike: boolean, isVeto: boolean = false) => {
      await onSubmitSwipe(destinationId, isLike, isVeto);
    },
    [onSubmitSwipe]
  );

  const handleSimulateTeammateMatch = async (destinationId: number) => {
    await onSubmitSwipe(destinationId, true, false);
  };

  const reactionTags = ['วิวทะเล', 'ห้องประชุมดี', 'คุ้มค่า', 'หรูหรา', 'เน็ตเร็ว'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-6 sm:py-8 relative select-none z-20">
      {/* Top HUD Bar (Catppuccin Mocha) */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-[#cba6f7] bg-[#1e1e2e] border border-[#313244] px-3 py-1 rounded-full tabular-data">
            #{roomId}
          </span>
          <span className="text-xs font-mono text-[#89dceb] font-medium px-2.5 py-1 rounded-full bg-[#89dceb]/10 border border-[#89dceb]/20 tabular-data">
            {destinationsDeck.length - unswipedDestinations.length + 1} / {destinationsDeck.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {topCard && (
            <button
              onClick={() => handleSimulateTeammateMatch(topCard.id)}
              className="py-1 px-3 bg-[#a6e3a1]/15 hover:bg-[#a6e3a1]/25 border border-[#a6e3a1]/30 text-[#a6e3a1] rounded-full text-[11px] font-semibold cursor-pointer transition-all duration-300 ease-spring active:scale-95"
            >
              ทดสอบ Match ทันที
            </button>
          )}

          <button
            onClick={onLeave}
            className="text-xs text-[#a6adc8] hover:text-[#f38ba8] transition-colors duration-200 cursor-pointer font-medium px-2 py-1"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Floating Broadcast Reactions */}
      <div className="fixed top-24 right-6 pointer-events-none z-50 flex flex-col gap-2">
        <AnimatePresence>
          {receivedEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#181825]/95 border border-[#cba6f7]/40 text-[#cba6f7] backdrop-blur-md shadow-[0_4px_20px_rgba(17,17,27,0.7)]"
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Swiper Deck Area */}
      <div className="relative w-full max-w-md h-[580px] flex items-center justify-center">
        {isWaitingForOthers ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full p-2 rounded-[2.25rem] bg-[#181825]/70 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(17,17,27,0.85)] flex items-center justify-center"
          >
            <div className="w-full h-full rounded-[1.75rem] p-8 bg-[#1e1e2e]/95 border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 flex items-center justify-center text-[#a6e3a1] mb-4 animate-pulse">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-[#cdd6f4] mb-2 tracking-tight">
                ปัดครบทุกสถานที่แล้ว
              </h3>
              <p className="text-xs sm:text-sm text-[#a6adc8] leading-relaxed mb-6 max-w-xs text-balance">
                คุณได้โหวตครบทุกตัวเลือกแล้ว กำลังรอเพื่อนร่วมทีมคนอื่นๆ โหวตให้ครบเพื่อคำนวณฉันทามติของกลุ่ม
              </p>
              {isHost && onRestartSession && (
                <button
                  onClick={onRestartSession}
                  className="py-3 px-6 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-semibold rounded-full transition-all duration-300 ease-spring active:scale-95 cursor-pointer"
                >
                  เริ่มรอบการโหวตใหม่
                </button>
              )}
            </div>
          </motion.div>
        ) : topCard ? (
          <motion.div
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_e, info) => {
              if (info.offset.x > 100) {
                handleSwipe(topCard.id, true, false);
              } else if (info.offset.x < -100) {
                handleSwipe(topCard.id, false, false);
              }
            }}
            className="absolute inset-0 p-1.5 rounded-[2.25rem] bg-[#181825]/75 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_25px_60px_rgba(17,17,27,0.85)] cursor-grab active:cursor-grabbing flex flex-col"
          >
            <div className="w-full h-full rounded-[1.75rem] overflow-hidden bg-[#1e1e2e] flex flex-col border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)]">
              {/* Top Photo Viewport */}
              <div className="relative w-full h-[240px] bg-[#11111b] overflow-hidden shrink-0">
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

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-transparent to-[#11111b]/50 pointer-events-none" />

                {/* Location & Rating Overlaid on Photo */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-[#11111b]/80 backdrop-blur-md border border-[#313244] text-[#cdd6f4] text-[11px] font-medium">
                    {topCard.city}, {topCard.country}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#181825]/90 backdrop-blur-md border border-[#f9e2af]/30 text-[#f9e2af] text-[11px] font-semibold tabular-data font-mono">
                    ★ {topCard.rating} ({topCard.reviews_count})
                  </span>
                </div>

                {/* Photo Gallery Navigation Controls */}
                {topCard.gallery && topCard.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="ภาพก่อนหน้า"
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = activePhotoIdx[topCard.id] || 0;
                        const next = (current - 1 + topCard.gallery.length) % topCard.gallery.length;
                        setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: next }));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#11111b]/80 hover:bg-[#11111b] border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer z-10 transition-all duration-200 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label="ภาพถัดไป"
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = activePhotoIdx[topCard.id] || 0;
                        const next = (current + 1) % topCard.gallery.length;
                        setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: next }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#11111b]/80 hover:bg-[#11111b] border border-[#313244] text-[#cdd6f4] flex items-center justify-center cursor-pointer z-10 transition-all duration-200 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded-full bg-[#11111b]/80 backdrop-blur-md border border-[#313244]">
                      {topCard.gallery.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          aria-label={`ภาพลำดับที่ ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: idx }));
                          }}
                          className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                            (activePhotoIdx[topCard.id] || 0) === idx ? 'bg-[#cba6f7] w-3' : 'bg-[#6c7086] w-1.5'
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
                className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-[#a6e3a1] text-[#11111b] font-extrabold text-sm uppercase rotate-6 pointer-events-none z-20 shadow-[0_0_20px_rgba(166,227,161,0.5)]"
              >
                ถูกใจ ↗
              </motion.div>
              <motion.div
                style={{ opacity: rejectBadgeOpacity }}
                className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-[#f38ba8] text-[#11111b] font-extrabold text-sm uppercase -rotate-6 pointer-events-none z-20 shadow-[0_0_20px_rgba(243,139,168,0.5)]"
              >
                ผ่าน ✕
              </motion.div>

              {/* Bottom Content Info */}
              <div className="p-4 sm:p-5 text-left flex-1 flex flex-col justify-between space-y-2.5 bg-[#1e1e2e]">
                {/* Category & Verified WiFi */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#cdd6f4] font-medium px-2.5 py-0.5 rounded-full bg-[#313244] border border-[#45475a]">
                    {topCard.category}
                  </span>
                  <span className="text-[11px] text-[#74c7ec] font-semibold px-2.5 py-0.5 rounded-full bg-[#74c7ec]/15 border border-[#74c7ec]/30 tabular-data font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#74c7ec] animate-pulse" />
                    Starlink {topCard.wifi_speed_mbps} Mbps
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-extrabold text-[#cdd6f4] leading-snug tracking-tight">
                  {topCard.title}
                </h2>

                {/* AI Rationale */}
                <div className="p-2.5 rounded-xl bg-[#181825]/80 border border-[#313244] text-[#bac2de] text-xs leading-relaxed">
                  <span className="text-[#cba6f7] font-semibold font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                    AI CONSENSUS INSIGHT:
                  </span>
                  <p className="line-clamp-2">{topCard.ai_reason}</p>
                </div>

                {/* Business Amenities Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {topCard.business_amenities.slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#181825]/90 border border-[#313244] text-[#a6adc8]"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* Pricing & Details Button */}
                <div className="flex items-center justify-between pt-1 border-t border-[#313244]">
                  <div>
                    <span className="text-lg font-bold text-[#cdd6f4] tabular-data font-mono">
                      ฿{topCard.price_per_person.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#a6adc8]"> /คน/คืน</span>
                    <span className="block text-[11px] text-[#a6e3a1] font-mono tabular-data font-medium mt-0.5">
                      B2B Rev: ~฿{Math.round(topCard.price_per_night * (topCard.commission_percentage / 100)).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTour(topCard)}
                    className="py-1.5 px-3.5 rounded-full bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-medium cursor-pointer transition-all duration-300 ease-spring active:scale-95"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-[#a6adc8] text-sm">
            ไม่พบสถานที่เพิ่มเติมในตัวกรองนี้
          </div>
        )}
      </div>

      {/* Swipe Action Buttons (Catppuccin Mocha Accents) */}
      {topCard && !isWaitingForOthers && (
        <div className="flex items-center justify-center gap-3 mt-6 z-20">
          {/* Reject Left: Catppuccin Red */}
          <button
            onClick={() => handleSwipe(topCard.id, false, false)}
            className="group h-12 px-6 rounded-full bg-[#f38ba8]/15 hover:bg-[#f38ba8]/25 border border-[#f38ba8]/30 text-[#f38ba8] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-spring active:scale-95 cursor-pointer shadow-lg"
          >
            <span className="text-base leading-none">✕</span>
            <span>ผ่าน</span>
          </button>

          {/* Veto Down: Catppuccin Peach */}
          <button
            onClick={() => handleSwipe(topCard.id, false, true)}
            className="group h-12 px-5 rounded-full bg-[#fab387]/15 hover:bg-[#fab387]/25 border border-[#fab387]/30 text-[#fab387] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ease-spring active:scale-95 cursor-pointer shadow-lg"
            title="ยับยั้ง (Veto สิทธิ์คัดค้านเด็ดขาด)"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Veto</span>
          </button>

          {/* Like Right: Catppuccin Green to Teal */}
          <button
            onClick={() => handleSwipe(topCard.id, true, false)}
            className="group h-12 pl-6 pr-2 rounded-full bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:from-[#b9f2b5] hover:to-[#a7eee2] text-[#11111b] text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all duration-300 ease-spring active:scale-95 cursor-pointer shadow-[0_4px_24px_rgba(166,227,161,0.4)]"
          >
            <span>ถูกใจ</span>
            <div className="w-8 h-8 rounded-full bg-[#11111b]/25 text-[#11111b] flex items-center justify-center shrink-0 transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
              <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Team Reaction Tags (Catppuccin Surface Pill) */}
      {sendBroadcastEmoji && (
        <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[#181825]/80 border border-[#313244] backdrop-blur-md">
          <span className="text-[11px] text-[#a6adc8] font-mono mr-1">ปฏิกิริยา:</span>
          {reactionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => sendBroadcastEmoji(tag)}
              className="text-[11px] text-[#bac2de] hover:text-[#cdd6f4] px-2.5 py-1 rounded-full bg-[#313244] hover:bg-[#cba6f7]/20 border border-[#45475a] hover:border-[#cba6f7]/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111b]/85 backdrop-blur-xl p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-2 rounded-[2.25rem] bg-[#181825]/80 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_25px_60px_rgba(17,17,27,0.9)]"
          >
            <div className="w-full max-h-[85dvh] overflow-y-auto rounded-[1.75rem] p-6 bg-[#1e1e2e] border border-[#313244]/80 text-left">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#cdd6f4] tracking-tight">{showTour.title}</h3>
                  <p className="text-xs text-[#a6adc8]">{showTour.city}, {showTour.country}</p>
                </div>
                <button
                  onClick={() => setShowTour(null)}
                  className="w-8 h-8 rounded-full bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] flex items-center justify-center cursor-pointer transition-all duration-200"
                >
                  ✕
                </button>
              </div>

              <img
                src={showTour.hero_image}
                alt={showTour.title}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />

              <p className="text-xs sm:text-sm text-[#bac2de] leading-relaxed mb-6">{showTour.overview}</p>

              <h4 className="text-[11px] uppercase font-mono tracking-wider text-[#cba6f7] font-semibold mb-2.5">
                สิ่งอำนวยความสะดวกสำหรับธุรกิจ &amp; สัมมนา (MICE)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {showTour.business_amenities.map((a, i) => (
                  <div key={i} className="text-xs p-3 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4]">
                    {a}
                  </div>
                ))}
              </div>

              <h4 className="text-[11px] uppercase font-mono tracking-wider text-[#a6adc8] font-semibold mb-2.5">
                กิจกรรมกระชับมิตร &amp; ท่องเที่ยวในพื้นที่
              </h4>
              <div className="space-y-2 mb-8">
                {showTour.tourism_highlights.map((t, i) => (
                  <p key={i} className="text-xs text-[#bac2de] flex items-start gap-2">
                    <span className="text-[#cba6f7]">•</span>
                    <span>{t}</span>
                  </p>
                ))}
              </div>

              <button
                onClick={() => setShowTour(null)}
                className="w-full py-3.5 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-semibold rounded-full transition-all duration-300 ease-spring cursor-pointer active:scale-98"
              >
                ปิดและกลับไปปัดเลือกต่อ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
