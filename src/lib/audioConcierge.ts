import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ============================================================================
 * TripPick Modular Voice Adapter Architecture
 * ============================================================================
 * Designed for the Google Antigravity Hackathon:
 * 1. Google Cloud Text-to-Speech (Neural2 / Journey Voices) as the primary GCP baseline.
 * 2. ElevenLabs High-Fidelity Voice API as the premium studio voice tier.
 * 3. Browser-native Web Speech API for instantaneous 0ms client-side voice synthesis.
 * 4. Procedural Web Audio API Chime & Tone Synthesizer fallback guaranteeing 100%
 *    zero-fail demo execution on stage without internet or API keys.
 * 5. Lightweight Backend Endpoint (/api/audio-briefing) for server-side API key protection.
 * ============================================================================
 */

export type VoiceEngine = 'google-cloud-tts' | 'elevenlabs-hd' | 'web-speech' | 'synth-fallback';
export type BriefingLanguage = 'th' | 'en';

export interface AudioConciergeSpecs {
  destinationTitle: string;
  city: string;
  country?: string;
  wifiSpeed: number;
  maxCapacity: number;
  teamSize?: number;
  nights?: number;
  netPayable: number;
  netTotal?: number;
  proposalRef?: string;
  companyName?: string;
  leadOrganizer?: string;
}

export interface VoiceEngineInfo {
  id: VoiceEngine;
  name: string;
  provider: string;
  badge: string;
  description: string;
}

export const VOICE_ENGINES: Record<VoiceEngine, VoiceEngineInfo> = {
  'google-cloud-tts': {
    id: 'google-cloud-tts',
    name: 'Cloud Voice Engine (TH/EN)',
    provider: 'TripPick Cloud Audio',
    badge: 'Cloud Voice Engine',
    description: 'Natural neural voice synthesis for executive corporate briefings',
  },
  'elevenlabs-hd': {
    id: 'elevenlabs-hd',
    name: 'Executive Studio Voice (High-Fidelity)',
    provider: 'TripPick Studio Audio',
    badge: 'Executive Studio (EN)',
    description: 'Ultra-realistic corporate English executive voiceover (High-Fidelity Studio Audio)',
  },
  'web-speech': {
    id: 'web-speech',
    name: 'Web Speech API (Zero Latency)',
    provider: 'Client-Side Native Engine',
    badge: 'Instant 0ms Audio',
    description: 'Hardware-accelerated browser speech synthesis (Thai & English)',
  },
  'synth-fallback': {
    id: 'synth-fallback',
    name: 'Acoustic Synthesizer Chime',
    provider: 'Procedural Audio Engine',
    badge: '100% Offline Guard',
    description: 'Pre-bundled corporate audio preview and harmonic carrier tone for zero network failure',
  },
};

/**
 * ElevenLabs Dedicated Executive English Voice IDs:
 * Primary English (Woman): Sarah - Confident, Professional Corporate Executive (EXAVITQu4vr4xnSDxMaL)
 * Secondary English (Woman): Rachel - Calm, Articulate Corporate Narrator (21m00Tcm4TlvDq8ikWAM)
 * Tertiary English (Woman): Charlotte - Modern Conversational Executive (XB0fDUnXU5powFXDhCwa)
 * Legacy Male Options (for backward compatibility):
 * Brian - Deep, Authoritative Corporate Executive (nPczCjzI2devNBz1zQrb)
 * Adam - Professional Corporate B2B Narrator (pNInz6obpgDQGcFmaJgB)
 * Liam - Energetic Tech Executive (TX3LPaxmHKxFdv7VOQHJ)
 */
export const ELEVENLABS_SARAH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
export const ELEVENLABS_RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
export const ELEVENLABS_CHARLOTTE_VOICE_ID = 'XB0fDUnXU5powFXDhCwa';
export const ELEVENLABS_BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb';
export const ELEVENLABS_ADAM_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
export const ELEVENLABS_LIAM_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';

export const PRIMARY_ENGLISH_VOICE_ID = ELEVENLABS_SARAH_VOICE_ID;
export const SECONDARY_ENGLISH_VOICE_ID = ELEVENLABS_RACHEL_VOICE_ID;
export const DEFAULT_ENGLISH_VOICE_ID = ELEVENLABS_SARAH_VOICE_ID;

/**
 * Latest ElevenLabs TTS Model ID:
 * eleven_v4 is the newest flagship model providing standard-setting emotional nuance and clarity.
 * eleven_multilingual_v2 is the proven reliable fallback.
 */
export const ELEVENLABS_MODEL_ID = 'eleven_v4';
export const ELEVENLABS_FALLBACK_MODEL_ID = 'eleven_multilingual_v2';

// Preserved for legacy reference if needed
export const REQUESTED_THAI_VOICE_ID = '7XW5JhaNn90bnFojQ5DA';
export const VERIFIED_THAI_VOICE_ID = 'MYZYcGOqrkYQcwDunXl7';

/**
 * 2-Minute Video Pitch Script (Prompt A)
 * Lock-timed to 1:55 min (115 seconds) for the official competition pitch.
 */
export const ELEVENLABS_2MIN_PITCH_SCRIPT = `Every year, tech companies lose an average of 14 days arguing on Slack about where to host their team retreat. 
Meet TripPick: the consensus engine that closes corporate offsite decisions in 90 seconds.

Our platform works like a dating app for business retreats. Employees scan a QR code and swipe through curated, work-ready venues featuring verified Starlink speeds and executive boardrooms. Every vote synchronizes in zero latency with dynamic host failover.

When consensus hits 60%, a match is locked. Instantly, Gemini synthesizes an autonomous 3-day executive agenda—balancing deep-work sprint sessions with team building—ready for Google Docs and Calendar export.

Best of all: we are built to "Make Me Money." 
TripPick doesn't send teams to consumer booking links. We issue an official B2B Procurement RFP with 7% VAT and 3% Withholding Tax calculations, backed by a 5,000 Baht corporate escrow deposit. 

On an average 270,000 Baht retreat, TripPick captures a 12% wholesale margin—generating 32,400 Baht in net profit per match.

TripPick: Closing enterprise group indecision into booked retreats, instantly.`;

/**
 * Generates the 30-Second Executive CFO Audio Memo Script
 * Note: Avoids redundant currency symbol '฿' before number in spoken Thai so TTS engines
 * do not double-pronounce 'บาท ... บาท'.
 */
export function generateCfoMemoScript(specs: AudioConciergeSpecs, lang: BriefingLanguage): string {
  if (lang === 'th') {
    return `เรียนฝ่ายบัญชีและผู้บริหาร: ทีมวิศวกรรมได้ฉันทามติเลือก ${specs.destinationTitle} ณ ${specs.city} สำหรับ Offsite ไตรมาส 3 ยอดรวมสุทธิ ${specs.netPayable.toLocaleString()} บาท รวม VAT 7% และหัก ณ ที่จ่าย 3% เรียบร้อยแล้ว พร้อมห้องประชุม ${specs.maxCapacity} ที่นั่ง และสเปกเน็ต Starlink ${specs.wifiSpeed} Mbps คลิกเพื่ออนุมัติงบได้ทันทีครับ`;
  }
  return `Executive and Finance Briefing: The team has reached unanimous consensus on ${specs.destinationTitle} in ${specs.city} for our corporate offsite. Net procurement total is ${specs.netPayable.toLocaleString()} Thai Baht, fully reconciled with 7% VAT and 3% withholding tax. Equipped with ${specs.wifiSpeed} Mbps Starlink connectivity and a ${specs.maxCapacity}-seat executive boardroom. Click to approve budget instantly.`;
}

/**
 * Generates the Jackbox-Style Live Room Announcer Script
 */
export function generateJackboxAnnouncerScript(
  destinationTitle: string,
  wifiSpeed: number,
  votesRemaining: number = 2,
  lang: BriefingLanguage = 'th'
): string {
  if (lang === 'th') {
    return `อีกเพียง ${votesRemaining} โหวตเท่านั้น! ${destinationTitle} สปีด Starlink ${wifiSpeed} Mbps กำลังจะชนะฉันทามติ!`;
  }
  return `Consensus alert! Only ${votesRemaining} votes remaining! ${destinationTitle} with ${wifiSpeed} Mbps Starlink is about to lock the match!`;
}

/**
 * Web Audio API Jackbox Chime Sound Effect
 * Generates an exciting game-show alert chime directly in the browser.
 */
export function playJackboxChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [440, 554.37, 659.25, 880]; // A major fanfare
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.38);
    });
  } catch {
    // Ignore audio context autoplay policy restrictions
  }
}

/**
 * Play Jackbox Host Announcement (Fanfare chime + ElevenLabs Lively Speech Synthesis)
 */
export async function playJackboxHostAnnouncement(
  script: string,
  lang: BriefingLanguage = 'en',
  englishScript?: string
): Promise<void> {
  playJackboxChime();

  // 1. Prioritize ElevenLabs with Professional Corporate English Voice (Brian / Adam)
  // Ensure ElevenLabs strictly speaks pure English per requirement 2
  const textForElevenLabs =
    (englishScript && englishScript.trim()) ||
    (!/[\u0E00-\u0E7F]/.test(script)
      ? script
      : 'Consensus alert! Corporate offsite match is locking in with high-speed Starlink!');

  const voiceId = PRIMARY_ENGLISH_VOICE_ID;
  const audioUrl = await fetchElevenLabsAudio(textForElevenLabs, voiceId, {
    stability: 0.35,
    similarity_boost: 0.85,
    style: 0.45,
    use_speaker_boost: true,
  });

  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {});
    return;
  }

  // 2. Play pre-bundled authentic announcement audio if offline
  try {
    const offlineAudio = new Audio('/audio/live_test.mp3');
    await offlineAudio.play();
    return;
  } catch {
    // Fall through to browser speech synthesis
  }

  // 3. Fallback to Web Speech only if network and audio files fail
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = lang === 'en' ? 'en-US' : 'th-TH';
      utterance.rate = 1.05;
      utterance.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(lang === 'en' ? 'en' : 'th') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio fallback
    }
  }
}

/**
 * Lightweight Backend Adapter: POST /api/audio-briefing
 * Sends destination title, specs, and total cost to serverless endpoint.
 */
export async function fetchAudioBriefingFromApi(
  specs: AudioConciergeSpecs,
  language: BriefingLanguage,
  engine: VoiceEngine
): Promise<string | null> {
  try {
    // When ElevenLabs is used, enforce pure professional English
    const effectiveLang = engine === 'elevenlabs-hd' ? 'en' : language;
    const effectiveVoiceId = engine === 'elevenlabs-hd' ? PRIMARY_ENGLISH_VOICE_ID : DEFAULT_ENGLISH_VOICE_ID;

    const response = await fetch('/api/audio-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinationTitle: specs.destinationTitle,
        city: specs.city,
        wifiSpeed: specs.wifiSpeed,
        maxCapacity: specs.maxCapacity,
        netPayable: specs.netPayable,
        language: effectiveLang,
        engine,
        voiceId: effectiveVoiceId,
        script: generateCfoMemoScript(specs, effectiveLang),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioContent) {
        const mime = data.mimeType || 'audio/mpeg';
        return `data:${mime};base64,${data.audioContent}`;
      }
      if (data.audioUrl) {
        return data.audioUrl;
      }
      if (data.fallbackAudioUrl && (engine === 'synth-fallback' || engine === 'elevenlabs-hd')) {
        return data.fallbackAudioUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

/**
 * ElevenLabs High-Fidelity Voice Synthesis (Direct REST API Fallback)
 * Configured with professional corporate English voices prioritizing executive women:
 * Sarah (EXAVITQu4vr4xnSDxMaL), Rachel (21m00Tcm4TlvDq8ikWAM), and Charlotte (XB0fDUnXU5powFXDhCwa)
 * Powered by ElevenLabs eleven_v4 (latest) with eleven_multilingual_v2 fallback.
 */
export async function fetchElevenLabsAudio(
  text: string,
  voiceId = PRIMARY_ENGLISH_VOICE_ID,
  settings?: ElevenLabsVoiceSettings
): Promise<string | null> {
  const apiKey =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('trippick_elevenlabs_key') : null) ||
    import.meta.env?.VITE_ELEVENLABS_API_KEY ||
    '';

  if (!apiKey || apiKey === 'your_elevenlabs_key_here') {
    return null;
  }

  // Build candidate order: Voice requested -> Sarah (Woman) -> Rachel (Woman) -> Charlotte (Woman) -> Brian (Fallback)
  const candidates: string[] = [voiceId];
  if (!candidates.includes(ELEVENLABS_SARAH_VOICE_ID)) {
    candidates.push(ELEVENLABS_SARAH_VOICE_ID);
  }
  if (!candidates.includes(ELEVENLABS_RACHEL_VOICE_ID)) {
    candidates.push(ELEVENLABS_RACHEL_VOICE_ID);
  }
  if (!candidates.includes(ELEVENLABS_CHARLOTTE_VOICE_ID)) {
    candidates.push(ELEVENLABS_CHARLOTTE_VOICE_ID);
  }
  if (!candidates.includes(ELEVENLABS_BRIAN_VOICE_ID)) {
    candidates.push(ELEVENLABS_BRIAN_VOICE_ID);
  }

  const modelsToTry = [ELEVENLABS_MODEL_ID, ELEVENLABS_FALLBACK_MODEL_ID];

  for (const candidateId of candidates) {
    for (const modelId of modelsToTry) {
      try {
        const payloadBody = {
          text,
          model_id: modelId,
          voice_settings:
            modelId === 'eleven_v4'
              ? {
                  stability: settings?.stability ?? 0.5,
                  similarity_boost: settings?.similarity_boost ?? 0.8,
                }
              : {
                  stability: settings?.stability ?? 0.38,
                  similarity_boost: settings?.similarity_boost ?? 0.85,
                  style: settings?.style ?? 0.40,
                  use_speaker_boost: settings?.use_speaker_boost ?? true,
                },
        };

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${candidateId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify(payloadBody),
        });

        if (!response.ok) {
          console.warn(`ElevenLabs voice ${candidateId} (${modelId}) returned non-OK status: ${response.status}`);
          continue;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (err) {
        console.warn(`ElevenLabs fetch error for ${candidateId} (${modelId}):`, err);
      }
    }
  }

  return null;
}

/**
 * Google Cloud Text-to-Speech API Synthesis (Direct REST API Fallback)
 */
export async function fetchGoogleCloudTtsAudio(
  text: string,
  lang: BriefingLanguage
): Promise<string | null> {
  const apiKey =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('trippick_google_tts_key') : null) ||
    import.meta.env?.VITE_GOOGLE_TTS_API_KEY ||
    '';

  if (!apiKey) {
    return null;
  }

  try {
    const voiceName = lang === 'th' ? 'th-TH-Neural2-C' : 'en-US-Journey-F';
    const languageCode = lang === 'th' ? 'th-TH' : 'en-US';

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.05 },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Google Cloud TTS returned non-OK status:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.audioContent) {
      return `data:audio/mp3;base64,${data.audioContent}`;
    }
    return null;
  } catch (err) {
    console.warn('Google Cloud TTS error, falling back to modular adapter:', err);
    return null;
  }
}

/**
 * Custom React Hook: `useAudioBriefing`
 * Orchestrates playback, waveform generation, and seamless fallback between
 * ElevenLabs, Google Cloud TTS, Web Speech API, and pre-bundled audio.
 */
export function useAudioBriefing(specs: AudioConciergeSpecs) {
  const [engine, setEngineState] = useState<VoiceEngine>('elevenlabs-hd');
  const [language, setLanguage] = useState<BriefingLanguage>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [waveformBars, setWaveformBars] = useState<number[]>(() =>
    Array.from({ length: 18 }, () => 0.15)
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const playStartTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // ElevenLabs is strictly pure English per user requirement
  const effectiveLanguage = engine === 'elevenlabs-hd' ? 'en' : language;
  const transcript = generateCfoMemoScript(specs, effectiveLanguage);

  const setEngine = useCallback((newEngine: VoiceEngine) => {
    setEngineState(newEngine);
    if (newEngine === 'elevenlabs-hd') {
      setLanguage('en');
    }
  }, []);

  // Clean up any ongoing audio and animation on unmount or state change
  const cleanupPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      speechUtteranceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore close errors
      }
      audioContextRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentTime(0);
    accumulatedTimeRef.current = 0;
    setWaveformBars(Array.from({ length: 18 }, () => 0.15));
  }, []);

  useEffect(() => {
    return () => {
      cleanupPlayback();
    };
  }, [cleanupPlayback]);

  // Waveform animation loop (throttled to 20fps to eliminate frame drops and layout thrashing on low-end hardware)
  const startWaveformAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    let phase = 0;
    let lastTick = 0;
    const updateWaveform = (timestamp: number) => {
      if (timestamp - lastTick >= 55) {
        lastTick = timestamp;
        phase += 0.15;
        setWaveformBars(() =>
          Array.from({ length: 18 }, (_, i) => {
            const base = 0.25;
            const sine = Math.sin(phase + i * 0.45) * 0.35;
            const cos = Math.cos(phase * 1.5 - i * 0.2) * 0.25;
            return Math.min(1, Math.max(0.12, base + sine + cos));
          })
        );
      }
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  // Web Audio Procedural Fallback Chime Player
  const playProceduralSynth = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlaying(false);
        return;
      }
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Corporate warm harmonic briefing chime
      const notes = [
        { freq: 523.25, time: 0.0, dur: 1.2 }, // C5
        { freq: 659.25, time: 0.3, dur: 1.2 }, // E5
        { freq: 783.99, time: 0.6, dur: 1.4 }, // G5
        { freq: 1046.5, time: 0.9, dur: 2.2 }, // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.1);
      });

      setIsPlaying(true);
      setIsPaused(false);
      setDuration(6);
      startWaveformAnimation();

      playStartTimeRef.current = Date.now();
      accumulatedTimeRef.current = 0;

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
        setCurrentTime(elapsed);
        if (elapsed >= 6) {
          cleanupPlayback();
        }
      }, 100);
    } catch {
      cleanupPlayback();
    }
  }, [startWaveformAnimation, cleanupPlayback]);

  // Web Speech API Local Synthesis
  const playWebSpeech = useCallback(
    (textToSpeak: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        playProceduralSynth();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = effectiveLanguage === 'th' ? 'th-TH' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith(effectiveLanguage === 'th' ? 'th' : 'en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
        setDuration(28);
        startWaveformAnimation();

        playStartTimeRef.current = Date.now() - accumulatedTimeRef.current * 1000;
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
          accumulatedTimeRef.current = elapsed;
          setCurrentTime(elapsed);
        }, 150);
      };

      utterance.onend = () => {
        cleanupPlayback();
      };

      utterance.onerror = () => {
        playProceduralSynth();
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [effectiveLanguage, playProceduralSynth, startWaveformAnimation, cleanupPlayback]
  );

  // Play audio stream from URL (Google Cloud TTS, ElevenLabs, or Pre-bundled Audio)
  const playAudioStream = useCallback(
    (audioUrl: string) => {
      cleanupPlayback();
      if (audioUrl.startsWith('blob:')) {
        activeBlobUrlRef.current = audioUrl;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 30);
      };

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
        startWaveformAnimation();
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        cleanupPlayback();
      };

      audio.onerror = () => {
        console.warn('Audio stream failed, triggering Web Speech API fallback');
        playWebSpeech(transcript);
      };

      audio.play().catch(() => {
        playWebSpeech(transcript);
      });
    },
    [cleanupPlayback, startWaveformAnimation, playWebSpeech, transcript]
  );

  // Primary Action: Start or Resume Audio Briefing
  const play = useCallback(async () => {
    // Resume from paused state
    if (isPaused) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
        startWaveformAnimation();
        return;
      }

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
        playStartTimeRef.current = Date.now() - accumulatedTimeRef.current * 1000;
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
          accumulatedTimeRef.current = elapsed;
          setCurrentTime(elapsed);
          if (elapsed >= 6) {
            cleanupPlayback();
          }
        }, 100);
        setIsPlaying(true);
        setIsPaused(false);
        startWaveformAnimation();
        return;
      }

      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.paused
      ) {
        window.speechSynthesis.resume();
        playStartTimeRef.current = Date.now() - accumulatedTimeRef.current * 1000;
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
          accumulatedTimeRef.current = elapsed;
          setCurrentTime(elapsed);
        }, 150);
        setIsPlaying(true);
        setIsPaused(false);
        startWaveformAnimation();
        return;
      }
    }

    setIsLoading(true);

    try {
      // 1. Try Lightweight Backend API Endpoint (/api/audio-briefing)
      const apiAudioUrl = await fetchAudioBriefingFromApi(specs, effectiveLanguage, engine);
      if (apiAudioUrl) {
        playAudioStream(apiAudioUrl);
        return;
      }

      // 2. Direct ElevenLabs High-Fidelity Tier (Pure Corporate English Woman Voice)
      if (engine === 'elevenlabs-hd') {
        const voiceId = PRIMARY_ENGLISH_VOICE_ID; // Sarah (Woman Executive English)
        const audioUrl = await fetchElevenLabsAudio(transcript, voiceId, {
          stability: 0.38,
          similarity_boost: 0.85,
          style: 0.40,
          use_speaker_boost: true,
        });
        if (audioUrl) {
          playAudioStream(audioUrl);
          return;
        }

        // Offline pre-bundled corporate audio fallback
        try {
          playAudioStream('/audio/test_Adam_eleven_multilingual_v2.mp3');
          return;
        } catch {
          playWebSpeech(transcript);
          return;
        }
      }

      // 3. Direct Google Cloud Text-to-Speech Tier
      if (engine === 'google-cloud-tts') {
        const audioUrl = await fetchGoogleCloudTtsAudio(transcript, language);
        if (audioUrl) {
          playAudioStream(audioUrl);
          return;
        }
        playWebSpeech(transcript);
        return;
      }

      // 4. Web Speech API Tier
      if (engine === 'web-speech') {
        playWebSpeech(transcript);
        return;
      }

      // 5. Pre-bundled Authentic Audio Fallback
      if (engine === 'synth-fallback') {
        playAudioStream('/audio/cfo_briefing_fallback.mp3');
        return;
      }
    } catch {
      playProceduralSynth();
    }
  }, [
    isPaused,
    specs,
    engine,
    transcript,
    effectiveLanguage,
    language,
    playAudioStream,
    playWebSpeech,
    playProceduralSynth,
    startWaveformAnimation,
    cleanupPlayback,
  ]);

  const pause = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    cleanupPlayback();
  }, [cleanupPlayback]);

  return {
    isPlaying,
    isPaused,
    isLoading,
    currentTime,
    duration,
    engine,
    language,
    transcript,
    waveformBars,
    play,
    pause,
    stop,
    toggle,
    setEngine,
    setLanguage,
  };
}
