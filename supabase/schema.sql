-- =============================================================================
-- TRUEREP PRODUCTION DATABASE SCHEMA & SECURITY MIGRATION SCRIPT
-- Run this script in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- -----------------------------------------------------------------------------
-- 1. PUBLIC PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(32) UNIQUE NOT NULL,
    display_name VARCHAR(64),
    avatar_url TEXT,
    banner_url TEXT,
    title VARCHAR(64) DEFAULT 'Kinematic Athlete',
    age INT DEFAULT 24,
    gender VARCHAR(16) DEFAULT 'Unspecified',
    weight_kg NUMERIC(5,2) DEFAULT 70.00,
    target_weight_kg NUMERIC(5,2) DEFAULT 70.00,
    height_cm NUMERIC(5,2) DEFAULT 175.00,
    fitness_goal VARCHAR(64) DEFAULT 'Athletic Performance',
    daily_water_target_l NUMERIC(3,1) DEFAULT 3.0,
    daily_tut_target_mins INT DEFAULT 60,
    unit_preference VARCHAR(8) DEFAULT 'KG',
    total_xp BIGINT DEFAULT 0,
    current_level INT DEFAULT 1,
    rep_tokens INT DEFAULT 100,
    streak_days INT DEFAULT 0,
    health_biometrics JSONB DEFAULT '{}'::jsonb,
    custom_goals JSONB DEFAULT '[]'::jsonb,
    custom_songs JSONB DEFAULT '[]'::jsonb,
    last_workout_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column migrations for existing databases
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title VARCHAR(64) DEFAULT 'Kinematic Athlete';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INT DEFAULT 24;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(16) DEFAULT 'Unspecified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2) DEFAULT 70.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC(5,2) DEFAULT 70.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2) DEFAULT 175.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goal VARCHAR(64) DEFAULT 'Athletic Performance';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_water_target_l NUMERIC(3,1) DEFAULT 3.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_tut_target_mins INT DEFAULT 60;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_preference VARCHAR(8) DEFAULT 'KG';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp BIGINT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_level INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rep_tokens INT DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_biometrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_goals JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_songs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_workout_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. USER COMPETITIVE STATS TABLE (AFS, MMR, RR)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    afs_score NUMERIC(6,2) DEFAULT 100.00,
    mmr_rating INT DEFAULT 1000,
    rr_rating INT DEFAULT 0,
    rank_tier VARCHAR(32) DEFAULT 'Bronze I',
    win_streak INT DEFAULT 0,
    total_duels INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    avg_form_score NUMERIC(4,3) DEFAULT 0.920,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column migrations for user_stats
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS afs_score NUMERIC(6,2) DEFAULT 100.00;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS mmr_rating INT DEFAULT 1000;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS rr_rating INT DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS rank_tier VARCHAR(32) DEFAULT 'Bronze I';
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS win_streak INT DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS total_duels INT DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS wins INT DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS losses INT DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS avg_form_score NUMERIC(4,3) DEFAULT 0.920;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. WORKOUT SESSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_type VARCHAR(64) NOT NULL,
    total_reps INT NOT NULL DEFAULT 0,
    total_tut_seconds INT NOT NULL DEFAULT 0,
    avg_form_score NUMERIC(4,3) DEFAULT 0.900,
    xp_earned INT DEFAULT 0,
    tokens_earned INT DEFAULT 0,
    idempotency_key VARCHAR(128) UNIQUE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. XP TRANSACTIONS HISTORY TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp_amount INT NOT NULL,
    source VARCHAR(32) NOT NULL,
    rep_tokens_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5. FOREIGN-KEY & PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_stats_mmr_rating ON public.user_stats(mmr_rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_afs_score ON public.user_stats(afs_score DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON public.workout_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);

-- -----------------------------------------------------------------------------
-- 6. UPDATED_AT TRIGGER FUNCTION & TRIGGERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER trg_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6B. AUTOMATIC LEVEL <-> XP BI-DIRECTIONAL SYNCHRONIZATION TRIGGER
-- Dedicated XP requirement per level: XP = CEIL(100 * (Level - 1)^1.6)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_profile_level_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. If current_level was manually updated in backend, calculate matching total_xp
    IF (TG_OP = 'INSERT') OR (NEW.current_level IS DISTINCT FROM OLD.current_level AND NEW.total_xp IS NOT DISTINCT FROM OLD.total_xp) THEN
        IF NEW.current_level <= 1 THEN
            NEW.total_xp := 0;
        ELSE
            NEW.total_xp := CEIL(100.0 * POWER(GREATEST(1, NEW.current_level) - 1, 1.6));
        END IF;
    -- 2. If total_xp was updated, calculate matching current_level
    ELSIF (NEW.total_xp IS DISTINCT FROM OLD.total_xp) THEN
        NEW.current_level := FLOOR(POWER(GREATEST(0, NEW.total_xp)::NUMERIC / 100.0, 1.0 / 1.6)) + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_profile_level_xp ON public.profiles;
CREATE TRIGGER trg_sync_profile_level_xp
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_level_xp();

-- -----------------------------------------------------------------------------
-- 7. SECURITY & RLS POLICIES (AUTHENTICATED & PUBLIC READ ACCESS)
-- -----------------------------------------------------------------------------
-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Stats Policies
DROP POLICY IF EXISTS "User stats viewable by everyone" ON public.user_stats;
DROP POLICY IF EXISTS "Users stats viewable by authenticated users" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

CREATE POLICY "User stats viewable by everyone" 
    ON public.user_stats FOR SELECT USING (true);

CREATE POLICY "Users can update own stats" 
    ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Workout Sessions Policies
DROP POLICY IF EXISTS "Users can view own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users view own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can insert own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users insert own workout sessions" ON public.workout_sessions;

CREATE POLICY "Users view own workout sessions" 
    ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workout sessions" 
    ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Transactions Policies
DROP POLICY IF EXISTS "Users view own XP transactions" ON public.xp_transactions;
DROP POLICY IF EXISTS "Users insert own XP transactions" ON public.xp_transactions;

CREATE POLICY "Users view own XP transactions" 
    ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own XP transactions" 
    ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. AUTOMATIC PROFILE & STATS CREATION TRIGGER ON SIGNUP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    v_age INT;
    v_weight NUMERIC;
    v_height NUMERIC;
    v_goal VARCHAR;
    v_k_age NUMERIC;
    v_bmi NUMERIC;
    v_k_bmi NUMERIC;
    v_k_goal NUMERIC := 1.0;
    v_afs NUMERIC(6,2);
    v_mmr INT;
    v_rr INT;
    v_tier VARCHAR(32);
BEGIN
    v_age := COALESCE((NEW.raw_user_meta_data->>'age')::INT, 24);
    v_weight := COALESCE((NEW.raw_user_meta_data->>'weight_kg')::NUMERIC, 70.0);
    v_height := COALESCE((NEW.raw_user_meta_data->>'height_cm')::NUMERIC, 175.0);
    v_goal := COALESCE(NEW.raw_user_meta_data->>'fitness_goal', 'Athletic Performance');

    -- 1. Age factor K_age
    v_k_age := 1.0 + (0.008 * POWER(GREATEST(0, v_age - 25)::NUMERIC, 1.15));

    -- 2. BMI factor K_bmi
    IF v_height > 0 THEN
        v_bmi := v_weight / POWER(v_height / 100.0, 2);
    ELSE
        v_bmi := 22.5;
    END IF;
    v_k_bmi := LEAST(1.30, GREATEST(0.85, v_bmi / 22.5));

    -- 3. Goal multiplier
    IF v_goal LIKE '%Hypertrophy%' OR v_goal LIKE '%Strength%' THEN v_k_goal := 1.04;
    ELSIF v_goal LIKE '%Endurance%' THEN v_k_goal := 0.98;
    ELSIF v_goal LIKE '%Fat Loss%' THEN v_k_goal := 1.02;
    END IF;

    -- 4. Calculate initial 3 scores
    v_afs := ROUND((100.00 * v_k_age * v_k_bmi * v_k_goal)::NUMERIC, 2);
    v_mmr := ROUND(v_afs * 10);
    v_rr := MOD(v_mmr, 100);

    IF v_mmr < 850 THEN v_tier := 'Iron III';
    ELSIF v_mmr < 950 THEN v_tier := 'Iron I';
    ELSIF v_mmr < 1050 THEN v_tier := 'Bronze I';
    ELSIF v_mmr < 1150 THEN v_tier := 'Bronze II';
    ELSIF v_mmr < 1250 THEN v_tier := 'Silver I';
    ELSIF v_mmr < 1350 THEN v_tier := 'Silver II';
    ELSIF v_mmr < 1450 THEN v_tier := 'Gold I';
    ELSIF v_mmr < 1600 THEN v_tier := 'Gold II';
    ELSIF v_mmr < 1800 THEN v_tier := 'Platinum I';
    ELSIF v_mmr < 2000 THEN v_tier := 'Diamond I';
    ELSE v_tier := 'TrueRep Titan';
    END IF;

    -- Create profile with full health tracking biometrics
    INSERT INTO public.profiles (
        id, 
        username, 
        display_name, 
        avatar_url,
        age,
        gender,
        height_cm,
        weight_kg,
        target_weight_kg,
        fitness_goal,
        daily_water_target_l,
        daily_tut_target_mins,
        unit_preference
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'athlete_' || SUBSTRING(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Athlete'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        v_age,
        COALESCE(NEW.raw_user_meta_data->>'gender', 'Unspecified'),
        v_height,
        v_weight,
        COALESCE((NEW.raw_user_meta_data->>'target_weight_kg')::NUMERIC, 70.0),
        v_goal,
        COALESCE((NEW.raw_user_meta_data->>'daily_water_target_l')::NUMERIC, 3.0),
        COALESCE((NEW.raw_user_meta_data->>'daily_tut_target_mins')::INT, 60),
        COALESCE(NEW.raw_user_meta_data->>'unit_preference', 'KG')
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        target_weight_kg = EXCLUDED.target_weight_kg,
        fitness_goal = EXCLUDED.fitness_goal,
        daily_water_target_l = EXCLUDED.daily_water_target_l,
        daily_tut_target_mins = EXCLUDED.daily_tut_target_mins,
        unit_preference = EXCLUDED.unit_preference,
        updated_at = NOW();

    -- Create user stats record with calculated 3 scores
    INSERT INTO public.user_stats (
        user_id,
        afs_score,
        mmr_rating,
        rr_rating,
        rank_tier
    ) VALUES (
        NEW.id,
        v_afs,
        v_mmr,
        v_rr,
        v_tier
    )
    ON CONFLICT (user_id) DO UPDATE SET
        afs_score = EXCLUDED.afs_score,
        mmr_rating = EXCLUDED.mmr_rating,
        rr_rating = EXCLUDED.rr_rating,
        rank_tier = EXCLUDED.rank_tier,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 9. ATOMIC XP & LEVELING STORED PROCEDURE (WITH FOR UPDATE & VALIDATION)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_workout_xp(
    p_user_id UUID,
    p_tut_seconds INT,
    p_reps INT,
    p_form_score NUMERIC,
    p_exercise_intensity NUMERIC DEFAULT 1.0,
    p_source VARCHAR DEFAULT 'SOLO_WORKOUT'
) RETURNS JSONB AS $$
DECLARE
    v_profile RECORD;
    v_streak_multiplier NUMERIC(3,2);
    v_base_xp INT;
    v_tokens INT;
    v_new_total_xp BIGINT;
    v_new_level INT;
    v_leveled_up BOOLEAN := FALSE;
BEGIN
    -- Input Validation
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User ID cannot be null');
    END IF;
    IF p_tut_seconds IS NULL OR p_tut_seconds < 0 OR p_reps IS NULL OR p_reps < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'TUT seconds and reps must be non-negative integers');
    END IF;
    IF p_form_score IS NULL OR p_form_score < 0.0 OR p_form_score > 1.0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Form score must be between 0.000 and 1.000');
    END IF;

    -- Lock profile row FOR UPDATE to prevent race conditions during concurrent updates
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;

    -- Calculate streak multiplier
    v_streak_multiplier := LEAST(1.50, 1.00 + (COALESCE(v_profile.streak_days, 0) * 0.05));

    -- XP Equation: ((TUT * 2) + (Reps * 10)) * Form * Intensity * Streak
    v_base_xp := ROUND(((p_tut_seconds * 2) + (p_reps * 10)) * p_form_score * p_exercise_intensity * v_streak_multiplier);
    v_tokens := FLOOR(v_base_xp * 0.10);

    v_new_total_xp := COALESCE(v_profile.total_xp, 0) + v_base_xp;

    -- Level Calculation Equation: L = floor((XP / 100)^(1 / 1.6)) + 1
    v_new_level := FLOOR(POWER(v_new_total_xp::NUMERIC / 100.0, 1.0 / 1.6)) + 1;

    IF v_new_level > COALESCE(v_profile.current_level, 1) THEN
        v_leveled_up := TRUE;
    END IF;

    -- Update profile atomically
    UPDATE public.profiles
    SET total_xp = v_new_total_xp,
        current_level = v_new_level,
        rep_tokens = rep_tokens + v_tokens,
        last_workout_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log XP transaction
    INSERT INTO public.xp_transactions (user_id, xp_amount, source, rep_tokens_awarded)
    VALUES (p_user_id, v_base_xp, p_source, v_tokens);

    RETURN jsonb_build_object(
        'success', true,
        'xp_earned', v_base_xp,
        'tokens_earned', v_tokens,
        'total_xp', v_new_total_xp,
        'new_level', v_new_level,
        'leveled_up', v_leveled_up
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke public execution of grant_workout_xp RPC for security, grant to authenticated
REVOKE EXECUTE ON FUNCTION public.grant_workout_xp(UUID, INT, INT, NUMERIC, NUMERIC, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_workout_xp(UUID, INT, INT, NUMERIC, NUMERIC, VARCHAR) TO authenticated, service_role;
