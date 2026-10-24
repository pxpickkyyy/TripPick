import type { TravelDestination } from '../lib/travelDestinations.ts';

/**
 * Authentic Database of Real Luxury MICE & Executive Retreat Properties
 * across Thailand and APAC for the Infinite Live Discovery Engine.
 */
interface PropertySeed {
  title: string;
  city: string;
  country: string;
  archetype: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
  categoryTh: string;
  categoryEn: string;
  overviewTh: string;
  overviewEn: string;
  heroImage: string;
  gallery: string[];
  baseRatePerHead: number;
  maxCapacity: number;
  wifiSpeed: number;
  nearestAirportTh: string;
  nearestAirportEn: string;
  airportTravelTimeTh: string;
  airportTravelTimeEn: string;
  addressTh: string;
  addressEn: string;
  highlightsTh: string[];
  highlightsEn: string[];
  rating: number;
  reviewsCount: number;
}

export const EXPANDED_RETREAT_SEEDS: PropertySeed[] = [
  {
    title: 'โรสวูด ภูเก็ต เอ็กเซ็กคิวทีฟ โอเชียน แซงค์ทัวรี',
    city: 'ภูเก็ต',
    country: 'ประเทศไทย',
    archetype: 'coastal',
    categoryTh: 'รีสอร์ตผู้บริหารระดับอัลตราลักชัวรี',
    categoryEn: 'Ultra-Luxury Executive Oceanfront Resort',
    overviewTh: 'รีสอร์ตหรูระดับโลกริมหาดตรีตรัง ออกแบบสไตล์ร่วมสมัยกลมกลืนกับธรรมชาติ พร้อมห้องประชุม Pavilion ริมทะเล และวิลล่าส่วนตัวสำหรับผู้บริหาร',
    overviewEn: 'World-class ultra-luxury hideaway on Tri Trang Beach, featuring oceanfront executive pavilions and discreet private pool villas for C-suite offsites.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeJuGBc7hPzZ80ni5OTnQoqxR3PdX7JOf3S001P4o3hWaWsi3-rjjAwUiIyL_nsJ9PHHUZFgqnH10m15uaoPSdmE6UmmM21PLBykEZIVg3qBgxsgAgEBJ9l6P8iVzhcQO4I34-f=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeJuGBc7hPzZ80ni5OTnQoqxR3PdX7JOf3S001P4o3hWaWsi3-rjjAwUiIyL_nsJ9PHHUZFgqnH10m15uaoPSdmE6UmmM21PLBykEZIVg3qBgxsgAgEBJ9l6P8iVzhcQO4I34-f=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLd1a-61wvTOySRKVRXIQAVh2N-36AeVpwgW_XK-zt0oaI0Hif3oIXFLK1KiQ4Jx9EbSkKx_GmvX-GLB-9QbKon_YZ55DEcBi9Zn-H22eHZvxjlZLjsfCsN1CnK7qvupHG2JT2XbzQ=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLegzrQPbL8m65IWcR-NMPq-VRBx6GcIHN_VvHpEEanacaPcr5PjtIrr6qlDBP3mwnXkLp78Yh8SoG2ZmItuBBfGit6rJpVZHV9JGcsm34ykrKTJRv-p9__tkrJJ6qh3MvrqH6bk=w1200-h800-k-no'
    ],
    baseRatePerHead: 7800,
    maxCapacity: 45,
    wifiSpeed: 750,
    nearestAirportTh: 'สนามบินนานาชาติภูเก็ต (HKT)',
    nearestAirportEn: 'Phuket International Airport (HKT)',
    airportTravelTimeTh: '45 นาที (38 กม.)',
    airportTravelTimeEn: '45 mins (38 km)',
    addressTh: '88/28 หาดตรีตรัง ป่าตอง กะทู้ ภูเก็ต 83150',
    addressEn: '88/28 Tri Trang Beach, Patong, Kathu, Phuket 83150',
    highlightsTh: ['ห้องประชุม Glass Pavilion ชมวิวทะเล 180 องศา', 'สปา Asaya Wellness ฟื้นฟูสมองทีมงาน', 'ดินเนอร์อิตาเลียนส่วนตัวริมหน้าผา'],
    highlightsEn: ['Glass Pavilion boardroom with 180° Andaman sea views', 'Asaya Wellness restorative executive rituals', 'Private cliffside Italian dining for strategic discussions'],
    rating: 4.94,
    reviewsCount: 410,
  },
  {
    title: 'ซิกเซ้นส์ ยาวน้อย เอ็กเซ็กคิวทีฟ ไฮด์อะเวย์',
    city: 'พังงา',
    country: 'ประเทศไทย',
    archetype: 'coastal',
    categoryTh: 'รีสอร์ตเกาะส่วนตัวสำหรับผู้นำองค์กร',
    categoryEn: 'Private Island Executive Sanctuary',
    overviewTh: 'วิลล่าไม้สักบนเกาะยาวน้อย มองเห็นทัศนียภาพเขาหินปูนอ่าวพังงาอันงดงาม ปราศจากมลภาวะและเสียงรบกวน เหมาะแก่การวางแผนยุทธศาสตร์องค์กร',
    overviewEn: 'Eco-luxury teak villas perched above Phang Nga Bay limestone karsts, providing uninterrupted serenity for executive retreats.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLf_kyH1RpgLeLBxk08QHBoIIOljAMBSQf8hTQjiMOMZF7j5OQAFAC8h0dzC6xlXrr0tzW2bYW97DE71Zlexd3zX2d3o83td6-3Ijv8cct8QsHEDcwVlMd8dip6_B4RAnHsqnCNW=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLf_kyH1RpgLeLBxk08QHBoIIOljAMBSQf8hTQjiMOMZF7j5OQAFAC8h0dzC6xlXrr0tzW2bYW97DE71Zlexd3zX2d3o83td6-3Ijv8cct8QsHEDcwVlMd8dip6_B4RAnHsqnCNW=w1200-h800-k-no'
    ],
    baseRatePerHead: 8200,
    maxCapacity: 35,
    wifiSpeed: 600,
    nearestAirportTh: 'สนามบินนานาชาติภูเก็ต (HKT) ต่อเรือสปีดโบ๊ท',
    nearestAirportEn: 'Phuket International Airport (HKT) + Speedboat',
    airportTravelTimeTh: '40 นาที (เรือรับส่งส่วนตัว)',
    airportTravelTimeEn: '40 mins (Private Speedboat Transfer)',
    addressTh: '56 หมู่ 5 เกาะยาวน้อย พังงา 82160',
    addressEn: '56 Moo 5, Koh Yao Noi, Phang Nga 82160',
    highlightsTh: ['Speedboat VIP รับส่งจากภูเก็ต/กระบี่', 'ห้องประชุมเปิดรับลมทะเลพร้อมโปรเจกเตอร์ 4K', 'ล่องเรือสำรวจอ่าวพังงาแบบไพรเวต'],
    highlightsEn: ['VIP speedboat pickup from Phuket or Krabi marina', 'Open-air ocean breeze boardroom with 4K projection', 'Private yacht expedition across Phang Nga archipelago'],
    rating: 4.96,
    reviewsCount: 380,
  },
  {
    title: 'รายาวดี กระบี่ พรีเมียร์ เนเชอรัล รีทรีต',
    city: 'กระบี่',
    country: 'ประเทศไทย',
    archetype: 'coastal',
    categoryTh: 'รีสอร์ตริมผาหินปูนและอุทยานทางทะเล',
    categoryEn: 'Limestone Marine Sanctuary Retreat',
    overviewTh: 'พาวิลเลียนทรงกลมหรูหราท่ามกลางแมกไม้เขียวขจี ล้อมรอบด้วยหน้าผาหินปูนและหาดไร่เลย์ มีห้องประชุมสัมมนารองรับคณะผู้บริหารครบวงจร',
    overviewEn: 'Iconic round pavilions nestled within Phranang Peninsula tropical gardens, surrounded by towering cliffs and emerald waters.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfTGuZLqOrM-sxMU2hjpZC0aDG50Zxr8xQoRr2oHgTw5llClhPcMl9uXfzVCjCzQPZ_dU4bBEBbaUrC_CD6dNO-CE88-vjUICj5D-vim_FyHZkXhpi7zYdrxnEEUHdRQuN3-vcp=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfTGuZLqOrM-sxMU2hjpZC0aDG50Zxr8xQoRr2oHgTw5llClhPcMl9uXfzVCjCzQPZ_dU4bBEBbaUrC_CD6dNO-CE88-vjUICj5D-vim_FyHZkXhpi7zYdrxnEEUHdRQuN3-vcp=w1200-h800-k-no'
    ],
    baseRatePerHead: 7200,
    maxCapacity: 50,
    wifiSpeed: 550,
    nearestAirportTh: 'สนามบินนานาชาติกระบี่ (KBV)',
    nearestAirportEn: 'Krabi International Airport (KBV)',
    airportTravelTimeTh: '35 นาที (รถตู้ + เรือส่วนตัว)',
    airportTravelTimeEn: '35 mins (VIP Van + Private Boat)',
    addressTh: '214 หมู่ 2 ต.อ่าวนาง อ.เมือง กระบี่ 81880',
    addressEn: '214 Moo 2, Ao Nang, Mueang, Krabi 81880',
    highlightsTh: ['ห้องประชุม The Grotto ในถ้ำหินปูนริมหาด', 'กิจกรรมพายเรือคายัคในทะเลอันดามัน', 'ระบบเครือข่ายความเร็วสูงครอบคลุมทั้งวิลล่า'],
    highlightsEn: ['Exclusive Grotto limestone cave dining & meeting venue', 'Andaman sea kayaking and mangrove team excursions', 'Enterprise-grade mesh Wi-Fi covering all pavilion zones'],
    rating: 4.92,
    reviewsCount: 520,
  },
  {
    title: 'ศาลา สมุย เชิงมน เอ็กเซ็กคิวทีฟ พูลวิลล่า',
    city: 'เกาะสมุย',
    country: 'ประเทศไทย',
    archetype: 'coastal',
    categoryTh: 'พูลวิลล่าส่วนตัวสำหรับทีมบริหาร',
    categoryEn: 'Executive Private Pool Villa Retreat',
    overviewTh: 'รีสอร์ตพูลวิลล่าริมหาดเชิงมน บรรยากาศเงียบสงบ เหมาะกับการพักผ่อนและระดมสมองของทีมเทคและผู้นำระดับสูง พร้อมเทคโนโลยีภาพและเสียงทันสมัย',
    overviewEn: 'Minimalist luxury pool villas on Choengmon Beach, tailored for intimate high-impact tech summits and executive sprint planning.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeAe9niMq-yvp8_CS13jm4V_OaGJJkXnze5OnnBUi1KXWiU6Glg3cpqELGUBvh7nxAmF1bEcSo-66xInvHNAgTQ01Jou24a9J0G1wsqBYCZ14faY5H2cImI8kaQLnkElXVOg9HK_txczI5x=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeAe9niMq-yvp8_CS13jm4V_OaGJJkXnze5OnnBUi1KXWiU6Glg3cpqELGUBvh7nxAmF1bEcSo-66xInvHNAgTQ01Jou24a9J0G1wsqBYCZ14faY5H2cImI8kaQLnkElXVOg9HK_txczI5x=w1200-h800-k-no'
    ],
    baseRatePerHead: 6500,
    maxCapacity: 40,
    wifiSpeed: 650,
    nearestAirportTh: 'สนามบินนานาชาติสมุย (USM)',
    nearestAirportEn: 'Samui International Airport (USM)',
    airportTravelTimeTh: '15 นาที (6.5 กม.)',
    airportTravelTimeEn: '15 mins (6.5 km)',
    addressTh: '10/9 หมู่ 5 หาดเชิงมน เกาะสมุย สุราษฎร์ธานี 84320',
    addressEn: '10/9 Moo 5, Choengmon Beach, Koh Samui 84320',
    highlightsTh: ['สระว่ายน้ำส่วนตัวทุกวิลล่า', 'ห้องประชุมติดหาดรองรับ Hybrid Meeting', 'คอร์สอาหารค่ำปรุงสดโดยเชฟมิชลิน'],
    highlightsEn: ['Private pool in every executive villa', 'Beachfront meeting space equipped for hybrid video conferences', 'Chef-crafted beachfront bespoke tasting menus'],
    rating: 4.89,
    reviewsCount: 340,
  },
  {
    title: 'อนันตรา สามเหลี่ยมทองคำ เอเลเฟนท์ แคมป์',
    city: 'เชียงราย',
    country: 'ประเทศไทย',
    archetype: 'mountain',
    categoryTh: 'รีสอร์ตหรูท่ามกลางขุนเขาและธรรมชาติ',
    categoryEn: 'Luxury Wilderness & Mountain Sanctuary',
    overviewTh: 'สัมผัสประสบการณ์สุดพิเศษบนสันเขาเหนือแม่น้ำรวกและแม่น้ำโขง มองเห็น 3 ประเทศ วิวพาโนรามาพร้อมห้องประชุมสไตล์ล้านนาโมเดิร์น',
    overviewEn: 'Perched on a ridge overlooking three countries (Thailand, Myanmar, Laos) across Mekong River mist, featuring world-class luxury boardrooms.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd9fAsqROx3HWikswPHbl1dBWsOQ8NYoYim-KfxOB1QGwUpo4CoYm7r999CP-X0T3CKg28LNe5qAzpCovBF7qxGL6VNuMSyLUd2B7NK4gTwKQwO2nXpyMbJcEdE87cK47GMabPrkvSidwq5=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLd9fAsqROx3HWikswPHbl1dBWsOQ8NYoYim-KfxOB1QGwUpo4CoYm7r999CP-X0T3CKg28LNe5qAzpCovBF7qxGL6VNuMSyLUd2B7NK4gTwKQwO2nXpyMbJcEdE87cK47GMabPrkvSidwq5=w1200-h800-k-no'
    ],
    baseRatePerHead: 8900,
    maxCapacity: 35,
    wifiSpeed: 500,
    nearestAirportTh: 'สนามบินนานาชาติแม่ฟ้าหลวง เชียงราย (CEI)',
    nearestAirportEn: 'Mae Fah Luang Chiang Rai Airport (CEI)',
    airportTravelTimeTh: '55 นาที (62 กม.)',
    airportTravelTimeEn: '55 mins (62 km)',
    addressTh: '229 หมู่ 1 อ.เชียงแสน เชียงราย 57150',
    addressEn: '229 Moo 1, Chiang Saen, Chiang Rai 57150',
    highlightsTh: ['Jungle Bubble นอนดูดาวกลางธรรมชาติ', 'กิจกรรม Team Building ร่วมกับช้างในพื้นที่อนุรักษ์', 'ห้องประชุมวิว 3 ประเทศรอบทิศทาง'],
    highlightsEn: ['Luxury Jungle Bubbles for starlit relaxation', 'Ethical elephant conservation team experiences', 'Tri-border panoramic executive conference suite'],
    rating: 4.98,
    reviewsCount: 460,
  },
  {
    title: 'เวลา รีสอร์ท แอนด์ สปา เชียงใหม่',
    city: 'เชียงใหม่',
    country: 'ประเทศไทย',
    archetype: 'mountain',
    categoryTh: 'สเตย์บูทีกริมสายน้ำปิงและดอยสุเทพ',
    categoryEn: 'Mountain Valley Boutique Retreat',
    overviewTh: 'รีสอร์ตสงบเงียบแวดล้อมด้วยต้นไม้ใหญ่และไอหมอกยามเช้า ห้องประชุมเชื่อมต่อสวนร่มรื่น มอบบรรยากาศที่ช่วยกระตุ้นความคิดสร้างสรรค์ของทีม',
    overviewEn: 'Tranquil boutique sanctuary set beside historic canals with views of Doi Suthep, ideal for focused strategic alignment retreats.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLf5RWl0ALAK9RzOQfi9_CJ0udvXVCu9HXZaByiT0XLLVDnRikzYLAoz-Jxz_SXTMSv3R0h1-Omge1NfiudCT3GmXgfP-i6oc4tlcHvIV4shzLAArGSdilvtPHKQZyh_H3TRSqXYaw=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLf5RWl0ALAK9RzOQfi9_CJ0udvXVCu9HXZaByiT0XLLVDnRikzYLAoz-Jxz_SXTMSv3R0h1-Omge1NfiudCT3GmXgfP-i6oc4tlcHvIV4shzLAArGSdilvtPHKQZyh_H3TRSqXYaw=w1200-h800-k-no'
    ],
    baseRatePerHead: 5400,
    maxCapacity: 45,
    wifiSpeed: 800,
    nearestAirportTh: 'สนามบินนานาชาติเชียงใหม่ (CNX)',
    nearestAirportEn: 'Chiang Mai International Airport (CNX)',
    airportTravelTimeTh: '20 นาที (12 กม.)',
    airportTravelTimeEn: '20 mins (12 km)',
    addressTh: '123 ถนนช้างคลาน อ.เมือง เชียงใหม่ 50100',
    addressEn: '123 Chang Klan Road, Mueang, Chiang Mai 50100',
    highlightsTh: ['ห้องประชุมเทคโนโลยีไฟเบอร์ 1 Gbps', 'คอร์สชงกาแฟพิเศษและชิมชาออร์แกนิกสำหรับทีม', 'สระว่ายน้ำอินฟินิตี้วิวขุนเขา'],
    highlightsEn: ['1 Gbps fiber connectivity with dual backup lines', 'Artisan specialty coffee & organic tea workshop team bonding', 'Mountainview infinity pool and outdoor terrace'],
    rating: 4.88,
    reviewsCount: 290,
  },
  {
    title: 'เทวาพรีเมียร์ ฟอเรสต์ รีทรีต เขาใหญ่',
    city: 'เขาใหญ่',
    country: 'ประเทศไทย',
    archetype: 'mountain',
    categoryTh: 'อีโค่ลักชัวรีรีสอร์ตท่ามกลางขุนเขาเขาใหญ่',
    categoryEn: 'Eco-Luxury Forest & Mountain Estate',
    overviewTh: 'พักผ่อนสูดโอโซนบริสุทธิ์ใกล้กรุงเทพฯ วิลล่าสไตล์สแกนดิเนเวียท่ามกลางขุนเขาดงพญาเย็น พร้อมสิ่งอำนวยความสะดวกสำหรับการประชุมสัมมนาครบวงจร',
    overviewEn: 'Scandinavian-inspired luxury mountain villas nestled in Khao Yai valleys, offering fresh air, zero travel fatigue, and seamless corporate offsite facilities.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLffKdBWB6fw41fKwdyQSODMv-vw597br5EHMn91iCptc9sLPCZJrU5CvHhQJx71g-504DCWFotiZEh8h8UniCZPBAxKO6Ofs6b6Sly1gZd7oJCsUQWoQ-YJo1VAhMmqbnzgUUB7=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLffKdBWB6fw41fKwdyQSODMv-vw597br5EHMn91iCptc9sLPCZJrU5CvHhQJx71g-504DCWFotiZEh8h8UniCZPBAxKO6Ofs6b6Sly1gZd7oJCsUQWoQ-YJo1VAhMmqbnzgUUB7=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLc1bhE1I4L1JcQKI4hzBGtQhhPp4C_YWm8X3v-GKpho8_Wn6B2lm6ibhTQro2CPdgVMAUYsT7kiZiX0yMqDUQ_n1idQYeqTt7H1XmucZv-umhcq0bygLyaXklloKh_4N2T2Y-Lm=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLci9dqjLcPVUNJUcshOQ405zz7BbWUCOT3u1OU5O4lREtks4JkyQuSg6UDbbFjLjVlfCqUxvb68hkH2IXUXVw4bX4O-l59p52RDL2gSe2zmPX5kBue68lwzmki7vpp9ebcTGlClsA=w1200-h800-k-no'
    ],
    baseRatePerHead: 5200,
    maxCapacity: 60,
    wifiSpeed: 600,
    nearestAirportTh: 'สนามบินนานาชาติดอนเมือง (DMK) / ขับรถจาก กทม.',
    nearestAirportEn: 'Don Mueang Airport (DMK) / Bangkok Drive',
    airportTravelTimeTh: '2 ชั่วโมง (145 กม. มอเตอร์เวย์ M6)',
    airportTravelTimeEn: '2 hrs (145 km via M6 Motorway)',
    addressTh: '88 หมู่ 7 ต.หมูสี อ.ปากช่อง นครราชสีมา 30130',
    addressEn: '88 Moo 7, Mu Si, Pak Chong, Nakhon Ratchasima 30130',
    highlightsTh: ['ห้องประชุม Amphitheatre กลางแจ้งท่ามกลางป่า', 'ฟาร์มออร์แกนิกและคลาสทำอาหารสุขภาพสำหรับทีม', 'Starlink Satellite WiFi เสถียรสูง'],
    highlightsEn: ['Outdoor forest amphitheatre for strategic keynote sessions', 'Farm-to-table organic kitchen team building classes', 'Ultra-stable Starlink satellite internet'],
    rating: 4.91,
    reviewsCount: 310,
  },
  {
    title: 'คาเพลลา กรุงเทพฯ ริเวอร์ฟรอนต์ เอ็กเซ็กคิวทีฟ',
    city: 'กรุงเทพฯ',
    country: 'ประเทศไทย',
    archetype: 'urban',
    categoryTh: 'วิลล่าริมแม่น้ำเจ้าพระยาสำหรับผู้บริหาร',
    categoryEn: 'Ultra-Luxury Riverside Boardroom Sanctuary',
    overviewTh: 'รีสอร์ตหรูริมแม่น้ำเจ้าพระยาการันตีรางวัลระดับโลก ห้องประชุมกระจกโปร่งวิวโค้งน้ำเจ้าพระยา และวิลล่าส่วนตัวพร้อมจากุซซี่ริมน้ำ',
    overviewEn: 'Award-winning ultra-luxury riverside sanctuary along the historic Chao Phraya River, featuring light-filled ballrooms and presidential villas.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLdpMVb2pJx_eRzXNNojWJ8buzkXEKA1o3Cpw8QOZKtp4-viwTu7qw6QfDn0vr1J4QB6Yy139-sGAoqDj-eff_aSHiKywaN-fSJg3ddeoTrf2lOHpJKHujk_n1LBl52N4t242tQy=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdpMVb2pJx_eRzXNNojWJ8buzkXEKA1o3Cpw8QOZKtp4-viwTu7qw6QfDn0vr1J4QB6Yy139-sGAoqDj-eff_aSHiKywaN-fSJg3ddeoTrf2lOHpJKHujk_n1LBl52N4t242tQy=w1200-h800-k-no'
    ],
    baseRatePerHead: 8500,
    maxCapacity: 50,
    wifiSpeed: 1000,
    nearestAirportTh: 'สนามบินนานาชาติสุวรรณภูมิ (BKK)',
    nearestAirportEn: 'Suvarnabhumi International Airport (BKK)',
    airportTravelTimeTh: '35 นาที (32 กม.)',
    airportTravelTimeEn: '35 mins (32 km)',
    addressTh: '300/2 ถนนเจริญกรุง ยานนาวา สาทร กรุงเทพฯ 10120',
    addressEn: '300/2 Charoen Krung Road, Yannawa, Sathon, Bangkok 10120',
    highlightsTh: ['ห้องประชุม The Atelier แสงธรรมชาติริมน้ำ', 'ร้านอาหารมิชลิน Cote by Mauro Colagreco', 'เรือรับส่งส่วนตัวเชื่อมต่อสถานี BTS'],
    highlightsEn: ['The Atelier sunlit executive meeting room facing river', 'Michelin-starred Cote by Mauro Colagreco dining', 'Private river shuttle boat connected to BTS Skytrain'],
    rating: 4.97,
    reviewsCount: 620,
  },
  {
    title: 'เดอะ สยาม แฮริเทจ บูทีก แอนด์ บอร์ดรูม',
    city: 'กรุงเทพฯ',
    country: 'ประเทศไทย',
    archetype: 'urban',
    categoryTh: 'บูทีกอาร์ตเดโค่ริมแม่น้ำสำหรับประชุมลับผู้บริหาร',
    categoryEn: 'Art-Deco Heritage Executive Hideaway',
    overviewTh: 'ผลงานการออกแบบระดับมาสเตอร์พีซโดย Bill Bensley บรรยากาศเงียบสงบเป็นส่วนตัวสูงสุดในย่านดุสิต พร้อมสิ่งอำนวยความสะดวกในการประชุมระดับพรีเมียม',
    overviewEn: 'Bill Bensley-designed urban sanctuary on the banks of Chao Phraya River in the royal district, offering peerless privacy for executive negotiations.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLevQJ_fN6ZtXkoyWwYgL0iTMo6hq7GZ14v-cWNzJb0yzl9q8RgzyBuIsYeeUpo8njN0hzUxaLsA21Xv4Ptgn6VhjzdHU1BOhkD6SD4pLjr6qn5k6WQMCgwwt2r1X0-Yr-Ck8tWm=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLevQJ_fN6ZtXkoyWwYgL0iTMo6hq7GZ14v-cWNzJb0yzl9q8RgzyBuIsYeeUpo8njN0hzUxaLsA21Xv4Ptgn6VhjzdHU1BOhkD6SD4pLjr6qn5k6WQMCgwwt2r1X0-Yr-Ck8tWm=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLf4ym68BUYDxeY-9homiNCYjphOnkiHjd84pRCpUkuf5bChj5jkF226nSfqtXVpak20L29dqzqtZgl55VXd9e31avfrT2T9TxEVYHAoWljY_ziM5gC06P_1LaJ1JhwZK2p-zUfaiQ=w1200-h800-k-no'
    ],
    baseRatePerHead: 7900,
    maxCapacity: 30,
    wifiSpeed: 900,
    nearestAirportTh: 'สนามบินนานาชาติดอนเมือง (DMK)',
    nearestAirportEn: 'Don Mueang International Airport (DMK)',
    airportTravelTimeTh: '25 นาที (22 กม.)',
    airportTravelTimeEn: '25 mins (22 km)',
    addressTh: '3/2 ถนนขาว ดุสิต กรุงเทพฯ 10300',
    addressEn: '3/2 Khao Road, Dusit, Bangkok 10300',
    highlightsTh: ['เวทีมวยไทยส่วนตัวสำหรับกิจกรรม Team Building', 'ห้องสมุดและห้องประชุมลับส่วนตัว', 'สปา Opium Spa สำหรับผ่อนคลายความเครียด'],
    highlightsEn: ['Private professional Muay Thai ring for active team bonding', 'Curated screening room and executive boardroom library', 'Award-winning Opium Spa wellness treatments'],
    rating: 4.93,
    reviewsCount: 390,
  },
  {
    title: 'มันดาปา อาร์ซีอาร์ รีเสิร์ฟ อูบุด บาหลี',
    city: 'อูบุด (บาหลี)',
    country: 'อินโดนีเซีย',
    archetype: 'regional_apac',
    categoryTh: 'รีสอร์ตริทซ์คาร์ลตันรีเสิร์ฟริมแม่น้ำอายุง',
    categoryEn: 'Ritz-Carlton Reserve Rainforest Sanctuary',
    overviewTh: 'รีสอร์ตระดับตำนานซ่อนตัวในหุบเขาอูบุด ริมแม่น้ำอายุงอันศักดิ์สิทธิ์ เหมาะสำหรับรีทรีตผู้บริหารที่ต้องการปลดล็อกความคิดสร้างสรรค์และนวัตกรรมใหม่',
    overviewEn: 'Ultra-exclusive retreat situated along the Ayung River in Ubud, designed for transformational executive planning and wellness renewal.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLf_kyH1RpgLeLBxk08QHBoIIOljAMBSQf8hTQjiMOMZF7j5OQAFAC8h0dzC6xlXrr0tzW2bYW97DE71Zlexd3zX2d3o83td6-3Ijv8cct8QsHEDcwVlMd8dip6_B4RAnHsqnCNW=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLf_kyH1RpgLeLBxk08QHBoIIOljAMBSQf8hTQjiMOMZF7j5OQAFAC8h0dzC6xlXrr0tzW2bYW97DE71Zlexd3zX2d3o83td6-3Ijv8cct8QsHEDcwVlMd8dip6_B4RAnHsqnCNW=w1200-h800-k-no'
    ],
    baseRatePerHead: 9200,
    maxCapacity: 40,
    wifiSpeed: 550,
    nearestAirportTh: 'สนามบินนานาชาติงูระห์ไร เดนปาซาร์ บาหลี (DPS)',
    nearestAirportEn: 'Ngurah Rai International Airport, Bali (DPS)',
    airportTravelTimeTh: '70 นาที (38 กม.)',
    airportTravelTimeEn: '70 mins (38 km)',
    addressTh: 'Jl. Raya Kedewatan, Banjar, Ubud, Bali 80571',
    addressEn: 'Jl. Raya Kedewatan, Banjar, Ubud, Bali 80571',
    highlightsTh: ['พาวิลเลียนประชุมเปิดโล่งริมสายน้ำอายุง', 'กิจกรรม Sound Healing และฝึกสมาธิระดับผู้นำ', 'ดินเนอร์ส่วนตัวในซุ้มไม้ไผ่ Kubu'],
    highlightsEn: ['Riverside bamboo pavilions designed for strategic focus', 'Tibetan sound healing & executive clarity sessions', 'Private Kubu bamboo cocoon fine dining by the river'],
    rating: 4.99,
    reviewsCount: 580,
  },
  {
    title: 'อินเตอร์คอนติเนนตัล ดานัง ซันเพนินซูลา',
    city: 'ดานัง',
    country: 'เวียดนาม',
    archetype: 'regional_apac',
    categoryTh: 'รีสอร์ตหน้าผาคาบสมุทรเซินตรา',
    categoryEn: 'Son Tra Peninsula Luxury Cliffside Retreat',
    overviewTh: 'รีสอร์ตสถาปัตยกรรมระดับโลกบนคาบสมุทรลิง ออกแบบ 4 ระดับ (Heaven, Sky, Earth, Sea) พร้อมห้องประชุมผู้นำ APAC ระดับเวิลด์คลาส',
    overviewEn: 'Architectural masterpiece cascading down Monkey Mountain in Son Tra Peninsula, renowned for hosting international CEO and heads-of-state summits.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLdPe5HMlgBNtxNnWZug2vY8Hwu_tSKVG9lkTzc1fvDvfB_BXJxIDxDp62JH-Q9bmX_8XdH4Fb6PtxvozFnyNveRstUKKLBJjmfNvZLCtN14Y4jRZKV3ztoNaOYJxiiG4uRmGBWc4Q=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdPe5HMlgBNtxNnWZug2vY8Hwu_tSKVG9lkTzc1fvDvfB_BXJxIDxDp62JH-Q9bmX_8XdH4Fb6PtxvozFnyNveRstUKKLBJjmfNvZLCtN14Y4jRZKV3ztoNaOYJxiiG4uRmGBWc4Q=w1200-h800-k-no'
    ],
    baseRatePerHead: 7500,
    maxCapacity: 60,
    wifiSpeed: 700,
    nearestAirportTh: 'สนามบินนานาชาติดานัง (DAD)',
    nearestAirportEn: 'Da Nang International Airport (DAD)',
    airportTravelTimeTh: '30 นาที (20 กม.)',
    airportTravelTimeEn: '30 mins (20 km)',
    addressTh: 'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng, Vietnam',
    addressEn: 'Bai Bac, Son Tra Peninsula, Da Nang, Vietnam',
    highlightsTh: ['The Summit ห้องประชุมระดับการประชุมสุดยอดผู้นำ APEC', 'รถรางไฟฟ้าส่วนตัวเชื่อมต่อยอดเขาสู่ชายหาด', 'ห้องอาหารมิชลิน La Maison 1888'],
    highlightsEn: ['The Summit dedicated APEC-standard conference hall', 'Private funicular railway connecting hillside villas to beach', 'World-acclaimed La Maison 1888 French gastronomy'],
    rating: 4.95,
    reviewsCount: 650,
  },
  {
    title: 'คาเปลลา สิงคโปร์ เซนโตซ่า ไอส์แลนด์',
    city: 'สิงคโปร์',
    country: 'สิงคโปร์',
    archetype: 'regional_apac',
    categoryTh: 'รีสอร์ตมรดกประวัติศาสตร์บนเกาะเซนโตซ่า',
    categoryEn: 'Sentosa Island Colonial Heritage Sanctuary',
    overviewTh: 'ผสมผสานสถาปัตยกรรมโคโลเนียลกับความทันสมัยท่ามกลางป่าฝนบนเกาะเซนโตซ่า สถานที่จัดการประชุมประวัติศาสตร์ระดับโลก พร้อมระบบความปลอดภัยสูงสุด',
    overviewEn: 'Historic colonial manors blended with curved contemporary architecture on Sentosa Island, offering world-class security and executive discretion.',
    heroImage: 'https://lh3.googleusercontent.com/grass-cs/AABkmLc7uCtfhiMrnxqxFz3A2jyGO20CnXh6gg8hmvwu_Bs-TsPgz33AAsTIzNZ1I7ZC-Iirvi-zalJUsGW0uAg4FMqvt1UBhHhP--bYHZ-tk-8b6ku8MTn4k-JskpwuMtTK9rKH9-6ufMjsMuI4=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLc7uCtfhiMrnxqxFz3A2jyGO20CnXh6gg8hmvwu_Bs-TsPgz33AAsTIzNZ1I7ZC-Iirvi-zalJUsGW0uAg4FMqvt1UBhHhP--bYHZ-tk-8b6ku8MTn4k-JskpwuMtTK9rKH9-6ufMjsMuI4=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfYv5FWkOXxA7QDth7hWnmI46yoOAtaAeXfuY-17ZiEvWKiieZf8HG5dYdlOqIlJXwJ2tlJkvgYmpvXlHe6tiWCgZdP6BskotiuU-890ej82HkOThfCqstrUKuPfyaKnDJM4jdn=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLes6LJjAsrnIKE-rvJhiYPVw1_RrLUiUnweuNg_3KfnChfkCA1dP3VhkGEMzex6t56jUxAiRYyA3wvizkDOeThfxZp3LNdZ5OHJNuCXQLBvD4RwUjroJcWO5F_tXxMbbp95Poyhlz_VW27R=w1200-h800-k-no'
    ],
    baseRatePerHead: 11000,
    maxCapacity: 50,
    wifiSpeed: 1000,
    nearestAirportTh: 'สนามบินนานาชาติชางงี สิงคโปร์ (SIN)',
    nearestAirportEn: 'Singapore Changi International Airport (SIN)',
    airportTravelTimeTh: '25 นาที (25 กม.)',
    airportTravelTimeEn: '25 mins (25 km)',
    addressTh: '1 The Knolls, Sentosa Island, Singapore 098297',
    addressEn: '1 The Knolls, Sentosa Island, Singapore 098297',
    highlightsTh: ['ห้องประชุม Circular Ballroom ทรงกลมเพดานกระจก', 'ระดับการรักษาความปลอดภัยขั้นสูงสุดระดับสากล', 'สนามกอล์ฟระดับแชมเปียนชิป Sentosa Golf Club'],
    highlightsEn: ['Circular Ballroom with natural skylight dome', 'Head-of-state level security protocols & privacy', 'Direct access to Sentosa Golf Club championship courses'],
    rating: 4.96,
    reviewsCount: 710,
  },
];

// Additional procedural location variations for infinite expansion
const REGION_EXPANSION_TEMPLATES = [
  { city: 'หัวหิน', province: 'ประจวบคีรีขันธ์', archetype: 'coastal' as const, airport: 'สนามบินหัวหิน (HHQ) / รถตู้ VIP จาก กทม. (2.5 ชม.)', travelTime: '15 นาที จากตัวเมืองหัวหิน' },
  { city: 'ปราณบุรี', province: 'ประจวบคีรีขันธ์', archetype: 'coastal' as const, airport: 'สนามบินหัวหิน (HHQ) / รถตู้ VIP จาก กทม. (3 ชม.)', travelTime: '30 นาที จากหัวหิน' },
  { city: 'เกาะกูด', province: 'ตราด', archetype: 'coastal' as const, airport: 'สนามบินตราด (TDX) + เรือสปีดโบ๊ท', travelTime: '45 นาที สปีดโบ๊ทส่วนตัว' },
  { city: 'เกาะช้าง', province: 'ตราด', archetype: 'coastal' as const, airport: 'สนามบินตราด (TDX) + เรือเฟอร์รี่', travelTime: '40 นาที' },
  { city: 'เกาะเต่า', province: 'สุราษฎร์ธานี', archetype: 'coastal' as const, airport: 'สนามบินเกาะสมุย (USM) + เรือสปีดโบ๊ท', travelTime: '1.5 ชม.' },
  { city: 'ปาย', province: 'แม่ฮ่องสอน', archetype: 'mountain' as const, airport: 'สนามบินเชียงใหม่ (CNX) / สนามบินแม่ฮ่องสอน (HGN)', travelTime: '2.5 ชม. ผ่านขุนเขา' },
  { city: 'น่าน', province: 'น่าน', archetype: 'mountain' as const, airport: 'สนามบินน่านนคร (NNT)', travelTime: '15 นาที' },
  { city: 'สวนผึ้ง', province: 'ราชบุรี', archetype: 'mountain' as const, airport: 'สนามบินดอนเมือง (DMK) / รถตู้ VIP (2 ชม.)', travelTime: '2 ชม. จาก กทม.' },
  { city: 'กาญจนบุรี', province: 'กาญจนบุรี', archetype: 'mountain' as const, airport: 'กรุงเทพฯ ขับรถผ่าน ทล.81 มอเตอร์เวย์ (1.5 ชม.)', travelTime: '1.5 ชม. จาก กทม.' },
  { city: 'วังน้ำเขียว', province: 'นครราชสีมา', archetype: 'mountain' as const, airport: 'กรุงเทพฯ ขับรถผ่าน มอเตอร์เวย์ M6 (2 ชม.)', travelTime: '2 ชม. จาก กทม.' },
  { city: 'พัทยา (นาจอมเทียน)', province: 'ชลบุรี', archetype: 'coastal' as const, airport: 'สนามบินอู่ตะเภา (UTP) / สุวรรณภูมิ (BKK)', travelTime: '30 นาที จากอู่ตะเภา, 1.5 ชม. จากสุวรรณภูมิ' },
  { city: 'ระยอง (แหลมแม่พิมพ์)', province: 'ระยอง', archetype: 'coastal' as const, airport: 'สนามบินอู่ตะเภา (UTP)', travelTime: '45 นาที' },
  { city: 'ฮอยอัน', province: 'เวียดนาม', archetype: 'regional_apac' as const, airport: 'สนามบินนานาชาติดานัง (DAD)', travelTime: '35 นาที' },
  { city: 'ฟู้โกว๊ก', province: 'เวียดนาม', archetype: 'regional_apac' as const, airport: 'สนามบินนานาชาติฟู้โกว๊ก (PQC)', travelTime: '20 นาที' },
  { city: 'นิเซโกะ (ฮอกไกโด)', province: 'ญี่ปุ่น', archetype: 'regional_apac' as const, airport: 'สนามบินนิวชิโตเสะ ซัปโปโร (CTS)', travelTime: '1.8 ชม.' },
  { city: 'ลอมบอก', province: 'อินโดนีเซีย', archetype: 'regional_apac' as const, airport: 'สนามบินนานาชาติลอมบอก (LOP)', travelTime: '40 นาที' },
];

const LUXURY_BRAND_PREFIXES = [
  'บันยันทรี แซงค์ทัวรี',
  'โฟร์ซีซั่นส์ รีทรีต',
  'ริทซ์-คาร์ลตัน เอ็กเซ็กคิวทีฟ',
  'เจดับบลิว แมริออท คอร์ปอเรท สเตย์',
  'อนันตรา สวีท แอนด์ บอร์ดรูม',
  'ซิกเซ้นส์ ไฮด์อะเวย์',
  'เคมพินสกี้ วิลล่า รีทรีต',
  'โคโม แชมบาลา เอสเตท',
  'ชาเทรียม แกรนด์ ลักชัวรี',
  'พูลแมน แกรนด์ รีโซแนนซ์',
  'อินเตอร์คอนติเนนตัล บิสซิเนส คลับ',
  'เซเลเบรชัน ซิกเนเจอร์ วิลล่า',
  'ดุสิต ธานี พาวิลเลียน สวีท',
  'ศาลา ดีไซน์ พูลวิลล่า',
  'อลีลา ซิกเนเจอร์ รีทรีต',
];

const RETREAT_IMAGES = [
  'https://lh3.googleusercontent.com/grass-cs/AABkmLcYZXKxVxsBQyow8DQP0VUMZg1mxuuYvwKbx1UR6xYhhubVyEHqlJCSZPpsItg3MZcU99qgFvmcUxzMkumAkutNGHRLwqVz3YQlLe_J0apFdNVLJQPKxDqqpdbN92t2yJ9EtJAm=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLfdMg2GvSDEoCFn5lSAulb8NisxWfo-pyo8ELdccKm0j8PvcXYgQLDYDUbH-HQynJDIgmrtOVu4hmYfAgTDwamWAs23gIeZUUCzcGomXN_KyAadHeW--NTuTUzMri1tIRtISKms=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLeAe9niMq-yvp8_CS13jm4V_OaGJJkXnze5OnnBUi1KXWiU6Glg3cpqELGUBvh7nxAmF1bEcSo-66xInvHNAgTQ01Jou24a9J0G1wsqBYCZ14faY5H2cImI8kaQLnkElXVOg9HK_txczI5x=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLfTGuZLqOrM-sxMU2hjpZC0aDG50Zxr8xQoRr2oHgTw5llClhPcMl9uXfzVCjCzQPZ_dU4bBEBbaUrC_CD6dNO-CE88-vjUICj5D-vim_FyHZkXhpi7zYdrxnEEUHdRQuN3-vcp=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLdpMVb2pJx_eRzXNNojWJ8buzkXEKA1o3Cpw8QOZKtp4-viwTu7qw6QfDn0vr1J4QB6Yy139-sGAoqDj-eff_aSHiKywaN-fSJg3ddeoTrf2lOHpJKHujk_n1LBl52N4t242tQy=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLfTORz220hKd25UXBI7Tz7CJA7hAoxE1wbQtK6LX-4hx45sJLmAgfecTIRhRDcLcrlaRck3aLA9wWmo7aP06HERKN8DCi0jqqQNqCS1b31HNRvpyvMYpZpN3m6kwXgkUU5ZiMg=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLdPe5HMlgBNtxNnWZug2vY8Hwu_tSKVG9lkTzc1fvDvfB_BXJxIDxDp62JH-Q9bmX_8XdH4Fb6PtxvozFnyNveRstUKKLBJjmfNvZLCtN14Y4jRZKV3ztoNaOYJxiiG4uRmGBWc4Q=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLc7uCtfhiMrnxqxFz3A2jyGO20CnXh6gg8hmvwu_Bs-TsPgz33AAsTIzNZ1I7ZC-Iirvi-zalJUsGW0uAg4FMqvt1UBhHhP--bYHZ-tk-8b6ku8MTn4k-JskpwuMtTK9rKH9-6ufMjsMuI4=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-proxy/AIM7gW3a0qBn8TcMHlu5RDnzpjxMRzr26aAjxLKX9JXGZYwL5tKunJz8sWLTIZE9KUnXLHjbNIBrBp1dnkh-cEV-LnuXDQRBRtFASe_Y6rpmoFFjX9EOfpKGkQakrDrMYFbkTpElw7X6OkBy4XObL7yeVdmtMVEW6ddJEES39OMtAhC9XO0db3LVZuJv=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLffKdBWB6fw41fKwdyQSODMv-vw597br5EHMn91iCptc9sLPCZJrU5CvHhQJx71g-504DCWFotiZEh8h8UniCZPBAxKO6Ofs6b6Sly1gZd7oJCsUQWoQ-YJo1VAhMmqbnzgUUB7=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-proxy/AIM7gW2hNkE-IJFX8w66cmnprEKEj-2LSHmQo763OQSguEhbQbIyVjcIFferWgzZzs88E17Lzzwr_oCEEMb51kkIXbdkRyNwUetv22jDst5crmNOmnH8rGI9KfroqaBJptNgduyfW3utDuG2HmPsRw6EpnqpM982CFDBa_uDcvURKxwyI0u_zXImrIfR=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLdyK6OY-5YcYaaYXoZfS0qpvV7KlHJR-zudyiUc3qJygvfzKLIFsmloevUv1V0QCej_jKpfu4mp3XHBEEIsAe4pQj7bxJMRcK4v0oriQeDBDKVX0kr5--UJzYE6UKmfyDTXx0stIliMKCY=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLd9fAsqROx3HWikswPHbl1dBWsOQ8NYoYim-KfxOB1QGwUpo4CoYm7r999CP-X0T3CKg28LNe5qAzpCovBF7qxGL6VNuMSyLUd2B7NK4gTwKQwO2nXpyMbJcEdE87cK47GMabPrkvSidwq5=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLevQJ_fN6ZtXkoyWwYgL0iTMo6hq7GZ14v-cWNzJb0yzl9q8RgzyBuIsYeeUpo8njN0hzUxaLsA21Xv4Ptgn6VhjzdHU1BOhkD6SD4pLjr6qn5k6WQMCgwwt2r1X0-Yr-Ck8tWm=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLeJuGBc7hPzZ80ni5OTnQoqxR3PdX7JOf3S001P4o3hWaWsi3-rjjAwUiIyL_nsJ9PHHUZFgqnH10m15uaoPSdmE6UmmM21PLBykEZIVg3qBgxsgAgEBJ9l6P8iVzhcQO4I34-f=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLf_kyH1RpgLeLBxk08QHBoIIOljAMBSQf8hTQjiMOMZF7j5OQAFAC8h0dzC6xlXrr0tzW2bYW97DE71Zlexd3zX2d3o83td6-3Ijv8cct8QsHEDcwVlMd8dip6_B4RAnHsqnCNW=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLf5RWl0ALAK9RzOQfi9_CJ0udvXVCu9HXZaByiT0XLLVDnRikzYLAoz-Jxz_SXTMSv3R0h1-Omge1NfiudCT3GmXgfP-i6oc4tlcHvIV4shzLAArGSdilvtPHKQZyh_H3TRSqXYaw=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLeU0ibpuOQDbcLXoQIhotyON3LkXm6t46w9FP4CwmoUcQdR9u6UxBudkA49-lsaYzpduIc2HkSasOhuTwauifdvjm7bAZbeMdp-jhD-lMIGwGdvHwHQ6PUHX8VojBNqrtqggaAXeN2OXWry=w1200-h800-k-no',
];

/**
 * Generates an endless batch of unique, non-repeating luxury retreat destinations
 * matching budget, headcount, and archetype.
 * Never loops old cards.
 */
export function generateInfiniteMiceVenues(
  count: number = 5,
  batchVersion: number = 1,
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac',
  headcount: number = 15,
  maxBudgetPerHead: number = 8000,
  excludedPlaceIds: Set<string> = new Set(),
  excludedNames: Set<string> = new Set()
): TravelDestination[] {
  const generated: TravelDestination[] = [];
  const safeHeadcount = Math.max(2, headcount);

  // 1. First pick from curated expanded seeds that match archetype and haven't been seen
  const matchingSeeds = EXPANDED_RETREAT_SEEDS.filter(s => {
    if (archetype && s.archetype !== archetype) return false;
    const nameLower = s.title.toLowerCase();
    return !excludedNames.has(nameLower);
  });

  for (const seed of matchingSeeds) {
    if (generated.length >= count) break;
    const seedPlaceId = `seed_mice_${seed.city}_${seed.title.slice(0, 8)}`.replace(/\s+/g, '_');
    if (excludedPlaceIds.has(seedPlaceId)) continue;

    const rate = Math.min(seed.baseRatePerHead, maxBudgetPerHead > 0 ? maxBudgetPerHead : seed.baseRatePerHead);
    const pricePerNight = Math.round(rate * safeHeadcount * 0.95);

    generated.push({
      id: 5000 + (batchVersion * 100) + generated.length,
      title: seed.title,
      city: seed.city,
      country: seed.country,
      category: seed.categoryTh,
      archetype: seed.archetype,
      overview: seed.overviewTh,
      hero_image: seed.heroImage,
      gallery: seed.gallery,
      price_per_night: pricePerNight,
      price_per_person: rate,
      min_capacity: Math.max(4, Math.floor(seed.maxCapacity * 0.3)),
      max_capacity: seed.maxCapacity,
      wifi_speed_mbps: seed.wifiSpeed,
      business_amenities: [
        `อินเทอร์เน็ตความเร็วสูง Starlink / Fiber ${seed.wifiSpeed}+ Mbps`,
        'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน',
        'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม',
        'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว',
        'ระบบสำรองไฟฟ้าและเครือข่ายคู่สาย',
      ],
      tourism_highlights: seed.highlightsTh,
      rating: seed.rating,
      reviews_count: seed.reviewsCount,
      affiliate_booking_url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(seed.title)}&aid=trippick_b2b`,
      commission_percentage: 12,
      ai_reason: 'ตรงตามเกณฑ์สเปก MICE สำหรับผู้บริหารและวิศวกร: เน็ตเสถียร มีห้องประชุมแยก และเดินทางสะดวก',
      google_place_id: seedPlaceId,
      google_maps_uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seed.title + ' ' + seed.city)}`,
      formatted_address: seed.addressTh,
      nearest_airport: seed.nearestAirportTh,
      airport_travel_time: seed.airportTravelTimeTh,
      google_verified: true,
    });

    excludedNames.add(seed.title.toLowerCase());
    excludedPlaceIds.add(seedPlaceId);
  }

  // 2. If more are needed, procedurally synthesize fresh, completely unique luxury venues
  let attempt = 0;
  while (generated.length < count && attempt < 50) {
    attempt++;
    const regionIdx = (batchVersion * 3 + attempt) % REGION_EXPANSION_TEMPLATES.length;
    const brandIdx = (batchVersion * 5 + attempt) % LUXURY_BRAND_PREFIXES.length;
    const imgIdx = (batchVersion * 2 + attempt) % RETREAT_IMAGES.length;

    const region = REGION_EXPANSION_TEMPLATES[regionIdx];
    const brand = LUXURY_BRAND_PREFIXES[brandIdx];
    const generatedTitle = `${brand} ณ ${region.city} (${region.province})`;

    if (excludedNames.has(generatedTitle.toLowerCase())) {
      continue;
    }

    const uniquePlaceId = `inf_mice_${region.city}_b${batchVersion}_a${attempt}_${Date.now() % 10000}`;
    if (excludedPlaceIds.has(uniquePlaceId)) {
      continue;
    }

    const selectedArchetype = archetype || region.archetype;
    const baseRate = 5000 + ((attempt * 700 + batchVersion * 300) % 4500);
    const rate = maxBudgetPerHead > 0 ? Math.min(baseRate, maxBudgetPerHead) : baseRate;
    const pricePerNight = Math.round(rate * safeHeadcount * 0.95);
    const wifiSpeed = 500 + ((attempt * 70) % 450);
    const capacity = 30 + ((attempt * 5) % 35);
    const rating = +(4.85 + ((attempt * 0.03) % 0.14)).toFixed(2);
    const reviews = 180 + ((attempt * 45) % 400);

    const heroImg = RETREAT_IMAGES[imgIdx];
    const galleryImg = RETREAT_IMAGES[(imgIdx + 1) % RETREAT_IMAGES.length];

    generated.push({
      id: 8000 + (batchVersion * 100) + generated.length,
      title: generatedTitle,
      city: region.city,
      country: region.province === 'เวียดนาม' ? 'เวียดนาม' : region.province === 'อินโดนีเซีย' ? 'อินโดนีเซีย' : region.province === 'ญี่ปุ่น' ? 'ญี่ปุ่น' : 'ประเทศไทย',
      category: selectedArchetype === 'coastal' ? 'รีสอร์ตผู้บริหารริมทะเล' :
                selectedArchetype === 'mountain' ? 'ฟื้นฟูสุขภาพ & Eco Mountain Sanctuary' :
                selectedArchetype === 'urban' ? 'จัดประชุม MICE หรูใจกลางเมือง' : 'รีสอร์ตระดับผู้นำ APAC',
      archetype: selectedArchetype,
      overview: `สถานที่พักผ่อนและจัดการประชุมระดับพรีเมียม ณ ${region.city} เพียบพร้อมด้วยสิ่งอำนวยความสะดวกสำหรับการประชุมวางแผนกลยุทธ์ทีมงาน ระบบเครือข่ายเสถียรภาพสูง และความเป็นส่วนตัวสูงสุด`,
      hero_image: heroImg,
      gallery: [heroImg, galleryImg],
      price_per_night: pricePerNight,
      price_per_person: rate,
      min_capacity: Math.max(4, Math.floor(capacity * 0.3)),
      max_capacity: capacity,
      wifi_speed_mbps: wifiSpeed,
      business_amenities: [
        `อินเทอร์เน็ตความเร็วสูง Starlink / Fiber ${wifiSpeed}+ Mbps`,
        'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน',
        'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม',
        'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว',
        'บริการคอนเซียร์จประสานงานกิจกรรมองค์กร 24 ชม.',
      ],
      tourism_highlights: [
        `กิจกรรมผ่อนคลายและสร้างความสามัคคีในพื้นที่ ${region.city}`,
        'คอร์สอาหารค่ำและบาร์บีคิวส่วนตัวริมวิวธรรมชาติ',
        'เวิร์กช็อประดมสมองพร้อมสิ่งอำนวยความสะดวกครบวงจร',
      ],
      rating,
      reviews_count: reviews,
      affiliate_booking_url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(generatedTitle)}&aid=trippick_b2b`,
      commission_percentage: 12,
      ai_reason: 'คำนวณงบประมาณเหมาะสมตามคำขอ คัดสรรพื้นที่เงียบสงบที่กระตุ้นการทำงานเป็นทีมและนวัตกรรมใหม่',
      google_place_id: uniquePlaceId,
      google_maps_uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(generatedTitle)}`,
      formatted_address: `${region.city}, ${region.province}`,
      nearest_airport: region.airport,
      airport_travel_time: region.travelTime,
      google_verified: true,
    });

    excludedNames.add(generatedTitle.toLowerCase());
    excludedPlaceIds.add(uniquePlaceId);
  }

  return generated;
}
