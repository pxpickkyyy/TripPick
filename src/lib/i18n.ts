import { createContext, useContext, useState, useEffect, useMemo, createElement, type ReactNode } from 'react';

export type AppLanguage = 'th' | 'en';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  tagline: string;
  b2bConsensus: string;
  roomLabel: string;
  hostBadge: string;
  langTh: string;
  langEn: string;
  switchLanguage: string;

  // Landing View
  landingEyebrow: string;
  landingHeadline: string;
  landingSubhead: string;
  landingDesc: string;
  createRoomBtn: string;
  createRoomSub: string;
  joinRoomTitle: string;
  roomCodePlaceholder: string;
  joinRoomBtn: string;
  reenterRoomBtn: string;
  reenterRoomPrefix: string;
  viewPitchBtn: string;
  codeLengthError: string;
  zeroLatencyBadge: string;
  statutoryTaxBadge: string;
  escrowReadyBadge: string;

  // Profile Selector View
  profileStep: string;
  profileTitle: string;
  profileSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  nameError: string;
  roleLabel: string;
  amenitiesLabel: string;
  backBtn: string;
  enterLobbyBtn: string;
  enteringLobbyBtn: string;

  // Waiting Lobby View
  lobbyEyebrow: string;
  copyInviteBtn: string;
  copiedText: string;
  membersTitle: string;
  vibeLabel: string;
  vibeCustomPlaceholder: string;
  budgetLabel: string;
  modeLabel: string;
  rapidConsensusMode: string;
  rapidConsensusDesc: string;
  infiniteDiscoveryMode: string;
  infiniteDiscoveryDesc: string;
  startSessionBtn: string;
  startingSessionBtn: string;
  waitingForHost: string;
  leaveRoomBtn: string;
  consensusRule: string;

  // Swiper View
  swipeDeckProgress: string;
  realtimeRadar: string;
  discoveringLiveVenues: string;
  infiniteDeckNotice: string;
  deckRefilledSuccess: string;
  swipePass: string;
  swipeVeto: string;
  swipeLike: string;
  vetoTooltip: string;
  reactionLabel: string;
  nearConsensusAlert: string;
  viewDetailsBtn: string;
  closeTourBtn: string;
  waitingPeersTitle: string;
  waitingPeersDesc: string;
  restartSessionBtn: string;
  roundCompleteTitle: string;
  roundCompletePassedDesc: string;
  roundCompleteNoConsensusDesc: string;
  confirmTopAiVenueBtn: string;
  restartRoundBtn: string;
  waitingForPeersRemaining: string;
  amenitiesHeading: string;
  highlightsHeading: string;

  // Match Overlay View
  matchTitle: string;
  matchSubtitle: string;
  unanimousBadge: string;
  tabRfp: string;
  tabAgenda: string;
  cfoMemoTitle: string;
  cfoMemoSubtitle: string;
  voiceAdapterLabel: string;
  playMemoBtn: string;
  pauseMemoBtn: string;
  playingMemoStatus: string;
  viewTranscriptBtn: string;
  hideTranscriptBtn: string;
  pitchScriptBtn: string;
  pitchModalTitle: string;
  pitchScriptCopyBtn: string;
  financialTerminalTitle: string;
  subtotalLabel: string;
  vatLabel: string;
  grossLabel: string;
  whtLabel: string;
  netPayableLabel: string;
  takeRateLabel: string;
  escrowStatusLabel: string;
  escrowSecuredStatus: string;
  escrowReadyStatus: string;
  exportCsvBtn: string;
  exportSheetsBtn: string;
  exportDocsBtn: string;
  printRfpBtn: string;
  secureEscrowBtn: string;
  resetSessionBtn: string;

  // AI Concierge
  conciergeTitle: string;
  conciergeStatus: string;
  conciergeInputPlaceholder: string;
  conciergeInitialGreeting: string;
  conciergePrompt1: string;
  conciergePrompt2: string;
  conciergePrompt3: string;
  conciergePrompt4: string;

  // Revenue Metrics HUD
  hudYieldLabel: string;
  hudSecuredLabel: string;
  hudLockedBadge: string;
  hudTitle: string;
  hudGbvLabel: string;
  hudTakeRateLabel: string;
  hudAuditReady: string;
  hudOpenProcurementBtn: string;
  hudMinimizeTitle: string;

  // Procurement & Escrow Modal
  procurementModalTitle: string;
  procurementModalSubtitle: string;
  tabInvoice: string;
  tabEscrow: string;
  quickFillPresets: string;
  companyNameLabel: string;
  taxIdLabel: string;
  approverEmailLabel: string;
  paymentMethodLabel: string;
  promptpayMethod: string;
  cardMethod: string;
  wireMethod: string;
  scanPromptpayTitle: string;
  scanPromptpaySub: string;
  confirmEscrowBtn: string;
  escrowSecuredTitle: string;
  closeBtn: string;

  // Business Model Modal
  dossierEyebrow: string;
  dossierTitle: string;
  criteria1Title: string;
  criteria1Desc: string;
  criteria2Title: string;
  criteria2Desc: string;
  criteria3Title: string;
  criteria3Desc: string;
  criteria4Title: string;
  criteria4Desc: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  th: {
    // Navigation & Brand
    brandName: 'TripPick',
    tagline: 'ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว : Make Me Money',
    b2bConsensus: 'B2B CONSENSUS',
    roomLabel: 'ห้อง:',
    hostBadge: 'Host',
    langTh: 'ไทย',
    langEn: 'EN',
    switchLanguage: 'เปลี่ยนภาษา',

    // Landing View
    landingEyebrow: 'B2B CONSENSUS & RETREAT ENGINE',
    landingHeadline: 'TripPick',
    landingSubhead: 'ระบบสร้างฉันทามติเพื่อจัดทริปออฟไซต์และสัมมนาองค์กร',
    landingDesc: 'ยุติปัญหาถกเถียงเรื่องสถานที่จัดออฟไซต์ในแชทกลุ่ม ให้ทุกคนในทีมปัดเลือกสถานที่พร้อมกันแบบเรียลไทม์ หาข้อสรุปได้ใน 3 นาที พร้อมปิดยอดจองสร้างรายได้คอมมิชชั่น B2B',
    createRoomBtn: 'สร้างห้องใหม่เพื่อเริ่มทริป',
    createRoomSub: 'สร้างรหัสห้อง 4 หลัก และเป็น Host นำทีม',
    joinRoomTitle: 'หรือ เข้าร่วมห้องด้วยรหัส',
    roomCodePlaceholder: 'กรอกรหัสห้อง 4 หลัก (เช่น TRIP)',
    joinRoomBtn: 'เข้าร่วมห้อง',
    reenterRoomBtn: 'กลับเข้าห้องเดิมของทีม',
    reenterRoomPrefix: 'ห้องก่อนหน้า',
    viewPitchBtn: 'ดู Business Model & Pitch Dossier (100 คะแนน)',
    codeLengthError: 'รหัสห้องต้องมีขนาด 4 ตัวอักษรพอดี (เช่น TRIP)',
    zeroLatencyBadge: 'Zero-Latency Realtime',
    statutoryTaxBadge: 'VAT 7% + WHT 3% (ท.ป. 4/2528)',
    escrowReadyBadge: '฿5,000 Escrow Lock',

    // Profile Selector View
    profileStep: 'STEP 01 // 02',
    profileTitle: 'ตั้งค่าโปรไฟล์และสิ่งที่ต้องการ',
    profileSubtitle: 'เลือกสิ่งอำนวยความสะดวกที่ทีมของคุณให้ความสำคัญ เพื่อให้ระบบฉันทามติคัดเลือกสถานที่ได้ตรงเป้าหมายที่สุด',
    nameLabel: 'ชื่อและตำแหน่งของคุณ',
    namePlaceholder: 'เช่น นนท์ (Head of Tech) หรือ มุก (HR Lead)',
    nameError: 'กรุณากรอกชื่อหรือตำแหน่งของคุณ',
    roleLabel: 'บทบาทของคุณในทริปนี้',
    amenitiesLabel: 'สิ่งอำนวยความสะดวกที่จำเป็นต้องมี (MICE & Workation)',
    backBtn: 'ย้อนกลับ',
    enterLobbyBtn: 'เข้าสู่ห้องล็อบบี้ทริป',
    enteringLobbyBtn: 'กำลังเข้าสู่ห้องล็อบบี้...',

    // Waiting Lobby View
    lobbyEyebrow: 'WAR ROOM // LIVE RADAR',
    copyInviteBtn: 'คัดลอกลิงก์ชวนทีม',
    copiedText: 'คัดลอกแล้ว!',
    membersTitle: 'สมาชิกที่ออนไลน์ในห้อง',
    vibeLabel: 'ธีมและบรรยากาศการจัดออฟไซต์ (Retreat Vibe)',
    vibeCustomPlaceholder: 'หรือพิมพ์ธีมเฉพาะ เช่น แฮกกาธอน 48 ชม. ริมทะเล...',
    budgetLabel: 'ช่วงงบประมาณต่อคนต่อคืน (THB)',
    modeLabel: 'โหมดการค้นหาสถานที่ (Discovery Mode)',
    rapidConsensusMode: '⚡ Rapid Consensus Mode (โหมดเดโม 5–10 ใบ)',
    rapidConsensusDesc: 'สุ่มสถานที่คัดสรรพิเศษ 5–10 แห่ง เพื่อการันตี Match ฉันทามติภายใน 60–90 วินาที เหมาะสำหรับการพรีเซนต์สด',
    infiniteDiscoveryMode: '🌐 Infinite Discovery Mode (สำรวจไม่สิ้นสุด)',
    infiniteDiscoveryDesc: 'ระบบ AI + Google Places ดึงสถานที่สดไม่จำกัดแบบเรียลไทม์ เหมาะสำหรับการสำรวจโรงแรมทั่วโลก',
    startSessionBtn: 'เริ่มเซสชันการปัดเลือก (Start Swiping)',
    startingSessionBtn: 'กำลังประมวลผลสถานที่...',
    waitingForHost: 'รอ Host เริ่มเซสชันการปัดเลือก...',
    leaveRoomBtn: 'ออกจากห้อง',
    consensusRule: 'เกณฑ์ชนะ: ได้รับความเห็นชอบ 60% ขึ้นไป และไม่มีสิทธิ์ Veto คัดค้าน',

    // Swiper View
    swipeDeckProgress: 'ความคืบหน้าการโหวต',
    realtimeRadar: 'Zero-Latency Realtime',
    discoveringLiveVenues: '⚡ AI Concierge กำลังค้นหาสถานที่สดจาก Google Maps...',
    infiniteDeckNotice: 'โหมดสำรวจไม่สิ้นสุด (Infinite Discovery)',
    deckRefilledSuccess: 'เพิ่มสถานที่ใหม่จาก Google Maps เรียบร้อยแล้ว',
    swipePass: 'ผ่าน',
    swipeVeto: 'Veto',
    swipeLike: 'ถูกใจ',
    vetoTooltip: 'ยับยั้ง (Veto สิทธิ์คัดค้านเด็ดขาด)',
    reactionLabel: 'ปฏิกิริยา:',
    nearConsensusAlert: 'ใกล้บรรลุฉันทามติแล้ว!',
    viewDetailsBtn: 'ดูรายละเอียดสถานที่ & สเปกการทำงาน',
    closeTourBtn: 'ปิดและกลับไปปัดเลือกต่อ',
    waitingPeersTitle: 'คุณปัดเลือกครบทุกสถานที่แล้ว!',
    waitingPeersDesc: 'ระบบกำลังรอสมาชิกท่านอื่นในทีมปัดเลือกให้ครบ เพื่อคำนวณฉันทามติเอกฉันท์แบบเรียลไทม์',
    restartSessionBtn: 'เริ่มรอบการโหวตใหม่',
    roundCompleteTitle: 'สิ้นสุดรอบการโหวต',
    roundCompletePassedDesc: 'คุณปัดผ่านครบทุกสถานที่ในรอบนี้โดยยังไม่ได้กดถูกใจสถานที่ใด',
    roundCompleteNoConsensusDesc: 'สมาชิกทุกคนปัดเลือกครบแล้ว แต่ยังไม่มีสถานที่ที่ได้ฉันทามติเอกฉันท์',
    confirmTopAiVenueBtn: '🎯 เลือกสถานที่แนะนำอันดับ 1 ของ AI',
    restartRoundBtn: '🔄 เริ่มรอบการโหวตใหม่ / ปรับตัวกรอง',
    waitingForPeersRemaining: 'กำลังรอสมาชิกอีก',
    amenitiesHeading: 'สิ่งอำนวยความสะดวกสำหรับธุรกิจ & สัมมนา (MICE)',
    highlightsHeading: 'กิจกรรมกระชับมิตร & ท่องเที่ยวในพื้นที่',

    // Match Overlay View
    matchTitle: 'บรรลุฉันทามติเอกฉันท์ 100%!',
    matchSubtitle: 'ทีมของคุณได้คัดเลือกสถานที่จัดออฟไซต์ที่ทุกคนเห็นพ้องต้องกัน พร้อมระบบออกเอกสารจัดซื้อระดับองค์กรทันที',
    unanimousBadge: '100% UNANIMOUS CONSENSUS APPROVED',
    tabRfp: 'เอกสารจัดซื้อจัดจ้าง (B2B RFP)',
    tabAgenda: 'กำหนดการจัดทริป 3 วัน (Agenda)',
    cfoMemoTitle: '🎧 30-Second CFO Audio Memo',
    cfoMemoSubtitle: 'สรุปเสียงสั้นสำหรับผู้บริหารและฝ่ายจัดซื้อ (B2B Executive Briefing)',
    voiceAdapterLabel: 'Voice Adapter:',
    playMemoBtn: 'คลิกเพื่อฟังเสียงสรุป (30s)',
    pauseMemoBtn: 'หยุดชั่วคราว',
    playingMemoStatus: 'กำลังเล่นเสียงสรุปผู้บริหาร',
    viewTranscriptBtn: 'ดูบทพูดสรุปผู้บริหาร (Transcript)',
    hideTranscriptBtn: 'ซ่อนบทพูดสรุป',
    pitchScriptBtn: '🎬 สคริปต์คลิป 2 นาที (115s Pitch)',
    pitchModalTitle: 'สคริปต์นำเสนอ 2 นาที (115s Video Pitch Script)',
    pitchScriptCopyBtn: 'คัดลอกสคริปต์นำเสนอ',
    financialTerminalTitle: 'MAKE ME MONEY : ตารางคำนวณงบประมาณและภาษีตามกฎหมาย',
    subtotalLabel: 'มูลค่าก่อนภาษี (Subtotal / GBV):',
    vatLabel: 'ภาษีมูลค่าเพิ่ม 7% (VAT 7%):',
    grossLabel: 'ยอดรวมทั้งสิ้นรวมภาษี (Gross Total):',
    whtLabel: 'หัก ภาษี ณ ที่จ่าย 3% (WHT 3% หมวดบริการ ท.ป. 4/2528):',
    netPayableLabel: 'ยอดเงินสุทธิที่ต้องชำระจริง (Net Payable):',
    takeRateLabel: 'ส่วนแบ่งคอมมิชชั่น TripPick (12% Take-Rate):',
    escrowStatusLabel: 'สถานะเงินมัดจำ Escrow:',
    escrowSecuredStatus: '🔒 SECURED & LOCKED (฿5,000)',
    escrowReadyStatus: '⏳ READY FOR DEPOSIT (฿5,000)',
    exportCsvBtn: 'ดาวน์โหลด CSV จัดซื้อ',
    exportSheetsBtn: 'ส่งเข้า Google Sheets',
    exportDocsBtn: 'ส่งเข้า Google Docs',
    printRfpBtn: 'พิมพ์เอกสาร RFP / PDF',
    secureEscrowBtn: '💼 ดูเอกสารจัดซื้อ B2B & มัดจำ Escrow',
    resetSessionBtn: 'จัดทริปใหม่ / ออกจากห้อง',

    // AI Concierge
    conciergeTitle: 'TripPick AI Concierge',
    conciergeStatus: 'LIVE ASSISTANT READY',
    conciergeInputPlaceholder: 'ถามสเปกเน็ต ห้องประชุม ค่าน้ำมัน หรืองบ...',
    conciergeInitialGreeting: 'สวัสดีครับ ผมคือ TripPick AI Concierge พร้อมช่วยคำนวณงบประมาณ วิเคราะห์สเปกสถานที่ และสนับสนุนการตัดสินใจของทีม มีเรื่องใดให้ช่วยแนะนำได้เลยครับ',
    conciergePrompt1: 'ตรวจสอบความเร็วเน็ตและห้องประชุม',
    conciergePrompt2: 'คำนวณงบประมาณสำหรับ 12 ท่าน',
    conciergePrompt3: 'แนะนำกิจกรรมเชื่อมความสัมพันธ์ในทีม',
    conciergePrompt4: 'สรุปสมาชิกที่อยู่ในห้องขณะนี้',

    // Revenue Metrics HUD
    hudYieldLabel: 'YIELD:',
    hudSecuredLabel: 'SECURED',
    hudLockedBadge: '฿5,000 LOCKED',
    hudTitle: 'B2B REVENUE HUD // 12% TAKE-RATE',
    hudGbvLabel: 'Gross Booking Value (GBV):',
    hudTakeRateLabel: 'Platform Take-Rate:',
    hudAuditReady: 'VAT 7% + WHT 3% (ท.ป. 4/2528) AUDIT READY',
    hudOpenProcurementBtn: '💼 ดูเอกสารจัดซื้อ B2B & มัดจำ Escrow',
    hudMinimizeTitle: 'ย่อขนาด HUD',

    // Procurement & Escrow Modal
    procurementModalTitle: 'เอกสารจัดซื้อจัดจ้างระดับองค์กร & ระบบมัดจำ Escrow',
    procurementModalSubtitle: 'คำนวณภาษีตามระเบียบกรมสรรพากร (ท.ป. 4/2528) • มัดจำ Escrow คุ้มครองสิทธิ์ 100%',
    tabInvoice: 'ใบเสนอราคา & สรุปภาษี (B2B RFP)',
    tabEscrow: 'ชำระมัดจำ Escrow ล็อกสิทธิ์ (฿5,000)',
    quickFillPresets: 'กรอกข้อมูลด่วน 1-Click Fast Fill:',
    companyNameLabel: 'ชื่อองค์กร / บริษัทผู้ซื้อ',
    taxIdLabel: 'เลขประจำตัวผู้เสียภาษี 13 หลัก',
    approverEmailLabel: 'อีเมลผู้อนุมัติการเงิน / จัดซื้อ',
    paymentMethodLabel: 'วิธีการชำระเงินมัดจำ Escrow',
    promptpayMethod: 'PromptPay B2B (QR Scannable)',
    cardMethod: 'Corporate Credit Card',
    wireMethod: 'Direct Wire Transfer (Net 30)',
    scanPromptpayTitle: 'สแกน QR Code PromptPay B2B เพื่อล็อกสิทธิ์',
    scanPromptpaySub: 'มาตรฐาน EMVCo แท้ คำนวณ CRC16 ภายในเครื่อง ปลอดภัย 100%',
    confirmEscrowBtn: 'ยืนยันการวางเงินมัดจำ Escrow (฿5,000)',
    escrowSecuredTitle: 'มัดจำ Escrow ได้รับการคุ้มครองแล้ว!',
    closeBtn: 'ปิดหน้าต่าง',

    // Business Model Modal
    dossierEyebrow: 'COMPETITION DOSSIER // CRITERIA 100 PTS',
    dossierTitle: 'ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว : Make Me Money',
    criteria1Title: 'ความสำคัญและความเข้าใจปัญหาในตลาด (20 คะแนน)',
    criteria1Desc: 'กว่า 78% ของการจัดทริปบริษัทหรือท่องเที่ยวกลุ่มต้องล่มลงเนื่องจากหาข้อสรุปไม่ได้ แต่ละทริปเสียเวลาเฉลี่ยมากกว่า 18.5 ชั่วโมงในแอปแชทเพื่อถกเถียงเรื่องสถานที่ ความเร็วเน็ต และงบประมาณ',
    criteria2Title: 'ความสมบูรณ์และการใช้งานได้จริงของผลงาน (30 คะแนน)',
    criteria2Desc: 'ระบบ Real-time Consensus Engine เชื่อมต่อผ่านรหัสห้อง 4 หลัก กลไกโหวตแบบปัดการ์ด สิทธิ์คัดค้านเด็ดขาด (Veto) AI Concierge ช่วยคำนวณงบ และระบบสร้าง B2B RFP ทันที',
    criteria3Title: 'รูปแบบการสร้างรายได้ (Make Me Money) (30 คะแนน)',
    criteria3Desc: 'TripPick จับกลุ่ม B2B MICE ที่มี Ticket Size สูง เฉลี่ย 270,000 บาท/ทริป ด้วยส่วนแบ่งคอมมิชชั่น 12% Wholesale Take-Rate สร้างรายได้สุทธิ 32,400 บาทต่อทริปที่ปิดยอด',
    criteria4Title: 'การต่อยอดธุรกิจและความยั่งยืน (20 คะแนน)',
    criteria4Desc: 'เชื่อมต่อตรงกับ API ระบบจัดซื้อระดับองค์กร ขยายสู่ตลาด APAC และโมเดล SaaS สำหรับบริษัทท่องเที่ยวเพื่อการจัดสัมมนา',
  },

  en: {
    // Navigation & Brand
    brandName: 'TripPick',
    tagline: 'Business & Tourism Group Consensus Engine : Make Me Money',
    b2bConsensus: 'B2B CONSENSUS',
    roomLabel: 'ROOM:',
    hostBadge: 'Host',
    langTh: 'TH',
    langEn: 'English',
    switchLanguage: 'Switch Language',

    // Landing View
    landingEyebrow: 'B2B CONSENSUS & RETREAT ENGINE',
    landingHeadline: 'TripPick',
    landingSubhead: 'Autonomous Consensus Engine for Corporate Offsites & Team Retreats',
    landingDesc: 'End Slack debate paralysis. Let your team swipe on curated, work-ready offsite destinations in zero-latency real-time. Lock unanimous consensus in 3 minutes and capture B2B wholesale margin.',
    createRoomBtn: 'Create War Room',
    createRoomSub: 'Generate a 4-character code and lead as Room Host',
    joinRoomTitle: 'Or Join an Existing Room',
    roomCodePlaceholder: 'Enter 4-character code (e.g. TRIP)',
    joinRoomBtn: 'Join Room',
    reenterRoomBtn: 'Re-enter Previous Team Room',
    reenterRoomPrefix: 'Previous Room',
    viewPitchBtn: 'View Business Model & Pitch Dossier (100 Pts)',
    codeLengthError: 'Room code must be exactly 4 characters (e.g. TRIP)',
    zeroLatencyBadge: 'Zero-Latency Realtime',
    statutoryTaxBadge: 'VAT 7% + WHT 3% (Tor.Por. 4/2528)',
    escrowReadyBadge: '฿5,000 Escrow Lock',

    // Profile Selector View
    profileStep: 'STEP 01 // 02',
    profileTitle: 'Participant Profile & Preferences',
    profileSubtitle: 'Select your role and essential workspace amenities so the consensus engine pinpoints the ideal venue for your team.',
    nameLabel: 'Your Name & Title',
    namePlaceholder: 'e.g. Sarah (Head of Engineering) or Alex (CFO)',
    nameError: 'Please enter your name or corporate title',
    roleLabel: 'Your Role in This Offsite',
    amenitiesLabel: 'Must-Have Work & Leisure Amenities (MICE & Workation)',
    backBtn: 'Back',
    enterLobbyBtn: 'Enter Waiting Lobby',
    enteringLobbyBtn: 'Entering Waiting Lobby...',

    // Waiting Lobby View
    lobbyEyebrow: 'WAR ROOM // LIVE RADAR',
    copyInviteBtn: 'Copy Team Invite Link',
    copiedText: 'Copied!',
    membersTitle: 'Active Team Members Online',
    vibeLabel: 'Offsite Vibe & Strategic Purpose',
    vibeCustomPlaceholder: 'Or enter custom theme: e.g. 48-Hour Beachfront AI Hackathon...',
    budgetLabel: 'Nightly Budget Per Head (THB)',
    modeLabel: 'Venue Discovery Mode',
    rapidConsensusMode: '⚡ Rapid Consensus Mode (5–10 Cards Demo)',
    rapidConsensusDesc: 'Curated 5–10 verified venues guaranteeing unanimous consensus match within 60–90 seconds for live demos.',
    infiniteDiscoveryMode: '🌐 Infinite Discovery Mode (Uncapped AI & Google Places)',
    infiniteDiscoveryDesc: 'Continuous AI + Google Places live venue streaming on demand for worldwide exploration.',
    startSessionBtn: 'Start Swiping Session',
    startingSessionBtn: 'Synthesizing Curated Venues...',
    waitingForHost: 'Waiting for Room Host to launch swiping...',
    leaveRoomBtn: 'Leave Room',
    consensusRule: 'Consensus Rule: 60%+ approval required with zero Veto objections.',

    // Swiper View
    swipeDeckProgress: 'Voting Progress',
    realtimeRadar: 'Zero-Latency Realtime',
    discoveringLiveVenues: '⚡ AI Concierge discovering live venues via Google Maps...',
    infiniteDeckNotice: 'Infinite Discovery Active',
    deckRefilledSuccess: 'New venues added from Google Maps',
    swipePass: 'Pass',
    swipeVeto: 'Veto',
    swipeLike: 'Like',
    vetoTooltip: 'Veto (Absolute Executive Objection Right)',
    reactionLabel: 'Reactions:',
    nearConsensusAlert: 'Near-Consensus Milestone Reached!',
    viewDetailsBtn: 'View Venue Details & Tech Specs',
    closeTourBtn: 'Close & Resume Swiping',
    waitingPeersTitle: 'You have voted on all venues!',
    waitingPeersDesc: 'Waiting for remaining team members to finish voting to calculate unanimous real-time consensus.',
    restartSessionBtn: 'Restart Voting Session',
    roundCompleteTitle: 'Voting Round Complete',
    roundCompletePassedDesc: 'You have passed all destinations in this round without liking any.',
    roundCompleteNoConsensusDesc: 'All teammates have finished voting, but no single destination achieved unanimous consensus.',
    confirmTopAiVenueBtn: '🎯 Confirm Top AI Recommended Venue',
    restartRoundBtn: '🔄 Start New Voting Round / Adjust Filters',
    waitingForPeersRemaining: 'Waiting for',
    amenitiesHeading: 'MICE Business & Conference Facilities',
    highlightsHeading: 'Team Bonding & Local Attractions',

    // Match Overlay View
    matchTitle: '100% Unanimous Consensus Reached!',
    matchSubtitle: 'Your team has locked an undisputed match! B2B procurement RFP with statutory tax calculations is immediately ready.',
    unanimousBadge: '100% UNANIMOUS CONSENSUS APPROVED',
    tabRfp: 'Procurement RFP & Budget',
    tabAgenda: 'Autonomous 3-Day Agenda',
    cfoMemoTitle: '🎧 30-Second CFO Audio Memo',
    cfoMemoSubtitle: 'Executive Audio Briefing for Finance & Procurement (B2B Executive Memo)',
    voiceAdapterLabel: 'Voice Adapter:',
    playMemoBtn: 'Click to Listen to CFO Audio Memo (30s)',
    pauseMemoBtn: 'Pause Audio',
    playingMemoStatus: 'Playing Executive CFO Audio Memo',
    viewTranscriptBtn: 'View Executive Memo Transcript',
    hideTranscriptBtn: 'Hide Transcript',
    pitchScriptBtn: '🎬 2-Min Pitch Script (115s Pitch)',
    pitchModalTitle: 'Official 2-Minute Video Pitch Script (115s Pitch)',
    pitchScriptCopyBtn: 'Copy Pitch Script',
    financialTerminalTitle: 'MAKE ME MONEY : Statutory Tax & Budget Reconciliation Terminal',
    subtotalLabel: 'Net Subtotal (Pre-VAT / GBV):',
    vatLabel: 'Value Added Tax 7% (VAT 7%):',
    grossLabel: 'Gross Invoice Total (with VAT):',
    whtLabel: 'Withholding Tax 3% (WHT 3% Services Tor.Por. 4/2528):',
    netPayableLabel: 'Net Payable Amount to Vendor:',
    takeRateLabel: 'TripPick Platform Take-Rate (12% Commission):',
    escrowStatusLabel: 'Escrow Deposit Status:',
    escrowSecuredStatus: '🔒 SECURED & LOCKED (฿5,000)',
    escrowReadyStatus: '⏳ READY FOR DEPOSIT (฿5,000)',
    exportCsvBtn: 'Export Procurement CSV',
    exportSheetsBtn: 'Export to Google Sheets',
    exportDocsBtn: 'Export to Google Docs',
    printRfpBtn: 'Print Official RFP / PDF',
    secureEscrowBtn: '💼 View B2B Procurement & Escrow',
    resetSessionBtn: 'Plan New Offsite / Leave',

    // AI Concierge
    conciergeTitle: 'TripPick AI Concierge',
    conciergeStatus: 'LIVE ASSISTANT READY',
    conciergeInputPlaceholder: 'Ask about WiFi speeds, boardrooms, logistics, or budget...',
    conciergeInitialGreeting: 'Hello! I am the TripPick AI Concierge. I can help calculate budgets, analyze venue tech specs, and facilitate group decision-making. How may I assist your team today?',
    conciergePrompt1: 'Check WiFi speeds and boardroom specs',
    conciergePrompt2: 'Calculate total budget for 12 attendees',
    conciergePrompt3: 'Recommend executive team bonding activities',
    conciergePrompt4: 'Summarize active team members in room',

    // Revenue Metrics HUD
    hudYieldLabel: 'YIELD:',
    hudSecuredLabel: 'SECURED',
    hudLockedBadge: '฿5,000 LOCKED',
    hudTitle: 'B2B REVENUE HUD // 12% TAKE-RATE',
    hudGbvLabel: 'Gross Booking Value (GBV):',
    hudTakeRateLabel: 'Platform Take-Rate:',
    hudAuditReady: 'VAT 7% + WHT 3% (Tor.Por. 4/2528) AUDIT READY',
    hudOpenProcurementBtn: '💼 View B2B Procurement & Escrow',
    hudMinimizeTitle: 'Minimize HUD',

    // Procurement & Escrow Modal
    procurementModalTitle: 'Enterprise B2B Procurement Document & Escrow Deposit',
    procurementModalSubtitle: 'Reconciled under Thai Revenue Department Code (Tor.Por. 4/2528) • 100% Escrow Protected',
    tabInvoice: 'Quotation & Tax Breakdown (B2B RFP)',
    tabEscrow: 'Secure ฿5,000 Escrow Deposit',
    quickFillPresets: '1-Click Fast Fill Presets:',
    companyNameLabel: 'Organization / Purchasing Legal Entity',
    taxIdLabel: '13-Digit Corporate Tax ID',
    approverEmailLabel: 'Finance / Approver Email',
    paymentMethodLabel: 'Escrow Deposit Method',
    promptpayMethod: 'PromptPay B2B (QR Scannable)',
    cardMethod: 'Corporate Credit Card',
    wireMethod: 'Direct Wire Transfer (Net 30)',
    scanPromptpayTitle: 'Scan PromptPay B2B QR Code to Lock Booking',
    scanPromptpaySub: 'Authentic EMVCo Standard with internal CRC16 computation. 100% secure.',
    confirmEscrowBtn: 'Confirm Escrow Deposit (฿5,000)',
    escrowSecuredTitle: 'Escrow Deposit Successfully Secured!',
    closeBtn: 'Close Window',

    // Business Model Modal
    dossierEyebrow: 'COMPETITION DOSSIER // CRITERIA 100 PTS',
    dossierTitle: 'Software for Business & Tourism : Make Me Money',
    criteria1Title: 'Problem Identification & Market Pain Points (20 Pts)',
    criteria1Desc: 'Over 78% of corporate offsites collapse due to indecision. Teams waste an average of 18.5 hours in Slack debates over venues, connectivity SLAs, and budget reconciliation.',
    criteria2Title: 'Completeness & Operational Viability (30 Pts)',
    criteria2Desc: 'Zero-latency real-time consensus engine with 4-character room codes, card-swiping mechanics, absolute executive Veto rights, autonomous Gemini agenda generation, and instant B2B RFP generation.',
    criteria3Title: 'Make Me Money : Business Model & Take-Rate (30 Pts)',
    criteria3Desc: 'TripPick monetizes high-ticket B2B MICE retreats averaging ฿270,000 per offsite. Capturing a 12% wholesale margin yields ฿32,400 net profit per locked match.',
    criteria4Title: 'Commercial Scalability & Sustainability (20 Pts)',
    criteria4Desc: 'Seamless integration with enterprise ERP procurement workflows, regional APAC venue expansion, and a recurring B2B travel subscription tier for scaling tech firms.',
  },
};

// Destination English translations for curated catalog
export interface DestinationLocalization {
  title: string;
  city: string;
  country: string;
  category: string;
  overview: string;
  ai_reason: string;
}

export const DESTINATION_LOCALIZATIONS: Record<number, DestinationLocalization> = {
  101: {
    title: 'Trisara Oceanfront Executive Sanctuary',
    city: 'Phuket',
    country: 'Thailand',
    category: 'Ultra-Luxury Executive Resort',
    overview: 'Private cliffside pool villas overlooking Phuket’s northwestern coastline, featuring high-speed Starlink WiFi, an oceanfront executive boardroom, and Michelin-tier private catering for leadership teams.',
    ai_reason: 'Ultimate privacy and panoramic Andaman sea views, tailored for annual executive strategic retreats.',
  },
  102: {
    title: 'Raya Heritage Lanna Eco Offsite Hub',
    city: 'Chiang Mai',
    country: 'Thailand',
    category: 'Eco & Wellness Team Sanctuary',
    overview: 'Serene riverside sanctuary along the Ping River blending Lanna artisanal heritage with carbon-neutral workspaces, open-air brainstorming pavilions, tea ceremonies, and creative sprint zones.',
    ai_reason: 'Peaceful healing sanctuary to overcome tech burnout and spark deep strategic focus.',
  },
  103: {
    title: 'W Koh Samui Beachfront Innovation Villa',
    city: 'Koh Samui',
    country: 'Thailand',
    category: 'Bleisure & High-Energy Coworking',
    overview: 'Where vibrant energy meets enterprise productivity. Beachside cabanas with power and fiber, private infinity pools in every villa, sunset DJ networking, and Great Room conference facilities.',
    ai_reason: 'High-energy vibrant setting turning corporate offsites into unforgettable team bonding milestones.',
  },
  104: {
    title: 'Rayavadee Marine Jungle Pavilion',
    city: 'Krabi',
    country: 'Thailand',
    category: 'Adventure & Team Bonding Retreat',
    overview: 'Nestled between 3 limestone beaches inside a marine national park. Perfect for trust-building adventures, paired with private grotto dining and tropical pavilion meeting spaces.',
    ai_reason: 'Breathtaking natural landscape designed to build mutual trust and deep team camaraderie.',
  },
  105: {
    title: 'Capella Bangkok Riverside Summit Lounge',
    city: 'Bangkok',
    country: 'Thailand',
    category: 'Urban Luxury MICE & Executive Conference',
    overview: 'World-renowned Chao Phraya riverfront oasis offering bespoke executive conference suites, Michelin-starred dining, private riverfront villas, and white-glove corporate event facilitation.',
    ai_reason: 'Ranked #1 luxury hotel combining downtown metropolitan convenience with tranquil riverfront serenity.',
  },
  106: {
    title: 'Desa Potato Head Bali Creative Lab',
    city: 'Bali',
    country: 'Indonesia',
    category: 'Bleisure & Creative Tech Coworking',
    overview: 'Global benchmark for tech and design offsites. Zero-waste architecture, bamboo amphitheaters, beachside focus desks, and Seminyak sunset music culture.',
    ai_reason: 'Magnetic creative hub for design systems teams, high-growth startups, and modern founders.',
  },
  107: {
    title: 'InterContinental Danang Clifftop MICE Villa',
    city: 'Da Nang',
    country: 'Vietnam',
    category: 'Luxury Clifftop Conference Hub',
    overview: 'Bill Bensley design masterpiece spanning Son Tra Monkey Mountain. Executive summit villas with dedicated butler service, Michelin-starred dining, and private funicular railway to the beach.',
    ai_reason: 'Monumental architectural scale where mountain meets ocean for regional APAC summits.',
  },
  108: {
    title: 'Capella Sentosa Heritage Leadership Enclave',
    city: 'Sentosa',
    country: 'Singapore',
    category: 'Premier Leadership & Governance Enclave',
    overview: 'Restored colonial manor situated on 30 acres of lush Sentosa parkland. Hosted global leadership summits with maximum security, private pools, and 10 minutes to the financial district.',
    ai_reason: 'Maximum security, international privacy, and ultra-high-speed connectivity for executive board retreats.',
  },
  109: {
    title: 'Phu Chaisai Mountain & Brew Sanctuary',
    city: 'Chiang Rai',
    country: 'Thailand',
    category: 'Eco Wellness & Mountain Retreat',
    overview: 'Natural bamboo architecture on the peaks of Doi Mae Salong surrounded by terraced tea plantations and sea of mist. Full Starlink coverage, cool-breeze pavilions, and organic tea brainstorming.',
    ai_reason: 'High-altitude mountain serenity free from pollution, maximizing creative problem-solving.',
  },
  110: {
    title: 'Kirimaya Khao Yai Golf & MICE Executive Hub',
    city: 'Khao Yai',
    country: 'Thailand',
    category: 'Golf & Executive Strategy Resort',
    overview: 'Jack Nicklaus championship golf course and executive wellness retreat bordering Khao Yai National Park. Seamless 2-hour VIP transit from Bangkok with state-of-the-art conference facilities.',
    ai_reason: 'Seamless 2-hour executive escape from Bangkok with pristine nature and championship golf facilities.',
  },
};

// Retreat vibes translation map
export const RETREAT_VIBES_EN = [
  'Executive Strategic Summit (Strategic Planning)',
  'Beachfront Workation & Focus (Oceanfront Offsite)',
  'Eco & Wellness Team Recharge (Wellness & Recharge)',
  'Team Adventure & Bonding (Outdoor Bonding)',
  'Tech & Design Sprint Hackathon (Deep Work Sprints)',
  'Luxury MICE Conference & Gala (Executive Gala)',
];

export const RETREAT_VIBES_TH = [
  'สัมมนาวางแผนกลยุทธ์ผู้บริหาร (Executive Summit)',
  'ทำงานและพักผ่อนริมทะเล (Beachfront Workation)',
  'ฟื้นฟูสุขภาพ & ชาร์จพลังทีม (Eco & Wellness)',
  'ผจญภัยกระชับมิตรความสามัคคี (Team Adventure)',
  'สปรินต์ระดมสมองสายเทค & ดีไซน์ (Design Sprint)',
  'จัดประชุม MICE หรู & งานกาล่า (MICE Gala)',
];

export const AMENITY_TRANSLATIONS_EN: Record<string, string> = {
  'อินเทอร์เน็ต Starlink / Fiber 500+ Mbps': 'Starlink / Fiber 500+ Mbps WiFi',
  'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน': 'Executive Boardroom & Full AV System',
  'สระว่ายน้ำส่วนตัวริมผา/ติดหาด': 'Private Cliffside / Beachfront Pool',
  'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม': 'Private Chef & Group Catering',
  'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว': 'Private VIP Airport Vans',
  'โซนทำงาน Coworking พร้อมวิวธรรมชาติ': 'Coworking Zone with Nature Views',
  'สปา นวดแผนไทย & คลาสโยคะผ่อนคลาย': 'Spa, Thai Massage & Yoga Classes',
  'ล่องเรือยอชต์ส่วนตัว & กิจกรรมกระชับมิตร': 'Private Yacht Cruise & Team Bonding',
};

export function localizeAmenity(name: string, language: AppLanguage): string {
  if (language === 'en') {
    return AMENITY_TRANSLATIONS_EN[name] || name;
  }
  return name;
}

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  localizeAmenity: (name: string) => string;
  localizeDestination: (dest: {
    id: number;
    title: string;
    city: string;
    country: string;
    category: string;
    overview: string;
    ai_reason: string;
  }) => {
    title: string;
    city: string;
    country: string;
    category: string;
    overview: string;
    ai_reason: string;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'trippick_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'th' || saved === 'en') return saved;
      // Default to Thai as primary market
      return 'th';
    }
    return 'th';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage fallback
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  // Sync html lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const localizeDestination = (dest: {
    id: number;
    title: string;
    city: string;
    country: string;
    category: string;
    overview: string;
    ai_reason: string;
  }) => {
    if (language === 'en') {
      const loc = DESTINATION_LOCALIZATIONS[dest.id];
      if (loc) {
        return {
          title: loc.title,
          city: loc.city,
          country: loc.country,
          category: loc.category,
          overview: loc.overview,
          ai_reason: loc.ai_reason,
        };
      }
    }
    return {
      title: dest.title,
      city: dest.city,
      country: dest.country,
      category: dest.category,
      overview: dest.overview,
      ai_reason: dest.ai_reason,
    };
  };

  return createElement(
    LanguageContext.Provider,
    {
      value: {
        language,
        setLanguage,
        toggleLanguage,
        t,
        localizeAmenity: (name: string) => localizeAmenity(name, language),
        localizeDestination,
      },
    },
    children
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
