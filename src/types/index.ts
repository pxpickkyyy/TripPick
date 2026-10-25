import type { TravelDestination } from '../lib/travelDestinations.ts';

/**
 * Organizational Hierarchy Roles for Corporate Consensus Engine
 * - EXECUTIVE: C-Level, Founders, Managing Directors (Weight: +2 votes, Hard VETO Power)
 * - ORGANIZER: Tech Leads, HR & People Ops, Event Leads (Weight: +2 votes)
 * - MEMBER: Team Members, Attendees, General Employees (Weight: +1 vote)
 */
export type ParticipantRole = 'EXECUTIVE' | 'ORGANIZER' | 'MEMBER';

/**
 * Executive Governance Constraints
 * Decks automatically filter out venues violating these rules prior to voting.
 */
export interface ExecutiveConstraints {
  maxBudgetPerHead?: number;
  requiredBoardroomCapacity?: number;
  mandatoryAmenities?: string[];
}

export interface ParticipantProfile {
  id: string;
  room_id: string;
  user_name: string;
  role: ParticipantRole;
  title?: string;
  preferred_amenities: string[];
  joinedAt?: number;
  lastHeartbeat?: number;
  isHost?: boolean;
  isSimulated?: boolean;
}

export type RoomUser = ParticipantProfile;

export interface Room {
  id: string;
  created_at: string;
  status: 'waiting' | 'swiping' | 'matched';
  destinations_deck: TravelDestination[] | null;
  vibe?: string;
  host_id?: string;
  discovery_mode?: 'rapid' | 'infinite';
  deck_batch_version?: number;
  min_budget?: number;
  max_budget?: number;
  executiveConstraints?: ExecutiveConstraints;
}

export type RoomState = Room;

export interface Swipe {
  id: string;
  room_id: string;
  user_id: string;
  destination_id: number;
  is_like: boolean;
  is_veto?: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_name: string;
  message_text: string;
  created_at: string;
}

export type StepType = 'landing' | 'profile' | 'lobby' | 'swiping' | 'matched';

export interface DepositReceipt {
  receiptNo: string;
  amount: number;
  paidAt: string;
  taxId: string;
}

export interface CachedSessionState {
  roomId: string;
  step: StepType;
  room: Room | null;
  users: RoomUser[];
  swipes: Swipe[];
  messages: ChatMessage[];
  matchedDestination: TravelDestination | null;
  currentUser: RoomUser | null;
  isHost: boolean;
  lastUpdated: number;
  depositStatus?: 'UNPAID' | 'PENDING' | 'SECURED_ESCROW';
  depositReceipt?: DepositReceipt | null;
  discoveryMode?: 'rapid' | 'infinite';
  deckBatchVersion?: number;
  executiveConstraints?: ExecutiveConstraints;
}

/**
 * Normalizes any string representation of a role into corporate hierarchy ParticipantRole
 */
export function normalizeParticipantRole(rawRole?: string): ParticipantRole {
  if (!rawRole) return 'MEMBER';
  const clean = rawRole.trim().toUpperCase();
  if (
    clean === 'EXECUTIVE' ||
    clean.includes('EXECUTIVE') ||
    clean.includes('C-LEVEL') ||
    clean.includes('FOUNDER') ||
    clean.includes('ผู้บริหาร') ||
    clean.includes('ผู้ก่อตั้ง') ||
    clean.includes('กรรมการ') ||
    clean.includes('CEO') ||
    clean.includes('CFO') ||
    clean.includes('DIRECTOR')
  ) {
    return 'EXECUTIVE';
  }
  if (
    clean === 'ORGANIZER' ||
    clean.includes('ORGANIZER') ||
    clean.includes('HR') ||
    clean.includes('LEAD') ||
    clean.includes('หัวหน้า') ||
    clean.includes('จัดกิจกรรม') ||
    clean.includes('HOST')
  ) {
    return 'ORGANIZER';
  }
  return 'MEMBER';
}

export * from './procurement.ts';
export * from '../lib/hierarchy.ts';
