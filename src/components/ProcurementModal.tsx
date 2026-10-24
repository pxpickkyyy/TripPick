import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser } from '../hooks/useTripPick';
import { useProcurement } from '../hooks/useProcurement';
import { generatePromptPayPayload, generateQrSvgPath } from '../lib/promptpay';
import type { DepositReceipt } from '../hooks/useTripPick';
import { useLanguage } from '../lib/i18n';
import { SubscriptionLockModal } from './SubscriptionLockModal';
import { validateThaiTaxId, formatThaiTaxId } from '../utils/taxCompliance';

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
  const { language, t, localizeDestination } = useLanguage();
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
    printQuotation,
    isGeneratingPdf,
    hotelServiceChargePercent,
    setHotelServiceChargePercent,
    toastMessage,
  } = useProcurement({
    destination: matchedDestination,
    initialHeadcount: users.length,
    initialNights: 3,
    takeRatePercent: 12,
    roomId,
    depositStatus,
    depositReceipt,
    language,
    onConfirmDeposit,
  });

  const [showSubModal, setShowSubModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');

  const [activeTab, setActiveTab] = useState<'invoice' | 'escrow'>('invoice');

  // Compute Modulus 11 Real-Time Validation
  const taxValidation = useMemo(() => {
    return validateThaiTaxId(companyTaxId);
  }, [companyTaxId]);

  // Compute 100% offline EMVCo PromptPay QR Code Payload
  const promptPayPayload = useMemo(() => {
    return generatePromptPayPayload({
      target: taxValidation.digits || '0105558123456',
      amount: 5000,
      referenceNo: escrowDeposit.receiptNo || depositCode,
    });
  }, [taxValidation.digits, escrowDeposit.receiptNo, depositCode]);

  // Generate deterministic SVG QR Matrix
  const qrSvgPath = useMemo(() => {
    return generateQrSvgPath(promptPayPayload, 220);
  }, [promptPayPayload]);

  if (!isOpen) return null;

  const localizedDest = matchedDestination ? localizeDestination(matchedDestination) : null;
  const destinationTitle = localizedDest?.title || 'TripPick Corporate Retreat';
  const destinationCity = localizedDest?.city || 'Thailand';
  const destinationCountry = localizedDest?.country || '';

  const issueDateFormatted = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[65] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#11111b]/85 backdrop-blur-[24px] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', mass: 0.8, stiffness: 280, damping: 24 }}
          className="w-full max-w-4xl my-auto p-2 rounded-[2rem] bg-[#181825] border border-[#313244] shadow-[0_32px_96px_rgba(17,17,27,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
        >
          <div className="w-full flex-1 flex flex-col overflow-hidden rounded-[calc(2rem-6px)] bg-[#1e1e2e] border border-[#313244]">
            {/* Modal Header */}
            <div className="no-print p-4 sm:px-6 bg-[#181825] border-b border-[#313244] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#cba6f7]/15 border border-[#cba6f7]/35 flex items-center justify-center text-[#cba6f7]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-sm sm:text-base font-bold text-[#cdd6f4] tracking-[-0.02em]">
                      {t.procurementModalTitle}
                    </h2>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/35">
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
                  className="w-8 h-8 rounded-full bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#a6adc8] hover:text-[#f38ba8] flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors"
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
                className="no-print bg-[#a6e3a1]/15 border-b border-[#a6e3a1]/40 px-4 py-2 text-center text-xs font-semibold text-[#a6e3a1]"
              >
                {toastMessage}
              </motion.div>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-left">
              {/* DEMO FAILSAFE: 1-Click Fast Fill Header Button */}
              <div className="no-print p-3.5 rounded-2xl bg-[#181825] border border-[#cba6f7]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <span className="text-xs font-bold text-[#cba6f7] block">
                      {language === 'en' ? 'Demo Failsafe: 1-Click Fast Fill for Stage Presentations' : 'Demo Failsafe: 1-Click Fast Fill สำหรับพรีเซนต์บนเวที'}
                    </span>
                    <span className="text-[11px] text-[#bac2de]">
                      {language === 'en' ? 'Click to auto-populate company name, 13-digit Tax ID, and CFO approver email in 1 second' : 'คลิกเพื่อกรอกชื่อบริษัท, เลขประจำตัวผู้เสียภาษี 13 หลัก, และอีเมลผู้อนุมัติอัตโนมัติใน 1 วินาที'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => applyDemoPreset()}
                  className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-[#cba6f7] to-[#fab387] hover:opacity-95 text-[#11111b] text-xs font-extrabold rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>{language === 'en' ? '⚡ Populate Tech Startup Data (Demo Fast-Fill)' : '⚡ จำลองข้อมูลบริษัท Tech Startup (Demo Fast-Fill)'}</span>
                </button>
              </div>

              {/* Escrow Locked Alert Banner (If already secured) */}
              {isEscrowLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-[#a6e3a1]/15 border border-[#a6e3a1]/45 flex items-center justify-between gap-3 shadow-sm"
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

                  <div className="px-3 py-1 rounded-full bg-[#a6e3a1] text-[#11111b] text-[11px] font-mono font-extrabold shrink-0">
                    SECURED ฿5,000
                  </div>
                </motion.div>
              )}

              {/* Top Interactive Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Stepper: Headcount */}
                <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#a6adc8]">{language === 'en' ? 'Headcount' : 'จำนวนผู้เข้าร่วม (Headcount)'}</span>
                    <span className="text-xs font-bold text-[#cba6f7] font-mono tabular-data">{headcount} {language === 'en' ? 'Guests' : 'ท่าน'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHeadcount((prev) => Math.max(4, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
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
                      className="w-8 h-8 rounded-xl bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stepper: Duration */}
                <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#a6adc8]">{language === 'en' ? 'Duration (Nights)' : 'ระยะเวลาสัมมนา (Nights)'}</span>
                    <span className="text-xs font-bold text-[#cba6f7] font-mono tabular-data">{nights} {language === 'en' ? 'Nights' : 'คืน'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNights((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="flex-1 accent-[#cba6f7] cursor-pointer"
                    />
                    <button
                      onClick={() => setNights((prev) => Math.min(14, prev + 1))}
                      className="w-8 h-8 rounded-xl bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* TripPick Platform Yield Card */}
                <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#cba6f7]/40 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#cba6f7] font-bold">
                      TRIPPICK TAKE-RATE (12%)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#a6e3a1]/15 text-[#a6e3a1] font-bold">
                      MAKE ME MONEY
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-[#f5e0dc] font-mono tracking-tight tabular-data">
                      ฿{pricing.tripPickRevenue.toLocaleString()} THB
                    </div>
                    <div className="text-[10px] text-[#a6adc8] tabular-data">
                      {language === 'en' ? 'From Gross Booking Value: ฿' : 'จาก Gross Booking Value: ฿'}{pricing.grossBookingValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Mini Dossier */}
              <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {matchedDestination?.hero_image && (
                    <img
                      src={matchedDestination.hero_image}
                      alt={destinationTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-[#313244] shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#cdd6f4]">{destinationTitle}</span>
                      <span className="text-[10px] text-[#a6adc8]">({destinationCity}, {destinationCountry})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#bac2de]">
                      <span className="px-2 py-0.5 rounded-full bg-[#1e1e2e] border border-[#313244]">
                        ★ {matchedDestination?.rating || 4.9}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#a6e3a1]/15 border border-[#a6e3a1]/30 text-[#a6e3a1]">
                        ⚡ Starlink {matchedDestination?.wifi_speed_mbps || 350} Mbps SLA
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#1e1e2e] border border-[#313244]">
                        👥 {language === 'en' ? `Capacity: ${matchedDestination?.max_capacity || 20} guests` : `รองรับสูงสุด ${matchedDestination?.max_capacity || 20} ท่าน`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] text-[#a6adc8] block">{language === 'en' ? 'Rate per guest:' : 'อัตราค่าบริการต่อท่าน:'}</span>
                  <span className="font-mono font-bold text-[#fab387] text-sm tabular-data">
                    ฿{pricing.ratePerHeadPerNight.toLocaleString()} / {language === 'en' ? 'night' : 'คืน'}
                  </span>
                </div>
              </div>

              {/* TAB SELECTOR: B2B INVOICE BREAKDOWN vs. ฿5,000 ESCROW DEPOSIT */}
              <div className="flex rounded-full bg-[#181825] border border-[#313244] p-1 select-none">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'invoice'
                      ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] shadow-sm'
                      : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                  }`}
                >
                  <span>📊 {t.tabInvoice}</span>
                </button>

                <button
                  onClick={() => setActiveTab('escrow')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'escrow'
                      ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] shadow-sm'
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
                  <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] text-[11px] text-[#bac2de] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#cba6f7] text-base">⚖️</span>
                      <span>
                        {language === 'en'
                          ? <>Tax calculation per Thai Revenue Dept: <strong className="text-[#cdd6f4]">3% Withholding Tax (Services, Tor.Por. 4/2528) applies to Subtotal before VAT only</strong></>
                          : <>คำนวณภาษีตามระเบียบกรมสรรพากร: <strong className="text-[#cdd6f4]">ภาษีหัก ณ ที่จ่าย 3% (หมวดบริการ ท.ป. 4/2528) คำนวณจากยอดก่อน VAT เท่านั้น</strong></>}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#a6e3a1] uppercase font-bold tracking-wider hidden sm:inline">
                      100% Tax Compliant
                    </span>
                  </div>

                  {/* Hotel 10% Service Charge Awareness Card */}
                  <div className="p-3.5 rounded-2xl bg-[#181825] border border-[#313244] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="hotel-service-charge-toggle"
                        checked={hotelServiceChargePercent === 10}
                        onChange={(e) => setHotelServiceChargePercent(e.target.checked ? 10 : 0)}
                        className="w-4 h-4 accent-[#cba6f7] rounded cursor-pointer"
                      />
                      <label htmlFor="hotel-service-charge-toggle" className="cursor-pointer">
                        <span className="font-bold text-[#cdd6f4] block">
                          {language === 'en'
                            ? 'Hotel 10% Service Charge Awareness (Hospitality MICE Standard)'
                            : 'รวมค่าบริการโรงแรม 10% (Hospitality MICE Service Charge)'}
                        </span>
                        <span className="text-[10px] text-[#a6adc8] block">
                          {language === 'en'
                            ? 'Per Revenue Dept rules: WHT 3% applies to service charge before VAT 7% (Unified Base)'
                            : 'ระเบียบกรมสรรพากร: ภาษีหัก ณ ที่จ่าย 3% คิดจากฐานค่าบริการรวมค่า Service Charge ก่อน VAT'}
                        </span>
                      </label>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-[#cba6f7] tabular-data">
                      {hotelServiceChargePercent === 10
                        ? `+฿${pricing.hotelServiceChargeAmount?.toLocaleString()} THB (10%)`
                        : '0% (Optional MICE)'}
                    </div>
                  </div>

                  {/* Tabular Financial Breakdown */}
                  <div className="rounded-2xl border border-[#313244] overflow-hidden bg-[#181825]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1e1e2e] text-[#a6adc8] uppercase font-mono text-[10px] border-b border-[#313244]">
                        <tr>
                          <th className="py-2.5 px-4">{language === 'en' ? 'Financial Line Items' : 'รายการการเงิน (Financial Line Items)'}</th>
                          <th className="py-2.5 px-4 text-center">{language === 'en' ? 'Formula' : 'สูตรการคำนวณ'}</th>
                          <th className="py-2.5 px-4 text-right">{language === 'en' ? 'Amount (THB)' : 'จำนวนเงิน (THB)'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#313244] font-mono tabular-data">
                        {/* Subtotal before VAT */}
                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors">
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

                        {/* Optional Hotel 10% Service Charge */}
                        {Boolean(pricing.hotelServiceChargeAmount && pricing.hotelServiceChargeAmount > 0) && (
                          <>
                            <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#cba6f7]/[0.06]">
                              <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                                <strong>{language === 'en' ? '2. Hotel Service Charge (10%)' : '2. ค่าบริการโรงแรม 10% (Hotel Service Charge)'}</strong>
                                <span className="block text-[11px] text-[#a6adc8] font-sans">
                                  {language === 'en' ? 'Luxury MICE hotel service fee (10% of subtotal)' : 'ค่าบริการมาตรฐานโรงแรม MICE (10% ของยอดที่พัก)'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                                Subtotal × 0.10
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-[#cba6f7]">
                                +฿{pricing.hotelServiceChargeAmount?.toLocaleString()}
                              </td>
                            </tr>

                            <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#1e1e2e]">
                              <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                                <strong>{language === 'en' ? '3. Pre-VAT Service Fee Base' : '3. ฐานค่าบริการรวมก่อนภาษี (Service Fee Base)'}</strong>
                                <span className="block text-[11px] text-[#a6adc8] font-sans">
                                  {language === 'en' ? 'Base for statutory VAT 7% and pre-VAT WHT 3%' : 'ฐานภาษีมูลค่าเพิ่มและภาษีหัก ณ ที่จ่าย'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                                Subtotal + Service Charge
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-[#cdd6f4]">
                                ฿{pricing.serviceFeeBase.toLocaleString()}
                              </td>
                            </tr>
                          </>
                        )}

                        {/* VAT 7% */}
                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong>{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '4.' : '2.'} Value Added Tax 7% (VAT 7%)` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '4.' : '2.'} ภาษีมูลค่าเพิ่ม 7% (VAT 7%)`}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {language === 'en' ? 'Calculated on Service Fee Base before tax' : 'คำนวณจากฐานค่าบริการรวมก่อนภาษี'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                            {(pricing.hotelServiceChargeAmount || 0) > 0 ? 'Base × 0.07' : 'Subtotal × 0.07'}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-[#cba6f7]">
                            +฿{pricing.vat7Percent.toLocaleString()}
                          </td>
                        </tr>

                        {/* Gross Total */}
                        <tr className="bg-[#1e1e2e] border-y border-[#313244]">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong>{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '5.' : '3.'} Gross Invoice Total` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '5.' : '3.'} ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)`}</strong>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                            {(pricing.hotelServiceChargeAmount || 0) > 0 ? 'Base + VAT 7%' : 'Subtotal + VAT 7%'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#cdd6f4] text-sm">
                            ฿{pricing.grossTotalWithVat.toLocaleString()}
                          </td>
                        </tr>

                        {/* WHT 3% */}
                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong className="text-[#fab387]">{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '6.' : '4.'} Withholding Tax 3% (WHT 3%)` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '6.' : '4.'} ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3%)`}</strong>
                            <span className="block text-[11px] text-[#fab387]/90 font-sans">
                              {language === 'en'
                                ? `* Revenue Dept: Must be calculated from Subtotal / Base before VAT (฿${pricing.serviceFeeBase.toLocaleString()}), never Gross!`
                                : `* กรมสรรพากรระบุ: ต้องคิดจากยอดก่อน VAT (฿${pricing.serviceFeeBase.toLocaleString()}) ห้ามคิดจาก Gross!`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#fab387] text-[11px]">
                            {(pricing.hotelServiceChargeAmount || 0) > 0 ? 'Base × 0.03' : 'Subtotal × 0.03'}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-[#fab387]">
                            -฿{pricing.wht3Percent.toLocaleString()}
                          </td>
                        </tr>

                        {/* Net Payable to Vendor */}
                        <tr className="bg-[#cba6f7]/[0.08] border-t-2 border-[#cba6f7]">
                          <td className="py-3.5 px-4 font-sans text-[#cdd6f4]">
                            <strong className="text-sm text-[#cba6f7]">
                              {language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '7.' : '5.'} Net Payable to Vendor` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '7.' : '5.'} ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)`}
                            </strong>
                            <span className="block text-[11px] text-[#bac2de] font-sans">
                              {language === 'en' ? 'Net statutory amount after withholding tax (Base × 1.04)' : 'ยอดหลังหัก ณ ที่จ่ายตามกฎหมาย (Base × 1.04)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#cba6f7] text-[11px]">
                            Gross Total - WHT 3%
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-[#f5e0dc] text-base">
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
                  <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#313244]">
                      <span className="text-[10px] font-mono uppercase text-[#bac2de] font-bold">
                        {language === 'en' ? 'Corporate Credentials for Procurement & Escrow Agreement' : 'ข้อมูลนิติบุคคลสำหรับการออกเอกสารจัดซื้อ & สัญญา Escrow'}
                      </span>
                      {hasAppliedDemoPreset && (
                        <span className="text-[10px] font-mono text-[#a6e3a1] bg-[#a6e3a1]/15 px-2 py-0.5 rounded-full border border-[#a6e3a1]/30">
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
                          className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#cba6f7]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-[#a6adc8] font-mono">{language === 'en' ? 'Tax ID (13 Digits):' : 'เลขผู้เสียภาษี (Tax ID 13 หลัก):'}</label>
                          {taxValidation.isValid && (
                            <span className="text-[9px] font-mono font-bold text-[#a6e3a1]">✓ DBD VERIFIED</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={companyTaxId}
                          onChange={(e) => {
                            const formatted = formatThaiTaxId(e.target.value);
                            setCompanyTaxId(formatted);
                          }}
                          placeholder="X-XXXX-XXXXX-XX-X"
                          maxLength={17}
                          className={`w-full py-2.5 px-3 rounded-xl bg-[#1e1e2e] border text-xs text-[#cdd6f4] placeholder-[#6c7086] font-mono focus:outline-none transition-colors ${
                            taxValidation.isValid
                              ? 'border-[#a6e3a1] focus:border-[#a6e3a1]'
                              : taxValidation.isComplete
                                ? 'border-[#f38ba8] focus:border-[#f38ba8]'
                                : taxValidation.digits.length > 0
                                  ? 'border-[#fab387] focus:border-[#fab387]'
                                  : 'border-[#313244] focus:border-[#cba6f7]'
                          }`}
                        />
                        {taxValidation.digits.length > 0 && (
                          <div className="mt-1 text-[10px] font-mono">
                            {taxValidation.isValid ? (
                              <span className="text-[#a6e3a1] flex items-center gap-1">
                                <span>✓</span>
                                <span>{language === 'en' ? 'Valid Thai Corporate Tax ID (DBD Modulus 11 Passed)' : '✓ ตรวจสอบผ่านเกณฑ์ DBD (Modulus 11 ผ่าน)'}</span>
                              </span>
                            ) : taxValidation.isComplete ? (
                              <span className="text-[#f38ba8] flex items-center gap-1">
                                <span>❌</span>
                                <span>{language === 'en' ? 'Checksum Failed: Invalid Modulus 11 check digit' : taxValidation.error}</span>
                              </span>
                            ) : (
                              <span className="text-[#fab387] flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{language === 'en' ? `Incomplete: ${taxValidation.digits.length}/13 digits` : taxValidation.error}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'Approver Email (CFO / Approver):' : 'อีเมลผู้อนุมัติ (CFO / Approver):'}</label>
                        <input
                          type="email"
                          value={approverEmail}
                          onChange={(e) => setApproverEmail(e.target.value)}
                          placeholder="cfo-approval@techventure.co.th"
                          className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#cba6f7]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-[#bac2de] uppercase block mb-1.5 font-mono">
                      {language === 'en' ? 'Select Escrow Deposit Payment Method (฿5,000 THB):' : 'เลือกวิธีการชำระเงินมัดจำ Escrow (฿5,000 THB):'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('PROMPTPAY_QR')}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          paymentMethod === 'PROMPTPAY_QR'
                            ? 'bg-[#cba6f7]/15 border-[#cba6f7] text-[#cba6f7]'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        PromptPay B2B QR
                      </button>
                      <button
                        onClick={() => setPaymentMethod('CORPORATE_CARD')}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          paymentMethod === 'CORPORATE_CARD'
                            ? 'bg-[#fab387]/20 border-[#fab387] text-[#cdd6f4]'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        {language === 'en' ? 'Corporate Card (Visa MICE)' : 'บัตรเครดิตองค์กร (Visa MICE)'}
                      </button>
                      <button
                        onClick={() => setPaymentMethod('NET_30_PO')}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          paymentMethod === 'NET_30_PO'
                            ? 'bg-[#a6e3a1]/15 border-[#a6e3a1] text-[#a6e3a1]'
                            : 'bg-[#181825] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        {language === 'en' ? 'Corporate Billing (Net 30)' : 'วางบิลเครดิตเทอม (Net 30)'}
                      </button>
                    </div>
                  </div>

                  {/* PromptPay B2B Authentic Offline QR Code */}
                  {paymentMethod === 'PROMPTPAY_QR' && (
                    <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 flex flex-col items-center shadow-inner">
                      <div className="w-full max-w-xs bg-[#003d79] py-1.5 px-3 rounded-t-lg mb-3 flex items-center justify-between text-white">
                        <span className="font-extrabold text-xs tracking-wider font-sans">THAI QR PAYMENT</span>
                        <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">PromptPay B2B</span>
                      </div>

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
                    <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244] text-xs font-mono text-[#bac2de] space-y-2">
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
                    <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244] text-xs text-[#bac2de] space-y-1">
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
                      disabled={!taxValidation.isValid}
                      className={`w-full py-3.5 px-5 text-sm font-extrabold rounded-full transition-all shadow-lg flex items-center justify-center gap-2 ${
                        taxValidation.isValid
                          ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] cursor-pointer active:scale-[0.98]'
                          : 'bg-[#181825] text-[#6c7086] cursor-not-allowed opacity-60'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <span>{language === 'en' ? 'Confirm ฿5,000 Escrow Deposit & Lock' : 'ยืนยันมัดจำล็อกสิทธิ์ (฿5,000 Escrow Deposit)'}</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#a6e3a1]/12 border border-[#a6e3a1]/45 text-center space-y-2">
                      <div className="text-sm font-bold text-[#a6e3a1] flex items-center justify-center gap-1.5">
                        <span>✓</span>
                        <span>{language === 'en' ? 'Escrow Deposit Secured & Inventory Locked' : 'ล็อกสิทธิ์และชำระเงินมัดจำ Escrow เรียบร้อยแล้ว'}</span>
                      </div>
                      <div className="text-xs font-mono text-[#cdd6f4]">
                        {language === 'en' ? 'Confirmation Ref:' : 'รหัสรับรองสิทธิ์:'} {escrowDeposit.receiptNo}
                      </div>
                      <p className="text-[11px] text-[#bac2de]">
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
            <div className="no-print p-4 sm:px-6 bg-[#181825] border-t border-[#313244] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="text-[11px] font-mono text-[#a6adc8]">
                Ref: <strong className="text-[#cdd6f4]">{proposalRef}</strong> | Room: <strong className="text-[#cba6f7]">#{roomId}</strong> | <span className="hidden sm:inline">{language === 'th' ? `วันที่: ${issueDateFormatted}` : `Date: ${issueDateFormatted}`}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportToCsv}
                  className="py-1.5 px-3.5 bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  title="CSV Export"
                >
                  <span>{t.exportCsvBtn}</span>
                </button>

                <button
                  onClick={() => {
                    setLockedFeatureName(language === 'th' ? 'ระบบส่งออก Google Sheets อัตโนมัติ' : 'Automated Google Sheets RFP Export');
                    setShowSubModal(true);
                  }}
                  className="py-1.5 px-3.5 bg-[#cba6f7]/15 hover:bg-[#cba6f7]/25 border border-[#cba6f7]/35 text-[#cba6f7] rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                >
                  <span>🔒 {t.exportSheetsBtn} (PRO)</span>
                </button>

                <button
                  onClick={() => {
                    setLockedFeatureName(language === 'th' ? 'ระบบส่งออก Google Docs อัตโนมัติ' : 'Automated Google Docs RFP Export');
                    setShowSubModal(true);
                  }}
                  className="py-1.5 px-3.5 bg-[#fab387]/15 hover:bg-[#fab387]/25 border border-[#fab387]/40 text-[#fab387] rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                >
                  <span>🔒 {t.exportDocsBtn} (PRO)</span>
                </button>

                <button
                  onClick={printQuotation}
                  disabled={isGeneratingPdf}
                  className="py-1.5 px-4 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] rounded-full text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.255.438-2.54 1.62-3.042l10.87-4.606c1.196-.507 2.533.15 2.822 1.417l2.673 11.666c.29 1.266-.462 2.54-1.728 2.83l-10.87 2.49c-1.266.29-2.533-.46-2.823-1.727L6.72 13.83z" />
                  </svg>
                  <span>{isGeneratingPdf ? (language === 'en' ? 'Generating PDF...' : 'กำลังสร้าง PDF...') : t.printRfpBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subscription Lock Modal */}
      <SubscriptionLockModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        featureName={lockedFeatureName}
      />
    </AnimatePresence>
  );
};
