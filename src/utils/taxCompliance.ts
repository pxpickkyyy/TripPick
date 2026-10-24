/**
 * Thai Corporate Tax Compliance & Strict Validation Engine
 * Pursuant to Thai Revenue Department Regulations (Order No. Tor.Por. 4/2528)
 * and Department of Business Development (DBD) corporate standards.
 */

export interface ThaiTaxValidationResult {
  isValid: boolean;
  isComplete: boolean;
  formatted: string;
  digits: string;
  error?: string;
  expectedCheckDigit?: number;
}

/**
 * Automatically formats keystrokes as standard Thai DBD Corporate Tax ID: X-XXXX-XXXXX-XX-X
 */
export function formatThaiTaxId(rawTaxId: string): string {
  const digits = rawTaxId.replace(/\D/g, '').slice(0, 13);
  if (digits.length === 0) return '';
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Calculate expected Modulus 11 check digit for first 12 digits
 */
export function calculateModulus11CheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12.charAt(i), 10);
    const weight = 13 - i;
    sum += digit * weight;
  }
  const remainder = sum % 11;
  return (11 - remainder) % 10;
}

/**
 * Returns a valid formatted Thai Tax ID by computing and attaching the Modulus 11 check digit
 */
export function ensureValidThaiTaxId(rawTaxId: string): string {
  const digits = rawTaxId.replace(/\D/g, '');
  if (digits.length >= 12) {
    const base12 = digits.slice(0, 12);
    const checkDigit = calculateModulus11CheckDigit(base12);
    return formatThaiTaxId(`${base12}${checkDigit}`);
  }
  return formatThaiTaxId(rawTaxId);
}

/**
 * Official Thai 13-Digit Corporate Tax ID Validator (Modulus 11 Checksum)
 */
export function validateThaiTaxId(rawTaxId: string): ThaiTaxValidationResult {
  const digits = rawTaxId.replace(/\D/g, '').slice(0, 13);
  const formatted = formatThaiTaxId(digits);

  if (digits.length === 0) {
    return {
      isValid: false,
      isComplete: false,
      digits: '',
      formatted: '',
      error: 'กรุณากรอกเลขประจำตัวผู้เสียภาษีอากร 13 หลัก',
    };
  }

  if (digits.length < 13) {
    return {
      isValid: false,
      isComplete: false,
      digits,
      formatted,
      error: `เลขประจำตัวผู้เสียภาษียังไม่ครบ 13 หลัก (${digits.length}/13 หลัก)`,
    };
  }

  // Reject repeating patterns (e.g. 0000000000000 or 1111111111111)
  if (/^(\d)\1{12}$/.test(digits)) {
    return {
      isValid: false,
      isComplete: true,
      digits,
      formatted,
      error: 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้องตามแบบแผนกรมสรรพากร (เลขซ้ำกันทั้งหมด)',
    };
  }

  const expectedCheckDigit = calculateModulus11CheckDigit(digits.slice(0, 12));
  const actualCheckDigit = parseInt(digits.charAt(12), 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      isValid: false,
      isComplete: true,
      digits,
      formatted,
      expectedCheckDigit,
      error: `เลขตรวจสอบ (Check Digit) ไม่ถูกต้องตามหลัก Modulus 11 กรมสรรพากร (หลักสุดท้ายควรเป็น ${expectedCheckDigit})`,
    };
  }

  return {
    isValid: true,
    isComplete: true,
    digits,
    formatted,
    expectedCheckDigit,
  };
}

export interface StatutoryB2BTaxResult {
  headcount: number;
  nights: number;
  ratePerHead: number;
  subtotalBeforeVat: number;
  hotelServiceChargePercent: number;
  hotelServiceChargeAmount: number;
  serviceFeeBase: number;
  vat7Percent: number;
  grossTotal: number;
  wht3Percent: number;
  netPayable: number;
  platformMargin: number;
  takeRatePercent: number;
}

/**
 * Statutory Thai B2B Tax Calculation (Tor.Por. 4/2528) with Hotel 10% Service Charge Awareness
 * 
 * Rules:
 * 1. Subtotal = Headcount * Nights * RatePerHead
 * 2. Service Charge (10% in luxury MICE venues): Service Charge = Subtotal * 0.10
 * 3. Service Fee Base = Subtotal + Service Charge
 * 4. VAT 7% = Service Fee Base * 0.07
 * 5. Gross Total = Service Fee Base + VAT 7%
 * 6. WHT 3% (Withholding Tax): Calculated strictly on the pre-VAT Service Fee Base per Tor.Por. 4/2528
 *    WHT 3% = Service Fee Base * 0.03
 * 7. Net Payable = Gross Total - WHT 3% = Service Fee Base * 1.04
 */
export function calculateStatutoryB2BTax(
  headcount: number,
  nights: number,
  ratePerHead: number,
  takeRatePercent: number = 12,
  includeHotelServiceCharge: boolean = false
): StatutoryB2BTaxResult {
  const safeHeadcount = Math.max(1, Math.round(headcount));
  const safeNights = Math.max(1, Math.round(nights));
  const safeRate = Math.max(0, ratePerHead);
  const safeTakeRate = Math.max(0, Math.min(100, takeRatePercent));

  const subtotal = safeHeadcount * safeNights * safeRate;
  const hotelServiceChargePercent = includeHotelServiceCharge ? 10 : 0;
  const hotelServiceChargeAmount = includeHotelServiceCharge
    ? Math.round(subtotal * 0.10 * 100) / 100
    : 0;

  // Pre-VAT Service Fee Base
  const serviceFeeBase = Math.round((subtotal + hotelServiceChargeAmount) * 100) / 100;

  // VAT 7% on Service Fee Base
  const vat7 = Math.round(serviceFeeBase * 0.07 * 100) / 100;
  const grossTotal = Math.round((serviceFeeBase + vat7) * 100) / 100;

  // Strict statutory requirement: WHT 3% must be computed on pre-VAT Base, NEVER Gross
  const wht3 = Math.round(serviceFeeBase * 0.03 * 100) / 100;
  const netPayable = Math.round((grossTotal - wht3) * 100) / 100;

  // Internal platform margin ledger
  const platformMargin = Math.round(subtotal * (safeTakeRate / 100) * 100) / 100;

  return {
    headcount: safeHeadcount,
    nights: safeNights,
    ratePerHead: safeRate,
    subtotalBeforeVat: subtotal,
    hotelServiceChargePercent,
    hotelServiceChargeAmount,
    serviceFeeBase,
    vat7Percent: vat7,
    grossTotal,
    wht3Percent: wht3,
    netPayable,
    platformMargin,
    takeRatePercent: safeTakeRate,
  };
}
