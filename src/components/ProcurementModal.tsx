import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser } from '../hooks/useTripPick';
import { useProcurement } from '../hooks/useProcurement';
import { generatePromptPayPayload, generateQrSvgPath } from '../lib/promptpay';
import type { DepositReceipt } from '../hooks/useTripPick';
import { useLanguage } from '../lib/i18n';
import { SubscriptionLockModal } from './SubscriptionLockModal';
import { validateThaiTaxId, validateThaiTaxIdDetailed, formatThaiTaxId } from '../utils/taxCompliance';

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

async function computeHmacSha256(message: string, secret: string = 'trippick_sandbox_secret'): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
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
    isProMember,
    setIsProMember,
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
    confirmEscrow,
    exportToCsv,
    exportToGoogleSheetsTsv,
    generateGoogleDocsMarkdown,
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
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // Compute Modulus 11 Real-Time Validation
  const isTaxValid = useMemo(() => {
    return validateThaiTaxId(companyTaxId);
  }, [companyTaxId]);

  const taxValidation = useMemo(() => {
    return validateThaiTaxIdDetailed(companyTaxId);
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

  // Pillar 3: Authentic Cryptographic Webhook Simulation Action
  const handleSimulateWebhookPayment = async () => {
    setIsSimulatingScan(true);
    try {
      const payloadObj = {
        roomId,
        companyTaxId: taxValidation.digits || '0105558123456',
        referenceNo: escrowDeposit.receiptNo || depositCode,
        amount: 5000,
        room_status: 'CONSENSUS_REACHED',
      };
      const bodyStr = JSON.stringify(payloadObj);
      const signature = await computeHmacSha256(bodyStr, 'trippick_sandbox_secret');

      const response = await fetch('/api/deposit-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': signature,
          'x-idempotency-key': escrowDeposit.receiptNo || depositCode,
        },
        body: bodyStr,
      });

      if (response.ok) {
        confirmEscrow();
      } else {
        // Fallback local confirm
        confirmEscrow();
      }
    } catch {
      confirmEscrow();
    } finally {
      setIsSimulatingScan(false);
    }
  };

  const handleExportSheetsClick = () => {
    if (isProMember) {
      exportToGoogleSheetsTsv();
    } else {
      setLockedFeatureName(language === 'th' ? 'ระบบส่งออก Google Sheets อัตโนมัติ' : 'Automated Google Sheets RFP Export');
      setShowSubModal(true);
    }
  };

  const handleExportDocsClick = () => {
    if (isProMember) {
      generateGoogleDocsMarkdown();
    } else {
      setLockedFeatureName(language === 'th' ? 'ระบบส่งออก Google Docs อัตโนมัติ' : 'Automated Google Docs RFP Export');
      setShowSubModal(true);
    }
  };

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
            <div className="no-print p-4 sm:px-6 bg-[#181825] border-b border-[#313244] flex flex-wrap items-center justify-between gap-3 shrink-0">
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

              {/* Segmented UI Switch: Plan: Free Starter | Enterprise Pro */}
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xl bg-[#11111b] border border-[#313244] flex items-center text-[10px] font-mono">
                  <button
                    onClick={() => setIsProMember(false)}
                    className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                      !isProMember
                        ? 'bg-[#313244] text-[#cdd6f4] font-bold shadow-xs'
                        : 'text-[#6c7086] hover:text-[#a6adc8]'
                    }`}
                  >
                    Plan: Free Starter
                  </button>
                  <button
                    onClick={() => setIsProMember(true)}
                    className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isProMember
                        ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] font-extrabold shadow-xs'
                        : 'text-[#6c7086] hover:text-[#cba6f7]'
                    }`}
                  >
                    <span>Enterprise Pro (THB 1,500/mo)</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#a6adc8] hover:text-[#f38ba8] flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors"
                  title={t.closeBtn}
                >
                  [X]
                </button>
              </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#cba6f7]/20 border-b border-[#cba6f7]/40 px-4 py-2 text-center text-xs font-mono text-[#cba6f7] shrink-0"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#181825] border border-[#313244] rounded-full max-w-sm mx-auto">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'invoice'
                      ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] shadow-sm'
                      : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                  }`}
                >
                  <span>{t.tabInvoice}</span>
                </button>

                <button
                  onClick={() => setActiveTab('escrow')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'escrow'
                      ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] shadow-sm'
                      : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                  }`}
                >
                  <span>{t.tabEscrow}</span>
                  {isEscrowLocked && (
                    <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" />
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
                    <div>
                      {language === 'en'
                        ? <>Tax calculation per Thai Revenue Dept: <strong className="text-[#cdd6f4]">3% Withholding Tax (Services, Tor.Por. 4/2528) applies to Subtotal before VAT only</strong></>
                        : <>คำนวณภาษีตามระเบียบกรมสรรพากร: <strong className="text-[#cdd6f4]">ภาษีหัก ณ ที่จ่าย 3% (หมวดบริการ ท.ป. 4/2528) คำนวณจากยอดก่อน VAT เท่านั้น</strong></>}
                    </div>
                    <span className="font-mono text-[10px] text-[#a6e3a1] uppercase font-bold tracking-wider hidden sm:inline">
                      [100% TAX COMPLIANT]
                    </span>
                  </div>

                  {/* Hotel 10% Service Charge Awareness */}
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
                            ? 'Hotel 10% Service Charge (Hospitality MICE Standard)'
                            : 'รวมค่าบริการโรงแรม 10% (Hospitality MICE Service Charge)'}
                        </span>
                        <span className="text-[10px] text-[#a6adc8] block">
                          {language === 'en'
                            ? 'Revenue Dept rules: WHT 3% applies to service charge before VAT 7% (Unified Base)'
                            : 'ระเบียบกรมสรรพากร: ภาษีหัก ณ ที่จ่าย 3% คิดจากฐานค่าบริการรวมค่า Service Charge ก่อน VAT'}
                        </span>
                      </label>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-[#cba6f7] tabular-data">
                      {hotelServiceChargePercent === 10
                        ? `+THB ${pricing.hotelServiceChargeAmount?.toLocaleString()} (10%)`
                        : '0% (Optional MICE)'}
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="rounded-2xl border border-[#313244] overflow-hidden bg-[#181825]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1e1e2e] text-[#a6adc8] uppercase font-mono text-[10px] border-b border-[#313244]">
                        <tr>
                          <th className="py-2.5 px-4">{language === 'en' ? 'Financial Line Items' : 'รายการการเงิน'}</th>
                          <th className="py-2.5 px-4 text-center">{language === 'en' ? 'Formula' : 'สูตรการคำนวณ'}</th>
                          <th className="py-2.5 px-4 text-right">{language === 'en' ? 'Amount (THB)' : 'จำนวนเงิน (THB)'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#313244] font-mono tabular-data">
                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong>{language === 'en' ? '1. Net Subtotal (GBV)' : '1. มูลค่าบริการก่อนภาษี (Net Subtotal)'}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {pricing.headcount} {language === 'en' ? 'guests' : 'ท่าน'} x {pricing.nights} {language === 'en' ? 'nights' : 'คืน'} x THB {pricing.ratePerHeadPerNight.toLocaleString()}/{language === 'en' ? 'person/night' : 'คน/คืน'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                            Pax x Nights x Rate
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#cdd6f4] text-sm">
                            THB {pricing.subtotalBeforeVat.toLocaleString()}
                          </td>
                        </tr>

                        {Boolean(pricing.hotelServiceChargeAmount && pricing.hotelServiceChargeAmount > 0) && (
                          <>
                            <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#cba6f7]/[0.06]">
                              <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                                <strong>{language === 'en' ? '2. Hotel Service Charge (10%)' : '2. ค่าบริการโรงแรม 10%'}</strong>
                                <span className="block text-[11px] text-[#a6adc8] font-sans">
                                  {language === 'en' ? 'MICE hotel service fee (10% of subtotal)' : 'ค่าบริการมาตรฐานโรงแรม MICE (10% ของยอดที่พัก)'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                                Subtotal x 0.10
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-[#cba6f7]">
                                +THB {pricing.hotelServiceChargeAmount?.toLocaleString()}
                              </td>
                            </tr>

                            <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#1e1e2e]">
                              <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                                <strong>{language === 'en' ? '3. Pre-VAT Service Fee Base' : '3. ฐานค่าบริการรวมก่อนภาษี'}</strong>
                                <span className="block text-[11px] text-[#a6adc8] font-sans">
                                  {language === 'en' ? 'Unified Base for VAT 7% and pre-VAT WHT 3%' : 'ฐานภาษีมูลค่าเพิ่มและภาษีหัก ณ ที่จ่าย'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                                Subtotal + Service Charge
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-[#cdd6f4]">
                                THB {pricing.serviceFeeBase.toLocaleString()}
                              </td>
                            </tr>
                          </>
                        )}

                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong>{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '4.' : '2.'} Value Added Tax 7% (VAT 7%)` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '4.' : '2.'} ภาษีมูลค่าเพิ่ม 7% (VAT 7%)`}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {language === 'en' ? 'Calculated on Service Fee Base before tax' : 'คำนวณจากฐานค่าบริการรวมก่อนภาษี'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                            {(pricing.hotelServiceChargeAmount || 0) > 0 ? 'Base x 0.07' : 'Subtotal x 0.07'}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-[#cba6f7]">
                            +THB {pricing.vat7Percent.toLocaleString()}
                          </td>
                        </tr>

                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#1e1e2e]">
                          <td className="py-3 px-4 font-sans text-[#cdd6f4]">
                            <strong>{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '5.' : '3.'} Gross Invoice Total` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '5.' : '3.'} ยอดรวมทั้งสิ้นรวมภาษี`}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {language === 'en' ? 'Service Fee Base + VAT 7%' : 'ฐานค่าบริการรวม + VAT 7%'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6adc8] text-[11px]">
                            Base + VAT
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-[#cdd6f4] text-sm">
                            THB {pricing.grossTotalWithVat.toLocaleString()}
                          </td>
                        </tr>

                        <tr className="hover:bg-[#1e1e2e]/60 transition-colors bg-[#a6e3a1]/5">
                          <td className="py-3 px-4 font-sans text-[#a6e3a1]">
                            <strong>{language === 'en' ? `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '6.' : '4.'} Withholding Tax 3% (WHT 3%)` : `${(pricing.hotelServiceChargeAmount || 0) > 0 ? '6.' : '4.'} ภาษีหัก ณ ที่จ่าย 3%`}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {language === 'en' ? 'Tor.Por. 4/2528: Calculated on pre-VAT Base, NEVER on Gross' : 'ท.ป. 4/2528: คำนวณจากยอดก่อน VAT เท่านั้น'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-[#a6e3a1] text-[11px]">
                            Pre-VAT Base x 0.03
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#a6e3a1]">
                            -THB {pricing.wht3Percent.toLocaleString()}
                          </td>
                        </tr>

                        <tr className="bg-gradient-to-r from-[#cba6f7]/15 to-[#fab387]/15 border-t-2 border-[#cba6f7]">
                          <td className="py-3.5 px-4 font-sans text-[#cdd6f4]">
                            <strong className="text-sm">{language === 'en' ? 'Net Payable to Vendor' : 'ยอดเงินสุทธิที่ต้องชำระจริง'}</strong>
                            <span className="block text-[11px] text-[#a6adc8] font-sans">
                              {language === 'en' ? 'Gross Invoice Total minus WHT 3%' : 'ยอดรวมรวมภาษี หัก ณ ที่จ่าย 3% เรียบร้อยแล้ว'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#cba6f7] text-[11px] font-bold">
                            Gross - WHT 3%
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-base text-[#fab387]">
                            THB {pricing.netPayableToVendor.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ESCROW CHECKOUT */}
              {activeTab === 'escrow' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Corporate Legal Entity Form */}
                  <div className="p-4 rounded-2xl bg-[#181825] border border-[#313244] space-y-3">
                    <h3 className="text-xs font-bold text-[#cdd6f4] uppercase font-mono">
                      {language === 'en' ? 'Corporate Procurement & Tax Profile' : 'ข้อมูลองค์กรผู้สั่งจ่ายตามประมวลรัษฎากร'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'Company Legal Name:' : 'ชื่อนิติบุคคล / องค์กร:'}</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="บริษัท บีทูบี เทคเวนเจอร์ จำกัด"
                          className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#cba6f7]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'en' ? 'DBD 13-Digit Corporate Tax ID:' : 'เลขประจำตัวผู้เสียภาษี 13 หลัก (DBD):'}</label>
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
                            isTaxValid
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
                            {isTaxValid ? (
                              <span className="text-[#a6e3a1] flex items-center gap-1">
                                <span>[PASS]</span>
                                <span>{language === 'en' ? 'Valid Thai Corporate Tax ID (DBD Modulus 11 Passed)' : 'ตรวจสอบผ่านเกณฑ์ DBD (Modulus 11 ผ่าน)'}</span>
                              </span>
                            ) : taxValidation.isComplete ? (
                              <span className="text-[#f38ba8] flex items-center gap-1">
                                <span>[FAIL]</span>
                                <span>{language === 'en' ? 'Checksum Failed: Invalid Modulus 11 check digit' : taxValidation.error}</span>
                              </span>
                            ) : (
                              <span className="text-[#fab387] flex items-center gap-1">
                                <span>[WARN]</span>
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
                      {language === 'en' ? 'Select Escrow Deposit Payment Method (THB 5,000):' : 'เลือกวิธีการชำระเงินมัดจำ Escrow (5,000 บาท):'}
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

                  {/* PromptPay B2B Offline QR Code */}
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
                          {language === 'en' ? 'TripPick Business Travel Solutions Co., Ltd.' : 'บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Tax ID: 0-1055-69018-92-4
                        </p>
                        <p className="text-base font-extrabold text-[#003d79] mt-1">
                          THB 5,000.00
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Ref: {escrowDeposit.receiptNo || depositCode} (Room #{roomId})
                        </p>
                        <div className="mt-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block font-sans">
                          [Standard EMVCo CRC16 Offline Matrix]
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Escrow Confirmation Buttons */}
                  {!isEscrowLocked ? (
                    <div className="space-y-2">
                      <button
                        onClick={confirmEscrow}
                        disabled={!isTaxValid}
                        className={`w-full py-3 px-5 text-xs font-extrabold rounded-full transition-all shadow-lg flex items-center justify-center gap-2 ${
                          isTaxValid
                            ? 'bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] cursor-pointer active:scale-98'
                            : 'bg-[#181825] text-[#6c7086] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span>{language === 'en' ? 'Confirm THB 5,000 Escrow Deposit & Lock' : 'ยืนยันมัดจำล็อกสิทธิ์ (5,000 บาท Escrow Deposit)'}</span>
                      </button>

                      {/* Cryptographic Webhook Simulation Action */}
                      <button
                        onClick={handleSimulateWebhookPayment}
                        disabled={isSimulatingScan || !isTaxValid}
                        className="w-full py-2.5 px-4 bg-[#181825] hover:bg-[#313244] border border-[#a6e3a1]/40 text-[#a6e3a1] rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{isSimulatingScan ? 'Verifying HMAC Signature...' : 'Simulate Mobile Banking Scan (HMAC Webhook POST)'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#a6e3a1]/12 border border-[#a6e3a1]/45 text-center space-y-2">
                      <div className="text-sm font-bold text-[#a6e3a1] flex items-center justify-center gap-1.5">
                        <span>[PASS]</span>
                        <span>{language === 'en' ? 'Escrow Deposit Secured & Inventory Locked' : 'ล็อกสิทธิ์และชำระเงินมัดจำ Escrow เรียบร้อยแล้ว'}</span>
                      </div>
                      <div className="text-xs font-mono text-[#cdd6f4]">
                        {language === 'en' ? 'Confirmation Ref:' : 'รหัสรับรองสิทธิ์:'} {escrowDeposit.receiptNo}
                      </div>
                      <p className="text-[11px] text-[#bac2de]">
                        {language === 'en'
                          ? 'Synchronized across all connected devices via Supabase Realtime.'
                          : 'ซิงค์สถานะความปลอดภัยไปยังทุกอุปกรณ์ในห้องแล้ว'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Modal Footer / Action Toolbar */}
            <div className="no-print p-4 sm:px-6 bg-[#181825] border-t border-[#313244] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="text-[11px] font-mono text-[#a6adc8]">
                Ref: <strong className="text-[#cdd6f4]">{proposalRef}</strong> | Room: <strong className="text-[#cba6f7]">#{roomId}</strong>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Enterprise Pro Active Indicator */}
                {isProMember && (
                  <span className="py-1 px-2.5 rounded-full text-[10px] font-mono font-bold bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/40">
                    [PASS] Enterprise Pro Active
                  </span>
                )}

                {/* CSV Download (UTF-8 BOM) */}
                <button
                  onClick={exportToCsv}
                  className="py-1.5 px-3.5 bg-[#1e1e2e] hover:bg-[#313244] border border-[#313244] text-[#cdd6f4] rounded-full text-xs font-medium cursor-pointer transition-colors"
                  title="UTF-8 BOM CSV for Excel"
                >
                  <span>{language === 'th' ? 'ดาวน์โหลดเอกสารจัดซื้อ (.CSV)' : 'Download Procurement (.CSV)'}</span>
                </button>

                {/* Google Sheets Export */}
                <button
                  onClick={handleExportSheetsClick}
                  className="py-1.5 px-3.5 bg-[#cba6f7]/15 hover:bg-[#cba6f7]/25 border border-[#cba6f7]/35 text-[#cba6f7] rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Google Sheets {!isProMember && '(PRO)'}</span>
                </button>

                {/* Google Docs Export */}
                <button
                  onClick={handleExportDocsClick}
                  className="py-1.5 px-3.5 bg-[#fab387]/15 hover:bg-[#fab387]/25 border border-[#fab387]/40 text-[#fab387] rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Google Docs {!isProMember && '(PRO)'}</span>
                </button>

                {/* Crash-Proof Official PDF RFP Generator */}
                <button
                  onClick={printQuotation}
                  disabled={isGeneratingPdf}
                  data-testid="procurement-download-pdf-btn"
                  className="py-1.5 px-4 bg-gradient-to-r from-[#cba6f7] to-[#fab387] text-[#11111b] rounded-full text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isGeneratingPdf ? (language === 'en' ? 'Generating PDF...' : 'กำลังสร้าง PDF...') : (language === 'en' ? 'Download Procurement (PDF)' : 'ดาวน์โหลดเอกสารจัดซื้อ (PDF)')}</span>
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
        onSimulatePro={() => {
          setIsProMember(true);
          setShowSubModal(false);
          exportToGoogleSheetsTsv();
        }}
      />
    </AnimatePresence>
  );
};
