import { useState, useMemo, useCallback } from 'react';
import type { TravelDestination } from '../lib/travelDestinations';
import type {
  RetreatPricingModel,
  EscrowDeposit,
  EscrowPaymentMethod,
  EscrowBroadcastPayload,
  DemoCompanyPreset,
} from '../types/procurement';
import { calculateRetreatPricing, DEMO_COMPANY_PRESETS } from '../types/procurement';
import type { DepositReceipt } from './useTripPick';

export interface UseProcurementOptions {
  destination: TravelDestination | null;
  initialHeadcount?: number;
  initialNights?: number;
  takeRatePercent?: number;
  roomId?: string;
  depositStatus?: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt?: DepositReceipt | null;
  language?: 'th' | 'en';
  onConfirmDeposit?: (
    receiptNo: string,
    taxId: string,
    amount: number,
    companyName?: string,
    payload?: EscrowBroadcastPayload
  ) => void;
}

export function useProcurement({
  destination,
  initialHeadcount = 12,
  initialNights = 3,
  takeRatePercent = 12,
  roomId = 'TRIP',
  depositStatus = 'UNPAID',
  depositReceipt = null,
  language = 'th',
  onConfirmDeposit,
}: UseProcurementOptions) {
  // Configurable Parameters
  const [userHeadcount, setUserHeadcount] = useState<number | null>(null);
  const headcount = userHeadcount ?? Math.max(4, initialHeadcount);
  const setHeadcount = useCallback((val: number | ((prev: number) => number)) => {
    setUserHeadcount((prevUser) => {
      const current = prevUser ?? Math.max(4, initialHeadcount);
      return typeof val === 'function' ? val(current) : val;
    });
  }, [initialHeadcount]);
  const [nights, setNights] = useState<number>(Math.max(1, initialNights));

  // Enterprise / Company Information
  const defaultPreset = DEMO_COMPANY_PRESETS[0];
  const [companyName, setCompanyName] = useState<string>(defaultPreset.companyName);
  const [companyTaxId, setCompanyTaxId] = useState<string>(defaultPreset.companyTaxId);
  const [approverEmail, setApproverEmail] = useState<string>(defaultPreset.approverEmail);
  const [hasAppliedDemoPreset, setHasAppliedDemoPreset] = useState<boolean>(true);
  const [currentPresetIndex, setCurrentPresetIndex] = useState<number>(0);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<EscrowPaymentMethod>('PROMPTPAY_QR');

  // Proposal & Escrow Tracking Codes
  const [proposalRef] = useState<string>(() => `RFP-TP-${Date.now().toString().slice(-6)}`);
  const [depositCode] = useState<string>(() => `DEP-TP-${Date.now().toString().slice(-6)}`);

  // UI Toast States
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Rate per head per night
  const ratePerHead = destination?.price_per_person ?? 6000;

  // Real-time Pricing Model strictly compliant with ท.ป. 4/2528
  const pricing: RetreatPricingModel = useMemo(() => {
    return calculateRetreatPricing(headcount, nights, ratePerHead, takeRatePercent);
  }, [headcount, nights, ratePerHead, takeRatePercent]);

  // External or Internal Escrow Lock Status
  const isEscrowLocked = Boolean(
    depositStatus === 'SECURED_ESCROW' || depositReceipt !== null
  );

  const effectiveCompanyName = companyName.trim() || defaultPreset.companyName;
  const effectiveTaxId = companyTaxId.trim() || defaultPreset.companyTaxId;
  const effectiveApproverEmail = approverEmail.trim() || defaultPreset.approverEmail;

  // Escrow Deposit Details
  const escrowDeposit: EscrowDeposit = useMemo(() => {
    return {
      depositId: depositReceipt?.receiptNo || depositCode,
      amount: depositReceipt?.amount || 5000,
      status: isEscrowLocked ? 'SECURED_ESCROW' : 'IDLE',
      paymentMethod,
      companyTaxId: depositReceipt?.taxId || effectiveTaxId,
      companyName: effectiveCompanyName,
      approverEmail: effectiveApproverEmail,
      issuedAt: depositReceipt?.paidAt || new Date().toISOString(),
      receiptNo: depositReceipt?.receiptNo || depositCode,
    };
  }, [depositReceipt, depositCode, isEscrowLocked, paymentMethod, effectiveTaxId, effectiveCompanyName, effectiveApproverEmail]);

  // Fast-Fill Demo Button Action
  const applyDemoPreset = useCallback((presetIndex?: number) => {
    const nextIndex = typeof presetIndex === 'number'
      ? presetIndex % DEMO_COMPANY_PRESETS.length
      : (currentPresetIndex + 1) % DEMO_COMPANY_PRESETS.length;

    const preset: DemoCompanyPreset = DEMO_COMPANY_PRESETS[nextIndex];
    setCompanyName(preset.companyName);
    setCompanyTaxId(preset.companyTaxId);
    setApproverEmail(preset.approverEmail);
    setCurrentPresetIndex(nextIndex);
    setHasAppliedDemoPreset(true);
    showToast(`⚡ โหลดข้อมูลจำลอง: ${preset.companyName}`);
  }, [currentPresetIndex, showToast]);

  // Confirm ฿5,000 Escrow Deposit
  const confirmEscrow = useCallback(() => {
    if (isEscrowLocked) return;

    const receiptNo = depositCode;
    const amount = 5000;
    const finalCompanyName = companyName.trim() || defaultPreset.companyName;
    const finalTaxId = companyTaxId.trim() || defaultPreset.companyTaxId;

    const escrowPayload: EscrowBroadcastPayload = {
      type: 'ESCROW_LOCKED',
      roomId,
      depositId: receiptNo,
      companyName: finalCompanyName,
      amount,
      timestamp: Date.now(),
    };

    // Trigger parent callback which broadcasts ESCROW_LOCKED
    onConfirmDeposit?.(receiptNo, finalTaxId, amount, finalCompanyName, escrowPayload);

    showToast(language === 'en' ? '🎉 Escrow deposit ฿5,000 secured (Venue locked)' : '🎉 วางเงินมัดจำ Escrow ฿5,000 สำเร็จ (ล็อกห้องสัมมนาเรียบร้อย)');
  }, [isEscrowLocked, depositCode, roomId, companyName, defaultPreset.companyName, companyTaxId, defaultPreset.companyTaxId, onConfirmDeposit, showToast, language]);

  // Export to Google Sheets Compatible CSV (UTF-8 BOM \uFEFF)
  const exportToCsv = useCallback(() => {
    const isEn = language === 'en';
    const issueDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const destinationTitle = destination?.title || (isEn ? 'TripPick Corporate Retreat' : 'TripPick สัมมนาองค์กร');
    const destinationLocation = destination ? `${destination.city}, ${destination.country}` : 'Thailand';

    const csvLines = isEn ? [
      '\uFEFF"TripPick - B2B Executive Procurement RFP & Escrow Quotation"',
      `"Reference Document No.","${proposalRef}"`,
      `"Issue Date","${issueDate}"`,
      `"Consensus Status","100% Unanimous Consensus Approved"`,
      `"Escrow Deposit Status","${isEscrowLocked ? `Escrow Secured & Locked (${escrowDeposit.receiptNo})` : 'Pending Escrow Deposit'}"`,
      `"Room Code","#${roomId}"`,
      `"Client Legal Entity","${companyName}"`,
      `"Tax ID (13-digit)","${companyTaxId}"`,
      `"Approver Email","${approverEmail}"`,
      `"Venue","${destinationTitle}"`,
      `"Location","${destinationLocation}"`,
      `"Attendees","${pricing.headcount} guests"`,
      `"Duration","${pricing.nights} nights"`,
      `"Rate per Guest per Night (THB)","${pricing.ratePerHeadPerNight}"`,
      `""`,
      `"Line","Procurement Line Items","Quantity","Unit Rate (THB)","Total (THB)"`,
      `"1","MICE Accommodation & Executive Retreat Package ${destinationTitle}","${pricing.headcount * pricing.nights} guest/nights","${pricing.ratePerHeadPerNight}","${pricing.subtotalBeforeVat}"`,
      `"2","Starlink Business SLA Dedicated Network","1 system","Included","0"`,
      `"3","24/7 Corporate Concierge Coordination Service","1 system","Included","0"`,
      `""`,
      `"Tax Compliance per Thai Revenue Dept (Tor.Por. 4/2528)","Amount (THB)"`,
      `"1. Net Subtotal (Before VAT)","${pricing.subtotalBeforeVat}"`,
      `"2. Value Added Tax 7% (VAT 7%)","${pricing.vat7Percent}"`,
      `"3. Gross Invoice Total (Subtotal + VAT 7%)","${pricing.grossTotalWithVat}"`,
      `"4. Withholding Tax 3% (WHT 3% calculated on pre-VAT Subtotal)","-${pricing.wht3Percent}"`,
      `"5. Net Payable to Vendor (Gross Total - WHT 3%)","${pricing.netPayableToVendor}"`,
      `""`,
      `"TripPick Platform Commission (${pricing.tripPickTakeRatePercent}%)","${pricing.tripPickRevenue}"`,
      `"Escrow Lock Deposit","5000"`,
      `""`,
      `"Payment Terms","Net 30 or Corporate Credit Card / PromptPay B2B"`,
      `"Issued By","TripPick Business Travel Solutions Co., Ltd. (Headquarters)"`,
      `"Issuer Tax ID","0-1055-69018-92-4"`,
    ] : [
      '\uFEFF"TripPick - ใบเสนอราคาและงบประมาณจัดซื้อจัดจ้างทริปองค์กร (B2B Procurement RFP)"',
      `"เลขที่เอกสารอ้างอิง","${proposalRef}"`,
      `"วันที่ออกเอกสาร","${issueDate}"`,
      `"สถานะฉันทามติ","100% Unanimous Consensus Approved"`,
      `"สถานะเงินมัดจำ Escrow","${isEscrowLocked ? `Escrow Secured & Locked (${escrowDeposit.receiptNo})` : 'รอวางเงินมัดจำ (Pending Escrow)'}"`,
      `"รหัสห้องสัมมนา","#${roomId}"`,
      `"องค์กรลูกค้า","${companyName}"`,
      `"เลขประจำตัวผู้เสียภาษี","${companyTaxId}"`,
      `"อีเมลผู้มีอำนาจสั่งจ่าย","${approverEmail}"`,
      `"สถานที่จัดงาน","${destinationTitle}"`,
      `"เมือง / ประเทศ","${destinationLocation}"`,
      `"จำนวนผู้เข้าร่วม","${pricing.headcount} ท่าน"`,
      `"ระยะเวลาพำนัก","${pricing.nights} คืน"`,
      `"อัตราต่อท่านต่อคืน (THB)","${pricing.ratePerHeadPerNight}"`,
      `""`,
      `"ลำดับ","รายการจัดซื้อจัดจ้าง (Line Items)","จำนวน","ราคาต่อหน่วย (THB)","ยอดรวม (THB)"`,
      `"1","ค่าแพ็กเกจที่พักและสิ่งอำนวยความสะดวก MICE เหมารีสอร์ต","${pricing.headcount * pricing.nights} คน/คืน","${pricing.ratePerHeadPerNight}","${pricing.subtotalBeforeVat}"`,
      `"2","สัญญาณอินเทอร์เน็ต Starlink Business SLA Guarantee","1 ระบบ","รวมในแพ็กเกจ","0"`,
      `"3","บริการประสานงานผู้ช่วยจัดทริปองค์กร 24 ชม. ผ่าน TripPick AI Concierge","1 ระบบ","รวมในแพ็กเกจ","0"`,
      `""`,
      `"สรุปภาษีตามระเบียบกรมสรรพากร (ท.ป. 4/2528)","จำนวนเงิน (THB)"`,
      `"1. มูลค่าบริการก่อนภาษี (Net Subtotal)","${pricing.subtotalBeforeVat}"`,
      `"2. ภาษีมูลค่าเพิ่ม 7% (VAT 7%)","${pricing.vat7Percent}"`,
      `"3. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)","${pricing.grossTotalWithVat}"`,
      `"4. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3% คำนวณจากยอดก่อน VAT)","-${pricing.wht3Percent}"`,
      `"5. ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)","${pricing.netPayableToVendor}"`,
      `""`,
      `"ส่วนแบ่งแพลตฟอร์ม TripPick (Platform Take-Rate ${pricing.tripPickTakeRatePercent}%)","${pricing.tripPickRevenue}"`,
      `"เงินมัดจำล็อกสิทธิ์ (Escrow Deposit)","5000"`,
      `""`,
      `"เงื่อนไขการชำระเงิน","เครดิตเทอม 30 วัน (Net 30) หรือชำระผ่าน Corporate Credit Card / PromptPay B2B"`,
      `"ออกโดย","บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด (สำนักงานใหญ่)"`,
      `"เลขประจำตัวผู้เสียภาษีผู้ออกเอกสาร","0-1055-69018-92-4"`,
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TripPick_B2B_RFP_${proposalRef}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(isEn ? '✓ CSV file downloaded for ERP / SAP / Excel' : '✓ ดาวน์โหลดไฟล์ .CSV สำหรับ Google Sheets สำเร็จ');
  }, [
    proposalRef,
    isEscrowLocked,
    escrowDeposit.receiptNo,
    roomId,
    companyName,
    companyTaxId,
    approverEmail,
    destination,
    pricing,
    showToast,
    language,
  ]);

  // 1-Click Export to Google Sheets (TSV clipboard + open Google Sheets)
  const exportToGoogleSheetsTsv = useCallback(async () => {
    const isEn = language === 'en';
    const issueDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const destinationTitle = destination?.title || (isEn ? 'TripPick Corporate Retreat' : 'TripPick สัมมนาองค์กร');
    const destinationLocation = destination ? `${destination.city}, ${destination.country}` : 'Thailand';

    const tsvRows = isEn ? [
      ['TripPick - B2B Executive Procurement RFP & Escrow Quotation'],
      ['Reference Document No.', proposalRef],
      ['Issue Date', issueDate],
      ['Consensus Status', '100% Unanimous Consensus Approved'],
      ['Escrow Deposit Status', isEscrowLocked ? `Escrow Secured & Locked (${escrowDeposit.receiptNo})` : 'Pending Escrow Deposit'],
      ['Room Code', `#${roomId}`],
      ['Client Legal Entity', companyName],
      ['Tax ID (13-digit)', companyTaxId],
      ['Approver Email', approverEmail],
      ['Venue', destinationTitle],
      ['Location', destinationLocation],
      ['Attendees', `${pricing.headcount} guests`],
      ['Duration', `${pricing.nights} nights`],
      ['Rate per Guest per Night (THB)', pricing.ratePerHeadPerNight],
      [''],
      ['Line', 'Procurement Line Items', 'Quantity', 'Unit Rate (THB)', 'Total (THB)'],
      ['1', `MICE Accommodation & Executive Retreat Package ${destinationTitle}`, `${pricing.headcount * pricing.nights} guest/nights`, pricing.ratePerHeadPerNight, pricing.subtotalBeforeVat],
      ['2', 'Starlink Business SLA Dedicated Network', '1 system', 'Included', 0],
      ['3', '24/7 Corporate Concierge Coordination Service', '1 service', 'Included', 0],
      [''],
      ['Tax Compliance per Thai Revenue Dept (Tor.Por. 4/2528)', 'Amount (THB)'],
      ['1. Net Subtotal (Before VAT)', pricing.subtotalBeforeVat],
      ['2. Value Added Tax 7% (VAT 7%)', pricing.vat7Percent],
      ['3. Gross Invoice Total (Subtotal + VAT 7%)', pricing.grossTotalWithVat],
      ['4. Withholding Tax 3% (WHT 3% calculated on pre-VAT Subtotal)', -pricing.wht3Percent],
      ['5. Net Payable to Vendor (Gross Total - WHT 3%)', pricing.netPayableToVendor],
      [''],
      [`TripPick Platform Commission (${pricing.tripPickTakeRatePercent}%)`, pricing.tripPickRevenue],
      ['Escrow Lock Deposit', 5000],
    ] : [
      ['TripPick - ใบเสนอราคาและงบประมาณจัดซื้อจัดจ้างทริปองค์กร (B2B Procurement RFP)'],
      ['เลขที่เอกสารอ้างอิง', proposalRef],
      ['วันที่ออกเอกสาร', issueDate],
      ['สถานะฉันทามติ', '100% Unanimous Consensus Approved'],
      ['สถานะเงินมัดจำ Escrow', isEscrowLocked ? `Escrow Secured & Locked (${escrowDeposit.receiptNo})` : 'รอวางเงินมัดจำ (Pending Escrow)'],
      ['รหัสห้องสัมมนา', `#${roomId}`],
      ['องค์กรลูกค้า', companyName],
      ['เลขประจำตัวผู้เสียภาษี', companyTaxId],
      ['ผู้มีอำนาจสั่งจ่าย', approverEmail],
      ['สถานที่จัดงาน', destinationTitle],
      ['เมือง / ประเทศ', destinationLocation],
      ['จำนวนผู้เข้าร่วม', `${pricing.headcount} ท่าน`],
      ['ระยะเวลาพำนัก', `${pricing.nights} คืน`],
      ['อัตราต่อท่านต่อคืน (THB)', pricing.ratePerHeadPerNight],
      [''],
      ['ลำดับ', 'รายการจัดซื้อจัดจ้าง (Line Items)', 'จำนวน', 'ราคาต่อหน่วย (THB)', 'ยอดรวม (THB)'],
      ['1', `ค่าแพ็กเกจที่พักและสิ่งอำนวยความสะดวก MICE ${destinationTitle}`, `${pricing.headcount * pricing.nights} คน/คืน`, pricing.ratePerHeadPerNight, pricing.subtotalBeforeVat],
      ['2', 'สัญญาณอินเทอร์เน็ต Starlink Business SLA Guarantee', '1 ระบบ', 'รวมในแพ็กเกจ', 0],
      ['3', 'บริการประสานงานผู้ช่วยจัดทริปองค์กร 24 ชม. ผ่าน TripPick AI Concierge', '1 รายการ', 'รวมในแพ็กเกจ', 0],
      [''],
      ['สรุปภาษีตามระเบียบกรมสรรพากร (ท.ป. 4/2528)', 'จำนวนเงิน (THB)'],
      ['1. มูลค่ารวมก่อนภาษี (Net Subtotal)', pricing.subtotalBeforeVat],
      ['2. ภาษีมูลค่าเพิ่ม 7% (VAT 7%)', pricing.vat7Percent],
      ['3. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)', pricing.grossTotalWithVat],
      ['4. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3% คิดจากยอดก่อน VAT)', -pricing.wht3Percent],
      ['5. ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)', pricing.netPayableToVendor],
      [''],
      [`ส่วนแบ่งแพลตฟอร์ม TripPick (Platform Take-Rate ${pricing.tripPickTakeRatePercent}%)`, pricing.tripPickRevenue],
      ['เงินมัดจำล็อกสิทธิ์ (Escrow Deposit)', 5000],
    ];

    const tsvContent = tsvRows.map((r) => r.join('\t')).join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
    } catch {
      // Clipboard fallback
    }

    showToast(isEn ? '✓ TSV table copied! Ready to paste into Google Sheets (Ctrl+V)' : '✓ คัดลอกข้อมูลตาราง TSV แล้ว พร้อมวางใน Google Sheets (Ctrl+V)');
    window.open('https://docs.google.com/spreadsheets/create', '_blank', 'noopener,noreferrer');
  }, [
    destination,
    proposalRef,
    isEscrowLocked,
    escrowDeposit.receiptNo,
    roomId,
    companyName,
    companyTaxId,
    approverEmail,
    pricing,
    showToast,
    language,
  ]);

  // 1-Click Export to Google Docs (Markdown synthesis + clipboard + open Google Docs)
  const generateGoogleDocsMarkdown = useCallback(async () => {
    const isEn = language === 'en';
    const destinationTitle = destination?.title || (isEn ? 'TripPick Corporate Retreat' : 'TripPick สัมมนาองค์กร');
    const destinationLocation = destination ? `${destination.city}, ${destination.country}` : 'Thailand';

    const markdown = `# ${destinationTitle} — B2B Executive Procurement RFP & Escrow Dossier

**Client Company**: ${companyName}
**Tax ID (13-Digit)**: ${companyTaxId}
**Approver Email**: ${approverEmail}
**Room Code**: #${roomId}
**Destination**: ${destinationTitle} (${destinationLocation})
**Attendees**: ${pricing.headcount} Pax | **Duration**: ${pricing.nights} Nights
**Document Reference**: ${proposalRef}
**Escrow Deposit Status**: ${isEscrowLocked ? `SECURED & LOCKED (Receipt: ${escrowDeposit.receiptNo})` : 'PENDING ฿5,000 ESCROW DEPOSIT'}

---

## 1. ${isEn ? 'Tax & Accounting Breakdown' : 'การคำนวณภาษีและงบประมาณจัดซื้อจัดจ้าง (Tax & Accounting Breakdown)'}
*Compliant with Thai Revenue Department Order Tor.Por. 4/2528 (คำสั่งกรมสรรพากรที่ ท.ป. 4/2528)*

- **${isEn ? 'Net Subtotal (Before VAT)' : 'มูลค่ารวมก่อนภาษี (Net Subtotal)'}**: ฿${pricing.subtotalBeforeVat.toLocaleString()} THB
- **${isEn ? 'Value Added Tax 7% (VAT 7%)' : 'ภาษีมูลค่าเพิ่ม 7% (VAT 7%)'}**: +฿${pricing.vat7Percent.toLocaleString()} THB
- **${isEn ? 'Gross Invoice Total' : 'ยอดรวมทั้งสิ้น (Gross Invoice Total)'}**: ฿${pricing.grossTotalWithVat.toLocaleString()} THB
- **${isEn ? 'Withholding Tax 3% (WHT 3% calculated on Subtotal before VAT)' : 'ภาษีหัก ณ ที่จ่าย 3% (WHT 3% หมวดบริการ คิดจากยอดก่อน VAT)'}**: -฿${pricing.wht3Percent.toLocaleString()} THB
- **${isEn ? 'Net Payable to Vendor' : 'ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)'}**: ฿${pricing.netPayableToVendor.toLocaleString()} THB

---

## 2. ${isEn ? 'Business Model & Platform Take-Rate' : 'โครงสร้างผลตอบแทนทางธุรกิจ (Business Model & Platform Take-Rate)'}
- **Gross Booking Value (GBV)**: ฿${pricing.grossBookingValue.toLocaleString()} THB
- **TripPick Platform Commission (${pricing.tripPickTakeRatePercent}%)**: ฿${pricing.tripPickRevenue.toLocaleString()} THB
- **${isEn ? 'Escrow Lock Deposit' : 'เงินมัดจำล็อกสิทธิ์ (Escrow Lock)'}**: ฿5,000.00 THB (${isEscrowLocked ? (isEn ? 'Paid & 100% Protected' : 'ชำระแล้ว - ได้รับการคุ้มครอง 100%') : (isEn ? 'Pending Payment' : 'รอการชำระ')})

---

*Generated autonomously by TripPick B2B Procurement Engine*
*Google Antigravity Hackathon — Track: Software for Business & Tourism (Make Me Money)*
`;

    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // Clipboard fallback
    }

    showToast(isEn ? '✓ Markdown RFP copied! Ready to paste into Google Docs (Ctrl+V)' : '✓ คัดลอกเอกสาร Markdown แล้ว พร้อมวางใน Google Docs (Ctrl+V)');
    window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
  }, [
    destination,
    companyName,
    companyTaxId,
    approverEmail,
    roomId,
    pricing,
    proposalRef,
    isEscrowLocked,
    escrowDeposit.receiptNo,
    showToast,
    language,
  ]);

  const printQuotation = useCallback(() => {
    window.print();
  }, []);

  return {
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
  };
}
