import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onCreateRoom: () => Promise<boolean>;
  onJoinRoom: (code: string) => Promise<boolean>;
  onReenterSession: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onOpenBusinessModel: () => void;
}

export function LandingView({
  onCreateRoom,
  onJoinRoom,
  onReenterSession,
  loading,
  error,
  onOpenBusinessModel,
}: LandingViewProps) {
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [cachedRoomId] = useState(() => localStorage.getItem('trippick_room_id'));

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (code.length !== 4) {
      setJoinError('Room code must be exactly 4 characters.');
      return;
    }
    await onJoinRoom(code);
  };

  const handleQuickDemo = async () => {
    await onCreateRoom();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center select-none py-8 relative z-10"
    >
      {/* Top Banner: Make Me Money Contest Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider cursor-pointer hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        onClick={onOpenBusinessModel}
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-400">Make Me Money</span>
        <span className="text-slate-400">•</span>
        <span>Software for Business &amp; Tourism</span>
        <span className="text-cyan-400 font-bold ml-1">View Business Model →</span>
      </motion.div>

      {/* Main Logo & Headline */}
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col items-center max-w-2xl"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase select-none">
            Trip<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Pick</span>
          </h1>
        </div>

        <p className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-cyan-300/80 mb-3 font-semibold">
          Corporate Retreats &amp; Group Tourism Consensus Engine
        </p>
        <p className="text-sm md:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
          Stop 3-week Slack debates on where your team should travel. Swipe together on curated retreats, reach instant consensus, and monetize high-ticket B2B bookings.
        </p>
      </motion.div>

      {/* Display Errors */}
      {(error || joinError) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-4 py-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl max-w-sm w-full text-xs font-mono tracking-wide text-center"
        >
          {error || joinError}
        </motion.div>
      )}

      {/* Interactive Controls Container */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Re-enter Cached Room Button */}
        {cachedRoomId && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onReenterSession}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 hover:text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Re-enter Team Room: {cachedRoomId}
          </motion.button>
        )}

        {/* Create Room Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-mono tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.35)] cursor-pointer flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Team Room...
            </span>
          ) : (
            <>
              <span>✨</span>
              <span>Create New Team Retreat Room</span>
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center my-2 text-slate-500">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="px-4 text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Or Join Existing</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinSubmit} className="flex gap-2">
          <input
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (joinError) setJoinError(null);
            }}
            placeholder="ROOM CODE (e.g. TRIP)"
            disabled={loading}
            className="w-2/3 py-3.5 px-4 text-center font-mono text-sm tracking-widest uppercase bg-slate-900/80 border border-slate-700/60 focus:border-cyan-500/80 rounded-2xl focus:outline-none transition-all placeholder:text-slate-600 font-semibold text-white"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || code.length !== 4}
            className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-cyan-300 hover:text-white font-mono text-xs uppercase font-bold tracking-wider rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          >
            Join
          </motion.button>
        </form>

        {/* Bottom Metrics Pill */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Avg. Booking</p>
            <p className="text-sm font-bold text-white font-mono">$8,500+</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">TripPick Take</p>
            <p className="text-sm font-bold text-emerald-400 font-mono">10% - 15%</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Decision Time</p>
            <p className="text-sm font-bold text-cyan-400 font-mono">&lt; 5 mins</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
