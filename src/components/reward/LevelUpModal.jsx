import React, { useEffect } from 'react';
import { Award, Zap, Sparkles, ChevronRight, X, Flame, ShieldCheck, Trophy } from 'lucide-react';
import { audioAlerts } from '../../utils';

export default function LevelUpModal({ rewardData, onClose }) {
  useEffect(() => {
    if (rewardData) {
      try {
        audioAlerts.playLevelUpFanfare();
      } catch {}
    }
  }, [rewardData]);

  if (!rewardData) return null;

  const {
    type = 'LEVEL_UP', // 'LEVEL_UP' | 'RANK_UP' | 'WORKOUT_COMPLETE'
    newLevel,
    newTier,
    xpEarned,
    tokensEarned,
    deltaMMR,
    newMMR
  } = rewardData;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#1E222A] text-white border border-amber-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden text-center my-auto">
        {/* Ambient Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {type === 'RANK_UP' ? (
          /* RANK UP CELEBRATION */
          <div className="space-y-4 py-2 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border-2 border-purple-400 mx-auto flex items-center justify-center text-purple-400 shadow-xl animate-bounce">
              <Flame className="w-10 h-10 fill-current" />
            </div>

            <div>
              <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">RANK PROMOTION!</div>
              <h2 className="text-3xl font-black font-heading text-white tracking-tight mt-1">{newTier || 'GOLD I'}</h2>
              <p className="text-xs text-slate-300 mt-1">You advanced to a higher competitive tier ladder bracket!</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-400 uppercase">MMR GAINED</div>
                <div className="text-lg font-bold font-mono text-purple-300">+{deltaMMR || 25} MMR</div>
              </div>
              <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-400 uppercase">NEW RATING</div>
                <div className="text-lg font-bold font-mono text-white">{newMMR || 1150}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Claim Rank Promotion</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* LEVEL UP / WORKOUT REWARD CELEBRATION */
          <div className="space-y-4 py-2 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 shadow-xl animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                {type === 'LEVEL_UP' ? 'LEVEL UNLOCKED!' : 'WORKOUT REWARD!'}
              </div>
              <h2 className="text-3xl font-black font-heading text-white tracking-tight mt-1">
                {type === 'LEVEL_UP' ? `LEVEL ${newLevel || 2}` : `+${xpEarned || 120} XP EARNED`}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {type === 'LEVEL_UP'
                  ? 'Congratulations! Your kinematic form and endurance unlocked a new level.'
                  : 'Great session! XP converted directly to level progress & Rep Tokens.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-400 uppercase">XP GAINED</div>
                <div className="text-lg font-bold font-mono text-amber-400">+{xpEarned || 120} XP</div>
              </div>
              <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-2xl">
                <div className="text-[10px] font-mono text-slate-400 uppercase">TOKENS STAKED</div>
                <div className="text-lg font-bold font-mono text-emerald-400">+{tokensEarned || 12} RT</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-charcoal font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Continue Training</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
