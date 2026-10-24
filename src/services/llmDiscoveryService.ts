import { CURATED_RESERVE_CATALOG } from '../lib/reserveCatalog.ts';

export interface VenueDiscoveryQuery {
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
  vibe?: string;
  headcount?: number;
  maxBudgetPerHead?: number;
  minBudgetPerHead?: number;
  excludedPlaceIds?: string[];
  excludedNames?: string[];
  targetCount?: number;
}

export interface RawVenueCandidate {
  search_query: string;
  display_name: string;
  city: string;
  country: string;
  archetype: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
  vibe_summary: string;
  estimated_pax_capacity: number;
  estimated_rate_per_head_thb: number;
  connectivity_specs: string;
  corporate_highlights: string[];
  ai_reason: string;
}

export interface DiscoveryLLMResult {
  candidates: RawVenueCandidate[];
  engine: 'google-gemini-1.5-flash' | 'openrouter-deepseek' | 'curated-reserve-fallback';
  latencyMs: number;
}

/**
 * Validates and normalizes candidate objects parsed from LLM output
 */
function normalizeCandidate(raw: unknown, defaultArchetype: 'coastal' | 'mountain' | 'urban' | 'regional_apac'): RawVenueCandidate | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;

  const displayName = typeof c.display_name === 'string' && c.display_name.trim()
    ? c.display_name.trim()
    : (typeof c.name === 'string' && c.name.trim()
      ? c.name.trim()
      : (typeof c.venueName === 'string' && c.venueName.trim()
        ? c.venueName.trim()
        : (typeof c.hotel_name === 'string' && c.hotel_name.trim()
          ? c.hotel_name.trim()
          : (typeof c.title === 'string' && c.title.trim()
            ? c.title.trim()
            : ''))));
  if (!displayName) return null;

  const city = typeof c.city === 'string' && c.city.trim()
    ? c.city.trim()
    : (typeof c.location === 'string' && c.location.trim()
      ? c.location.trim().split(',')[0].trim()
      : (typeof c.province === 'string' && c.province.trim() ? c.province.trim() : 'ประเทศไทย'));

  const country = typeof c.country === 'string' && c.country.trim()
    ? c.country.trim()
    : (typeof c.location === 'string' && c.location.includes(',')
      ? c.location.split(',').pop()?.trim() || 'ประเทศไทย'
      : 'ประเทศไทย');

  const searchQuery = typeof c.search_query === 'string' && c.search_query.trim()
    ? c.search_query.trim()
    : `${displayName} ${city} ${country}`;

  let archetype = defaultArchetype;
  if (typeof c.archetype === 'string') {
    const a = c.archetype.toLowerCase();
    if (a.includes('mountain')) archetype = 'mountain';
    else if (a.includes('coastal')) archetype = 'coastal';
    else if (a.includes('urban')) archetype = 'urban';
    else if (a.includes('regional')) archetype = 'regional_apac';
  }

  const rawCapacity = c.estimated_pax_capacity ?? c.pax_capacity ?? c.max_capacity ?? c.capacity;
  const capacity = typeof rawCapacity === 'number' && rawCapacity > 0
    ? rawCapacity
    : 30;

  const rawRate = c.estimated_rate_per_head_thb ?? c.rate_per_head ?? c.price_per_person ?? c.rate;
  const rate = typeof rawRate === 'number' && rawRate > 0
    ? rawRate
    : 4500;

  const vibeSummary = typeof c.vibe_summary === 'string' && c.vibe_summary.trim()
    ? c.vibe_summary.trim()
    : (typeof c.description === 'string' && c.description.trim()
      ? c.description.trim()
      : (typeof c.overview === 'string' && c.overview.trim() ? c.overview.trim() : 'รีสอร์ตสัมมนาผู้บริหารระดับพรีเมียม'));

  const rawHighlights = c.corporate_highlights ?? c.highlights ?? c.amenities;
  const highlights = Array.isArray(rawHighlights)
    ? rawHighlights.map(h => String(h).trim()).filter(Boolean).slice(0, 3)
    : ['ห้องประชุมผู้บริหารครบครัน', 'กิจกรรมกระชับมิตรทีม', 'วิวธรรมชาติผ่อนคลาย'];

  const aiReason = typeof c.ai_reason === 'string' && c.ai_reason.trim()
    ? c.ai_reason.trim()
    : (typeof c.reason === 'string' && c.reason.trim()
      ? c.reason.trim()
      : `${displayName} เพียบพร้อมด้วยสิ่งอำนวยความสะดวกสำหรับจัดสัมมนาทีม ${capacity} ท่านอย่างคุ้มค่า`);

  return {
    search_query: searchQuery,
    display_name: displayName,
    city,
    country,
    archetype,
    vibe_summary: vibeSummary,
    estimated_pax_capacity: capacity,
    estimated_rate_per_head_thb: rate,
    connectivity_specs: typeof c.connectivity_specs === 'string' ? c.connectivity_specs : 'Starlink Business 500+ Mbps',
    corporate_highlights: highlights.length > 0 ? highlights : ['ห้องประชุม MICE พร้อมระบบ AV', 'กิจกรรมเอาต์ดอร์กระชับมิตร'],
    ai_reason: aiReason,
  };
}

/**
 * Build system and user prompt for MICE travel discovery
 */
function buildPrompt(query: VenueDiscoveryQuery) {
  const headcount = query.headcount || 15;
  const maxBudget = query.maxBudgetPerHead || 8000;
  const vibe = query.vibe || 'ทั่วไป';
  const archetype = query.archetype || 'coastal';
  const excluded = (query.excludedNames || []).slice(0, 15).join(', ') || 'ไม่มี';

  const system = `You are the Lead B2B MICE Travel Architect & Executive Corporate Retreat Scout.
Your mission is to discover real, highly acclaimed luxury hotels, conference retreats, and executive resorts in Thailand and the APAC region that match the corporate retreat parameters.

CRITICAL REQUIREMENTS:
1. Every recommended hotel MUST be a REAL, physically existing hotel in Thailand or APAC.
2. The hotel's meeting/boardroom facilities MUST comfortably accommodate the team size of ${headcount} attendees.
3. The average rate per person per night MUST NOT exceed ${maxBudget} THB.
4. Exclude any venues in this already-seen list: ${excluded}.
5. You MUST return a strictly valid JSON array of 5 venue candidate objects matching this exact schema:
[
  {
    "search_query": "Official Hotel Name City Thailand",
    "display_name": "Official Hotel Name",
    "city": "City or Province",
    "country": "Thailand",
    "archetype": "${archetype}",
    "vibe_summary": "One-sentence summary highlighting retreat and MICE suitability",
    "estimated_pax_capacity": ${headcount + 15},
    "estimated_rate_per_head_thb": 5000,
    "connectivity_specs": "Starlink Business / Fiber 500+ Mbps",
    "corporate_highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
    "ai_reason": "Specific reason why this venue fits this corporate retreat"
  }
]
Output ONLY raw JSON. No markdown backticks, no conversational text.`;

  const user = `Target Archetype: ${archetype}
Retreat Vibe: ${vibe}
Team Headcount: ${headcount} members
Max Budget Per Head Per Night: ฿${maxBudget.toLocaleString()} THB
Find 5 real corporate retreat venues now.`;

  return { system, user };
}
interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const GEMINI_RESPONSE_SCHEMA = {
  type: 'ARRAY',
  description: 'List of real corporate retreat and MICE venues in Thailand or APAC',
  items: {
    type: 'OBJECT',
    properties: {
      search_query: { type: 'STRING' },
      display_name: { type: 'STRING' },
      city: { type: 'STRING' },
      country: { type: 'STRING' },
      archetype: { type: 'STRING' },
      vibe_summary: { type: 'STRING' },
      estimated_pax_capacity: { type: 'INTEGER' },
      estimated_rate_per_head_thb: { type: 'NUMBER' },
      connectivity_specs: { type: 'STRING' },
      corporate_highlights: { type: 'ARRAY', items: { type: 'STRING' } },
      ai_reason: { type: 'STRING' }
    },
    required: ['display_name', 'city', 'country', 'estimated_rate_per_head_thb', 'estimated_pax_capacity']
  }
};

const OPENROUTER_JSON_SCHEMA = {
  type: 'object',
  properties: {
    venues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          search_query: { type: 'string' },
          display_name: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
          archetype: { type: 'string' },
          vibe_summary: { type: 'string' },
          estimated_pax_capacity: { type: 'number' },
          estimated_rate_per_head_thb: { type: 'number' },
          connectivity_specs: { type: 'string' },
          corporate_highlights: { type: 'array', items: { type: 'string' } },
          ai_reason: { type: 'string' }
        },
        required: ['display_name', 'city', 'country', 'estimated_rate_per_head_thb', 'estimated_pax_capacity']
      }
    }
  },
  required: ['venues']
};

/**
 * Extracts raw list of candidate objects from parsed JSON (array or wrapped in an object)
 */
function extractRawCandidates(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.venues)) return obj.venues;
    if (Array.isArray(obj.candidates)) return obj.candidates;
    if (Array.isArray(obj.destinations)) return obj.destinations;
    if (Array.isArray(obj.hotels)) return obj.hotels;
  }
  return [];
}

/**
 * Engine 1: Google Gemini 1.5 Flash (via direct Gemini API with response_schema or OpenRouter Google AI Studio)
 */
async function tryGoogleGeminiEngine(query: VenueDiscoveryQuery, timeoutMs: number = 3200): Promise<RawVenueCandidate[] | null> {
  const { system, user } = buildPrompt(query);
  const defaultArchetype = query.archetype || 'coastal';

  const directGeminiKey =
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY : '') || '';

  // 1A. Try Direct Google Gemini API with native response_schema (Structured Outputs)
  if (directGeminiKey && !directGeminiKey.includes('placeholder')) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${directGeminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            response_schema: GEMINI_RESPONSE_SCHEMA,
            responseSchema: GEMINI_RESPONSE_SCHEMA,
            temperature: 0.3,
          },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as GeminiApiResponse;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          const rawList = extractRawCandidates(parsed);
          if (rawList.length > 0) {
            const list = rawList.map(p => normalizeCandidate(p, defaultArchetype)).filter(Boolean) as RawVenueCandidate[];
            if (list.length >= 3) return list;
          }
        }
      }
    } catch {
      // Direct Gemini failed or timed out, fallback to OpenRouter Google AI Studio
    }
  }

  // 1B. Try Gemini 1.5/2.5 Flash via OpenRouter (provider Google AI Studio with json_schema)
  const openRouterKey =
    (typeof process !== 'undefined' ? process.env?.VITE_OPENROUTER_API_KEY || process.env?.OPENROUTER_API_KEY : '') ||
    '';

  if (openRouterKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'X-Title': 'TripPick Infinite Discovery Engine (Google Antigravity)',
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'mice_venues',
              strict: true,
              schema: OPENROUTER_JSON_SCHEMA,
            },
          },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as OpenRouterChatResponse;
        const rawContent = data?.choices?.[0]?.message?.content || '';
        const cleanJson = rawContent.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const rawList = extractRawCandidates(parsed);
        if (rawList.length > 0) {
          const list = rawList.map(p => normalizeCandidate(p, defaultArchetype)).filter(Boolean) as RawVenueCandidate[];
          if (list.length >= 3) return list;
        }
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

/**
 * Engine 2: OpenRouter DeepSeek Fallback Engine
 */
async function tryDeepSeekEngine(query: VenueDiscoveryQuery, timeoutMs: number = 1800): Promise<RawVenueCandidate[] | null> {
  const openRouterKey =
    (typeof process !== 'undefined' ? process.env?.VITE_OPENROUTER_API_KEY || process.env?.OPENROUTER_API_KEY : '') ||
    '';

  if (!openRouterKey) return null;
  const { system, user } = buildPrompt(query);
  const defaultArchetype = query.archetype || 'coastal';

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'X-Title': 'TripPick Infinite Discovery Engine',
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as OpenRouterChatResponse;
      const rawContent = data?.choices?.[0]?.message?.content || '';
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const rawList = extractRawCandidates(parsed);
      if (rawList.length > 0) {
        const list = rawList.map(p => normalizeCandidate(p, defaultArchetype)).filter(Boolean) as RawVenueCandidate[];
        if (list.length >= 3) return list;
      }
    }
  } catch {
    // Secondary engine failed
  }

  return null;
}

/**
 * Engine 3: Curated Reserve Catalog Fallback (Guarantees zero-freeze in offline/timeout situations)
 */
function getCuratedReserveCandidates(query: VenueDiscoveryQuery): RawVenueCandidate[] {
  const excludedNames = new Set((query.excludedNames || []).map(n => n.toLowerCase()));
  const defaultArchetype = query.archetype || 'coastal';

  // Filter reserve catalog excluding already-seen venues
  let filtered = CURATED_RESERVE_CATALOG.filter(d => !excludedNames.has(d.title.toLowerCase()));
  if (filtered.length < 3) {
    filtered = CURATED_RESERVE_CATALOG;
  }

  return filtered.slice(0, 5).map(d => ({
    search_query: `${d.title} ${d.city}`,
    display_name: d.title,
    city: d.city,
    country: d.country,
    archetype: d.archetype || defaultArchetype,
    vibe_summary: d.overview,
    estimated_pax_capacity: d.max_capacity,
    estimated_rate_per_head_thb: d.price_per_person,
    connectivity_specs: `Starlink Business ${d.wifi_speed_mbps} Mbps`,
    corporate_highlights: d.tourism_highlights.slice(0, 3),
    ai_reason: d.ai_reason,
  }));
}

/**
 * Orchestrates Modular Multi-LLM Venue Discovery:
 * 1. Primary: Google Gemini 1.5 Flash (Google-native alignment for Antigravity 2.0)
 * 2. Secondary: OpenRouter DeepSeek (Multi-LLM Orchestration resilience)
 * 3. Tertiary: Curated Reserve Catalog (Guaranteed offline / 0-freeze fallback)
 */
export async function discoverVenuesWithLLM(query: VenueDiscoveryQuery): Promise<DiscoveryLLMResult> {
  const startTime = Date.now();
  const maxTotalMs = 3800;

  // Try Engine 1: Google Gemini 1.5 Flash (Primary Default)
  try {
    const geminiCandidates = await tryGoogleGeminiEngine(query, 2500);
    if (geminiCandidates && geminiCandidates.length >= 3) {
      return {
        candidates: geminiCandidates,
        engine: 'google-gemini-1.5-flash',
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err) {
    console.warn('LLM Discovery: Google Gemini 1.5 Flash failed, attempting DeepSeek secondary:', err);
  }

  // Try Engine 2: OpenRouter DeepSeek (Secondary Fallback, only if time remains under 4.0s)
  const remainingBudget = maxTotalMs - (Date.now() - startTime);
  if (remainingBudget > 800) {
    try {
      const deepSeekCandidates = await tryDeepSeekEngine(query, Math.min(1000, remainingBudget));
      if (deepSeekCandidates && deepSeekCandidates.length >= 3) {
        return {
          candidates: deepSeekCandidates,
          engine: 'openrouter-deepseek',
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn('LLM Discovery: DeepSeek secondary failed, falling back to reserve catalog:', err);
    }
  }

  // Try Engine 3: Curated Reserve Catalog (Guaranteed 0-freeze)
  const reserveCandidates = getCuratedReserveCandidates(query);
  return {
    candidates: reserveCandidates,
    engine: 'curated-reserve-fallback',
    latencyMs: Date.now() - startTime,
  };
}
