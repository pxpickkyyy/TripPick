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
  onOpenBusinessModel,
}: LandingViewProps) {
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [cachedRoomId] = useState(() => localStorage.getItem('trippick_room_id'));

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (code.length !== 4) {
      setJoinError('รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดี (เช่น TRIP)');
      return;
    }
    await onJoinRoom(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-12 sm:py-20 text-center relative z-20"
    >
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Catppuccin Mocha Micro Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(203,166,247,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-ping" />
          <span className="text-[10px] uppercase font-mono tracking-[0.22em] font-semibold text-[#cba6f7]">
            B2B CONSENSUS &amp; RETREAT ENGINE
          </span>
        </div>

        {/* Monumental High-Contrast Headline (Catppuccin Mocha Gradient) */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-b from-[#cdd6f4] via-[#bac2de] to-[#cba6f7] bg-clip-text text-transparent">
            TripPick
          </span>
        </h1>

        <p className="text-base sm:text-xl font-medium text-[#b4befe] mb-3 tracking-tight">
          ระบบสร้างฉันทามติเพื่อจัดทริปออฟไซต์และสัมมนาองค์กร
        </p>

        <p className="text-xs sm:text-sm text-[#a6adc8] max-w-lg leading-relaxed mb-10 text-balance">
          ยุติปัญหาถกเถียงเรื่องสถานที่จัดออฟไซต์ในแชทกลุ่ม ให้ทุกคนในทีมปัดเลือกสถานที่พร้อมกันแบบเรียลไทม์ หาข้อสรุปได้ใน 3 นาที พร้อมปิดยอดจองสร้างรายได้คอมมิชชั่น B2B
        </p>

        {/* Error notification banner */}
        {(error || joinError) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs sm:text-sm w-full max-w-md text-center backdrop-blur-md shadow-lg"
          >
            {error || joinError}
          </motion.div>
        )}

        {/* The Double-Bezel Main Action Enclosure (Catppuccin Surface Architecture) */}
        <div className="w-full max-w-md p-2 rounded-[2.25rem] bg-[#181825]/70 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(17,17,27,0.85)]">
          <div className="rounded-[1.75rem] p-6 bg-[#1e1e2e]/95 border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)] flex flex-col gap-4">
            {/* Re-enter Previous Session Pill */}
            {cachedRoomId && (
              <button
                onClick={onReenterSession}
                disabled={loading}
                className="group w-full py-3 px-5 rounded-full bg-[#313244]/50 hover:bg-[#313244] border border-[#45475a]/70 hover:border-[#a6e3a1]/40 text-[#a6e3a1] text-xs font-semibold transition-all duration-300 ease-spring cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#a6e3a1] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_rgba(166,227,161,0.8)]" />
                  <span>กลับเข้าห้องเดิมของทีม</span>
                </div>
                <span className="font-mono bg-[#a6e3a1]/20 px-2 py-0.5 rounded text-[11px] text-[#a6e3a1]">
                  {cachedRoomId}
                </span>
              </button>
            )}

            {/* Primary Action: Nested Island Button-in-Button (Mauve to Sapphire Gradient) */}
            <button
              onClick={() => onCreateRoom()}
              disabled={loading}
              className="group relative w-full py-3.5 pl-6 pr-3 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#89b4fa] hover:from-[#d5b8ff] hover:to-[#9ac2ff] text-[#11111b] font-bold text-sm transition-all duration-300 ease-spring active:scale-[0.98] shadow-[0_4px_24px_rgba(203,166,247,0.4)] cursor-pointer flex items-center justify-between disabled:opacity-50"
            >
              <span className="tracking-tight">
                {loading ? 'กำลังสร้างห้องทริปใหม่...' : 'สร้างห้องทริปใหม่สำหรับทีม'}
              </span>
              <div className="w-9 h-9 rounded-full bg-[#11111b]/25 text-[#11111b] flex items-center justify-center shrink-0 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-[#313244]" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6c7086]">หรือ เข้าร่วมด้วยรหัส</span>
              <div className="flex-1 h-[1px] bg-[#313244]" />
            </div>

            {/* Join Form with Nested Pill Architecture */}
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={4}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (joinError) setJoinError(null);
                  }}
                  placeholder="รหัส 4 หลัก (เช่น TRIP)"
                  className="w-full py-3 px-4 rounded-full bg-[#181825]/90 border border-[#45475a]/70 text-[#cdd6f4] placeholder-[#6c7086] text-xs font-mono font-medium tracking-widest text-center uppercase focus:outline-none focus:border-[#cba6f7]/70 focus:bg-[#181825] transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 4}
                className="px-6 py-3 rounded-full bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-xs font-semibold transition-all duration-300 ease-spring active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                เข้าห้อง
              </button>
            </form>
          </div>
        </div>

        {/* Asymmetrical Bento Value Pills (Catppuccin Accent Harmony) */}
        <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          <div className="p-3.5 rounded-2xl bg-[#181825]/60 border border-[#313244]/70 backdrop-blur-md text-left flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#cba6f7] font-semibold uppercase tracking-wider">
              01 // SPEED
            </span>
            <p className="text-xs font-medium text-[#cdd6f4] mt-1">
              หาฉันทามติใน 3 นาที
            </p>
            <span className="text-[11px] text-[#a6adc8] mt-0.5 tabular-data">
              ตัดสินใจไวกว่าแชท 6 เท่า
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825]/60 border border-[#313244]/70 backdrop-blur-md text-left flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#74c7ec] font-semibold uppercase tracking-wider">
              02 // CONNECTIVITY
            </span>
            <p className="text-xs font-medium text-[#cdd6f4] mt-1">
              เน็ต Starlink 500+ Mbps
            </p>
            <span className="text-[11px] text-[#a6adc8] mt-0.5">
              รองรับงานเทคและสัมมนา MICE
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181825]/60 border border-[#313244]/70 backdrop-blur-md text-left flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#a6e3a1] font-semibold uppercase tracking-wider">
              03 // MONETIZATION
            </span>
            <p className="text-xs font-medium text-[#cdd6f4] mt-1">
              คอมมิชชั่น B2B 10–15%
            </p>
            <span className="text-[11px] text-[#a6adc8] mt-0.5 tabular-data">
              ยอดจองเฉลี่ย 250,000+ บ.
            </span>
          </div>
        </div>

        {/* Business Model Trigger Footer */}
        {onOpenBusinessModel && (
          <button
            onClick={onOpenBusinessModel}
            className="mt-8 text-xs text-[#a6adc8] hover:text-[#cba6f7] font-medium transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>ดูข้อมูลเกณฑ์การแข่งขันและ Business Model Dossier</span>
            <span className="text-[#cba6f7]">→</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
