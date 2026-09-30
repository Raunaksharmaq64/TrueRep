import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { CheckCircle2, LogOut, X, Sparkles, ShieldCheck } from 'lucide-react';
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
  const [authToast, setAuthToast] = useState(null);

  const triggerAuthToast = (type, title, message) => {
    setAuthToast({ type, title, message });
    setTimeout(() => {
      setAuthToast(null);
    }, 3200);
  };
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

    let authSubscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await getUserProfile(session.user.id);
          if (prof) setProfile(prev => ({ ...prev, ...prof }));
        } else {
          setUser(null);
        }
      });
      authSubscription = data?.subscription;
    }

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      if (realtimeChannel && supabase) {
        try {
          supabase.removeChannel(realtimeChannel);
        } catch (e) {}
      }
    };
  }, [user?.id]);

  const login = async (email, password) => {
    const { data, error } = await signInUser(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      const prof = await getUserProfile(data.user.id);
      if (prof) setProfile(prev => ({ ...prev, ...prof }));
      triggerAuthToast(
        'login',
        'LOGGED IN SUCCESSFULLY',
        `Welcome back! Your TrueRep athlete session is now active.`
      );
    }
    return { data, error };
  };

  const signup = async (email, password, username, displayName, healthData = {}) => {
    const { data, error } = await signUpUser(email, password, username, displayName, healthData);
    if (!error && data?.user) {
      setUser(data.user);
      const prof = await getUserProfile(data.user.id);
      if (prof) setProfile(prev => ({ ...prev, ...prof, ...healthData }));
      triggerAuthToast(
        'login',
        'ACCOUNT REGISTERED',
        `Welcome to TrueRep, ${displayName || username}! Competitive profile activated.`
      );
    }
    return { data, error };
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
    triggerAuthToast(
      'logout',
      'LOGGED OUT SUCCESSFULLY',
      'Your active session has been terminated safely. See you next workout!'
    );
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
      updateProfile,
      triggerAuthToast
    }}>
      {/* HIGH-TECH AUTH TOAST NOTIFICATION OVERLAY */}
      {authToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto animate-bounce-in pointer-events-auto select-none">
          <div className={`p-4 rounded-3xl outline outline-1 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-3.5 transition-all duration-300 ${
            authToast.type === 'login'
              ? 'bg-neutral-900/95 border-emerald-500/50 text-white shadow-[0_0_35px_rgba(16,185,129,0.35)]'
              : 'bg-neutral-900/95 border-red-500/50 text-white shadow-[0_0_35px_rgba(239,68,68,0.35)]'
          }`}>
            {/* Pulse Badge Icon */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              authToast.type === 'login'
                ? 'bg-emerald-500/15 outline outline-1 outline-emerald-500/40 text-emerald-400'
                : 'bg-red-500/15 outline outline-1 outline-red-500/40 text-red-400'
            }`}>
              {authToast.type === 'login' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
              ) : (
                <LogOut className="w-6 h-6 text-red-400 animate-pulse" />
              )}
            </div>

            {/* Message Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider font-mono ${
                  authToast.type === 'login' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {authToast.title}
                </span>
                <span className={`w-2 h-2 rounded-full animate-ping ${
                  authToast.type === 'login' ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
              </div>
              <p className="text-slate-300 text-xs font-sans mt-0.5 leading-snug">
                {authToast.message}
              </p>
            </div>

            <button 
              onClick={() => setAuthToast(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
