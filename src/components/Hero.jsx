import React, { useState } from 'react';
import { 
  Dumbbell, 
  TrendingUp, 
  Users, 
  Instagram, 
  Youtube, 
  Play, 
  ShieldCheck, 
  Trophy, 
  MapPin, 
  ArrowRight,
  Zap,
  Cpu,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Sparkles
} from 'lucide-react';
import athleteImg from '../assets/athlete.jpg';

export default function Hero({ onNavigate }) {
  const [activeScanPose, setActiveScanPose] = useState('pushup');

  return (
    <div className="w-full bg-[#03060d] text-white flex flex-col items-center select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* SECTION 1: TOP HERO HEADER (Dark Theme with Floating Glass Card) */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[calc(100vh-80px)] px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden pb-0 pt-4">
        {/* LEFT COLUMN: Main Brand Message */}
        <div className="w-full lg:w-1/3 z-20 flex flex-col justify-center items-start text-left py-6 lg:py-4">
          {/* Top Tagline */}
          <div className="text-slate-300 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase leading-relaxed mb-4">
            <p>CONSISTENCY TODAY</p>
            <p>A STRONGER YOU TOMORROW</p>
          </div>

          {/* Main Headline Upright Slim */}
          <h1 className="font-hero-slant text-7xl sm:text-8xl lg:text-9xl tracking-wider leading-[0.9] select-none my-2 font-medium">
            <span className="block text-white">
              TRUE
            </span>
            <span className="block text-[#007DFF]">
              REP
            </span>
          </h1>

          {/* Secondary Subtitle */}
          <div className="text-white text-base sm:text-lg font-medium tracking-widest leading-snug mt-6 mb-4 uppercase">
            <p>MORE THAN A WORKOUT.</p>
            <p>A BETTER YOU.</p>
          </div>

          {/* Cyan Horizontal Accent Bar */}
          <div className="w-20 h-[3.5px] bg-cyan-400 rounded-full my-4" />

          {/* Core Values Tagline */}
          <div className="text-slate-300 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase my-3">
            TRAIN <span className="mx-1 text-slate-500">|</span> TRACK <span className="mx-1 text-slate-500">|</span> COMPETE <span className="mx-1 text-slate-500">|</span> CONQUER
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center gap-5 mt-6">
            <a href="#instagram" aria-label="Instagram" className="text-slate-300 hover:text-cyan-400 transition-all hover:scale-110">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#youtube" aria-label="YouTube" className="text-slate-300 hover:text-cyan-400 transition-all hover:scale-110">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#twitter" aria-label="X Twitter" className="text-slate-300 hover:text-cyan-400 transition-all hover:scale-110">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* CENTER COLUMN: Athlete Image */}
        <div className="w-full lg:w-1/3 z-10 flex items-end justify-center relative self-end h-full min-h-[500px] lg:min-h-[calc(100vh-90px)] my-0">
          <img
            src={athleteImg}
            alt="TrueRep Athlete Lifting Barbell"
            className="w-auto h-[82vh] sm:h-[88vh] lg:h-[94vh] max-w-none object-contain object-bottom select-none pointer-events-none"
          />
        </div>

        {/* RIGHT COLUMN: Floating Glass Card & Nav Features */}
        <div className="w-full lg:w-1/3 z-20 flex flex-col justify-between items-start lg:items-end text-left lg:text-left pl-0 lg:pl-10 space-y-12 py-4">
          <div className="flex flex-col space-y-8 w-full max-w-sm">
            <div onClick={() => onNavigate && onNavigate('aicoach')} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all flex-shrink-0">
                <Dumbbell className="w-5 h-5 transform -rotate-45" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wider text-base uppercase">TRACK</h3>
                <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">Ai tracks your workout sessions</p>
              </div>
            </div>

            <div onClick={() => onNavigate && onNavigate('duels')} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wider text-base uppercase">IMPROVE</h3>
                <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">Get personalized plans and insights</p>
              </div>
            </div>

            <div onClick={() => onNavigate && onNavigate('profile')} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wider text-base uppercase">BELONG</h3>
                <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">Join a community that keeps you going</p>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphic Discipline Card */}
          <div className="bg-[#091122]/80 border border-slate-800 backdrop-blur-md p-5 rounded-2xl w-full max-w-sm flex items-center justify-between">
            <div>
              <div className="text-[#0070F3] font-bold tracking-[0.18em] text-xs uppercase">DISCIPLINE</div>
              <div className="text-white font-bold tracking-[0.18em] text-sm uppercase">IN YOUR POCKET</div>
              <div className="w-20 h-[2px] bg-cyan-400 mt-1" />
            </div>

            <button 
              onClick={() => onNavigate && onNavigate('aicoach')}
              aria-label="Play video"
              className="w-11 h-11 rounded-full border border-white/80 flex items-center justify-center text-white hover:border-cyan-400 hover:text-cyan-400 transition-all group"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MIDDLE CURVED CONTRAST CONTAINER (Concept & Feature Grid) */}
      {/* ========================================================================= */}
      <section className="w-full px-4 sm:px-8 my-12">
        <div className="w-full bg-[#f8fafc] text-slate-900 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          
          <div className="text-center text-xs font-bold tracking-[0.25em] text-slate-500 uppercase mb-6">
            Platform Concept & Biomechanics
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15] text-slate-900 font-hero-slant">
              <span className="inline-block w-3 h-3 rounded-full bg-[#0070F3] mr-3 align-middle"></span>
              TrueRep - is a competitive fitness esport that combines the <span className="text-slate-400 font-normal">aesthetics of futuristic AI vision</span> with real-time bodyweight showdowns
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-6 leading-relaxed">
              Every rep is a mathematically verified digital artifact calculated on-device through joint angles and artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-14 max-w-6xl mx-auto">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-[#0f172a] group">
                <img 
                  src={athleteImg} 
                  alt="TrueRep AI Athlete" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                  <div className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">WASM REF ENGINE</div>
                  <div className="text-lg font-bold">Edge Computer Vision</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Trustless AI Referee</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  On-device camera analysis with zero cloud video uploads. Calculates joint flexion ($\theta \le 90^\circ$).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Ranked 1v1 Arena</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Matches athletes in 60-second strength showdowns using sub-200ms Elo matchmaking queues.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Biometric Sensor Sync</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Integrates ANT+ & BLE sensors for live heart rate, HRV, and dynamic wattage telemetry.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Territory Faction Conquest</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Aggregates rep victories to capture real-world campus and municipal map zones.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: HOW WE DO THE SCANNING & KINEMATIC FORMULA (ANIMATED HUD) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              EDGE POSE-VISION PIPELINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-hero-slant font-medium tracking-tight text-white uppercase">
              HOW WE SCAN & <span className="text-[#007DFF]">VALIDATE FORM</span>
            </h2>
          </div>
          <p className="text-slate-400 text-xs max-w-sm">
            Zero cloud video upload. 33 spatial keypoint tracking running on-device at 30 FPS.
          </p>
        </div>

        {/* Interactive Animated Scanner Visualizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#070b16] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
          
          {/* Left Animated HUD Viewport */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] bg-[#040711] rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Animated Cyan Laser Scan Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-scan-laser z-20 pointer-events-none" />

            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a25_1px,transparent_1px),linear-gradient(to_bottom,#0f172a25_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Skeleton Overlay */}
            <svg className="w-64 h-64 text-cyan-400 relative z-10" viewBox="0 0 200 200" fill="none">
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
                <g key={i}>
                  <circle cx={cx} cy={cy} r="6" fill="none" stroke="#00d2ff" strokeWidth="1" className="animate-ping opacity-75" />
                  <circle cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
                </g>
              ))}
            </svg>

            <div className="absolute top-4 left-4 bg-[#081326] border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400">
              ● 33 LANDMARKS ACTIVE
            </div>

            <div className="absolute bottom-4 right-4 bg-[#081326] border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400">
              0.4ms WASM INFERENCE
            </div>
          </div>

          {/* Right Kinematic Explanation Steps */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Biomechanical Kinematic Angle Math</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Rather than counting reps based on shaky motion sensors or self-reported buttons, TrueRep continuously computes 3D joint angles in real-time:
              </p>
              <div className="bg-[#03060d] border border-slate-800 p-3.5 rounded-xl font-mono text-cyan-300 text-xs overflow-x-auto">
                θ = |atan2(y₃-y₂, x₃-x₂) - atan2(y₁-y₂, x₁-x₂)| × (180/π)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#040711] border border-slate-800/80 p-4 rounded-xl space-y-1">
                <div className="text-cyan-400 font-bold">1. Lockout State (UP)</div>
                <p className="text-slate-400 text-[11px]">Requires full extension ($\theta \ge 160^\circ$) before commencing rep movement.</p>
              </div>

              <div className="bg-[#040711] border border-slate-800/80 p-4 rounded-xl space-y-1">
                <div className="text-[#0070F3] font-bold">2. Biometric Depth (DOWN)</div>
                <p className="text-slate-400 text-[11px]">Validates complete flexion ($\theta \le 90^\circ$) before granting valid rep ACK.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: WHY TRUEREP IS BETTER THAN NORMAL SITES (COMPARISON MATRIX) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-slate-900">
        <div>
          <div className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">
            WHY TRUEREP IS BETTER
          </div>
          <h2 className="text-3xl sm:text-5xl font-hero-slant font-medium tracking-tight text-white uppercase">
            TRADITIONAL FITNESS APPS <span className="text-[#007DFF]">VS TRUEREP</span>
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Traditional Apps (Negative Features) */}
          <div className="bg-[#070b16] border border-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-6 text-left opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Traditional Workout Apps</h3>
                <span className="text-[10px] text-slate-500 font-mono">Honor System & High Costs</span>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-400">
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span><strong>Honor System Reps:</strong> Easy to cheat by tapping buttons without performing exercises.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span><strong>Invasive Cloud Streams:</strong> Uploads private camera streams to expensive server GPUs.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span><strong>Static Logging & Abandonment:</strong> Tedious manual entry causing 80% user drop-off.</span>
              </li>
            </ul>
          </div>

          {/* Card: TrueRep Esport (Superior Features) */}
          <div className="bg-[#081226] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">TrueRep Competitive Esport</h3>
                <span className="text-[10px] text-cyan-400 font-mono">100% Trustless & WASM Native</span>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Trustless AI Referee:</strong> Reps only count when biometric depth thresholds ($\theta \le 90^\circ$) are achieved.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>100% On-Device Privacy:</strong> Processes MediaPipe pose estimations strictly in browser WebAssembly.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Geospatial Turf Wars:</strong> Converts resistance reps into real-world map territory capture for your faction.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: BOTTOM DARK STATS & ANALYTICS GRID */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0070F3]"></span>
              PERFORMANCE METRICS
            </div>
            <h2 className="text-3xl sm:text-5xl font-hero-slant font-medium tracking-tight text-white uppercase">
              STATS DEFINING <br />
              <span className="text-[#0070F3]">THE TRUE REP ESPORT</span>
            </h2>
          </div>
          <div className="text-slate-400 text-xs font-mono">Our successes & benchmarks</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b16] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="relative w-full h-32 flex items-end justify-between px-2 pt-4">
              <svg className="absolute inset-0 w-full h-full text-[#0070F3]" viewBox="0 0 200 100" fill="none">
                <path d="M 10 80 Q 60 70 100 40 T 190 15" stroke="#0070F3" strokeWidth="3" fill="none" />
                <circle cx="100" cy="40" r="5" fill="#00d2ff" />
              </svg>
              <span className="text-[10px] font-mono text-slate-500 z-10">S1</span>
              <span className="text-[10px] font-mono text-slate-500 z-10">S2</span>
              <span className="text-[10px] font-mono text-slate-500 z-10">S3</span>
              <span className="text-[10px] font-mono text-slate-500 z-10">S4</span>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Verified Reps</div>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">180K+</div>
            </div>
          </div>

          <div className="bg-[#070b16] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2 pt-2">
              <div className="bg-[#0d172a] border border-slate-800 p-2.5 rounded-xl text-xs flex justify-between items-center text-slate-300">
                <span>Tier I • Challenger</span>
                <span className="text-cyan-400 font-mono font-bold">1,800+ ELO</span>
              </div>
              <div className="bg-[#0d172a] border border-slate-800 p-2.5 rounded-xl text-xs flex justify-between items-center text-slate-300">
                <span>Tier II • Master</span>
                <span className="text-cyan-400 font-mono font-bold">2,200+ ELO</span>
              </div>
              <div className="bg-[#0f2342] border border-[#0070F3] p-2.5 rounded-xl text-xs flex justify-between items-center text-white font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Tier III • Cyber Elite</span>
                <span className="text-cyan-400 font-mono">2,500+ ELO</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Rating System</div>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">3 Tiers</div>
            </div>
          </div>

          <div className="bg-[#070b16] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Competitors</div>
                <div className="text-4xl font-extrabold text-white font-mono mt-1">500+</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-xs text-slate-400 font-semibold uppercase">Active Faction Zones</div>
                <div className="text-4xl font-extrabold text-cyan-400 font-mono mt-1">200+</div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate('aicoach')}
              className="w-full py-3 rounded-full bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-semibold transition-all text-center"
            >
              Join Esport Match →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
