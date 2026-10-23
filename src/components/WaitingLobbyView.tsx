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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-10 sm:py-16 relative z-20"
    >
      {/* The Double-Bezel Enclosure (Catppuccin Mocha) */}
      <div className="w-full max-w-2xl p-2 sm:p-2.5 rounded-[2.25rem] bg-[#181825]/70 ring-1 ring-[#cba6f7]/20 border border-[#313244]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(17,17,27,0.85)]">
        <div className="rounded-[1.75rem] p-6 sm:p-8 bg-[#1e1e2e]/95 border border-[#313244]/80 shadow-[inset_0_1px_1px_rgba(203,166,247,0.15)]">
          {/* Header with Room Code Hero */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#313244]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#cba6f7] font-semibold">
                  ACTIVE WAR ROOM // LIVE RADAR
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-[#cdd6f4] font-mono tabular-data">
                  {roomId}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="group flex items-center gap-1.5 py-1.5 px-3.5 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] rounded-full text-xs font-medium transition-all duration-300 ease-spring cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>{copied ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์ชวนทีม'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#a6e3a1] font-semibold px-3 py-1 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 font-mono">
                {users.length} ONLINE
              </span>
              <button
                onClick={onLeave}
                className="text-xs text-[#a6adc8] hover:text-[#f38ba8] transition-colors duration-200 cursor-pointer font-medium px-2 py-1"
              >
                ออกจากห้อง
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-4 p-4 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs sm:text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Team Members Roster */}
          <div className="py-6 border-b border-[#313244] text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#bac2de] font-mono uppercase tracking-wider text-[11px]">
                ผู้ร่วมตัดสินใจที่เชื่อมต่อแล้ว ({users.length} ท่าน)
              </h3>
              <span className="text-[10px] text-[#6c7086] font-mono">REAL-TIME CONSENSUS</span>
            </div>
            <div className="flex flex-wrap gap-2.5 max-h-56 overflow-y-auto pr-1">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#cba6f7]/15 border-[#cba6f7]/40 text-[#cdd6f4] shadow-[0_0_15px_rgba(203,166,247,0.15)]'
                        : 'bg-[#181825]/80 border-[#313244] text-[#cdd6f4]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#cba6f7]/25 to-[#b4befe]/25 border border-[#cba6f7]/40 flex items-center justify-center font-bold text-xs text-[#cba6f7] shrink-0">
                      {u.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#cdd6f4]">{u.user_name}</span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-[#cba6f7]/25 text-[#cba6f7] font-semibold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[#a6adc8] text-[11px] block">{u.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Controls */}
          {isHost ? (
            <div className="pt-6 text-left space-y-6">
              <div>
                <label className="text-xs font-semibold text-[#bac2de] block mb-2 font-mono uppercase tracking-wider text-[11px]">
                  เลือกธีมทริป / บรรยากาศออฟไซต์
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RETREAT_VIBES.map((vibe) => {
                    const isSelected = selectedVibe === vibe && !customVibe;
                    return (
                      <button
                        type="button"
                        key={vibe}
                        onClick={() => {
                          setSelectedVibe(vibe);
                          setCustomVibe('');
                        }}
                        className={`p-3 rounded-xl text-xs text-left transition-all duration-300 ease-spring cursor-pointer border ${
                          isSelected
                            ? 'bg-[#cba6f7]/20 border-[#cba6f7]/50 text-[#cba6f7] shadow-[0_0_15px_rgba(203,166,247,0.15)] font-semibold'
                            : 'bg-[#181825]/60 border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
                        }`}
                      >
                        {vibe}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Vibe prompt */}
              <div>
                <label className="text-xs font-semibold text-[#bac2de] block mb-2 font-mono uppercase tracking-wider text-[11px]">
                  หรือระบุความต้องการเพิ่มเติมให้ AI คัดเลือก:
                </label>
                <input
                  type="text"
                  value={customVibe}
                  onChange={(e) => setCustomVibe(e.target.value)}
                  placeholder="เช่น ทีมวิศวกร 15 คน ทำแฮกกาธอน ต้องการเน็ตแรง ติดทะเล มีเชฟส่วนตัว"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#181825]/90 border border-[#45475a]/70 text-[#cdd6f4] placeholder-[#6c7086] text-xs focus:outline-none focus:border-[#cba6f7]/70 focus:bg-[#181825] transition-all duration-300"
                />
              </div>

              {/* Budget Slider */}
              <div className="p-4 rounded-2xl bg-[#181825]/60 border border-[#313244]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-[#bac2de] font-mono uppercase tracking-wider text-[11px]">
                    งบประมาณเป้าหมาย (บาท / คน / คืน)
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#a6e3a1] tabular-data font-mono bg-[#a6e3a1]/15 px-2.5 py-1 rounded-full border border-[#a6e3a1]/30">
                    ฿{minBudget.toLocaleString()} – ฿{maxBudget.toLocaleString()} / คน
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#a6adc8] block mb-1 font-mono">งบต่ำสุด</label>
                    <input
                      type="range"
                      min={2000}
                      max={6000}
                      step={500}
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full accent-[#cba6f7] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#a6adc8] block mb-1 font-mono">งบสูงสุด</label>
                    <input
                      type="range"
                      min={5000}
                      max={15000}
                      step={500}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full accent-[#cba6f7] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Start Session CTA: Button-in-Button */}
              <button
                onClick={handleStart}
                disabled={loading}
                className="group relative w-full py-3.5 pl-6 pr-3 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#89b4fa] hover:from-[#d5b8ff] hover:to-[#9ac2ff] text-[#11111b] font-bold text-sm transition-all duration-300 ease-spring active:scale-[0.98] shadow-[0_4px_24px_rgba(203,166,247,0.4)] cursor-pointer flex items-center justify-between disabled:opacity-50"
              >
                <span className="tracking-tight">
                  {loading ? (
                    'ระบบกำลังคัดเลือกสถานที่จัดทริป...'
                  ) : (
                    `เริ่มปัดเลือกสถานที่ด้วยระบบฉันทามติ (${users.length} คน)`
                  )}
                </span>
                <div className="w-9 h-9 rounded-full bg-[#11111b]/25 text-[#11111b] flex items-center justify-center shrink-0 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 p-4 rounded-2xl bg-[#181825]/80 border border-[#313244] text-[#cdd6f4] text-xs sm:text-sm mb-3">
                <span className="w-2 h-2 rounded-full bg-[#cba6f7] animate-ping" />
                <span>กำลังรอหัวหน้าห้อง (Host) เริ่มต้นรอบการปัดเลือกสถานที่...</span>
              </div>
              <p className="text-xs text-[#a6adc8]">
                ระบบจะพาเข้าสู่หน้าปัดเลือกสถานที่โดยอัตโนมัติเมื่อหัวหน้าห้องกดเริ่ม
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
