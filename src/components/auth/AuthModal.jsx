import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, Activity, Scale, Heart, Droplets, Trophy, Zap, Award, Flame, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks';
import { calculateThreeScores } from '../../utils';

export default function AuthModal({ isOpen, onClose }) {
  const { user, profile, login, signup, logout } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Health Tracking & Biometrics State
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('Male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(72);
  const [fitnessGoal, setFitnessGoal] = useState('Athletic Performance');
  const [dailyWaterTargetL, setDailyWaterTargetL] = useState(3.0);
  const [dailyTutTargetMins, setDailyTutTargetMins] = useState(60);
  const [unitPref, setUnitPref] = useState('KG');

  // Generated 3 Scores State after Registration
  const [generatedScores, setGeneratedScores] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await login(email, password);
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password credentials.');
        } else {
          setSuccessMsg('Successfully signed in to TrueRep!');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        if (!username.trim()) {
          setErrorMsg('Username is required for signup.');
          setSubmitting(false);
          return;
        }

        const healthData = {
          age: Number(age) || 24,
          gender,
          height_cm: Number(heightCm) || 175,
          weight_kg: Number(weightKg) || 70,
          target_weight_kg: Number(targetWeightKg) || 72,
          fitness_goal: fitnessGoal,
          daily_water_target_l: Number(dailyWaterTargetL) || 3.0,
          daily_tut_target_mins: Number(dailyTutTargetMins) || 60,
          unit_preference: unitPref.toUpperCase()
        };

        // Calculate initial 3 scores using the demographic engine
        const scores = calculateThreeScores(healthData);

        const { error } = await signup(
          email, 
          password, 
          username.trim(), 
          displayName.trim() || username.trim(),
          { ...healthData, ...scores }
        );

        if (error) {
          setErrorMsg(error.message || 'Signup failed. Please try again.');
        } else {
          setSuccessMsg('Account registered! Initial 3 competitive scores calculated.');
          setGeneratedScores(scores);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setSuccessMsg('Logged out successfully.');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#1E222A] text-white border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAB308]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#EAB308]/20 border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white tracking-tight">
              {user ? 'TrueRep Account' : mode === 'login' ? 'Welcome Back' : 'Register Health Profile'}
            </h2>
            <p className="text-xs text-slate-400">
              {user ? 'Manage your profile & cloud sync' : 'Configure health biometrics & active workout staking'}
            </p>
          </div>
        </div>

        {/* GENERATED 3 SCORES INITIALIZATION VIEW */}
        {generatedScores ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
              <Award className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-lg font-bold text-white font-heading">Initial Competitive Ratings Generated!</h3>
              <p className="text-xs text-slate-300 mt-1">Calculated from your demographic baseline (Age, Weight, Height & Goal).</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. AFS */}
              <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl text-center">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" /> AFS Score
                </div>
                <div className="text-xl font-bold font-mono text-white">{generatedScores.afs_score}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">Age-Fitness Parity</div>
              </div>

              {/* 2. MMR */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-2xl text-center">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" /> MMR Rating
                </div>
                <div className="text-xl font-bold font-mono text-white">{generatedScores.mmr_rating}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">Lobby Match Elo</div>
              </div>

              {/* 3. RR & Tier */}
              <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl text-center">
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> Rank Tier
                </div>
                <div className="text-sm font-bold text-purple-300 truncate">{generatedScores.rank_tier}</div>
                <div className="text-[9px] text-purple-400 mt-1 font-mono">{generatedScores.rr_rating} RR</div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Demographic Age Coeff:</span>
                <span className="text-amber-400 font-bold">{generatedScores.breakdown.ageFactor}x</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">BMI Parity Coeff:</span>
                <span className="text-emerald-400 font-bold">{generatedScores.breakdown.bmiFactor}x ({generatedScores.breakdown.bmi} BMI)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Fitness Goal Weight:</span>
                <span className="text-cyan-400 font-bold">{generatedScores.breakdown.goalMultiplier}x</span>
              </div>
            </div>

            <button
              onClick={() => {
                setGeneratedScores(null);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-charcoal font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <span>Enter TrueRep & Join Match Lobby</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : user ? (
          /* LOGGED IN VIEW */
          <div className="space-y-5">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 text-charcoal font-bold font-mono text-lg flex items-center justify-center">
                {(profile?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{profile?.display_name || 'Athlete'}</h3>
                <p className="text-xs font-mono text-amber-400">@{profile?.username || 'user'}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-slate-700">
                    🛡️ Lvl {profile?.current_level || 1}
                  </span>
                  <span className="font-mono text-slate-300">🪙 {profile?.rep_tokens || 100} RT</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Sign Out of TrueRep</span>
            </button>
          </div>
        ) : (
          /* LOGIN / SIGNUP FORM VIEW */
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mb-4">
              <button
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className={`py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-[#1E222A] text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => { setMode('signup'); setErrorMsg(null); }}
                className={`py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-[#1E222A] text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="true_athlete"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Display Name</label>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Abhay Sharma"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Biometrics & Tracking Setup Section */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-[#EAB308] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Activity className="w-4 h-4" /> Health & Biometrics Setup
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Age (Years)</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Height (cm)</label>
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Weight</label>
                        <input
                          type="number"
                          value={targetWeightKg}
                          onChange={(e) => setTargetWeightKg(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Fitness Goal</label>
                      <select
                        value={fitnessGoal}
                        onChange={(e) => setFitnessGoal(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
                      >
                        <option value="Athletic Performance">Athletic Performance</option>
                        <option value="Hypertrophy & Strength">Hypertrophy & Strength</option>
                        <option value="Endurance & TUT Staking">Endurance & TUT Staking</option>
                        <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Daily Hydration Target</label>
                        <input
                          type="number"
                          step="0.1"
                          value={dailyWaterTargetL}
                          onChange={(e) => setDailyWaterTargetL(e.target.value)}
                          placeholder="3.0 Liters"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Daily TUT Goal</label>
                        <input
                          type="number"
                          value={dailyTutTargetMins}
                          onChange={(e) => setDailyTutTargetMins(e.target.value)}
                          placeholder="60 Mins"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@truerep.com"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-charcoal font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account & Health Profile'}</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
