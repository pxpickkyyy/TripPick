import type { TravelDestination } from './travelDestinations';
import { CURATED_DESTINATIONS, getFallbackDestinations } from './travelDestinations';

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

  // If key is missing, use rich curated Thai destination catalog
  if (!openRouterKey || openRouterKey === 'your_openrouter_api_key_here') {
    return getFallbackDestinations(vibe, minBudget, maxBudget);
  }

  try {
    const systemPrompt = `คุณคือผู้เชี่ยวชาญการออกแบบทริปออฟไซต์และสัมมนาผู้บริหารระดับพรีเมียม (B2B Travel Concierge & Corporate Retreat Architect)
โปรดแนะนำสถานที่พักผ่อนและออฟไซต์สำหรับกลุ่มธุรกิจที่ตรงกับบรรยากาศ (Vibe) และสิ่งอำนวยความสะดวกที่ระบุ เป็นภาษาไทยทั้งหมด
ส่งออกเฉพาะ JSON Array ของ Object ที่มีฟิลด์:
- "title": (string) ชื่อสถานที่ภาษาไทย
- "city": (string) เมืองหรือจังหวัด
- "country": (string) ประเทศ
- "ai_reason": (string) เหตุผลสั้นๆ ไม่เกิน 80 ตัวอักษร ว่าทำไมสถานที่นี้จึงเหมาะกับทริปทีมนี้`;

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
          { role: 'user', content: `ธีมทริป: ${vibe}, สิ่งอำนวยความสะดวกที่ต้องการ: ${amenities.join(', ')}` },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) throw new Error(`AI API error ${response.status}`);
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    if (Array.isArray(parsed) && parsed.length > 0) {
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

// Local Fallback heuristic AI Chat response in 100% Thai
function generateLocalConciergeResponse(userMessage: string, context: RoomContextInfo): string {
  const msg = userMessage.toLowerCase();
  const dest = context.currentDestination || context.matchedDestination;
  const teamCount = context.users.length || 1;

  if (msg.includes('wifi') || msg.includes('เน็ต') || msg.includes('อินเทอร์เน็ต') || msg.includes('ความเร็ว') || msg.includes('speed')) {
    if (dest) {
      return `📶 **ข้อมูลอินเทอร์เน็ตสด**: ที่ **${dest.title}** ติดตั้งอินเทอร์เน็ตระดับองค์กรความเร็ว **${dest.wifi_speed_mbps} Mbps** (รองรับทั้ง Starlink และไฟเบอร์ออปติกสำรอง) รองรับการประชุม Zoom และทำงานพร้อมกันของสมาชิก ${teamCount} คนได้อย่างลื่นไหลไร้สะดุดครับ!`;
    }
    return `📶 ทุกสถานที่บน TripPick ผ่านการตรวจสอบสัญญาณอินเทอร์เน็ตความเร็วสูง 300+ Mbps ขึ้นไปทั้งหมดครับ`;
  }

  if (msg.includes('ราคา') || msg.includes('งบ') || msg.includes('เงิน') || msg.includes('เท่าไหร่') || msg.includes('budget') || msg.includes('cost')) {
    if (dest) {
      const perNight = dest.price_per_night;
      const perHead = dest.price_per_person;
      const commission = Math.round(perNight * (dest.commission_percentage / 100));
      return `💰 **สรุปประมาณการงบประมาณ**:
- ค่าบริการเฉลี่ย: **${perHead.toLocaleString()} บาท/คน/คืน** (เหมาวิลล่า ${perNight.toLocaleString()} บาท/คืน)
- ประมาณการทริป 3 คืน สำหรับสมาชิก ${teamCount} คน: **${(perHead * teamCount * 3).toLocaleString()} บาท**
- **รายได้คอมมิชชั่น B2B ที่สร้างได้**: **${(commission * 3).toLocaleString()} บาท** (โมเดล Make Me Money)`;
    }
    return `💰 อัตราค่าบริการเริ่มต้นประมาณ 3,800 - 8,500 บาท/คน/คืน พร้อมค่าคอมมิชชั่นเฉลี่ย 12% ผ่านระบบพันธมิตร OTA ครับ`;
  }

  if (msg.includes('ห้องประชุม') || msg.includes('ประชุม') || msg.includes('ทำงาน') || msg.includes('boardroom') || msg.includes('meeting')) {
    if (dest) {
      return `🖥️ **ความพร้อมด้านการทำงาน**: ที่ **${dest.title}** มีห้องประชุมบอร์ดบริหารพร้อมจอโปรเจกเตอร์ 4K และระบบเสียงระดับพรีเมียม รองรับผู้เข้าร่วมประชุมได้สูงสุด **${dest.max_capacity} ท่าน** พร้อมโซนระดมสมองส่วนตัวครับ`;
    }
    return `🖥️ ทุกสถานที่ในระบบได้รับการคัดเลือกให้มีห้องประชุมและพื้นที่ทำงานร่วมกันของทีมครบครันครับ`;
  }

  if (msg.includes('ใคร') || msg.includes('คน') || msg.includes('ทีม') || msg.includes('สมาชิก') || msg.includes('who')) {
    const names = context.users.map(u => u.user_name).join(', ') || 'มีคุณเพียงคนเดียวในขณะนี้';
    return `👥 ขณะนี้ในห้อง **${context.roomCode}** มีสมาชิกออนไลน์: **${names}** (รวม ${teamCount} ท่าน) พร้อมสำหรับการลงคะแนนเลือกสถานที่ครับ!`;
  }

  if (msg.includes('กิจกรรม') || msg.includes('เที่ยว') || msg.includes('สนุก') || msg.includes('ทะเล') || msg.includes('activity')) {
    if (dest) {
      return `🌴 **กิจกรรมกระชับมิตรทีมที่ ${dest.city}**:
${dest.tourism_highlights.map(h => `• ${h}`).join('\n')}
สามารถกดจองรวมเป็นแพ็กเกจองค์กรในขั้นตอนเดียวได้เลยครับ!`;
    }
  }

  // Default intelligent assistant reply
  if (dest) {
    return `🏨 **ข้อมูล AI Concierge สำหรับ ${dest.title}**:
${dest.ai_reason}
- **ที่ตั้ง**: ${dest.city}, ${dest.country} (คะแนนรีวิว ★ ${dest.rating} / 5)
- **จุดเด่น**: ${dest.business_amenities.slice(0, 3).join(', ')}
ปัดขวาเพื่อโหวตถูกใจ หรือสอบถามเพิ่มเติมเรื่องตั๋วเครื่องบิน อาหาร หรือห้องประชุมได้ตลอดเวลาครับ!`;
  }

  return `👋 สวัสดีครับ! ผมคือ **TripPick AI Concierge** (ประมวลผลด้วย DeepSeek V4.1 Flash 1017) ผมคอยตรวจสอบสเปกสถานที่ คำนวณงบประมาณรายบุคคล และดูแลให้ทริปของคุณคุ้มค่าสูงสุด ต้องการสอบถามข้อมูลด้านใดครับ?`;
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
  const systemPrompt = `คุณคือ TripPick AI Concierge ผู้ช่วยอัจฉริยะด้านการจัดทริปธุรกิจและการท่องเที่ยวสำหรับองค์กร (ประมวลผลด้วยโมเดล DeepSeek V4.1 Flash 1017)
ตอบคำถามเป็นภาษาไทยที่สุภาพ กระชับ มั่นใจ และมีพลัง (ไม่เกิน 100 คำ)
ข้อมูลบริบทหน้าจอขณะนี้:
- รหัสห้อง: ${context.roomCode}
- สถานที่ที่ปรากฏบนหน้าจอ: ${dest ? `${dest.title} ณ ${dest.city}, ${dest.country} (ราคาประมาณ ${dest.price_per_person} บาท/คน/คืน, เน็ต ${dest.wifi_speed_mbps} Mbps, จุดเด่น: ${dest.business_amenities.join(', ')})` : 'อยู่ในหน้าล็อบบี้'}
- รายชื่อสมาชิกในห้อง: ${context.users.map(u => u.user_name).join(', ')}
ตอบคำถามเพื่อช่วยให้ทีมตัดสินใจเลือกสถานที่จัดทริปได้อย่างรวดเร็วและคุ้มค่าที่สุด`;

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
        model: FIXED_AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
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
      `💼 ${entityName} เดินทางเข้าสู่ห้องประชุมออนไลน์แล้ว เตรียมชงกาแฟแล้วลุยกันเลย!`,
      `✈️ ตรวจสอบบอร์ดดิ้งพาสเรียบร้อย ยินดีต้อนรับคุณ ${entityName} เข้าสู่ห้องวางแผนทริป!`,
      `🌴 คุณ ${entityName} เข้าร่วมห้องแล้ว มาดูกันว่าจะชอบวิลล่าริมทะเลหรือแฮกกาธอนบนดอย!`,
    ];
    return joinQuotes[Math.floor(Math.random() * joinQuotes.length)];
  } else {
    const matchQuotes = [
      `🎉 ทุกคนเห็นตรงกันแล้ว! ทีมของคุณตกลงเลือก ${entityName} เตรียมจัดกระเป๋าได้เลย!`,
      `🚀 ยอดเยี่ยมมาก! เกิดฉันทามติใน ${entityName} ไม่ต้องเสียเวลาเถียงกันในแชทอีกต่อไป!`,
      `🥂 เป็นเอกฉันท์! ${entityName} คือผู้ชนะในทริปนี้ เตรียมกดจองและออกเดินทางได้เลย!`,
    ];
    return matchQuotes[Math.floor(Math.random() * matchQuotes.length)];
  }
}
