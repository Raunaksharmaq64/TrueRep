import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Video, 
  Grid, 
  Sliders, 
  Volume2, 
  Heart, 
  Activity, 
  Zap, 
  Compass, 
  Check, 
  Play, 
  RotateCw
} from 'lucide-react';

export default function AICoachPage() {
  const [repCount, setRepCount] = useState(34);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#03060d] text-white px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-cyan-400 text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-0.5">
              SOLO COACH
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-wide text-white uppercase font-hero-slant">
              AI COACH
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0c101d] border border-slate-800/80 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session: <strong className="text-white font-medium">VO2 Max Interval Burn</strong></span>
            </div>
            <div className="bg-[#0c101d] border border-slate-800/80 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center gap-2">
              <span>AI Model: <strong className="text-cyan-400 font-medium">Atlas v5.1 Active</strong></span>
            </div>
          </div>
        </div>

        {/* 2. 14-DAY STREAK BANNER */}
        <div className="w-full bg-[#0c101d] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Streak info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0e1d33] border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Flame className="w-6 h-6 fill-current text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">14-Day Streak</h2>
                <span className="bg-[#0d223a] text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-cyan-500/30">
                  +15% XP MULTIPLIER
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Next Milestone: <span className="text-slate-300 font-medium">Day 15 Reward : Cyber-Titan Visor Skin</span>
              </p>
            </div>
          </div>

          {/* Right: Days of week checks */}
          <div className="flex items-center gap-2 sm:gap-3">
            {[
              { day: 'M', checked: true },
              { day: 'T', checked: true },
              { day: 'W', checked: true },
              { day: 'T', checked: true },
              { day: 'F', checked: true },
              { day: 'S', num: '14', active: true },
              { day: 'S', num: '15', upcoming: true },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">{item.day}</span>
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    item.checked 
                      ? 'bg-[#0070F3] text-white' 
                      : item.active 
                      ? 'bg-[#0070F3] text-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0c101d]' 
                      : 'border border-dashed border-slate-700 text-slate-500'
                  }`}
                >
                  {item.checked ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    item.num
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT GRID (8 Cols / 4 Cols EXACT MATCH HEIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT COLUMN (8 Cols) */}
          <div className="lg:col-span-8 h-full flex flex-col">
            
            {/* Main Tracker Container Card */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 relative h-full flex flex-col justify-between">
              <div>
                {/* Exercise Title Block */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="bg-[#0d223a] text-cyan-400 text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase border border-cyan-500/30">
                      EXERCISE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                      Barbell Clean & Jerk
                    </h2>
                  </div>

                  <div className="bg-[#050914] border border-slate-800 px-4 py-2 rounded-xl text-right">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      KINEMATIC SCORE
                    </div>
                    <div className="text-base font-bold text-cyan-400 font-mono">
                      96.8% Precision
                    </div>
                  </div>
                </div>

                {/* Skeleton Tracker Viewport + Rep Target Box Grid (Increased Height) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  {/* Skeleton Viewport (7 cols - Larger Height) */}
                  <div className="md:col-span-7 min-h-[410px] bg-[#040711] rounded-2xl border border-slate-800/80 relative flex items-center justify-center p-6 overflow-hidden">
                    {/* Top Left Video Icon */}
                    <button className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-[#0d1627] border border-slate-700/60 flex items-center justify-center text-cyan-400 hover:text-white transition-colors">
                      <Video className="w-4.5 h-4.5" />
                    </button>

                    {/* SVG Skeleton Wireframe (Larger Size) */}
                    <svg className="w-64 h-64 text-cyan-400" viewBox="0 0 200 200" fill="none">
                      <circle cx="100" cy="40" r="12" stroke="#38bdf8" strokeWidth="2.5" fill="#040711" />
                      <circle cx="100" cy="40" r="4" fill="#ffffff" />
                      <line x1="100" y1="52" x2="100" y2="120" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="55" y1="70" x2="145" y2="70" stroke="#38bdf8" strokeWidth="2.5" />
                      <polyline points="55,70 30,95 65,115" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <polyline points="145,70 170,95 135,115" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="70" y1="120" x2="130" y2="120" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="100" y1="120" x2="100" y2="185" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <polyline points="70,120 65,155 60,190" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <polyline points="130,120 135,155 140,190" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      {[
                        [55, 70], [145, 70], [30, 95], [170, 95], 
                        [65, 115], [135, 115], [70, 120], [130, 120],
                        [65, 155], [135, 155], [60, 190], [140, 190]
                      ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
                      ))}
                    </svg>

                    {/* Hip Tag Overlay Bottom Left */}
                    <div className="absolute bottom-4 left-4 bg-[#0d1627] border border-slate-700/60 px-3 py-1 rounded-lg text-xs font-semibold text-slate-300">
                      Hip
                    </div>

                    {/* Controls Bottom Right */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#0d1627] border border-slate-700/60 p-1.5 rounded-lg">
                      <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white">
                        <Grid className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white">
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Repetition Target Card (5 cols - Increased Padding & Height) */}
                  <div className="md:col-span-5 bg-[#050813] rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between space-y-6 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">REPETITION TARGET</span>
                      <span className="text-[#0070F3] font-bold text-xs">Set 3 of 4</span>
                    </div>

                    <div>
                      <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                        {repCount} <span className="text-2xl text-slate-500 font-normal">/ 45 REPS</span>
                      </div>
                    </div>

                    {/* Rep Status pill bar */}
                    <div className="flex items-center justify-between bg-[#0b1222] border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#0070F3]" />
                        <div className="text-xs font-bold text-white leading-tight">
                          REP STATUS:<br />
                          <span className="text-[#0070F3]">VALID (+1)</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setRepCount(r => r + 1)}
                        className="bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-extrabold px-4 py-2 rounded-md tracking-wider uppercase transition-all"
                      >
                        CONFIRMED
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0070F3] rounded-full" style={{ width: `${(repCount / 45) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Threshold: 30</span>
                        <span className="text-[#0070F3] font-semibold">3 Reps to Next Interval</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atlas AI Feedback Bar (Bottom) */}
              <div className="mt-6 bg-[#050813] border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0070F3] flex items-center justify-center text-white flex-shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0070F3] tracking-wide">
                      Atlas AI Feedback
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5 leading-snug">
                      "Atlas AI: Perfect hip drive on rep 32. Keep thoracic extension tight during transition."
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0a1224] border border-slate-800 px-4 py-2 rounded-xl flex-shrink-0">
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                    <span className="w-1 h-4 bg-cyan-400 rounded-full"></span>
                    <span className="w-1 h-2 bg-cyan-400 rounded-full"></span>
                    <span className="w-1 h-3 bg-cyan-400 rounded-full"></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    VOICE FEED 98%
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (4 Cols EXACT MATCH) */}
          <div className="lg:col-span-4 h-full flex flex-col justify-between space-y-6">

            {/* 1. Conditioning Rank Card */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                CONDITIONING RANK
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Level 48</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    3,480 / 4,000 XP to <br />
                    <span className="text-slate-300 font-semibold">Tier III</span>
                  </p>
                </div>

                <button className="bg-[#0070F3] text-white text-xs font-bold px-4 py-2 rounded-full">
                  +520 XP
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#0070F3] rounded-full" style={{ width: '87%' }} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="text-cyan-400">🛡</span> Daily Goal: 92% Met
                </span>
                <span className="font-semibold text-slate-300">Top 4% Global</span>
              </div>
            </div>

            {/* 2. Balanced Architecture Regimen Card */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Balanced Architecture</h3>
              </div>

              {/* Regimen Balance Split */}
              <div className="bg-[#040711] border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>REGIMEN BALANCE SPLIT</span>
                  <span className="text-cyan-400">100% Calibrated</span>
                </div>

                <div className="w-full h-2 flex gap-1 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0070F3]" style={{ width: '40%' }} />
                  <div className="h-full bg-cyan-400" style={{ width: '35%' }} />
                  <div className="h-full bg-indigo-500" style={{ width: '25%' }} />
                </div>

                <div className="grid grid-cols-3 text-[9px] text-slate-400 pt-1">
                  <div>
                    <strong className="text-cyan-400 block">40% Power</strong>
                    Core & Squats
                  </div>
                  <div>
                    <strong className="text-cyan-300 block">35% Cardio</strong>
                    Zone 5 Ergometer
                  </div>
                  <div>
                    <strong className="text-indigo-400 block">25% Mobility</strong>
                    Hip & Thoracic
                  </div>
                </div>
              </div>

              {/* Timeline Steps List */}
              <div className="space-y-3 pt-1">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">
                      1. Mobility Primer (25%)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Neural Priming & Hip / Spine Mobility • Complete
                    </p>
                  </div>
                </div>

                {/* Step 2 (Active) */}
                <div className="flex items-start gap-3 bg-[#0d172a] border border-[#0070F3]/50 p-3 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#0070F3] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-400">
                      2. Power Block (40%)
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Tempo Squats, Barbell Cleans & Push Press
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 opacity-75">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">3</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      3. Aerobic Burst (35%)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      4 x 400m VO2 Max Ergometer Surge • Up Next
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">4</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      4. Parasympathetic Cool-Down
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Box Breathing & Fascial Release Flow
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4. BOTTOM THREE CARDS (3 Equal 4-Col Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">

          {/* Bottom Card 1: Live Biometrics */}
          <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Heart className="w-4 h-4 fill-current text-cyan-400" />
              <span>Live Biometrics</span>
            </div>

            <div>
              <div className="text-4xl font-extrabold text-white font-mono">
                168 <span className="text-sm font-semibold text-slate-400">BPM</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Anaerobic Performance Threshold
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Heart Rate Variability</span>
                <span className="text-white font-mono font-semibold">72 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lactate Threshold</span>
                <span className="text-cyan-400 font-mono font-semibold">3.8 mmol/L</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Remaining Stamina</span>
                  <span className="text-white font-mono">64%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0070F3] rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card 2: Wattage Output */}
          <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Zap className="w-4 h-4 fill-current text-cyan-400" />
              <span>Wattage Output</span>
            </div>

            {/* Set Power Stats */}
            <div className="grid grid-cols-5 text-center text-xs font-mono pt-2">
              <div>
                <span className="text-slate-300 font-semibold block">380W</span>
                <span className="text-[9px] text-slate-500">S1</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">410W</span>
                <span className="text-[9px] text-slate-500">S2</span>
              </div>
              <div>
                <span className="text-cyan-400 font-bold block">425W</span>
                <span className="text-[9px] text-cyan-400 font-bold">S3</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">395W</span>
                <span className="text-[9px] text-slate-500">S4</span>
              </div>
              <div>
                <span className="text-slate-600 block">--</span>
                <span className="text-[9px] text-slate-600">S5</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex justify-between items-end text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mean Dynamic Work</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white font-mono block">402.5</span>
                <span className="text-[10px] text-slate-400">Joules/rep</span>
              </div>
            </div>
          </div>

          {/* Bottom Card 3: Form Deviation */}
          <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Activity className="w-4 h-4" />
                <span>Form Deviation</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Optimal Range</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Knee Angle</span>
                  <span className="text-cyan-400 font-mono font-bold">92°</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Spine Deflection</span>
                  <span className="text-cyan-400 font-mono font-bold">2°</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Hip Hinge Depth</span>
                  <span className="text-cyan-400 font-mono font-bold">104°</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0070F3] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
