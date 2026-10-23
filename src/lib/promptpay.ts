/**
 * Thai PromptPay EMVCo Standard Payload & CRC16 Generator
 * Conforms to Bank of Thailand (BOT) National e-Payment Standards for B2B Corporate Escrow
 */

import QRCode from 'qrcode';

function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Calculates standard CRC16-CCITT (0xFFFF, 0x1021 polynomial)
 */
export function calculateCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PromptPayOptions {
  /** 13-digit Corporate Tax ID or 10-digit mobile number */
  target: string;
  /** Amount in THB (e.g. 5000) */
  amount: number;
  /** Reference document ID (e.g. DEP-TP-821942) */
  referenceNo?: string;
}

/**
 * Generates official EMVCo QR string for Thai PromptPay
 */
export function generatePromptPayPayload(options: PromptPayOptions): string {
  const { target = '', amount, referenceNo = 'DEP-TP-CORP' } = options;
  const sanitizedTarget = (target || '').replace(/[^0-9]/g, '');

  let merchantSubtag: string;
  if (sanitizedTarget.length === 13) {
    // 02 = National ID / Corporate Tax ID
    merchantSubtag = formatField('02', sanitizedTarget);
  } else if (sanitizedTarget.length === 10) {
    // 01 = Mobile number (prefix with 0066 and omit leading 0)
    const mobileNo = '0066' + sanitizedTarget.substring(1);
    merchantSubtag = formatField('01', mobileNo);
  } else {
    // Fallback to TripPick Corporate Tax ID (0105569018924)
    merchantSubtag = formatField('02', '0105569018924');
  }

  // ID 29: Merchant Account Information
  const aid = formatField('00', 'A000000677010111');
  const merchantAccountInfo = formatField('29', aid + merchantSubtag);

  // ID 54: Transaction Amount formatted to 2 decimals
  const safeAmount = Math.max(0, Number(amount) || 0);
  const formattedAmount = safeAmount.toFixed(2);
  const amountField = formatField('54', formattedAmount);

  // ID 62: Additional Data Field (Reference Number)
  const safeRef = (referenceNo || 'DEP-TP-CORP').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
  const refSubfield = formatField('01', safeRef || 'DEP-TP-CORP');
  const additionalDataField = formatField('62', refSubfield);

  // Construct standard payload before CRC
  const rawPayload =
    formatField('00', '01') + // Payload Format Indicator
    formatField('01', '12') + // Point of Initiation: 12 (Dynamic with fixed amount)
    merchantAccountInfo +
    formatField('53', '764') + // Transaction Currency: 764 (THB)
    amountField +
    formatField('58', 'TH') + // Country Code: TH
    additionalDataField +
    '6304'; // CRC placeholder (ID 63, length 04)

  const crc = calculateCrc16(rawPayload);
  return rawPayload + crc;
}

/**
 * Generates an authentic SVG QR Matrix representation of the PromptPay payload
 * Fully compliant with EMVCo & ISO/IEC 18004 QR specifications
 * Produces real, scannable QR modules offline with zero external network dependencies
 */
export function generateQrSvgPath(payload: string, size: number = 220, margin: number = 2): string {
  if (!payload) return '';
  try {
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const totalModules = moduleCount + margin * 2;
    const cellSize = size / totalModules;
    const paths: string[] = [];

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          const x = ((c + margin) * cellSize).toFixed(2);
          const y = ((r + margin) * cellSize).toFixed(2);
          const w = cellSize.toFixed(2);
          paths.push(`M${x},${y}h${w}v${w}h-${w}z`);
        }
      }
    }

    return paths.join(' ');
  } catch (err) {
    console.warn('TripPick: QR Code generation error:', err);
    return '';
  }
}
