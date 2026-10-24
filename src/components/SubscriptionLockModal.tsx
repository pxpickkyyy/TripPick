import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/i18n';

export interface SubscriptionLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onSimulatePro?: () => void;
  onViewPricing?: () => void;
}

export const SubscriptionLockModal: React.FC<SubscriptionLockModalProps> = ({
  isOpen,
  onClose,
  featureName,
  onSimulatePro,
  onViewPricing,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-[#11111b]/85 backdrop-blur-[24px] no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
          className="w-full max-w-md p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_32px_80px_rgba(17,17,27,0.9)]"
        >
          <div className="rounded-[calc(2rem-6px)] bg-[#1e1e2e] border border-[#313244] p-6 text-left relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#cba6f7]/15 border border-[#cba6f7]/35 flex items-center justify-center shrink-0 text-[#cba6f7]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-[#cdd6f4]">
                      Enterprise Pro Feature
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#fab387]/15 text-[#fab387] border border-[#fab387]/35">
                      PRO / ENTERPRISE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a6adc8] font-mono mt-0.5">
                    {featureName || (language === 'th' ? 'ระบบส่งออก Google Sheets และเชื่อมต่อ ERP' : 'Automated Google Sheets ledger sync & ERP webhooks')}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-[#a6adc8] hover:text-[#cdd6f4] text-xs font-semibold p-1 cursor-pointer"
                aria-label="Close"
              >
                [X]
              </button>
            </div>

            {/* Body Copy */}
            <div className="p-4 bg-[#181825] border border-[#313244] rounded-2xl text-xs text-[#bac2de] leading-relaxed mb-4 space-y-2.5">
              <p className="font-semibold text-[#cdd6f4]">
                Automated Google Sheets ledger sync, WHT 3% certificate routing, and direct ERP webhooks (฿1,500/month/team).
              </p>
              <p className="text-[11px] text-[#a6adc8]">
                {language === 'th'
                  ? 'ปลดล็อกการสร้างสเปรดชีตจัดซื้อระดับองค์กร คำนวณภาษีหัก ณ ที่จ่าย 3% อัตโนมัติ พร้อมส่งออกเข้า Google Drive บริษัทได้ทันทีใน 1 คลิก'
                  : 'Instantly dispatch procurement line items, 10% hotel service charge, and 3% withholding tax compliance into your team Google Workspace ledger.'}
              </p>

              <div className="pt-2 border-t border-[#313244] space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span className="font-bold">[PASS]</span>
                  <span>Direct Google Sheets & Google Docs Export</span>
                </div>
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span className="font-bold">[PASS]</span>
                  <span>Statutory Tax Breakdown (Tor.Por. 4/2528) TSV Ledger</span>
                </div>
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span className="font-bold">[PASS]</span>
                  <span>Instant Corporate Escrow & Signed PDF Routing</span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onSimulatePro?.();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-98 shadow-[0_8px_20px_rgba(203,166,247,0.28)] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Simulate Pro Access (Demo Sandbox)</span>
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (onViewPricing) onViewPricing();
                    else onClose();
                  }}
                  className="py-1.5 px-3 bg-[#181825] hover:bg-[#313244] border border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                >
                  View Pricing Plans
                </button>

                <button
                  onClick={onClose}
                  className="py-1.5 px-3 text-[#6c7086] hover:text-[#a6adc8] text-[11px] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
