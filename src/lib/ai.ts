import type { TravelDestination } from './travelDestinations.ts';
import { CURATED_DESTINATIONS, getFallbackDestinations, findCongruentDestination } from './travelDestinations.ts';
import { DESTINATION_LOCALIZATIONS } from './i18n.ts';

// Fixed model per user requirement (neutral branding to customers)
export const FIXED_AI_MODEL = 'deepseek/deepseek-v4.1-flash:1017';
export const FIXED_AI_MODEL_NAME = 'TripPick AI Concierge';

function getOpenRouterApiKey(): string {
  try {
    const fromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('trippick_openrouter_api_key') : null;
    if (fromStorage) return fromStorage;
  } catch {
    // Ignore storage errors in non-browser environments
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) {
      return import.meta.env.VITE_OPENROUTER_API_KEY;
    }
  } catch {
    // Ignore meta errors in non-Vite environments
  }
  return '';
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

export interface StructuredAiRecommendation {
  destination_id?: number;
  title?: string;
  city?: string;
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
  ai_reason: string;
  custom_executive_highlight?: string;
}

/**
 * Strict Type Guard for Structured AI Recommendation Objects
 */
function isValidRecommendationItem(item: unknown): item is StructuredAiRecommendation {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  const hasReason = typeof candidate.ai_reason === 'string' && candidate.ai_reason.trim().length > 0;
  const hasId = typeof candidate.destination_id === 'number';
  const hasTitleOrCity = typeof candidate.title === 'string' || typeof candidate.city === 'string';
  return hasReason && (hasId || hasTitleOrCity);
}

export async function fetchAiRecommendations(
  amenities: string[],
  vibe: string,
  minBudget?: number,
  maxBudget?: number
): Promise<TravelDestination[]> {
  const openRouterKey = getOpenRouterApiKey();

  // If key is missing, use verified curated destination catalog with intelligent ranking
  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return getFallbackDestinations(vibe, minBudget, maxBudget);
  }

  try {
    const verifiedCatalogList = CURATED_DESTINATIONS.map(d =>
      `- [ID: ${d.id}] "${d.title}" (${d.city}, ${d.country}) | สไตล์: ${d.archetype} | สิ่งอำนวยความสะดวก: ${d.business_amenities.slice(0, 3).join(', ')} | ราคา: ฿${d.price_per_person.toLocaleString()}/คน/คืน`
    ).join('\n');

    const systemPrompt = `คุณคือ B2B Travel Concierge & Corporate Retreat Architect ผู้เชี่ยวชาญการคัดเลือกและออกแบบทริปสัมมนาผู้บริหารระดับพรีเมียม
โปรดคัดเลือกและจัดอันดับสถานที่จัดออฟไซต์จาก "รายการสถานที่ที่ผ่านการตรวจสอบแล้ว (Verified Catalog)" ด้านล่างนี้ ให้ตรงกับบรรยากาศ (Vibe), สิ่งอำนวยความสะดวกที่ทีมต้องการ, และงบประมาณอย่างแม่นยำ 100%

รายการสถานที่ที่ผ่านการตรวจสอบแล้ว:
${verifiedCatalogList}

ข้อกำหนดสำคัญมาก:
1. เลือกเฉพาะ ID สถานที่ที่มีอยู่จริงในรายการด้านบน ห้ามสร้างสถานที่จำลองขึ้นมาเอง เพื่อป้องกันข้อมูลรูปภาพและที่ตั้งขัดแย้งกัน
2. ส่งออกเป็น JSON Array ของ Object ตามโครงสร้างนี้เท่านั้น (ห้ามใส่คำอธิบายอื่นนอก JSON):
[
  {
    "destination_id": (number: รหัส ID จากรายการข้างต้น เช่น 101, 102, 109, 110),
    "ai_reason": (string: เหตุผลสั้นๆ กระชับ ไม่เกิน 80 ตัวอักษร ว่าทำไมสถานที่นี้จึงเหมาะกับทีมนี้เป็นพิเศษ)
  }
]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'TripPick',
      },
      body: JSON.stringify({
        model: FIXED_AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `ธีมทริป: ${vibe || 'ทั่วไป'}, สิ่งอำนวยความสะดวกที่ทีมเลือก: ${amenities.length > 0 ? amenities.join(', ') : 'ทุกอย่าง'}, งบประมาณ: ${minBudget || 3000} - ${maxBudget || 10000} บาท/คน/คืน` },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) throw new Error(`AI API error ${response.status}`);
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const cleanJson = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const compiledDeck: TravelDestination[] = [];
      const seenIds = new Set<number>();

      for (const item of parsed) {
        if (!isValidRecommendationItem(item)) continue;

        // Strict Congruence Mapping: Lookup verified destination by ID or semantic match
        const verifiedBase = findCongruentDestination({
          id: item.destination_id,
          city: item.city,
          vibe: vibe || item.title,
          archetype: item.archetype,
        });

        if (verifiedBase && !seenIds.has(verifiedBase.id)) {
          seenIds.add(verifiedBase.id);
          compiledDeck.push({
            ...verifiedBase,
            ai_reason: item.ai_reason.trim() || verifiedBase.ai_reason,
          });
        }
      }

      // If AI returned enough verified destinations, return the compiled deck
      if (compiledDeck.length >= 4) {
        return compiledDeck;
      }

      // If fewer than 4, fill remaining slots with best-matching fallback destinations (avoiding duplicates)
      const fallbacks = getFallbackDestinations(vibe, minBudget, maxBudget);
      for (const fb of fallbacks) {
        if (!seenIds.has(fb.id)) {
          seenIds.add(fb.id);
          compiledDeck.push(fb);
        }
        if (compiledDeck.length >= 6) break;
      }

      return compiledDeck;
    }
  } catch (err) {
    console.warn('AI recommendation fetch error, using strictly congruent curated catalog:', err);
  }

  return getFallbackDestinations(vibe, minBudget, maxBudget);
}

// Local Fallback heuristic AI Chat response in 100% Thai or English
function generateLocalConciergeResponse(
  userMessage: string,
  context: RoomContextInfo,
  lang: 'th' | 'en' = 'th'
): string {
  const msg = userMessage.toLowerCase();
  const dest = context.currentDestination || context.matchedDestination;
  const teamCount = context.users.length || 1;
  const destLoc = dest ? DESTINATION_LOCALIZATIONS[dest.id] : null;

  const title = lang === 'en' && destLoc?.title ? destLoc.title : dest?.title;
  const city = lang === 'en' && destLoc?.city ? destLoc.city : dest?.city;
  const country = lang === 'en' && destLoc?.country ? destLoc.country : dest?.country;
  const reason = lang === 'en' && destLoc?.ai_reason ? destLoc.ai_reason : dest?.ai_reason;

  if (
    msg.includes('wifi') ||
    msg.includes('เน็ต') ||
    msg.includes('อินเทอร์เน็ต') ||
    msg.includes('ความเร็ว') ||
    msg.includes('speed') ||
    msg.includes('connectivity') ||
    msg.includes('sla')
  ) {
    if (lang === 'en') {
      if (dest) {
        return `[WiFi & Connectivity SLA] At ${title}, enterprise-grade connectivity is installed with ${dest.wifi_speed_mbps} Mbps (supporting both Starlink Business and redundant fiber optics). Easily accommodates high-bandwidth Zoom video conferences and synchronized deep-work sessions for all ${teamCount} team members.`;
      }
      return `All TripPick curated venues undergo strict WiFi connectivity verification exceeding 300+ Mbps.`;
    }
    if (dest) {
      return `[ข้อมูลความเร็วเน็ต] ที่ ${dest.title} ติดตั้งอินเทอร์เน็ตระดับองค์กรความเร็ว ${dest.wifi_speed_mbps} Mbps (รองรับทั้ง Starlink และไฟเบอร์ออปติกสำรอง) รองรับการประชุม Zoom และทำงานพร้อมกันของสมาชิก ${teamCount} คนได้อย่างลื่นไหลไร้สะดุดครับ`;
    }
    return `ทุกสถานที่บน TripPick ผ่านการตรวจสอบสัญญาณอินเทอร์เน็ตความเร็วสูง 300+ Mbps ขึ้นไปทั้งหมดครับ`;
  }

  if (
    msg.includes('ราคา') ||
    msg.includes('งบ') ||
    msg.includes('เงิน') ||
    msg.includes('เท่าไหร่') ||
    msg.includes('budget') ||
    msg.includes('cost') ||
    msg.includes('pricing') ||
    msg.includes('rate')
  ) {
    if (dest) {
      const perNight = dest.price_per_night;
      const perHead = dest.price_per_person;
      const subtotal = perHead * teamCount * 3;
      const vat7 = Math.round(subtotal * 0.07);
      const wht3 = Math.round(subtotal * 0.03);
      const netPayable = subtotal + vat7 - wht3;
      if (lang === 'en') {
        return `[Executive Budget Estimate]:
- Average rate: ${perHead.toLocaleString()} THB/person/night (Private venue buyout: ${perNight.toLocaleString()} THB/night)
- Estimated 3-night retreat for ${teamCount} attendees: ${subtotal.toLocaleString()} THB (pre-VAT)
- Net Payable with Tax (7% VAT & 3% WHT): ${netPayable.toLocaleString()} THB (Official B2B RFP ready)`;
      }
      return `[สรุปประมาณการงบประมาณ]:
- ค่าบริการเฉลี่ย: ${perHead.toLocaleString()} บาท/คน/คืน (เหมาวิลล่า ${perNight.toLocaleString()} บาท/คืน)
- ประมาณการทริป 3 คืน สำหรับสมาชิก ${teamCount} คน: ${subtotal.toLocaleString()} บาท (ก่อน VAT)
- ยอดสุทธิรวมภาษี (VAT 7% และหัก ณ ที่จ่าย 3% ท.ป. 4/2528): ${netPayable.toLocaleString()} บาท พร้อมออกใบเสนอราคาทางการ`;
    }
    if (lang === 'en') {
      return `Rates typically range from 3,800 to 8,500 THB/person/night fully compliant with statutory corporate tax regulations.`;
    }
    return `อัตราค่าบริการเริ่มต้นประมาณ 3,800 - 8,500 บาท/คน/คืน พร้อมระบบจัดการภาษีหัก ณ ที่จ่าย 3% และ VAT 7% สำหรับองค์กรครับ`;
  }

  if (
    msg.includes('ห้องประชุม') ||
    msg.includes('ประชุม') ||
    msg.includes('ทำงาน') ||
    msg.includes('boardroom') ||
    msg.includes('meeting') ||
    msg.includes('specs') ||
    msg.includes('audio-visual')
  ) {
    if (dest) {
      if (lang === 'en') {
        return `[Workplace & Meeting Readiness] ${title} features an executive boardroom equipped with 4K projection and premium AV audio systems, accommodating up to ${dest.max_capacity} attendees alongside private breakout brainstorm hubs.`;
      }
      return `[ความพร้อมด้านพื้นที่ทำงาน] ที่ ${dest.title} มีห้องประชุมบอร์ดบริหารพร้อมจอโปรเจกเตอร์ 4K และระบบเสียงระดับพรีเมียม รองรับผู้เข้าร่วมประชุมได้สูงสุด ${dest.max_capacity} ท่าน พร้อมโซนระดมสมองส่วนตัวครับ`;
    }
    if (lang === 'en') {
      return `All curated venues feature enterprise boardrooms and collaborative team workspaces.`;
    }
    return `ทุกสถานที่ในระบบได้รับการคัดเลือกให้มีห้องประชุมและพื้นที่ทำงานร่วมกันของทีมครบครันครับ`;
  }

  if (
    msg.includes('ใคร') ||
    msg.includes('คน') ||
    msg.includes('ทีม') ||
    msg.includes('สมาชิก') ||
    msg.includes('who') ||
    msg.includes('member') ||
    msg.includes('attendee')
  ) {
    if (lang === 'en') {
      const names = context.users.map((u) => u.user_name).join(', ') || 'Only you are currently online';
      return `Currently in war room ${context.roomCode}, active online members: ${names} (${teamCount} total) ready for consensus voting.`;
    }
    const names = context.users.map((u) => u.user_name).join(', ') || 'มีคุณเพียงคนเดียวในขณะนี้';
    return `ขณะนี้ในห้อง ${context.roomCode} มีสมาชิกออนไลน์: ${names} (รวม ${teamCount} ท่าน) พร้อมสำหรับการลงคะแนนเลือกสถานที่ครับ`;
  }

  if (
    msg.includes('กิจกรรม') ||
    msg.includes('เที่ยว') ||
    msg.includes('สนุก') ||
    msg.includes('ทะเล') ||
    msg.includes('activity') ||
    msg.includes('activities') ||
    msg.includes('bonding')
  ) {
    if (dest) {
      if (lang === 'en') {
        return `[Team Synergy Activities in ${city}]:
${dest.tourism_highlights.map((h) => `- ${h}`).join('\n')}
Can be bundled into a consolidated corporate booking in 1 click.`;
      }
      return `[กิจกรรมกระชับมิตรทีมที่ ${dest.city}]:
${dest.tourism_highlights.map((h) => `- ${h}`).join('\n')}
สามารถกดจองรวมเป็นแพ็กเกจองค์กรในขั้นตอนเดียวได้เลยครับ`;
    }
  }

  // Default intelligent assistant reply
  if (dest) {
    if (lang === 'en') {
      return `[Corporate Retreat Dossier for ${title}]:
${reason}
- Location: ${city}, ${country} (Rating: ${dest.rating} / 5)
- Highlights: ${dest.business_amenities.slice(0, 3).join(', ')}
Swipe right to approve, or ask any questions regarding flights, catering, or meeting equipment.`;
    }
    return `[ข้อมูลสถานที่จัดทริปสำหรับ ${dest.title}]:
${dest.ai_reason}
- ที่ตั้ง: ${dest.city}, ${dest.country} (คะแนนรีวิว ${dest.rating} / 5)
- จุดเด่น: ${dest.business_amenities.slice(0, 3).join(', ')}
ปัดขวาเพื่อโหวตถูกใจ หรือสอบถามเพิ่มเติมเรื่องตั๋วเครื่องบิน อาหาร หรือห้องประชุมได้ตลอดเวลาครับ`;
  }

  if (lang === 'en') {
    return `Hello! I am your TripPick AI Concierge. I verify venue connectivity SLAs, calculate per-head procurement budgets, and ensure your retreat delivers maximum ROI. What can I assist you with?`;
  }
  return `สวัสดีครับ ผมคือ TripPick AI Concierge ผู้ช่วยอัจฉริยะด้านการจัดทริปสัมมนาและที่พักสำหรับองค์กร ผมคอยตรวจสอบสเปกสถานที่ คำนวณงบประมาณรายบุคคล และดูแลให้ทริปของทีมคุณคุ้มค่าสูงสุด ต้องการสอบถามข้อมูลด้านใดครับ?`;
}

export async function fetchAiChatResponse(
  userMessage: string,
  context: RoomContextInfo,
  history: { sender: string; text: string }[] = [],
  lang: 'th' | 'en' = 'th'
): Promise<string> {
  const openRouterKey = getOpenRouterApiKey();

  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return generateLocalConciergeResponse(userMessage, context, lang);
  }

  const dest = context.currentDestination || context.matchedDestination;
  const destLoc = dest ? DESTINATION_LOCALIZATIONS[dest.id] : null;
  const title = lang === 'en' && destLoc?.title ? destLoc.title : dest?.title;
  const city = lang === 'en' && destLoc?.city ? destLoc.city : dest?.city;
  const country = lang === 'en' && destLoc?.country ? destLoc.country : dest?.country;

  const systemPrompt =
    lang === 'en'
      ? `You are the TripPick AI Concierge, an intelligent corporate retreat architect and B2B travel assistant.
Never disclose internal AI models, LLM providers, backend architectures, or platform take-rates to users. Always represent yourself purely as the TripPick AI Concierge.
Respond in professional, concise, confident executive English (maximum 100 words, no emojis).
Current screen context:
- Room Code: ${context.roomCode}
- Displayed Venue: ${
          dest
            ? `${title} in ${city}, ${country} (Rate: ~${dest.price_per_person} THB/person/night, WiFi: ${dest.wifi_speed_mbps} Mbps, Amenities: ${dest.business_amenities.join(', ')})`
            : 'In Waiting Lobby'
        }
- Active Members: ${context.users.map((u) => u.user_name).join(', ')}
Answer questions to help the leadership team make quick, confident retreat consensus decisions.`
      : `คุณคือ TripPick AI Concierge ผู้ช่วยอัจฉริยะด้านการจัดทริปธุรกิจและการท่องเที่ยวสำหรับองค์กร
ห้ามเปิดเผยชื่อโมเดล AI เบื้องหลัง ผู้ให้บริการ LLM สถาปัตยกรรมภายใน หรือค่าคอมมิชชั่นแก่ผู้ใช้ ให้แนะนำตนเองในฐานะ TripPick AI Concierge เสมอ
ตอบคำถามเป็นภาษาไทยที่สุภาพ กระชับ มั่นใจ และมีพลัง (ไม่เกิน 100 คำ ไม่ใช้อีโมจิ)
ข้อมูลบริบทหน้าจอขณะนี้:
- รหัสห้อง: ${context.roomCode}
- สถานที่ที่ปรากฏบนหน้าจอ: ${
          dest
            ? `${dest.title} ณ ${dest.city}, ${dest.country} (ราคาประมาณ ${dest.price_per_person} บาท/คน/คืน, เน็ต ${dest.wifi_speed_mbps} Mbps, จุดเด่น: ${dest.business_amenities.join(', ')})`
            : 'อยู่ในหน้าล็อบบี้'
        }
- รายชื่อสมาชิกในห้อง: ${context.users.map((u) => u.user_name).join(', ')}
ตอบคำถามเพื่อช่วยให้ทีมตัดสินใจเลือกสถานที่จัดทริปได้อย่างรวดเร็วและคุ้มค่าที่สุด`;

  try {
    const chatHistoryMessages = history.slice(-4).map((h) => ({
      role: h.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: h.text,
    }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'TripPick',
      },
      body: JSON.stringify({
        model: FIXED_AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistoryMessages,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || generateLocalConciergeResponse(userMessage, context, lang);
  } catch (err) {
    console.warn(`AI chat error, using local ${lang === 'en' ? 'English' : 'Thai'} concierge engine:`, err);
    return generateLocalConciergeResponse(userMessage, context, lang);
  }
}

export async function fetchAiCommentary(
  type: 'join' | 'match',
  entityName: string,
  lang: 'th' | 'en' = 'th'
): Promise<string> {
  if (lang === 'en') {
    if (type === 'join') {
      const joinQuotes = [
        `${entityName} has stepped into the war room! Grab your coffee and let's get rolling.`,
        `Boarding pass verified. Welcome ${entityName} to the executive retreat planning room.`,
        `${entityName} has checked in! Let's see if beachfront luxury or mountain hackathons win out.`,
      ];
      return joinQuotes[Math.floor(Math.random() * joinQuotes.length)];
    } else {
      const matchQuotes = [
        `Unanimous consensus reached! Your team selected ${entityName}. Pack your bags!`,
        `Outstanding! Consensus locked in for ${entityName}. No more Slack debates.`,
        `It's official! ${entityName} won the consensus vote. Ready to approve and book.`,
      ];
      return matchQuotes[Math.floor(Math.random() * matchQuotes.length)];
    }
  }

  if (type === 'join') {
    const joinQuotes = [
      `คุณ ${entityName} เดินทางเข้าสู่ห้องประชุมออนไลน์แล้ว เตรียมชงกาแฟแล้วลุยกันเลย`,
      `ตรวจสอบบอร์ดดิ้งพาสเรียบร้อย ยินดีต้อนรับคุณ ${entityName} เข้าสู่ห้องวางแผนทริป`,
      `คุณ ${entityName} เข้าร่วมห้องแล้ว มาดูกันว่าจะชอบวิลล่าริมทะเลหรือแฮกกาธอนบนดอย`,
    ];
    return joinQuotes[Math.floor(Math.random() * joinQuotes.length)];
  } else {
    const matchQuotes = [
      `ทุกคนเห็นตรงกันแล้ว! ทีมของคุณตกลงเลือก ${entityName} เตรียมจัดกระเป๋าได้เลย`,
      `ยอดเยี่ยมมาก เกิดฉันทามติใน ${entityName} ไม่ต้องเสียเวลาเถียงกันในแชทอีกต่อไป`,
      `เป็นเอกฉันท์! ${entityName} คือผู้ชนะในทริปนี้ เตรียมกดจองและออกเดินทางได้เลย`,
    ];
    return matchQuotes[Math.floor(Math.random() * matchQuotes.length)];
  }
}

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
  type: 'deep_work' | 'strategy' | 'activity' | 'dining' | 'retrospective';
  facilityBadge: string;
}

export interface AgendaDay {
  day: number;
  title: string;
  theme: string;
  items: AgendaItem[];
}

/**
 * Autonomous 3-Day Executive Agenda & Workshop Synthesis
 * Synthesizes a structured corporate offsite schedule tailored directly to the winning destination's amenities
 */
export function generateExecutiveAgenda(
  destination: TravelDestination,
  teamSize: number = 8,
  vibe?: string,
  lang: 'th' | 'en' = 'th'
): AgendaDay[] {
  const isEn = lang === 'en';
  const highlights = destination.tourism_highlights || [];
  const primaryHighlight = highlights[0] || (isEn ? 'Team Synergy & Outdoor Bonding' : 'กิจกรรมกระชับมิตรเสริมสร้างความสามัคคี');
  const secondaryHighlight = highlights[1] || (isEn ? 'Sunset Leadership Dinner' : 'ดินเนอร์มื้อค่ำชมทัศนียภาพธรรมชาติ');

  if (isEn) {
    return [
      {
        day: 1,
        title: 'Day 1: Arrival, Villa Check-in & Deep Work Sprint',
        theme: vibe ? `Theme: ${vibe}` : 'Onboarding, Connectivity & Focus Sprints',
        items: [
          {
            time: '13:30 - 15:00',
            title: 'VIP Airport Shuttle & Private Villa Check-in',
            description: `Private executive vans from airport to ${destination.title} in ${destination.city}. Suite allocation and venue orientation.`,
            type: 'activity',
            facilityBadge: 'VIP Transport & Reception',
          },
          {
            time: '15:30 - 18:00',
            title: `Starlink Deep Work Sprint (${destination.wifi_speed_mbps} Mbps)`,
            description: `Connect to ${destination.wifi_speed_mbps} Mbps enterprise WiFi. Run focus engineering sprints and breakout group syncs (${Math.max(2, Math.ceil(teamSize / 3))} teams).`,
            type: 'deep_work',
            facilityBadge: `Starlink Business (${destination.wifi_speed_mbps} Mbps)`,
          },
          {
            time: '18:30 - 21:00',
            title: 'Welcome Leadership Dinner & Casual Icebreaking',
            description: 'Curated welcome dinner with private chef catering, welcome refreshments, and relaxed executive roadmap sharing.',
            type: 'dining',
            facilityBadge: 'Private Chef Dining',
          },
        ],
      },
      {
        day: 2,
        title: 'Day 2: Boardroom Strategy Workshop & Team Synergy',
        theme: 'Strategic Alignment, OKRs & Team Synergy',
        items: [
          {
            time: '08:30 - 09:30',
            title: 'Executive Breakfast & High-Performance Fuel',
            description: 'Organic breakfast buffet with bespoke drip coffee bar to power a full day of strategic brainstorming.',
            type: 'dining',
            facilityBadge: 'Organic Catering',
          },
          {
            time: '09:30 - 12:30',
            title: 'All-Hands Strategy & Roadmap Workshop',
            description: `Executive session in the Boardroom (up to ${destination.max_capacity} seats) with 4K displays and full AV sound system. Lock in quarterly OKRs.`,
            type: 'strategy',
            facilityBadge: `MICE Boardroom (${destination.max_capacity} Pax)`,
          },
          {
            time: '12:30 - 14:00',
            title: 'Networking Lunch & Breakout Discussion',
            description: 'Networking lunch and breakout brainstorm discussions across nature-view coworking terraces.',
            type: 'dining',
            facilityBadge: 'Coworking Terrace',
          },
          {
            time: '14:30 - 18:00',
            title: `Team Synergy Excursion: ${primaryHighlight}`,
            description: `Curated outdoor bonding experience: ${primaryHighlight}. Deepens mutual trust and cross-functional synergy.`,
            type: 'activity',
            facilityBadge: 'Curated Local Experience',
          },
          {
            time: '19:00 - 22:00',
            title: `Celebration Gala Dinner: ${secondaryHighlight}`,
            description: `Gala dinner celebrating team milestones, acoustic ambient music, and fireside executive retrospectives.`,
            type: 'dining',
            facilityBadge: 'Executive Gala Area',
          },
        ],
      },
      {
        day: 3,
        title: 'Day 3: Sprint Retrospective & VIP Departure',
        theme: 'Action Plan Lock-in & Team Rejuvenation',
        items: [
          {
            time: '09:00 - 11:00',
            title: 'Sprint Retrospective & Action Items Lock-in',
            description: 'Review workshop takeaways, commit individual action items, and export executive summary into enterprise ERP/Docs.',
            type: 'retrospective',
            facilityBadge: 'Brainstorm Hub',
          },
          {
            time: '11:30 - 12:30',
            title: 'Villa Buyout Check-out & Team Photo Session',
            description: 'Commemorative group photography session and private suite check-out.',
            type: 'activity',
            facilityBadge: 'Scenic Photo Spot',
          },
          {
            time: '12:30 - 14:00',
            title: 'Farewell Lunch & VIP Airport Transfer',
            description: 'Closing lunch and chartered VIP vans back to the airport for safe departure.',
            type: 'activity',
            facilityBadge: 'VIP Airport Express',
          },
        ],
      },
    ];
  }

  return [
    {
      day: 1,
      title: 'วันที่ 1: การเดินทาง, เช็กอิน & Deep Work Sprint',
      theme: vibe ? `ธีม: ${vibe}` : 'Onboarding, Connectivity & Focus Sprints',
      items: [
        {
          time: '13:30 - 15:00',
          title: 'VIP Airport Shuttle & Private Villa Check-in',
          description: `รถตู้ VIP รับส่งจากสนามบินสู่ ${destination.title} ณ ${destination.city} จัดสรรห้องพักและปฐมนิเทศสถานที่`,
          type: 'activity',
          facilityBadge: 'VIP Transport & Reception'
        },
        {
          time: '15:30 - 18:00',
          title: `Starlink Deep Work Sprint (${destination.wifi_speed_mbps} Mbps)`,
          description: `เชื่อมต่อเครือข่ายอินเทอร์เน็ตความเร็วสูงระดับองค์กร ${destination.wifi_speed_mbps} Mbps รันสปรินต์ Deep Work แก้ไขปัญหาเชิงเทคนิค และซิงค์แผนงานแบบกลุ่มย่อย (${Math.max(2, Math.ceil(teamSize / 3))} ทีม)`,
          type: 'deep_work',
          facilityBadge: `Starlink Business (${destination.wifi_speed_mbps} Mbps)`
        },
        {
          time: '18:30 - 21:00',
          title: 'Welcome Leadership Dinner & Casual Icebreaking',
          description: 'มื้อค่ำต้อนรับทีมงานพร้อมอาหารท้องถิ่นระดับพรีเมียมและเครื่องดื่มต้อนรับ แลกเปลี่ยนวิสัยทัศน์ในบรรยากาศผ่อนคลายริมธรรมชาติ',
          type: 'dining',
          facilityBadge: 'Private Chef Dining'
        }
      ]
    },
    {
      day: 2,
      title: 'วันที่ 2: เวิร์กช็อปกลยุทธ์บอร์ดบริหาร & กิจกรรมกระชับมิตรทีม',
      theme: 'Strategic Alignment, OKRs & Team Synergy',
      items: [
        {
          time: '08:30 - 09:30',
          title: 'Executive Breakfast & High-Performance Fuel',
          description: 'บุฟเฟต์อาหารเช้าเพื่อสุขภาพพร้อมบาริสต้ากาแฟดริปส่วนตัว เตรียมความพร้อมสำหรับการระดมสมองตลอดวัน',
          type: 'dining',
          facilityBadge: 'Organic Catering'
        },
        {
          time: '09:30 - 12:30',
          title: 'All-Hands Strategy & Roadmap Workshop',
          description: `ประชุมบอร์ดบริหารในห้องประชุม Executive Boardroom (รองรับได้สูงสุด ${destination.max_capacity} ท่าน) พร้อมจอโปรเจกเตอร์ 4K และระบบเสียง AV ครบชุด กำหนดเป้าหมาย OKRs และแผนยุทธศาสตร์`,
          type: 'strategy',
          facilityBadge: `MICE Boardroom (${destination.max_capacity} Pax)`
        },
        {
          time: '12:30 - 14:00',
          title: 'Networking Lunch & Breakout Discussion',
          description: 'รับประทานอาหารกลางวันและระดมสมองกลุ่มย่อยในโซน Coworking รับลมธรรมชาติ',
          type: 'dining',
          facilityBadge: 'Coworking Terrace'
        },
        {
          time: '14:30 - 18:00',
          title: `Team Synergy Excursion: ${primaryHighlight}`,
          description: `กิจกรรมเอาต์ดอร์กระชับมิตรทีม: ${primaryHighlight} ส่งเสริมความไว้วางใจและการทำงานร่วมกันข้ามสายงาน`,
          type: 'activity',
          facilityBadge: 'Curated Local Experience'
        },
        {
          time: '19:00 - 22:00',
          title: `Celebration Gala Dinner: ${secondaryHighlight}`,
          description: `งานเลี้ยงกาล่าดินเนอร์ฉลองความสำเร็จของทีม พร้อมดนตรีอะคูสติกและกิจกรรม Fireside Chat สรุปผลงานที่น่าภาคภูมิใจ`,
          type: 'dining',
          facilityBadge: 'Executive Gala Area'
        }
      ]
    },
    {
      day: 3,
      title: 'วันที่ 3: สรุปผลลัพธ์ (Retrospective) & เดินทางกลับ',
      theme: 'Action Plan Lock-in & Team Rejuvenation',
      items: [
        {
          time: '09:00 - 11:00',
          title: 'Sprint Retrospective & Action Items Lock-in',
          description: 'ทบทวนผลลัพธ์จากเวิร์กช็อป สรุป Action Items รายบุคคล และส่งออกเอกสารสรุปเข้าสู่ระบบบริหารงานองค์กร',
          type: 'retrospective',
          facilityBadge: 'Brainstorm Hub'
        },
        {
          time: '11:30 - 12:30',
          title: 'Villa Buyout Check-out & Team Photo Session',
          description: 'เก็บบันทึกภาพถ่ายความประทับใจของทีมร่วมกัน และเตรียมความพร้อมสัมภาระก่อนเดินทาง',
          type: 'activity',
          facilityBadge: 'Scenic Photo Spot'
        },
        {
          time: '12:30 - 14:00',
          title: 'Farewell Lunch & VIP Airport Transfer',
          description: `รับประทานอาหารมื้ออำลา และเดินทางด้วยรถตู้ VIP สู่สนามบินเพื่อเดินทางกลับโดยสวัสดิภาพ`,
          type: 'activity',
          facilityBadge: 'VIP Airport Express'
        }
      ]
    }
  ];
}
