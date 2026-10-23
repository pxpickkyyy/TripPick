import type { TravelDestination } from './travelDestinations';
import { CURATED_DESTINATIONS, getFallbackDestinations, findCongruentDestination } from './travelDestinations';

// Fixed model per user requirement: DeepSeek: DeepSeek V4.1 Flash 1017 (no user selection allowed)
export const FIXED_AI_MODEL = 'deepseek/deepseek-v4.1-flash:1017';
export const FIXED_AI_MODEL_NAME = 'DeepSeek: DeepSeek V4.1 Flash 1017';

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
  const openRouterKey = localStorage.getItem('trippick_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';

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
        'HTTP-Referer': window.location.origin,
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

// Local Fallback heuristic AI Chat response in 100% Thai
function generateLocalConciergeResponse(userMessage: string, context: RoomContextInfo): string {
  const msg = userMessage.toLowerCase();
  const dest = context.currentDestination || context.matchedDestination;
  const teamCount = context.users.length || 1;

  if (msg.includes('wifi') || msg.includes('เน็ต') || msg.includes('อินเทอร์เน็ต') || msg.includes('ความเร็ว') || msg.includes('speed')) {
    if (dest) {
      return `[ข้อมูลความเร็วเน็ต] ที่ ${dest.title} ติดตั้งอินเทอร์เน็ตระดับองค์กรความเร็ว ${dest.wifi_speed_mbps} Mbps (รองรับทั้ง Starlink และไฟเบอร์ออปติกสำรอง) รองรับการประชุม Zoom และทำงานพร้อมกันของสมาชิก ${teamCount} คนได้อย่างลื่นไหลไร้สะดุดครับ`;
    }
    return `ทุกสถานที่บน TripPick ผ่านการตรวจสอบสัญญาณอินเทอร์เน็ตความเร็วสูง 300+ Mbps ขึ้นไปทั้งหมดครับ`;
  }

  if (msg.includes('ราคา') || msg.includes('งบ') || msg.includes('เงิน') || msg.includes('เท่าไหร่') || msg.includes('budget') || msg.includes('cost')) {
    if (dest) {
      const perNight = dest.price_per_night;
      const perHead = dest.price_per_person;
      const commission = Math.round(perNight * (dest.commission_percentage / 100));
      return `[สรุปประมาณการงบประมาณ]:
- ค่าบริการเฉลี่ย: ${perHead.toLocaleString()} บาท/คน/คืน (เหมาวิลล่า ${perNight.toLocaleString()} บาท/คืน)
- ประมาณการทริป 3 คืน สำหรับสมาชิก ${teamCount} คน: ${(perHead * teamCount * 3).toLocaleString()} บาท
- รายได้คอมมิชชั่น B2B ที่สร้างได้: ${(commission * 3).toLocaleString()} บาท (โมเดล Make Me Money)`;
    }
    return `อัตราค่าบริการเริ่มต้นประมาณ 3,800 - 8,500 บาท/คน/คืน พร้อมค่าคอมมิชชั่นเฉลี่ย 12% ผ่านระบบพันธมิตร OTA ครับ`;
  }

  if (msg.includes('ห้องประชุม') || msg.includes('ประชุม') || msg.includes('ทำงาน') || msg.includes('boardroom') || msg.includes('meeting')) {
    if (dest) {
      return `[ความพร้อมด้านพื้นที่ทำงาน] ที่ ${dest.title} มีห้องประชุมบอร์ดบริหารพร้อมจอโปรเจกเตอร์ 4K และระบบเสียงระดับพรีเมียม รองรับผู้เข้าร่วมประชุมได้สูงสุด ${dest.max_capacity} ท่าน พร้อมโซนระดมสมองส่วนตัวครับ`;
    }
    return `ทุกสถานที่ในระบบได้รับการคัดเลือกให้มีห้องประชุมและพื้นที่ทำงานร่วมกันของทีมครบครันครับ`;
  }

  if (msg.includes('ใคร') || msg.includes('คน') || msg.includes('ทีม') || msg.includes('สมาชิก') || msg.includes('who')) {
    const names = context.users.map(u => u.user_name).join(', ') || 'มีคุณเพียงคนเดียวในขณะนี้';
    return `ขณะนี้ในห้อง ${context.roomCode} มีสมาชิกออนไลน์: ${names} (รวม ${teamCount} ท่าน) พร้อมสำหรับการลงคะแนนเลือกสถานที่ครับ`;
  }

  if (msg.includes('กิจกรรม') || msg.includes('เที่ยว') || msg.includes('สนุก') || msg.includes('ทะเล') || msg.includes('activity')) {
    if (dest) {
      return `[กิจกรรมกระชับมิตรทีมที่ ${dest.city}]:
${dest.tourism_highlights.map(h => `- ${h}`).join('\n')}
สามารถกดจองรวมเป็นแพ็กเกจองค์กรในขั้นตอนเดียวได้เลยครับ`;
    }
  }

  // Default intelligent assistant reply
  if (dest) {
    return `[ข้อมูลสถานที่จัดทริปสำหรับ ${dest.title}]:
${dest.ai_reason}
- ที่ตั้ง: ${dest.city}, ${dest.country} (คะแนนรีวิว ${dest.rating} / 5)
- จุดเด่น: ${dest.business_amenities.slice(0, 3).join(', ')}
ปัดขวาเพื่อโหวตถูกใจ หรือสอบถามเพิ่มเติมเรื่องตั๋วเครื่องบิน อาหาร หรือห้องประชุมได้ตลอดเวลาครับ`;
  }

  return `สวัสดีครับ ผมคือ TripPick AI Concierge (ประมวลผลด้วย DeepSeek V4.1 Flash 1017) ผมคอยตรวจสอบสเปกสถานที่ คำนวณงบประมาณรายบุคคล และดูแลให้ทริปของคุณคุ้มค่าสูงสุด ต้องการสอบถามข้อมูลด้านใดครับ?`;
}

export async function fetchAiChatResponse(
  userMessage: string,
  context: RoomContextInfo,
  history: { sender: string; text: string }[] = []
): Promise<string> {
  const openRouterKey = localStorage.getItem('trippick_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';

  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return generateLocalConciergeResponse(userMessage, context);
  }

  const dest = context.currentDestination || context.matchedDestination;
  const systemPrompt = `คุณคือ TripPick AI Concierge ผู้ช่วยอัจฉริยะด้านการจัดทริปธุรกิจและการท่องเที่ยวสำหรับองค์กร (ประมวลผลด้วยโมเดล DeepSeek V4.1 Flash 1017)
ตอบคำถามเป็นภาษาไทยที่สุภาพ กระชับ มั่นใจ และมีพลัง (ไม่เกิน 100 คำ ไม่ใช้อีโมจิ)
ข้อมูลบริบทหน้าจอขณะนี้:
- รหัสห้อง: ${context.roomCode}
- สถานที่ที่ปรากฏบนหน้าจอ: ${dest ? `${dest.title} ณ ${dest.city}, ${dest.country} (ราคาประมาณ ${dest.price_per_person} บาท/คน/คืน, เน็ต ${dest.wifi_speed_mbps} Mbps, จุดเด่น: ${dest.business_amenities.join(', ')})` : 'อยู่ในหน้าล็อบบี้'}
- รายชื่อสมาชิกในห้อง: ${context.users.map(u => u.user_name).join(', ')}
ตอบคำถามเพื่อช่วยให้ทีมตัดสินใจเลือกสถานที่จัดทริปได้อย่างรวดเร็วและคุ้มค่าที่สุด`;

  try {
    const chatHistoryMessages = history.slice(-4).map(h => ({
      role: h.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: h.text,
    }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': window.location.origin,
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
    return data?.choices?.[0]?.message?.content || generateLocalConciergeResponse(userMessage, context);
  } catch (err) {
    console.warn('AI chat error, using local Thai concierge engine:', err);
    return generateLocalConciergeResponse(userMessage, context);
  }
}

export async function fetchAiCommentary(type: 'join' | 'match', entityName: string): Promise<string> {
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
  vibe?: string
): AgendaDay[] {
  const highlights = destination.tourism_highlights || [];
  const primaryHighlight = highlights[0] || 'กิจกรรมกระชับมิตรเสริมสร้างความสามัคคี';
  const secondaryHighlight = highlights[1] || 'ดินเนอร์มื้อค่ำชมทัศนียภาพธรรมชาติ';

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
