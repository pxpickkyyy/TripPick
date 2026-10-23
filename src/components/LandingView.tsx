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
    if (code.length !== 4) {
      setJoinError('รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดี');
      return;
    }
    await onJoinRoom(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 text-center"
    >
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Wordmark as Monument */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-4">
          TripPick
        </h1>

        <p className="text-lg text-emerald-400 font-medium mb-3">
          ระบบสร้างฉันทามติเพื่อจัดทริปออฟไซต์และสัมมนาองค์กร
        </p>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed mb-10">
          ยุติปัญหาถกเถียงเรื่องสถานที่จัดออฟไซต์ในแชทกลุ่ม ให้ทุกคนในทีมปัดเลือกสถานที่พร้อมกันแบบเรียลไทม์ หาข้อสรุปได้ใน 3 นาที พร้อมปิดยอดจองสร้างรายได้คอมมิชชั่น B2B
        </p>

        {/* Errors */}
        {(error || joinError) && (
          <div className="mb-6 p-4 rounded-xl bg-[#2a151b] text-rose-300 text-sm w-full text-center">
            {error || joinError}
          </div>
        )}

        {/* Actions Container */}
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* Re-enter Previous Session */}
          {cachedRoomId && (
            <button
              onClick={onReenterSession}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#18212e] hover:bg-[#202c3d] text-emerald-300 text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>กลับเข้าห้องเดิมของทีม: {cachedRoomId}</span>
            </button>
          )}

          {/* Primary Create Room CTA */}
          <button
            onClick={() => onCreateRoom()}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-base font-semibold transition-colors duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>กำลังสร้างห้องทริปใหม่...</span>
            ) : (
              <span>สร้างห้องทริปใหม่สำหรับทีม</span>
            )}
          </button>

          {/* Join Existing Room Form */}
          <form onSubmit={handleJoinSubmit} className="flex gap-2 mt-2">
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (joinError) setJoinError(null);
              }}
              placeholder="รหัสห้อง 4 หลัก (เช่น TRIP)"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#141a24] text-white text-sm font-semibold tracking-wider placeholder:text-slate-500 focus:outline-none focus:bg-[#1a2230]"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="py-3 px-6 rounded-xl bg-[#202937] hover:bg-[#2a3649] text-white text-sm font-medium transition-colors duration-150 disabled:opacity-40 cursor-pointer"
            >
              เข้าร่วม
            </button>
          </form>

          {/* Real Metrics - Set with Tabular Numbers */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-[#121720]">
              <span className="block text-xs text-slate-400 mb-1">ยอดจองเฉลี่ย</span>
              <span className="text-base font-semibold text-white tabular-data">250,000+ บ.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121720]">
              <span className="block text-xs text-slate-400 mb-1">คอมมิชชั่น B2B</span>
              <span className="text-base font-semibold text-emerald-400 tabular-data">10% – 15%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121720]">
              <span className="block text-xs text-slate-400 mb-1">เวลาตัดสินใจ</span>
              <span className="text-base font-semibold text-slate-200 tabular-data">&lt; 3 นาที</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
