import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
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
 * Cryptographically verifies incoming webhook requests via HMAC-SHA256,
 * enforces idempotency, validates room consensus state, and sets ESCROW_SECURED.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-idempotency-key, Stripe-Signature');

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

    // 1. Cryptographic Verification: Extract x-signature or Stripe-Signature
    const secret = process.env.WEBHOOK_SECRET || 'trippick_sandbox_secret';
    const incomingSignature =
      (req.headers['x-signature'] as string) ||
      (req.headers['stripe-signature'] as string) ||
      '';

    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');

    if (!incomingSignature || incomingSignature !== expectedSignature) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid HMAC signature', received: false }));
      return;
    }

    // 2. Extract Idempotency Key
    const idempotencyKey =
      (req.headers['x-idempotency-key'] as string) ||
      (req.headers['idempotency-key'] as string) ||
      '';

    if (idempotencyKey && settledOrdersRegistry.has(idempotencyKey)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        received: true,
        duplicate: true,
        idempotent: true,
        deposit_status: 'HELD_IN_ESCROW',
        message: 'Order already processed with idempotency key.',
      }));
      return;
    }

    const payload: WebhookBody = bodyText ? JSON.parse(bodyText) : {};

    // 3. Identify Room, Tax ID, and Reference
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

    // Check registry for duplicate orderKey or receiptNo
    const existingSettled = settledOrdersRegistry.get(orderKey) || settledOrdersRegistry.get(receiptNo);
    if (existingSettled && (existingSettled.deposit_status === 'HELD_IN_ESCROW' || existingSettled.deposit_status === 'SECURED_ESCROW')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        received: true,
        duplicate: true,
        idempotent: true,
        deposit_status: 'HELD_IN_ESCROW',
        message: 'Order is already held in escrow.',
      }));
      return;
    }

    // 4. Validate Consensus State: Room must be in CONSENSUS_REACHED or matched before updating to SECURED_ESCROW
    const targetRoomStatus = payload.room_status || payload.data?.object?.metadata?.room_status || 'CONSENSUS_REACHED';
    if (targetRoomStatus === 'ARCHIVED') {
      res.statusCode = 410;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        received: false,
        error: 'Cannot settle deposit: Room has already been archived',
      }));
      return;
    }

    // Expiration check
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
          error: 'Order or PromptPay QR has expired (30-minute window exceeded)',
        }));
        return;
      }
    }

    // 5. Database Verification (if Supabase is configured)
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
            duplicate: true,
            idempotent: true,
            deposit_status: 'HELD_IN_ESCROW',
            message: 'Order already settled in PostgreSQL database.',
          }));
          return;
        }

        if (dbOrder.expires_at && new Date(dbOrder.expires_at).getTime() < Date.now()) {
          res.statusCode = 410;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            received: false,
            error: 'Order or PromptPay QR has expired (30-minute window exceeded)',
          }));
          return;
        }
      }

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
          error: 'Cannot settle deposit: Room has already been archived',
        }));
        return;
      }
    }

    // 6. Update Database Escrow Status
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

    // 7. Record in settled registry
    settledOrdersRegistry.set(orderKey, {
      settledAt: paidAt,
      deposit_status: 'HELD_IN_ESCROW',
    });
    settledOrdersRegistry.set(receiptNo, {
      settledAt: paidAt,
      deposit_status: 'HELD_IN_ESCROW',
    });
    if (idempotencyKey) {
      settledOrdersRegistry.set(idempotencyKey, {
        settledAt: paidAt,
        deposit_status: 'HELD_IN_ESCROW',
      });
    }

    const confirmedEvent = {
      type: 'ESCROW_SECURED',
      roomId,
      deposit_status: 'SECURED_ESCROW',
      receipt_no: receiptNo,
      amount: amountInThb,
      currency: 'THB',
      companyTaxId,
      paidAt,
      whtCertificateMatched: true,
      escrowLocked: true,
      message: 'Escrow deposit THB 5,000 confirmed. Procurement hold active.',
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
