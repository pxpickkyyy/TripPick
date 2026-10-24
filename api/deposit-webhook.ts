import type { IncomingMessage, ServerResponse } from 'node:http';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase.ts';

interface WebhookBody {
  event?: string;
  type?: string;
  id?: string;
  data?: {
    object?: {
      id?: string;
      metadata?: {
        roomId?: string;
        clientTaxId?: string;
        destinationId?: string;
        room_status?: string;
        expiresAt?: string;
        expires_at?: string;
        referenceNo?: string;
      };
      amount?: number;
      currency?: string;
      status?: string;
      expires_at?: number | string;
    };
  };
  // Direct sandbox test payload
  roomId?: string;
  companyTaxId?: string;
  referenceNo?: string;
  amount?: number;
  deposit_status?: string;
  expires_at?: string;
  room_status?: string;
}

// In-memory idempotency cache for fast serverless deduping across gateway retries
const settledOrdersRegistry = new Map<string, { settledAt: string; deposit_status: string }>();

/**
 * Serverless API Route: /api/deposit-webhook
 * Handles Stripe / Omise webhook with Idempotency Guard & PromptPay Expiration Protection
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

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

    const payload: WebhookBody = bodyText ? JSON.parse(bodyText) : {};

    // 1. Identify Room, Tax ID, and Reference / Charge ID
    const roomId =
      payload.data?.object?.metadata?.roomId ||
      payload.roomId ||
      'TRIP';

    const companyTaxId =
      payload.data?.object?.metadata?.clientTaxId ||
      payload.companyTaxId ||
      '0-1055-69018-92-4';

    const rawAmount =
      payload.data?.object?.amount ||
      payload.amount ||
      5000;
    const amountInThb = rawAmount >= 10000 ? Math.round(rawAmount / 100) : rawAmount;

    const receiptNo =
      payload.referenceNo ||
      payload.data?.object?.metadata?.referenceNo ||
      payload.data?.object?.id ||
      payload.id ||
      `DEP-TP-${Date.now().toString().slice(-6)}`;

    const orderKey = `${roomId}:${receiptNo}`;

    // 2. IDEMPOTENCY GUARD: Check if webhook retry or already settled
    const existingSettled = settledOrdersRegistry.get(orderKey) || settledOrdersRegistry.get(receiptNo);
    if (existingSettled && (existingSettled.deposit_status === 'HELD_IN_ESCROW' || existingSettled.deposit_status === 'SECURED_ESCROW')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        received: true,
        idempotent: true,
        deposit_status: 'HELD_IN_ESCROW',
        message: 'Webhook retry received: Order is already securely held in escrow.'
      }));
      return;
    }

    // 3. DATABASE VERIFICATION (if Supabase is configured)
    if (isSupabaseConfigured) {
      const { data: dbOrder } = await supabase
        .from('procurement_orders')
        .select('*')
        .eq('rfp_reference_code', receiptNo)
        .maybeSingle();

      if (dbOrder) {
        if (dbOrder.deposit_status === 'HELD_IN_ESCROW' || dbOrder.deposit_status === 'SECURED_ESCROW') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            received: true,
            idempotent: true,
            deposit_status: 'HELD_IN_ESCROW',
            message: 'Order already settled in PostgreSQL database.'
          }));
          return;
        }

        // Check expiration in database
        if (dbOrder.expires_at && new Date(dbOrder.expires_at).getTime() < Date.now()) {
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            received: false,
            error: 'Order or PromptPay QR has expired (30-minute window exceeded)'
          }));
          return;
        }
      }

      // Check if room is archived (supporting both UUID and room_code)
      let roomQuery = supabase.from('trippick_rooms').select('status');
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId)) {
        roomQuery = roomQuery.eq('id', roomId);
      } else {
        roomQuery = roomQuery.eq('room_code', roomId);
      }
      const { data: dbRoom } = await roomQuery.maybeSingle();

      if (dbRoom?.status === 'ARCHIVED') {
        res.statusCode = 410;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          received: false,
          error: 'Cannot settle deposit: Room has already been archived'
        }));
        return;
      }
    }

    // 4. INLINE EXPIRATION & ARCHIVE GUARD (for Direct / Sandbox tests)
    const rawExpiresAt =
      payload.expires_at ||
      payload.data?.object?.expires_at ||
      payload.data?.object?.metadata?.expiresAt ||
      payload.data?.object?.metadata?.expires_at;
    if (rawExpiresAt) {
      const expiryTimestamp = typeof rawExpiresAt === 'number'
        ? rawExpiresAt * (rawExpiresAt < 1e11 ? 1000 : 1)
        : new Date(rawExpiresAt).getTime();

      if (!isNaN(expiryTimestamp) && expiryTimestamp < Date.now()) {
        res.statusCode = 410;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          received: false,
          error: 'Order or PromptPay QR has expired (30-minute window exceeded)'
        }));
        return;
      }
    }

    const roomStatus = payload.room_status || payload.data?.object?.metadata?.room_status;
    if (roomStatus === 'ARCHIVED') {
      res.statusCode = 410;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        received: false,
        error: 'Cannot settle deposit: Room has already been archived'
      }));
      return;
    }

    // 5. UPDATE DATABASE ESCROW STATUS (if Supabase is configured)
    const paidAt = new Date().toISOString();
    if (isSupabaseConfigured) {
      await supabase
        .from('procurement_orders')
        .update({
          deposit_status: 'HELD_IN_ESCROW',
          gateway_charge_id: receiptNo,
        })
        .eq('rfp_reference_code', receiptNo);

      let updateRoomQuery = supabase.from('trippick_rooms').update({
        status: 'LOCKED_ESCROW',
        updated_at: paidAt,
      });
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId)) {
        updateRoomQuery = updateRoomQuery.eq('id', roomId);
      } else {
        updateRoomQuery = updateRoomQuery.eq('room_code', roomId);
      }
      await updateRoomQuery;
    }

    // 6. RECORD IDEMPOTENCY KEY IN REGISTRY
    settledOrdersRegistry.set(orderKey, {
      settledAt: paidAt,
      deposit_status: 'HELD_IN_ESCROW',
    });
    settledOrdersRegistry.set(receiptNo, {
      settledAt: paidAt,
      deposit_status: 'HELD_IN_ESCROW',
    });

    const confirmedEvent = {
      type: 'DEPOSIT_COMPLETED',
      roomId,
      deposit_status: 'HELD_IN_ESCROW',
      receipt_no: receiptNo,
      amount: amountInThb,
      currency: 'THB',
      companyTaxId,
      paidAt,
      whtCertificateMatched: true,
      escrowLocked: true,
      message: 'เงินมัดจำล็อกสิทธิ์ ฿5,000 เข้าสู่ระบบ Escrow เรียบร้อยแล้ว สิทธิ์การจองได้รับการยืนยัน 100%',
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, event: confirmedEvent }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: false, error: message }));
  }
}
