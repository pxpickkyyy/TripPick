import { CURATED_DESTINATIONS, ALL_AMENITIES, type TravelDestination } from './travelDestinations.ts';
import type {
  RoomUser,
  Room,
  Swipe,
  CachedSessionState,
  ExecutiveConstraints,
} from '../types/index.ts';

export const DEFAULT_EXECUTIVE_CONSTRAINTS: ExecutiveConstraints = {
  maxBudgetPerHead: 8000,
  requiredBoardroomCapacity: 15,
  mandatoryAmenities: ['wifi', 'boardroom'],
};

/**
 * Enforces executive governance constraints prior to voting
 * Automatically filters out venues that violate budget, capacity, or mandatory amenities
 */
export function satisfiesExecutiveConstraints(
  venue: TravelDestination,
  constraints?: ExecutiveConstraints
): boolean {
  if (!constraints) return true;

  // 1. Max budget per head
  if (typeof constraints.maxBudgetPerHead === 'number' && constraints.maxBudgetPerHead > 0) {
    const venueCost = venue.price_per_person || Math.round(venue.price_per_night / (venue.max_capacity || 10));
    if (venueCost > constraints.maxBudgetPerHead) {
      return false;
    }
  }

  // 2. Required boardroom capacity
  if (typeof constraints.requiredBoardroomCapacity === 'number' && constraints.requiredBoardroomCapacity > 0) {
    if (venue.max_capacity < constraints.requiredBoardroomCapacity) {
      return false;
    }
  }

  // 3. Mandatory amenities
  if (Array.isArray(constraints.mandatoryAmenities) && constraints.mandatoryAmenities.length > 0) {
    const venueAmenities = (venue.business_amenities || []).map(a => a.toLowerCase());
    const venueText = `${venue.title} ${venue.overview} ${venueAmenities.join(' ')}`.toLowerCase();

    for (const mandatory of constraints.mandatoryAmenities) {
      const target = mandatory.trim().toLowerCase();
      if (!target) continue;

      let hasMatch: boolean;

      if (target === 'wifi' || target.includes('wifi') || target.includes('internet')) {
        hasMatch =
          (typeof venue.wifi_speed_mbps === 'number' && venue.wifi_speed_mbps > 0) ||
          venueText.includes('wifi') ||
          venueText.includes('starlink') ||
          venueText.includes('fiber') ||
          venueText.includes('เน็ต') ||
          venueAmenities.some(va => va.includes('wifi') || va.includes('starlink') || va.includes('fiber'));
      } else if (target === 'boardroom' || target.includes('boardroom') || target.includes('meeting')) {
        hasMatch =
          venueText.includes('boardroom') ||
          venueText.includes('meeting') ||
          venueText.includes('conference') ||
          venueText.includes('ประชุม') ||
          venueAmenities.some(va => va.includes('boardroom') || va.includes('meeting') || va.includes('ประชุม'));
      } else {
        const mapped = ALL_AMENITIES.find(a => a.id.toLowerCase() === target || a.name.toLowerCase().includes(target));
        hasMatch =
          venueAmenities.some(va =>
            va.includes(target) ||
            (mapped && (va.includes(mapped.id.toLowerCase()) || mapped.name.toLowerCase().includes(va) || va.includes(mapped.name.toLowerCase())))
          ) ||
          venueText.includes(target);
      }

      if (!hasMatch) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Role-Weighted Consensus Voting Weight
 * - Normal member Like = +1 vote
 * - Executive / Organizer Like = +2 votes
 */
export function getUserVoteWeight(user?: RoomUser | null): number {
  if (!user) return 1;
  const role = user.role;
  if (role === 'EXECUTIVE' || role === 'ORGANIZER') {
    return 2;
  }
  return 1;
}

/**
 * Pre-calculated Corporate Retreat Roster (15 pax, 3 nights, ฿270,000 GBV)
 */
export const DEMO_15_PAX_USERS: RoomUser[] = [
  { id: 'user_exec_1', room_id: 'DEMO', user_name: 'Sarah Chen', role: 'EXECUTIVE', title: 'Head of People & Culture', preferred_amenities: ['wifi', 'boardroom'], isHost: true },
  { id: 'user_exec_2', room_id: 'DEMO', user_name: 'David Reynolds', role: 'EXECUTIVE', title: 'Director of Finance', preferred_amenities: ['wifi', 'boardroom'] },
  { id: 'user_exec_3', room_id: 'DEMO', user_name: 'Pitchakorn P.', role: 'EXECUTIVE', title: 'Chief Product Officer', preferred_amenities: ['wifi', 'boardroom'] },
  { id: 'user_org_1', room_id: 'DEMO', user_name: 'Alex Thompson', role: 'ORGANIZER', title: 'VP Engineering', preferred_amenities: ['wifi', 'boardroom', 'team_dining'] },
  { id: 'user_org_2', room_id: 'DEMO', user_name: 'Nattaya Siri', role: 'ORGANIZER', title: 'Lead DevOps & Cloud', preferred_amenities: ['wifi', 'boardroom'] },
  { id: 'user_mem_1', room_id: 'DEMO', user_name: 'Somchai T.', role: 'MEMBER', title: 'Senior UX Architect', preferred_amenities: ['wifi', 'private_pool'] },
  { id: 'user_mem_2', room_id: 'DEMO', user_name: 'Elena Rostova', role: 'ORGANIZER', title: 'Head of Growth', preferred_amenities: ['wifi', 'coworking'] },
  { id: 'user_mem_3', room_id: 'DEMO', user_name: 'Marcus Vance', role: 'ORGANIZER', title: 'Security & Compliance Lead', preferred_amenities: ['wifi', 'adventure'] },
  { id: 'user_mem_4', room_id: 'DEMO', user_name: 'Ploy Pailin', role: 'MEMBER', title: 'Executive Assistant to CEO', preferred_amenities: ['wifi', 'wellness'] },
  { id: 'user_mem_5', room_id: 'DEMO', user_name: 'Kenji Sato', role: 'ORGANIZER', title: 'Head of Mobile', preferred_amenities: ['wifi', 'boardroom'] },
  { id: 'user_mem_6', room_id: 'DEMO', user_name: 'Apinya Wong', role: 'ORGANIZER', title: 'Principal AI Researcher', preferred_amenities: ['wifi', 'coworking'] },
  { id: 'user_mem_7', room_id: 'DEMO', user_name: 'Lucas Meyer', role: 'ORGANIZER', title: 'Strategic Partnerships Director', preferred_amenities: ['wifi', 'team_dining'] },
  { id: 'user_mem_8', room_id: 'DEMO', user_name: 'Kornkanok M.', role: 'MEMBER', title: 'Creative Director', preferred_amenities: ['wifi', 'private_pool'] },
  { id: 'user_mem_9', room_id: 'DEMO', user_name: 'Anan Prasert', role: 'MEMBER', title: 'Procurement Specialist', preferred_amenities: ['wifi', 'boardroom'] },
  { id: 'user_mem_10', room_id: 'DEMO', user_name: 'Liam O’Connor', role: 'MEMBER', title: 'Enterprise Account Executive', preferred_amenities: ['wifi', 'airport_shuttle'] },
];

export function getDemoHydratedState(): CachedSessionState {
  const demoDestination: TravelDestination = {
    ...CURATED_DESTINATIONS[0],
    price_per_person: 6000,
  };
  const demoRoom: Room = {
    id: 'DEMO',
    created_at: new Date().toISOString(),
    status: 'matched',
    destinations_deck: [demoDestination, ...CURATED_DESTINATIONS.slice(1)],
    vibe: 'tech-summit',
    host_id: DEMO_15_PAX_USERS[0].id,
    discovery_mode: 'rapid',
    deck_batch_version: 1,
    min_budget: 4000,
    max_budget: 8000,
    executiveConstraints: {
      maxBudgetPerHead: 8000,
      requiredBoardroomCapacity: 20,
      mandatoryAmenities: ['wifi', 'boardroom'],
    },
  };
  const demoSwipes: Swipe[] = DEMO_15_PAX_USERS.map((u, i) => ({
    id: `demo_swipe_${i}`,
    room_id: 'DEMO',
    user_id: u.id,
    destination_id: demoDestination.id,
    is_like: true,
    is_veto: false,
  }));
  return {
    roomId: 'DEMO',
    step: 'matched',
    room: demoRoom,
    users: DEMO_15_PAX_USERS,
    swipes: demoSwipes,
    messages: [],
    matchedDestination: demoDestination,
    currentUser: DEMO_15_PAX_USERS[0],
    isHost: true,
    lastUpdated: Date.now(),
    depositStatus: 'UNPAID',
    depositReceipt: null,
    discoveryMode: 'rapid',
    deckBatchVersion: 1,
    executiveConstraints: demoRoom.executiveConstraints,
  };
}
