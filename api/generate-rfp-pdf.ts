import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateRfpPdf, type RfpDocumentData } from '../src/services/pdfReportGenerator.ts';

/**
 * Serverless API Route: /api/generate-rfp-pdf
 * Generates an authentic legal PDF procurement RFP document with Unicode Thai Sarabun font
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    let bodyText = '';
    for await (const chunk of req) {
      bodyText += chunk;
    }

    const payload: Partial<RfpDocumentData> = bodyText ? JSON.parse(bodyText) : {};

    const documentData: RfpDocumentData = {
      proposalRef: payload.proposalRef || `RFP-TP-${Date.now().toString().slice(-6)}`,
      issueDate: payload.issueDate,
      roomId: payload.roomId || 'TRIP',
      companyName: payload.companyName || 'บริษัท บีทูบี เทคเวนเจอร์ จำกัด',
      companyTaxId: payload.companyTaxId || '0-1055-58123-45-1',
      approverEmail: payload.approverEmail || 'cfo-approval@techventure.co.th',
      destinationTitle: payload.destinationTitle || 'โรงแรมตรีสรา (Trisara Phuket Resort)',
      destinationCity: payload.destinationCity || 'ภูเก็ต',
      headcount: payload.headcount || 15,
      nights: payload.nights || 3,
      ratePerHeadPerNight: payload.ratePerHeadPerNight || 6000,
      subtotalBeforeVat: payload.subtotalBeforeVat || 270000,
      hotelServiceChargePercent: payload.hotelServiceChargePercent || 10,
      hotelServiceChargeAmount: payload.hotelServiceChargeAmount || 27000,
      serviceFeeBase: payload.serviceFeeBase || 297000,
      vat7Percent: payload.vat7Percent || 20790,
      grossTotalWithVat: payload.grossTotalWithVat || 317790,
      wht3Percent: payload.wht3Percent || 8910,
      netPayableToVendor: payload.netPayableToVendor || 308880,
      isEscrowLocked: payload.isEscrowLocked ?? true,
      escrowReceiptNo: payload.escrowReceiptNo || 'DEP-TP-821942',
      language: payload.language || 'th',
    };

    const pdfBuffer = await generateRfpPdf(documentData);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TripPick_RFP_${documentData.proposalRef}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.end(Buffer.from(pdfBuffer));
  } catch (err: unknown) {
    console.error('Error generating PDF:', err);
    const message = err instanceof Error ? err.message : 'PDF generation error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}
