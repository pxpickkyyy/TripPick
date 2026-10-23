import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoomUser } from '../hooks/useTripPick';
import { useLanguage, RETREAT_VIBES_TH, RETREAT_VIBES_EN } from '../lib/i18n';

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
  const { language, t } = useLanguage();
  const vibesList = language === 'en' ? RETREAT_VIBES_EN : RETREAT_VIBES_TH;

  const [copied, setCopied] = useState(false);
  const [selectedVibeIndex, setSelectedVibeIndex] = useState(0);
  const [customVibe, setCustomVibe] = useState('');
  const [minBudget, setMinBudget] = useState(3000);
  const [maxBudget, setMaxBudget] = useState(8000);

  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    const activeVibe = customVibe.trim() ? customVibe : (vibesList[selectedVibeIndex] || vibesList[0]);
    await onStartSession(activeVibe, minBudget, maxBudget);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-6 sm:py-10 relative z-20"
    >
      {/* Ambient Radial Glowing Mesh */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#cba6f7]/10 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#74c7ec]/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Double-Bezel Enclosure (Low-End Optimized Solid Surfaces) */}
      <div className="w-full max-w-2xl p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-2xl">
        <div className="rounded-[calc(2rem-0.5rem)] p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244]">
          {/* Header with Room Code Hero */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#313244]">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#cba6f7] font-semibold">
                  {t.lobbyEyebrow}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold tracking-widest text-[#cdd6f4] font-mono tabular-data">
                  {roomId}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 py-1 px-3 bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] rounded-lg text-xs font-medium transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>{copied ? t.copiedText : t.copyInviteBtn}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181825] border border-[#a6e3a1]/30 text-[#a6e3a1] text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                <span>{t.zeroLatencyBadge}</span>
              </div>
              <span className="text-xs text-[#a6e3a1] font-semibold px-2.5 py-0.5 rounded bg-[#313244] border border-[#45475a] font-mono">
                {users.length} ONLINE
              </span>
              <button
                onClick={onLeave}
                className="text-xs text-[#a6adc8] hover:text-[#f38ba8] transition-colors cursor-pointer font-medium px-2 py-1"
              >
                {t.leaveRoomBtn}
              </button>
            </div>
          </div>

          {error && (
            <div className="my-4 p-3 rounded-xl bg-[#f38ba8]/15 border border-[#f38ba8]/30 text-[#f38ba8] text-xs">
              {error}
            </div>
          )}

          {/* Team Members Roster */}
          <div className="py-4 border-b border-[#313244] text-left">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold text-[#bac2de] font-mono uppercase tracking-wider text-[11px]">
                {t.membersTitle} ({users.length})
              </h3>
              <span className="text-[10px] text-[#6c7086] font-mono">{t.b2bConsensus}</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
                      isCurrent
                        ? 'bg-[#313244] border-[#cba6f7]/60 text-[#cdd6f4]'
                        : 'bg-[#181825] border-[#313244] text-[#cdd6f4]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-[#11111b] border border-[#313244] flex items-center justify-center font-bold text-[11px] text-[#cba6f7] shrink-0">
                      {u.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-[#cdd6f4]">{u.user_name}</span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[#cba6f7]/20 text-[#cba6f7] font-semibold">
                            YOU
                          </span>
                        )}
                        {u.isHost && (
                          <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-semibold">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[#a6adc8] text-[10px] block">{u.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Controls */}
          {isHost ? (
            <div className="pt-4 text-left space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                  {t.vibeLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vibesList.map((vibe, idx) => {
                    const isSelected = selectedVibeIndex === idx && !customVibe;
                    return (
                      <button
                        type="button"
                        key={vibe}
                        onClick={() => {
                          setSelectedVibeIndex(idx);
                          setCustomVibe('');
                        }}
                        className={`p-2.5 rounded-xl text-xs text-left transition-colors cursor-pointer border active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#313244] border-[#cba6f7] text-[#cba6f7] font-semibold'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
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
                <label className="text-xs font-semibold text-[#bac2de] block mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                  {language === 'th' ? 'หรือระบุความต้องการเพิ่มเติมให้ AI คัดเลือก:' : 'Or enter custom retreat theme for AI synthesis:'}
                </label>
                <input
                  type="text"
                  value={customVibe}
                  onChange={(e) => setCustomVibe(e.target.value)}
                  placeholder={t.vibeCustomPlaceholder}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs focus:outline-none focus:border-[#cba6f7] transition-colors"
                />
              </div>

              {/* Budget Slider */}
              <div className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-[#bac2de] font-mono uppercase tracking-wider text-[11px]">
                    {t.budgetLabel}
                  </span>
                  <span className="text-xs font-bold text-[#a6e3a1] tabular-data font-mono bg-[#313244] px-2 py-0.5 rounded border border-[#45475a]">
                    ฿{minBudget.toLocaleString()} – ฿{maxBudget.toLocaleString()} {language === 'th' ? '/ คน' : '/ person'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'th' ? 'งบต่ำสุด' : 'Min Budget'}</label>
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
                    <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'th' ? 'งบสูงสุด' : 'Max Budget'}</label>
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

              {/* Start Session CTA (Nested Island Button Architecture) */}
              <button
                onClick={handleStart}
                disabled={loading}
                className="group w-full py-4 px-6 rounded-full bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-extrabold text-sm shadow-lg hover:shadow-[#cba6f7]/25 transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.98] disabled:opacity-50"
              >
                <span className="tracking-tight">
                  {loading ? (
                    t.startingSessionBtn
                  ) : (
                    `${t.startSessionBtn} (${users.length} ${language === 'th' ? 'คน' : 'pax'})`
                  )}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#11111b]/15 text-[#11111b] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#181825] border border-[#313244] text-[#cdd6f4] text-xs mb-2.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-pulse" />
                <span>{t.waitingForHost}</span>
              </div>
              <p className="text-[11px] text-[#a6adc8]">
                {t.consensusRule}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
