import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface RfpDocumentData {
  proposalRef: string;
  issueDate?: string;
  roomId: string;
  companyName: string;
  companyTaxId: string;
  approverEmail: string;
  destinationTitle: string;
  destinationCity: string;
  destinationCountry?: string;
  headcount: number;
  nights: number;
  ratePerHeadPerNight: number;
  subtotalBeforeVat: number;
  hotelServiceChargePercent?: number;
  hotelServiceChargeAmount?: number;
  serviceFeeBase?: number;
  vat7Percent: number;
  grossTotalWithVat: number;
  wht3Percent: number;
  netPayableToVendor: number;
  isEscrowLocked: boolean;
  escrowReceiptNo?: string;
  escrowAmount?: number;
  language?: 'th' | 'en';
}

/**
 * Universal font loader supporting both Browser (Vite / client) and Node.js (SSR / test / serverless)
 */
async function loadFontBuffer(fontRelativePath: string): Promise<ArrayBuffer | Uint8Array> {
  const cleanPath = fontRelativePath.startsWith('/') ? fontRelativePath : `/${fontRelativePath}`;
  
  const hasBrowserFetch = typeof globalThis !== 'undefined' && 'window' in globalThis && typeof (globalThis as unknown as { fetch?: unknown }).fetch === 'function';
  if (hasBrowserFetch) {
    const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const fetchPath = `${normalizedBase}${cleanPath}`;

    let res = await (globalThis as unknown as { fetch: (input: string) => Promise<{ ok: boolean; statusText: string; arrayBuffer: () => Promise<ArrayBuffer> }> }).fetch(fetchPath);
    if (!res.ok && fetchPath !== cleanPath) {
      res = await (globalThis as unknown as { fetch: (input: string) => Promise<{ ok: boolean; statusText: string; arrayBuffer: () => Promise<ArrayBuffer> }> }).fetch(cleanPath);
    }
    if (!res.ok) {
      res = await (globalThis as unknown as { fetch: (input: string) => Promise<{ ok: boolean; statusText: string; arrayBuffer: () => Promise<ArrayBuffer> }> }).fetch(fontRelativePath);
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch font from ${cleanPath}: ${res.statusText}`);
    }
    return await res.arrayBuffer();
  }

  // Node.js environment fallback with multiple search paths (Vite ignore suppresses client bundle warnings)
  const fsMod = 'node:fs';
  const pathMod = 'node:path';
  const fs = (await import(/* @vite-ignore */ fsMod)) as typeof import('node:fs');
  const path = (await import(/* @vite-ignore */ pathMod)) as typeof import('node:path');
  const candidates = [
    path.resolve(process.cwd(), 'public', cleanPath.slice(1)),
    path.resolve(process.cwd(), cleanPath.slice(1)),
    path.resolve(process.cwd(), 'dist', cleanPath.slice(1)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate);
    }
  }
  throw new Error(`Font file not found on disk. Checked: ${candidates.join(', ')}`);
}

/**
 * Generates an authentic, vector PDF RFP document with registered fontkit and Unicode Thai font
 * Eliminates WinAnsi encoding runtime crashes for legal Thai corporate procurement
 */
export async function generateRfpPdf(data: RfpDocumentData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Load Thai Sarabun fonts (Regular & Bold)
  const [regularBytes, boldBytes] = await Promise.all([
    loadFontBuffer('fonts/Sarabun-Regular.ttf'),
    loadFontBuffer('fonts/Sarabun-Bold.ttf').catch(() => loadFontBuffer('fonts/Sarabun-Regular.ttf')),
  ]);

  const fontRegular = await doc.embedFont(regularBytes);
  const fontBold = await doc.embedFont(boldBytes);

  // Standard A4 dimensions in points: 595.28 x 841.89
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const margin = 40;
  let cursorY = height - margin;

  // Colors
  const darkNavy = rgb(0.06, 0.09, 0.16);
  const emeraldGreen = rgb(0.06, 0.65, 0.44);
  const slateGray = rgb(0.40, 0.44, 0.52);
  const borderGray = rgb(0.85, 0.88, 0.92);
  const white = rgb(1, 1, 1);
  const lightBg = rgb(0.96, 0.97, 0.99);

  // Top Header Banner
  page.drawRectangle({
    x: margin,
    y: cursorY - 50,
    width: width - margin * 2,
    height: 50,
    color: darkNavy,
  });

  page.drawText('TRIPPICK B2B PROCUREMENT & CORPORATE ESCROW DOSSIER', {
    x: margin + 14,
    y: cursorY - 22,
    size: 11,
    font: fontBold,
    color: emeraldGreen,
  });

  page.drawText('เอกสารจัดซื้อจัดจ้างและการจองสัมมนาองค์กรอย่างเป็นทางการ (Statutory Tor.Por. 4/2528)', {
    x: margin + 14,
    y: cursorY - 38,
    size: 9,
    font: fontRegular,
    color: white,
  });

  cursorY -= 65;

  // Document Metadata Bar
  page.drawRectangle({
    x: margin,
    y: cursorY - 35,
    width: width - margin * 2,
    height: 35,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  const issueDate = data.issueDate || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  page.drawText(`เลขที่เอกสาร: ${data.proposalRef}`, { x: margin + 12, y: cursorY - 16, size: 9, font: fontBold, color: darkNavy });
  page.drawText(`วันที่ออก: ${issueDate}`, { x: margin + 12, y: cursorY - 28, size: 8, font: fontRegular, color: slateGray });

  page.drawText(`รหัสห้องสัมมนา: #${data.roomId}`, { x: margin + 200, y: cursorY - 16, size: 9, font: fontBold, color: darkNavy });
  page.drawText('สถานะ: ได้รับฉันทามติ 100% (Unanimous Match)', { x: margin + 200, y: cursorY - 28, size: 8, font: fontRegular, color: emeraldGreen });

  const escrowStatusText = data.isEscrowLocked
    ? `ล็อกสิทธิ์แล้ว (${data.escrowReceiptNo || 'HELD_IN_ESCROW'})`
    : 'รอการวางเงินมัดจำ (Pending Escrow)';
  page.drawText(`สถานะ Escrow: ${escrowStatusText}`, { x: margin + 370, y: cursorY - 22, size: 8, font: fontBold, color: darkNavy });

  cursorY -= 48;

  // Corporate Profile Box
  page.drawText('1. ข้อมูลนิติบุคคลผู้จัดซื้อจัดจ้าง (Client Corporate Profile)', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  cursorY -= 14;

  page.drawRectangle({
    x: margin,
    y: cursorY - 55,
    width: width - margin * 2,
    height: 55,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(`ชื่อองค์กร / บริษัท: ${data.companyName}`, { x: margin + 12, y: cursorY - 18, size: 9, font: fontBold, color: darkNavy });
  page.drawText(`เลขประจำตัวผู้เสียภาษีอากร 13 หลัก (DBD): ${data.companyTaxId}`, { x: margin + 12, y: cursorY - 32, size: 9, font: fontRegular, color: darkNavy });
  page.drawText(`อีเมลผู้อนุมัติสั่งจ่าย (CFO / Approver): ${data.approverEmail}`, { x: margin + 12, y: cursorY - 46, size: 9, font: fontRegular, color: slateGray });

  cursorY -= 70;

  // Venue & Package Details
  page.drawText('2. รายละเอียดสถานที่และแพ็กเกจการจัดสัมมนา (Selected Executive Venue)', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  cursorY -= 14;

  page.drawRectangle({
    x: margin,
    y: cursorY - 50,
    width: width - margin * 2,
    height: 50,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(`สถานที่: ${data.destinationTitle} (${data.destinationCity})`, { x: margin + 12, y: cursorY - 18, size: 9, font: fontBold, color: darkNavy });
  page.drawText(`จำนวนผู้เข้าร่วม: ${data.headcount} ท่าน | ระยะเวลาพำนัก: ${data.nights} คืน | อัตรา: ฿${data.ratePerHeadPerNight.toLocaleString()} /ท่าน/คืน`, {
    x: margin + 12,
    y: cursorY - 32,
    size: 8.5,
    font: fontRegular,
    color: darkNavy,
  });
  page.drawText('สิ่งอำนวยความสะดวก: สัญญาณอินเทอร์เน็ต Starlink Business SLA, ห้องประชุม Executive Boardroom, รถรับส่ง VIP', {
    x: margin + 12,
    y: cursorY - 44,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });

  cursorY -= 65;

  // Financial Breakdown Table
  page.drawText('3. สรุปรายการงบประมาณและภาษีตามระเบียบกรมสรรพากร (ท.ป. 4/2528)', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  cursorY -= 14;

  const tableTop = cursorY;
  const tableWidth = width - margin * 2;
  const rowHeight = 22;

  // Table Header
  page.drawRectangle({ x: margin, y: tableTop - rowHeight, width: tableWidth, height: rowHeight, color: darkNavy });
  page.drawText('รายการ (Description)', { x: margin + 10, y: tableTop - 15, size: 8.5, font: fontBold, color: white });
  page.drawText('ฐานคำนวณ (Formula)', { x: margin + 260, y: tableTop - 15, size: 8.5, font: fontBold, color: white });
  page.drawText('จำนวนเงิน (THB)', { x: margin + 410, y: tableTop - 15, size: 8.5, font: fontBold, color: white });

  cursorY -= rowHeight;

  // Data rows
  const hotelServiceCharge = data.hotelServiceChargeAmount || 0;
  const serviceFeeBase = data.serviceFeeBase || (data.subtotalBeforeVat + hotelServiceCharge);

  const rows = [
    {
      desc: '1. ค่าที่พักและแพ็กเกจจัดงาน MICE (Accommodation & Retreat)',
      formula: `${data.headcount} ท่าน × ${data.nights} คืน × ฿${data.ratePerHeadPerNight.toLocaleString()}`,
      amount: `฿${data.subtotalBeforeVat.toLocaleString()}`,
      bold: false,
    },
    {
      desc: '2. ค่าบริการโรงแรม 10% (Hotel 10% Service Charge Awareness)',
      formula: hotelServiceCharge > 0 ? '10% ของค่าที่พัก (MICE Standard)' : 'ไม่ระบุหรือรวมในแพ็กเกจแล้ว',
      amount: hotelServiceCharge > 0 ? `฿${hotelServiceCharge.toLocaleString()}` : '฿0',
      bold: false,
    },
    {
      desc: '3. ฐานค่าบริการรวมก่อนภาษี (Pre-VAT Service Fee Base)',
      formula: 'ค่าที่พัก + ค่าบริการโรงแรม 10%',
      amount: `฿${serviceFeeBase.toLocaleString()}`,
      bold: true,
    },
    {
      desc: '4. ภาษีมูลค่าเพิ่ม 7% (VAT 7% คำนวณจากฐานค่าบริการ)',
      formula: 'Service Fee Base × 7%',
      amount: `+฿${data.vat7Percent.toLocaleString()}`,
      bold: false,
    },
    {
      desc: '5. ยอดรวมทั้งสิ้นรวมภาษี (Gross Invoice Total)',
      formula: 'Service Fee Base + VAT 7%',
      amount: `฿${data.grossTotalWithVat.toLocaleString()}`,
      bold: false,
    },
    {
      desc: '6. ภาษีหัก ณ ที่จ่าย 3% (WHT 3% คำนวณจากฐานค่าบริการก่อน VAT เท่านั้น)',
      formula: 'Service Fee Base × 3% (ท.ป. 4/2528)',
      amount: `-฿${data.wht3Percent.toLocaleString()}`,
      bold: true,
    },
    {
      desc: '7. ยอดสุทธิที่องค์กรต้องชำระจริง (Net Payable to Vendor)',
      formula: 'Gross Total - WHT 3% (Base × 1.04)',
      amount: `฿${data.netPayableToVendor.toLocaleString()}`,
      bold: true,
    },
  ];

  rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    page.drawRectangle({
      x: margin,
      y: cursorY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: isEven ? white : lightBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page.drawText(r.desc, {
      x: margin + 10,
      y: cursorY - 15,
      size: 8,
      font: r.bold ? fontBold : fontRegular,
      color: darkNavy,
    });

    page.drawText(r.formula, {
      x: margin + 260,
      y: cursorY - 15,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    });

    page.drawText(r.amount, {
      x: margin + 410,
      y: cursorY - 15,
      size: 8,
      font: r.bold ? fontBold : fontRegular,
      color: r.desc.includes('Net Payable') ? emeraldGreen : darkNavy,
    });

    cursorY -= rowHeight;
  });

  cursorY -= 14;

  // Escrow Lock Section
  page.drawRectangle({
    x: margin,
    y: cursorY - 45,
    width: tableWidth,
    height: 45,
    color: rgb(0.92, 0.98, 0.95),
    borderColor: emeraldGreen,
    borderWidth: 1,
  });

  page.drawText('[ESCROW GUARANTEE] ระบบค้ำประกันและล็อกสิทธิ์การจอง (Escrow Guarantee & Protection)', {
    x: margin + 12,
    y: cursorY - 16,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(`เงินมัดจำล็อกสิทธิ์ Escrow: ฿5,000.00 THB | รหัสรับรอง: ${data.escrowReceiptNo || 'DEP-TP-GUARANTEE'}`, {
    x: margin + 12,
    y: cursorY - 30,
    size: 8,
    font: fontRegular,
    color: darkNavy,
  });

  page.drawText('คุ้มครอง 100% ด้วย B2B Escrow Lock: สามารถขอรับเงินคืนเต็มจำนวนหากสถานที่ปิดปรับปรุงหรือไม่เป็นไปตามสัญญา', {
    x: margin + 12,
    y: cursorY - 40,
    size: 7.5,
    font: fontRegular,
    color: emeraldGreen,
  });

  cursorY -= 65;

  // Legal Signatory Blocks
  page.drawText('4. ลายมือชื่อผู้มีอำนาจลงนามและข้อตกลง (Authorized Signatures)', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  cursorY -= 14;

  const boxWidth = (tableWidth - 20) / 2;

  // Vendor Signature Block
  page.drawRectangle({
    x: margin,
    y: cursorY - 70,
    width: boxWidth,
    height: 70,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('ผู้ออกเอกสาร (Authorized Vendor):', { x: margin + 10, y: cursorY - 16, size: 8, font: fontBold, color: darkNavy });
  page.drawText('บริษัท ทริปพิก บิสซิเนส ทราเวล โซลูชั่นส์ จำกัด', { x: margin + 10, y: cursorY - 28, size: 8, font: fontRegular, color: darkNavy });
  page.drawText('ลงชื่อ: ____________________________', { x: margin + 10, y: cursorY - 50, size: 8, font: fontRegular, color: slateGray });
  page.drawText('ตำแหน่ง: Executive Director / Operations', { x: margin + 10, y: cursorY - 62, size: 7.5, font: fontRegular, color: slateGray });

  // Client Signatory Block
  page.drawRectangle({
    x: margin + boxWidth + 20,
    y: cursorY - 70,
    width: boxWidth,
    height: 70,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('ผู้มีอำนาจสั่งจ่ายฝ่ายจัดซื้อ (Client Approver):', { x: margin + boxWidth + 30, y: cursorY - 16, size: 8, font: fontBold, color: darkNavy });
  page.drawText(data.companyName, { x: margin + boxWidth + 30, y: cursorY - 28, size: 8, font: fontRegular, color: darkNavy });
  page.drawText('ลงชื่อ: ____________________________', { x: margin + boxWidth + 30, y: cursorY - 50, size: 8, font: fontRegular, color: slateGray });
  page.drawText(`อีเมลอนุมัติ: ${data.approverEmail}`, { x: margin + boxWidth + 30, y: cursorY - 62, size: 7.5, font: fontRegular, color: slateGray });

  // Footer Disclaimer
  page.drawText('เอกสารนี้สร้างขึ้นโดยระบบ TripPick Autonomous B2B Procurement Engine — รับรองความถูกต้องตามประมวลรัษฎากรแห่งประเทศไทย', {
    x: margin,
    y: margin - 15,
    size: 7,
    font: fontRegular,
    color: slateGray,
  });

  return await doc.save();
}

/**
 * Browser helper to trigger instant direct download of the generated PDF
 */
interface BrowserDomContext {
  document?: {
    createElement: (tag: string) => { href: string; download: string; click: () => void };
    body: { appendChild: (el: unknown) => void; removeChild: (el: unknown) => void };
  };
}

export async function downloadRfpPdf(data: RfpDocumentData, filename?: string): Promise<void> {
  const pdfBytes = await generateRfpPdf(data);
  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as unknown as BrowserDomContext) : {};
  if (globalObj.document) {
    const doc = globalObj.document;
    const arrayBufferSlice = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBufferSlice], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = doc.createElement('a');
    a.href = url;
    a.download = filename || `TripPick_RFP_${data.proposalRef}.pdf`;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    // Defer revocation so browser download manager can initiate transfer on mobile/Safari
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  }
}

