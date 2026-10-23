import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { generatePromptPayPayload } from './src/lib/promptpay.ts';

function b2bDepositApiPlugin(): Plugin {
  return {
    name: 'b2b-deposit-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/create-deposit-checkout' && req.method === 'POST') {
          let bodyText = '';
          req.on('data', chunk => {
            bodyText += chunk;
          });
          req.on('end', () => {
            try {
              const payload = bodyText ? JSON.parse(bodyText) : {};
              const roomId = payload.roomId || 'TRIP';
              const destinationId = payload.destinationId || 101;
              const companyTaxId = payload.companyTaxId || '0-1055-69018-92-4';
              const companyName = payload.companyName || 'Google Hackathon Tech & Engineering Team';
              const rawAmount = payload.amount || 500000;
              const amountInThb = rawAmount >= 10000 ? Math.round(rawAmount / 100) : rawAmount;
              const referenceNo = `DEP-TP-${Date.now().toString().slice(-6)}`;

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
          });
          return;
        }

        if (url === '/api/deposit-webhook' && req.method === 'POST') {
          let bodyText = '';
          req.on('data', chunk => {
            bodyText += chunk;
          });
          req.on('end', () => {
            try {
              const payload = bodyText ? JSON.parse(bodyText) : {};
              const roomId = payload.data?.object?.metadata?.roomId || payload.roomId || 'TRIP';
              const companyTaxId = payload.data?.object?.metadata?.clientTaxId || payload.companyTaxId || '0-1055-69018-92-4';
              const rawAmount = payload.data?.object?.amount || payload.amount || 5000;
              const amountInThb = rawAmount >= 10000 ? Math.round(rawAmount / 100) : rawAmount;
              const receiptNo = payload.referenceNo || `DEP-TP-${Date.now().toString().slice(-6)}`;
              const paidAt = new Date().toISOString();

              const confirmedEvent = {
                type: 'DEPOSIT_COMPLETED',
                roomId,
                deposit_status: 'SECURED_ESCROW',
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
          });
          return;
        }

        if (url === '/api/audio-briefing' && req.method === 'POST') {
          let bodyText = '';
          req.on('data', chunk => {
            bodyText += chunk;
          });
          req.on('end', () => {
            try {
              const payload = bodyText ? JSON.parse(bodyText) : {};
              const destinationTitle = payload.destinationTitle || 'Kirimaya เขาใหญ่';
              const city = payload.city || 'เขาใหญ่';
              const wifiSpeed = payload.wifiSpeed || 450;
              const maxCapacity = payload.maxCapacity || 30;
              const netPayable = payload.netPayable || 245000;
              const language = payload.language || 'th';
              const engine = payload.engine || 'elevenlabs-hd';

              const script =
                payload.script ||
                (language === 'th'
                  ? `เรียนฝ่ายบัญชีและผู้บริหาร: ทีมวิศวกรรมได้ฉันทามติเลือก ${destinationTitle} ณ ${city} สำหรับ Offsite ไตรมาส 3 ยอดรวมสุทธิ ${netPayable.toLocaleString()} บาท รวม VAT 7% และหัก ณ ที่จ่าย 3% เรียบร้อยแล้ว พร้อมห้องประชุม ${maxCapacity} ที่นั่ง และสเปกเน็ต Starlink ${wifiSpeed} Mbps คลิกเพื่ออนุมัติงบได้ทันทีครับ`
                  : `Executive and Finance Briefing: The team has reached unanimous consensus on ${destinationTitle} in ${city} for our corporate offsite. Net procurement total is ${netPayable.toLocaleString()} Thai Baht, fully reconciled with 7% VAT and 3% withholding tax. Equipped with ${wifiSpeed} Mbps Starlink connectivity and a ${maxCapacity}-seat executive boardroom. Click to approve budget instantly.`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  fallback: true,
                  engine,
                  language,
                  script,
                  fallbackAudioUrl: '/audio/cfo_briefing_fallback.mp3',
                  message: 'Pre-bundled authentic audio preview ready for zero-latency stage execution.',
                })
              );
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Audio briefing error';
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    b2bDepositApiPlugin(),
  ],
});
