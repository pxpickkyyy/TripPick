import type { IncomingMessage, ServerResponse } from 'node:http';
import { generatePromptPayPayload } from '../src/lib/promptpay';

interface RequestBody {
  roomId?: string;
  destinationId?: number;
  companyTaxId?: string;
  companyName?: string;
  amount?: number; // In satang (e.g. 500000 for 5,000 THB) or THB
  paymentMethod?: 'promptpay' | 'card' | 'wire';
}

/**
 * Serverless API Route: /api/create-deposit-checkout
 * Generates Stripe / Omise Test Mode Checkout session & B2B PromptPay Escrow payload
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    let bodyText = '';
    for await (const chunk of req) {
      bodyText += chunk;
    }

    const payload: RequestBody = bodyText ? JSON.parse(bodyText) : {};
    const roomId = payload.roomId || 'TRIP';
    const destinationId = payload.destinationId || 101;
    const companyTaxId = payload.companyTaxId || '0-1055-69018-92-4';
    const companyName = payload.companyName || 'Corporate MICE Client';
    
    // Amount normalization: 500,000 satang = ฿5,000 THB
    const rawAmount = payload.amount || 500000;
    const amountInThb = rawAmount >= 10000 ? Math.round(rawAmount / 100) : rawAmount;
    const referenceNo = `DEP-TP-${Date.now().toString().slice(-6)}`;

    // Generate Standard EMVCo PromptPay QR string
    const promptpayQrPayload = generatePromptPayPayload({
      target: companyTaxId,
      amount: amountInThb,
      referenceNo,
    });

    const timestamp = Date.now();
    const checkoutSession = {
      checkoutSessionId: `cs_test_${timestamp}`,
      chargeId: `ch_test_${timestamp}`,
      roomId,
      destinationId,
      amount: amountInThb,
      amountSatang: amountInThb * 100,
      currency: 'thb',
      paymentMethod: payload.paymentMethod || 'promptpay',
      companyTaxId,
      companyName,
      referenceNo,
      promptpayQrPayload,
      status: 'pending',
      metadata: {
        roomId,
        clientTaxId: companyTaxId,
        destinationId: String(destinationId),
        whtCategory: 'Section 3 Tredecim (Tor.Por. 4/2528) Services 3%',
        escrowProtection: '100% Refundable 14-day B2B Guarantee',
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, session: checkoutSession }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: message }));
  }
}
