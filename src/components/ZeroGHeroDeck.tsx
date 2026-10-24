import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '../lib/i18n';
import { CURATED_DESTINATIONS } from '../lib/travelDestinations';

interface ZeroGHeroDeckProps {
  onCreateRoom: () => Promise<boolean> | void;
  onJoinRoom: (code: string) => Promise<boolean> | void;
  onReenterSession?: () => Promise<boolean> | void;
  loading?: boolean;
  error?: string | null;
}

const FEATURED_VENUES = CURATED_DESTINATIONS.slice(0, 4);

export const ZeroGHeroDeck: React.FC<ZeroGHeroDeckProps> = ({
  onCreateRoom,
  onJoinRoom,
  onReenterSession,
  loading = false,
  error = null,
}) => {
  const { language, t, localizeDestination } = useLanguage();
  const [joinCode, setJoinCode] = useState('');
  const [activeVenueIdx, setActiveVenueIdx] = useState(0);
  const [savedSessionRoom] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('trippick_room_id');
      return saved && saved.length === 4 ? saved : null;
    } catch {
      return null;
    }
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const rawVenue = FEATURED_VENUES[activeVenueIdx] || FEATURED_VENUES[0];
  const activeVenue = { ...rawVenue, ...localizeDestination(rawVenue) };

  // Hardware-accelerated 3D Spatial Tilt for the Consensus Studio Card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 24, mass: 0.7 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, 85]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, 85]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = joinCode.trim().toUpperCase();
    if (cleaned.length >= 4) {
      onJoinRoom(cleaned);
    }
  };

  return (
    <section
      aria-label="Executive Offsite Curation Studio"
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pt-2"
    >
      {/* Left 7 Columns: Awwwards Editorial Headline + Interactive Sanctuary Preview */}
      <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left min-w-0">
        {/* Eyebrow Pill with Double-Bezel treatment */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181825] border border-[#313244] max-w-full"
        >
          <span className="w-2 h-2 rounded-full bg-[#a6e3a1] shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#cba6f7] font-semibold truncate">
            {t.landingEyebrow}
          </span>
        </motion.div>

        {/* Editorial Headline — strictly 2 lines across 390px, 768px, and 1440px */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.32, 0.72, 0, 1] }}
          className="space-y-3.5"
        >
          <h1
            className="font-display font-extrabold tracking-[-0.03em] leading-[1.06] text-[#cdd6f4] break-words"
            style={{
              fontSize:
                language === 'th'
                  ? 'clamp(1.5rem, 4.2vw + 0.35rem, 3.75rem)'
                  : 'clamp(1.6rem, 4.4vw + 0.35rem, 4.15rem)',
            }}
          >
            {language === 'th' ? (
              <>
                คัดสรรรีสอร์ตผู้บริหาร
                <span className="block text-[#f5e0dc] mt-1">
                  ด้วยฉันทามติที่ไร้รอยต่อ
                </span>
              </>
            ) : (
              <>
                Where leadership teams{' '}
                <span className="font-editorial italic font-normal text-[#f5e0dc]">
                  converge
                </span>
                <span className="block mt-1 text-[#cba6f7]">
                  on iconic sanctuaries.
                </span>
              </>
            )}
          </h1>

          <p className="text-base text-[#bac2de] max-w-[58ch] leading-relaxed font-normal">
            {t.landingDesc}
          </p>
        </motion.div>

        {/* Interactive Live Sanctuary Switcher ("The Place Carries It" — Real Photography + Verified Telemetry) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.14, ease: [0.32, 0.72, 0, 1] }}
          className="p-2 rounded-[28px] bg-[#181825] border border-[#313244]"
        >
          <div className="rounded-[22px] bg-[#1e1e2e] border border-[#313244]/80 overflow-hidden">
            {/* Destination Photography Stage */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#11111b]">
              <img
                src={activeVenue.hero_image}
                alt={activeVenue.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11111b] via-[#11111b]/35 to-transparent" />

              {/* Top Overlay Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11111b]/90 border border-[#313244] text-xs font-medium text-[#cdd6f4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fab387]" />
                  <span>
                    {activeVenue.city}, {activeVenue.country}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11111b]/90 border border-[#a6e3a1]/40 text-xs font-mono text-[#a6e3a1]">
                  <span>WiFi {activeVenue.wifi_speed_mbps} Mbps SLA</span>
                </div>
              </div>

              {/* Bottom Caption inside Photo */}
              <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-mono text-[#fab387] flex items-center gap-1">
                    <span>{activeVenue.category}</span>
                    <span>·</span>
                    <svg className="w-3 h-3 fill-current text-[#fab387]" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span>{activeVenue.rating}</span>
                  </span>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-[#cdd6f4] tracking-tight truncate">
                    {activeVenue.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-[#a6adc8] block">
                    {language === 'th' ? 'อัตราองค์กร / คืน' : 'Corporate Rate / Night'}
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-[#f5e0dc] tabular-nums">
                    ฿{activeVenue.price_per_night.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Sanctuary Selector Pills */}
            <div className="p-3 bg-[#181825]/90 border-t border-[#313244]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {FEATURED_VENUES.map((venue, idx) => {
                  const locVenue = localizeDestination(venue);
                  const isSelected = idx === activeVenueIdx;
                  return (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => setActiveVenueIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#cba6f7] text-[#11111b] font-semibold'
                          : 'bg-[#1e1e2e] text-[#a6adc8] hover:text-[#cdd6f4] border border-[#313244]'
                      }`}
                    >
                      {locVenue.city}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-[#a6adc8] font-mono px-1">
                <span>Up to {activeVenue.max_capacity} Pax</span>
                <span className="text-[#a6e3a1]">e-Tax ท.ป. 4/2528</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Editorial Proof Footnote — Single-column mobile collapse, 3-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="py-2.5 px-3.5 rounded-2xl bg-[#181825]/90 border border-[#313244] flex sm:block items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#a6adc8]">
                {language === 'th' ? 'ความเร็วฉันทามติ' : 'Quorum Velocity'}
              </div>
              <div className="text-base sm:text-lg font-display font-bold text-[#cdd6f4] tabular-nums">
                4.2 min
              </div>
            </div>
            <div className="text-xs text-[#a6e3a1]">{t.zeroLatencyBadge}</div>
          </div>

          <div className="py-2.5 px-3.5 rounded-2xl bg-[#181825]/90 border border-[#313244] flex sm:block items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#a6adc8]">
                {language === 'th' ? 'ใบกำกับภาษีไทย' : 'Statutory Tax'}
              </div>
              <div className="text-base sm:text-lg font-display font-bold text-[#cba6f7]">
                VAT 7% · WHT 3%
              </div>
            </div>
            <div className="text-xs text-[#bac2de]">{t.statutoryTaxBadge}</div>
          </div>

          <div className="py-2.5 px-3.5 rounded-2xl bg-[#181825]/90 border border-[#313244] flex sm:block items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#a6adc8]">
                {language === 'th' ? 'การชำระเงินองค์กร' : 'Settlement'}
              </div>
              <div className="text-base sm:text-lg font-display font-bold text-[#fab387]">
                PromptPay QR
              </div>
            </div>
            <div className="text-xs text-[#bac2de]">{t.escrowReadyBadge}</div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: 3D Spatial Double-Bezel Consensus Studio Card */}
      <div
        className="lg:col-span-5 relative min-w-0"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Outer Double-Bezel Container (`Doppelrand` Architecture) */}
        <motion.div
          ref={cardRef}
          data-testid="zero-g-hero-card"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="p-2.5 rounded-[32px] bg-[#181825] border border-[#313244] shadow-[0_32px_70px_-16px_rgba(17,17,27,0.85)] relative transition-colors duration-300 hover:border-[#45475a]"
        >
          {/* Inner Core Card */}
          <div className="rounded-[24px] bg-[#1e1e2e] border border-[#313244] p-6 sm:p-8 relative overflow-hidden shadow-[inset_0_1px_0_rgba(205,214,244,0.08)] text-left">
            {/* Subtle Specular Glare */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-[24px] opacity-30"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]) =>
                    `radial-gradient(420px circle at ${gx}% ${gy}%, rgba(203, 166, 247, 0.14), rgba(250, 179, 135, 0.05) 45%, transparent 75%)`
                ),
              }}
            />

            <div className="relative z-10 space-y-6">
              {/* Studio Header */}
              <div className="flex items-center justify-between border-b border-[#313244] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#313244]/70 border border-[#45475a] flex items-center justify-center text-[#cba6f7] font-display font-bold text-sm">
                    TP
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a6adc8] block">
                      Consensus Studio
                    </span>
                    <h3 className="text-lg font-display font-bold text-[#cdd6f4]">
                      {language === 'th' ? 'เริ่มต้นหรือเข้าร่วมเซสชัน' : 'Launch Retreat Quorum'}
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 text-[#a6e3a1] text-[10px] font-mono uppercase tracking-wider font-semibold">
                  {language === 'th' ? 'พร้อมใช้งาน' : 'LIVE SYNC'}
                </span>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-[#f38ba8]/15 border border-[#f38ba8]/40 text-xs text-[#f38ba8]">
                  {error}
                </div>
              )}

              {/* Active Session Re-entry Banner (if room exists in storage) */}
              {savedSessionRoom && onReenterSession && (
                <div className="p-4 rounded-2xl bg-[#313244]/45 border border-[#cba6f7]/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#cba6f7] block">
                      {t.reenterRoomPrefix}
                    </span>
                    <span className="text-sm font-mono font-bold text-[#cdd6f4]">
                      #{savedSessionRoom}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="reenter-room-btn"
                    onClick={() => onReenterSession()}
                    className="px-4 py-2 rounded-xl bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-semibold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    {t.reenterRoomBtn}
                  </button>
                </div>
              )}

              {/* Curated Session Preview Strip */}
              <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a6adc8] font-medium">
                    {language === 'th' ? 'ชุดสถานที่คัดสรรเริ่มต้น' : 'Selected Sanctuary Deck'}
                  </span>
                  <span className="font-mono text-[#fab387] font-semibold">
                    10 Verified Venues
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a6adc8] font-medium">
                    {language === 'th' ? 'โหมดการลงคะแนน' : 'Consensus Protocol'}
                  </span>
                  <span className="font-mono text-[#a6e3a1]">
                    ✓ Weighted Quorum + B2B RFP
                  </span>
                </div>
              </div>

              {/* Primary CTA with Button-in-Button Architecture */}
              <motion.button
                type="button"
                data-testid="create-room-btn"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onCreateRoom()}
                className="w-full group relative flex items-center justify-between pl-6 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#fab387] text-[#11111b] font-display font-bold text-base shadow-[0_12px_32px_rgba(203,166,247,0.3)] hover:shadow-[0_16px_40px_rgba(203,166,247,0.45)] transition-all cursor-pointer disabled:opacity-60"
              >
                <span className="flex items-center gap-2.5">
                  <span>✦</span>
                  <span>{t.createRoomBtn}</span>
                </span>
                <span className="w-10 h-10 rounded-full bg-[#11111b] text-[#cba6f7] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </motion.button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#313244]" />
                <span className="flex-shrink mx-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[#6c7086]">
                  {t.joinRoomTitle}
                </span>
                <div className="flex-grow border-t border-[#313244]" />
              </div>

              {/* Join Existing Room Code Form */}
              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    maxLength={8}
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                    }
                    placeholder={t.roomCodePlaceholder}
                    aria-label="Room Invite Code"
                    className="flex-1 min-w-0 bg-[#181825] border border-[#313244] focus:border-[#cba6f7] rounded-2xl px-4 py-3 text-sm font-mono uppercase tracking-[0.2em] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-xs text-[#cdd6f4] placeholder:text-[#a6adc8] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={joinCode.trim().length < 4 || loading}
                    className="px-5 py-3 rounded-2xl bg-[#313244] hover:bg-[#45475a] disabled:opacity-40 disabled:pointer-events-none text-[#cdd6f4] font-semibold text-sm border border-[#45475a] transition-colors cursor-pointer shrink-0"
                  >
                    {t.joinRoomBtn}
                  </button>
                </div>
              </form>

              {/* Bottom Trust Bar */}
              <div className="pt-2 border-t border-[#313244]/70 flex items-center justify-between text-[11px] text-[#a6adc8]">
                <span>{t.createRoomSub}</span>
                <span className="font-mono text-[#a6e3a1]">PDPA · ท.ป. 4/2528</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
