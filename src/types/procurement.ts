/**
 * B2B Procurement & Monetization Types for TripPick
 * Fully compliant with Thai Revenue Department Regulations (ท.ป. 4/2528)
 * Track: Software for Business & Tourism - "Make Me Money"
 */

export interface RetreatPricingModel {
  /** Number of retreat attendees (min 4, scalable to 40+) */
  headcount: number;
  /** Duration of corporate stay in nights */
  nights: number;
  /** MICE Package Rate per head per night in THB */
  ratePerHeadPerNight: number;
  /**
   * Gross Booking Value (GBV) / Subtotal before VAT:
   * Formula: Headcount * Nights * RatePerHeadPerNight
   */
  subtotalBeforeVat: number;
  grossBookingValue: number;
  /**
   * Thai VAT (7%):
   * Formula: Subtotal * 0.07
   */
  vat7Percent: number;
  /**
   * Gross Total with VAT:
   * Formula: Subtotal + VAT 7%
   */
  grossTotalWithVat: number;
  /**
   * Withholding Tax 3% (ภาษีหัก ณ ที่จ่าย 3% หมวดบริการ):
   * LEGAL REQUIREMENT (ท.ป. 4/2528):
   * Must be calculated exclusively from the pre-VAT Subtotal, NEVER from Gross Total!
   * Formula: Subtotal * 0.03
   */
  wht3Percent: number;
  /**
   * Net Payable to Vendor:
   * Formula: Gross Total - WHT 3%
   * Mathematically equivalent to: Subtotal * (1 + 0.07 - 0.03) = Subtotal * 1.04
   */
  netPayableToVendor: number;
  /**
   * Hotel Service Charge (10% in hospitality MICE contracts)
   */
  hotelServiceChargePercent?: number;
  hotelServiceChargeAmount?: number;
  /**
   * Service Fee Base = Subtotal + Service Charge (Pre-VAT Base for VAT and WHT)
   */
  serviceFeeBase: number;
  /** Platform commission take-rate percentage (default: 12%) */
  tripPickTakeRatePercent: number;
  /** Platform commission earned: Subtotal * (takeRate / 100) */
  tripPickRevenue: number;
}

export type EscrowDepositStatus = 'IDLE' | 'PROCESSING' | 'SECURED_ESCROW' | 'REFUNDED';

export type EscrowPaymentMethod = 'PROMPTPAY_QR' | 'CORPORATE_CARD' | 'NET_30_PO';

export interface EscrowDeposit {
  depositId: string;
  amount: number;
  status: EscrowDepositStatus;
  paymentMethod: EscrowPaymentMethod;
  companyTaxId: string;
  companyName: string;
  approverEmail: string;
  issuedAt: string;
  receiptNo: string;
}

/**
 * Real-time Peer Synchronization Payload
 * Broadcast across peers via Supabase and BroadcastChannel when escrow is secured
 */
export interface EscrowBroadcastPayload {
  type: 'ESCROW_LOCKED';
  roomId: string;
  depositId: string;
  companyName: string;
  amount: number;
  timestamp: number;
}

export interface DemoCompanyPreset {
  companyName: string;
  companyTaxId: string;
  approverEmail: string;
  contactPerson: string;
}

export const DEMO_COMPANY_PRESETS: DemoCompanyPreset[] = [
  {
    companyName: 'บริษัท บีทูบี เทคเวนเจอร์ จำกัด',
    companyTaxId: '0105558123456',
    approverEmail: 'cfo-approval@techventure.co.th',
    contactPerson: 'สิริกร ภัทรเดชา (Chief Financial Officer)',
  },
  {
    companyName: 'บริษัท อโกด้า เทคโนโลยี (ประเทศไทย) จำกัด',
    companyTaxId: '0105558123456',
    approverEmail: 'procurement@agoda-tech.co.th',
    contactPerson: 'นพดล สุวรรณเวช (Head of Procurement)',
  },
];

/**
 * Calculates Thai corporate retreat pricing adhering strictly to Thai Revenue Department rules (ท.ป. 4/2528)
 *
 * CRITICAL TAX FORMULA:
 * Subtotal = Headcount * Nights * RatePerHead
 * VAT 7% = Subtotal * 0.07
 * Gross Total = Subtotal + VAT 7%
 * WHT 3% = Subtotal * 0.03 (Calculated from pre-VAT Subtotal, NEVER from Gross)
 * Net Payable = Gross Total - WHT 3% = Subtotal * 1.04
 */
export function calculateRetreatPricing(
  headcount: number,
  nights: number,
  ratePerHeadPerNight: number,
  takeRatePercent: number = 12,
  hotelServiceChargePercent: number = 0
): RetreatPricingModel {
  const safeHeadcount = Math.max(1, Math.round(headcount));
  const safeNights = Math.max(1, Math.round(nights));
  const safeRate = Math.max(0, ratePerHeadPerNight);
  const safeTakeRate = Math.max(0, Math.min(100, takeRatePercent));
  const safeServiceChargePercent = Math.max(0, Math.min(100, hotelServiceChargePercent));

  // 1. Subtotal = Headcount * Nights * RatePerHead
  const subtotalBeforeVat = safeHeadcount * safeNights * safeRate;

  // 2. Hotel Service Charge (10% standard in luxury MICE hotels)
  const hotelServiceChargeAmount = safeServiceChargePercent > 0
    ? Math.round(subtotalBeforeVat * (safeServiceChargePercent / 100))
    : 0;

  // 3. Pre-VAT Service Fee Base = Subtotal + Service Charge
  const serviceFeeBase = subtotalBeforeVat + hotelServiceChargeAmount;

  // 4. VAT 7% = Service Fee Base * 0.07
  const vat7Percent = Math.round(serviceFeeBase * 0.07);

  // 5. Gross Total = Service Fee Base + VAT 7%
  const grossTotalWithVat = serviceFeeBase + vat7Percent;

  // 6. WHT 3% = Service Fee Base * 0.03 (Statutory 3% service withholding tax on pre-VAT Service Fee Base)
  const wht3Percent = Math.round(serviceFeeBase * 0.03);

  // 7. Net Payable to Vendor = Gross Total - WHT 3%
  const netPayableToVendor = grossTotalWithVat - wht3Percent;

  // 8. Platform Take-Rate Revenue (Gross Booking Value * Take-Rate %)
  const tripPickRevenue = Math.round(subtotalBeforeVat * (safeTakeRate / 100));

  return {
    headcount: safeHeadcount,
    nights: safeNights,
    ratePerHeadPerNight: safeRate,
    subtotalBeforeVat,
    grossBookingValue: subtotalBeforeVat,
    hotelServiceChargePercent: safeServiceChargePercent,
    hotelServiceChargeAmount,
    serviceFeeBase,
    vat7Percent,
    grossTotalWithVat,
    wht3Percent,
    netPayableToVendor,
    tripPickTakeRatePercent: safeTakeRate,
    tripPickRevenue,
  };
}
