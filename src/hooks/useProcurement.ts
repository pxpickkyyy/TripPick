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
import { ensureValidThaiTaxId } from '../utils/taxCompliance';

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
  // Pro Subscription State persisted in localStorage ('trippick_demo_tier') and URL param ?pro=true
  const [isProMember, setInternalProMember] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('pro') === 'true') {
        localStorage.setItem('trippick_demo_tier', 'pro');
        return true;
      }
      return localStorage.getItem('trippick_demo_tier') === 'pro';
    }
    return false;
  });

  const setIsProMember = useCallback((val: boolean) => {
    setInternalProMember(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trippick_demo_tier', val ? 'pro' : 'free');
    }
  }, []);

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
  const [companyTaxId, setCompanyTaxId] = useState<string>(ensureValidThaiTaxId(defaultPreset.companyTaxId));
  const [approverEmail, setApproverEmail] = useState<string>(defaultPreset.approverEmail);
  const [hasAppliedDemoPreset, setHasAppliedDemoPreset] = useState<boolean>(true);
  const [currentPresetIndex, setCurrentPresetIndex] = useState<number>(0);
  const [hotelServiceChargePercent, setHotelServiceChargePercent] = useState<number>(10);

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

  // Real-time Pricing Model strictly compliant with Tor.Por. 4/2528 & Hotel Service Charge
  const pricing: RetreatPricingModel = useMemo(() => {
    return calculateRetreatPricing(headcount, nights, ratePerHead, takeRatePercent, hotelServiceChargePercent);
  }, [headcount, nights, ratePerHead, takeRatePercent, hotelServiceChargePercent]);

  // External or Internal Escrow Lock Status
  const isEscrowLocked = Boolean(
    depositStatus === 'SECURED_ESCROW' || depositReceipt !== null
  );

  const effectiveCompanyName = companyName.trim() || defaultPreset.companyName;
  const effectiveTaxId = companyTaxId.trim() || ensureValidThaiTaxId(defaultPreset.companyTaxId);
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
    setCompanyTaxId(ensureValidThaiTaxId(preset.companyTaxId));
    setApproverEmail(preset.approverEmail);
    setCurrentPresetIndex(nextIndex);
    setHasAppliedDemoPreset(true);
    showToast(`Loaded preset: ${preset.companyName}`);
  }, [currentPresetIndex, showToast]);

  // Confirm THB 5,000 Escrow Deposit
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

    onConfirmDeposit?.(receiptNo, finalTaxId, amount, finalCompanyName, escrowPayload);
    showToast(language === 'en' ? 'Escrow deposit 5,000 THB secured (Venue locked)' : 'มัดจำล็อกสิทธิ์ 5,000 บาทสำเร็จ (ล็อกสถานที่เรียบร้อย)');
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
      ...(pricing.hotelServiceChargeAmount && pricing.hotelServiceChargeAmount > 0 ? [
        `"2. Hotel Service Charge (10%)","${pricing.hotelServiceChargeAmount}"`,
        `"3. Pre-VAT Service Fee Base","${pricing.serviceFeeBase}"`,
        `"4. Value Added Tax 7% (VAT 7%)","${pricing.vat7Percent}"`,
        `"5. Gross Invoice Total (Base + VAT 7%)","${pricing.grossTotalWithVat}"`,
        `"6. Withholding Tax 3% (WHT 3% calculated on pre-VAT Base)","-${pricing.wht3Percent}"`,
        `"7. Net Payable to Vendor (Gross Total - WHT 3%)","${pricing.netPayableToVendor}"`,
      ] : [
        `"2. Value Added Tax 7% (VAT 7%)","${pricing.vat7Percent}"`,
        `"3. Gross Invoice Total (Subtotal + VAT 7%)","${pricing.grossTotalWithVat}"`,
        `"4. Withholding Tax 3% (WHT 3% calculated on pre-VAT Subtotal)","-${pricing.wht3Percent}"`,
        `"5. Net Payable to Vendor (Gross Total - WHT 3%)","${pricing.netPayableToVendor}"`,
      ]),
      `""`,
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
      ...(pricing.hotelServiceChargeAmount && pricing.hotelServiceChargeAmount > 0 ? [
        `"2. ค่าบริการโรงแรม 10% (Hotel 10% Service Charge)","${pricing.hotelServiceChargeAmount}"`,
        `"3. ฐานค่าบริการรวมก่อนภาษี (Service Fee Base)","${pricing.serviceFeeBase}"`,
        `"4. ภาษีมูลค่าเพิ่ม 7% (VAT 7%)","${pricing.vat7Percent}"`,
        `"5. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)","${pricing.grossTotalWithVat}"`,
        `"6. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3% คำนวณจากยอดก่อน VAT)","-${pricing.wht3Percent}"`,
        `"7. ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)","${pricing.netPayableToVendor}"`,
      ] : [
        `"2. ภาษีมูลค่าเพิ่ม 7% (VAT 7%)","${pricing.vat7Percent}"`,
        `"3. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)","${pricing.grossTotalWithVat}"`,
        `"4. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3% คำนวณจากยอดก่อน VAT)","-${pricing.wht3Percent}"`,
        `"5. ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)","${pricing.netPayableToVendor}"`,
      ]),
      `""`,
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

    showToast(isEn ? 'CSV file downloaded for ERP / Excel' : 'ดาวน์โหลดไฟล์ .CSV สำหรับ Excel / Google Sheets สำเร็จ');
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
      ['2', 'Hotel Service Charge (10%)', '1 service', `${pricing.hotelServiceChargeAmount || 0}`, pricing.hotelServiceChargeAmount || 0],
      ['3', 'Pre-VAT Service Fee Base', '1 base', `${pricing.serviceFeeBase}`, pricing.serviceFeeBase],
      ['4', 'Value Added Tax 7% (VAT 7%)', '7% statutory', `${pricing.vat7Percent}`, pricing.vat7Percent],
      ['5', 'Withholding Tax 3% (WHT 3% calculated on pre-VAT Base)', '3% statutory', `-${pricing.wht3Percent}`, -pricing.wht3Percent],
      ['6', 'Net Payable to Vendor', 'Gross - WHT 3%', `${pricing.netPayableToVendor}`, pricing.netPayableToVendor],
      [''],
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
      ['2', 'ค่าบริการโรงแรม 10% (Hotel 10% Service Charge)', '1 รายการ', `${pricing.hotelServiceChargeAmount || 0}`, pricing.hotelServiceChargeAmount || 0],
      ['3', 'ฐานค่าบริการรวมก่อนภาษี (Service Fee Base)', '1 ฐาน', `${pricing.serviceFeeBase}`, pricing.serviceFeeBase],
      ['4', 'ภาษีมูลค่าเพิ่ม 7% (VAT 7%)', '7%', `${pricing.vat7Percent}`, pricing.vat7Percent],
      ['5', 'ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3% คิดจากยอดก่อน VAT)', '3%', `-${pricing.wht3Percent}`, -pricing.wht3Percent],
      ['6', 'ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable to Vendor)', 'สุทธิ', `${pricing.netPayableToVendor}`, pricing.netPayableToVendor],
      [''],
      ['เงินมัดจำล็อกสิทธิ์ (Escrow Deposit)', 5000],
    ];

    const tsvContent = tsvRows.map((r) => r.join('\t')).join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
    } catch {
      // Clipboard fallback
    }

    showToast(isEn ? 'TSV table copied! Ready to paste into Google Sheets (Ctrl+V)' : 'คัดลอกข้อมูลตาราง TSV แล้ว พร้อมวางใน Google Sheets (Ctrl+V)');
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

  // Export to Google Docs (Markdown format copied + open Google Docs)
  const generateGoogleDocsMarkdown = useCallback(async () => {
    const isEn = language === 'en';
    const issueDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const destinationTitle = destination?.title || (isEn ? 'TripPick Corporate Retreat' : 'TripPick สัมมนาองค์กร');
    const destinationLocation = destination ? `${destination.city}, ${destination.country}` : 'Thailand';

    const mdContent = `# TripPick B2B Procurement RFP & Executive Schedule
**Reference:** ${proposalRef} | **Room:** #${roomId} | **Date:** ${issueDate}
**Client:** ${effectiveCompanyName} (Tax ID: ${effectiveTaxId})
**Approver:** ${effectiveApproverEmail}

---

## 1. Selected MICE Property
- **Property:** ${destinationTitle}
- **Location:** ${destinationLocation}
- **Capacity:** ${pricing.headcount} Guests | **Duration:** ${pricing.nights} Nights
- **Connectivity:** Dedicated Starlink & Fiber Network (500+ Mbps)
- **Facilities:** Executive Boardroom with 4K AV Setup

---

## 2. Statutory Financial Breakdown (Thai Revenue Dept Tor.Por. 4/2528)
| Line Item | Formula | Amount (THB) |
| :--- | :---: | :--- |
| **1. Net Subtotal (GBV)** | ${pricing.headcount} pax x ${pricing.nights} nights x THB ${pricing.ratePerHeadPerNight.toLocaleString()} | THB ${pricing.subtotalBeforeVat.toLocaleString()} |
${pricing.hotelServiceChargeAmount ? `| **2. Hotel Service Charge (10%)** | Subtotal x 0.10 | +THB ${pricing.hotelServiceChargeAmount.toLocaleString()} |\n| **3. Pre-VAT Service Fee Base** | Subtotal + Service Charge | THB ${pricing.serviceFeeBase.toLocaleString()} |` : ''}
| **${pricing.hotelServiceChargeAmount ? '4' : '2'}. VAT 7%** | Base x 0.07 | +THB ${pricing.vat7Percent.toLocaleString()} |
| **${pricing.hotelServiceChargeAmount ? '5' : '3'}. Gross Total** | Base + VAT 7% | THB ${pricing.grossTotalWithVat.toLocaleString()} |
| **${pricing.hotelServiceChargeAmount ? '6' : '4'}. Withholding Tax 3% (WHT 3%)** | Pre-VAT Base x 0.03 | -THB ${pricing.wht3Percent.toLocaleString()} |
| **${pricing.hotelServiceChargeAmount ? '7' : '5'}. Net Payable to Vendor** | Base x 1.04 | **THB ${pricing.netPayableToVendor.toLocaleString()}** |

**Escrow Status:** ${isEscrowLocked ? `Escrow Secured & Locked (${escrowDeposit.receiptNo})` : 'Pending Escrow Deposit (THB 5,000)'}

---

## 3. Executive 3-Day Retreat Agenda
### Day 1: Arrival & High-Bandwidth Deep Work
- 13:00 - Airport Transfer via Private VIP Van
- 14:30 - Check-in & Starlink High-Speed Setup (500+ Mbps)
- 15:30 - Engineering Sprint & Architecture Sync
- 18:30 - Welcome Team Dinner & Local Seafood

### Day 2: Executive Strategy & Workshop
- 09:00 - Q3/Q4 OKRs in Executive Boardroom (30 Pax)
- 12:30 - Executive Catering Lunch
- 14:00 - Product Roadmap & Breakout Brainstorming
- 17:00 - Team Adventure & Wellness Excursion
- 19:30 - Gala Dinner & Strategy Retrospective

### Day 3: Synthesis & Wrap-up
- 08:30 - Executive Breakfast & Action Item Commitments
- 10:30 - Checkout & Final Departure Transfer
`;

    try {
      await navigator.clipboard.writeText(mdContent);
    } catch {
      // Clipboard fallback
    }

    showToast(isEn ? 'Markdown document copied! Opening Google Docs (Ctrl+V)' : 'คัดลอกเอกสาร Markdown แล้ว พร้อมวางใน Google Docs (Ctrl+V)');
    window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
  }, [
    proposalRef,
    roomId,
    effectiveCompanyName,
    effectiveTaxId,
    effectiveApproverEmail,
    destination,
    pricing,
    isEscrowLocked,
    escrowDeposit.receiptNo,
    language,
    showToast,
  ]);

  // Crash-proof PDF download using pdf-lib and Sarabun font
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const downloadPdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const { downloadCorporateRfpPdf } = await import('@/utils/generatePdf');
      await downloadCorporateRfpPdf({
        proposalRef,
        issueDate: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        roomId,
        companyName: effectiveCompanyName,
        companyTaxId: effectiveTaxId,
        approverEmail: effectiveApproverEmail,
        destinationTitle: destination?.title || 'TripPick Corporate Retreat',
        destinationCity: destination?.city || 'Thailand',
        destinationCountry: destination?.country || 'Thailand',
        headcount: pricing.headcount,
        nights: pricing.nights,
        ratePerHeadPerNight: pricing.ratePerHeadPerNight,
        subtotalBeforeVat: pricing.subtotalBeforeVat,
        hotelServiceChargePercent: pricing.hotelServiceChargePercent,
        hotelServiceChargeAmount: pricing.hotelServiceChargeAmount,
        serviceFeeBase: pricing.serviceFeeBase,
        vat7Percent: pricing.vat7Percent,
        grossTotalWithVat: pricing.grossTotalWithVat,
        wht3Percent: pricing.wht3Percent,
        netPayableToVendor: pricing.netPayableToVendor,
        isEscrowLocked,
        escrowReceiptNo: escrowDeposit.receiptNo,
        escrowAmount: escrowDeposit.amount,
        language,
      });
      showToast(language === 'en' ? 'Official PDF RFP downloaded' : 'ดาวน์โหลดเอกสาร PDF RFP ทางการสำเร็จ');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast(language === 'en' ? 'PDF generation failed, please try again' : 'เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [
    proposalRef,
    roomId,
    effectiveCompanyName,
    effectiveTaxId,
    effectiveApproverEmail,
    destination,
    pricing,
    isEscrowLocked,
    escrowDeposit.receiptNo,
    escrowDeposit.amount,
    language,
    showToast,
  ]);

  const printQuotation = useCallback(() => {
    downloadPdf();
  }, [downloadPdf]);

  return {
    isProMember,
    setIsProMember,
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
    downloadPdf,
    isGeneratingPdf,
    hotelServiceChargePercent,
    setHotelServiceChargePercent,
    toastMessage,
  };
}
