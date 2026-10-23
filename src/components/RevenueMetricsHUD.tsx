import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { StepType, DepositReceipt } from '../hooks/useTripPick';
import { calculateRetreatPricing } from '../types/procurement';

export interface RevenueMetricsHUDProps {
  matchedDestination: TravelDestination | null;
  step: StepType;
  usersCount: number;
  depositStatus: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt: DepositReceipt | null;
  onOpenProcurement: () => void;
}

export const RevenueMetricsHUD: React.FC<RevenueMetricsHUDProps> = ({
  matchedDestination,
  step,
  usersCount,
  depositStatus,
  depositReceipt,
  onOpenProcurement,
}) => {
  // Mobile responsive collapse state
  // On matched step: auto-expand to showcase financial proof to judges unless manually toggled
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const [prevStep, setPrevStep] = useState<StepType>(step);

  // Automatically reset manual toggle when transitioning to matched consensus
  if (prevStep !== step) {
    setPrevStep(step);
    if (step === 'matched') {
      setUserExpanded(null);
    }
  }

  const isExpanded = userExpanded !== null ? userExpanded : step === 'matched';

  // Compute live financial yield
  const effectiveHeadcount = Math.max(4, usersCount || 12);
  const effectiveRate = matchedDestination?.price_per_person ?? 6000;
  const pricing = useMemo(() => {
    return calculateRetreatPricing(effectiveHeadcount, 3, effectiveRate, 12);
  }, [effectiveHeadcount, effectiveRate]);

  const isEscrowSecured = depositStatus === 'SECURED_ESCROW' || depositReceipt !== null;

  // Formatting helpers
  const formatShortCurrency = (num: number) => {
    if (num >= 1000000) return `฿${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `฿${(num / 1000).toFixed(1)}k`;
    return `฿${num}`;
  };

  // Do not render on landing or profile setup
  if (step === 'landing' || step === 'profile') {
    return null;
  }

  return (
    <aside
      aria-label="Revenue Metrics HUD"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 select-none no-print"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COLLAPSED FLOATING PILL (Mobile-first, zero obstruction for swiping) */
          <motion.button
            key="collapsed-hud-pill"
            layoutId="revenue-hud-container"
            onClick={() => setUserExpanded(true)}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full border shadow-xl backdrop-blur-md text-left cursor-pointer transition-all ${
              isEscrowSecured
                ? 'bg-[#181825]/95 border-[#a6e3a1] shadow-emerald-500/20'
                : 'bg-[#181825]/95 border-[#a6e3a1]/50 hover:shadow-emerald-500/10'
            }`}
            title="คลิกเพื่อดูรายละเอียดรายได้ B2B & Gross Booking Value"
          >
            {/* Blinking Live Indicator */}
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a6e3a1]"></span>
            </span>

            {isEscrowSecured ? (
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a6e3a1] text-[#11111b] font-black uppercase tracking-wider">
                  SECURED
                </span>
                <span className="font-extrabold text-[#a6e3a1]">
                  ฿5,000 LOCKED
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-[#a6adc8] uppercase font-bold tracking-wider hidden sm:inline">
                  YIELD:
                </span>
                <span className="font-extrabold text-[#a6e3a1]">
                  {formatShortCurrency(pricing.tripPickRevenue)}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-bold">
                  12%
                </span>
                <span className="text-[10px] text-[#89dceb] font-mono ml-0.5">
                  • HUD
                </span>
              </div>
            )}
          </motion.button>
        ) : (
          /* EXPANDED EXECUTIVE REVENUE CARD */
          <motion.div
            key="expanded-hud-card"
            layoutId="revenue-hud-container"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#181825]/95 border border-[#a6e3a1]/40 shadow-2xl backdrop-blur-xl p-4 text-left overflow-hidden relative"
          >
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 right-0 w-32 h-20 bg-gradient-to-bl from-[#a6e3a1]/15 via-transparent to-transparent pointer-events-none" />

            {/* Header: Title + Minimize Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#313244] mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a6e3a1]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#a6e3a1] uppercase tracking-wider">
                  B2B REVENUE HUD // 12% TAKE-RATE
                </span>
              </div>

              <button
                onClick={() => setUserExpanded(false)}
                className="w-6 h-6 rounded-md bg-[#11111b] hover:bg-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] flex items-center justify-center text-xs cursor-pointer transition-colors"
                title="ย่อขนาด HUD"
              >
                ▼
              </button>
            </div>

            {/* Core Financial Metrics */}
            <div className="space-y-2 mb-3 font-mono">
              {/* Gross Booking Value */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a6adc8] font-sans text-[11px]">Gross Booking Value (GBV):</span>
                <span className="font-bold text-[#cdd6f4]">
                  ฿{pricing.grossBookingValue.toLocaleString()}
                </span>
              </div>

              {/* TripPick Take-Rate Commission */}
              <div className="flex items-center justify-between text-xs bg-[#11111b] p-2 rounded-lg border border-[#313244]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#a6e3a1] font-bold font-sans text-[11px]">Platform Take-Rate:</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-bold">
                    12%
                  </span>
                </div>
                <span className="font-extrabold text-[#a6e3a1] text-sm">
                  ฿{pricing.tripPickRevenue.toLocaleString()}
                </span>
              </div>

              {/* Escrow Status Line */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[#a6adc8] font-sans text-[11px]">สถานะเงินมัดจำ Escrow:</span>
                {isEscrowSecured ? (
                  <span className="font-bold text-[#a6e3a1] flex items-center gap-1 text-[11px]">
                    <span>🔒 SECURED</span>
                    <span className="text-[10px] font-mono">(฿5,000 LOCKED)</span>
                  </span>
                ) : (
                  <span className="font-semibold text-[#f9e2af] text-[11px]">
                    ⏳ READY (฿5,000 ESCROW)
                  </span>
                )}
              </div>
            </div>

            {/* Tax Compliance Stamp */}
            <div className="text-[10px] text-[#a6adc8] bg-[#11111b]/80 p-2 rounded-lg border border-[#313244] mb-3 flex items-center justify-between font-sans">
              <span className="flex items-center gap-1">
                <span className="text-[#a6e3a1]">✓</span>
                <span>VAT 7% + WHT 3% (ท.ป. 4/2528)</span>
              </span>
              <span className="text-[9px] font-mono text-[#89dceb] font-semibold">
                AUDIT READY
              </span>
            </div>

            {/* Primary Action Button: Open Procurement Engine */}
            <button
              onClick={() => {
                onOpenProcurement();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:opacity-95 text-[#11111b] text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>💼 ดูเอกสารจัดซื้อ B2B &amp; มัดจำ Escrow</span>
              <span>→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
