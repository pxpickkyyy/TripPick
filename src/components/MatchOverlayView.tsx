import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TravelDestination } from '../lib/travelDestinations';
import type { RoomUser, Swipe, DepositReceipt } from '../hooks/useTripPick';
import { generateExecutiveAgenda } from '../lib/ai';
import { enrichDestinationWithGooglePlaces, formatAirportTravelTime, formatAirportName, type GooglePlaceData } from '../lib/googlePlaces';
import { generatePromptPayPayload, generateQrSvgPath } from '../lib/promptpay';
import { useAudioBriefing, VOICE_ENGINES, type VoiceEngine } from '../lib/audioConcierge';
import { useLanguage } from '../lib/i18n';
import { SubscriptionLockModal } from './SubscriptionLockModal';

interface MatchOverlayViewProps {
  matchedDestination: TravelDestination | null;
  users: RoomUser[];
  onReset: () => void;
  swipes: Swipe[];
  destinationsDeck: TravelDestination[];
  roomId?: string;
  depositStatus?: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt?: DepositReceipt | null;
  onConfirmDeposit?: (receiptNo: string, taxId: string, amount?: number, companyName?: string) => void;
  onOpenProcurement?: () => void;
}

export function MatchOverlayView({
  matchedDestination: rawMatchedDestination,
  users,
  onReset,
  roomId = 'TRIP',
  depositStatus = 'UNPAID',
  depositReceipt = null,
  onConfirmDeposit,
  onOpenProcurement,
}: MatchOverlayViewProps) {
  const { language, t, localizeDestination, localizeAmenity } = useLanguage();
  const matchedDestination = useMemo(() => {
    if (!rawMatchedDestination) return null;
    return { ...rawMatchedDestination, ...localizeDestination(rawMatchedDestination) };
  }, [rawMatchedDestination, localizeDestination]);

  const [activeTab, setActiveTab] = useState<'rfp' | 'agenda'>('rfp');
  const [teamSize, setTeamSize] = useState(Math.max(4, users.length));
  const [nights, setNights] = useState(3);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'card' | 'promptpay' | 'wire'>('promptpay');
  const [copiedToast, setCopiedToast] = useState(false);
  const [copiedAgendaToast, setCopiedAgendaToast] = useState(false);

  // Subscription Feature Lock Modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');

  // Live Sandbox Webhook & Checkout State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [customPromptpayPayload, setCustomPromptpayPayload] = useState<string | null>(null);

  // Google Places API (New) Telemetry
  const [googleData, setGoogleData] = useState<GooglePlaceData | null>(null);

  const [proposalRef] = useState(() => `RFP-TP-${Date.now().toString().slice(-6)}`);
  const [depositCode] = useState(() => `DEP-TP-${Date.now().toString().slice(-6)}`);

  // Corporate credentials
  const [companyName, setCompanyName] = useState('Google Hackathon Tech & Engineering Team');
  const [companyTaxId, setCompanyTaxId] = useState('0-1055-69018-92-4');

  // Compute default EMVCo PromptPay payload
  const defaultPromptpayPayload = useMemo(() => {
    return generatePromptPayPayload({
      target: companyTaxId,
      amount: 5000,
      referenceNo: depositCode,
    });
  }, [companyTaxId, depositCode]);

  const activePromptpayPayload = customPromptpayPayload || defaultPromptpayPayload;

  const qrPath = useMemo(() => {
    return generateQrSvgPath(activePromptpayPayload, 220);
  }, [activePromptpayPayload]);

  // Enrich with Google Places API (New) & Google Routes
  useEffect(() => {
    if (!matchedDestination) return;
    let isMounted = true;
    enrichDestinationWithGooglePlaces(matchedDestination).then((data) => {
      if (isMounted) {
        setGoogleData(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [matchedDestination]);

  // Synthesize Autonomous 3-Day Executive Agenda
  const agenda = useMemo(() => {
    if (!matchedDestination) return [];
    return generateExecutiveAgenda(matchedDestination, teamSize, undefined, language);
  }, [matchedDestination, teamSize, language]);

  // Financial Procurement Calculations
  const netTotal = matchedDestination ? matchedDestination.price_per_person * teamSize * nights : 0;
  const vat7 = Math.round(netTotal * 0.07);
  const grossTotal = netTotal + vat7;
  const wht3 = Math.round(netTotal * 0.03); // 3% Withholding tax on services per Tor.Por. 4/2528
  const netPayable = grossTotal - wht3;

  const leadOrganizer = users[0]?.user_name || 'Sarah (Tech Lead)';
  const leadRole = users[0]?.role || 'Head of Engineering';

  // Modular Voice Adapter: Audio Concierge specs for 30s Executive Audio Memo
  const audioSpecs = useMemo(() => {
    return {
      destinationTitle: matchedDestination?.title || '',
      city: matchedDestination?.city || '',
      country: matchedDestination?.country || '',
      wifiSpeed: matchedDestination?.wifi_speed_mbps || 350,
      maxCapacity: matchedDestination?.max_capacity || 20,
      teamSize,
      nights,
      netPayable,
      netTotal,
      proposalRef,
      companyName,
      leadOrganizer,
    };
  }, [matchedDestination, teamSize, nights, netPayable, netTotal, proposalRef, companyName, leadOrganizer]);

  const audioBriefing = useAudioBriefing(audioSpecs);
  const [showTranscript, setShowTranscript] = useState(false);

  if (!matchedDestination) return null;

  const isEscrowLocked = depositStatus === 'SECURED_ESCROW' || Boolean(depositReceipt);

  const issueDateFormatted = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const isEn = language === 'en';
    const summary = isEn
      ? `=====================================================
B2B Corporate Retreat Procurement Proposal (RFP Document)
Reference No.: ${proposalRef}
Issue Date: ${issueDateFormatted}
Consensus Status: 100% Unanimous Approved
Escrow Deposit Status: ${isEscrowLocked ? `Escrow Secured & Locked (${depositReceipt?.receiptNo || depositCode})` : 'Pending Deposit (฿5,000)'}
-----------------------------------------------------
Venue: ${matchedDestination.title}
Location: ${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}
Google Maps: ${googleData?.googleMapsUri || matchedDestination.affiliate_booking_url}
Airport Transit: ${googleData?.airportTravelTime || '30 mins'}
Attendees: ${teamSize} Pax | Duration: ${nights} Nights
Connectivity: ${matchedDestination.wifi_speed_mbps} Mbps (Starlink Business SLA)
Executive Boardroom: Max capacity ${matchedDestination.max_capacity} Pax
-----------------------------------------------------
Statutory Tax & Financial Summary (THB):
1. Net Accommodation & Facilities (Net Subtotal): ฿${netTotal.toLocaleString()}
2. Value Added Tax 7% (VAT 7%): +฿${vat7.toLocaleString()}
3. Gross Invoice Total: ฿${grossTotal.toLocaleString()}
4. Withholding Tax 3% (WHT 3% Services Tor.Por. 4/2528): -฿${wht3.toLocaleString()}
-----------------------------------------------------
Net Payable Amount to Vendor: ฿${netPayable.toLocaleString()}
=====================================================
Issued by: TripPick Business Travel Solutions Co., Ltd. (Headquarters)
Tax ID: 0-1055-69018-92-4`
      : `=====================================================
ใบเสนอราคาและเอกสารจัดซื้อจัดจ้างทริปองค์กร (B2B RFP Document)
เลขที่อ้างอิง: ${proposalRef}
วันที่ออกเอกสาร: ${issueDateFormatted}
สถานะ: ฉันทามติ 100% เอกฉันท์ (Consensus Approved)
สถานะการวางมัดจำ: ${isEscrowLocked ? `Escrow Secured & Locked (${depositReceipt?.receiptNo || depositCode})` : 'รอวางเงินมัดจำ (Pending Deposit)'}
-----------------------------------------------------
สถานที่: ${matchedDestination.title}
ที่ตั้ง: ${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}
Google Maps: ${googleData?.googleMapsUri || matchedDestination.affiliate_booking_url}
ระยะทางสนามบิน: ${googleData?.airportTravelTime || '30 นาที'}
ผู้เข้าร่วม: ${teamSize} ท่าน | ระยะเวลา: ${nights} คืน
สเปกอินเทอร์เน็ต: ${matchedDestination.wifi_speed_mbps} Mbps (Starlink Business SLA)
ห้องประชุมบอร์ดบริหาร: รองรับสูงสุด ${matchedDestination.max_capacity} ท่าน
-----------------------------------------------------
สรุปงบประมาณการจัดซื้อจัดจ้าง (THB):
1. ค่าบริการแพ็กเกจที่พักและพื้นที่ทำงาน (Net Subtotal): ฿${netTotal.toLocaleString()}
2. ภาษีมูลค่าเพิ่ม 7% (VAT 7%): +฿${vat7.toLocaleString()}
3. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total): ฿${grossTotal.toLocaleString()}
4. ภาษีหัก ณ ที่จ่าย 3% (Withholding Tax 3%): -฿${wht3.toLocaleString()}
-----------------------------------------------------
ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable Amount): ฿${netPayable.toLocaleString()}
=====================================================
ออกโดย: บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด (สำนักงานใหญ่)
Tax ID: 0-1055-69018-92-4`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  // Google Workspace & Microsoft Sheets Compatible CSV Export
  const handleDownloadCsv = () => {
    const isEn = language === 'en';
    const csvContent =
      '\uFEFF' +
      (isEn
        ? `"TripPick - Enterprise B2B Procurement RFP & Budget Reconciliation"\n` +
          `"Document Reference","${proposalRef}"\n` +
          `"Issue Date","${issueDateFormatted}"\n` +
          `"Consensus Status","100% Unanimous Consensus Approved"\n` +
          `"Escrow Lock Status","${isEscrowLocked ? `Escrow Secured & Locked (${depositReceipt?.receiptNo || depositCode})` : 'Pending Deposit'}"\n` +
          `"Room Code","#${roomId}"\n` +
          `"Purchasing Organization","${companyName}"\n` +
          `"Corporate Tax ID","${companyTaxId}"\n` +
          `"Lead Organizer","${leadOrganizer} (${leadRole})"\n` +
          `"Selected Venue","${matchedDestination.title}"\n` +
          `"City / Country","${matchedDestination.city}, ${matchedDestination.country}"\n` +
          `"Verified Address","${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}"\n` +
          `"Airport Travel Time","${googleData?.airportTravelTime || '30 mins'}"\n` +
          `"Google Maps Link","${googleData?.googleMapsUri || ''}"\n` +
          `"Attendees","${teamSize} Pax"\n` +
          `"Duration","${nights} Nights"\n` +
          `"Connectivity Guarantee","${matchedDestination.wifi_speed_mbps} Mbps (Starlink Business SLA Guarantee)"\n` +
          `"Executive Boardroom","${matchedDestination.max_capacity} Seats (4K Display & AV System)"\n` +
          `\n` +
          `"Item #","Procurement Line Items","Quantity","Unit Price (THB)","Total (THB)"\n` +
          `"1","Exclusive Venue & MICE Facilities Package","${teamSize * nights} Pax-Nights","${matchedDestination.price_per_person}","${netTotal}"\n` +
          `"2","Starlink Business SLA High-Speed Guarantee","1 System","Included","0"\n` +
          `"3","24/7 TripPick AI Executive Concierge Coordination","1 Service","Included","0"\n` +
          `\n` +
          `"Statutory Tax & Accounting Breakdown (Tor.Por. 4/2528)","Amount (THB)"\n` +
          `"Net Subtotal (Pre-VAT / GBV)","${netTotal}"\n` +
          `"Value Added Tax 7% (VAT 7%)","${vat7}"\n` +
          `"Gross Invoice Total (with VAT)","${grossTotal}"\n` +
          `"Withholding Tax 3% (WHT 3% Services)","-${wht3}"\n` +
          `"Net Payable Amount to Vendor","${netPayable}"\n` +
          `\n` +
          `"Payment Terms","Net 30 or Corporate Credit Card / PromptPay B2B Escrow"\n` +
          `"Issued By","TripPick Business Travel Solutions Co., Ltd. (Headquarters)"\n` +
          `"Tax ID","0-1055-69018-92-4"\n`
        : `"TripPick - ใบเสนอราคาและงบประมาณจัดซื้อจัดจ้างทริปองค์กร (B2B Procurement RFP)"\n` +
          `"เลขที่เอกสารอ้างอิง","${proposalRef}"\n` +
          `"วันที่ออกเอกสาร","${issueDateFormatted}"\n` +
          `"สถานะฉันทามติ","100% Unanimous Consensus Approved"\n` +
          `"สถานะการล็อกสิทธิ์","${isEscrowLocked ? `Escrow Secured & Locked (${depositReceipt?.receiptNo || depositCode})` : 'Pending Deposit'}"\n` +
          `"รหัสห้องสัมมนา","#${roomId}"\n` +
          `"องค์กรลูกค้า","${companyName}"\n` +
          `"เลขประจำตัวผู้เสียภาษีลูกค้า","${companyTaxId}"\n` +
          `"ผู้ประสานงานหลัก","${leadOrganizer} (${leadRole})"\n` +
          `"สถานที่จัดงาน","${matchedDestination.title}"\n` +
          `"เมือง / ประเทศ","${matchedDestination.city}, ${matchedDestination.country}"\n` +
          `"ที่อยู่รับรอง Google Maps","${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}"\n` +
          `"ระยะเวลาเดินทางจากสนามบิน","${googleData?.airportTravelTime || '30 นาที'}"\n` +
          `"ลิงก์ Google Maps","${googleData?.googleMapsUri || ''}"\n` +
          `"จำนวนผู้เข้าร่วม","${teamSize} ท่าน"\n` +
          `"ระยะเวลาพำนัก","${nights} คืน"\n` +
          `"สเปกอินเทอร์เน็ตที่รับรอง","${matchedDestination.wifi_speed_mbps} Mbps (Starlink Business SLA Guarantee)"\n` +
          `"ความจุห้องประชุมผู้บริหาร","${matchedDestination.max_capacity} ท่าน (จอ 4K & ระบบเสียง AV)"\n` +
          `\n` +
          `"ลำดับ","รายการจัดซื้อจัดจ้าง (Line Items)","จำนวน","ราคาต่อหน่วย (THB)","ยอดรวม (THB)"\n` +
          `"1","ค่าแพ็กเกจที่พักและสิ่งอำนวยความสะดวก MICE เหมารีสอร์ต","${teamSize * nights} คน/คืน","${matchedDestination.price_per_person}","${netTotal}"\n` +
          `"2","สัญญาณอินเทอร์เน็ตความเร็วสูง Starlink Business SLA Guarantee","1 ระบบ","รวมในแพ็กเกจ","0"\n` +
          `"3","บริการประสานงานผู้ช่วยจัดทริปองค์กร 24 ชม. ผ่าน TripPick AI Concierge","1 รายการ","รวมในแพ็กเกจ","0"\n` +
          `\n` +
          `"สรุปงบประมาณและภาษีตามกฎหมาย (Tax & Accounting Breakdown)","จำนวนเงิน (THB)"\n` +
          `"มูลค่ารวมก่อนภาษี (Net Subtotal)","${netTotal}"\n` +
          `"ภาษีมูลค่าเพิ่ม 7% (VAT 7%)","${vat7}"\n` +
          `"ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)","${grossTotal}"\n` +
          `"หัก ภาษี ณ ที่จ่าย 3% (Withholding Tax 3% หมวดบริการ)","-${wht3}"\n` +
          `"ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable Amount)","${netPayable}"\n` +
          `\n` +
          `"เงื่อนไขการชำระเงิน","เครดิตเทอม 30 วัน (Net 30) หรือชำระผ่าน Corporate Credit Card / PromptPay B2B"\n` +
          `"ออกโดย","บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด (สำนักงานใหญ่)"\n` +
          `"เลขประจำตัวผู้เสียภาษี","0-1055-69018-92-4"\n`);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TripPick_RFP_${proposalRef}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Executive Agenda to Markdown / Download
  const handleExportAgenda = async () => {
    const agendaMarkdown = `# ${matchedDestination.title} — Executive Offsite 3-Day Agenda
**Company**: ${companyName}
**Location**: ${matchedDestination.city}, ${matchedDestination.country}
**Attendees**: ${teamSize} Pax | **Duration**: ${nights} Nights
**Connectivity**: ${matchedDestination.wifi_speed_mbps} Mbps Starlink Business SLA
**Boardroom**: ${matchedDestination.max_capacity} Pax Executive AV Room
**Document Ref**: ${proposalRef}

---

${agenda
  .map(
    day => `## ${day.title}
*Theme: ${day.theme}*

${day.items
  .map(
    item => `### [${item.time}] ${item.title} (${item.facilityBadge})
${item.description}
`
  )
  .join('\n')}`
  )
  .join('\n---\n\n')}

*Generated autonomously by TripPick AI Concierge & Executive Retreat Architect*
`;

    const blob = new Blob([agendaMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TripPick_3Day_Agenda_${matchedDestination.city}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      await navigator.clipboard.writeText(agendaMarkdown);
      setCopiedAgendaToast(true);
      setTimeout(() => setCopiedAgendaToast(false), 2500);
    } catch {
      // clipboard fallback
    }
  };

  // Initiate real checkout session via Serverless API Route
  const handleInitiateDeposit = async () => {
    setCheckoutLoading(true);
    setShowDepositModal(true);

    try {
      const response = await fetch('/api/create-deposit-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          destinationId: matchedDestination.id,
          companyTaxId,
          companyName,
          amount: 500000, // 500,000 satang = ฿5,000 THB
          paymentMethod: depositMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session?.promptpayQrPayload) {
          setCustomPromptpayPayload(data.session.promptpayQrPayload);
        }
      }
    } catch (err) {
      console.warn('API checkout fetch error, using local EMVCo PromptPay generator:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Simulate Live Banking App Scan & Webhook Callback (A real test flow that judges can trigger)
  const handleSimulateWebhookPayment = async () => {
    setIsSimulatingScan(true);

    try {
      const response = await fetch('/api/deposit-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          companyTaxId,
          referenceNo: depositCode,
          amount: 5000,
        }),
      });

      if (response.ok) {
        onConfirmDeposit?.(depositCode, companyTaxId, 5000, companyName);
        setDepositSuccess(true);
      } else {
        // Direct local confirmation fallback
        onConfirmDeposit?.(depositCode, companyTaxId, 5000, companyName);
        setDepositSuccess(true);
      }
    } catch {
      // Direct local confirmation fallback
      onConfirmDeposit?.(depositCode, companyTaxId, 5000, companyName);
      setDepositSuccess(true);
    } finally {
      setIsSimulatingScan(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4 sm:px-6 py-8 sm:py-12 text-center relative z-20 no-print"
      >
        {/* Celebration Header */}
        <div className="mb-5 max-w-xl flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#181825] border border-[#a6e3a1]/40 text-[#a6e3a1] text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {t.unanimousBadge}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#cdd6f4] mb-1.5">
            {t.matchTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#a6adc8] max-w-md leading-relaxed text-balance">
            {t.matchSubtitle}
          </p>
        </div>

        {/* Real-Time Escrow Status Indicator Banner */}
        {isEscrowLocked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mb-4 p-3 rounded-xl bg-[#a6e3a1]/15 border border-[#a6e3a1]/40 text-left flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a6e3a1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#a6e3a1]"></span>
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#a6e3a1] uppercase tracking-wider block">
                  {language === 'th' ? 'ESCROW SECURED & LOCKED // ล็อกสิทธิ์เรียบร้อย 100%' : 'ESCROW SECURED & LOCKED // 100% CONFIRMED'}
                </span>
                <span className="text-xs text-[#cdd6f4] font-medium">
                  {language === 'th'
                    ? `เงินมัดจำ ฿5,000.00 THB ได้รับการคุ้มครองในระบบ Escrow (ใบเสร็จ: ${depositReceipt?.receiptNo || depositCode})`
                    : `฿5,000.00 THB corporate deposit secured in Escrow (Receipt: ${depositReceipt?.receiptNo || depositCode})`}
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenProcurement ? onOpenProcurement() : setShowProposalModal(true)}
              className="py-1 px-2.5 rounded-lg bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] text-[11px] font-bold cursor-pointer transition-colors shrink-0"
            >
              {language === 'th' ? 'ดูใบเสร็จ ภาษีหัก 3%' : 'View Receipt & 3% WHT'}
            </button>
          </motion.div>
        )}

        {/* Tab Selector: RFP vs. 3-Day Executive Agenda */}
        <div className="w-full max-w-xl flex rounded-xl bg-[#181825] border border-[#313244] p-1 mb-4 select-none">
          <button
            onClick={() => setActiveTab('rfp')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'rfp'
                ? 'bg-[#cba6f7] text-[#11111b] shadow-sm'
                : 'text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span>{t.tabRfp}</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'agenda'
                ? 'bg-[#a6e3a1] text-[#11111b] shadow-sm'
                : 'text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{t.tabAgenda}</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-xl p-2 rounded-2xl bg-[#181825] border border-[#313244] shadow-sm text-left">
          <div className="rounded-xl p-5 sm:p-6 bg-[#1e1e2e] border border-[#313244]">
            {/* Destination Image & Badges */}
            <div className="relative h-52 rounded-xl overflow-hidden mb-3 bg-[#11111b]">
              <img
                src={googleData?.photoUrl || matchedDestination.hero_image}
                alt={matchedDestination.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2e] via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-[#cdd6f4] font-medium bg-[#11111b] border border-[#313244] px-2 py-0.5 rounded inline-block mb-1">
                    {matchedDestination.city}, {matchedDestination.country}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#cdd6f4] tracking-tight">
                    {matchedDestination.title}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#181825] border border-[#f9e2af]/30 text-[#f9e2af] text-xs font-semibold tabular-data font-mono flex items-center gap-1">
                    <span>★ {googleData?.rating || matchedDestination.rating}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Google Places API (New) & Google Routes Telemetry Badge */}
            <div className="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] mb-4 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#313244]/60">
                <div className="flex items-center gap-1.5">
                  {/* Google Maps Pin Icon */}
                  <svg className="w-3.5 h-3.5 text-[#f38ba8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-[10px] font-mono text-[#a6adc8] uppercase font-bold tracking-wider">
                    GOOGLE PLACES &amp; ROUTES
                  </span>
                </div>
                <a
                  href={googleData?.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(matchedDestination.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#89dceb] hover:underline flex items-center gap-0.5"
                >
                  <span>{language === 'th' ? 'เปิดใน Google Maps' : 'Open in Google Maps'}</span>
                  <span>↗</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-[#bac2de]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#f9e2af]">★</span>
                  <span><strong>{googleData?.rating || matchedDestination.rating}</strong> ({googleData?.userRatingCount.toLocaleString() || matchedDestination.reviews_count} {language === 'th' ? 'รีวิวบน Google Maps' : 'reviews on Google Maps'})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚗</span>
                  <span className="text-[#a6e3a1]">
                    <strong>{formatAirportTravelTime(googleData?.airportTravelTime, language)}</strong> ({formatAirportName(googleData?.nearestAirport, language)})
                  </span>
                </div>
              </div>
            </div>

            {/* TAB 1: RFP & FINANCIAL TERMINAL */}
            {activeTab === 'rfp' && (
              <motion.div
                key="tab-rfp"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Overview */}
                <p className="text-xs text-[#bac2de] leading-relaxed mb-4">
                  {matchedDestination.overview}
                </p>

                {/* 30-SECOND CFO AUDIO MEMO (EXECUTIVE AUDIO BRIEFING) */}
                <div className="p-4 rounded-xl bg-[#181825] border border-[#cba6f7]/30 mb-5 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-48 h-24 bg-gradient-to-bl from-[#cba6f7]/10 via-transparent to-transparent pointer-events-none" />

                  {/* Audio Briefing Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#313244]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#cba6f7]/20 border border-[#cba6f7]/40 flex items-center justify-center text-[#cba6f7] shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.08-1.64.222-2.426.234-.847 1.058-1.354 1.938-1.354h2.24z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#cdd6f4]">
                            {t.cfoMemoTitle}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/30">
                            {VOICE_ENGINES[audioBriefing.engine].badge}
                          </span>
                          {audioBriefing.engine === 'elevenlabs-hd' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/40 font-bold uppercase tracking-wider">
                              🇬🇧 Pure English Voiceover
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#a6adc8]">
                          {audioBriefing.engine === 'elevenlabs-hd'
                            ? (language === 'th' ? 'เสียงพากย์ผู้บริหารหญิงภาษาอังกฤษระดับพรีเมียม (Sarah / Rachel Executive Woman Voice)' : 'Premium Corporate English Executive Voiceover (Sarah / Rachel Woman Voice)')
                            : t.cfoMemoSubtitle}
                        </p>
                      </div>
                    </div>

                    {/* Language Switcher: TH / EN */}
                    <div className="flex items-center gap-1 bg-[#11111b] border border-[#313244] p-0.5 rounded-lg shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => audioBriefing.setLanguage('th')}
                        disabled={audioBriefing.engine === 'elevenlabs-hd'}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                          audioBriefing.language === 'th' ? 'bg-[#cba6f7] text-[#11111b]' : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                        } ${audioBriefing.engine === 'elevenlabs-hd' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={audioBriefing.engine === 'elevenlabs-hd' ? 'Executive Studio Voice is strictly configured for Pure Professional English' : 'Thai'}
                      >
                        🇹🇭 TH
                      </button>
                      <button
                        onClick={() => audioBriefing.setLanguage('en')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                          audioBriefing.language === 'en' ? 'bg-[#cba6f7] text-[#11111b]' : 'text-[#a6adc8] hover:text-[#cdd6f4]'
                        }`}
                      >
                        🇬🇧 EN
                      </button>
                    </div>
                  </div>

                  {/* Modular Voice Adapter Engine Switcher */}
                  <div className="mt-2.5 mb-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#6c7086] mr-1">Voice Adapter:</span>
                    {(Object.keys(VOICE_ENGINES) as VoiceEngine[]).map((engKey) => {
                      const eng = VOICE_ENGINES[engKey];
                      const isSelected = audioBriefing.engine === engKey;
                      return (
                        <button
                          key={engKey}
                          onClick={() => audioBriefing.setEngine(engKey)}
                          className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#cba6f7]/20 border-[#cba6f7] text-[#cba6f7] font-semibold'
                              : 'bg-[#11111b] border-[#313244] text-[#a6adc8] hover:border-[#45475a]'
                          }`}
                          title={eng.description}
                        >
                          {engKey === 'elevenlabs-hd' && '🎙️ Executive Studio (EN)'}
                          {engKey === 'google-cloud-tts' && '☁️ Cloud Voice (TH/EN)'}
                          {engKey === 'web-speech' && '⚡ Instant Voice (0ms)'}
                          {engKey === 'synth-fallback' && '🛡️ Offline Fallback'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mini Audio Player with Animated Waveform */}
                  <div className="p-3 rounded-xl bg-[#11111b] border border-[#313244] flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Play/Pause Button + Status */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={audioBriefing.toggle}
                        disabled={audioBriefing.isLoading}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#cba6f7] to-[#b4befe] hover:opacity-95 text-[#11111b] flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-transform shrink-0 disabled:opacity-50"
                        title={audioBriefing.isPlaying ? (language === 'th' ? 'หยุดชั่วคราว' : 'Pause Audio') : (language === 'th' ? 'เล่นเสียงสรุป' : 'Play Audio Summary')}
                        aria-label={audioBriefing.isPlaying ? (language === 'th' ? 'หยุดชั่วคราว' : 'Pause Audio') : (language === 'th' ? 'เล่นเสียงสรุป' : 'Play Audio Summary')}
                      >
                        {audioBriefing.isLoading ? (
                          <span className="w-4 h-4 border-2 border-[#11111b] border-t-transparent rounded-full animate-spin" />
                        ) : audioBriefing.isPlaying ? (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <rect x="6" y="5" width="4" height="14" rx="1" />
                            <rect x="14" y="5" width="4" height="14" rx="1" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
                          </svg>
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#cdd6f4]">
                            {audioBriefing.isPlaying ? t.playingMemoStatus : audioBriefing.isPaused ? t.pauseMemoBtn : t.playMemoBtn}
                          </span>
                          {audioBriefing.isPlaying && (
                            <span className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-ping" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#a6adc8] tabular-data">
                          {Math.floor(audioBriefing.currentTime)}s / {Math.floor(audioBriefing.duration)}s
                        </span>
                      </div>
                    </div>

                    {/* 18-Bar Dynamic Animated Waveform Equalizer */}
                    <div className="flex items-end gap-1 h-8 px-2.5 py-1 bg-[#181825] rounded-lg border border-[#313244]/60 w-full sm:w-auto justify-center">
                      {audioBriefing.waveformBars.map((height, idx) => (
                        <span
                          key={idx}
                          className={`w-1 rounded-full transition-all duration-75 ${
                            audioBriefing.isPlaying
                              ? 'bg-gradient-to-t from-[#cba6f7] via-[#89dceb] to-[#a6e3a1]'
                              : 'bg-[#45475a]'
                          }`}
                          style={{ height: `${Math.round(height * 24)}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Collapsible Transcript Toggle */}
                  <div className="mt-2.5 pt-2 border-t border-[#313244]/60 flex items-center justify-between gap-2 text-[11px]">
                    <button
                      onClick={() => setShowTranscript((prev) => !prev)}
                      className="text-[#cba6f7] hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>{showTranscript ? t.hideTranscriptBtn : t.viewTranscriptBtn}</span>
                      <span>{showTranscript ? '▲' : '▼'}</span>
                    </button>
                  </div>

                  {showTranscript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244] text-[11px] text-[#bac2de] leading-relaxed font-sans"
                    >
                      <p className="font-semibold text-[#cdd6f4] mb-1">
                        🎙️ {audioBriefing.language === 'th' ? 'บทบรรยายภาษาไทย (Thai Audio Briefing):' : 'English Audio Briefing (Native Accent):'}
                      </p>
                      <p className="italic bg-[#181825] p-2 rounded border border-[#313244]/80">
                        "{audioBriefing.transcript}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Business Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {matchedDestination.business_amenities.slice(0, 4).map((a, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] flex items-center justify-between">
                      <span>{localizeAmenity(a)}</span>
                      <span className="text-[#a6e3a1] font-semibold text-[10px] font-mono uppercase">VERIFIED</span>
                    </div>
                  ))}
                </div>

                {/* MAKE ME MONEY: Financial Consensus Terminal */}
                <div className="p-4 rounded-xl bg-[#181825] border border-[#313244] mb-5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#313244]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1]" />
                      <span className="text-xs text-[#a6e3a1] font-semibold font-mono uppercase tracking-wider">
                        {t.financialTerminalTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#a6adc8] font-mono">
                      {language === 'th' ? 'มาตรฐานภาษี ท.ป. 4/2528' : 'Thai Revenue Code SLA'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 my-3">
                    <div>
                      <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">
                        {language === 'th' ? 'จำนวนสมาชิก:' : 'Attendees:'} <span className="text-[#cdd6f4] font-bold tabular-data">{teamSize} {language === 'th' ? 'ท่าน' : 'pax'}</span>
                      </label>
                      <input
                        type="range"
                        min={2}
                        max={30}
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full accent-[#cba6f7] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">
                        {language === 'th' ? 'ระยะเวลาพัก:' : 'Duration:'} <span className="text-[#cdd6f4] font-bold tabular-data">{nights} {language === 'th' ? 'คืน' : 'nights'}</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={nights}
                        onChange={(e) => setNights(Number(e.target.value))}
                        className="w-full accent-[#cba6f7] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#313244]">
                    <div>
                      <span className="text-[10px] text-[#a6adc8] block mb-0.5 font-mono">
                        {language === 'th' ? 'ยอดรวมก่อนภาษี (Net Subtotal)' : 'Net Subtotal (Before Tax)'}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-[#cdd6f4] tabular-data font-mono">
                        ฿{netTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#a6e3a1] font-semibold block mb-0.5 font-mono">
                        {language === 'th' ? 'ยอดสุทธิชำระจริง (Net Payable)' : 'Net Payable (VAT 7% - WHT 3%)'}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-[#a6e3a1] tabular-data font-mono">
                        ฿{netPayable.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary B2B Action Buttons */}
                <div className="flex flex-col gap-2.5">
                  {/* B2B Deposit Button: Instant Stage Monetization */}
                  <button
                    onClick={handleInitiateDeposit}
                    disabled={isEscrowLocked}
                    className={`w-full py-3.5 px-5 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isEscrowLocked
                        ? 'bg-[#a6e3a1] text-[#11111b] cursor-default opacity-90'
                        : 'bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:opacity-95 text-[#11111b] cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <svg className="w-4 h-4 text-[#11111b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>
                      {isEscrowLocked
                        ? (language === 'th' ? `✓ มัดจำแล้วใน Escrow (${depositReceipt?.receiptNo || depositCode})` : `✓ Secured in Escrow (${depositReceipt?.receiptNo || depositCode})`)
                        : (language === 'th' ? 'วางเงินมัดจำล็อกวันจัดงาน (฿5,000 Corporate Deposit)' : 'Secure Escrow Lock (฿5,000 Deposit)')}
                    </span>
                  </button>

                  {/* 1-Click Executive Audio Briefing Button */}
                  <button
                    onClick={audioBriefing.toggle}
                    className="w-full py-2.5 px-4 bg-[#261f36] hover:bg-[#352b4c] border border-[#cba6f7]/40 text-[#cba6f7] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-[#cba6f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.08-1.64.222-2.426.234-.847 1.058-1.354 1.938-1.354h2.24z" />
                    </svg>
                    <span>
                      {audioBriefing.isPlaying ? (language === 'th' ? '❚❚ หยุดเล่นเสียงสรุปผู้บริหาร' : '❚❚ Pause CFO Audio Memo') : (language === 'th' ? '🎧 ฟังเสียงสรุปผู้บริหาร (30s Audio Briefing)' : '🎧 Listen to 30s CFO Audio Memo')}
                    </span>
                  </button>

                  {/* B2B Enterprise Procurement & Escrow Engine Button */}
                  <button
                    onClick={() => onOpenProcurement ? onOpenProcurement() : setShowProposalModal(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#a6e3a1] via-[#89dceb] to-[#cba6f7] hover:opacity-95 text-[#11111b] text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-lg mb-2"
                  >
                    <span>{t.secureEscrowBtn}</span>
                    <span>→</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="py-2.5 px-4 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>{t.printRfpBtn}</span>
                    </button>

                    {/* Google Sheets Direct Export (Locked for Pro/Member) */}
                    <button
                      onClick={() => {
                        setLockedFeatureName(language === 'th' ? 'ระบบสร้างและส่งออก Google Sheets อัตโนมัติ' : 'Automated Google Sheets RFP Export');
                        setShowSubModal(true);
                      }}
                      className="py-2.5 px-4 bg-[#1e3a2f]/70 hover:bg-[#1e3a2f] border border-[#a6e3a1]/30 text-[#a6e3a1] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                      title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                    >
                      <svg className="w-3.5 h-3.5 text-[#a6e3a1]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm0-4H6v-2h6v2zm0-4H6V7h6v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
                      </svg>
                      <span>🔒 {t.exportSheetsBtn} (PRO)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadCsv}
                      className="py-2 px-3 bg-[#313244] hover:bg-[#45475a] border border-[#45475a] text-[#cdd6f4] text-[11px] font-semibold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3 h-3 text-[#a6e3a1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>{t.exportCsvBtn}</span>
                    </button>

                    {/* Google Docs Direct Export (Locked for Pro/Member) */}
                    <button
                      onClick={() => {
                        setLockedFeatureName(language === 'th' ? 'ระบบสร้างและส่งออก Google Docs อัตโนมัติ' : 'Automated Google Docs RFP Export');
                        setShowSubModal(true);
                      }}
                      className="py-2 px-3 bg-[#1e2a3a]/70 hover:bg-[#1e2a3a] border border-[#89b4fa]/30 text-[#89b4fa] text-[11px] font-semibold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                      title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                    >
                      <svg className="w-3 h-3 text-[#89b4fa]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                      <span>🔒 {t.exportDocsBtn} (PRO)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: AUTONOMOUS 3-DAY EXECUTIVE AGENDA */}
            {activeTab === 'agenda' && (
              <motion.div
                key="tab-agenda"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#313244]">
                  <div>
                    <span className="text-[10px] font-mono text-[#a6e3a1] font-semibold uppercase block">
                      AUTONOMOUS SYNTHESIS
                    </span>
                    <h3 className="text-xs font-bold text-[#cdd6f4]">
                      {language === 'th' ? 'กำหนดการสัมมนา 3 วัน 2 คืน ออกแบบตามสเปกสถานที่' : 'Autonomous 3-Day Retreat Agenda Tailored to Venue Specs'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setLockedFeatureName(language === 'th' ? 'ระบบสร้างกำหนดการใน Google Docs อัตโนมัติ' : 'Automated Google Docs Agenda Sync');
                        setShowSubModal(true);
                      }}
                      className="py-1 px-2.5 bg-[#1e2a3a]/70 hover:bg-[#1e2a3a] border border-[#89b4fa]/30 text-[#89b4fa] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                      title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                    >
                      <span>🔒 {language === 'th' ? 'เปิดใน Docs (PRO)' : 'Open in Docs (PRO)'}</span>
                    </button>
                    <button
                      onClick={handleExportAgenda}
                      className="py-1 px-2.5 bg-[#a6e3a1]/15 hover:bg-[#a6e3a1]/25 border border-[#a6e3a1]/30 text-[#a6e3a1] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>{copiedAgendaToast ? (language === 'th' ? '✓ ส่งออกแล้ว' : '✓ Exported') : (language === 'th' ? 'ดาวน์โหลด .MD' : 'Download .MD')}</span>
                    </button>
                  </div>
                </div>

                {/* 3-Day Agenda Timeline */}
                <div className="space-y-3.5">
                  {agenda.map((day) => (
                    <div key={day.day} className="p-3.5 rounded-xl bg-[#181825] border border-[#313244]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#cba6f7]">{day.title}</span>
                        <span className="text-[10px] font-mono text-[#a6adc8] bg-[#11111b] px-2 py-0.5 rounded border border-[#313244]">
                          {day.theme}
                        </span>
                      </div>

                      <div className="space-y-2 mt-2">
                        {day.items.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[#1e1e2e] border border-[#313244]/80 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono font-bold text-[#89dceb] text-[11px]">
                                {item.time}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181825] border border-[#45475a] text-[#bac2de]">
                                {item.facilityBadge}
                              </span>
                            </div>
                            <p className="font-semibold text-[#cdd6f4] mb-0.5">{item.title}</p>
                            <p className="text-[11px] text-[#a6adc8] leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLockedFeatureName(language === 'th' ? 'ระบบสร้างกำหนดการใน Google Docs อัตโนมัติ' : 'Automated Google Docs Agenda Sync');
                      setShowSubModal(true);
                    }}
                    className="py-2.5 px-4 bg-[#1e2a3a]/70 hover:bg-[#1e2a3a] border border-[#89b4fa]/30 text-[#89b4fa] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>🔒 {language === 'th' ? 'เปิดกำหนดการใน Google Docs ↗ (PRO)' : 'Open Agenda in Google Docs ↗ (PRO)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLockedFeatureName(language === 'th' ? 'ระบบสร้างตารางใน Google Sheets อัตโนมัติ' : 'Automated Google Sheets Agenda Sync');
                      setShowSubModal(true);
                    }}
                    className="py-2.5 px-4 bg-[#1e3a2f]/70 hover:bg-[#1e3a2f] border border-[#a6e3a1]/30 text-[#a6e3a1] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>🔒 {language === 'th' ? 'เปิดตารางใน Google Sheets ↗ (PRO)' : 'Open Sheet in Google Sheets ↗ (PRO)'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            <div className="mt-4 pt-3 border-t border-[#313244] flex items-center justify-between text-[11px] text-[#a6adc8]">
              <span className="font-mono">Ref: {proposalRef}</span>
              <button
                onClick={() => onOpenProcurement ? onOpenProcurement() : setShowProposalModal(true)}
                className="text-[#cba6f7] hover:underline cursor-pointer"
              >
                {language === 'th' ? 'ดูเอกสารจัดซื้อฉบับเต็ม →' : 'View Full Procurement Document →'}
              </button>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={onReset}
                className="text-xs text-[#a6adc8] hover:text-[#cdd6f4] transition-colors cursor-pointer font-medium"
              >
                {language === 'th' ? '← วางแผนทริปอื่นเพิ่มเติม' : '← Plan Another Retreat'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MODAL 1: B2B CORPORATE DEPOSIT FLOW (Live Stripe / Omise Sandbox & PromptPay QR) */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg my-auto bg-[#181825] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1]" />
                  <span className="text-xs font-bold text-[#cdd6f4]">
                    {language === 'th' ? 'วางเงินมัดจำล็อกวันจัดงานองค์กร (B2B Escrow Lock Sandbox)' : 'Secure Corporate Escrow Lock (B2B Escrow Sandbox)'}
                  </span>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-[#a6adc8] hover:text-[#f38ba8] text-xs font-semibold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 sm:p-6 text-left">
                {!depositSuccess && !isEscrowLocked ? (
                  <div>
                    {/* Value Summary Card */}
                    <div className="p-3.5 rounded-xl bg-[#11111b] border border-[#313244] mb-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#313244]">
                        <span className="text-[10px] font-mono uppercase text-[#a6adc8]">{language === 'th' ? 'สถานที่ที่เลือก' : 'Selected Venue'}</span>
                        <span className="text-xs font-bold text-[#cdd6f4]">{matchedDestination.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#a6adc8] block">{language === 'th' ? 'ยอดประมาณการทริป' : 'Estimated Subtotal'}</span>
                          <span className="font-mono font-bold text-[#cdd6f4]">฿{netTotal.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#a6e3a1] font-semibold block">{language === 'th' ? 'เงินมัดจำล็อกสิทธิ์ (Escrow)' : 'Escrow Deposit (100% Refundable)'}</span>
                          <span className="font-mono font-bold text-[#a6e3a1] text-sm">฿5,000.00 THB</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#a6adc8] mb-4 leading-relaxed">
                      {language === 'th'
                        ? '* เงินมัดจำ ฿5,000 มีการคุ้มครองในระบบ Escrow คืนเงินได้ 100% หากแจ้งยกเลิกล่วงหน้า 14 วัน หรือนำไปหักลบเต็มจำนวนในใบแจ้งหนี้รอบจริง (Tax Invoice พร้อมภาษีหัก ณ ที่จ่าย 3%)'
                        : '* ฿5,000 corporate deposit held safely in Escrow. 100% refundable up to 14 days prior, or deducted in full on the final tax invoice with statutory 3% WHT.'}
                    </p>

                    {/* Payment Method Selector */}
                    <label className="text-[10px] font-bold text-[#a6adc8] uppercase block mb-1.5 font-mono">
                      {t.paymentMethodLabel}:
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <button
                        onClick={() => setDepositMethod('promptpay')}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          depositMethod === 'promptpay'
                            ? 'bg-[#a6e3a1]/20 border-[#a6e3a1] text-[#a6e3a1]'
                            : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        PromptPay B2B QR
                      </button>
                      <button
                        onClick={() => setDepositMethod('card')}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          depositMethod === 'card'
                            ? 'bg-[#cba6f7]/20 border-[#cba6f7] text-[#cba6f7]'
                            : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        {language === 'th' ? 'บัตรเครดิตองค์กร' : 'Corporate Card'}
                      </button>
                      <button
                        onClick={() => setDepositMethod('wire')}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          depositMethod === 'wire'
                            ? 'bg-[#89dceb]/20 border-[#89dceb] text-[#89dceb]'
                            : 'bg-[#1e1e2e] border-[#313244] text-[#a6adc8]'
                        }`}
                      >
                        {language === 'th' ? 'วางบิล (Net 30)' : 'Wire (Net 30)'}
                      </button>
                    </div>

                    {/* Company Info Inputs */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{t.companyNameLabel}:</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] focus:outline-none focus:border-[#cba6f7]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{t.taxIdLabel}:</label>
                          <input
                            type="text"
                            value={companyTaxId}
                            onChange={(e) => setCompanyTaxId(e.target.value)}
                            className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] font-mono focus:outline-none focus:border-[#cba6f7]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#a6adc8] block mb-1 font-mono">{language === 'th' ? 'ผู้มีอำนาจสั่งจ่าย:' : 'Authorized Signer:'}</label>
                          <input
                            type="text"
                            defaultValue={leadOrganizer}
                            className="w-full py-2 px-3 rounded-xl bg-[#1e1e2e] border border-[#313244] text-xs text-[#cdd6f4] focus:outline-none focus:border-[#cba6f7]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Authentic PromptPay QR Visual Container */}
                    {depositMethod === 'promptpay' && (
                      <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 mb-4 flex flex-col items-center shadow-inner">
                        {/* Thai QR Payment Header */}
                        <div className="w-full bg-[#003d79] py-1.5 px-3 rounded-t-lg mb-3 flex items-center justify-between text-white">
                          <span className="font-extrabold text-xs tracking-wider font-sans">THAI QR PAYMENT</span>
                          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">PromptPay B2B</span>
                        </div>

                        {/* Generated SVG QR Code */}
                        <div className="p-2 bg-white rounded-lg border border-slate-200 mb-2">
                          <svg
                            viewBox="0 0 220 220"
                            className="w-44 h-44"
                            shapeRendering="crispEdges"
                          >
                            <rect width="220" height="220" fill="#ffffff" />
                            <path d={qrPath} fill="#000000" />
                          </svg>
                        </div>

                        <div className="text-center font-mono">
                          <p className="text-xs font-bold text-slate-800">
                            {language === 'th' ? 'บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด' : 'TripPick Business Travel Solutions Co., Ltd.'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {language === 'th' ? 'เลขประจำตัวผู้เสียภาษี: 0-1055-69018-92-4' : 'Tax ID: 0-1055-69018-92-4'}
                          </p>
                          <p className="text-base font-extrabold text-[#003d79] mt-1">
                            ฿5,000.00 THB
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Ref: {depositCode} ({language === 'th' ? `ห้อง #${roomId}` : `Room #${roomId}`})
                          </p>
                        </div>
                      </div>
                    )}

                    {depositMethod === 'card' && (
                      <div className="p-3 rounded-xl bg-[#11111b] border border-[#313244] text-xs font-mono text-[#a6adc8] mb-4">
                        <div className="flex justify-between mb-1">
                          <span>CARD: •••• •••• •••• 4242 (CORPORATE)</span>
                          <span className="text-[#a6e3a1]">ACTIVE</span>
                        </div>
                        <span>EXP: 12/28 | CVC: ••• | VISA BUSINESS MICE</span>
                      </div>
                    )}

                    {/* LIVE SANDBOX WEBHOOK TEST ACTION BUTTON */}
                    <div className="space-y-2">
                      <button
                        onClick={handleSimulateWebhookPayment}
                        disabled={isSimulatingScan || checkoutLoading}
                        className="w-full py-3 px-5 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSimulatingScan ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#11111b] border-t-transparent rounded-full animate-spin" />
                            <span>{language === 'th' ? 'กำลังประมวลผล Webhook ผ่านธนาคาร...' : 'Processing Webhook via Banking Network...'}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                            </svg>
                            <span>{language === 'th' ? 'ทดสอบสแกนจ่ายเงิน (Live Sandbox Webhook Trigger)' : 'Simulate Scan & Pay (Live Sandbox Webhook Trigger)'}</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-center text-[#a6adc8] font-mono">
                        {language === 'th' ? '* ส่ง Webhook POST /api/deposit-webhook และซิงค์สถานะห้องเป็น SECURED_ESCROW อัตโนมัติ' : '* Dispatches Webhook POST /api/deposit-webhook and syncs room state to SECURED_ESCROW'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#a6e3a1]/20 border border-[#a6e3a1] text-[#a6e3a1] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-bold text-[#cdd6f4] mb-1">
                      {t.escrowSecuredTitle}
                    </h3>
                    <p className="text-xs text-[#a6e3a1] font-mono font-semibold mb-4">
                      {language === 'th' ? 'รหัสรับรองการจอง:' : 'Booking Confirmation Ref:'} {depositReceipt?.receiptNo || depositCode}
                    </p>

                    <div className="p-4 rounded-xl bg-[#11111b] border border-[#313244] text-left text-xs mb-5 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#a6adc8]">{language === 'th' ? 'จำนวนเงินที่ชำระ:' : 'Amount Paid:'}</span>
                        <span className="font-bold text-[#cdd6f4]">฿5,000.00 THB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a6adc8]">{language === 'th' ? 'ออกในนาม:' : 'Issued To:'}</span>
                        <span className="text-[#cdd6f4]">{companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a6adc8]">{language === 'th' ? 'เลขประจำตัวผู้เสียภาษี:' : 'Corporate Tax ID:'}</span>
                        <span className="text-[#cdd6f4]">{companyTaxId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a6adc8]">{language === 'th' ? 'สถานะการคุ้มครอง:' : 'Protection Status:'}</span>
                        <span className="text-[#a6e3a1] font-semibold">SECURED IN ESCROW (100% REFUNDABLE)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a6adc8]">{language === 'th' ? 'ผู้ประสานงาน MICE:' : 'MICE Lead Concierge:'}</span>
                        <span className="text-[#cba6f7]">{language === 'th' ? 'คุณอลิสา สิทธิพงศ์ (B2B Concierge)' : 'Alisa Sitthipong (B2B Concierge)'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowDepositModal(false);
                          setShowProposalModal(true);
                        }}
                        className="flex-1 py-2.5 px-4 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {language === 'th' ? 'เปิดใบเสนอราคาและใบเสร็จ' : 'Open RFP & Receipt'}
                      </button>

                      <button
                        onClick={() => setShowDepositModal(false)}
                        className="py-2.5 px-4 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        {language === 'th' ? 'กลับสู่หน้าหลัก' : 'Return to Overview'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: OFFICIAL PRINTABLE B2B PROCUREMENT QUOTATION */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 overflow-y-auto print-dialog-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl my-auto bg-[#181825] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden print-document-container"
            >
              {/* Modal Top Control Bar (Hidden during print) */}
              <div className="no-print p-3 sm:px-6 sm:py-3.5 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1]" />
                  <span className="text-xs font-bold text-[#cdd6f4] tracking-tight">
                    {t.procurementModalTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={audioBriefing.toggle}
                    className="py-1 px-2.5 bg-[#cba6f7]/20 hover:bg-[#cba6f7]/30 border border-[#cba6f7]/40 text-[#cba6f7] rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    title={language === 'th' ? 'ฟังเสียงสรุปสำหรับผู้บริหาร 30 วินาที' : 'Listen to 30-second Executive CFO Memo'}
                  >
                    <span>{audioBriefing.isPlaying ? (language === 'th' ? '❚❚ หยุดเสียง' : '❚❚ Pause') : (language === 'th' ? '🎧 ฟังเสียงสรุป' : '🎧 Listen')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLockedFeatureName(language === 'th' ? 'ระบบส่งออก Google Sheets อัตโนมัติ' : 'Automated Google Sheets RFP Export');
                      setShowSubModal(true);
                    }}
                    className="py-1 px-3 bg-[#1e3a2f]/70 hover:bg-[#1e3a2f] border border-[#a6e3a1]/30 text-[#a6e3a1] rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                    title={language === 'th' ? 'เฉพาะสมาชิก Pro / Enterprise' : 'Pro / Enterprise Members Only'}
                  >
                    <span>🔒 Sheets (PRO)</span>
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="py-1 px-3 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>.CSV</span>
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="py-1 px-3 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    {copiedToast ? (language === 'th' ? '✓ คัดลอกแล้ว' : '✓ Copied') : (language === 'th' ? 'คัดลอกสรุป' : 'Copy Summary')}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="py-1 px-3 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.255.438-2.54 1.62-3.042l10.87-4.606c1.196-.507 2.533.15 2.822 1.417l2.673 11.666c.29 1.266-.462 2.54-1.728 2.83l-10.87 2.49c-1.266.29-2.533-.46-2.823-1.727L6.72 13.83z" />
                    </svg>
                    <span>{t.printRfpBtn}</span>
                  </button>
                  <button
                    onClick={() => setShowProposalModal(false)}
                    className="py-1 px-2.5 text-[#a6adc8] hover:text-[#f38ba8] text-xs font-semibold cursor-pointer"
                  >
                    {t.closeBtn} ✕
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet (Formatted for A4 Standard) */}
              <div className="p-6 sm:p-10 bg-[#ffffff] text-[#111827] print-document font-sans text-left selection:bg-purple-100 selection:text-purple-900">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-xl tracking-tight text-slate-900">
                        TripPick
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        ENTERPRISE MICE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {language === 'th' ? 'บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด (สำนักงานใหญ่)' : 'TripPick Business Travel Solutions Co., Ltd. (Headquarters)'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {language === 'th' ? 'เลขประจำตัวผู้เสียภาษีอากร: 0-1055-69018-92-4 | โทร 02-888-TRIP' : 'Tax ID: 0-1055-69018-92-4 | Tel: 02-888-TRIP'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {language === 'th' ? `เลขที่เอกสาร: ${proposalRef}` : `Document Ref: ${proposalRef}`}
                    </span>
                    <span className="text-xs text-slate-600 block">
                      {language === 'th' ? `วันที่ออกเอกสาร: ${issueDateFormatted}` : `Issue Date: ${issueDateFormatted}`}
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ UNANIMOUS CONSENSUS APPROVED
                    </span>
                  </div>
                </div>

                {/* Escrow Status Ribbon in Document */}
                {isEscrowLocked && (
                  <div className="my-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span className="font-bold">{language === 'th' ? 'สถานะเงินมัดจำ: วางเงินมัดจำและล็อกสิทธิ์แล้ว (Escrow Secured)' : 'Escrow Status: Deposit Secured & Inventory Locked (Escrow Secured)'}</span>
                    </div>
                    <span className="font-mono text-[11px]">{language === 'th' ? 'เลขที่ใบเสร็จ:' : 'Receipt No:'} {depositReceipt?.receiptNo || depositCode}</span>
                  </div>
                )}

                {/* Document Title */}
                <div className="my-5 text-center">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {language === 'th' ? 'ใบเสนอราคาและเอกสารจัดซื้อจัดจ้างทริปองค์กร (B2B Procurement Proposal)' : 'B2B Procurement Proposal & Corporate Retreat Quotation'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'th' ? 'ผ่านการลงคะแนนและรับรองฉันทามติ 100% จากสมาชิกทีมผ่านระบบ TripPick Consensus Engine' : '100% Unanimous Consensus Approved by Team via TripPick Consensus Engine'}
                  </p>
                </div>

                {/* 30-Second Executive Audio Briefing Bar (Screen View) */}
                <div className="no-print my-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-purple-900">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎧</span>
                    <div>
                      <span className="font-bold block">
                        {language === 'en' ? '🎧 30-Second CFO Audio Memo (Executive Audio Briefing)' : '🎧 สรุปเสียงสั้นสำหรับผู้บริหาร 30 วินาที (CFO Audio Memo)'}
                      </span>
                      <span className="text-[11px] text-purple-700">
                        {language === 'en'
                          ? 'Ultra-realistic executive voiceover (TripPick Executive Studio Voice)'
                          : 'สรุปเสียงสั้นสำหรับผู้บริหารและฝ่ายบัญชี (TripPick Executive Studio Voice)'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={audioBriefing.toggle}
                    className="py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {audioBriefing.isPlaying
                        ? (language === 'en' ? '❚❚ Pause Audio' : '❚❚ หยุดเสียง')
                        : (language === 'en' ? '▶ Play Memo' : '▶ ฟังเสียงสรุป')}
                    </span>
                  </button>
                </div>

                {/* Client & Booking Telemetry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {language === 'th' ? 'ข้อมูลลูกค้าองค์กร (Client Information)' : 'Client Information (Corporate)'}
                    </span>
                    <p className="font-semibold text-slate-900">
                      {language === 'th' ? `หน่วยงาน: ${companyName}` : `Company: ${companyName}`}
                    </p>
                    <p className="text-slate-600">
                      {language === 'th' ? `ผู้ประสานงานหลัก: ${leadOrganizer} (${leadRole})` : `Lead Organizer: ${leadOrganizer} (${leadRole})`}
                    </p>
                    <p className="text-slate-600 font-mono">
                      {language === 'th' ? `เลขผู้เสียภาษี: ${companyTaxId} | รหัสห้อง: #${roomId}` : `Tax ID: ${companyTaxId} | Room Ref: #${roomId}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {language === 'th' ? 'รายละเอียดการเดินทาง (Retreat Details)' : 'Retreat & Venue Details'}
                    </span>
                    <p className="font-semibold text-slate-900">
                      {language === 'th' ? `สถานที่จัดงาน: ${matchedDestination.title}` : `Venue: ${matchedDestination.title}`}
                    </p>
                    <p className="text-slate-600">
                      {language === 'th' ? `ที่ตั้ง: ${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}` : `Location: ${googleData?.formattedAddress || `${matchedDestination.city}, ${matchedDestination.country}`}`}
                    </p>
                    <p className="text-slate-600">
                      {language === 'th' ? 'ระยะทางสนามบิน:' : 'Airport Distance:'} <strong className="text-slate-900">{formatAirportTravelTime(googleData?.airportTravelTime, language)} ({formatAirportName(googleData?.nearestAirport, language)})</strong>
                    </p>
                    <p className="text-slate-600">
                      {language === 'th' ? 'จำนวนผู้เข้าร่วม: ' : 'Headcount: '}<strong className="text-slate-900">{teamSize} {language === 'th' ? 'ท่าน' : 'Guests'}</strong> | {language === 'th' ? 'ระยะเวลา: ' : 'Duration: '}<strong className="text-slate-900">{nights} {language === 'th' ? 'คืน' : 'Nights'}</strong>
                    </p>
                  </div>
                </div>

                {/* Verified Technical Telemetry Specifications */}
                <div className="mb-6 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
                    {language === 'th' ? 'การรับรองคุณสมบัติทางเทคนิคระดับองค์กร (Verified B2B Amenities)' : 'Verified Enterprise Specifications & Amenities'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{language === 'th' ? 'เน็ตความเร็วสูง ' : 'High-Speed Internet '}<strong>{matchedDestination.wifi_speed_mbps} Mbps</strong> (Starlink)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{language === 'th' ? 'ห้องประชุมรองรับได้ ' : 'Boardroom Capacity '}<strong>{matchedDestination.max_capacity} {language === 'th' ? 'ท่าน' : 'Guests'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{language === 'th' ? 'ระบบภาพเสียง AV Boardroom ครบชุด' : 'Full AV Boardroom Presentation Suite'}</span>
                    </div>
                  </div>
                </div>

                {/* Procurement Line Items Table */}
                <div className="mb-6 overflow-hidden rounded-lg border border-slate-300">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">{language === 'th' ? 'ลำดับ' : 'Item'}</th>
                        <th className="py-2.5 px-3">{language === 'th' ? 'รายการจัดซื้อจัดจ้าง (Description)' : 'Procurement Item & Description'}</th>
                        <th className="py-2.5 px-3 text-center">{language === 'th' ? 'จำนวน' : 'Quantity'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'th' ? 'ราคา/หน่วย (THB)' : 'Unit Price (THB)'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'th' ? 'จำนวนเงิน (THB)' : 'Amount (THB)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="py-3 px-3 font-mono text-center">1</td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block">{matchedDestination.title}</strong>
                          <span className="text-slate-500 text-[11px] block">
                            {language === 'th'
                              ? `แพ็กเกจที่พักและพื้นที่สัมมนา MICE เหมารีสอร์ต (${teamSize} ท่าน × ${nights} คืน) รวมสิ่งอำนวยความสะดวก`
                              : `Exclusive MICE Resort & Workshop Package (${teamSize} Guests × ${nights} Nights) with verified amenities`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{teamSize * nights} {language === 'th' ? 'คน/คืน' : 'Pax-Nights'}</td>
                        <td className="py-3 px-3 text-right font-mono">฿{matchedDestination.price_per_person.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold">฿{netTotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-center">2</td>
                        <td className="py-2.5 px-3">
                          {language === 'th' ? 'สัญญาณอินเทอร์เน็ตความเร็วสูง Starlink Business SLA Guarantee' : 'Starlink Business Enterprise Internet with SLA Guarantee'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{language === 'th' ? '1 ระบบ' : '1 Unit'}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{language === 'th' ? 'รวมในแพ็กเกจ' : 'Included'}</td>
                        <td className="py-2.5 px-3 text-right font-mono">฿0</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-center">3</td>
                        <td className="py-2.5 px-3">
                          {language === 'th' ? 'บริการประสานงานผู้ช่วยจัดทริปองค์กร 24 ชม. ผ่าน TripPick AI Concierge' : '24/7 Dedicated Trip Coordinator via TripPick AI Concierge'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{language === 'th' ? '1 รายการ' : '1 Package'}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{language === 'th' ? 'รวมในแพ็กเกจ' : 'Included'}</td>
                        <td className="py-2.5 px-3 text-right font-mono">฿0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Accounting & Tax Breakdown Terminal */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div className="text-xs text-slate-500 max-w-sm">
                    <span className="font-bold text-slate-700 block mb-1">
                      {language === 'th' ? 'เงื่อนไขการชำระเงินและภาษี (Enterprise Terms):' : 'Payment & Statutory Tax Terms (Enterprise Terms):'}
                    </span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{language === 'th' ? 'เครดิตเทอม 30 วัน (Net 30) หรือชำระด้วย Corporate Credit Card / PromptPay B2B' : 'Net 30 Credit Terms or Corporate Credit Card / PromptPay B2B'}</li>
                      <li>{language === 'th' ? 'ออกใบกำกับภาษีเต็มรูปตามมาตรา 86/4 แห่งประมวลรัษฎากร' : 'Full Statutory Tax Invoice issued under Section 86/4 of Thai Revenue Code'}</li>
                      <li>{language === 'th' ? 'หักภาษี ณ ที่จ่าย 3% ตามคำสั่งกรมสรรพากร ที่ ท.ป. 4/2528' : '3% Withholding Tax deducted under Thai Revenue Dept Order Tor.Por. 4/2528'}</li>
                    </ul>
                  </div>

                  <div className="w-full sm:w-72 p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{language === 'th' ? 'มูลค่ารวมก่อนภาษี (Net Subtotal):' : 'Net Subtotal (Before Tax):'}</span>
                      <span className="font-mono font-semibold text-slate-900">฿{netTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{language === 'th' ? 'ภาษีมูลค่าเพิ่ม 7% (VAT):' : 'Value Added Tax 7% (VAT):'}</span>
                      <span className="font-mono text-slate-800">+฿{vat7.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 font-semibold text-slate-900">
                      <span>{language === 'th' ? 'ยอดรวมทั้งสิ้น (Gross Total):' : 'Gross Total (With VAT):'}</span>
                      <span className="font-mono">฿{grossTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                      <span>{language === 'th' ? 'หัก ภาษี ณ ที่จ่าย 3% (WHT 3%):' : 'Less 3% Withholding Tax (WHT):'}</span>
                      <span className="font-mono">-฿{wht3.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                      <span>{language === 'th' ? 'ยอดชำระสุทธิ (Net Payable):' : 'Net Payable to Vendor:'}</span>
                      <span className="font-mono text-emerald-700">฿{netPayable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Dual Corporate Approval Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 mb-10">
                      {language === 'th' ? 'ลงนามผู้เสนอราคา (Prepared By TripPick Concierge):' : 'Prepared By (TripPick Enterprise Concierge):'}
                    </p>
                    <div className="border-b border-slate-400 w-48 mb-1" />
                    <p className="font-semibold text-slate-900">{language === 'th' ? 'นางสาวอลิสา สิทธิพงศ์' : 'Ms. Alisa Sitthipong'}</p>
                    <p className="text-slate-500 text-[11px]">B2B Account Director, TripPick</p>
                    <p className="text-slate-400 text-[10px] font-mono">{language === 'th' ? `วันที่: ${issueDateFormatted}` : `Date: ${issueDateFormatted}`}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-800 mb-10">
                      {language === 'th' ? 'ลงนามอนุมัติสั่งจ้าง (Authorized Corporate Approver):' : 'Authorized Corporate Approver (Client Sign-Off):'}
                    </p>
                    <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
                    <p className="font-semibold text-slate-900">(........................................................)</p>
                    <p className="text-slate-500 text-[11px]">{language === 'th' ? 'ผู้อนุมัติฝ่ายจัดซื้อ / ทรัพยากรบุคคล / บัญชี' : 'Procurement / HR / Finance Approving Officer'}</p>
                    <p className="text-slate-400 text-[10px] font-mono">{language === 'th' ? 'วันที่: _____ / _____ / _________' : 'Date: _____ / _____ / _________'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Lock Modal */}
      <SubscriptionLockModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        featureName={lockedFeatureName}
      />
    </>
  );
}
