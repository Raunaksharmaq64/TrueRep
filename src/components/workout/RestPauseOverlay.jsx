import React, { useEffect, useState } from 'react';
import { Timer, Wind, Play, Zap } from 'lucide-react';
import { audioAlerts } from '../../utils';

export default function RestPauseOverlay({
  isOpen,
  onDismiss,
  duration = 15,
  currentReps = 0
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      return;
    }

    setTimeLeft(duration);
    audioAlerts.playDepthDing();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          audioAlerts.playValidRepChime();
          onDismiss();
          return 0;
        }
        if (prev === 4 || prev === 3 || prev === 2) {
          audioAlerts.playDepthDing();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, duration, onDismiss]);

  if (!isOpen) return null;

  // Circular progress stroke calculation
  const progressPercent = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Dynamic breathing cue
  const breathingCue = timeLeft % 4 >= 2 ? 'Inhale Deeply (Nose)' : 'Exhale Smoothly (Mouth)';

  return (
    <div className="absolute inset-0 z-30 bg-[#02050c]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
      
      {/* Tactical Header */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,210,255,0.25)]">
        <Timer className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span>SMART REST-PAUSE DETECTED</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-hero-slant">
        TACTICAL RECOVERY WINDOW
      </h3>
      <p className="text-slate-400 text-xs mt-1 max-w-sm">
        Muscles disengaged at <span className="text-cyan-400 font-bold font-mono">{currentReps} Verified Reps</span>. Recover oxygen to sustain ATP output!
      </p>

      {/* Circular Countdown Ring */}
      <div className="relative w-36 h-36 my-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-cyan-400 transition-all duration-1000 ease-linear"
            fill="transparent"
          />
        </svg>

        {/* Center Timer Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono text-white tracking-tighter">
            {timeLeft}
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            SEC REST
          </span>
        </div>
      </div>

      {/* Breathing Cadence Indicator */}
      <div className="flex items-center gap-2 bg-[#050914] border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 mb-6 shadow-inner">
        <Wind className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-bold">{breathingCue}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDismiss}
          className="px-6 py-2.5 rounded-xl bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,112,243,0.4)] flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Resume Now</span>
        </button>
      </div>

      <div className="text-[10px] text-slate-500 font-mono mt-4 flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-emerald-400" />
        <span>Auto-resumes immediately when you get back into position</span>
      </div>
    </div>
  );
}
