import type { IncomingMessage, ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';

interface AudioBriefingRequestBody {
  destinationTitle?: string;
  city?: string;
  wifiSpeed?: number;
  maxCapacity?: number;
  netPayable?: number;
  language?: 'th' | 'en';
  engine?: 'google-cloud-tts' | 'elevenlabs-hd' | 'web-speech' | 'synth-fallback';
  script?: string;
  voiceId?: string;
}

/**
 * Serverless API Route: /api/audio-briefing
 * Lightweight backend adapter for TripPick Modular Voice Architecture.
 * Synthesizes Executive CFO Audio Memo and Live Jackbox Announcer briefings
 * via ElevenLabs High-Fidelity Voice API or Google Cloud Text-to-Speech,
 * with deterministic offline fallback metadata.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
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

    const payload: AudioBriefingRequestBody = bodyText ? JSON.parse(bodyText) : {};
    const destinationTitle = payload.destinationTitle || 'Kirimaya เขาใหญ่';
    const city = payload.city || 'เขาใหญ่';
    const wifiSpeed = payload.wifiSpeed || 450;
    const maxCapacity = payload.maxCapacity || 30;
    const netPayable = payload.netPayable || 245000;
    const language = payload.language || 'th';
    const engine = payload.engine || 'elevenlabs-hd';

    // Generate script if not provided
    const script =
      payload.script ||
      (language === 'th'
        ? `เรียนฝ่ายบัญชีและผู้บริหาร: ทีมวิศวกรรมได้ฉันทามติเลือก ${destinationTitle} ณ ${city} สำหรับ Offsite ไตรมาส 3 ยอดรวมสุทธิ ${netPayable.toLocaleString()} บาท รวม VAT 7% และหัก ณ ที่จ่าย 3% เรียบร้อยแล้ว พร้อมห้องประชุม ${maxCapacity} ที่นั่ง และสเปกเน็ต Starlink ${wifiSpeed} Mbps คลิกเพื่ออนุมัติงบได้ทันทีครับ`
        : `Executive and Finance Briefing: The team has reached unanimous consensus on ${destinationTitle} in ${city} for our corporate offsite. Net procurement total is ${netPayable.toLocaleString()} Thai Baht, fully reconciled with 7% VAT and 3% withholding tax. Equipped with ${wifiSpeed} Mbps Starlink connectivity and a ${maxCapacity}-seat executive boardroom. Click to approve budget instantly.`);

    const elevenLabsApiKey =
      process.env.ELEVENLABS_API_KEY ||
      process.env.VITE_ELEVENLABS_API_KEY ||
      '';

    const googleTtsApiKey =
      process.env.GOOGLE_TTS_API_KEY ||
      process.env.VITE_GOOGLE_TTS_API_KEY ||
      '';

    // 1. ElevenLabs High-Fidelity Studio Tier (Lively, Warm, Human Inflection)
    if (engine === 'elevenlabs-hd' && elevenLabsApiKey && elevenLabsApiKey !== 'your_elevenlabs_key_here') {
      const REQUESTED_THAI_VOICE = '7XW5JhaNn90bnFojQ5DA'; // Mali - Natural & Clear Thai (https://elevenlabs.io/voices/7XW5JhaNn90bnFojQ5DA)
      const VERIFIED_THAI_VOICE = 'MYZYcGOqrkYQcwDunXl7';  // Hammy - Natural & Warm Thai Female
      const DEFAULT_EN_VOICE = 'TX3LPaxmHKxFdv7VOQHJ';

      const requestedVoice = payload.voiceId || (language === 'th' ? REQUESTED_THAI_VOICE : DEFAULT_EN_VOICE);
      const candidates = [requestedVoice];
      if (language === 'th' && !candidates.includes(VERIFIED_THAI_VOICE)) {
        candidates.push(VERIFIED_THAI_VOICE);
      }

      for (const candidateId of candidates) {
        try {
          const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${candidateId}`, {
            method: 'POST',
            headers: {
              'xi-api-key': elevenLabsApiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
            },
            body: JSON.stringify({
              text: script,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.35,
                similarity_boost: 0.85,
                style: 0.45,
                use_speaker_boost: true,
              },
            }),
          });

          if (elResponse.ok) {
            const buffer = await elResponse.arrayBuffer();
            const base64Audio = Buffer.from(buffer).toString('base64');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                engine: 'elevenlabs-hd',
                voiceId: candidateId,
                language,
                script,
                mimeType: 'audio/mpeg',
                audioContent: base64Audio,
              })
            );
            return;
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    // 2. Google Cloud Text-to-Speech Primary Tier
    if (engine === 'google-cloud-tts' && googleTtsApiKey) {
      const voiceName = language === 'th' ? 'th-TH-Neural2-C' : 'en-US-Journey-F';
      const languageCode = language === 'th' ? 'th-TH' : 'en-US';

      const gcpResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: script },
            voice: { languageCode, name: voiceName },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.05 },
          }),
        }
      );

      if (gcpResponse.ok) {
        const data = (await gcpResponse.json()) as { audioContent?: string };
        if (data.audioContent) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              engine: 'google-cloud-tts',
              language,
              script,
              mimeType: 'audio/mp3',
              audioContent: data.audioContent,
            })
          );
          return;
        }
      }
    }

    // 3. Deterministic Zero-Fail Fallback (Demo Resilience Mode)
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: message }));
  }
}
