/**
 * B2B Procurement & Monetization Types for TripPick
 * Fully compliant with Thai Revenue Department Regulations (Order No. Tor.Por. 4/2528)
 * Track: Software for Business & Tourism - Make Me Money
 */

export interface FormattedProcurementStrings {
  roomSubtotal: string;
  hotelServiceCharge: string;
  serviceFeeBase: string;
  vat7Percent: string;
  grossTotal: string;
  wht3Percent: string;
  netPayableToVendor: string;
  tripPickCommission: string;
}

export interface ProcurementPricingModel {
  pax: number;
  nights: number;
  ratePerHead: number;
  roomSubtotal: number;
  hotelServiceCharge: number;
  serviceFeeBase: number;
  vat7Percent: number;
  grossTotal: number;
  wht3Percent: number;
  netPayableToVendor: number;
  tripPickCommission: number;
  formatted: FormattedProcurementStrings;
}

export interface RetreatPricingModel {
  headcount: number;
  nights: number;
  ratePerHeadPerNight: number;
  subtotalBeforeVat: number;
  grossBookingValue: number;
  vat7Percent: number;
  grossTotalWithVat: number;
  wht3Percent: number;
  netPayableToVendor: number;
  hotelServiceChargePercent?: number;
  hotelServiceChargeAmount?: number;
  serviceFeeBase: number;
  tripPickTakeRatePercent: number;
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
 * Formats a number into standard Thai Baht currency string: ฿XXX,XXX.XX
 */
export function formatBaht(amount: number): string {
  const parts = (Math.round(amount * 100) / 100).toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `฿${integerPart}.${parts[1]}`;
}

/**
 * Pillar 1: Statutory Hospitality Tax Calculations
 * Thai Revenue Department Order No. Tor.Por. 4/2528
 */
export function calculateProcurementPricing(
  pax: number,
  nights: number,
  ratePerHead: number
): ProcurementPricingModel {
  const safePax = Math.max(1, Math.round(pax));
  const safeNights = Math.max(1, Math.round(nights));
  const safeRate = Math.max(0, ratePerHead);

  const roomSubtotal = Math.round(safePax * safeNights * safeRate * 100) / 100;
  const hotelServiceCharge = Math.round(roomSubtotal * 0.10 * 100) / 100;
  const serviceFeeBase = Math.round((roomSubtotal + hotelServiceCharge) * 100) / 100;
  const vat7Percent = Math.round(serviceFeeBase * 0.07 * 100) / 100;
  const grossTotal = Math.round((serviceFeeBase + vat7Percent) * 100) / 100;
  const wht3Percent = Math.round(serviceFeeBase * 0.03 * 100) / 100;
  const netPayableToVendor = Math.round((grossTotal - wht3Percent) * 100) / 100;
  const tripPickCommission = Math.round(roomSubtotal * 0.12 * 100) / 100;

  return {
    pax: safePax,
    nights: safeNights,
    ratePerHead: safeRate,
    roomSubtotal,
    hotelServiceCharge,
    serviceFeeBase,
    vat7Percent,
    grossTotal,
    wht3Percent,
    netPayableToVendor,
    tripPickCommission,
    formatted: {
      roomSubtotal: formatBaht(roomSubtotal),
      hotelServiceCharge: formatBaht(hotelServiceCharge),
      serviceFeeBase: formatBaht(serviceFeeBase),
      vat7Percent: formatBaht(vat7Percent),
      grossTotal: formatBaht(grossTotal),
      wht3Percent: formatBaht(wht3Percent),
      netPayableToVendor: formatBaht(netPayableToVendor),
      tripPickCommission: formatBaht(tripPickCommission),
    },
  };
}

/**
 * Backward-compatible wrapper for retreat pricing calculation
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

  const subtotalBeforeVat = safeHeadcount * safeNights * safeRate;
  const hotelServiceChargeAmount = safeServiceChargePercent > 0
    ? Math.round(subtotalBeforeVat * (safeServiceChargePercent / 100))
    : 0;

  const serviceFeeBase = subtotalBeforeVat + hotelServiceChargeAmount;
  const vat7Percent = Math.round(serviceFeeBase * 0.07);
  const grossTotalWithVat = serviceFeeBase + vat7Percent;
  const wht3Percent = Math.round(serviceFeeBase * 0.03);
  const netPayableToVendor = grossTotalWithVat - wht3Percent;
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
