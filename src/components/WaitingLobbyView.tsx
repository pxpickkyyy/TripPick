import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoomUser } from '../hooks/useTripPick';
import { FIXED_AI_MODEL_NAME } from '../lib/ai';

interface WaitingLobbyViewProps {
  roomId: string;
  users: RoomUser[];
  currentUser: RoomUser | null;
  isHost: boolean;
  onStartSession: (
    vibe: string,
    minBudget?: number,
    maxBudget?: number,
    categoryFilter?: string
  ) => Promise<boolean>;
  onLeave: () => void;
  loading: boolean;
  error: string | null;
}

const RETREAT_VIBES = [
  'สัมมนาวางแผนกลยุทธ์ผู้บริหาร (Executive Summit)',
  'ทำงานและพักผ่อนริมทะเล (Beachfront Workation)',
  'ฟื้นฟูสุขภาพ & ชาร์จพลังทีม (Eco & Wellness)',
  'ผจญภัยกระชับมิตรความสามัคคี (Team Adventure)',
  'สปรินต์ระดมสมองสายเทค & ดีไซน์ (Design Sprint)',
  'จัดประชุม MICE หรู & งานกาล่า (MICE Gala)'
];

export function WaitingLobbyView({
  roomId,
  users,
  currentUser,
  isHost,
  onStartSession,
  onLeave,
  loading,
  error,
}: WaitingLobbyViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(RETREAT_VIBES[0]);
  const [customVibe, setCustomVibe] = useState('');
  const [minBudget, setMinBudget] = useState(3000);
  const [maxBudget, setMaxBudget] = useState(8000);

  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    const activeVibe = customVibe.trim() ? customVibe : selectedVibe;
    await onStartSession(activeVibe, minBudget, maxBudget);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 relative z-10"
    >
      <div className="w-full max-w-2xl glass-panel p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
        {/* Header with Room Code */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="text-left">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              ห้องวางแผนทริปออฟไซต์ที่กำลังใช้งาน
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black font-mono tracking-widest text-white">{roomId}</span>
              <button
                onClick={handleCopyLink}
                className="py-1 px-3 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copied ? '✓ คัดลอกลิงก์แล้ว' : '📋 คัดลอกลิงก์ชวนทีม'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              สมาชิกในห้อง {users.length} คน
            </span>
            <button
              onClick={onLeave}
              className="py-1 px-2.5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors text-xs font-mono cursor-pointer"
            >
              ออกจากห้อง
            </button>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Team Members Roster */}
        <div className="py-6 border-b border-slate-800 text-left">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
            ผู้ร่วมตัดสินใจที่เชื่อมต่อแล้ว ({users.length} ท่าน)
          </h3>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-white"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-[10px]">
                  {u.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-white">{u.user_name}</span>
                  {u.id === currentUser?.id && <span className="text-cyan-400 ml-1">(คุณ)</span>}
                  <span className="text-slate-500 text-[10px] block">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed AI Engine Badge (DeepSeek V4.1 Flash 1017) */}
        <div className="py-3 px-4 my-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                ระบบปัญญาประดิษฐ์ประมวลผล
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {FIXED_AI_MODEL_NAME}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
            เปิดใช้งานอยู่
          </span>
        </div>

        {/* Retreat Theme / Vibe Selector (Host only) */}
        {isHost ? (
          <div className="py-4 text-left space-y-5">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
                เลือกธีมทริป / บรรยากาศออฟไซต์
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RETREAT_VIBES.map((vibe) => (
                  <button
                    type="button"
                    key={vibe}
                    onClick={() => {
                      setSelectedVibe(vibe);
                      setCustomVibe('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono text-left transition-all cursor-pointer border ${
                      selectedVibe === vibe && !customVibe
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ✦ {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Vibe prompt */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                หรือระบุความต้องการเพิ่มเติมให้ AI คัดเลือก:
              </label>
              <input
                type="text"
                value={customVibe}
                onChange={(e) => setCustomVibe(e.target.value)}
                placeholder="เช่น ทีมวิศวกร 15 คน ทำแฮกกาธอน ต้องการเน็ตแรง ติดทะเล มีเชฟส่วนตัว"
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Budget per head slider */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                  งบประมาณเป้าหมาย (บาท / คน / คืน)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {minBudget.toLocaleString()} – {maxBudget.toLocaleString()} บาท/คน
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block">งบต่ำสุด</label>
                  <input
                    type="range"
                    min={2000}
                    max={6000}
                    step={500}
                    value={minBudget}
                    onChange={(e) => setMinBudget(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block">งบสูงสุด</label>
                  <input
                    type="range"
                    min={5000}
                    max={15000}
                    step={500}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Start Session CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs font-mono tracking-widest uppercase shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>DeepSeek กำลังคัดเลือกสถานที่จัดทริป...</span>
              ) : (
                <>
                  <span>🚀</span>
                  <span>เริ่มปัดเลือกสถานที่ด้วยระบบฉันทามติ ({users.length} คน)</span>
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-block p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 mb-3 animate-pulse">
              ⏳ กำลังรอหัวหน้าห้อง (Host) เริ่มต้นรอบการปัดเลือกสถานที่...
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ระบบจะพาเข้าสู่หน้าปัดเลือกสถานที่โดยอัตโนมัติเมื่อหัวหน้าห้องกดเริ่ม
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
