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

  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

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

  const effectiveHeadcount = Math.max(4, usersCount || 12);
  const effectiveRate = matchedDestination?.price_per_person ?? 6000;
  const pricing = useMemo(() => {
    return calculateRetreatPricing(effectiveHeadcount, 3, effectiveRate, 12);
  }, [effectiveHeadcount, effectiveRate]);

  const isEscrowSecured = depositStatus === 'SECURED_ESCROW' || depositReceipt !== null;

  const formatShortCurrency = (num: number) => {
    if (num >= 1000000) return `฿${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `฿${(num / 1000).toFixed(1)}k`;
    return `฿${num}`;
  };

  if (step === 'landing' || step === 'profile') {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="hud-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setUserExpanded(false)}
            className="sm:hidden fixed inset-0 bg-[#11111b]/65 backdrop-blur-xs z-[35] no-print cursor-pointer"
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
            /* COLLAPSED FLOATING PILL */
            <motion.button
              key="collapsed-hud-pill"
              onClick={() => setUserExpanded(true)}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-full border backdrop-blur-[24px] text-left cursor-pointer transition-all ${
                isEscrowSecured
                  ? 'bg-[#181825]/95 border-[#a6e3a1] shadow-[0_12px_36px_rgba(17,17,27,0.85)]'
                  : 'bg-[#181825]/95 border-[#cba6f7]/60 hover:border-[#cba6f7] shadow-[0_12px_36px_rgba(17,17,27,0.85)]'
              }`}
              title={t.hudOpenProcurementBtn}
            >
              {/* Live Indicator */}
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a6e3a1]"></span>
              </span>

              {isEscrowSecured ? (
                <div className="flex items-center gap-1.5 font-mono text-xs tabular-data">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#a6e3a1] text-[#11111b] font-black uppercase tracking-wider">
                    {t.hudSecuredLabel}
                  </span>
                  <span className="font-extrabold text-[#a6e3a1]">
                    {t.hudLockedBadge}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-xs tabular-data">
                  <span className="text-[10px] text-[#a6adc8] uppercase font-bold tracking-wider hidden sm:inline">
                    {t.netPayableLabel || 'Net Budget'}
                  </span>
                  <span className="font-extrabold text-[#cdd6f4]">
                    {formatShortCurrency(pricing.netPayableToVendor)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#cba6f7]/15 border border-[#cba6f7]/30 text-[#cba6f7] font-bold">
                    WHT 3%
                  </span>
                  <span className="text-[10px] text-[#fab387] font-mono ml-0.5">
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
              transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
              className="w-72 sm:w-80 max-w-[calc(100vw-2rem)] p-1.5 rounded-[1.5rem] bg-[#181825] border border-[#313244] shadow-[0_24px_64px_rgba(17,17,27,0.9)]"
            >
              <div className="rounded-[calc(1.5rem-4px)] bg-[#1e1e2e] border border-[#313244] p-4 text-left overflow-hidden relative">
                {/* Header: Title + Minimize Button */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#313244] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a6e3a1]"></span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#cba6f7] uppercase tracking-[0.14em]">
                      {t.hudTitle}
                    </span>
                  </div>

                  <button
                    onClick={() => setUserExpanded(false)}
                    className="w-6 h-6 rounded-lg bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] flex items-center justify-center text-xs cursor-pointer transition-colors"
                    title={t.hudMinimizeTitle}
                  >
                    ▼
                  </button>
                </div>

                {/* Core Financial Metrics */}
                <div className="space-y-2 mb-3 font-mono tabular-data">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a6adc8] font-sans text-[11px]">{t.hudGbvLabel}</span>
                    <span className="font-bold text-[#cdd6f4]">
                      ฿{pricing.grossBookingValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#181825] p-2.5 rounded-xl border border-[#313244]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#cba6f7] font-bold font-sans text-[11px]">
                        {t.netPayableLabel || 'Net Payable to Vendor'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#cba6f7]/15 text-[#cba6f7] font-bold">
                        VAT 7% - 3%
                      </span>
                    </div>
                    <span className="font-extrabold text-[#f5e0dc] text-sm">
                      ฿{pricing.netPayableToVendor.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-[#a6adc8] font-sans text-[11px]">{t.escrowStatusLabel}</span>
                    {isEscrowSecured ? (
                      <span className="font-bold text-[#a6e3a1] flex items-center gap-1 text-[11px]">
                        <span>🔒 {t.hudSecuredLabel}</span>
                        <span className="text-[10px] font-mono">({t.hudLockedBadge})</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-[#fab387] text-[11px]">
                        {t.escrowReadyStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tax Compliance Stamp */}
                <div className="text-[10px] text-[#bac2de] bg-[#181825] p-2 rounded-xl border border-[#313244] mb-3 flex items-center justify-between font-sans">
                  <span className="flex items-center gap-1.5">
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
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#cba6f7] via-[#b4befe] to-[#fab387] hover:opacity-95 text-[#11111b] text-xs font-extrabold rounded-full transition-all cursor-pointer shadow-[0_8px_24px_rgba(203,166,247,0.3)] active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>{t.hudOpenProcurementBtn}</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  );
};
