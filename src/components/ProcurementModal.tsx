import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser } from '../hooks/useTripPick';
import { useProcurement } from '../hooks/useProcurement';
import { generatePromptPayPayload, generateQrSvgPath } from '../lib/promptpay';
import type { DepositReceipt } from '../hooks/useTripPick';
import { useLanguage } from '../lib/i18n';

export interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedDestination: TravelDestination | null;
  users: RoomUser[];
  roomId?: string;
  depositStatus?: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt?: DepositReceipt | null;
  onConfirmDeposit?: (receiptNo: string, taxId: string, amount: number, companyName?: string) => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  isOpen,
  onClose,
  matchedDestination,
  users,
  roomId = 'TRIP',
  depositStatus = 'UNPAID',
  depositReceipt = null,
  onConfirmDeposit,
}) => {
  const { language, t } = useLanguage();
  const {
    headcount,
    setHeadcount,
    nights,
    setNights,
    pricing,
    companyName,
    setCompanyName,
    companyTaxId,
    setCompanyTaxId,
    approverEmail,
    setApproverEmail,
    paymentMethod,
    setPaymentMethod,
    proposalRef,
    depositCode,
    isEscrowLocked,
    escrowDeposit,
    hasAppliedDemoPreset,
    applyDemoPreset,
    confirmEscrow,
    exportToCsv,
    exportToGoogleSheetsTsv,
    generateGoogleDocsMarkdown,
    printQuotation,
    toastMessage,
  } = useProcurement({
    destination: matchedDestination,
    initialHeadcount: users.length,
    initialNights: 3,
    takeRatePercent: 12,
    roomId,
    depositStatus,
    depositReceipt,
    onConfirmDeposit,
  });

  const [activeTab, setActiveTab] = useState<'invoice' | 'escrow'>('invoice');

  // Compute 100% offline EMVCo PromptPay QR Code Payload
  const promptPayPayload = useMemo(() => {
    return generatePromptPayPayload({
      target: companyTaxId || '0105558123456',
      amount: 5000,
      referenceNo: escrowDeposit.receiptNo || depositCode,
    });
  }, [companyTaxId, escrowDeposit.receiptNo, depositCode]);

  // Generate deterministic SVG QR Matrix
  const qrSvgPath = useMemo(() => {
    return generateQrSvgPath(promptPayPayload, 220);
  }, [promptPayPayload]);

  if (!isOpen) return null;

  const destinationTitle = matchedDestination?.title || 'TripPick Corporate Retreat';
  const destinationCity = matchedDestination?.city || 'Thailand';
  const destinationCountry = matchedDestination?.country || '';

  const issueDateFormatted = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl my-auto bg-[#181825] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="no-print p-4 sm:px-6 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#a6e3a1]/20 border border-[#a6e3a1]/40 flex items-center justify-center text-[#a6e3a1]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-[#cdd6f4]">
                    {t.procurementModalTitle}
                  </h2>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">
                    B2B PROCUREMENT ENGINE
                  </span>
                </div>
                <p className="text-[11px] text-[#a6adc8]">
                  {t.procurementModalSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#11111b] border border-[#313244] text-[#a6adc8] hover:text-[#f38ba8] flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors"
                title={t.closeBtn}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="no-print bg-[#a6e3a1]/20 border-b border-[#a6e3a1]/40 px-4 py-2 text-center text-xs font-semibold text-[#a6e3a1]"
            >
              {toastMessage}
            </motion.div>
          )}

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
            {/* DEMO FAILSAFE: 1-Click Fast Fill Header Button */}
            <div className="no-print p-3 rounded-xl bg-gradient-to-r from-[#1e1e2e] via-[#1e2a3a] to-[#1e1e2e] border border-[#89b4fa]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <span className="text-xs font-bold text-[#89b4fa] block">
                    {language === 'en' ? 'Demo Failsafe: 1-Click Fast Fill for Stage Presentations' : 'Demo Failsafe: 1-Click Fast Fill สำหรับพรีเซนต์บนเวที'}
                  </span>
                  <span className="text-[11px] text-[#a6adc8]">
                    {language === 'en' ? 'Click to auto-populate company name, 13-digit Tax ID, and CFO approver email in 1 second' : 'คลิกเพื่อกรอกชื่อบริษัท, เลขประจำตัวผู้เสียภาษี 13 หลัก, และอีเมลผู้อนุมัติอัตโนมัติใน 1 วินาที'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => applyDemoPreset()}
                className="w-full sm:w-auto py-1.5 px-3.5 bg-gradient-to-r from-[#89b4fa] to-[#b4befe] hover:opacity-95 text-[#11111b] text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{language === 'en' ? '⚡ Populate Tech Startup Data (Demo Fast-Fill)' : '⚡ จำลองข้อมูลบริษัท Tech Startup (Demo Fast-Fill)'}</span>
              </button>
            </div>

            {/* Escrow Locked Alert Banner (If already secured) */}
            {isEscrowLocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-[#a6e3a1]/15 border border-[#a6e3a1]/40 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-3.5 w-3.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#a6e3a1]"></span>
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold text-[#a6e3a1] uppercase tracking-wider block">
                      {language === 'en' ? 'ESCROW SECURED & LOCKED // Rights Reserved' : 'ESCROW SECURED & LOCKED // ล็อกสิทธิ์เรียบร้อยแล้ว'}
                    </span>
                    <span className="text-xs text-[#cdd6f4]">
                      {language === 'en'
                        ? `฿5,000.00 THB deposit secured in Escrow (Receipt: ${escrowDeposit.receiptNo})`
                        : `เงินมัดจำ ฿5,000.00 THB ได้รับการคุ้มครองในระบบ Escrow (ใบเสร็จ: ${escrowDeposit.receiptNo})`}
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-md bg-[#a6e3a1] text-[#11111b] text-[11px] font-extrabold shrink-0">
                  SECURED ฿5,000
                </div>
              </motion.div>
            )}

            {/* Top Interactive Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Stepper: Headcount */}
              <div className="p-3.5 rounded-xl bg-[#11111b] border border-[#313244]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase text-[#a6adc8]">{language === 'en' ? 'Headcount' : 'จำนวนผู้เข้าร่วม (Headcount)'}</span>
                  <span className="text-xs font-bold text-[#cba6f7] font-mono">{headcount} {language === 'en' ? 'Guests' : 'ท่าน'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeadcount((prev) => Math.max(4, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="flex-1 accent-[#cba6f7] cursor-pointer"
                  />
                  <button
                    onClick={() => setHeadcount((prev) => Math.min(60, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper: Duration */}
              <div className="p-3.5 rounded-xl bg-[#11111b] border border-[#313244]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase text-[#a6adc8]">{language === 'en' ? 'Duration (Nights)' : 'ระยะเวลาสัมมนา (Nights)'}</span>
                  <span className="text-xs font-bold text-[#89dceb] font-mono">{nights} {language === 'en' ? 'Nights' : 'คืน'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNights((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="flex-1 accent-[#89dceb] cursor-pointer"
                  />
                  <button
                    onClick={() => setNights((prev) => Math.min(14, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* TripPick Platform Yield Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#181825] to-[#1e3a2f] border border-[#a6e3a1]/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#a6e3a1] font-bold">
                    TRIPPICK TAKE-RATE (12%)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] font-bold">
                    MAKE ME MONEY
                  </span>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#a6e3a1] font-mono tracking-tight">
                    ฿{pricing.tripPickRevenue.toLocaleString()} THB
                  </div>
                  <div className="text-[10px] text-[#a6adc8]">
                    {language === 'en' ? 'From Gross Booking Value: ฿' : 'จาก Gross Booking Value: ฿'}{pricing.grossBookingValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Mini Dossier */}
            <div className="p-3.5 rounded-xl bg-[#11111b] border border-[#313244] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {matchedDestination?.hero_image && (
                  <img
                    src={matchedDestination.hero_image}
                    alt={destinationTitle}
                    className="w-14 h-14 rounded-lg object-cover border border-[#313244] shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#cdd6f4]">{destinationTitle}</span>
                    <span className="text-[10px] text-[#a6adc8]">({destinationCity}, {destinationCountry})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#bac2de]">
                    <span className="px-1.5 py-0.5 rounded bg-[#1e1e2e] border border-[#313244]">
                      ★ {matchedDestination?.rating || 4.9}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1e1e2e] border border-[#313244]">
                      ⚡ Starlink {matchedDestination?.wifi_speed_mbps || 350} Mbps SLA
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1e1e2e] border border-[#313244]">
                      👥 {language === 'en' ? `Capacity: ${matchedDestination?.max_capacity || 20} guests` : `รองรับสูงสุด ${matchedDestination?.max_capacity || 20} ท่าน`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-[10px] text-[#a6adc8] block">{language === 'en' ? 'Rate per guest:' : 'อัตราค่าบริการต่อท่าน:'}</span>
                <span className="font-mono font-bold text-[#cba6f7] text-sm">
                  ฿{pricing.ratePerHeadPerNight.toLocaleString()} / {language === 'en' ? 'night' : 'คืน'}
                </span>
              </div>
            </div>

            {/* TAB SELECTOR: B2B INVOICE BREAKDOWN vs. ฿5,000 ESCROW DEPOSIT */}
            <div className="flex rounded-xl bg-[#11111b] border border-[#313244] p-1 select-none">
              <button
                onClick={() => setActiveTab('invoice')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'invoice'
                    ? 'bg-[#cba6f7] text-[#11111b] shadow-sm'
                    : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                }`}
              >
                <span>📊 {t.tabInvoice}</span>
              </button>

              <button
                onClick={() => setActiveTab('escrow')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'escrow'
                    ? 'bg-[#a6e3a1] text-[#11111b] shadow-sm'
                    : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                }`}
              >
                <span>🔒 {t.tabEscrow}</span>
                {isEscrowLocked && (
                  <span className="w-2 h-2 rounded-full bg-[#11111b]" />
                )}
              </button>
            </div>

            {/* TAB 1: B2B TAX BREAKDOWN TABLE */}
            {activeTab === 'invoice' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Statutory Tax Compliance Notice */}
                <div className="p-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-[11px] text-[#a6adc8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a6e3a1] text-base">⚖️</span>
                    <span>
                      {language === 'en'
                        ? <>Tax calculation per Thai Revenue Dept: <strong>3% Withholding Tax (Services, Tor.Por. 4/2528) applies to Subtotal before VAT only</strong></>
                        : <>คำนวณภาษีตามระเบียบกรมสรรพากร: <strong>ภาษีหัก ณ ที่จ่าย 3% (หมวดบริการ ท.ป. 4/2528) คำนวณจากยอดก่อน VAT เท่านั้น</strong></>}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#a6e3a1] uppercase font-bold tracking-wider hidden sm:inline">
                    100% Tax Compliant
                  </span>
                </div>

                {/* Tabular Financial Breakdown */}
                <div className="rounded-xl border border-[#313244] overflow-hidden bg-[#11111b]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1e1e2e] text-[#a6adc8] uppercase font-mono text-[10px] border-b border-[#313244]">
                      <tr>
                        <th className="py-2.5 px-4">{language === 'en' ? 'Financial Line Items' : 'รายการการเงิน (Financial Line Items)'}</th>
                        <th className="py-2.5 px-4 text-center">{language === 'en' ? 'Formula' : 'สูตรการคำนวณ'}</th>
                        <th className="py-2.5 px-4 text-right">{language === 'en' ? 'Amount (THB)' : 'จำนวนเงิน (THB)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#313244]/60 font-mono">
                      {/* Subtotal before VAT */}
                      <tr className="hover:bg-[#181825]/50 transition-colors">
                        <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                          <strong>{language === 'en' ? '1. Net Subtotal (GBV)' : '1. มูลค่าบริการก่อนภาษี (Net Subtotal / GBV)'}</strong>
                          <span className="block text-[11px] text-[#a6adc8] font-sans">
                            {pricing.headcount} {language === 'en' ? 'guests' : 'ท่าน'} × {pricing.nights} {language === 'en' ? 'nights' : 'คืน'} × ฿{pricing.ratePerHeadPerNight.toLocaleString()}/{language === 'en' ? 'person/night' : 'คน/คืน'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                          Headcount × Nights × Rate
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#cdd6f4] text-sm">
                          ฿{pricing.subtotalBeforeVat.toLocaleString()}
                        </td>
                      </tr>

                      {/* VAT 7% */}
                      <tr className="hover:bg-[#181825]/50 transition-colors">
                        <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                          <strong>{language === 'en' ? '2. Value Added Tax 7% (VAT 7%)' : '2. ภาษีมูลค่าเพิ่ม 7% (VAT 7%)'}</strong>
                          <span className="block text-[11px] text-[#a6adc8] font-sans">
                            {language === 'en' ? 'Calculated on Net Subtotal base before tax' : 'คำนวณจากฐานภาษีมูลค่ารวมก่อนภาษี (Net Subtotal)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                          Subtotal × 0.07
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#89dceb]">
                          +฿{pricing.vat7Percent.toLocaleString()}
                        </td>
                      </tr>

                      {/* Gross Total */}
                      <tr className="bg-[#181825] border-y border-[#313244]">
                        <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                          <strong>{language === 'en' ? '3. Gross Invoice Total' : '3. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)'}</strong>
                        </td>
                        <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                          Subtotal + VAT 7%
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#cdd6f4] text-sm">
                          ฿{pricing.grossTotalWithVat.toLocaleString()}
                        </td>
                      </tr>

                      {/* WHT 3% */}
                      <tr className="hover:bg-[#181825]/50 transition-colors">
                        <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                          <strong className="text-[#f38ba8]">{language === 'en' ? '4. Withholding Tax 3% (WHT 3%)' : '4. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3%)'}</strong>
                          <span className="block text-[11px] text-[#f38ba8]/90 font-sans">
                            {language === 'en'
                              ? `* Revenue Dept: Must be calculated from Subtotal before VAT (฿${pricing.subtotalBeforeVat.toLocaleString()}), never Gross!`
                              : `* กรมสรรพากรระบุ: ต้องคิดจากยอดก่อน VAT (฿${pricing.subtotalBeforeVat.toLocaleString()}) ห้ามคิดจาก Gross!`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-[#f38ba8] text-[11px]">
                          Subtotal × 0.03
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#f38ba8]">
                          -฿{pricing.wht3Percent.toLocaleString()}
                        </td>
                      </tr>

                      {/* Net Payable to Vendor */}
                      <tr className="bg-[#1e2a3a]/40 border-t-2 border-[#a6e3a1]">
                        <td className="py-3.5 px-4 font-sans text-[#cdd6f4]">
                          <strong className="text-sm text-[#a6e3a1]">
                            {language === 'en' ? '5. Net Payable to Vendor' : '5. ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)'}
                          </strong>
                          <span className="block text-[11px] text-[#a6adc8] font-sans">
                            {language === 'en' ? 'Net statutory amount after withholding tax (Subtotal × 1.04)' : 'ยอดหลังหัก ณ ที่จ่ายตามกฎหมาย (Subtotal × 1.04)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-[#a6e3a1] text-[11px]">
                          Gross Total - WHT 3%
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#a6e3a1] text-base">
                          ฿{pricing.netPayableToVendor.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ฿5,000 ESCROW DEPOSIT SECTION */}
            {activeTab === 'escrow' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Enterprise Credential Inputs */}
                <div className="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#313244]">
                    <span className="text-[10px] font-mono uppercase text-[#a6adc8] font-bold">
                      {language === 'en' ? 'Corporate Credentials for Procurement & Escrow Agreement' : 'ข้อมูลนิติบุคคลสำหรับการออกเอกสารจัดซื้อ & สัญญา Escrow'}
                    </span>
                    {hasAppliedDemoPreset && (
                      <span className="text-[10px] font-mono text-[#a6e3a1] bg-[#a6e3a1]/15 px-2 py-0.5 rounded border border-[#a6e3a1]/30">
                        ✓ Fast-Fill Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'Company / Legal Entity Name:' : 'ชื่อบริษัท / นิติบุคคล:'}</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={language === 'en' ? 'e.g. Acme Innovations Co., Ltd.' : 'เช่น บริษัท บีทูบี เทคเวนเจอร์ จำกัด'}
                        className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#cba6f7]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'Tax ID (13 Digits):' : 'เลขผู้เสียภาษี (Tax ID 13 หลัก):'}</label>
                      <input
                        type="text"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                        placeholder="0105558123456"
                        maxLength={17}
                        className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#585b70] font-mono focus:outline-none focus:border-[#cba6f7]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'Approver Email (CFO / Approver):' : 'อีเมลผู้อนุมัติ (CFO / Approver):'}</label>
                      <input
                        type="email"
                        value={approverEmail}
                        onChange={(e) => setApproverEmail(e.target.value)}
                        placeholder="cfo-approval@techventure.co.th"
                        className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#cba6f7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-[10px] font-bold text-[#a6adc8] uppercase block mb-1.5 font-mono">
                    {language === 'en' ? 'Select Escrow Deposit Payment Method (฿5,000 THB):' : 'เลือกวิธีการชำระเงินมัดจำ Escrow (฿5,000 THB):'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('PROMPTPAY_QR')}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        paymentMethod === 'PROMPTPAY_QR'
                          ? 'bg-[#a6e3a1]/20 border-[#a6e3a1] text-[#a6e3a1]'
                          : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                      }`}
                    >
                      PromptPay B2B QR
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CORPORATE_CARD')}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        paymentMethod === 'CORPORATE_CARD'
                          ? 'bg-[#cba6f7]/20 border-[#cba6f7] text-[#cba6f7]'
                          : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                      }`}
                    >
                      {language === 'en' ? 'Corporate Card (Visa MICE)' : 'บัตรเครดิตองค์กร (Visa MICE)'}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('NET_30_PO')}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        paymentMethod === 'NET_30_PO'
                          ? 'bg-[#89dceb]/20 border-[#89dceb] text-[#89dceb]'
                          : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                      }`}
                    >
                      {language === 'en' ? 'Corporate Billing (Net 30)' : 'วางบิลเครดิตเทอม (Net 30)'}
                    </button>
                  </div>
                </div>

                {/* PromptPay B2B Authentic Offline QR Code (Requirement 4) */}
                {paymentMethod === 'PROMPTPAY_QR' && (
                  <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 flex flex-col items-center shadow-inner">
                    <div className="w-full max-w-xs bg-[#003d79] py-1.5 px-3 rounded-t-lg mb-3 flex items-center justify-between text-white">
                      <span className="font-extrabold text-xs tracking-wider font-sans">THAI QR PAYMENT</span>
                      <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">PromptPay B2B</span>
                    </div>

                    {/* Zero-Dependency SVG QR Component */}
                    <div className="p-2 bg-white rounded-lg border border-slate-200 mb-2">
                      <svg
                        viewBox="0 0 220 220"
                        className="w-44 h-44"
                        shapeRendering="crispEdges"
                      >
                        <rect width="220" height="220" fill="#ffffff" />
                        <path d={qrSvgPath} fill="#000000" />
                      </svg>
                    </div>

                    <div className="text-center font-mono">
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'en' ? 'TripPick Business Travel Solutions Co., Ltd. (Headquarters)' : 'บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด (สำนักงานใหญ่)'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'en' ? 'Tax ID: 0-1055-69018-92-4' : 'เลขประจำตัวผู้เสียภาษี: 0-1055-69018-92-4'}
                      </p>
                      <p className="text-base font-extrabold text-[#003d79] mt-1">
                        ฿5,000.00 THB
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Ref: {escrowDeposit.receiptNo || depositCode} ({language === 'en' ? 'Room' : 'ห้อง'} #{roomId})
                      </p>
                      <div className="mt-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                        🛡️ Zero-Dependency Local EMVCo Standard (Offline Ready)
                      </div>
                    </div>
                  </div>
                )}

                {/* Corporate Card Mock */}
                {paymentMethod === 'CORPORATE_CARD' && (
                  <div className="p-4 rounded-xl bg-[#11111b] border border-[#313244] text-xs font-mono text-[#a6adc8] space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-[#cdd6f4]">
                      <span>VISA CORPORATE B2B PLATINUM</span>
                      <span className="text-[#a6e3a1]">ACTIVE</span>
                    </div>
                    <div className="text-base tracking-widest text-[#cdd6f4]">
                      •••• •••• •••• 4242
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>EXP: 12/28 | CVC: •••</span>
                      <span>HOLDER: {companyName}</span>
                    </div>
                  </div>
                )}

                {/* Net-30 PO Mock */}
                {paymentMethod === 'NET_30_PO' && (
                  <div className="p-4 rounded-xl bg-[#11111b] border border-[#313244] text-xs text-[#a6adc8] space-y-1">
                    <div className="font-bold text-[#cdd6f4]">{language === 'en' ? 'Corporate Purchase Order (Net 30 PO)' : 'ใบสั่งซื้อระดับองค์กร (Corporate Purchase Order)'}</div>
                    <p className="text-[11px]">
                      {language === 'en'
                        ? `30-Day Credit terms (Net 30) will dispatch billing invoice directly to ${approverEmail} automatically`
                        : `เงื่อนไขการวางบิลระยะเวลา 30 วัน (Net 30) จะออกเอกสารแจ้งหนี้ไปยัง ${approverEmail} โดยอัตโนมัติ`}
                    </p>
                  </div>
                )}

                {/* One-Click Escrow Deposit Button */}
                {!isEscrowLocked ? (
                  <button
                    onClick={confirmEscrow}
                    className="w-full py-3.5 px-5 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>{language === 'en' ? 'Confirm ฿5,000 Escrow Deposit & Lock' : 'ยืนยันมัดจำล็อกสิทธิ์ (฿5,000 Escrow Deposit)'}</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-[#1e2a3a] border border-[#a6e3a1] text-center space-y-2">
                    <div className="text-sm font-bold text-[#a6e3a1] flex items-center justify-center gap-1.5">
                      <span>✓</span>
                      <span>{language === 'en' ? 'Escrow Deposit Secured & Inventory Locked' : 'ล็อกสิทธิ์และชำระเงินมัดจำ Escrow เรียบร้อยแล้ว'}</span>
                    </div>
                    <div className="text-xs font-mono text-[#cdd6f4]">
                      {language === 'en' ? 'Confirmation Ref:' : 'รหัสรับรองสิทธิ์:'} {escrowDeposit.receiptNo}
                    </div>
                    <p className="text-[11px] text-[#a6adc8]">
                      {language === 'en'
                        ? 'System has disabled duplicate payment requests and synchronized real-time status across all devices.'
                        : 'ระบบทำการปิดปุ่มชำระเงินซ้ำซ้อน และซิงค์สถานะไปยังทุกอุปกรณ์ในห้องแล้ว'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Modal Footer / Action Toolbar */}
          <div className="no-print p-4 sm:px-6 bg-[#1e1e2e] border-t border-[#313244] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] font-mono text-[#a6adc8]">
              Ref: <strong className="text-[#cdd6f4]">{proposalRef}</strong> | Room: <strong className="text-[#cba6f7]">#{roomId}</strong> | <span className="hidden sm:inline">{language === 'th' ? `วันที่: ${issueDateFormatted}` : `Date: ${issueDateFormatted}`}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportToCsv}
                className="py-1.5 px-3 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                title="CSV Export"
              >
                <span>{t.exportCsvBtn}</span>
              </button>

              <button
                onClick={exportToGoogleSheetsTsv}
                className="py-1.5 px-3 bg-[#1e3a2f] hover:bg-[#254b3c] border border-[#a6e3a1]/40 text-[#a6e3a1] rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                title="Google Sheets"
              >
                <span>{t.exportSheetsBtn} ↗</span>
              </button>

              <button
                onClick={generateGoogleDocsMarkdown}
                className="py-1.5 px-3 bg-[#1e2a3a] hover:bg-[#25354b] border border-[#89b4fa]/40 text-[#89b4fa] rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                title="Google Docs"
              >
                <span>{t.exportDocsBtn} ↗</span>
              </button>

              <button
                onClick={printQuotation}
                className="py-1.5 px-3.5 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.255.438-2.54 1.62-3.042l10.87-4.606c1.196-.507 2.533.15 2.822 1.417l2.673 11.666c.29 1.266-.462 2.54-1.728 2.83l-10.87 2.49c-1.266.29-2.533-.46-2.823-1.727L6.72 13.83z" />
                </svg>
                <span>{t.printRfpBtn}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
