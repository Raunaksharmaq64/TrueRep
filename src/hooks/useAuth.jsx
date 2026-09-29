import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { 
  supabase, 
  isSupabaseConfigured, 
  getCurrentUser, 
  getUserProfile, 
  signUpUser, 
  signInUser, 
  signOutUser,
  grantWorkoutXP,
  subscribeToUserProfileChanges,
  updateUserProfile,
  logXPTransaction
} from '../services/supabaseClient';
import { 
  getLevelProgress, 
  getRankTierFromMMR, 
  calculateWorkoutXP, 
  processDuelReward 
} from '../utils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('truerep_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
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
      unit_preference: 'KG'
    };
  });
  const [isLoading, setIsLoading] = useState(true);

  // Compute live leveling progress & rank info
  const levelProgress = useMemo(() => {
    const rawXp = profile?.total_xp ?? profile?.xp ?? 0;
    const rawLevel = profile?.current_level ?? profile?.level ?? null;
    return getLevelProgress(rawXp, rawLevel);
  }, [profile?.total_xp, profile?.xp, profile?.current_level, profile?.level]);

  const rankProgress = useMemo(() => {
    const rawMMR = profile?.mmr_rating ?? profile?.mmr ?? 1080;
    const rawTier = profile?.rank_tier ?? profile?.rank ?? null;
    return getRankTierFromMMR(rawMMR, rawTier);
  }, [profile?.mmr_rating, profile?.mmr, profile?.rank_tier, profile?.rank]);

  // Refetch complete profile + stats from backend
  const refetchProfile = async (overrideUserId) => {
    const targetId = overrideUserId || user?.id;
    if (!targetId) return;
    try {
      const prof = await getUserProfile(targetId);
      if (prof) setProfile(prev => ({ ...prev, ...prof }));
    } catch (err) {
      console.warn('Profile refetch error:', err);
    }
  };

  // Initial Auth, Realtime Subscription & Tab Focus Auto-Sync
  useEffect(() => {
    let realtimeChannel = null;

    async function initAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const prof = await getUserProfile(currentUser.id);
          if (prof) setProfile(prev => ({ ...prev, ...prof }));

          // Realtime push update listener
          realtimeChannel = subscribeToUserProfileChanges(currentUser.id, async (pushedProfile) => {
            console.log('[TrueRep Realtime Push] Syncing latest profile from backend...', pushedProfile);
            if (pushedProfile) {
              setProfile(prev => ({
                ...prev,
                ...pushedProfile,
                current_level: pushedProfile.current_level ?? pushedProfile.level ?? prev.current_level,
                total_xp: pushedProfile.total_xp ?? pushedProfile.xp ?? prev.total_xp
              }));
            }
            const updated = await getUserProfile(currentUser.id);
            if (updated) setProfile(prev => ({ ...prev, ...updated }));
          });
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Tab Focus Auto-Sync: Automatically updates frontend state when returning to browser tab
    const handleFocus = async () => {
      const activeUser = user || await getCurrentUser();
      if (activeUser?.id) {
        const freshProfile = await getUserProfile(activeUser.id);
        if (freshProfile) setProfile(prev => ({ ...prev, ...freshProfile }));
      }
    };
    window.addEventListener('focus', handleFocus);

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await getUserProfile(session.user.id);
          if (prof) setProfile(prev => ({ ...prev, ...prof }));
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('focus', handleFocus);
        if (realtimeChannel) realtimeChannel.unsubscribe();
      };
    }
  }, [user?.id]);

  const login = async (email, password) => {
    const { data, error } = await signInUser(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      const prof = await getUserProfile(data.user.id);
      if (prof) setProfile(prev => ({ ...prev, ...prof }));
    }
    return { data, error };
  };

  const signup = async (email, password, username, displayName, healthData = {}) => {
    const { data, error } = await signUpUser(email, password, username, displayName, healthData);
    if (!error && data?.user) {
      setUser(data.user);
      const prof = await getUserProfile(data.user.id);
      if (prof) setProfile(prev => ({ ...prev, ...prof, ...healthData }));
    }
    return { data, error };
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  const addXP = async (tutSeconds, reps, formScore, intensity = 1.0) => {
    if (!user) {
      // Local offline fallback
      const { xpEarned, tokensEarned } = calculateWorkoutXP({ tutSeconds, reps, formScore, intensity, streakDays: profile.streak_days });
      const newXp = (profile.total_xp || 0) + xpEarned;
      const newProgress = getLevelProgress(newXp);
      setProfile(prev => ({
        ...prev,
        total_xp: newXp,
        current_level: newProgress.currentLevel,
        rep_tokens: (prev.rep_tokens || 100) + tokensEarned
      }));
      return { success: true, xp_earned: xpEarned, tokens_earned: tokensEarned, total_xp: newXp, new_level: newProgress.currentLevel };
    }

    const res = await grantWorkoutXP(user.id, tutSeconds, reps, formScore, intensity);
    if (res?.success) {
      setProfile(prev => ({
        ...prev,
        total_xp: res.total_xp,
        current_level: res.new_level,
        rep_tokens: (prev.rep_tokens || 100) + res.tokens_earned
      }));
    }
    return res;
  };

  const processDuelResult = (duelData = {}) => {
    const reward = processDuelReward(profile, { mmr_rating: profile.mmr_rating || 1080 }, duelData);
    
    setProfile(prev => ({
      ...prev,
      total_xp: reward.newTotalXp,
      current_level: reward.newLevel,
      rep_tokens: (prev.rep_tokens || 100) + reward.tokensEarned,
      mmr_rating: reward.newMMR,
      rr_rating: reward.newRR,
      rank_tier: reward.newTier
    }));

    if (user) {
      updateUserProfile(user.id, {
        total_xp: reward.newTotalXp,
        current_level: reward.newLevel,
        rep_tokens: (profile.rep_tokens || 100) + reward.tokensEarned,
        mmr_rating: reward.newMMR,
        rr_rating: reward.newRR,
        rank_tier: reward.newTier
      });
      if (reward.xpEarned > 0) {
        logXPTransaction(user.id, reward.xpEarned, 'DUEL_BOUT', reward.tokensEarned);
      }
    }

    return reward;
  };

  const updateProfile = async (updates) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('truerep_user_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (user) {
      await updateUserProfile(user.id, updates);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      levelProgress,
      rankProgress,
      isLoading,
      isSupabaseConfigured,
      login,
      signup,
      logout,
      addXP,
      processDuelResult,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
