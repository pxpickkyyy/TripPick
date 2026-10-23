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
  category: 'Executive Retreat' | 'Bleisure & Coworking' | 'Luxury MICE' | 'Team Adventure' | 'Eco & Wellness' | 'Beachfront Workation';
  overview: string;
  hero_image: string;
  gallery: string[];
  price_per_night: number; // in USD
  price_per_person: number; // in USD
  min_capacity: number;
  max_capacity: number;
  wifi_speed_mbps: number;
  business_amenities: string[];
  tourism_highlights: string[];
  rating: number;
  reviews_count: number;
  affiliate_booking_url: string;
  commission_percentage: number; // e.g. 12 means 12%
  ai_reason: string;
  virtual_tour_id?: string; // YouTube embed ID for video walkthrough
  is_sponsored?: boolean;
}

export const ALL_AMENITIES: BusinessAmenity[] = [
  { id: 'wifi', name: 'Starlink / Fiber 500+ Mbps', icon: '📶', category: 'connectivity' },
  { id: 'boardroom', name: 'Executive Boardroom & AV', icon: '🖥️', category: 'workspace' },
  { id: 'private_pool', name: 'Private Clifftop/Beachfront Pool', icon: '🏊‍♂️', category: 'leisure' },
  { id: 'team_dining', name: 'Private Chef & Team Catering', icon: '🍽️', category: 'hospitality' },
  { id: 'airport_shuttle', name: 'VIP Airport Van Transfers', icon: '🚐', category: 'hospitality' },
  { id: 'coworking', name: 'Dedicated Coworking Salons', icon: '💼', category: 'workspace' },
  { id: 'wellness', name: 'Spa, Yoga & Thermal Springs', icon: '🧘‍♀️', category: 'leisure' },
  { id: 'adventure', name: 'Yacht Charter / Team Excursion', icon: '⛵', category: 'leisure' },
];

export const CURATED_DESTINATIONS: TravelDestination[] = [
  {
    id: 101,
    title: 'Trisara Oceanfront Executive Sanctuary',
    city: 'Phuket',
    country: 'Thailand',
    category: 'Executive Retreat',
    overview: 'Perched on Phuket’s northwestern pristine coastline, Trisara offers private oceanfront pool residences, high-speed Starlink connectivity, an open-air boardroom overlooking the Andaman Sea, and private Michelin-starred seafood dining for leadership teams.',
    hero_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 1250,
    price_per_person: 195,
    min_capacity: 6,
    max_capacity: 28,
    wifi_speed_mbps: 450,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Executive Boardroom & AV', 'Private Clifftop/Beachfront Pool', 'Private Chef & Team Catering', 'VIP Airport Van Transfers'],
    tourism_highlights: ['Private Sunset Catamaran Cruise', 'Coral Reef Scuba', 'Michelin Farm-to-Table Gastronomy'],
    rating: 4.96,
    reviews_count: 184,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/trisara.html?aid=trippick_b2b',
    commission_percentage: 12, // 12% on $10k+ booking = $1,200+
    ai_reason: 'Unrivaled privacy and panoramic Andaman views for C-level annual strategy sessions.',
    virtual_tour_id: '1aBcDeFgHiJ',
    is_sponsored: true
  },
  {
    id: 102,
    title: 'Raya Heritage Lanna Eco-Offsite Hub',
    city: 'Chiang Mai',
    country: 'Thailand',
    category: 'Eco & Wellness',
    overview: 'Nestled along the serene Ping River, Raya Heritage blends ancient Lanna architectural soul with carbon-neutral offsite workspaces, riverbank brainstorming pavilions, artisanal tea ceremonies, and creative retreat pods.',
    hero_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 680,
    price_per_person: 110,
    min_capacity: 8,
    max_capacity: 35,
    wifi_speed_mbps: 380,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Dedicated Coworking Salons', 'Spa, Yoga & Thermal Springs', 'Private Chef & Team Catering'],
    tourism_highlights: ['River Ping Longtail Boat Excursion', 'Lanna Organic Farm Foraging', 'Doi Suthep Sunrise Meditation'],
    rating: 4.92,
    reviews_count: 215,
    affiliate_booking_url: 'https://www.agoda.com/raya-heritage/hotel/chiang-mai-th.html?cid=trippick',
    commission_percentage: 11,
    ai_reason: 'Mindful riverside sanctuary proven to relieve tech team burnout and spur creative breakthrough.'
  },
  {
    id: 103,
    title: 'W Samui Beachfront Innovation Villa',
    city: 'Koh Samui',
    country: 'Thailand',
    category: 'Bleisure & Coworking',
    overview: 'Where vibrant energy meets seamless corporate productivity. Offers high-octane beachfront working cabanas, private infinity pools in every residence, DJ sunset sessions, and a state-of-the-art Great Room for all-hands presentations.',
    hero_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 950,
    price_per_person: 145,
    min_capacity: 10,
    max_capacity: 45,
    wifi_speed_mbps: 500,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Executive Boardroom & AV', 'Private Clifftop/Beachfront Pool', 'VIP Airport Van Transfers'],
    tourism_highlights: ['Ang Thong Marine Park Speedboat', 'Beachside Fire Shows', 'Paddleboard Yoga'],
    rating: 4.88,
    reviews_count: 310,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/w-retreat-koh-samui.html?aid=trippick_b2b',
    commission_percentage: 13,
    ai_reason: 'High-energy bleisure setting that turns team offsites into unforgettable celebratory milestones.'
  },
  {
    id: 104,
    title: 'Rayavadee Marine Jungle Pavilion',
    city: 'Krabi',
    country: 'Thailand',
    category: 'Team Adventure',
    overview: 'Surrounded on three sides by glorious sand beaches and towering limestone pinnacles at the edge of Krabi Marine National Park. Ideal for rugged team-building adventures combined with five-star luxury grotto dinners and jungle boardrooms.',
    hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 820,
    price_per_person: 130,
    min_capacity: 8,
    max_capacity: 32,
    wifi_speed_mbps: 320,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Private Chef & Team Catering', 'Yacht Charter / Team Excursion'],
    tourism_highlights: ['Phra Nang Cave Grotto Dinner', 'Limestone Rock Climbing Challenge', 'Private Speedboat Island Hopping'],
    rating: 4.94,
    reviews_count: 168,
    affiliate_booking_url: 'https://www.agoda.com/rayavadee-hotel/hotel/krabi-th.html?cid=trippick',
    commission_percentage: 10,
    ai_reason: 'Epic tropical adventure backdrop designed for high-trust bonding and outdoor team challenges.'
  },
  {
    id: 105,
    title: 'Capella Bangkok Riverside Summit Lounge',
    city: 'Bangkok',
    country: 'Thailand',
    category: 'Luxury MICE',
    overview: 'An urban oasis along the River of Kings. Capella Bangkok provides ultra-modern corporate summit facilities, Michelin-starred Cote by Mauro Colagreco, private waterfront villas, and bespoke executive retreat planning in Thailand’s vibrant capital.',
    hero_image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 1100,
    price_per_person: 175,
    min_capacity: 10,
    max_capacity: 60,
    wifi_speed_mbps: 600,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Executive Boardroom & AV', 'Dedicated Coworking Salons', 'VIP Airport Van Transfers'],
    tourism_highlights: ['Private Chao Phraya Yacht Dinner', 'Grand Palace Private Curator Tour', 'Rooftop Cocktail Mixology'],
    rating: 4.98,
    reviews_count: 240,
    affiliate_booking_url: 'https://www.booking.com/hotel/th/capella-bangkok.html?aid=trippick_b2b',
    commission_percentage: 12,
    ai_reason: 'World #1 ranked hotel experience blending metropolitan access with tranquil riverfront luxury.'
  },
  {
    id: 106,
    title: 'Potato Head Desa Creative Lab & Eco-Retreat',
    city: 'Bali',
    country: 'Indonesia',
    category: 'Bleisure & Coworking',
    overview: 'The global gold standard for creative tech and design company offsites. Zero-waste sustainable architecture, bamboo innovation amphitheaters, oceanfront coworking spaces, wellness dome, and legendary sunset music culture in Seminyak.',
    hero_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 750,
    price_per_person: 120,
    min_capacity: 8,
    max_capacity: 50,
    wifi_speed_mbps: 400,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Dedicated Coworking Salons', 'Private Clifftop/Beachfront Pool', 'Spa, Yoga & Thermal Springs'],
    tourism_highlights: ['Zero-Waste Circular Design Workshop', 'Uluwatu Clifftop Sunset', 'Surfing Coaching Sessions'],
    rating: 4.91,
    reviews_count: 420,
    affiliate_booking_url: 'https://www.booking.com/hotel/id/desa-potato-head.html?aid=trippick_b2b',
    commission_percentage: 11,
    ai_reason: 'The ultimate magnet for design agencies, Web3 teams, and progressive tech founders.'
  },
  {
    id: 107,
    title: 'InterContinental Danang Clifftop MICE Villa',
    city: 'Da Nang',
    country: 'Vietnam',
    category: 'Luxury MICE',
    overview: 'Masterpiece designed by Bill Bensley set across Monkey Mountain. Featuring summit villas with dedicated butler service, Michelin-starred La Maison 1888, funicular cable car to the private bay, and high-tech conference ballrooms.',
    hero_image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565031491910-e57fac030c41?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 890,
    price_per_person: 140,
    min_capacity: 10,
    max_capacity: 70,
    wifi_speed_mbps: 450,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Executive Boardroom & AV', 'VIP Airport Van Transfers', 'Private Chef & Team Catering'],
    tourism_highlights: ['Hoi An Lantern Old Town Excursion', 'Ba Na Hills Golden Bridge', 'Private Beach Watersports'],
    rating: 4.93,
    reviews_count: 198,
    affiliate_booking_url: 'https://www.agoda.com/intercontinental-danang-sun-peninsula-resort/hotel/da-nang-vn.html?cid=trippick',
    commission_percentage: 12,
    ai_reason: 'Spectacular mountain-meets-ocean conference grandeur for regional APAC executive retreats.'
  },
  {
    id: 108,
    title: 'Capella Sentosa Heritage Leadership Enclave',
    city: 'Sentosa',
    country: 'Singapore',
    category: 'Executive Retreat',
    overview: 'Colonial manors embraced by 30 acres of lush landscaped grounds on Sentosa Island. Host to historic international summits, boasting ultra-private colonial manors with private plunge pools, high-security facilities, and 10-minute access to Singapore central financial district.',
    hero_image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80'
    ],
    price_per_night: 1450,
    price_per_person: 240,
    min_capacity: 6,
    max_capacity: 30,
    wifi_speed_mbps: 800,
    business_amenities: ['Starlink / Fiber 500+ Mbps', 'Executive Boardroom & AV', 'VIP Airport Van Transfers', 'Dedicated Coworking Salons'],
    tourism_highlights: ['Tanjong Beach Club VIP Cabana', 'Night Safari Private Tour', 'Michelin Star Dining Tour'],
    rating: 4.97,
    reviews_count: 275,
    affiliate_booking_url: 'https://www.booking.com/hotel/sg/capella-singapore.html?aid=trippick_b2b',
    commission_percentage: 10,
    ai_reason: 'Highest security, pristine discretion, and lightning connectivity for global board meetings.'
  }
];

export function getFallbackDestinations(
  vibe?: string,
  minBudget?: number,
  maxBudget?: number,
  categoryFilter?: string
): TravelDestination[] {
  let list = [...CURATED_DESTINATIONS];

  if (categoryFilter && categoryFilter !== 'All Categories') {
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
    if (list.length === 0) list = CURATED_DESTINATIONS; // fallback
  }

  return list;
}
