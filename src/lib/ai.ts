import type { TravelDestination } from './travelDestinations';
import { CURATED_DESTINATIONS, getFallbackDestinations } from './travelDestinations';

export type AiModelChoice = 'gemini-2.5-flash' | 'deepseek-v3' | 'gpt-4o-mini' | 'claude-3-5-haiku';

const AI_MODEL_STORAGE_KEY = 'trippick_ai_model';

export function getSelectedAiModel(): AiModelChoice {
  const stored = localStorage.getItem(AI_MODEL_STORAGE_KEY) as AiModelChoice;
  if (stored) return stored;
  return 'gemini-2.5-flash';
}

export function setSelectedAiModel(model: AiModelChoice): void {
  localStorage.setItem(AI_MODEL_STORAGE_KEY, model);
}

export interface RoomContextInfo {
  roomCode: string;
  roomStatus: string;
  users: { id: string; user_name: string; platforms?: string[] }[];
  currentUser?: { id: string; user_name: string };
  currentDestination?: TravelDestination | null;
  matchedDestination?: TravelDestination | null;
  vibe?: string;
  progress: {
    swipedCount: number;
    totalCount: number;
    isWaitingForOthers: boolean;
  };
}

export interface AiRecommendationInput {
  title: string;
  city: string;
  country: string;
  ai_reason: string;
}

export async function fetchAiRecommendations(
  amenities: string[],
  vibe: string,
  minBudget?: number,
  maxBudget?: number
): Promise<TravelDestination[]> {
  const openRouterKey = localStorage.getItem('trippick_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';

  // If key is missing, use rich curated destination fallback engine
  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return getFallbackDestinations(vibe, minBudget, maxBudget);
  }

  try {
    const systemPrompt = `You are an elite B2B Travel Concierge & Corporate Retreat Architect.
Recommend high-performing retreats and business tourism destinations tailored to the requested vibe and amenities.
Return ONLY a valid JSON array of objects with fields:
- "title": (string) Property name
- "city": (string) City
- "country": (string) Country
- "ai_reason": (string) Under 90 chars explaining why this venue fits the corporate team offsite vibe.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TripPick',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Vibe: ${vibe}, Amenities: ${amenities.join(', ')}` },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) throw new Error(`AI API error ${response.status}`);
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with fallback visual details
      return parsed.map((item: any, idx: number) => {
        const fallback = CURATED_DESTINATIONS[idx % CURATED_DESTINATIONS.length];
        return {
          ...fallback,
          id: 500 + idx,
          title: item.title || fallback.title,
          city: item.city || fallback.city,
          country: item.country || fallback.country,
          ai_reason: item.ai_reason || fallback.ai_reason,
        };
      });
    }
  } catch (err) {
    console.warn('AI recommendation fetch error, using curated catalog:', err);
  }

  return getFallbackDestinations(vibe, minBudget, maxBudget);
}

// Local Fallback heuristic AI Chat response
function generateLocalConciergeResponse(userMessage: string, context: RoomContextInfo): string {
  const msg = userMessage.toLowerCase();
  const dest = context.currentDestination || context.matchedDestination;
  const teamCount = context.users.length || 1;

  if (msg.includes('wifi') || msg.includes('internet') || msg.includes('speed')) {
    if (dest) {
      return `📶 **Connectivity Telemetry**: ${dest.title} provides **${dest.wifi_speed_mbps} Mbps** enterprise connectivity (Starlink & dedicated fiber fallback). Perfect for simultaneous Zoom calls and GitHub code pushes for your team of ${teamCount}!`;
    }
    return `📶 All TripPick curated retreats guarantee verified 300+ Mbps business-grade fiber or Starlink connections.`;
  }

  if (msg.includes('cost') || msg.includes('price') || msg.includes('budget') || msg.includes('money') || msg.includes('per person')) {
    if (dest) {
      const perNight = dest.price_per_night;
      const perHead = dest.price_per_person;
      const commission = Math.round(perNight * (dest.commission_percentage / 100));
      return `💰 **Financial Breakdown**: 
- Rate: **$${perHead}/night per person** ($${perNight}/night for full private villa).
- Estimated 3-night offsite for ${teamCount} people: **$${perHead * teamCount * 3} USD**.
- **TripPick B2B Affiliate Commission Generated**: **$${commission * 3} USD** (Make Me Money model in action!)`;
    }
    return `💰 Rates range from $110 to $240/person/night with an average 12% B2B commission fee collected via partner OTA APIs.`;
  }

  if (msg.includes('meeting') || msg.includes('boardroom') || msg.includes('work') || msg.includes('conference')) {
    if (dest) {
      return `🖥️ **Work Facilities**: ${dest.title} features dedicated executive meeting salons, 4K laser projectors, and ergonomic seating. Capacity comfortably accommodates up to **${dest.max_capacity} attendees**.`;
    }
    return `🖥️ All venues in this deck are vetted for dedicated boardroom facilities and team breakout areas.`;
  }

  if (msg.includes('who') || msg.includes('team') || msg.includes('lobby') || msg.includes('people')) {
    const names = context.users.map(u => u.user_name).join(', ') || 'Only you so far';
    return `👥 Currently in room **${context.roomCode}**: **${names}** (${teamCount} total). Ready to find group consensus!`;
  }

  if (msg.includes('activity') || msg.includes('fun') || msg.includes('adventure') || msg.includes('tourism')) {
    if (dest) {
      return `🌴 **Team Experiences at ${dest.city}**:
${dest.tourism_highlights.map(h => `• ${h}`).join('\n')}
All packages can be booked together with one-click group billing!`;
    }
  }

  // Default intelligent assistant reply
  if (dest) {
    return `🏨 **Concierge Intelligence for ${dest.title}**:
${dest.ai_reason}
- **Location**: ${dest.city}, ${dest.country} (★ ${dest.rating} / 5)
- **Top Amenities**: ${dest.business_amenities.slice(0, 3).join(', ')}
Swipe right to vote, or ask me about flights, catering, or boardroom setup!`;
  }

  return `👋 Hello! I'm your **TripPick AI Concierge**. I can analyze venue telemetry, compute per-person budgets, verify WiFi bandwidth, and suggest team-building tours. What would you like to know?`;
}

export async function fetchAiChatResponse(
  userMessage: string,
  context: RoomContextInfo,
  _history: { sender: string; text: string }[] = []
): Promise<string> {
  const openRouterKey = localStorage.getItem('trippick_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';

  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return generateLocalConciergeResponse(userMessage, context);
  }

  const dest = context.currentDestination || context.matchedDestination;
  const systemPrompt = `You are the TripPick AI Concierge, a witty, world-class executive travel director and business tourism specialist.
Current Telemetry:
- Room Code: ${context.roomCode}
- Active Destination on Screen: ${dest ? `${dest.title} in ${dest.city}, ${dest.country} ($${dest.price_per_person}/head/night, ${dest.wifi_speed_mbps} Mbps WiFi, Amenities: ${dest.business_amenities.join(', ')})` : 'Browsing'}
- Group Members: ${context.users.map(u => u.user_name).join(', ')}
- Goal: Help teams reach consensus on corporate offsites, bleisure trips, and group tourism that drives real ROI. Keep answers concise, helpful, and energetic (under 120 words).`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TripPick',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || generateLocalConciergeResponse(userMessage, context);
  } catch (err) {
    console.warn('AI chat error, using local concierge engine:', err);
    return generateLocalConciergeResponse(userMessage, context);
  }
}

export async function fetchAiCommentary(type: 'join' | 'match', entityName: string): Promise<string> {
  if (type === 'join') {
    const joinQuotes = [
      `💼 ${entityName} just walked into the boardroom lobby. Bring your coffee and pitch ideas!`,
      `✈️ Boarding pass verified for ${entityName}! Let's find your company's next dream retreat.`,
      `🌴 ${entityName} joined the room. Let's see if their taste leans towards beachfront villas or mountain hackathons!`,
    ];
    return joinQuotes[Math.floor(Math.random() * joinQuotes.length)];
  } else {
    const matchQuotes = [
      `🎉 CONSENSUS REACHED! The team has matched on ${entityName}. Packing bags immediately!`,
      `🚀 Boom! Group agreement unlocked on ${entityName}. Zero meetings wasted, 100% team excitement.`,
      `🥂 It's official: ${entityName} is the winner. Time to finalize the booking and book flights!`,
    ];
    return matchQuotes[Math.floor(Math.random() * matchQuotes.length)];
  }
}
