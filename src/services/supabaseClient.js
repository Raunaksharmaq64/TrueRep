import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create Supabase Client instance only if credentials are valid
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : null;

/**
 * Creates or joins a Supabase Realtime channel for multi-device presence & broadcast
 * @param {string} channelName 
 * @returns {import('@supabase/supabase-js').RealtimeChannel | null}
 */
export function createRealtimeBoutChannel(channelName) {
  if (!supabase) return null;

  try {
    const channel = supabase.channel(channelName);
    return channel;
  } catch (err) {
    console.warn('Failed to create Supabase channel:', err);
    return null;
  }
}

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT HELPERS
// =============================================================================

/**
 * Sign up new user with Email, Password, and Profile Metadata
 */
export async function signUpUser(email, password, username, displayName, healthData = {}) {
  if (!supabase) {
    // Local offline mock fallback
    const mockUser = {
      id: 'demo_user_1',
      email,
      user_metadata: {
        username,
        display_name: displayName,
        ...healthData
      }
    };
    try {
      localStorage.setItem('truerep_demo_user', JSON.stringify(mockUser));
      localStorage.setItem('truerep_user_health_profile', JSON.stringify(healthData));
    } catch {}
    return { data: { user: mockUser }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        ...healthData
      }
    }
  });

  if (!error && healthData) {
    try {
      localStorage.setItem('truerep_user_health_profile', JSON.stringify(healthData));
    } catch {}
  }

  return { data, error };
}

/**
 * Sign in existing user with Email & Password
 */
export async function signInUser(email, password) {
  if (!supabase) {
    const mockUser = { id: 'demo_user_1', email, user_metadata: { username: email.split('@')[0], display_name: 'Demo Athlete' } };
    localStorage.setItem('truerep_demo_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!supabase) {
    localStorage.removeItem('truerep_demo_user');
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Fetch current authenticated user session
 */
export async function getCurrentUser() {
  if (!supabase) {
    const raw = localStorage.getItem('truerep_demo_user');
    return raw ? JSON.parse(raw) : null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session ? session.user : null;
}

/**
 * Fetch full profile for specified user_id (Joined with user_stats table)
 */
export async function getUserProfile(userId) {
  let healthProfile = {};
  try {
    const saved = localStorage.getItem('truerep_user_health_profile');
    if (saved) healthProfile = JSON.parse(saved);
  } catch {}

  const SERVER_STAT_KEYS = [
    'current_level', 'level', 'total_xp', 'xp',
    'rep_tokens', 'rt', 'tokens',
    'rank_tier', 'rank', 'mmr_rating', 'mmr', 'rr_rating', 'rr',
    'afs_score', 'win_streak', 'total_duels', 'wins', 'losses', 'avg_form_score'
  ];

  SERVER_STAT_KEYS.forEach(k => delete healthProfile[k]);

  if (!supabase || !userId) {
    return {
      id: userId || 'demo_user_1',
      username: 'Abhay',
      display_name: 'Abhay Sharma',
      total_xp: 3420,
      current_level: 14,
      rep_tokens: 1840,
      streak_days: 7,
      mmr_rating: 1080,
      afs_score: 108.00,
      rr_rating: 80,
      rank_tier: 'Bronze II',
      age: 24,
      gender: 'Male',
      weight_kg: 72,
      target_weight_kg: 75,
      height_cm: 178,
      fitness_goal: 'Athletic Performance',
      daily_water_target_l: 3.0,
      daily_tut_target_mins: 60,
      unit_preference: 'KG',
      ...healthProfile
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_stats(*)')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;

  const stats = Array.isArray(data.user_stats) ? data.user_stats[0] : data.user_stats;
  const combined = {
    ...healthProfile,
    ...(stats || {}),
    ...data
  };

  delete combined.user_stats;
  if (combined.current_level === undefined && combined.level !== undefined) combined.current_level = combined.level;
  if (combined.total_xp === undefined && combined.xp !== undefined) combined.total_xp = combined.xp;
  if (combined.rep_tokens === undefined) combined.rep_tokens = combined.rt ?? combined.tokens ?? 100;
  if (combined.rank_tier === undefined && combined.rank !== undefined) combined.rank_tier = combined.rank;
  if (combined.mmr_rating === undefined && combined.mmr !== undefined) combined.mmr_rating = combined.mmr;

  return combined;
}

/**
 * Subscribe to live Postgres table updates on profiles & user_stats for real-time bi-directional sync
 */
export function subscribeToUserProfileChanges(userId, onUpdate) {
  if (!supabase || !userId) return null;

  try {
    const channel = supabase
      .channel(`user_profile_realtime_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('[TrueRep Server Sync] Profiles update received:', payload.new);
          if (payload.new && onUpdate) {
            const norm = {
              ...payload.new,
              current_level: payload.new.current_level ?? payload.new.level,
              total_xp: payload.new.total_xp ?? payload.new.xp,
              rep_tokens: payload.new.rep_tokens ?? payload.new.rt ?? payload.new.tokens
            };
            onUpdate(norm);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('[TrueRep Server Sync] User stats update received:', payload.new);
          if (payload.new && onUpdate) {
            const norm = {
              ...payload.new,
              rank_tier: payload.new.rank_tier ?? payload.new.rank,
              mmr_rating: payload.new.mmr_rating ?? payload.new.mmr
            };
            onUpdate(norm);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('[TrueRep Realtime Profile Sync Error]:', err);
    return null;
  }
}

/**
 * Log XP transaction history to public.xp_transactions table
 */
export async function logXPTransaction(userId, xpAmount, source = 'SOLO_WORKOUT', tokensAwarded = 0) {
  if (!supabase || !userId || !xpAmount) return null;

  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .insert([
        {
          user_id: userId,
          xp_amount: Math.round(xpAmount),
          source,
          rep_tokens_awarded: Math.round(tokensAwarded)
        }
      ])
      .select();

    if (error) console.warn('[TrueRep XP Log Warning]:', error.message || error);
    return { data, error };
  } catch (err) {
    console.warn('[TrueRep XP Log Exception]:', err);
    return null;
  }
}

/**
 * Grant Workout XP & update levels via Supabase RPC or direct sync
 */
export async function grantWorkoutXP(userId, tutSeconds, reps, formScore, intensity = 1.0) {
  if (!supabase || !userId) {
    // Offline local math fallback
    const baseXP = Math.round(((tutSeconds * 2) + (reps * 10)) * formScore * intensity);
    const tokens = Math.floor(baseXP * 0.1);
    return {
      success: true,
      xp_earned: baseXP,
      tokens_earned: tokens,
      total_xp: 3825,
      new_level: 15,
      leveled_up: true
    };
  }

  const { data, error } = await supabase.rpc('grant_workout_xp', {
    p_user_id: userId,
    p_tut_seconds: tutSeconds,
    p_reps: reps,
    p_form_score: formScore,
    p_exercise_intensity: intensity,
    p_source: 'SOLO_WORKOUT'
  });

  // Fallback transaction logging if RPC procedure didn't log
  if (!error && data?.xp_earned) {
    logXPTransaction(userId, data.xp_earned, 'SOLO_WORKOUT', data.tokens_earned || 0);
  }

  return data || { error };
}

/**
 * Update User Profile fields (username, display_name, avatar_url, banner_url, title, unit_preference, health biometrics)
 */
export async function updateUserProfile(userId, updates = {}) {
  try {
    const saved = localStorage.getItem('truerep_user_health_profile') || '{}';
    const parsed = JSON.parse(saved);
    const merged = { ...parsed, ...updates };
    const SERVER_STAT_KEYS = [
      'current_level', 'level', 'total_xp', 'xp',
      'rep_tokens', 'rt', 'tokens',
      'rank_tier', 'rank', 'mmr_rating', 'mmr', 'rr_rating', 'rr',
      'afs_score', 'win_streak', 'total_duels', 'wins', 'losses', 'avg_form_score'
    ];
    SERVER_STAT_KEYS.forEach(k => delete merged[k]);
    localStorage.setItem('truerep_user_health_profile', JSON.stringify(merged));
  } catch {}

  if (!supabase || !userId) {
    return { data: updates, error: null };
  }

  // Allowed columns for public.profiles table
  const profileColumns = [
    'username', 'display_name', 'avatar_url', 'banner_url', 'title',
    'age', 'gender', 'weight_kg', 'target_weight_kg', 'height_cm', 'fitness_goal',
    'daily_water_target_l', 'daily_tut_target_mins', 'unit_preference',
    'total_xp', 'current_level', 'rep_tokens', 'streak_days',
    'health_biometrics', 'custom_goals', 'custom_songs', 'last_workout_date'
  ];

  // Allowed columns for public.user_stats table
  const statsColumns = [
    'afs_score', 'mmr_rating', 'rr_rating', 'rank_tier',
    'win_streak', 'total_duels', 'wins', 'losses', 'avg_form_score'
  ];

  const profilePayload = {};
  const statsPayload = {};

  const normalizedUpdates = { ...updates };
  if (normalizedUpdates.level !== undefined && normalizedUpdates.current_level === undefined) normalizedUpdates.current_level = normalizedUpdates.level;
  if (normalizedUpdates.xp !== undefined && normalizedUpdates.total_xp === undefined) normalizedUpdates.total_xp = normalizedUpdates.xp;
  if (normalizedUpdates.rt !== undefined && normalizedUpdates.rep_tokens === undefined) normalizedUpdates.rep_tokens = normalizedUpdates.rt;
  if (normalizedUpdates.tokens !== undefined && normalizedUpdates.rep_tokens === undefined) normalizedUpdates.rep_tokens = normalizedUpdates.tokens;
  if (normalizedUpdates.rank !== undefined && normalizedUpdates.rank_tier === undefined) normalizedUpdates.rank_tier = normalizedUpdates.rank;
  if (normalizedUpdates.mmr !== undefined && normalizedUpdates.mmr_rating === undefined) normalizedUpdates.mmr_rating = normalizedUpdates.mmr;
  if (normalizedUpdates.rr !== undefined && normalizedUpdates.rr_rating === undefined) normalizedUpdates.rr_rating = normalizedUpdates.rr;

  Object.keys(normalizedUpdates).forEach((key) => {
    if (profileColumns.includes(key)) profilePayload[key] = normalizedUpdates[key];
    if (statsColumns.includes(key)) statsPayload[key] = normalizedUpdates[key];
  });

  let profileRes = { data: null, error: null };
  let statsRes = { data: null, error: null };

  if (Object.keys(profilePayload).length > 0) {
    profileRes = await supabase
      .from('profiles')
      .update({
        ...profilePayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .maybeSingle();
  }

  if (Object.keys(statsPayload).length > 0) {
    statsRes = await supabase
      .from('user_stats')
      .update({
        ...statsPayload,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .maybeSingle();
  }

  return {
    data: profileRes.data || statsRes.data || updates,
    error: profileRes.error || statsRes.error || null
  };
}
