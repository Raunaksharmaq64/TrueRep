import React from 'react';
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

  return (
    <div className="w-full bg-[#F4F1EA] text-[#18181B] flex flex-col items-center select-none overflow-x-hidden">

      {/* ========================================================================= */}
      {/* SECTION 1: TOP HERO HEADER (Matching Be.run Reference Layout) */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[calc(100vh-80px)] px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden pb-8 pt-4 font-premis">
        {/* LEFT COLUMN: Main Brand Message */}
        <div className="w-full lg:w-1/3 z-20 flex flex-col justify-center items-start text-left py-6 lg:py-4">

          {/* Top Slogan */}
          <div className="space-y-1 mb-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-500 tracking-wider uppercase font-premis">
              CONSISTENCY TODAY <br />
              A STRONGER YOU TOMORROW
            </h2>
          </div>

          {/* Main Headline: TRUEREP */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.92] select-none my-4 font-black text-[#18181B] font-premis">
            <span>TRUE</span><span className="text-[#64748B] font-light">REP</span>
          </h1>

          {/* Yellow Dot Separator */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#EAB308] my-4" />

          {/* Sub Slogan */}
          <div className="space-y-1 my-4">
            <h3 className="text-base sm:text-lg font-bold text-[#18181B] uppercase tracking-wide font-premis">
              MORE THAN A WORKOUT. <br />
              A BETTER YOU.
            </h3>
          </div>

          {/* Core Values Tagline */}
          <div className="text-[#64748B] text-xs sm:text-sm font-semibold tracking-wider uppercase my-4 flex items-center gap-2 font-premis">
            <span>TRAIN</span> <span className="text-slate-300">•</span>
            <span>TRACK</span> <span className="text-slate-300">•</span>
            <span>COMPETE</span> <span className="text-slate-300">•</span>
            <span>CONQUER</span>
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3.5 mt-4">
            <a href="#instagram" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#18181B] hover:bg-[#1E222A] hover:text-white transition-all shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#youtube" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#18181B] hover:bg-[#1E222A] hover:text-white transition-all shadow-sm">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#twitter" aria-label="X Twitter" className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#18181B] hover:bg-[#1E222A] hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* CENTER COLUMN: Athlete Image */}
        <div className="w-full lg:w-1/3 z-10 flex items-end justify-center relative self-end h-full min-h-[480px] lg:min-h-[calc(100vh-90px)] my-0">
          <img
            src={athleteImg}
            alt="TRUE REP Athlete"
            className="w-auto h-[78vh] sm:h-[84vh] lg:h-[90vh] max-w-none object-contain object-bottom select-none pointer-events-none drop-shadow-md"
          />
        </div>

        {/* RIGHT COLUMN: Floating Cards & Habit Features (Matching Reference Screenshot) */}
        <div className="w-full lg:w-1/3 z-20 flex flex-col justify-between items-start lg:items-end text-left lg:text-left pl-0 lg:pl-10 space-y-6 py-4">
          <div className="flex flex-col space-y-3.5 w-full max-w-sm">
            <div onClick={() => onNavigate && onNavigate('aicoach')} className="flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm group cursor-pointer hover:border-slate-400 transition-all">
              <div className="w-11 h-11 rounded-full bg-[#1E222A] flex items-center justify-center text-white flex-shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[#18181B] font-extrabold tracking-tight text-sm uppercase">TRACK</h3>
                <p className="text-[#64748B] text-xs font-medium">AI tracks your workout sessions & posture</p>
              </div>
            </div>

            <div onClick={() => onNavigate && onNavigate('aicoach')} className="flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm group cursor-pointer hover:border-slate-400 transition-all">
              <div className="w-11 h-11 rounded-full bg-[#1E222A] flex items-center justify-center text-white flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[#18181B] font-extrabold tracking-tight text-sm uppercase">IMPROVE</h3>
                <p className="text-[#64748B] text-xs font-medium">Real-time biomechanical guidance</p>
              </div>
            </div>

            <div onClick={() => onNavigate && onNavigate('duels')} className="flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm group cursor-pointer hover:border-slate-400 transition-all">
              <div className="w-11 h-11 rounded-full bg-[#1E222A] flex items-center justify-center text-white flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[#18181B] font-extrabold tracking-tight text-sm uppercase">BELONG</h3>
                <p className="text-[#64748B] text-xs font-medium">Join a community that keeps you going</p>
              </div>
            </div>
          </div>

          {/* Dark Charcoal Accent Card (Matching Reference Screenshot) */}
          <div className="bg-[#1E222A] text-white p-5 rounded-3xl w-full max-w-sm flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[#EAB308] font-bold tracking-wider text-xs uppercase">DISCIPLINE</div>
              <div className="text-white font-extrabold tracking-tight text-base uppercase">IN YOUR POCKET</div>
              <div className="w-16 h-[2.5px] bg-[#EAB308] mt-1.5 rounded-full" />
            </div>

            <button
              onClick={() => onNavigate && onNavigate('aicoach')}
              aria-label="Start workout"
              className="w-11 h-11 rounded-full bg-white text-[#18181B] flex items-center justify-center hover:bg-[#EAB308] transition-all group"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MIDDLE CURVED CONTRAST CONTAINER (Concept & Feature Grid) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-4 sm:px-8 my-12">
        <div className="w-full bg-white border border-[#E2E8F0] text-[#18181B] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-sm">

          <div className="text-center text-xs font-bold tracking-widest text-[#64748B] uppercase mb-6">
            Platform Concept & Biomechanics
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-[#18181B]">
              <span className="inline-block w-3 h-3 rounded-full bg-[#EAB308] mr-3 align-middle"></span>
              TRUE REP — WASM Pose Referee <span className="text-[#64748B] font-light">& intelligent workout assistant</span>
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
              Every rep is a mathematically verified posture event calculated strictly on-device through joint angles and artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-14 max-w-6xl mx-auto">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-sm border border-[#E2E8F0] bg-[#1E222A] group">
                <img
                  src={athleteImg}
                  alt="TRUE REP Athlete"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E222A] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                  <div className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase">WASM REF ENGINE</div>
                  <div className="text-lg font-bold">Edge Computer Vision</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E2E8F0] space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#1E222A] flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Trustless AI Referee</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  On-device camera analysis with zero cloud video uploads. Calculates joint flexion ($\theta \le 90^\circ$).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E2E8F0] space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#1E222A] flex items-center justify-center text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Ranked 1v1 Arena</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Matches athletes in 60-second strength showdowns using sub-200ms Elo matchmaking queues.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E2E8F0] space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#1E222A] flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Biometric Sensor Sync</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Integrates ANT+ & BLE sensors for live heart rate, HRV, and dynamic wattage telemetry.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E2E8F0] space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#1E222A] flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Territory Faction Conquest</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Aggregates rep victories to capture real-world campus and municipal map zones.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: HOW WE DO THE SCANNING & KINEMATIC FORMULA */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#64748B] text-xs font-bold tracking-widest uppercase mb-2">
              <Cpu className="w-4 h-4 text-[#1E222A]" />
              EDGE POSE-VISION PIPELINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#18181B] uppercase">
              How We Scan & <span className="text-[#64748B] font-light">Validate Form</span>
            </h2>
          </div>
          <p className="text-[#64748B] text-xs max-w-sm font-medium">
            Zero cloud video upload. 33 spatial keypoint tracking running on-device at 30 FPS.
          </p>
        </div>

        {/* Interactive Scanner Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm">

          {/* Left Dark Charcoal HUD Viewport */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] bg-[#1E222A] rounded-2xl flex items-center justify-center overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Skeleton Overlay */}
            <svg className="w-64 h-64 text-[#EAB308] relative z-10" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="40" r="12" stroke="#EAB308" strokeWidth="2.5" fill="#1E222A" />
              <circle cx="100" cy="40" r="4" fill="#ffffff" />
              <line x1="100" y1="52" x2="100" y2="120" stroke="#EAB308" strokeWidth="2.5" />
              <line x1="55" y1="70" x2="145" y2="70" stroke="#EAB308" strokeWidth="2.5" />
              <polyline points="55,70 30,95 65,115" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              <polyline points="145,70 170,95 135,115" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="70" y1="120" x2="130" y2="120" stroke="#EAB308" strokeWidth="2.5" />
              <line x1="100" y1="120" x2="100" y2="185" stroke="#EAB308" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <polyline points="70,120 65,155 60,190" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              <polyline points="130,120 135,155 140,190" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              {[
                [55, 70], [145, 70], [30, 95], [170, 95],
                [65, 115], [135, 115], [70, 120], [130, 120],
                [65, 155], [135, 155], [60, 190], [140, 190]
              ].map(([cx, cy], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="1.5" />
                </g>
              ))}
            </svg>

            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-white">
              ● 33 LANDMARKS ACTIVE
            </div>

            <div className="absolute bottom-4 right-4 bg-[#EAB308] text-[#18181B] px-3 py-1 rounded-full text-[10px] font-bold">
              0.4ms WASM INFERENCE
            </div>
          </div>

          {/* Right Kinematic Explanation Steps */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#18181B]">Biomechanical Kinematic Angle Math</h3>
              <p className="text-[#64748B] text-xs leading-relaxed font-medium">
                Rather than counting reps based on shaky motion sensors or self-reported buttons, TrueRep continuously computes 3D joint angles in real-time:
              </p>
              <div className="bg-[#1E222A] text-white p-3.5 rounded-2xl font-mono text-xs overflow-x-auto">
                θ = |atan2(y₃-y₂, x₃-x₂) - atan2(y₁-y₂, x₁-x₂)| × (180/π)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
                <div className="text-[#18181B] font-bold">1. Lockout State (UP)</div>
                <p className="text-[#64748B] text-[11px]">Requires full extension ($\theta \ge 160^\circ$) before commencing rep movement.</p>
              </div>

              <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
                <div className="text-[#18181B] font-bold">2. Biometric Depth (DOWN)</div>
                <p className="text-[#64748B] text-[11px]">Validates complete flexion ($\theta \le 90^\circ$) before granting valid rep ACK.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: COMPARISON MATRIX */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-[#E2E8F0]">
        <div>
          <div className="text-[#64748B] text-xs font-bold tracking-widest uppercase mb-2">
            WHY TRUEREP IS BETTER
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#18181B] uppercase">
            Traditional Fitness Apps <span className="text-[#64748B] font-light">vs TrueRep</span>
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card: Traditional Apps */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18181B]">Traditional Workout Apps</h3>
                <span className="text-[11px] text-slate-400 font-medium">Honor System & High Costs</span>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-[#64748B]">
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
                <span><strong>Static Logging:</strong> Tedious manual entry causing high user drop-off.</span>
              </li>
            </ul>
          </div>

          {/* Card: TrueRep Esport (Dark Charcoal Bento Card) */}
          <div className="bg-[#1E222A] text-white rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#EAB308]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">TrueRep Competitive AI</h3>
                <span className="text-[11px] text-[#EAB308] font-semibold">100% Trustless & WASM Native</span>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308] flex-shrink-0 mt-0.5" />
                <span><strong>Trustless AI Referee:</strong> Reps only count when biometric depth thresholds ($\theta \le 90^\circ$) are achieved.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308] flex-shrink-0 mt-0.5" />
                <span><strong>100% On-Device Privacy:</strong> Processes MediaPipe pose estimations strictly in browser WebAssembly.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#EAB308] flex-shrink-0 mt-0.5" />
                <span><strong>Geospatial Conquest:</strong> Converts resistance reps into real-world map territory capture.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: BOTTOM STATS BENTO GRID */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-6 lg:px-12 py-16 text-left space-y-10 border-t border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#64748B] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span>
              PERFORMANCE METRICS
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#18181B] uppercase">
              Stats Defining <br />
              <span className="text-[#64748B] font-light">The TrueRep Standard</span>
            </h2>
          </div>
          <div className="text-[#64748B] text-xs font-medium">Verified benchmarks</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="relative w-full h-32 flex items-end justify-between px-2 pt-4">
              <svg className="absolute inset-0 w-full h-full text-[#1E222A]" viewBox="0 0 200 100" fill="none">
                <path d="M 10 80 Q 60 70 100 40 T 190 15" stroke="#1E222A" strokeWidth="3" fill="none" />
                <circle cx="100" cy="40" r="5" fill="#EAB308" />
              </svg>
              <span className="text-[10px] font-mono text-slate-400 z-10">S1</span>
              <span className="text-[10px] font-mono text-slate-400 z-10">S2</span>
              <span className="text-[10px] font-mono text-slate-400 z-10">S3</span>
              <span className="text-[10px] font-mono text-slate-400 z-10">S4</span>
            </div>

            <div>
              <div className="text-xs text-[#64748B] font-semibold uppercase">Total Verified Reps</div>
              <div className="text-4xl font-bold text-[#18181B] mt-1">180K+</div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-2 pt-2">
              <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-2.5 rounded-2xl text-xs flex justify-between items-center text-[#18181B] font-semibold">
                <span>Tier I • Challenger</span>
                <span className="text-[#1E222A] font-bold">1,800+ ELO</span>
              </div>
              <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-2.5 rounded-2xl text-xs flex justify-between items-center text-[#18181B] font-semibold">
                <span>Tier II • Master</span>
                <span className="text-[#1E222A] font-bold">2,200+ ELO</span>
              </div>
              <div className="bg-[#1E222A] text-white p-2.5 rounded-2xl text-xs flex justify-between items-center font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Tier III • Elite</span>
                <span className="text-[#EAB308]">2,500+ ELO</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#64748B] font-semibold uppercase">Rating System</div>
              <div className="text-4xl font-bold text-[#18181B] mt-1">3 Tiers</div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[#64748B] font-semibold uppercase">Total Competitors</div>
                <div className="text-4xl font-bold text-[#18181B] mt-1">500+</div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] font-semibold uppercase">Active Faction Zones</div>
                <div className="text-4xl font-bold text-[#18181B] mt-1">200+</div>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('aicoach')}
              className="w-full py-3 rounded-full bg-[#1E222A] hover:bg-black text-white text-xs font-semibold transition-all text-center shadow-sm"
            >
              Start AI Workout →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

