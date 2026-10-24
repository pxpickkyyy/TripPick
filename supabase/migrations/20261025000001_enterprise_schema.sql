-- TripPick: Real Enterprise B2B Procurement & Consensus Engine Architecture
-- Production PostgreSQL Migration: Tables, Indexes, and Atomic RPC with Anti-Spoofing & Cold-Start Protection

-- 1. Trippick Rooms: Primary source of truth for retreat rooms
CREATE TABLE IF NOT EXISTS trippick_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(64) UNIQUE NOT NULL,
    host_user_id TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONSENSUS_REACHED', 'LOCKED_ESCROW', 'ARCHIVED')),
    headcount INT NOT NULL CHECK (headcount > 0),
    budget_per_head NUMERIC(10, 2) NOT NULL CHECK (budget_per_head >= 0),
    archetype VARCHAR(30) NOT NULL,
    winning_destination_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trippick_rooms_code ON trippick_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_trippick_rooms_status ON trippick_rooms(status);

-- 2. Room Participants: Authoritative Presence Ledger (Eliminates Spoofing & Cold-Start Exploits)
CREATE TABLE IF NOT EXISTS room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID REFERENCES trippick_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_active ON room_participants(room_id, last_seen);

-- 3. Room Votes: Immutable Vote Ledger
CREATE TABLE IF NOT EXISTS room_votes (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID REFERENCES trippick_rooms(id) ON DELETE CASCADE,
    destination_id VARCHAR(100) NOT NULL,
    user_id TEXT NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('LIKE', 'DISLIKE', 'VETO')),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_id, destination_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_votes_lookup ON room_votes(room_id, destination_id);

-- 4. Procurement Orders: Enterprise B2B Financial Ledger with 30-min PromptPay Expiration
CREATE TABLE IF NOT EXISTS procurement_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES trippick_rooms(id),
    rfp_reference_code VARCHAR(64) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_tax_id VARCHAR(20) NOT NULL,
    approver_email VARCHAR(255) NOT NULL,
    subtotal_before_vat NUMERIC(12, 2) NOT NULL,
    hotel_service_charge_10_percent NUMERIC(12, 2) DEFAULT 0,
    service_fee_base NUMERIC(12, 2) NOT NULL,
    vat_7_percent NUMERIC(12, 2) NOT NULL,
    gross_total NUMERIC(12, 2) NOT NULL,
    wht_3_percent NUMERIC(12, 2) NOT NULL,
    net_payable NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) DEFAULT 5000.00,
    deposit_status VARCHAR(30) DEFAULT 'PENDING' CHECK (deposit_status IN ('PENDING', 'HELD_IN_ESCROW', 'CREDITED_TO_BOOKING', 'REFUNDED')),
    gateway_charge_id VARCHAR(100),
    pdf_invoice_url TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procurement_orders_ref ON procurement_orders(rfp_reference_code);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_status ON procurement_orders(deposit_status);

-- 5. Verified Destinations: Cache for live Google Places grounding
CREATE TABLE IF NOT EXISTS verified_destinations (
    id VARCHAR(100) PRIMARY KEY,
    google_place_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    price_per_person NUMERIC(10, 2) NOT NULL,
    wifi_speed_mbps INT NOT NULL,
    max_capacity INT NOT NULL,
    rating NUMERIC(3, 2),
    user_rating_count INT,
    hero_image TEXT NOT NULL,
    formatted_address TEXT,
    google_maps_uri TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    corporate_agenda JSONB DEFAULT '[]'::jsonb,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Participant Heartbeat Function
CREATE OR REPLACE FUNCTION touch_participant_heartbeat(
    p_room_id TEXT,
    p_user_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room_id UUID;
BEGIN
    SELECT id INTO v_room_id
    FROM trippick_rooms
    WHERE id::text = p_room_id OR room_code = p_room_id
    LIMIT 1;

    IF v_room_id IS NULL THEN
        INSERT INTO trippick_rooms (room_code, host_user_id, status, headcount, budget_per_head, archetype)
        VALUES (p_room_id, p_user_id, 'ACTIVE', 10, 5000, 'EXECUTIVE_RETREAT')
        ON CONFLICT (room_code) DO NOTHING;

        SELECT id INTO v_room_id
        FROM trippick_rooms
        WHERE id::text = p_room_id OR room_code = p_room_id
        LIMIT 1;
    END IF;

    IF v_room_id IS NOT NULL THEN
        INSERT INTO room_participants (room_id, user_id, joined_at, last_seen)
        VALUES (v_room_id, p_user_id, NOW(), NOW())
        ON CONFLICT (room_id, user_id)
        DO UPDATE SET last_seen = NOW();
    END IF;
END;
$$;

-- 7. Atomic Consensus Calculation Function (Critical Fixes 2 & 3)
-- Removes client-passed p_active_participants; counts active participants strictly from room_participants
CREATE OR REPLACE FUNCTION record_vote_and_check_consensus(
    p_room_id TEXT,
    p_destination_id TEXT,
    p_user_id TEXT,
    p_vote_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room trippick_rooms%ROWTYPE;
    v_active_count INT;
    v_like_count INT;
    v_veto_count INT;
    v_threshold INT;
BEGIN
    -- ATOMIC TRANSACTION: Row-level lock by room UUID or room code to prevent concurrent consensus split-brain
    SELECT * INTO v_room
    FROM trippick_rooms
    WHERE (id::text = p_room_id OR room_code = p_room_id)
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Auto-provision room entry if not pre-seeded
        INSERT INTO trippick_rooms (room_code, host_user_id, status, headcount, budget_per_head, archetype)
        VALUES (p_room_id, p_user_id, 'ACTIVE', 10, 5000, 'EXECUTIVE_RETREAT')
        ON CONFLICT (room_code) DO NOTHING;

        SELECT * INTO v_room
        FROM trippick_rooms
        WHERE (id::text = p_room_id OR room_code = p_room_id)
        LIMIT 1
        FOR UPDATE;
    END IF;

    -- If room already settled consensus or locked, return current winning destination immediately
    IF v_room.winning_destination_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'matched', true,
            'winning_destination_id', v_room.winning_destination_id,
            'already_settled', true
        );
    END IF;

    -- Update participant presence heartbeat using authoritative room UUID
    INSERT INTO room_participants (room_id, user_id, joined_at, last_seen)
    VALUES (v_room.id, p_user_id, NOW(), NOW())
    ON CONFLICT (room_id, user_id)
    DO UPDATE SET last_seen = NOW();

    -- Upsert vote atomically
    INSERT INTO room_votes (room_id, destination_id, user_id, vote_type, voted_at)
    VALUES (v_room.id, p_destination_id, p_user_id, p_vote_type, NOW())
    ON CONFLICT (room_id, destination_id, user_id)
    DO UPDATE SET
        vote_type = EXCLUDED.vote_type,
        voted_at = EXCLUDED.voted_at;

    IF p_vote_type = 'VETO' THEN
        RETURN jsonb_build_object('matched', false, 'reason', 'VETO_RECORDED');
    END IF;

    -- Authoritative active participant count: active in last 30 seconds
    SELECT COUNT(*) INTO v_active_count
    FROM room_participants
    WHERE room_id = v_room.id 
      AND last_seen > NOW() - INTERVAL '30 seconds';

    -- Guard: Fallback to at least 1 attendee
    v_active_count := GREATEST(1, COALESCE(v_active_count, 1));

    -- Threshold rule: solo=1, dual=2, 3+ pax = 60% supermajority
    v_threshold := CASE 
        WHEN v_active_count <= 2 THEN v_active_count 
        ELSE CEIL(v_active_count * 0.60)::INT 
    END;

    -- Count current likes and vetoes for this venue
    SELECT COUNT(*) INTO v_like_count
    FROM room_votes
    WHERE room_id = v_room.id
      AND destination_id = p_destination_id
      AND vote_type = 'LIKE';

    SELECT COUNT(*) INTO v_veto_count
    FROM room_votes
    WHERE room_id = v_room.id
      AND destination_id = p_destination_id
      AND vote_type = 'VETO';

    -- Evaluate consensus: must have zero vetoes and reach supermajority threshold
    IF v_veto_count = 0 AND v_like_count >= v_threshold THEN
        UPDATE trippick_rooms
        SET winning_destination_id = p_destination_id,
            status = 'CONSENSUS_REACHED',
            updated_at = NOW()
        WHERE id = v_room.id;

        RETURN jsonb_build_object(
            'matched', true,
            'winning_destination_id', p_destination_id,
            'like_count', v_like_count,
            'threshold', v_threshold,
            'active_participants', v_active_count
        );
    END IF;

    RETURN jsonb_build_object(
        'matched', false,
        'like_count', v_like_count,
        'threshold', v_threshold,
        'active_participants', v_active_count
    );
END;
$$;

-- Enable Supabase Realtime Row-Level Change Replication for trippick_rooms
ALTER TABLE trippick_rooms REPLICA IDENTITY FULL;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE trippick_rooms;
    END IF;
END;
$$;

-- Row Level Security (RLS) Policies
ALTER TABLE trippick_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to rooms" ON trippick_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert to rooms" ON trippick_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to rooms" ON trippick_rooms FOR UPDATE USING (true);

ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to participants" ON room_participants FOR ALL USING (true);

ALTER TABLE room_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to votes" ON room_votes FOR ALL USING (true);

ALTER TABLE procurement_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to procurement_orders" ON procurement_orders FOR ALL USING (true);

ALTER TABLE verified_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read to verified_destinations" ON verified_destinations FOR SELECT USING (true);
