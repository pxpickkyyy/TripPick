export interface BusinessAmenity {
  id: string;
  name: string;
  icon: string;
  category: 'workspace' | 'leisure' | 'connectivity' | 'hospitality';
}

export interface TravelDestination {
  id: number;
  title: string;
  city: string;
  country: string;
  category: string;
  overview: string;
  hero_image: string;
  gallery: string[];
  price_per_night: number; // in THB
  price_per_person: number; // in THB
  min_capacity: number;
  max_capacity: number;
  wifi_speed_mbps: number;
  business_amenities: string[];
  tourism_highlights: string[];
  rating: number;
  reviews_count: number;
  affiliate_booking_url: string;
  commission_percentage: number;
  ai_reason: string;
  virtual_tour_id?: string;
  is_sponsored?: boolean;
}

export const ALL_AMENITIES: BusinessAmenity[] = [
  { id: 'wifi', name: 'อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', icon: 'เน็ต', category: 'connectivity' },
  { id: 'boardroom', name: 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', icon: 'ประชุม', category: 'workspace' },
  { id: 'private_pool', name: 'สระว่ายน้ำส่วนตัวริมผา/ติดหาด', icon: 'สระว่ายน้ำ', category: 'leisure' },
  { id: 'team_dining', name: 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม', icon: 'อาหาร', category: 'hospitality' },
  { id: 'airport_shuttle', name: 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว', icon: 'รถตู้ VIP', category: 'hospitality' },
  { id: 'coworking', name: 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ', icon: 'ทำงาน', category: 'workspace' },
  { id: 'wellness', name: 'สปา นวดแผนไทย & คลาสโยคะผ่อนคลาย', icon: 'สปา', category: 'leisure' },
  { id: 'adventure', name: 'ล่องเรือยอชต์ส่วนตัว & กิจกรรมกระชับมิตร', icon: 'กิจกรรม', category: 'leisure' },
];

export const CURATED_DESTINATIONS: TravelDestination[] = [
  {
    id: 101,
    title: 'ตรีสรา โอเชียนฟรอนต์ เอ็กเซ็กคิวทีฟ แซงค์ทัวรี',
    city: 'ภูเก็ต',
    country: 'ประเทศไทย',
    category: 'รีสอร์ตผู้บริหารระดับพรีเมียม',
    overview: 'พูลวิลล่าส่วนตัวบนแนวชายฝั่งตะวันตกเฉียงเหนือของภูเก็ต มาพร้อมอินเทอร์เน็ตความเร็วสูง Starlink ห้องประชุมเปิดโล่งรับลมทะเลอันดามัน และมื้อค่ำอาหารทะเลระดับมิชลินสำหรับทีมผู้นำระดับผู้บริหาร',
    hero_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 42000,
    price_per_person: 6500,
    min_capacity: 6,
    max_capacity: 28,
    wifi_speed_mbps: 450,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'สระว่ายน้ำส่วนตัวริมผา/ติดหาด', 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว'],
    tourism_highlights: ['ล่องเรือคาตามารันส่วนตัวชมพระอาทิตย์ตก', 'ดำน้ำชมปะการังน้ำตื้น', 'ดินเนอร์มิชลิน Farm-to-Table'],
    rating: 4.96,
    reviews_count: 184,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/trisara.html?aid=trippick_b2b',
    commission_percentage: 12,
    ai_reason: 'ความเป็นส่วนตัวสูงสุดและวิวทะเลอันดามันพาโนรามา เหมาะสำหรับวางแผนกลยุทธ์ประจำปีของฝ่ายบริหาร',
    virtual_tour_id: '1aBcDeFgHiJ',
    is_sponsored: true
  },
  {
    id: 102,
    title: 'ระยา เฮอริเทจ ล้านนา อีโค ออฟไซต์ ฮับ',
    city: 'เชียงใหม่',
    country: 'ประเทศไทย',
    category: 'ฟื้นฟูสุขภาพ & Eco Retreat',
    overview: 'รีสอร์ตริมแม่น้ำปิงอันเงียบสงบ ผสมผสานจิตวิญญาณสถาปัตยกรรมล้านนากับพื้นที่ทำงานที่เป็นกลางทางคาร์บอน ศาลาระดมสมองริมน้ำ พิธีชงชา และโซนนั่งทำงานเพื่อจุดประกายความคิดสร้างสรรค์',
    hero_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 23500,
    price_per_person: 3800,
    min_capacity: 8,
    max_capacity: 35,
    wifi_speed_mbps: 380,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ', 'สปา นวดแผนไทย & คลาสโยคะผ่อนคลาย', 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม'],
    tourism_highlights: ['ล่องเรือหางยาวแม่น้ำปิง', 'เรียนรู้วิถีฟาร์มออร์แกนิกสไตล์ล้านนา', 'สวดมนต์และนั่งสมาธิชมพระอาทิตย์ขึ้นดอยสุเทพ'],
    rating: 4.92,
    reviews_count: 215,
    affiliate_booking_url: 'https://www.agoda.com/raya-heritage/hotel/chiang-mai-th.html?cid=trippick',
    commission_percentage: 11,
    ai_reason: 'พื้นที่สงบเยียวยาภาวะหมดไฟของทีมเทคโนโลยี ช่วยสร้างไอเดียใหม่ๆ ได้อย่างมีประสิทธิภาพ'
  },
  {
    id: 103,
    title: 'ดับเบิ้ลยู สมุย บีชฟรอนต์ อินโนเวชัน วิลล่า',
    city: 'เกาะสมุย',
    country: 'ประเทศไทย',
    category: 'ทำงานพักผ่อน (Bleisure & Coworking)',
    overview: 'การรวมตัวของพลังงานชีวิตที่สดใสและประสิทธิภาพการทำงาน คาบาน่าริมหาดพร้อมปลั๊กและเน็ต สระว่ายน้ำอินฟินิตี้ส่วนตัวทุกหลัง ปาร์ตี้ดีเจยามพระอาทิตย์ตก และห้อง Great Room สำหรับพรีเซนต์งานสำคัญ',
    hero_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 33000,
    price_per_person: 5100,
    min_capacity: 10,
    max_capacity: 45,
    wifi_speed_mbps: 500,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'สระว่ายน้ำส่วนตัวริมผา/ติดหาด', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว'],
    tourism_highlights: ['ทัวร์สปีดโบ๊ทหมู่เกาะอ่างทอง', 'การแสดงควงกระบองไฟริมหาด', 'แพดเดิลบอร์ดโยคะกลางทะเล'],
    rating: 4.88,
    reviews_count: 310,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/w-retreat-koh-samui.html?aid=trippick_b2b',
    commission_percentage: 13,
    ai_reason: 'บรรยากาศสนุกสนานที่เปลี่ยนการจัดออฟไซต์ธรรมดาให้เป็นความทรงจำที่น่าประทับใจของทุกคนในทีม'
  },
  {
    id: 104,
    title: 'รายาวดี มารีน จังเกิล พาวิลเลียน',
    city: 'กระบี่',
    country: 'ประเทศไทย',
    category: 'ผจญภัยกระชับมิตรทีม',
    overview: 'โอบล้อมด้วย 3 ชายหาดและยอดเขาหินปูนสูงตระหง่านใจกลางอุทยานแห่งชาติทางทะเล เหมาะสำหรับการผจญภัยเสริมสร้างความสามัคคี ควบคู่กับอาหารค่ำสุดหรูในถ้ำหินปูนและห้องประชุมกลางป่าเขตร้อน',
    hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 28500,
    price_per_person: 4500,
    min_capacity: 8,
    max_capacity: 32,
    wifi_speed_mbps: 320,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม', 'ล่องเรือยอชต์ส่วนตัว & กิจกรรมกระชับมิตร'],
    tourism_highlights: ['ดินเนอร์ในถ้ำพระนางอันโด่งดัง', 'กิจกรรมปีนหน้าผาหินปูนจำลองทีมเวิร์ก', 'ทัวร์เรือเร็วส่วนตัวข้ามเกาะ'],
    rating: 4.94,
    reviews_count: 168,
    affiliate_booking_url: 'https://www.agoda.com/rayavadee-hotel/hotel/krabi-th.html?cid=trippick',
    commission_percentage: 10,
    ai_reason: 'ทัศนียภาพธรรมชาติอันตระการตาที่ถูกออกแบบมาเพื่อสร้างความไว้วางใจและการผูกสัมพันธ์ในทีม'
  },
  {
    id: 105,
    title: 'คาเพลลา กรุงเทพฯ ริเวอร์ไซด์ ซัมมิท เลานจ์',
    city: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    category: 'จัดประชุม MICE หรูใจกลางเมือง',
    overview: 'โอเอซิสริมแม่น้ำเจ้าพระยา นำเสนอสิ่งอำนวยความสะดวกในการจัดประชุมผู้บริหารระดับโลก อาหารระดับดาวมิชลิน วิลล่าริมน้ำส่วนตัว และบริการวางแผนการประชุมระดับองค์กรอย่างสมบูรณ์แบบ',
    hero_image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 38000,
    price_per_person: 5900,
    min_capacity: 10,
    max_capacity: 60,
    wifi_speed_mbps: 600,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว'],
    tourism_highlights: ['ล่องเรือยอชต์ดินเนอร์ชมแม่น้ำเจ้าพระยา', 'ทัวร์ชมสถาปัตยกรรมพระบรมมหาราชวังแบบส่วนตัว', 'เวิร์กช็อปผสมเครื่องดื่มค็อกเทลบนดาดฟ้า'],
    rating: 4.98,
    reviews_count: 240,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/capella-bangkok.html?aid=trippick_b2b',
    commission_percentage: 12,
    ai_reason: 'โรงแรมอันดับ 1 ของโลกที่ผสมผสานความสะดวกใจกลางเมืองหลวงกับความเงียบสงบริมสายน้ำ'
  },
  {
    id: 106,
    title: 'โปเตโต้ เฮด เดซ่า บาหลี ครีเอทีฟ แล็บ',
    city: 'บาหลี',
    country: 'อินโดนีเซีย',
    category: 'ทำงานพักผ่อน (Bleisure & Coworking)',
    overview: 'มาตรฐานระดับโลกสำหรับออฟไซต์ของบริษัทเทคโนโลยีและเอเจนซี่ดีไซน์ สถาปัตยกรรมไร้ขยะ (Zero-Waste) อัฒจันทร์ไม้ไผ่ พื้นที่ทำงานริมหาด และวัฒนธรรมดนตรียามเย็นริมหาดเซมินยัค',
    hero_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 26000,
    price_per_person: 4200,
    min_capacity: 8,
    max_capacity: 50,
    wifi_speed_mbps: 400,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ', 'สระว่ายน้ำส่วนตัวริมผา/ติดหาด', 'สปา นวดแผนไทย & คลาสโยคะผ่อนคลาย'],
    tourism_highlights: ['เวิร์กช็อป Circular Design เพื่อความยั่งยืน', 'ชมพระอาทิตย์ตกบนหน้าผาอูลูวาตู', 'คอร์สเรียนเล่นเซิร์ฟบอร์ด'],
    rating: 4.91,
    reviews_count: 420,
    affiliate_booking_url: 'https://www.booking.com/hotel/id/desa-potato-head.html?aid=trippick_b2b',
    commission_percentage: 11,
    ai_reason: 'สถานที่ดึงดูดใจสำหรับทีมดีไซน์ สตาร์ทอัพ และผู้ก่อตั้งสายเทคโนโลยีรุ่นใหม่'
  },
  {
    id: 107,
    title: 'อินเตอร์คอนติเนนตัล ดานัง คลิฟท็อป MICE วิลล่า',
    city: 'ดานัง',
    country: 'เวียดนาม',
    category: 'จัดประชุม MICE หรูใจกลางเมือง',
    overview: 'ผลงานชิ้นเอกที่ออกแบบโดย บิล เบนส์ลีย์ ข้ามภูเขาลิง วิลล่าสำหรับการประชุมระดับผู้นำพร้อมบริการบัตเลอร์ส่วนตัว ร้านอาหารระดับมิชลิน และรถรางไฟฟ้าส่วนตัวลงสู่อ่าวชายหาด',
    hero_image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565031491910-e57fac030c41?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 31000,
    price_per_person: 4900,
    min_capacity: 10,
    max_capacity: 70,
    wifi_speed_mbps: 450,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว', 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม'],
    tourism_highlights: ['ทัวร์เมืองเก่าฮอยอันชมโคมไฟโบราณ', 'เยือนสะพานมือยักษ์บานาฮิลล์', 'กีฬาทางน้ำบนชายหาดส่วนตัว'],
    rating: 4.93,
    reviews_count: 198,
    affiliate_booking_url: 'https://www.agoda.com/intercontinental-danang-sun-peninsula-resort/hotel/da-nang-vn.html?cid=trippick',
    commission_percentage: 12,
    ai_reason: 'ความยิ่งใหญ่อลังการที่ภูเขาบรรจบกับท้องทะเล สำหรับการประชุมระดับภูมิภาค APAC'
  },
  {
    id: 108,
    title: 'คาเพลลา เซ็นโตซ่า เฮอริเทจ ลีดเดอร์ชิพ เอ็นเคลฟ',
    city: 'เซ็นโตซ่า',
    country: 'สิงคโปร์',
    category: 'รีสอร์ตผู้บริหารระดับพรีเมียม',
    overview: 'คฤหาสน์สไตล์โคโลเนียลท่ามกลางพื้นที่ธรรมชาติกว่า 30 เอเคอร์บนเกาะเซ็นโตซ่า สถานที่จัดการประชุมระดับผู้นำนานาชาติ มีพูลวิลล่าส่วนตัว ระบบรักษาความปลอดภัยระดับสูงสุด และห่างจากย่านการเงินเพียง 10 นาที',
    hero_image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 51000,
    price_per_person: 8400,
    min_capacity: 6,
    max_capacity: 30,
    wifi_speed_mbps: 800,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว', 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ'],
    tourism_highlights: ['คาบาน่า VIP ที่ตันจงบีชคลับ', 'ทัวร์กลางคืนไนท์ซาฟารีแบบส่วนตัว', 'ทัวร์ชิมอาหารระดับมิชลินสตาร์'],
    rating: 4.97,
    reviews_count: 275,
    affiliate_booking_url: 'https://www.booking.com/hotel/sg/capella-singapore.html?aid=trippick_b2b',
    commission_percentage: 10,
    ai_reason: 'ความปลอดภัยสูงสุด ความเป็นส่วนตัวระดับสากล และการเชื่อมต่อที่รวดเร็วสำหรับการประชุมบอร์ดบริหาร'
  }
];

export function getFallbackDestinations(
  vibe?: string,
  minBudget?: number,
  maxBudget?: number,
  categoryFilter?: string
): TravelDestination[] {
  let list = [...CURATED_DESTINATIONS];

  if (categoryFilter && categoryFilter !== 'ทุกหมวดหมู่') {
    list = list.filter(d => d.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }

  if (vibe) {
    const v = vibe.toLowerCase();
    list.sort((a, b) => {
      const aScore = (a.category.toLowerCase().includes(v) ? 2 : 0) +
                     (a.overview.toLowerCase().includes(v) ? 1 : 0) +
                     (a.city.toLowerCase().includes(v) ? 2 : 0);
      const bScore = (b.category.toLowerCase().includes(v) ? 2 : 0) +
                     (b.overview.toLowerCase().includes(v) ? 1 : 0) +
                     (b.city.toLowerCase().includes(v) ? 2 : 0);
      return bScore - aScore;
    });
  }

  if (minBudget && maxBudget) {
    list = list.filter(d => d.price_per_person >= minBudget && d.price_per_person <= maxBudget);
    if (list.length === 0) list = CURATED_DESTINATIONS;
  }

  return list;
}
