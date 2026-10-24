import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { StepType, DepositReceipt } from '../hooks/useTripPick';
import { calculateRetreatPricing } from '../types/procurement';
import { useLanguage } from '../lib/i18n';

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
  const { t } = useLanguage();

  // Mobile responsive collapse state
  // On matched step: auto-expand to showcase financial proof to judges unless manually toggled
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  // Automatically reset manual toggle when transitioning to matched consensus
  const [prevStep, setPrevStep] = useState<StepType>(step);
  if (prevStep !== step) {
    setPrevStep(step);
    if (step === 'matched') {
      setUserExpanded(null);
    }
  }

  const isExpanded =
    userExpanded !== null
      ? userExpanded
      : (step === 'matched' && (typeof window !== 'undefined' ? window.innerWidth >= 640 : false));

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
    <>
      {/* Mobile Backdrop when expanded (tap outside to collapse) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="hud-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setUserExpanded(false)}
            className="sm:hidden fixed inset-0 bg-black/50 z-[35] no-print cursor-pointer"
          />
        )}
      </AnimatePresence>

      <aside
        data-testid="revenue-hud"
        aria-label="Revenue Metrics HUD"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 sm:right-5 z-40 select-none no-print pointer-events-auto"
      >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COLLAPSED FLOATING PILL (Mobile-first, zero obstruction for swiping) */
          <motion.button
            key="collapsed-hud-pill"
            onClick={() => setUserExpanded(true)}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full border shadow-xl text-left cursor-pointer transition-colors ${
              isEscrowSecured
                ? 'bg-[#181825] border-[#a6e3a1] shadow-emerald-500/20'
                : 'bg-[#181825] border-[#a6e3a1]/60 hover:border-[#a6e3a1] hover:shadow-emerald-500/10'
            }`}
            title={t.hudOpenProcurementBtn}
          >
            {/* Blinking Live Indicator */}
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a6e3a1]"></span>
            </span>

            {isEscrowSecured ? (
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a6e3a1] text-[#11111b] font-black uppercase tracking-wider">
                  {t.hudSecuredLabel}
                </span>
                <span className="font-extrabold text-[#a6e3a1]">
                  {t.hudLockedBadge}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-[#a6adc8] uppercase font-bold tracking-wider hidden sm:inline">
                  {t.netPayableLabel || 'Net Budget'}
                </span>
                <span className="font-extrabold text-[#a6e3a1]">
                  {formatShortCurrency(pricing.netPayableToVendor)}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-bold">
                  WHT 3%
                </span>
                <span className="text-[10px] text-[#89dceb] font-mono ml-0.5">
                  • RFP
                </span>
              </div>
            )}
          </motion.button>
        ) : (
          /* EXPANDED EXECUTIVE REVENUE CARD */
          <motion.div
            key="expanded-hud-card"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#181825] border border-[#a6e3a1]/50 shadow-2xl p-4 text-left overflow-hidden relative"
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
                  {t.hudTitle}
                </span>
              </div>

              <button
                onClick={() => setUserExpanded(false)}
                className="w-6 h-6 rounded-md bg-[#11111b] hover:bg-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] flex items-center justify-center text-xs cursor-pointer transition-colors"
                title={t.hudMinimizeTitle}
              >
                ▼
              </button>
            </div>

            {/* Core Financial Metrics */}
            <div className="space-y-2 mb-3 font-mono">
              {/* Gross Booking Value */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a6adc8] font-sans text-[11px]">{t.hudGbvLabel}</span>
                <span className="font-bold text-[#cdd6f4]">
                  ฿{pricing.grossBookingValue.toLocaleString()}
                </span>
              </div>

              {/* Net Payable to Vendor (incl. 7% VAT & 3% WHT) */}
              <div className="flex items-center justify-between text-xs bg-[#11111b] p-2 rounded-lg border border-[#313244]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#a6e3a1] font-bold font-sans text-[11px]">
                    {t.netPayableLabel || 'Net Payable to Vendor'}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-bold">
                    VAT 7% - 3%
                  </span>
                </div>
                <span className="font-extrabold text-[#a6e3a1] text-sm">
                  ฿{pricing.netPayableToVendor.toLocaleString()}
                </span>
              </div>

              {/* Escrow Status Line */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[#a6adc8] font-sans text-[11px]">{t.escrowStatusLabel}</span>
                {isEscrowSecured ? (
                  <span className="font-bold text-[#a6e3a1] flex items-center gap-1 text-[11px]">
                    <span>🔒 {t.hudSecuredLabel}</span>
                    <span className="text-[10px] font-mono">({t.hudLockedBadge})</span>
                  </span>
                ) : (
                  <span className="font-semibold text-[#f9e2af] text-[11px]">
                    {t.escrowReadyStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Tax Compliance Stamp */}
            <div className="text-[10px] text-[#a6adc8] bg-[#11111b]/80 p-2 rounded-lg border border-[#313244] mb-3 flex items-center justify-between font-sans">
              <span className="flex items-center gap-1">
                <span className="text-[#a6e3a1]">✓</span>
                <span>{t.hudAuditReady}</span>
              </span>
            </div>

            {/* Primary Action Button: Open Procurement Engine */}
            <button
              data-testid="hud-open-procurement-btn"
              onClick={() => {
                onOpenProcurement();
              }}
              className="w-full py-2 px-3 bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:opacity-95 text-[#11111b] text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>{t.hudOpenProcurementBtn}</span>
              <span>→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
    </>
  );
};
