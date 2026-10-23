import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onCreateRoom: () => Promise<boolean>;
  onJoinRoom: (code: string) => Promise<boolean>;
  onReenterSession: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onOpenBusinessModel?: () => void;
}

export function LandingView({
  onCreateRoom,
  onJoinRoom,
  onReenterSession,
  loading,
  error,
}: LandingViewProps) {
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [cachedRoomId] = useState(() => localStorage.getItem('trippick_room_id'));

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 4) {
      setJoinError('รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดี (เช่น TRIP)');
      return;
    }
    await onJoinRoom(cleanCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-10 sm:py-16 text-center relative z-20"
    >
      {/* Ambient Radial Glowing Mesh */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#cba6f7]/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#74c7ec]/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Minimalist Micro Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181825]/90 border border-white/10 mb-5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-widest font-semibold text-[#cba6f7]">
            B2B CONSENSUS &amp; RETREAT ENGINE
          </span>
        </div>

        {/* Monumental Minimalist Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#cdd6f4] mb-3">
          TripPick
        </h1>

        <p className="text-base sm:text-lg font-medium text-[#b4befe] mb-2 tracking-tight">
          ระบบสร้างฉันทามติเพื่อจัดทริปออฟไซต์และสัมมนาองค์กร
        </p>

        <p className="text-xs sm:text-sm text-[#a6adc8] max-w-md leading-relaxed mb-8 text-balance">
          ยุติปัญหาถกเถียงเรื่องสถานที่จัดออฟไซต์ในแชทกลุ่ม ให้ทุกคนในทีมปัดเลือกสถานที่พร้อมกันแบบเรียลไทม์ หาข้อสรุปได้ใน 3 นาที พร้อมปิดยอดจองสร้างรายได้คอมมิชชั่น B2B
        </p>

        {/* Error notification banner */}
        {(error || joinError) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs w-full max-w-md text-center">
            {error || joinError}
          </div>
        )}

        {/* Double-Bezel Action Enclosure (Nested Architectural Frame) */}
        <div className="w-full max-w-md p-2 rounded-[2rem] bg-[#181825]/90 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="rounded-[calc(2rem-0.5rem)] p-5 sm:p-6 bg-[#1e1e2e]/95 border border-white/5 flex flex-col gap-3.5">
            {/* Re-enter Previous Session */}
            {cachedRoomId && (
              <button
                onClick={onReenterSession}
                disabled={loading}
                className="group w-full py-2.5 px-4 rounded-full bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#a6e3a1]/50 text-[#a6e3a1] text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-between active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" />
                  <span>กลับเข้าห้องเดิมของทีม</span>
                </div>
                <span className="font-mono bg-[#313244] px-2.5 py-0.5 rounded-full text-[11px] text-[#a6e3a1] font-bold">
                  {cachedRoomId}
                </span>
              </button>
            )}

            {/* Primary Action Button (Nested Island Button Architecture) */}
            <button
              onClick={() => onCreateRoom()}
              disabled={loading}
              className="group relative w-full py-4 px-6 rounded-full bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-bold text-sm shadow-lg hover:shadow-[#cba6f7]/25 transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.98] disabled:opacity-50"
            >
              <span className="tracking-tight">
                {loading ? 'กำลังสร้างห้องทริปใหม่...' : 'สร้างห้องทริปใหม่สำหรับทีม'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#11111b]/15 text-[#11111b] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6c7086]">หรือ เข้าร่วมด้วยรหัส</span>
              <div className="flex-1 h-[1px] bg-white/10" />
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
                placeholder="รหัส 4 หลัก"
                className="flex-1 py-3 px-4 rounded-full bg-[#181825] border border-white/10 text-[#cdd6f4] placeholder-[#6c7086] text-xs font-mono font-medium tracking-widest text-center uppercase focus:outline-none focus:border-[#cba6f7] transition-colors"
              />

              <button
                type="submit"
                disabled={loading || code.trim().length !== 4}
                className="px-6 py-3 rounded-full bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                เข้าห้อง
              </button>
            </form>
          </div>
        </div>

        {/* Minimalist Bento Value Grid (Linear-Tier Concentric Grid) */}
        <div className="w-full max-w-md grid grid-cols-3 gap-2.5 mt-6">
          <div className="p-3.5 rounded-2xl bg-[#181825]/80 border border-white/10 hover:border-[#cba6f7]/40 transition-all backdrop-blur-md text-left group">
            <span className="text-[10px] font-mono text-[#cba6f7] font-semibold uppercase tracking-wider block">
              SPEED
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#cba6f7] transition-colors">
              ฉันทามติ 3 นาที
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5 tabular-data">
              เร็วกว่าแชท 6 เท่า
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825]/80 border border-white/10 hover:border-[#74c7ec]/40 transition-all backdrop-blur-md text-left group">
            <span className="text-[10px] font-mono text-[#74c7ec] font-semibold uppercase tracking-wider block">
              NETWORK
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#74c7ec] transition-colors">
              เน็ต 500+ Mbps
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5">
              Starlink / MICE
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825]/80 border border-white/10 hover:border-[#a6e3a1]/40 transition-all backdrop-blur-md text-left group">
            <span className="text-[10px] font-mono text-[#a6e3a1] font-semibold uppercase tracking-wider block">
              REVENUE
            </span>
            <p className="text-xs font-bold text-[#cdd6f4] mt-1 group-hover:text-[#a6e3a1] transition-colors">
              B2B 10–15%
            </p>
            <span className="text-[10px] text-[#a6adc8] block mt-0.5 tabular-data">
              ยอด 250,000+ บ.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
