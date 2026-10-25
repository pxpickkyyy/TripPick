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
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
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
  // Google Places API (New) & Google Routes
  google_place_id?: string;
  google_maps_uri?: string;
  formatted_address?: string;
  airport_travel_time?: string;
  nearest_airport?: string;
  google_verified?: boolean;
  // Two-Tier Consensus & Compromise telemetry
  isCompromiseMatch?: boolean;
  compromiseLabel?: string;
  vibe_category?: string;
  // Executive Governance & Veto Guard
  vetoedByExecutive?: boolean;
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
    archetype: 'coastal',
    overview: 'พูลวิลล่าส่วนตัวบนแนวชายฝั่งตะวันตกเฉียงเหนือของภูเก็ต มาพร้อมอินเทอร์เน็ตความเร็วสูง Starlink ห้องประชุมเปิดโล่งรับลมทะเลอันดามัน และมื้อค่ำอาหารทะเลระดับมิชลินสำหรับทีมผู้นำระดับผู้บริหาร',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLcYZXKxVxsBQyow8DQP0VUMZg1mxuuYvwKbx1UR6xYhhubVyEHqlJCSZPpsItg3MZcU99qgFvmcUxzMkumAkutNGHRLwqVz3YQlLe_J0apFdNVLJQPKxDqqpdbN92t2yJ9EtJAm=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLcYZXKxVxsBQyow8DQP0VUMZg1mxuuYvwKbx1UR6xYhhubVyEHqlJCSZPpsItg3MZcU99qgFvmcUxzMkumAkutNGHRLwqVz3YQlLe_J0apFdNVLJQPKxDqqpdbN92t2yJ9EtJAm=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLe5E-f-Uas47u5VXBs0hDQtKSZ0VXRdLbO35fIB5Rwnzu-XO8uh9L66RO7TM20Uw2s-Mf4tNCG_wqNe--E0b4Xm8eDoqrnulbpZ6RMctaqV3obmxXugfo_BRjkxagVQ3QGDD6ahSA=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfpnKt2gIpS4ocf0dGkWURLeNUsrARWObdiIX0TH38ZjzDO-0Ovsz1-oMa8ypJ-zPsngJfXB-bOCLDdxbs9YwuMAkfOMYl-geFJPN-l4Vk475oN-HTCRkN85Lgtl6Yp61hqp9zPj0tNqm_r=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeLL1ApK2Wc3yJcUvJP_8rcrnsjytsxHLkYIu4H3RqDsO4TKIiTTjdtHkcTtg2lm7j9g6e4b4c5uLdPwBNGImqyxYP1uSf-LIclvQhSllqLRhMMfGFDwcvjN-ZycHc46JXMFUjO=w1200-h800-k-no'
    ],
    price_per_night: 42000,
    price_per_person: 6000,
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
    is_sponsored: true,
    google_place_id: 'ChIJVXN2d_44UDARFpYg_m3_rWw',
    google_maps_uri: 'https://maps.google.com/?cid=1244465487635678912',
    formatted_address: '60/5 Moo 6, Srisoonthorn Rd, Cherngtalay, Thalang, Phuket 83110 Thailand',
    nearest_airport: 'สนามบินนานาชาติภูเก็ต (HKT)',
    airport_travel_time: '18 นาที (12.4 กม. ผ่าน ทล.4018)',
    google_verified: true
  },
  {
    id: 102,
    title: 'ระยา เฮอริเทจ ล้านนา อีโค ออฟไซต์ ฮับ',
    city: 'เชียงใหม่',
    country: 'ประเทศไทย',
    category: 'ฟื้นฟูสุขภาพ & Eco Retreat',
    archetype: 'mountain',
    overview: 'รีสอร์ตริมแม่น้ำปิงอันเงียบสงบ ผสมผสานจิตวิญญาณสถาปัตยกรรมล้านนากับพื้นที่ทำงานที่เป็นกลางทางคาร์บอน ศาลาระดมสมองริมน้ำ พิธีชงชา และโซนนั่งทำงานเพื่อจุดประกายความคิดสร้างสรรค์',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfdMg2GvSDEoCFn5lSAulb8NisxWfo-pyo8ELdccKm0j8PvcXYgQLDYDUbH-HQynJDIgmrtOVu4hmYfAgTDwamWAs23gIeZUUCzcGomXN_KyAadHeW--NTuTUzMri1tIRtISKms=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfdMg2GvSDEoCFn5lSAulb8NisxWfo-pyo8ELdccKm0j8PvcXYgQLDYDUbH-HQynJDIgmrtOVu4hmYfAgTDwamWAs23gIeZUUCzcGomXN_KyAadHeW--NTuTUzMri1tIRtISKms=w1200-h800-k-no'
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
    ai_reason: 'พื้นที่สงบเยียวยาภาวะหมดไฟของทีมเทคโนโลยี ช่วยสร้างไอเดียใหม่ๆ ได้อย่างมีประสิทธิภาพ',
    google_place_id: 'ChIJzWp72_022DARjKx129_abcd',
    google_maps_uri: 'https://maps.google.com/?cid=894372109847123984',
    formatted_address: '157 Moo 6, Tambol Donkaew, Mae Rim, Chiang Mai 50180 Thailand',
    nearest_airport: 'สนามบินนานาชาติเชียงใหม่ (CNX)',
    airport_travel_time: '25 นาที (16.2 กม. ผ่าน ถ.โชตนา)',
    google_verified: true
  },
  {
    id: 103,
    title: 'ดับเบิ้ลยู สมุย บีชฟรอนต์ อินโนเวชัน วิลล่า',
    city: 'เกาะสมุย',
    country: 'ประเทศไทย',
    category: 'ทำงานพักผ่อน (Bleisure & Coworking)',
    archetype: 'coastal',
    overview: 'การรวมตัวของพลังงานชีวิตที่สดใสและประสิทธิภาพการทำงาน คาบาน่าริมหาดพร้อมปลั๊กและเน็ต สระว่ายน้ำอินฟินิตี้ส่วนตัวทุกหลัง ปาร์ตี้ดีเจยามพระอาทิตย์ตก และห้อง Great Room สำหรับพรีเซนต์งานสำคัญ',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeAe9niMq-yvp8_CS13jm4V_OaGJJkXnze5OnnBUi1KXWiU6Glg3cpqELGUBvh7nxAmF1bEcSo-66xInvHNAgTQ01Jou24a9J0G1wsqBYCZ14faY5H2cImI8kaQLnkElXVOg9HK_txczI5x=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeAe9niMq-yvp8_CS13jm4V_OaGJJkXnze5OnnBUi1KXWiU6Glg3cpqELGUBvh7nxAmF1bEcSo-66xInvHNAgTQ01Jou24a9J0G1wsqBYCZ14faY5H2cImI8kaQLnkElXVOg9HK_txczI5x=w1200-h800-k-no'
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
    ai_reason: 'บรรยากาศสนุกสนานที่เปลี่ยนการจัดออฟไซต์ธรรมดาให้เป็นความทรงจำที่น่าประทับใจของทุกคนในทีม',
    google_place_id: 'ChIJX0897y58UDARk81273_wxyz',
    google_maps_uri: 'https://maps.google.com/?cid=918237465019283746',
    formatted_address: '4/1 Moo 1 Tambol Maenam, Koh Samui, Surat Thani 84330 Thailand',
    nearest_airport: 'สนามบินนานาชาติสมุย (USM)',
    airport_travel_time: '15 นาที (8.5 กม. ผ่าน ทล.4169)',
    google_verified: true
  },
  {
    id: 104,
    title: 'รายาวดี มารีน จังเกิล พาวิลเลียน',
    city: 'กระบี่',
    country: 'ประเทศไทย',
    category: 'ผจญภัยกระชับมิตรทีม',
    archetype: 'coastal',
    overview: 'โอบล้อมด้วย 3 ชายหาดและยอดเขาหินปูนสูงตระหง่านใจกลางอุทยานแห่งชาติทางทะเล เหมาะสำหรับการผจญภัยเสริมสร้างความสามัคคี ควบคู่กับอาหารค่ำสุดหรูในถ้ำหินปูนและห้องประชุมกลางป่าเขตร้อน',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfTGuZLqOrM-sxMU2hjpZC0aDG50Zxr8xQoRr2oHgTw5llClhPcMl9uXfzVCjCzQPZ_dU4bBEBbaUrC_CD6dNO-CE88-vjUICj5D-vim_FyHZkXhpi7zYdrxnEEUHdRQuN3-vcp=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfTGuZLqOrM-sxMU2hjpZC0aDG50Zxr8xQoRr2oHgTw5llClhPcMl9uXfzVCjCzQPZ_dU4bBEBbaUrC_CD6dNO-CE88-vjUICj5D-vim_FyHZkXhpi7zYdrxnEEUHdRQuN3-vcp=w1200-h800-k-no'
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
    ai_reason: 'ทัศนียภาพธรรมชาติอันตระการตาที่ถูกออกแบบมาเพื่อสร้างความไว้วางใจและการผูกสัมพันธ์ในทีม',
    google_place_id: 'ChIJk71928374DARm82910_qwer',
    google_maps_uri: 'https://maps.google.com/?cid=456789123049586712',
    formatted_address: '214 Moo 2, Tambon Ao-Nang, Mueang, Krabi 81000 Thailand',
    nearest_airport: 'สนามบินนานาชาติกระบี่ (KBV)',
    airport_travel_time: '40 นาที (รถตู้ VIP + เรือสปีดโบ๊ตส่วนตัว)',
    google_verified: true
  },
  {
    id: 105,
    title: 'คาเพลลา กรุงเทพฯ ริเวอร์ไซด์ ซัมมิท เลานจ์',
    city: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    category: 'จัดประชุม MICE หรูใจกลางเมือง',
    archetype: 'urban',
    overview: 'โอเอซิสริมแม่น้ำเจ้าพระยา นำเสนอสิ่งอำนวยความสะดวกในการจัดประชุมผู้บริหารระดับโลก อาหารระดับดาวมิชลิน วิลล่าริมน้ำส่วนตัว และบริการวางแผนการประชุมระดับองค์กรอย่างสมบูรณ์แบบ',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLdpMVb2pJx_eRzXNNojWJ8buzkXEKA1o3Cpw8QOZKtp4-viwTu7qw6QfDn0vr1J4QB6Yy139-sGAoqDj-eff_aSHiKywaN-fSJg3ddeoTrf2lOHpJKHujk_n1LBl52N4t242tQy=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdpMVb2pJx_eRzXNNojWJ8buzkXEKA1o3Cpw8QOZKtp4-viwTu7qw6QfDn0vr1J4QB6Yy139-sGAoqDj-eff_aSHiKywaN-fSJg3ddeoTrf2lOHpJKHujk_n1LBl52N4t242tQy=w1200-h800-k-no'
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
    ai_reason: 'โรงแรมอันดับ 1 ของโลกที่ผสมผสานความสะดวกใจกลางเมืองหลวงกับความเงียบสงบริมสายน้ำ',
    google_place_id: 'ChIJb78291024DARc81920_asdf',
    google_maps_uri: 'https://maps.google.com/?cid=384910293847561029',
    formatted_address: '300/2 Charoenkrung Road, Yannawa, Sathon, Bangkok 10120 Thailand',
    nearest_airport: 'สนามบินสุวรรณภูมิ (BKK)',
    airport_travel_time: '35 นาที (34.0 กม. ผ่าน ทางพิเศษศรีรัช)',
    google_verified: true
  },
  {
    id: 106,
    title: 'โปเตโต้ เฮด เดซ่า บาหลี ครีเอทีฟ แล็บ',
    city: 'บาหลี',
    country: 'อินโดนีเซีย',
    category: 'ทำงานพักผ่อน (Bleisure & Coworking)',
    archetype: 'regional_apac',
    overview: 'มาตรฐานระดับโลกสำหรับออฟไซต์ของบริษัทเทคโนโลยีและเอเจนซี่ดีไซน์ สถาปัตยกรรมไร้ขยะ (Zero-Waste) อัฒจันทร์ไม้ไผ่ พื้นที่ทำงานริมหาด และวัฒนธรรมดนตรียามเย็นริมหาดเซมินยัค',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfTORz220hKd25UXBI7Tz7CJA7hAoxE1wbQtK6LX-4hx45sJLmAgfecTIRhRDcLcrlaRck3aLA9wWmo7aP06HERKN8DCi0jqqQNqCS1b31HNRvpyvMYpZpN3m6kwXgkUU5ZiMg=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfTORz220hKd25UXBI7Tz7CJA7hAoxE1wbQtK6LX-4hx45sJLmAgfecTIRhRDcLcrlaRck3aLA9wWmo7aP06HERKN8DCi0jqqQNqCS1b31HNRvpyvMYpZpN3m6kwXgkUU5ZiMg=w1200-h800-k-no'
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
    ai_reason: 'สถานที่ดึงดูดใจสำหรับทีมดีไซน์ สตาร์ทอัพ และผู้ก่อตั้งสายเทคโนโลยีรุ่นใหม่',
    google_place_id: 'ChIJa91827364DARd82719_zxcv',
    google_maps_uri: 'https://maps.google.com/?cid=671829384910293847',
    formatted_address: 'Jl. Petitenget No.51B, Seminyak, Badung, Bali 80361 Indonesia',
    nearest_airport: 'Ngurah Rai International Airport (DPS)',
    airport_travel_time: '30 นาที (13.5 กม. ผ่าน Jl. Sunset Road)',
    google_verified: true
  },
  {
    id: 107,
    title: 'อินเตอร์คอนติเนนตัล ดานัง คลิฟท็อป MICE วิลล่า',
    city: 'ดานัง',
    country: 'เวียดนาม',
    category: 'จัดประชุม MICE หรูใจกลางเมือง',
    archetype: 'regional_apac',
    overview: 'ผลงานชิ้นเอกที่ออกแบบโดย บิล เบนส์ลีย์ ข้ามภูเขาลิง วิลล่าสำหรับการประชุมระดับผู้นำพร้อมบริการบัตเลอร์ส่วนตัว ร้านอาหารระดับมิชลิน และรถรางไฟฟ้าส่วนตัวลงสู่อ่าวชายหาด',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLdPe5HMlgBNtxNnWZug2vY8Hwu_tSKVG9lkTzc1fvDvfB_BXJxIDxDp62JH-Q9bmX_8XdH4Fb6PtxvozFnyNveRstUKKLBJjmfNvZLCtN14Y4jRZKV3ztoNaOYJxiiG4uRmGBWc4Q=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdPe5HMlgBNtxNnWZug2vY8Hwu_tSKVG9lkTzc1fvDvfB_BXJxIDxDp62JH-Q9bmX_8XdH4Fb6PtxvozFnyNveRstUKKLBJjmfNvZLCtN14Y4jRZKV3ztoNaOYJxiiG4uRmGBWc4Q=w1200-h800-k-no'
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
    ai_reason: 'ความยิ่งใหญ่อลังการที่ภูเขาบรรจบกับท้องทะเล สำหรับการประชุมระดับภูมิภาค APAC',
    google_place_id: 'ChIJc82719283DARe91827_tyui',
    google_maps_uri: 'https://maps.google.com/?cid=561029384756192834',
    formatted_address: 'Bai Bac, Son Tra Peninsula, Da Nang 550000 Vietnam',
    nearest_airport: 'Da Nang International Airport (DAD)',
    airport_travel_time: '35 นาที (22.0 กม. ผ่าน ถ. Hoang Sa)',
    google_verified: true
  },
  {
    id: 108,
    title: 'คาเพลลา เซ็นโตซ่า เฮอริเทจ ลีดเดอร์ชิพ เอ็นเคลฟ',
    city: 'เซ็นโตซ่า',
    country: 'สิงคโปร์',
    category: 'รีสอร์ตผู้บริหารระดับพรีเมียม',
    archetype: 'regional_apac',
    overview: 'คฤหาสน์สไตล์โคโลเนียลท่ามกลางพื้นที่ธรรมชาติกว่า 30 เอเคอร์บนเกาะเซ็นโตซ่า สถานที่จัดการประชุมระดับผู้นำนานาชาติ มีพูลวิลล่าส่วนตัว ระบบรักษาความปลอดภัยระดับสูงสุด และห่างจากย่านการเงินเพียง 10 นาที',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLc7uCtfhiMrnxqxFz3A2jyGO20CnXh6gg8hmvwu_Bs-TsPgz33AAsTIzNZ1I7ZC-Iirvi-zalJUsGW0uAg4FMqvt1UBhHhP--bYHZ-tk-8b6ku8MTn4k-JskpwuMtTK9rKH9-6ufMjsMuI4=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLc7uCtfhiMrnxqxFz3A2jyGO20CnXh6gg8hmvwu_Bs-TsPgz33AAsTIzNZ1I7ZC-Iirvi-zalJUsGW0uAg4FMqvt1UBhHhP--bYHZ-tk-8b6ku8MTn4k-JskpwuMtTK9rKH9-6ufMjsMuI4=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLfYv5FWkOXxA7QDth7hWnmI46yoOAtaAeXfuY-17ZiEvWKiieZf8HG5dYdlOqIlJXwJ2tlJkvgYmpvXlHe6tiWCgZdP6BskotiuU-890ej82HkOThfCqstrUKuPfyaKnDJM4jdn=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLes6LJjAsrnIKE-rvJhiYPVw1_RrLUiUnweuNg_3KfnChfkCA1dP3VhkGEMzex6t56jUxAiRYyA3wvizkDOeThfxZp3LNdZ5OHJNuCXQLBvD4RwUjroJcWO5F_tXxMbbp95Poyhlz_VW27R=w1200-h800-k-no'
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
    ai_reason: 'ความปลอดภัยสูงสุด ความเป็นส่วนตัวระดับสากล และการเชื่อมต่อที่รวดเร็วสำหรับการประชุมบอร์ดบริหาร',
    google_place_id: 'ChIJd91827364DARf82719_ghjk',
    google_maps_uri: 'https://maps.google.com/?cid=891029384756102938',
    formatted_address: '1 The Knolls, Sentosa Island, Singapore 098297',
    nearest_airport: 'Singapore Changi Airport (SIN)',
    airport_travel_time: '25 นาที (26.5 กม. ผ่าน ECP Highway)',
    google_verified: true
  },
  {
    id: 109,
    title: 'ภูใจใส เมาน์เทน แอนด์ บรูว์ แซงค์ทัวรี',
    city: 'เชียงราย',
    country: 'ประเทศไทย',
    category: 'ฟื้นฟูสุขภาพ & Eco Retreat',
    archetype: 'mountain',
    overview: 'รีสอร์ตไม้ไผ่ธรรมชาติบนยอดดอยแม่สลอง โอบล้อมด้วยไร่ชาขั้นบันไดและทะเลหมอก สัญญาณอินเทอร์เน็ต Starlink ครอบคลุมทั่วบริเวณ ศาลาประชุมรับลมหนาว และเวิร์กช็อประดมสมองพร้อมชาออร์แกนิก',
    hero_image: 'https://lh3.googleusercontent.com/grass-proxy/AIM7gW3a0qBn8TcMHlu5RDnzpjxMRzr26aAjxLKX9JXGZYwL5tKunJz8sWLTIZE9KUnXLHjbNIBrBp1dnkh-cEV-LnuXDQRBRtFASe_Y6rpmoFFjX9EOfpKGkQakrDrMYFbkTpElw7X6OkBy4XObL7yeVdmtMVEW6ddJEES39OMtAhC9XO0db3LVZuJv=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-proxy/AIM7gW3a0qBn8TcMHlu5RDnzpjxMRzr26aAjxLKX9JXGZYwL5tKunJz8sWLTIZE9KUnXLHjbNIBrBp1dnkh-cEV-LnuXDQRBRtFASe_Y6rpmoFFjX9EOfpKGkQakrDrMYFbkTpElw7X6OkBy4XObL7yeVdmtMVEW6ddJEES39OMtAhC9XO0db3LVZuJv=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdP9zxHLmwIHCUvlhZY9jqZe8wC2J_xoh_yYep9bD_gn2QFFZiOZk1sC6SLo_9QLVwqQdTVUctLtR-tc53VsnacVdGSbFcJe90J67fOXYKNnIiUj5zzOC9bUMzL--SCtadPIJSj2Q=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-proxy/AIM7gW1B3H46bAk9mhtAC9BUZoCZ3igw2Xy7ZRWFCNiSLn6waWUulo63bgbbj1rM9kxz7qA6aFhWfyYT5w69eQ6PSTmIv3QCdsRzX1NnO3NGVBzFv1gZuqEFFhy2QvH26NKbTNSGxXT7IywDN_2Yj8GkO5eO9DZc1QHZgd4SdHBTRFwYQVG8S3nITMb0=w1200-h800-k-no'
    ],
    price_per_night: 22000,
    price_per_person: 3500,
    min_capacity: 6,
    max_capacity: 30,
    wifi_speed_mbps: 400,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'โซนทำงาน Coworking พร้อมวิวธรรมชาติ', 'สปา นวดแผนไทย & คลาสโยคะผ่อนคลาย', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว'],
    tourism_highlights: ['กิจกรรมเก็บใบชาและชงชาออร์แกนิกบนยอดดอย', 'ชมพระอาทิตย์ขึ้นเหนือทะเลหมอกดอยแม่สลอง', 'เดินป่าศึกษาเส้นทางธรรมชาติกระชับมิตรทีม'],
    rating: 4.95,
    reviews_count: 142,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/phu-chaisai-mountain-resort.html?aid=trippick_b2b',
    commission_percentage: 12,
    ai_reason: 'บรรยากาศเทือกเขาสูงและความเงียบสงบที่ปราศจากมลภาวะ ช่วยให้การวางแผนกลยุทธ์ทีมมีความคิดสร้างสรรค์สูงสุด',
    google_place_id: 'ChIJe91827364DARg82719_bnml',
    google_maps_uri: 'https://maps.google.com/?cid=901928374650192834',
    formatted_address: '142 Moo 4, Mae Salong Nok, Mae Chan, Chiang Rai 57110 Thailand',
    nearest_airport: 'สนามบินนานาชาติแม่ฟ้าหลวง เชียงราย (CEI)',
    airport_travel_time: '45 นาที (38.0 กม. ผ่าน ทล.1 และ ทล.1089)',
    google_verified: true
  },
  {
    id: 110,
    title: 'คีรีมายา กอล์ฟ รีสอร์ต แอนด์ สปา เอ็กเซ็กคิวทีฟ ฮับ',
    city: 'เขาใหญ่',
    country: 'ประเทศไทย',
    category: 'ฟื้นฟูสุขภาพ & Eco Retreat',
    archetype: 'mountain',
    overview: 'รีสอร์ตระดับลักชัวรีติดอุทยานแห่งชาติเขาใหญ่ ขับรถจากกรุงเทพฯ เพียง 2 ชั่วโมง เพียบพร้อมด้วยสนามกอล์ฟ 18 หลุม ห้องสัมมนามาตรฐาน MICE พร้อมจอขนาดใหญ่และวิวเทือกเขาดงพญาเย็น',
    hero_image: 'https://lh3.googleusercontent.com/grass-cs/AABkmLffKdBWB6fw41fKwdyQSODMv-vw597br5EHMn91iCptc9sLPCZJrU5CvHhQJx71g-504DCWFotiZEh8h8UniCZPBAxKO6Ofs6b6Sly1gZd7oJCsUQWoQ-YJo1VAhMmqbnzgUUB7=w1200-h800-k-no',
    gallery: [
      'https://lh3.googleusercontent.com/grass-cs/AABkmLffKdBWB6fw41fKwdyQSODMv-vw597br5EHMn91iCptc9sLPCZJrU5CvHhQJx71g-504DCWFotiZEh8h8UniCZPBAxKO6Ofs6b6Sly1gZd7oJCsUQWoQ-YJo1VAhMmqbnzgUUB7=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLc1bhE1I4L1JcQKI4hzBGtQhhPp4C_YWm8X3v-GKpho8_Wn6B2lm6ibhTQro2CPdgVMAUYsT7kiZiX0yMqDUQ_n1idQYeqTt7H1XmucZv-umhcq0bygLyaXklloKh_4N2T2Y-Lm=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/grass-cs/AABkmLci9dqjLcPVUNJUcshOQ405zz7BbWUCOT3u1OU5O4lREtks4JkyQuSg6UDbbFjLjVlfCqUxvb68hkH2IXUXVw4bX4O-l59p52RDL2gSe2zmPX5kBue68lwzmki7vpp9ebcTGlClsA=w1200-h800-k-no'
    ],
    price_per_night: 27000,
    price_per_person: 4100,
    min_capacity: 10,
    max_capacity: 50,
    wifi_speed_mbps: 500,
    business_amenities: ['อินเทอร์เน็ต Starlink / Fiber 500+ Mbps', 'ห้องประชุมผู้บริหาร & ระบบ AV ครบครัน', 'สระว่ายน้ำส่วนตัวริมผา/ติดหาด', 'เชฟส่วนตัว & จัดเลี้ยงอาหารสำหรับทีม', 'รถตู้ VIP รับ-ส่งสนามบินส่วนตัว'],
    tourism_highlights: ['ทัวร์ชิมไวน์ในไร่องุ่นเขาใหญ่', 'กิจกรรมส่องสัตว์กลางคืนอุทยานแห่งชาติ', 'แข่งขันกอล์ฟกระชับมิตรทีมผู้บริหาร'],
    rating: 4.90,
    reviews_count: 195,
    affiliate_booking_url: 'https://www.agoda.com/kirimaya-golf-resort-spa/hotel/khao-yai-th.html?cid=trippick',
    commission_percentage: 11,
    ai_reason: 'เดินทางสะดวกใกล้กรุงเทพฯ พร้อมสิ่งอำนวยความสะดวกระดับพรีเมียมและพื้นที่สีเขียวกว้างขวางสำหรับกิจกรรมเอาต์ดอร์',
    google_place_id: 'ChIJf91827364DARh82719_poiu',
    google_maps_uri: 'https://maps.google.com/?cid=781920394857102938',
    formatted_address: '1/3 Moo 6 Thanarat Road, Mu Si, Pak Chong, Nakhon Ratchasima 30130 Thailand',
    nearest_airport: 'สนามบินดอนเมือง / สุวรรณภูมิ (DMK / BKK)',
    airport_travel_time: '2 ชม. (160 กม. ผ่าน มอเตอร์เวย์ M6)',
    google_verified: true
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

export function findCongruentDestination(query: {
  id?: number;
  city?: string;
  category?: string;
  vibe?: string;
  archetype?: 'coastal' | 'mountain' | 'urban' | 'regional_apac';
}): TravelDestination {
  // 1. Direct ID match
  if (query.id) {
    const direct = CURATED_DESTINATIONS.find(d => d.id === query.id);
    if (direct) return direct;
  }

  // 2. City match (e.g. เชียงใหม่, เชียงราย, เขาใหญ่, ภูเก็ต, สมุย, บาหลี)
  if (query.city) {
    const cleanCity = query.city.toLowerCase().trim();
    const cityMatch = CURATED_DESTINATIONS.find(d =>
      d.city.toLowerCase().includes(cleanCity) || cleanCity.includes(d.city.toLowerCase())
    );
    if (cityMatch) return cityMatch;
  }

  // 3. Archetype match
  let targetArchetype = query.archetype;
  if (!targetArchetype && query.vibe) {
    const v = query.vibe.toLowerCase();
    if (v.includes('เขา') || v.includes('ดอย') || v.includes('หมอก') || v.includes('ป่า') || v.includes('eco') || v.includes('mountain')) {
      targetArchetype = 'mountain';
    } else if (v.includes('ทะเล') || v.includes('หาด') || v.includes('เกาะ') || v.includes('beach') || v.includes('coastal')) {
      targetArchetype = 'coastal';
    } else if (v.includes('เมือง') || v.includes('สัมมนา') || v.includes('mice') || v.includes('city') || v.includes('urban')) {
      targetArchetype = 'urban';
    } else if (v.includes('บาหลี') || v.includes('สิงคโปร์') || v.includes('ต่างประเทศ') || v.includes('regional')) {
      targetArchetype = 'regional_apac';
    }
  }

  if (targetArchetype) {
    const archetypeMatches = CURATED_DESTINATIONS.filter(d => d.archetype === targetArchetype);
    if (archetypeMatches.length > 0) {
      return archetypeMatches[0];
    }
  }

  // Fallback to highest rated curated destination
  return CURATED_DESTINATIONS[0];
}
