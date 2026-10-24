import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/i18n';

interface LandingViewProps {
  onCreateRoom: () => Promise<boolean>;
  onJoinRoom: (code: string) => Promise<boolean>;
  onReenterSession: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function LandingView({
  onCreateRoom,
  onJoinRoom,
  onReenterSession,
  loading,
  error,
}: LandingViewProps) {
  const { language, t } = useLanguage();
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [cachedRoomId] = useState(() => localStorage.getItem('trippick_room_id'));

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 4) {
      setJoinError(t.codeLengthError);
      return;
    }
    await onJoinRoom(cleanCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-8 sm:py-14 text-center relative z-20"
    >
      {/* Ambient Radial Mesh */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#cba6f7]/10 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#74c7ec]/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Minimalist Micro Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181825] border border-[#313244] mb-4 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-widest font-semibold text-[#cba6f7]">
            {t.landingEyebrow}
          </span>
        </div>

        {/* Monumental Minimalist Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#cdd6f4] mb-3">
          {t.landingHeadline}
        </h1>

        <p className="text-base sm:text-lg font-semibold text-[#b4befe] mb-2 tracking-tight">
          {t.landingSubhead}
        </p>

        <p className="text-xs sm:text-sm text-[#a6adc8] max-w-md leading-relaxed mb-7 text-balance">
          {t.landingDesc}
        </p>

        {/* Error notification banner */}
        {(error || joinError) && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs w-full max-w-md text-center">
            {error || joinError}
          </div>
        )}

        {/* Double-Bezel Action Enclosure (Low-End Optimized Solid Surfaces) */}
        <div className="w-full max-w-md p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-2xl">
          <div className="rounded-[calc(2rem-0.5rem)] p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244] flex flex-col gap-3.5">
            {/* Re-enter Previous Session */}
            {cachedRoomId && (
              <button
                onClick={onReenterSession}
                disabled={loading}
                className="group w-full py-2.5 px-4 rounded-full bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#a6e3a1]/50 text-[#a6e3a1] text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-between active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" />
                  <span>{t.reenterRoomBtn}</span>
                </div>
                <span className="font-mono bg-[#313244] px-2.5 py-0.5 rounded-full text-[11px] text-[#a6e3a1] font-bold">
                  {cachedRoomId}
                </span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              data-testid="create-room-btn"
              onClick={() => onCreateRoom()}
              disabled={loading}
              className="group relative w-full py-4 px-6 rounded-full bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-extrabold text-sm shadow-lg hover:shadow-[#cba6f7]/25 transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.98] disabled:opacity-50"
            >
              <div className="text-left">
                <span className="tracking-tight block">
                  {loading ? (language === 'th' ? 'กำลังสร้างห้องทริปใหม่...' : 'Creating Room...') : t.createRoomBtn}
                </span>
                <span className="text-[11px] font-normal text-[#11111b]/80 block">
                  {t.createRoomSub}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#11111b]/15 text-[#11111b] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-[1px] bg-[#313244]" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6c7086]">
                {t.joinRoomTitle}
              </span>
              <div className="flex-1 h-[1px] bg-[#313244]" />
            </div>

            {/* Join Form (Instant Reactive Validation) */}
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError(null);
                }}
                placeholder={language === 'th' ? 'รหัส 4 หลัก' : '4-CHAR CODE'}
                className="flex-1 py-3 px-4 rounded-full bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs font-mono font-bold tracking-widest text-center uppercase focus:outline-none focus:border-[#cba6f7] transition-colors"
              />

              <button
                type="submit"
                disabled={loading || code.trim().length !== 4}
                className="px-6 py-3 rounded-full bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {t.joinRoomBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Minimalist Bento Value Grid (Low-End Optimized Solid Surfaces) */}
        <div className="w-full max-w-md grid grid-cols-3 gap-2.5 mt-5">
          <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] hover:border-[#cba6f7]/40 transition-colors text-left group">
            <span className="text-[10px] font-mono text-[#cba6f7] font-semibold uppercase tracking-wider block">
              SPEED
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#cba6f7] transition-colors">
              {language === 'th' ? 'ฉันทามติ 3 นาที' : '3-Min Consensus'}
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5 tabular-data">
              {language === 'th' ? 'เร็วกว่าแชท 6 เท่า' : '6x Faster than Slack'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] hover:border-[#74c7ec]/40 transition-colors text-left group">
            <span className="text-[10px] font-mono text-[#74c7ec] font-semibold uppercase tracking-wider block">
              NETWORK
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#74c7ec] transition-colors">
              {language === 'th' ? 'เน็ต 500+ Mbps' : '500+ Mbps WiFi'}
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5">
              Starlink / MICE
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] hover:border-[#a6e3a1]/40 transition-colors text-left group">
            <span className="text-[10px] font-mono text-[#a6e3a1] font-semibold uppercase tracking-wider block">
              REVENUE
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#a6e3a1] transition-colors">
              B2B 12% Take
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5 tabular-data">
              {language === 'th' ? 'ยอด ฿270,000+' : '฿270,000+ GMV'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
