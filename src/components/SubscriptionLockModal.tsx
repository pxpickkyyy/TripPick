import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/i18n';

interface SubscriptionLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const SubscriptionLockModal: React.FC<SubscriptionLockModalProps> = ({
  isOpen,
  onClose,
  featureName,
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
                <div className="w-10 h-10 rounded-2xl bg-[#cba6f7]/15 border border-[#cba6f7]/35 flex items-center justify-center text-xl shrink-0">
                  🔒
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-[#cdd6f4]">
                      {language === 'th' ? 'ฟังก์ชันสำหรับสมาชิก Subscription' : 'Subscription Member Feature'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#fab387]/15 text-[#fab387] border border-[#fab387]/35">
                      PRO / MEMBER
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a6adc8] font-mono mt-0.5">
                    {featureName || (language === 'th' ? 'ระบบสร้างและส่งออกเอกสารอัตโนมัติ' : 'Automated Document Generation & Workspace Sync')}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-[#a6adc8] hover:text-[#cdd6f4] text-xs font-semibold p-1 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body Content */}
            <div className="p-4 bg-[#181825] border border-[#313244] rounded-2xl text-xs text-[#bac2de] leading-relaxed mb-4 space-y-2.5">
              <p className="font-semibold text-[#cba6f7]">
                {language === 'th'
                  ? '⚡ ระบบสร้างเอกสารทางการนี้ สงวนสิทธิ์สำหรับสมาชิกแพ็กเกจ Pro & Enterprise เท่านั้น'
                  : '⚡ This automated document generation feature is exclusively reserved for Pro & Enterprise subscribers.'}
              </p>
              <p className="text-[11px] text-[#a6adc8]">
                {language === 'th'
                  ? 'ฟังก์ชันส่งออกเอกสารทางการเข้าสู่ Google Sheets และ Google Docs แบบเรียลไทม์ (รวมถึงการซิงก์ PO / Tax ID และงบประมาณจัดซื้อ) อยู่ระหว่างการพัฒนาเชื่อมต่อระบบ Google Workspace โดยจะเปิดใช้งานอย่างเป็นทางการในอนาคตอันใกล้'
                  : 'Automated 1-click export to Google Sheets and Google Docs (including reconciled PO, Tax ID, and procurement budget syncing) is currently in development and will be activated for verified subscribers in an upcoming release.'}
              </p>

              <div className="pt-2 border-t border-[#313244] space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span>✓</span>
                  <span>{language === 'th' ? '1-Click Export สู่ Google Drive องค์กร' : '1-Click Direct Sync to Corporate Google Drive'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span>✓</span>
                  <span>{language === 'th' ? 'ใบเสนอราคา RFP มาตรฐานกรมสรรพากร (ท.ป. 4/2528)' : 'Revenue Department Compliant RFP (ท.ป. 4/2528)'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#a6e3a1]">
                  <span>✓</span>
                  <span>{language === 'th' ? 'ระบบ Approval Workflow หลายระดับสำหรับฝ่ายจัดซื้อ' : 'Multi-tier Corporate Procurement Approval Workflow'}</span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[10px] text-[#6c7086] font-mono">
                TripPick Enterprise Tier (Coming Soon)
              </span>
              <button
                onClick={onClose}
                className="py-2 px-5 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] rounded-full text-xs font-extrabold transition-all cursor-pointer active:scale-95 shadow-[0_8px_20px_rgba(203,166,247,0.28)]"
              >
                {language === 'th' ? 'รับทราบ' : 'Understood'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
