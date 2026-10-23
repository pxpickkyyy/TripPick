import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoomUser } from '../hooks/useTripPick';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-dvh px-6 py-12"
    >
      <div className="w-full max-w-2xl bg-[#131822] p-8 rounded-2xl">
        {/* Header with Room Code */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              ห้องวางแผนทริปออฟไซต์ที่กำลังใช้งาน
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold tracking-wider text-white tabular-data">{roomId}</span>
              <button
                onClick={handleCopyLink}
                className="py-1 px-3 bg-[#1e2736] hover:bg-[#283448] text-slate-200 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์ชวนทีม'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-medium">
              สมาชิกในห้อง {users.length} คน
            </span>
            <button
              onClick={onLeave}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors duration-150 cursor-pointer"
            >
              ออกจากห้อง
            </button>
          </div>
        </div>

        {error && (
          <div className="my-4 p-4 rounded-xl bg-[#2a151b] text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Team Members Roster */}
        <div className="py-6 border-slate-800 text-left">
          <h3 className="text-xs font-semibold text-slate-300 block mb-3">
            ผู้ร่วมตัดสินใจที่เชื่อมต่อแล้ว ({users.length} ท่าน)
          </h3>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0e121a] text-xs text-white"
              >
                <div className="w-6 h-6 rounded-md bg-[#1e2736] flex items-center justify-center font-bold text-xs text-emerald-400">
                  {u.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-white">{u.user_name}</span>
                  {u.id === currentUser?.id && <span className="text-emerald-400 ml-1">(คุณ)</span>}
                  <span className="text-slate-500 text-xs block">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Retreat Theme / Vibe Selector (Host only) */}
        {isHost ? (
          <div className="py-4 text-left space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
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
                    className={`p-3 rounded-xl text-xs text-left transition-colors duration-150 cursor-pointer ${
                      selectedVibe === vibe && !customVibe
                        ? 'bg-emerald-950 text-emerald-300 font-medium'
                        : 'bg-[#0e121a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Vibe prompt */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                หรือระบุความต้องการเพิ่มเติมให้ AI คัดเลือก:
              </label>
              <input
                type="text"
                value={customVibe}
                onChange={(e) => setCustomVibe(e.target.value)}
                placeholder="เช่น ทีมวิศวกร 15 คน ทำแฮกกาธอน ต้องการเน็ตแรง ติดทะเล มีเชฟส่วนตัว"
                className="w-full py-3 px-4 bg-[#0e121a] rounded-xl text-white text-xs focus:outline-none focus:bg-[#161d2a]"
              />
            </div>

            {/* Budget per head slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  งบประมาณเป้าหมาย (บาท / คน / คืน)
                </span>
                <span className="text-sm font-semibold text-emerald-400 tabular-data">
                  {minBudget.toLocaleString()} – {maxBudget.toLocaleString()} บาท/คน
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">งบต่ำสุด</label>
                  <input
                    type="range"
                    min={2000}
                    max={6000}
                    step={500}
                    value={minBudget}
                    onChange={(e) => setMinBudget(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">งบสูงสุด</label>
                  <input
                    type="range"
                    min={5000}
                    max={15000}
                    step={500}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Start Session CTA */}
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-colors duration-150 cursor-pointer"
            >
              {loading ? (
                <span>ระบบกำลังคัดเลือกสถานที่จัดทริป...</span>
              ) : (
                <span>เริ่มปัดเลือกสถานที่ด้วยระบบฉันทามติ ({users.length} คน)</span>
              )}
            </button>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-block p-4 rounded-xl bg-[#1a2332] text-slate-200 text-sm mb-3">
              กำลังรอหัวหน้าห้อง (Host) เริ่มต้นรอบการปัดเลือกสถานที่...
            </div>
            <p className="text-xs text-slate-400">
              ระบบจะพาเข้าสู่หน้าปัดเลือกสถานที่โดยอัตโนมัติเมื่อหัวหน้าห้องกดเริ่ม
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
