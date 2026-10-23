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
  const [activePhotoIdx] = useState<{ [key: number]: number }>({});
  const [showTour, setShowTour] = useState<TravelDestination | null>(null);

  // Motion values for swipe drag physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.6, 1, 1, 1, 0.6]);
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
    // Like for self and simulate consensus
    await onSubmitSwipe(destinationId, true, false);
  };

  const reactionEmojis = ['🔥', '🌴', '💼', '🥂', '🚀', '😍'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-6 relative z-10 select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
            ROOM: {roomId}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {destinationsDeck.length - unswipedDestinations.length + 1} / {destinationsDeck.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Solo Demo Helper button */}
          {topCard && (
            <button
              onClick={() => handleSimulateTeammateMatch(topCard.id)}
              title="Instant consensus match for demo purposes"
              className="py-1 px-2.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl text-[11px] font-mono font-bold cursor-pointer transition-all"
            >
              ⚡ Instant Match Demo
            </button>
          )}

          <button
            onClick={onLeave}
            className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Floating Broadcast Reactions */}
      <div className="fixed top-20 right-6 pointer-events-none z-50 flex flex-col gap-2">
        <AnimatePresence>
          {receivedEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1.3 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              className="text-3xl filter drop-shadow-lg"
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Swiper Deck Area */}
      <div className="relative w-full max-w-md h-[560px] flex items-center justify-center">
        {isWaitingForOthers ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-slate-700/80 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-2xl mb-4 animate-bounce">
              ⏳
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Deck Complete!</h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed mb-6">
              You’ve swiped through all retreat options. Waiting for your teammates to finish voting to calculate consensus matches.
            </p>
            {isHost && onRestartSession && (
              <button
                onClick={onRestartSession}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Restart Session Deck
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
            className="absolute inset-0 rounded-3xl overflow-hidden glass-panel-glow border border-slate-600/50 shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-between"
          >
            {/* Background Image / Gallery Carousel */}
            <div className="absolute inset-0 -z-10">
              <img
                src={
                  topCard.gallery && topCard.gallery.length > 0
                    ? topCard.gallery[activePhotoIdx[topCard.id] || 0] || topCard.hero_image
                    : topCard.hero_image
                }
                alt={topCard.title}
                className="w-full h-full object-cover brightness-[0.78]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-[#070c18]/40 to-transparent" />
            </div>

            {/* Like / Reject Badges on Drag */}
            <motion.div
              style={{ opacity: likeBadgeOpacity }}
              className="absolute top-6 right-6 px-4 py-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 font-black font-mono text-lg tracking-widest uppercase rotate-12 shadow-lg"
            >
              YES! 👍
            </motion.div>
            <motion.div
              style={{ opacity: rejectBadgeOpacity }}
              className="absolute top-6 left-6 px-4 py-1.5 rounded-xl border-2 border-rose-500 bg-rose-950/80 text-rose-300 font-black font-mono text-lg tracking-widest uppercase -rotate-12 shadow-lg"
            >
              PASS ✕
            </motion.div>

            {/* Top Card Badges */}
            <div className="p-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                {topCard.city}, {topCard.country}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                ★ {topCard.rating} ({topCard.reviews_count} reviews)
              </span>
            </div>

            {/* Bottom Content Info */}
            <div className="p-5 text-left z-10 space-y-2.5">
              {/* Category & Verified WiFi */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  {topCard.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  📶 {topCard.wifi_speed_mbps} Mbps Starlink
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-extrabold text-white leading-snug drop-shadow-md">
                {topCard.title}
              </h2>

              {/* AI Rationale */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-200 text-xs font-mono leading-relaxed shadow-sm">
                <span className="text-cyan-400 font-bold">AI Rationale: </span>
                {topCard.ai_reason}
              </div>

              {/* Business Amenities Pills */}
              <div className="flex flex-wrap gap-1.5">
                {topCard.business_amenities.slice(0, 3).map((a, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/50 border border-slate-700 text-slate-300"
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>

              {/* Pricing & Virtual Tour Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-lg font-black font-mono text-white">
                    ${topCard.price_per_person}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase"> / person / night</span>
                  <span className="block text-[9px] font-mono text-emerald-400">
                    Est. Comm: ${Math.round(topCard.price_per_night * (topCard.commission_percentage / 100))}/booking
                  </span>
                </div>

                <button
                  onClick={() => setShowTour(topCard)}
                  className="py-1 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-[11px] font-mono font-semibold cursor-pointer transition-all"
                >
                  👁️ View Details
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-slate-400 font-mono text-xs">
            No more retreat cards left.
          </div>
        )}
      </div>

      {/* Swipe Action Buttons */}
      {topCard && !isWaitingForOthers && (
        <div className="flex items-center justify-center gap-6 mt-6 z-20">
          {/* Reject Left */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe(topCard.id, false, false)}
            className="w-14 h-14 rounded-full bg-slate-900/90 border border-rose-500/40 text-rose-400 hover:bg-rose-950/60 text-xl font-bold flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Pass / Reject"
          >
            ✕
          </motion.button>

          {/* Veto Down */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe(topCard.id, false, true)}
            className="w-11 h-11 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 hover:bg-amber-950/60 text-sm font-mono font-bold flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title="Veto (Hard No for the whole team)"
          >
            🚫
          </motion.button>

          {/* Like Right */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe(topCard.id, true, false)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white hover:from-cyan-500 hover:to-emerald-400 text-2xl font-bold flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all cursor-pointer"
            title="Vote Yes / Like"
          >
            💚
          </motion.button>
        </div>
      )}

      {/* Live Team Reaction Emojis Toolbar */}
      {sendBroadcastEmoji && (
        <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">React:</span>
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendBroadcastEmoji(emoji)}
              className="text-base hover:scale-130 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Virtual Tour & Details Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{showTour.title}</h3>
                <p className="text-xs font-mono text-cyan-400">{showTour.city}, {showTour.country}</p>
              </div>
              <button
                onClick={() => setShowTour(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <img
              src={showTour.hero_image}
              alt={showTour.title}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{showTour.overview}</p>

            <h4 className="text-xs font-mono uppercase text-cyan-300 font-bold mb-2">Business &amp; MICE Facilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {showTour.business_amenities.map((a, i) => (
                <div key={i} className="text-xs font-mono p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  • {a}
                </div>
              ))}
            </div>

            <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2">Team Adventures &amp; Excursions</h4>
            <div className="space-y-1 mb-6">
              {showTour.tourism_highlights.map((t, i) => (
                <p key={i} className="text-xs text-slate-300 font-mono">✦ {t}</p>
              ))}
            </div>

            <button
              onClick={() => setShowTour(null)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
            >
              Close &amp; Resume Swiping
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
