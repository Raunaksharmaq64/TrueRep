import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Activity, 
  RotateCcw, 
  X, 
  Zap, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  TrendingDown,
  FileCheck
} from 'lucide-react';
import CertificateGenerator from './CertificateGenerator';

export default function WorkoutAnalyticsModal({
  isOpen,
  onClose,
  onRestart,
  exercise = 'pushup',
  repHistory = [],
  totalReps = 0,
  durationSeconds = 0,
  maxStreak = 0,
  athleteName = 'ATHLETE_ONE'
}) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'certificate'

  if (!isOpen) return null;

  // Calculate stats from repHistory
  const validReps = repHistory.filter((r) => r.valid).length;
  const faultReps = repHistory.length - validReps;
  const accuracy = repHistory.length > 0 
    ? Math.round((validReps / repHistory.length) * 100) 
    : 100;

  // Rep TUT durations (seconds)
  const durations = repHistory.map((r) => Math.min(4.0, Math.max(0.4, r.duration || 1.2)));
  const avgTUT = durations.length > 0 
    ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
    : '1.15';

  // Calories estimation based on MET
  const caloriesBurned = Math.max(5, Math.round((totalReps * 0.42) + (durationSeconds * 0.08)));

  // Determine Rank Tier
  let rankTier = 'CADET';
  let rankBadgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
  if (totalReps >= 40 && accuracy >= 95) {
    rankTier = 'OLYMPIAN LEGEND';
    rankBadgeColor = 'text-amber-300 border-amber-500/50 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
  } else if (totalReps >= 20 && accuracy >= 90) {
    rankTier = 'COMBAT READY';
    rankBadgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  } else if (totalReps >= 10) {
    rankTier = 'WARRIOR';
    rankBadgeColor = 'text-blue-400 border-blue-500/40 bg-blue-950/40';
  }

  // SVG Fatigue Curve Points
  const svgWidth = 540;
  const svgHeight = 160;
  const padding = 30;

  const maxVal = Math.max(...durations, 2.5);
  const minVal = Math.min(...durations, 0.5);

  const points = durations.map((dur, i) => {
    const x = padding + (i / Math.max(1, durations.length - 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - ((dur - minVal) / Math.max(0.1, maxVal - minVal)) * (svgHeight - 2 * padding);
    return { x, y, dur, rep: i + 1, valid: repHistory[i]?.valid ?? true };
  });

  const pathData = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 bg-[#02050c]/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#060b18] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#040813] to-[#0a1226]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0070F3] to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,112,243,0.4)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  SESSION COMPLETE
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rankBadgeColor}`}>
                  {rankTier}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide font-hero-slant">
                POST-WORKOUT DEEP ANALYTICS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-[#040711] px-6 pt-3">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Kinematics & Fatigue Curve</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'certificate'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Proof-of-Workout Certificate</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'analytics' ? (
            <>
              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <div className="bg-[#081024] border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VERIFIED REPS</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {totalReps} <span className="text-xs text-emerald-400 font-bold font-sans">Clean</span>
                  </div>
                </div>

                <div className="bg-[#081024] border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FORM ACCURACY</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                    {accuracy}%
                  </div>
                </div>

                <div className="bg-[#081024] border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AVG TUT PACE</div>
                  <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                    {avgTUT}s
                  </div>
                </div>

                <div className="bg-[#081024] border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CALORIES EST.</div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                    {caloriesBurned} kcal
                  </div>
                </div>

              </div>

              {/* Fatigue Curve Visualizer */}
              <div className="bg-[#040711] border border-slate-800/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Fatigue & Rep-Velocity Curve (TUT)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Fast (Optimal)
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Fatigue Onset
                    </span>
                  </div>
                </div>

                {durations.length > 1 ? (
                  <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40">
                      {/* Grid lines */}
                      <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#1e293b" strokeDasharray="4" />
                      <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#1e293b" strokeDasharray="4" />
                      <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" />

                      {/* Area Fill */}
                      <path
                        d={`${pathData} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`}
                        fill="rgba(0, 210, 255, 0.08)"
                      />

                      {/* Line */}
                      <path d={pathData} fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Points */}
                      {points.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={p.dur > 2.0 ? 5 : 4}
                          fill={p.valid ? (p.dur > 2.0 ? '#f59e0b' : '#10b981') : '#ef4444'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        >
                          <title>{`Rep #${p.rep}: ${p.dur.toFixed(2)}s`}</title>
                        </circle>
                      ))}
                    </svg>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
                    Complete multiple reps to plot real-time fatigue velocity curve
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-mono text-center mt-1">
                  Rep Index (X) vs Time-Under-Tension (Y) • Steeper curves indicate muscle failure onset
                </div>
              </div>

              {/* Form Categorization Breakdown */}
              <div className="bg-[#081024] border border-slate-800/80 rounded-2xl p-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Autonomous Referee Form Audit
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${accuracy}%` }}
                    title={`Clean: ${accuracy}%`}
                  />
                  <div 
                    className="bg-rose-500 transition-all duration-500" 
                    style={{ width: `${100 - accuracy}%` }}
                    title={`Faults: ${100 - accuracy}%`}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono mt-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clean Verified Reps: {validReps}</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Disqualified / Faults: {faultReps}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CertificateGenerator
              athleteName={athleteName}
              exercise={exercise}
              reps={totalReps}
              accuracy={accuracy}
              duration={durationSeconds}
              maxStreak={maxStreak}
            />
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#040711] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-800"
          >
            Close Dashboard
          </button>

          <button
            onClick={() => {
              onClose();
              if (onRestart) onRestart();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0070F3] to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Challenge</span>
          </button>
        </div>

      </div>
    </div>
  );
}
