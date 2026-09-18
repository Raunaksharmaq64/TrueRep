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
 * @param {object} deviceState 
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
