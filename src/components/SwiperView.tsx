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
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.7, 1, 1, 1, 0.7]);
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
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-8 relative select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 bg-[#141a24] px-3 py-1.5 rounded-lg tabular-data">
            ห้อง: {roomId}
          </span>
          <span className="text-xs text-slate-400 tabular-data">
            {destinationsDeck.length - unswipedDestinations.length + 1} / {destinationsDeck.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {topCard && (
            <button
              onClick={() => handleSimulateTeammateMatch(topCard.id)}
              className="py-1 px-3 bg-[#172722] hover:bg-[#1f362f] text-emerald-300 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-150"
            >
              ทดสอบเกิด Match ทันที
            </button>
          )}

          <button
            onClick={onLeave}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors duration-150 cursor-pointer"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Floating Broadcast Reactions */}
      <div className="fixed top-20 right-6 pointer-events-none z-50 flex flex-col gap-2">
        <AnimatePresence>
          {receivedEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#18212e] text-emerald-300"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full bg-[#131822] rounded-3xl p-8 flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">ปัดครบทุกสถานที่แล้ว</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-8">
              คุณได้โหวตครบทุกตัวเลือกแล้ว กำลังรอเพื่อนร่วมทีมคนอื่นๆ โหวตให้ครบเพื่อคำนวณหาสถานที่ที่ทุกคนเห็นพ้องต้องกัน
            </p>
            {isHost && onRestartSession && (
              <button
                onClick={onRestartSession}
                className="py-3 px-6 bg-[#202937] hover:bg-[#2a3649] text-white text-xs font-medium rounded-xl transition-colors duration-150 cursor-pointer"
              >
                เริ่มรอบการโหวตใหม่
              </button>
            )}
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
            className="absolute inset-0 rounded-3xl overflow-hidden bg-[#131822] cursor-grab active:cursor-grabbing flex flex-col"
          >
            {/* Top Photo Viewport */}
            <div className="relative w-full h-[245px] bg-[#0e121a] overflow-hidden shrink-0">
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

              {/* Location & Rating Overlaid on Photo */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-[#0b0e14]/85 text-white text-xs font-medium">
                  {topCard.city}, {topCard.country}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#14231e]/90 text-emerald-300 text-xs font-semibold tabular-data">
                  คะแนน {topCard.rating} ({topCard.reviews_count} รีวิว)
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0b0e14]/75 hover:bg-[#0b0e14] text-white flex items-center justify-center cursor-pointer z-10 transition-colors duration-150"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0b0e14]/75 hover:bg-[#0b0e14] text-white flex items-center justify-center cursor-pointer z-10 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded-full bg-[#0b0e14]/75">
                    {topCard.gallery.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`ภาพลำดับที่ ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((prev) => ({ ...prev, [topCard.id]: idx }));
                        }}
                        className={`h-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
                          (activePhotoIdx[topCard.id] || 0) === idx ? 'bg-white w-3' : 'bg-white/40 w-1.5'
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
              className="absolute top-6 right-6 px-4 py-1.5 rounded-lg bg-[#059669] text-white font-bold text-base uppercase rotate-6 pointer-events-none z-20"
            >
              ถูกใจ
            </motion.div>
            <motion.div
              style={{ opacity: rejectBadgeOpacity }}
              className="absolute top-6 left-6 px-4 py-1.5 rounded-lg bg-[#e11d48] text-white font-bold text-base uppercase -rotate-6 pointer-events-none z-20"
            >
              ผ่าน
            </motion.div>

            {/* Bottom Content Info */}
            <div className="p-4 sm:p-5 text-left flex-1 flex flex-col justify-between space-y-2.5 bg-[#131822]">
              {/* Category & Verified WiFi */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-200 font-medium px-2.5 py-1 rounded bg-[#1c2432]">
                  {topCard.category}
                </span>
                <span className="text-xs text-emerald-300 font-medium px-2.5 py-1 rounded bg-[#162720] tabular-data">
                  เน็ต Starlink {topCard.wifi_speed_mbps} Mbps
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {topCard.title}
              </h2>

              {/* AI Rationale */}
              <div className="p-2.5 rounded-xl bg-[#0e121a] text-slate-200 text-xs leading-relaxed">
                <span className="text-emerald-400 font-semibold">เหตุผลจาก AI: </span>
                {topCard.ai_reason}
              </div>

              {/* Business Amenities Pills */}
              <div className="flex flex-wrap gap-1.5">
                {topCard.business_amenities.slice(0, 3).map((a, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#0e121a] text-slate-300"
                  >
                    {a}
                  </span>
                ))}
              </div>

              {/* Pricing & Virtual Tour Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-lg font-bold text-white tabular-data">
                    {topCard.price_per_person.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400"> บาท/คน/คืน</span>
                  <span className="block text-xs text-emerald-400 tabular-data mt-0.5">
                    คอมมิชชั่น B2B: ~{Math.round(topCard.price_per_night * (topCard.commission_percentage / 100)).toLocaleString()} บาท
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTour(topCard)}
                  className="py-2 px-3 rounded-xl bg-[#202937] hover:bg-[#2a3649] text-slate-200 text-xs font-medium cursor-pointer transition-colors duration-150"
                >
                  ดูรายละเอียดสถานที่
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            ไม่พบสถานที่เพิ่มเติมในตัวกรองนี้
          </div>
        )}
      </div>

      {/* Swipe Action Buttons */}
      {topCard && !isWaitingForOthers && (
        <div className="flex items-center justify-center gap-4 mt-6 z-20">
          {/* Reject Left */}
          <button
            onClick={() => handleSwipe(topCard.id, false, false)}
            className="h-12 px-6 rounded-xl bg-[#26151a] hover:bg-[#381c24] text-rose-300 text-sm font-semibold flex items-center justify-center transition-colors duration-150 cursor-pointer"
          >
            ผ่าน
          </button>

          {/* Veto Down */}
          <button
            onClick={() => handleSwipe(topCard.id, false, true)}
            className="h-12 px-5 rounded-xl bg-[#262115] hover:bg-[#382f1b] text-amber-300 text-sm font-semibold flex items-center justify-center transition-colors duration-150 cursor-pointer"
            title="ยับยั้ง (Veto สิทธิ์คัดค้านเด็ดขาด)"
          >
            ยับยั้ง (Veto)
          </button>

          {/* Like Right */}
          <button
            onClick={() => handleSwipe(topCard.id, true, false)}
            className="h-12 px-8 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold flex items-center justify-center transition-colors duration-150 cursor-pointer"
          >
            ถูกใจ
          </button>
        </div>
      )}

      {/* Team Reaction Tags */}
      {sendBroadcastEmoji && (
        <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-[#131822]">
          <span className="text-xs text-slate-400 mr-1">ส่งคำตอบรับ:</span>
          {reactionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => sendBroadcastEmoji(tag)}
              className="text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-[#1c2330] hover:bg-[#253040] transition-colors duration-150 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070c18] bg-opacity-90 p-6">
          <div className="w-full max-w-lg bg-[#131822] rounded-2xl p-6 text-left max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{showTour.title}</h3>
                <p className="text-xs text-slate-400">{showTour.city}, {showTour.country}</p>
              </div>
              <button
                onClick={() => setShowTour(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold cursor-pointer"
              >
                ปิด
              </button>
            </div>

            <img
              src={showTour.hero_image}
              alt={showTour.title}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />

            <p className="text-sm text-slate-300 leading-relaxed mb-6">{showTour.overview}</p>

            <h4 className="text-xs text-emerald-400 font-semibold mb-2">
              สิ่งอำนวยความสะดวกสำหรับธุรกิจ &amp; สัมมนา (MICE)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {showTour.business_amenities.map((a, i) => (
                <div key={i} className="text-xs p-2.5 rounded-lg bg-[#0e121a] text-slate-200">
                  {a}
                </div>
              ))}
            </div>

            <h4 className="text-xs text-slate-300 font-semibold mb-2">
              กิจกรรมกระชับมิตร &amp; ท่องเที่ยวในพื้นที่
            </h4>
            <div className="space-y-1.5 mb-8">
              {showTour.tourism_highlights.map((t, i) => (
                <p key={i} className="text-xs text-slate-300">
                  - {t}
                </p>
              ))}
            </div>

            <button
              onClick={() => setShowTour(null)}
              className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-colors duration-150 cursor-pointer"
            >
              ปิดและกลับไปปัดเลือกต่อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
