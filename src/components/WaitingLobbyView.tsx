import React, { useState, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
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
    categoryFilter?: string,
    discoveryMode?: 'rapid' | 'infinite'
  ) => Promise<boolean>;
  onLeave: () => void;
  loading: boolean;
  error: string | null;
  onSimulateTeammates?: (target?: number) => void;
  onRemoveSimulatedTeammates?: () => void;
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
  onSimulateTeammates,
  onRemoveSimulatedTeammates,
}: WaitingLobbyViewProps) {
  const { language, t } = useLanguage();
  const vibesList = language === 'en' ? RETREAT_VIBES_EN : RETREAT_VIBES_TH;

  const [copied, setCopied] = useState(false);
  const [selectedVibeIndex, setSelectedVibeIndex] = useState(0);
  const [customVibe, setCustomVibe] = useState('');
  const [minBudget, setMinBudget] = useState(3000);
  const [maxBudget, setMaxBudget] = useState(8000);
  const [discoveryMode, setDiscoveryMode] = useState<'rapid' | 'infinite'>('rapid');

  const cardRef = useRef<HTMLDivElement | null>(null);
  const spotX = useMotionValue(320);
  const spotY = useMotionValue(220);
  const spotOpacity = useMotionValue(0);

  const specularOverlay = useMotionTemplate`radial-gradient(460px circle at ${spotX}px ${spotY}px, rgba(203, 166, 247, 0.14), rgba(250, 179, 135, 0.06) 45%, transparent 82%)`;
  const specularBorder = useMotionTemplate`radial-gradient(320px circle at ${spotX}px ${spotY}px, rgba(203, 166, 247, 0.55), rgba(250, 179, 135, 0.25) 50%, rgba(205, 214, 244, 0.08) 100%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
    spotOpacity.set(1);
  };

  const handlePointerLeave = () => {
    spotOpacity.set(0);
  };

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
    await onStartSession(activeVibe, minBudget, maxBudget, undefined, discoveryMode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-6 sm:py-10 relative z-20"
    >
      {/* Double-Bezel (Doppelrand) Quorum Lounge Enclosure */}
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ backgroundImage: specularBorder }}
        className="w-full max-w-2xl p-[1px] rounded-[2rem] bg-[#313244] shadow-[0_28px_80px_-16px_rgba(17,17,27,0.85)]"
      >
        <div className="rounded-[calc(2rem-1px)] p-2 bg-[#181825]">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] p-5 sm:p-7 bg-[#1e1e2e] border border-[#313244] shadow-[inset_0_1px_0_rgba(205,214,244,0.08)]">
            <motion.div
              aria-hidden="true"
              style={{ background: specularOverlay, opacity: spotOpacity }}
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            />

            {/* Header with Room Code Hero */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#313244]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                  <span className="text-[10px] uppercase font-mono tracking-[0.16em] text-[#cba6f7] font-semibold">
                    {t.lobbyEyebrow}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-[0.18em] text-[#cdd6f4] font-mono tabular-data">
                    {roomId}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#cba6f7]/50 text-[#cdd6f4] rounded-full text-xs font-medium transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    <span>{copied ? t.copiedText : t.copyInviteBtn}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 text-[#a6e3a1] text-[10px] font-mono tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                  <span>{t.zeroLatencyBadge}</span>
                </div>
                <span className="text-xs text-[#cdd6f4] font-semibold px-2.5 py-0.5 rounded-full bg-[#181825] border border-[#313244] font-mono tabular-data flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
                  <span>{users.length} / 20 ONLINE</span>
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
              <div className="relative z-10 my-4 p-3.5 rounded-2xl bg-[#f38ba8]/15 border border-[#f38ba8]/40 text-[#f38ba8] text-xs font-medium">
                {error}
              </div>
            )}

            {/* Team Members Roster */}
            <div className="relative z-10 py-4 border-b border-[#313244] text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-semibold text-[#a6adc8] font-mono uppercase tracking-[0.16em]">
                    {t.membersTitle} ({users.length} / 20)
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-[#cba6f7]">
                    {language === 'th' ? 'รองรับ 20 คน' : 'Up to 20 Pax'}
                  </span>
                </div>
                <span className="text-[10px] text-[#cba6f7] font-mono tracking-wider">{t.b2bConsensus}</span>
              </div>

              {/* Visual Capacity Meter */}
              <div className="w-full h-1.5 rounded-full bg-[#181825] border border-[#313244]/80 overflow-hidden mb-3.5">
                <div
                  className="h-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#a6e3a1] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, (users.length / 20) * 100))}%` }}
                />
              </div>

              {/* Responsive Team Grid Supporting Up to 20 Members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#cba6f7]/15 border-[#cba6f7]/60 text-[#cdd6f4]'
                          : 'bg-[#181825] border-[#313244] text-[#cdd6f4]'
                      }`}
                    >
                      <div className="relative w-7 h-7 rounded-lg bg-[#1e1e2e] border border-[#313244] flex items-center justify-center font-mono font-bold text-xs text-[#cba6f7] shrink-0">
                        {u.user_name.charAt(0).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#a6e3a1] ring-1 ring-[#181825]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-xs text-[#cdd6f4] truncate">{u.user_name}</span>
                          {isCurrent && (
                            <span className="text-[8px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-[#cba6f7]/25 border border-[#cba6f7]/50 text-[#cdd6f4] font-semibold shrink-0">
                              YOU
                            </span>
                          )}
                          {u.isHost && (
                            <span className="text-[8px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-[#fab387]/20 border border-[#fab387]/40 text-[#fab387] font-semibold shrink-0">
                              HOST
                            </span>
                          )}
                        </div>
                        <span className="text-[#a6adc8] text-[10px] block truncate">{u.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Host Demo Tool: Add / Simulate Teammates to test 20 pax */}
              {isHost && onSimulateTeammates && (
                <div className="mt-3 pt-3 border-t border-[#313244]/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#a6adc8]">
                    {language === 'th' ? '⚡ ทดสอบระบบทีมขนาดใหญ่:' : '⚡ Test Large Team Radar:'}
                  </span>
                  <div className="flex items-center gap-2">
                    {users.length < 20 && (
                      <button
                        type="button"
                        onClick={() => onSimulateTeammates(Math.min(20, users.length + 5))}
                        className="py-1 px-3 bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#cba6f7]/50 text-[#cdd6f4] rounded-full text-[10px] font-mono transition-all cursor-pointer"
                      >
                        +5 {language === 'th' ? 'คน' : 'Pax'}
                      </button>
                    )}
                    {users.length < 20 && (
                      <button
                        type="button"
                        onClick={() => onSimulateTeammates(20)}
                        className="py-1 px-3 bg-[#cba6f7]/15 hover:bg-[#cba6f7]/25 border border-[#cba6f7]/40 text-[#cba6f7] rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer"
                      >
                        {language === 'th' ? 'เติมให้ครบ 20 คน (Fill 20)' : 'Fill to 20 Pax'}
                      </button>
                    )}
                    {users.some(u => u.isSimulated) && onRemoveSimulatedTeammates && (
                      <button
                        type="button"
                        onClick={onRemoveSimulatedTeammates}
                        className="py-1 px-3 bg-[#181825] hover:bg-[#f38ba8]/20 border border-[#313244] hover:border-[#f38ba8]/50 text-[#f38ba8] rounded-full text-[10px] font-mono transition-all cursor-pointer"
                      >
                        {language === 'th' ? 'ล้างทีมจำลอง' : 'Clear Demo'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Host Controls */}
            {isHost ? (
              <div className="relative z-10 pt-4 text-left space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2 font-mono uppercase tracking-[0.16em]">
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
                          className={`p-3 rounded-2xl text-xs text-left transition-all cursor-pointer border active:scale-[0.98] ${
                            isSelected
                              ? 'bg-[#cba6f7]/15 border-[#cba6f7] text-[#cdd6f4] font-semibold'
                              : 'bg-[#181825] border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] hover:border-[#45475a]'
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
                  <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2 font-mono uppercase tracking-[0.16em]">
                    {language === 'th' ? 'หรือระบุความต้องการเพิ่มเติมให้ AI คัดเลือก:' : 'Or enter custom retreat theme for AI synthesis:'}
                  </label>
                  <input
                    type="text"
                    value={customVibe}
                    onChange={(e) => setCustomVibe(e.target.value)}
                    placeholder={t.vibeCustomPlaceholder}
                    className="w-full py-3 px-4 rounded-2xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder-[#6c7086] text-xs focus:outline-none focus:border-[#cba6f7] transition-all"
                  />
                </div>

                {/* Budget Slider */}
                <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-semibold text-[#a6adc8] font-mono uppercase tracking-[0.16em]">
                      {t.budgetLabel}
                    </span>
                    <span className="text-xs font-bold text-[#fab387] tabular-data font-mono bg-[#fab387]/15 px-2.5 py-0.5 rounded-full border border-[#fab387]/30">
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

                {/* Discovery Mode Switcher: Rapid Consensus vs Infinite Discovery */}
                <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244]">
                  <label className="text-[10px] font-semibold text-[#a6adc8] block mb-2.5 font-mono uppercase tracking-[0.16em]">
                    {t.modeLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDiscoveryMode('rapid')}
                      data-testid="mode-rapid-btn"
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        discoveryMode === 'rapid'
                          ? 'bg-[#a6e3a1]/15 border-[#a6e3a1]'
                          : 'bg-[#1e1e2e] border-[#313244] hover:border-[#45475a]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${discoveryMode === 'rapid' ? 'text-[#a6e3a1]' : 'text-[#cdd6f4]'}`}>
                          {t.rapidConsensusMode}
                        </span>
                        {discoveryMode === 'rapid' && (
                          <span className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#a6adc8] leading-relaxed">
                        {t.rapidConsensusDesc}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscoveryMode('infinite')}
                      data-testid="mode-infinite-btn"
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        discoveryMode === 'infinite'
                          ? 'bg-[#cba6f7]/18 border-[#cba6f7] shadow-[0_0_24px_rgba(203,166,247,0.22)]'
                          : 'bg-[#1e1e2e] border-[#313244] hover:border-[#45475a]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${discoveryMode === 'infinite' ? 'text-[#cba6f7]' : 'text-[#cdd6f4]'}`}>
                          {t.infiniteDiscoveryMode}
                        </span>
                        {discoveryMode === 'infinite' && (
                          <span className="w-2 h-2 rounded-full bg-[#cba6f7] animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#a6adc8] leading-relaxed">
                        {t.infiniteDiscoveryDesc}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Start Session CTA (Button-in-Button Architecture) */}
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="group w-full py-4 pl-6 pr-3.5 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#fab387] text-[#11111b] font-extrabold text-sm shadow-[0_12px_32px_rgba(203,166,247,0.3)] hover:shadow-[0_16px_40px_rgba(203,166,247,0.45)] transition-all duration-300 cursor-pointer flex items-center justify-between active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="tracking-tight">
                    {loading ? (
                      t.startingSessionBtn
                    ) : (
                      `${t.startSessionBtn} (${users.length} / 20 ${language === 'th' ? 'คน' : 'pax'})`
                    )}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#11111b] text-[#cba6f7] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative z-10 py-8 text-center">
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
    </motion.div>
  );
}
