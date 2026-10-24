import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/i18n';
import { CURATED_DESTINATIONS } from '../lib/travelDestinations';

interface EngineBentoMatrixProps {
  onCreateRoom: () => Promise<boolean> | void;
  loading?: boolean;
}

export const EngineBentoMatrix: React.FC<EngineBentoMatrixProps> = ({
  onCreateRoom,
  loading = false,
}) => {
  const { language: lang, localizeDestination } = useLanguage();
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedFlags, setCopiedFlags] = useState(false);

  const handleCopyCmd = () => {
    const voucherText =
      'TRIPPICK-RFP-2026 :: TAX-ID 0105567099881 · VAT 7% + WHT 3% (ท.ป. 4/2528) · PROMPTPAY EMVCo';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(voucherText).catch(() => {});
    }
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyFlags = () => {
    const briefText =
      'BRIEF::SEA-OFFSITE · PAX=20 · WIFI>=200MBPS · TAX_INVOICE=TH_TP_4_2528 · SETTLEMENT=PROMPTPAY_QR';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(briefText).catch(() => {});
    }
    setCopiedFlags(true);
    setTimeout(() => setCopiedFlags(false), 2000);
  };

  const showcaseVenues = CURATED_DESTINATIONS.slice(0, 4);

  return (
    <section
      aria-label="Architectural Capabilities & Sanctuary Matrix"
      className="space-y-12 text-left"
    >
      {/* Editorial Section Header + Curated Destination Ribbon (`telemetry-deck-strip`) */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#313244] pb-6">
          <div>
            <span
              className={`text-xs font-mono uppercase ${
                lang === 'th' ? 'tracking-normal' : 'tracking-[0.18em]'
              } text-[#cba6f7] block mb-2 break-words`}
            >
              {lang === 'th'
                ? 'สถาปัตยกรรมการคัดสรรและจัดซื้อระดับองค์กร'
                : 'ARCHITECTURAL CONSENSUS & PROCUREMENT'}
            </span>
            <h2
              className="font-display font-bold text-[#cdd6f4] tracking-tight leading-[1.1]"
              style={{
                fontSize:
                  lang === 'th'
                    ? 'clamp(1.5rem, 2.8vw, 2.55rem)'
                    : 'clamp(1.65rem, 3vw, 2.75rem)',
              }}
            >
              {lang === 'th' ? (
                <>
                  การตัดสินใจของทีมผู้นำ{' '}
                  <span className="text-[#f5e0dc]">อย่างเป็นเอกฉันท์</span>
                </>
              ) : (
                <>
                  Built for{' '}
                  <span className="font-editorial italic font-normal text-[#f5e0dc]">
                    decisive
                  </span>{' '}
                  leadership alignment.
                </>
              )}
            </h2>
          </div>
          <p className="text-base text-[#a6adc8] max-w-[48ch] leading-relaxed">
            {lang === 'th'
              ? 'รวมการลงคะแนนแบบถ่วงน้ำหนัก การตรวจสอบอินเทอร์เน็ตความเร็วสูง และระบบคำนวณภาษีหัก ณ ที่จ่าย 3% ตามมาตรฐานกรมสรรพากรไว้ในที่เดียว'
              : 'Every sanctuary is pre-vetted for high-throughput Starlink connectivity, private boardroom acoustics, and instant Thai statutory tax settlement.'}
          </p>
        </div>

        {/* Verified Sanctuary Ribbon (`telemetry-deck-strip`) — Real Destination Photography Cards */}
        <div
          data-testid="telemetry-deck-strip"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {showcaseVenues.map((rawVenue) => {
            const venue = { ...rawVenue, ...localizeDestination(rawVenue) };
            return (
              <div
                key={venue.id}
                className="p-1.5 rounded-[24px] bg-[#181825] border border-[#313244] hover:border-[#45475a] transition-colors"
              >
                <div className="rounded-[18px] bg-[#1e1e2e] border border-[#313244]/70 overflow-hidden flex flex-col h-full">
                  <div className="relative h-36 w-full overflow-hidden bg-[#11111b]">
                    <img
                      src={venue.hero_image}
                      alt={venue.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#11111b]/85 border border-[#313244] text-xs font-medium text-[#cba6f7]">
                        {venue.city}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#11111b]/85 border border-[#313244] text-xs font-mono text-[#a6e3a1] tabular-nums flex items-center gap-1">
                        <span aria-hidden="true" className="text-[11px] leading-none">★</span>
                        <span>{venue.rating}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-1.5">
                    <div className="text-sm font-display font-bold text-[#cdd6f4] line-clamp-1">
                      {venue.title}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#fab387] font-semibold tabular-nums">
                        ฿{venue.price_per_night.toLocaleString()} / night
                      </span>
                      <span className="text-[#a6adc8] tabular-nums">
                        {venue.wifi_speed_mbps} Mbps
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-Column Asymmetric Double-Bezel Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1 (7 Cols): Multi-Executive Quorum & Role Alignment (`bento-card-state-sync`) */}
        <motion.div
          data-testid="bento-card-state-sync"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-7 min-w-0 p-2 rounded-[28px] bg-[#181825] border border-[#313244]"
        >
          <div className="h-full rounded-[22px] bg-[#1e1e2e] border border-[#313244]/80 p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-xs font-mono text-[#cba6f7] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7]" />
                  <span>{lang === 'th' ? 'ฉันทามติแบบเรียลไทม์' : 'REAL-TIME QUORUM ALIGNMENT'}</span>
                </span>
                <span className="text-xs font-mono text-[#a6e3a1]">
                  BroadcastChannel + Cloud Sync
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-[#cdd6f4] tracking-tight">
                {lang === 'th'
                  ? 'ประสานความต้องการของทีมบริหารในหน้าจอเดียว'
                  : 'Weighted Consensus Across Every Stakeholder'}
              </h3>
              <p className="text-base text-[#bac2de] max-w-[60ch] leading-relaxed">
                {lang === 'th'
                  ? 'ไม่ว่าจะเป็นผู้บริหารที่ต้องการความเป็นส่วนตัว ทีมวิศวกรที่ต้องการอินเทอร์เน็ต 300 Mbps หรือฝ่ายการเงินที่ต้องการคุมงบประมาณ ระบบจะคำนวณจุดร่วมที่ลงตัวที่สุดทันที'
                  : 'Reconcile preferences between Founders, Engineering Leads, and Finance Officers with live multi-tab synchronization and instant super-like weighting.'}
              </p>
            </div>

            {/* Interactive Stakeholder Alignment Visualization */}
            <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
              {[
                {
                  role: lang === 'th' ? 'ผู้บริหารระดับสูง' : 'Executive Sponsor',
                  focus: lang === 'th' ? 'วิลล่าส่วนตัว & ห้องประชุม' : 'Private Villa & Boardroom',
                  match: '98% Match',
                  accent: 'text-[#cba6f7]',
                  bar: 'bg-[#cba6f7]',
                  width: 'w-[96%]',
                },
                {
                  role: lang === 'th' ? 'ทีมวิศวกรรม / AI' : 'Engineering & Product',
                  focus: lang === 'th' ? 'Starlink 300+ Mbps' : 'Dedicated Fiber 300 Mbps',
                  match: '95% Match',
                  accent: 'text-[#a6e3a1]',
                  bar: 'bg-[#a6e3a1]',
                  width: 'w-[94%]',
                },
                {
                  role: lang === 'th' ? 'ฝ่ายการเงินและบัญชี' : 'VP Finance & Legal',
                  focus: lang === 'th' ? 'ใบกำกับภาษี ท.ป. 4/2528' : 'Statutory WHT 3% / VAT 7%',
                  match: '100% Match',
                  accent: 'text-[#fab387]',
                  bar: 'bg-[#fab387]',
                  width: 'w-full',
                },
              ].map((item) => (
                <div
                  key={item.role}
                  className="p-4 rounded-2xl bg-[#181825] border border-[#313244] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#cdd6f4]">{item.role}</span>
                    <span className={`text-[11px] font-mono font-semibold shrink-0 ${item.accent}`}>
                      {item.match}
                    </span>
                  </div>
                  <p className="text-xs text-[#a6adc8]">{item.focus}</p>
                  <div className="h-1.5 w-full rounded-full bg-[#313244] overflow-hidden">
                    <div className={`h-full rounded-full ${item.bar} ${item.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card 2 (5 Cols): Sanctuary Suitability Index (`bento-card-telemetry-gauge`) */}
        <motion.div
          data-testid="bento-card-telemetry-gauge"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="lg:col-span-5 min-w-0 p-2 rounded-[28px] bg-[#181825] border border-[#313244] shadow-[0_24px_48px_-12px_rgba(17,17,27,0.7)]"
        >
          <div className="h-full rounded-[22px] bg-[#1e1e2e] border border-[#313244]/80 p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span
                  className={`text-[11px] font-mono uppercase ${
                    lang === 'th' ? 'tracking-normal' : 'tracking-[0.18em]'
                  } text-[#fab387] block mb-1 break-words`}
                >
                  {lang === 'th' ? 'ดัชนีคุณภาพสถานที่' : 'SANCTUARY QUALITY INDEX'}
                </span>
                <h3 className="text-xl font-display font-bold text-[#cdd6f4]">
                  {lang === 'th' ? 'การรับรองมาตรฐานสถานที่จัดงาน' : 'Verified Offsite Readiness'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 text-xs font-mono font-bold text-[#a6e3a1] shrink-0">
                99.4 / 100
              </span>
            </div>

            {/* Radial SVG Harmony Gauge + Metrics */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#313244"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#cba6f7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="18"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-mono font-bold text-[#cdd6f4]">94%</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#a6adc8]">
                    HARMONY
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 w-full flex-1 text-xs">
                <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#313244]">
                  <span className="text-[#a6adc8]">Starlink Redundancy</span>
                  <span className="font-mono font-semibold text-[#a6e3a1] shrink-0">350 Mbps</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#313244]">
                  <span className="text-[#a6adc8]">Acoustic Isolation</span>
                  <span className="font-mono font-semibold text-[#cba6f7] shrink-0">Boardroom Grade</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-[#a6adc8]">Direct Airport Transfer</span>
                  <span className="font-mono font-semibold text-[#fab387] shrink-0">&lt; 45 mins</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#a6adc8] leading-relaxed">
              {lang === 'th'
                ? 'สถานที่ทุกแห่งผ่านการตรวจสอบสัญญาณอินเทอร์เน็ตจริงและห้องประชุมส่วนตัวก่อนขึ้นระบบ'
                : 'Audited on-site across Phuket, Chiang Mai, Koh Samui, Krabi, and Bangkok riverfront sanctuaries.'}
            </p>
          </div>
        </motion.div>

        {/* Card 3 (5 Cols): Curated Retreat Timeline (`bento-card-latency-pipeline`) */}
        <motion.div
          data-testid="bento-card-latency-pipeline"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="lg:col-span-5 min-w-0 p-2 rounded-[28px] bg-[#181825] border border-[#313244] shadow-[0_24px_48px_-12px_rgba(17,17,27,0.7)]"
        >
          <div className="h-full rounded-[22px] bg-[#1e1e2e] border border-[#313244]/80 p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span
                className={`text-[11px] font-mono uppercase ${
                  lang === 'th' ? 'tracking-normal' : 'tracking-[0.18em]'
                } text-[#89dceb] block mb-1 break-words`}
              >
                {lang === 'th' ? 'ขั้นตอนการจัดซื้อถึงการชำระเงิน' : 'END-TO-END RETREAT FLOW'}
              </span>
              <h3 className="text-xl font-display font-bold text-[#cdd6f4]">
                {lang === 'th'
                  ? 'จากฉันทามติสู่ใบสั่งซื้อภายใน 4 ขั้นตอน'
                  : 'From Swipe to Signed Venue Escrow'}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: '01',
                  label: lang === 'th' ? 'คัดสรรสถานที่แบบไม่เปิดเผยชื่อ' : 'Blind Executive Shortlisting',
                  metric: '90 sec',
                  color: 'text-[#cba6f7]',
                },
                {
                  step: '02',
                  label: lang === 'th' ? 'คำนวณฉันทามติและคะแนนถ่วงน้ำหนัก' : 'Weighted Quorum Resolution',
                  metric: 'Instant',
                  color: 'text-[#fab387]',
                },
                {
                  step: '03',
                  label: lang === 'th' ? 'ออกใบเสนอราคาพร้อมคำนวณ VAT 7% / WHT 3%' : 'Statutory Tax & WHT 3% Ledger',
                  metric: 'ท.ป. 4/2528',
                  color: 'text-[#a6e3a1]',
                },
                {
                  step: '04',
                  label: lang === 'th' ? 'ชำระมัดจำผ่าน PromptPay EMVCo QR' : 'PromptPay Corporate Settlement',
                  metric: 'CRC16 Verified',
                  color: 'text-[#89dceb]',
                },
              ].map((stage) => (
                <div
                  key={stage.step}
                  className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#6c7086] shrink-0">
                      {stage.step}
                    </span>
                    <span className="text-xs font-medium text-[#cdd6f4] break-words">{stage.label}</span>
                  </div>
                  <span className={`text-xs font-mono font-semibold shrink-0 ${stage.color}`}>
                    {stage.metric}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card 4 (7 Cols): Thai Statutory Tax & PromptPay Voucher Dossier (`bento-card-terminal-portal`) */}
        <motion.div
          data-testid="bento-card-terminal-portal"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="lg:col-span-7 min-w-0 p-2 rounded-[28px] bg-[#181825] border border-[#313244] shadow-[0_24px_48px_-12px_rgba(17,17,27,0.7)]"
        >
          <div className="h-full rounded-[22px] bg-[#1e1e2e] border border-[#313244]/80 p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#313244] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#cba6f7]/15 border border-[#cba6f7]/30 flex items-center justify-center text-[#cba6f7] font-mono text-xs font-bold shrink-0">
                  ฿
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-[10px] font-mono uppercase ${
                      lang === 'th' ? 'tracking-normal' : 'tracking-[0.2em]'
                    } text-[#a6adc8] block break-words`}
                  >
                    {lang === 'th' ? 'ตัวอย่างเอกสารจัดซื้อองค์กร' : 'LIVE B2B PROCUREMENT DOSSIER'}
                  </span>
                  <h3 className="text-lg font-display font-bold text-[#cdd6f4]">
                    {lang === 'th'
                      ? 'ใบสรุปภาษีมูลค่าเพิ่ม 7% และภาษีหัก ณ ที่จ่าย 3%'
                      : 'Thai Revenue Dept. Compliance (ท.ป. 4/2528)'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                data-testid="copy-terminal-cmd-btn"
                onClick={handleCopyCmd}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#313244] hover:bg-[#45475a] text-xs font-mono font-semibold text-[#cdd6f4] border border-[#45475a] transition-all cursor-pointer shrink-0"
              >
                {copiedCmd ? (
                  <span className="text-[#a6e3a1]">✓ COPIED</span>
                ) : (
                  <span>COPY RFP SPEC</span>
                )}
              </button>
            </div>

            {/* Authentic Financial Breakdown Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181825] border border-[#313244] font-mono text-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[#a6adc8]">
                <span>SANCTUARY · TRISARA PHUKET (3 NIGHTS · 20 PAX)</span>
                <span className="text-[#cdd6f4] font-semibold">THB 285,000.00</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 text-[#a6adc8]">
                <span>PLUS: STATUTORY VAT 7% (ภ.พ.30)</span>
                <span className="text-[#fab387]">+ THB 19,950.00</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 text-[#a6adc8]">
                <span>LESS: WITHHOLDING TAX 3% (ท.ป. 4/2528 SERVICE)</span>
                <span className="text-[#a6e3a1]">- THB 8,550.00</span>
              </div>
              <div className="pt-2.5 border-t border-[#313244] flex flex-wrap items-center justify-between gap-1 text-sm font-bold">
                <span className="text-[#cba6f7]">NET PAYABLE VIA PROMPTPAY ESCROW</span>
                <span className="text-[#f5e0dc] text-base">THB 296,400.00</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a6adc8]">
              <span>
                {lang === 'th'
                  ? '✓ พร้อมออกหนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) อัตโนมัติ'
                  : '✓ Generates downloadable e-Tax Invoice & 50 Tawi WHT Certificate'}
              </span>
              <span className="font-mono text-[#cba6f7]">EMVCo Tag 29 · CRC16</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Full-Width Editorial Concierge & Instant Activation Dock (`cta-portal-dock`) */}
      <motion.div
        data-testid="cta-portal-dock"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="p-2.5 rounded-[32px] bg-[#181825] border border-[#313244] shadow-[0_28px_65px_-15px_rgba(17,17,27,0.85)]"
      >
        <div className="rounded-[24px] bg-gradient-to-r from-[#1e1e2e] via-[#1e1e2e] to-[#313244]/60 border border-[#313244] p-5 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl min-w-0">
            <div
              className={`inline-flex items-center gap-2 text-xs font-mono uppercase ${
                lang === 'th' ? 'tracking-normal' : 'tracking-[0.18em]'
              } text-[#fab387] break-words`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#fab387] shrink-0" />
              <span>
                {lang === 'th'
                  ? 'พร้อมเริ่มต้นทริปผู้บริหารครั้งถัดไปหรือยัง'
                  : 'READY FOR YOUR NEXT LEADERSHIP OFFSITE'}
              </span>
            </div>
            <h3 className="text-xl sm:text-3xl font-display font-bold text-[#cdd6f4] tracking-tight leading-snug">
              {lang === 'th'
                ? 'เปิดห้องฉันทามติและรับใบเสนอราคาใน 5 นาที'
                : 'Initialize your private sanctuary quorum in seconds.'}
            </h3>
            <p className="text-base text-[#bac2de] max-w-[58ch]">
              {lang === 'th'
                ? 'ไม่ต้องสมัครสมาชิกสำหรับผู้ร่วมโหวต แชร์ลิงก์หรือรหัสห้อง 4 หลักเพื่อเริ่มคัดเลือกสถานที่ได้ทันที'
                : 'Zero onboarding friction for invited executives. Share a 4-character room code or copy the pre-configured retreat brief below.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto justify-end">
            <button
              type="button"
              data-testid="copy-portal-flags-btn"
              onClick={handleCopyFlags}
              className="px-4 py-3 rounded-2xl bg-[#181825] hover:bg-[#313244] text-xs font-mono font-semibold text-[#cdd6f4] border border-[#313244] transition-all flex items-center gap-2 cursor-pointer"
            >
              {copiedFlags ? (
                <span className="text-[#a6e3a1]">✓ COPIED BRIEF</span>
              ) : (
                <span>COPY RETREAT BRIEF</span>
              )}
            </button>

            <button
              type="button"
              data-testid="portal-instant-activate-btn"
              disabled={loading}
              onClick={() => onCreateRoom()}
              className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#fab387] text-[#11111b] font-display font-bold text-sm shadow-[0_12px_30px_rgba(203,166,247,0.3)] hover:shadow-[0_16px_38px_rgba(203,166,247,0.45)] transition-all cursor-pointer disabled:opacity-60"
            >
              <span>
                {lang === 'th' ? 'สร้างห้องคัดสรรสถานที่ทันที' : 'Launch Sanctuary Studio'}
              </span>
              <span className="w-9 h-9 rounded-full bg-[#11111b] text-[#cba6f7] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
