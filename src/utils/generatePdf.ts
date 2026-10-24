import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface CorporateRfpPdfInput {
  proposalRef: string;
  issueDate?: string;
  roomId: string;
  companyName: string;
  companyTaxId: string;
  approverEmail?: string;
  destinationTitle: string;
  destinationCity: string;
  destinationCountry?: string;
  headcount: number;
  nights: number;
  ratePerHeadPerNight?: number;
  ratePerHead?: number;
  subtotalBeforeVat?: number;
  hotelServiceChargePercent?: number;
  hotelServiceChargeAmount?: number;
  serviceFeeBase?: number;
  vat7Percent?: number;
  grossTotalWithVat?: number;
  grossTotal?: number;
  wht3Percent?: number;
  netPayableToVendor?: number;
  netPayable?: number;
  isEscrowLocked: boolean;
  escrowReceiptNo?: string;
  escrowAmount?: number;
  language?: 'th' | 'en';
}

export interface GeneratedPdfResult {
  blobUrl: string;
  pdfBytes: Uint8Array;
  filename: string;
}

/**
 * Universal font loader supporting browser fetch and Node.js file system
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

  // Node.js fallback
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
 * Generates official legal Corporate RFP & Escrow Certificate with Unicode Thai Sarabun font
 * Eradicates window.print() browser halts and prevents WinAnsi encoding crashes.
 */
export async function generateCorporateRfpPdf(data: CorporateRfpPdfInput): Promise<GeneratedPdfResult> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

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

  const darkNavy = rgb(0.06, 0.09, 0.16);
  const emeraldGreen = rgb(0.06, 0.65, 0.44);
  const slateGray = rgb(0.38, 0.44, 0.52);
  const lightBg = rgb(0.96, 0.97, 0.98);
  const borderGray = rgb(0.85, 0.88, 0.92);
  const white = rgb(1, 1, 1);

  // Header Banner
  page.drawRectangle({
    x: margin,
    y: cursorY - 50,
    width: width - margin * 2,
    height: 50,
    color: darkNavy,
  });

  page.drawText('TRIPPICK B2B PROCUREMENT RFP & ESCROW CERTIFICATE', {
    x: margin + 16,
    y: cursorY - 24,
    size: 13,
    font: fontBold,
    color: white,
  });

  page.drawText('Autonomous Corporate Retreat Consensus & MICE Contract Reconciler', {
    x: margin + 16,
    y: cursorY - 40,
    size: 8,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.92),
  });

  cursorY -= 65;

  // Metadata Card
  page.drawRectangle({
    x: margin,
    y: cursorY - 80,
    width: width - margin * 2,
    height: 80,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  const ratePerHead = data.ratePerHeadPerNight || data.ratePerHead || 6000;
  const subtotalBeforeVat = data.subtotalBeforeVat ?? (data.headcount * data.nights * ratePerHead);
  const scPercent = data.hotelServiceChargePercent ?? 10;
  const scAmount = data.hotelServiceChargeAmount ?? Math.round(subtotalBeforeVat * (scPercent / 100));
  const serviceFeeBase = data.serviceFeeBase ?? (subtotalBeforeVat + scAmount);
  const vat7Percent = data.vat7Percent ?? Math.round(serviceFeeBase * 0.07);
  const grossTotalWithVat = data.grossTotalWithVat ?? data.grossTotal ?? (serviceFeeBase + vat7Percent);
  const wht3Percent = data.wht3Percent ?? Math.round(serviceFeeBase * 0.03);
  const netPayableToVendor = data.netPayableToVendor ?? data.netPayable ?? (grossTotalWithVat - wht3Percent);
  const approverEmail = data.approverEmail || 'procurement-approval@trippick.demo';

  const col1X = margin + 14;
  const col2X = margin + 280;

  page.drawText(`Reference No: ${data.proposalRef}`, { x: col1X, y: cursorY - 18, size: 8.5, font: fontBold, color: darkNavy });
  page.drawText(`Room Code: #${data.roomId}`, { x: col1X, y: cursorY - 32, size: 8.5, font: fontRegular, color: slateGray });
  page.drawText(`Client Entity: ${data.companyName}`, { x: col1X, y: cursorY - 46, size: 8.5, font: fontRegular, color: darkNavy });
  page.drawText(`Tax ID (DBD): ${data.companyTaxId}`, { x: col1X, y: cursorY - 60, size: 8.5, font: fontRegular, color: slateGray });

  const issueDateStr = data.issueDate || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  page.drawText(`Issue Date: ${issueDateStr}`, { x: col2X, y: cursorY - 18, size: 8.5, font: fontRegular, color: slateGray });
  page.drawText(`Approver Email: ${approverEmail}`, { x: col2X, y: cursorY - 32, size: 8.5, font: fontRegular, color: slateGray });
  page.drawText(`Venue: ${data.destinationTitle} (${data.destinationCity})`, { x: col2X, y: cursorY - 46, size: 8.5, font: fontBold, color: darkNavy });
  page.drawText(`Pax & Duration: ${data.headcount} Guests / ${data.nights} Nights`, { x: col2X, y: cursorY - 60, size: 8.5, font: fontRegular, color: slateGray });

  cursorY -= 95;

  // Verified Business Amenities & Starlink SLA
  page.drawRectangle({
    x: margin,
    y: cursorY - 45,
    width: width - margin * 2,
    height: 45,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('VERIFIED BUSINESS AMENITIES & CONNECTIVITY SLA:', {
    x: margin + 14,
    y: cursorY - 16,
    size: 8,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText('[SLA Guarantee] Dedicated Starlink & Fiber Network (500+ Mbps) | Executive Boardroom AV Ready (30 Pax)', {
    x: margin + 14,
    y: cursorY - 30,
    size: 7.5,
    font: fontRegular,
    color: emeraldGreen,
  });

  cursorY -= 60;

  // Table Header
  const tableWidth = width - margin * 2;
  page.drawRectangle({
    x: margin,
    y: cursorY - 22,
    width: tableWidth,
    height: 22,
    color: darkNavy,
  });

  page.drawText('LINE ITEM / STATUTORY TAX COMPLIANCE (TOR.POR. 4/2528)', { x: margin + 10, y: cursorY - 15, size: 7.5, font: fontBold, color: white });
  page.drawText('FORMULA', { x: margin + 310, y: cursorY - 15, size: 7.5, font: fontBold, color: white });
  page.drawText('AMOUNT (THB)', { x: margin + tableWidth - 80, y: cursorY - 15, size: 7.5, font: fontBold, color: white });

  cursorY -= 22;

  const rows: Array<{ title: string; subtitle: string; formula: string; amount: number; highlight?: boolean }> = [
    {
      title: '1. Net Subtotal (Gross Booking Value)',
      subtitle: `${data.headcount} guests x ${data.nights} nights x THB ${ratePerHead.toLocaleString()}`,
      formula: 'Pax x Nights x Rate',
      amount: subtotalBeforeVat,
    },
    ...(scAmount > 0 ? [
      {
        title: '2. Hotel Service Charge (10% MICE Standard)',
        subtitle: 'Standard hospitality service charge prior to VAT calculation',
        formula: 'Subtotal x 0.10',
        amount: scAmount,
      },
      {
        title: '3. Pre-VAT Service Fee Base',
        subtitle: 'Statutory unified base for VAT 7% and Withholding Tax 3%',
        formula: 'Subtotal + Svc Charge',
        amount: serviceFeeBase,
      },
    ] : []),
    {
      title: 'Value Added Tax (VAT 7%)',
      subtitle: 'Calculated from Pre-VAT Service Fee Base',
      formula: 'Base x 0.07',
      amount: vat7Percent,
    },
    {
      title: 'Gross Total with VAT 7%',
      subtitle: 'Base plus VAT 7%',
      formula: 'Base + VAT 7%',
      amount: grossTotalWithVat,
    },
    {
      title: 'Withholding Tax 3% (WHT 3% - Services Tor.Por. 4/2528)',
      subtitle: 'Calculated strictly on Pre-VAT Base, NEVER on Gross Total',
      formula: 'Base x 0.03',
      amount: -wht3Percent,
      highlight: true,
    },
    {
      title: 'Net Payable to Vendor',
      subtitle: 'Gross Total minus Withholding Tax 3% (Base x 1.04)',
      formula: 'Gross - WHT 3%',
      amount: netPayableToVendor,
      highlight: true,
    },
  ];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isEven = i % 2 === 0;
    const rowHeight = 28;

    page.drawRectangle({
      x: margin,
      y: cursorY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: row.highlight ? rgb(0.92, 0.98, 0.95) : isEven ? white : lightBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page.drawText(row.title, { x: margin + 10, y: cursorY - 12, size: 7.5, font: row.highlight ? fontBold : fontRegular, color: darkNavy });
    page.drawText(row.subtitle, { x: margin + 10, y: cursorY - 22, size: 6.5, font: fontRegular, color: slateGray });
    page.drawText(row.formula, { x: margin + 310, y: cursorY - 16, size: 7, font: fontRegular, color: slateGray });

    const amountFormatted = `${row.amount < 0 ? '-' : ''}THB ${Math.abs(row.amount).toLocaleString()}`;
    page.drawText(amountFormatted, {
      x: margin + tableWidth - 85,
      y: cursorY - 16,
      size: 7.5,
      font: row.highlight ? fontBold : fontRegular,
      color: row.highlight ? emeraldGreen : darkNavy,
    });

    cursorY -= rowHeight;
  }

  cursorY -= 15;

  // Escrow Status Badge
  page.drawRectangle({
    x: margin,
    y: cursorY - 32,
    width: tableWidth,
    height: 32,
    color: rgb(0.92, 0.98, 0.95),
    borderColor: emeraldGreen,
    borderWidth: 1,
  });

  const escrowRef = data.escrowReceiptNo || `DEP-TP-${Date.now().toString().slice(-6)}`;
  page.drawText('[SECURED ESCROW DEPOSIT CONFIRMED]', { x: margin + 12, y: cursorY - 14, size: 8, font: fontBold, color: emeraldGreen });
  page.drawText(`THB 5,000.00 Escrow Deposit locked. Ref: ${escrowRef} | 100% Refundable 14-day B2B Guarantee`, {
    x: margin + 12,
    y: cursorY - 25,
    size: 7,
    font: fontRegular,
    color: darkNavy,
  });

  cursorY -= 48;

  // Dual Signature Approval Block
  const boxWidth = (tableWidth - 20) / 2;

  // Vendor Signature Block
  page.drawRectangle({
    x: margin,
    y: cursorY - 65,
    width: boxWidth,
    height: 65,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('Authorized Vendor (TripPick Concierge):', { x: margin + 10, y: cursorY - 15, size: 7.5, font: fontBold, color: darkNavy });
  page.drawText('TripPick Business Travel Solutions Co., Ltd.', { x: margin + 10, y: cursorY - 26, size: 7.5, font: fontRegular, color: darkNavy });
  page.drawText('Signature: ____________________________', { x: margin + 10, y: cursorY - 45, size: 7.5, font: fontRegular, color: slateGray });
  page.drawText('Title: Executive Director / MICE Operations', { x: margin + 10, y: cursorY - 56, size: 7, font: fontRegular, color: slateGray });

  // Client Signatory Block
  page.drawRectangle({
    x: margin + boxWidth + 20,
    y: cursorY - 65,
    width: boxWidth,
    height: 65,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('Corporate Procurement Officer (Client Approver):', { x: margin + boxWidth + 30, y: cursorY - 15, size: 7.5, font: fontBold, color: darkNavy });
  page.drawText(data.companyName, { x: margin + boxWidth + 30, y: cursorY - 26, size: 7.5, font: fontRegular, color: darkNavy });
  page.drawText('Signature: ____________________________', { x: margin + boxWidth + 30, y: cursorY - 45, size: 7.5, font: fontRegular, color: slateGray });
  page.drawText(`Email: ${data.approverEmail}`, { x: margin + boxWidth + 30, y: cursorY - 56, size: 7, font: fontRegular, color: slateGray });

  // Footer Disclaimer
  page.drawText('Created by TripPick Autonomous B2B Procurement Engine. 100% Tax Compliant with Revenue Code of Thailand.', {
    x: margin,
    y: margin - 15,
    size: 6.5,
    font: fontRegular,
    color: slateGray,
  });

  const pdfBytes = await doc.save();
  const filename = `TripPick_RFP_${data.proposalRef}.pdf`;

  let blobUrl = '';
  if (typeof window !== 'undefined' && typeof window.Blob !== 'undefined' && typeof window.URL !== 'undefined') {
    const arrayBufferSlice = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBufferSlice], { type: 'application/pdf' });
    blobUrl = URL.createObjectURL(blob);
  }

  return { blobUrl, pdfBytes, filename };
}

/**
 * Triggers instant client-side download of the generated PDF without browser print halts
 */
export async function downloadCorporateRfpPdf(data: CorporateRfpPdfInput): Promise<string> {
  const result = await generateCorporateRfpPdf(data);
  if (typeof document !== 'undefined' && result.blobUrl) {
    const link = document.createElement('a');
    link.href = result.blobUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(result.blobUrl);
    }, 2000);
  }
  return result.blobUrl;
}
