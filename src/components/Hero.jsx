import React from 'react';
import {
  Dumbbell,
  TrendingUp,
  Users,
  Instagram,
  Youtube,
  ShieldCheck,
  Trophy,
  MapPin,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import heroBg from '../assets/hero_bg.png';
import iconTrack from '../assets/icon_track.png';
import iconImprove from '../assets/icon_improve.svg';
import iconBelong from '../assets/icon_belong.svg';
import heatmapGlow from '../assets/heatmap_glow.png';
import iconShield from '../assets/icon_shield.svg';
import iconPulse from '../assets/icon_pulse.svg';
import iconTrophy from '../assets/icon_trophy.svg';
import iconMapPin from '../assets/icon_mappin.svg';
import wasmEngine from '../assets/wasm_engine.png';
import poseScan from '../assets/pose_scan.png';
import iconTradApps from '../assets/icon_trad_apps.svg';
import iconTrueRepLogo from '../assets/icon_truerep_logo.png';
import sectionBg from '../assets/section_bg.png';
import heatGrad1 from '../assets/heat_grad_1.png';
import heatGrad2 from '../assets/heat_grad_2.png';
import heatGrad3 from '../assets/heat_grad_3.png';

export default function Hero({ onNavigate }) {
  return (
    <div className="w-full bg-[#050505] text-white flex flex-col items-center select-none overflow-x-hidden pt-4 pb-20">
      <div className="w-full max-w-[1408px] px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">

        {/* ========================================================================= */}
        {/* SECTION 1: HERO CONTAINER */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[1350px] mx-auto drop-shadow-[0_0_0px_#FF800080]">
          <section className="relative w-full max-w-[1350px] min-h-0 sm:min-h-[640px] lg:min-h-[780px] rounded-[32px] sm:rounded-[80px] lg:rounded-[160px] bg-[#0B0B0B] border border-white/10 p-5 sm:p-10 lg:p-20 overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex items-center">

            {/* Athlete Hero Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroBg}
                alt="Athlete Hero"
                className="w-full h-full object-cover object-center pointer-events-none select-none"
              />
            </div>

            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">

              {/* LEFT COLUMN: HERO COPY & BRAND IDENTITY */}
              <div className="w-full lg:w-[480px] flex flex-col items-start text-left space-y-5 sm:space-y-6 shrink-0">

                {/* Eyebrow */}
                <div className="flex items-center gap-2">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF8000] animate-pulse" />
                  <span className="text-[#FFB800] text-[12px] font-semibold tracking-[-1.1px] leading-[16px] uppercase font-sans">
                    CONSISTENCY TODAY
                  </span>
                </div>

                {/* Title Block */}
                <div className="space-y-3 w-full">
                  <div className="w-full h-auto relative flex flex-wrap items-baseline gap-2 text-left">
                    <span className="font-doto font-extralight text-5xl sm:text-7xl lg:text-[96px] tracking-[-2.9px] leading-none text-white">
                      TRUE
                    </span>
                    <span className="font-inter italic font-semibold text-5xl sm:text-7xl lg:text-[93px] tracking-[-7px] leading-none text-[#FF8000]">
                      REP
                    </span>
                  </div>

                  <div className="space-y-1 font-sans text-sm sm:text-[17px] tracking-[-1.5px] leading-snug sm:leading-[26px] text-white/80 uppercase font-medium">
                    <p>More than a workout.</p>
                    <p>A better you.</p>
                  </div>
                </div>

                {/* Pill Row */}
                <div className="flex items-center gap-2 text-[13px] font-normal tracking-[-1.2px] leading-[20px] uppercase font-sans">
                  <span className="text-[#FFB800]">TRAIN</span>
                  <span className="text-white/27">•</span>
                  <span className="text-[#FFB800]">TRACK</span>
                  <span className="text-white/27">•</span>
                  <span className="text-[#FFB800]">COMPETE</span>
                  <span className="text-white/27">•</span>
                  <span className="text-[#FFB800]">CONQUER</span>
                </div>

                {/* Social Row */}
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="#instagram"
                    aria-label="Instagram"
                    className="w-[40px] h-[40px] rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-[16px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="#youtube"
                    aria-label="YouTube"
                    className="w-[40px] h-[40px] rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-[16px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="#twitter"
                    aria-label="X Twitter"
                    className="w-[40px] h-[40px] rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-[16px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN: FEATURE STACK (626px width specs) */}
              <div className="w-full lg:w-[400px] flex flex-col space-y-[18px] shrink-0">

                {/* Feature Card 1 */}
                <div
                  onClick={() => onNavigate && onNavigate('aicoach')}
                  className="group cursor-pointer relative h-[76px] rounded-[80px] bg-white/[0.04] border border-white/[0.09] px-4 py-3 flex items-center gap-4 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/20 shadow-[inset_5px_3px_65.9px_rgba(255,255,255,0.25)]"
                >
                  <div className="w-[44px] h-[44px] rounded-full bg-[#FF8000] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,128,0,0.4)]">
                    <img src={iconTrack} alt="Track" className="w-8 h-8 object-contain" />
                  </div>
                  <div className="text-left font-sans space-y-0.5 flex-1">
                    <h3 className="text-white text-[13px] font-bold uppercase tracking-[-1.2px] leading-[18px]">TRACK</h3>
                    <p className="text-white/63 text-[13px] tracking-[-1.2px] leading-[18px]">AI tracks your workout sessions & posture</p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div
                  onClick={() => onNavigate && onNavigate('aicoach')}
                  className="group cursor-pointer relative h-[76px] rounded-[80px] bg-white/[0.04] border border-white/[0.09] px-4 py-3 flex items-center gap-4 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/20 shadow-[inset_5px_3px_65.9px_rgba(255,255,255,0.25)]"
                >
                  <div className="w-[44px] h-[44px] rounded-full bg-[#FF8000] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,128,0,0.4)]">
                    <img src={iconImprove} alt="Improve" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="text-left font-sans space-y-0.5 flex-1">
                    <h3 className="text-white text-[13px] font-bold uppercase tracking-[-1.2px] leading-[18px]">IMPROVE</h3>
                    <p className="text-white/63 text-[13px] tracking-[-1.2px] leading-[18px]">Real-time biomechanical guidance</p>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div
                  onClick={() => onNavigate && onNavigate('duels')}
                  className="group cursor-pointer relative h-[76px] rounded-[80px] bg-white/[0.04] border border-white/[0.09] px-4 py-3 flex items-center gap-4 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/20 shadow-[inset_5px_3px_65.9px_rgba(255,255,255,0.25)]"
                >
                  <div className="w-[44px] h-[44px] rounded-full bg-[#FF8000] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,128,0,0.4)]">
                    <img src={iconBelong} alt="Belong" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="text-left font-sans space-y-0.5 flex-1">
                    <h3 className="text-white text-[13px] font-bold uppercase tracking-[-1.2px] leading-[18px]">BELONG</h3>
                    <p className="text-white/63 text-[13px] tracking-[-1.2px] leading-[18px]">Join a community that keeps you going</p>
                  </div>
                </div>

                {/* Discipline Panel CTA Card */}
                <div
                  onClick={() => onNavigate && onNavigate('aicoach')}
                  className="cursor-pointer relative h-[84px] rounded-[80px] bg-[#FF8000] text-black px-6 py-4 flex items-center justify-between shadow-[0px_12px_24px_rgba(255,128,0,0.38)] hover:brightness-105 transition-all"
                >
                  <div className="text-left font-sans space-y-0.5 flex-1">
                    <div className="text-[11px] font-bold text-black/80 tracking-[-1px] leading-[14px] uppercase">DISCIPLINE</div>
                    <div className="text-[15px] font-extrabold text-[#050505] tracking-[-1.3px] leading-[22px] uppercase">IN YOUR POCKET</div>
                    <div className="w-[64px] h-[2px] bg-[#050505] rounded-full mt-0.5" />
                  </div>

                  <div className="w-[44px] h-[44px] rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

              </div>

            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: PLATFORM CONCEPT & BIOMECHANICS */}
        {/* ========================================================================= */}
        <section className="relative w-full rounded-[36px] sm:rounded-[80px] lg:rounded-[120px] bg-[linear-gradient(180deg,rgba(0,0,0,0.17)_0%,rgba(255,0,0,0.17)_27%,rgba(255,255,0,0.17)_67%,rgba(255,255,255,0.17)_100%)] p-5 sm:p-10 lg:p-12 space-y-6 sm:space-y-8 shadow-[0_0_24px_rgba(255,128,0,0.15)] text-left">

          {/* Header Block */}
          <div className="space-y-2">
            <span className="text-[#FFB800] text-[12px] font-semibold tracking-[-1.1px] leading-[16px] uppercase font-sans block">
              PLATFORM CONCEPT & BIOMECHANICS
            </span>

            <h2 className="self-stretch justify-start text-white text-3xl sm:text-5xl lg:text-6xl font-normal font-['Arial_MT_Pro'] leading-tight">
              TRUE REP - WASM POSE REFEREE <br />
              <span className="self-stretch justify-start text-white/70 text-2xl sm:text-4xl lg:text-6xl font-normal font-['Arial_MT_Pro'] leading-tight">& intelligent workout assistant</span>
            </h2>

            <p className="w-full max-w-[1248px] justify-start text-white/60 text-xs sm:text-base font-normal font-['Arial_MT_Pro'] leading-relaxed">
              Every rep is a mathematically verified posture event calculated strictly on-device through joint angles and artificial intelligence.
            </p>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Engine Panel (Left) */}
            <div className="lg:col-span-5 h-full lg:h-[504px] rounded-[50px] sm:rounded-[60px] bg-[#0A0A0A] outline outline-1 outline-offset-[-1px] outline-orange-500/10 p-5 flex flex-col items-center justify-between shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_32px_0px_rgba(255,128,0,0.20)] text-center relative overflow-hidden">
              {/* Visor Avatar Image Container */}
              <div className="w-full flex-1 min-h-0 rounded-[40px] sm:rounded-[48px] overflow-hidden bg-gradient-to-b from-[#150500] to-[#0A0A0A] relative">
                <img src={wasmEngine} alt="WASM Ref Engine" className="w-full h-full object-cover" />
              </div>

              {/* Centered Labels */}
              <div className="flex flex-col items-center justify-center space-y-0.5 pt-3 pb-1 shrink-0">
                <div className="text-[#FFB800] text-[18px] sm:text-[20px] font-normal font-['Arial_MT_Pro'] uppercase tracking-tight">
                  WASM REF ENGINE
                </div>
                <div className="text-white text-[20px] sm:text-[22px] font-normal font-['Arial_MT_Pro']">
                  Edge Computer Vision
                </div>
              </div>
            </div>

            {/* Feature Grid (Right - 2x2) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Card 1 */}
              <div className="self-stretch h-60 p-7 bg-white/5 rounded-[50px] shadow-[inset_5px_3px_65.9000015258789px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-4 text-left">
                <div className="size-12 bg-[#FF8000] rounded-full flex flex-col justify-center items-center shrink-0">
                  <img src={iconShield} alt="Trustless AI Referee" className="w-6 h-6 object-contain" />
                </div>
                <div className="self-stretch justify-start text-white text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                  Trustless AI Referee
                </div>
                <div className="self-stretch justify-start text-white/60 text-base font-normal font-['Arial_MT_Pro'] leading-6">
                  On-device camera analysis with zero cloud video uploads. Calculates joint flexion (θ ≤ 90°).
                </div>
              </div>

              {/* Card 2 */}
              <div className="self-stretch h-60 p-7 bg-white/5 rounded-[50px] shadow-[inset_5px_3px_65.9000015258789px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-4 text-left">
                <div className="size-12 bg-[#FF8000] rounded-full flex flex-col justify-center items-center shrink-0">
                  <img src={iconTrophy} alt="Ranked 1v1 Arena" className="w-6 h-6 object-contain" />
                </div>
                <div className="self-stretch justify-start text-white text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                  Ranked 1v1 Arena
                </div>
                <div className="self-stretch justify-start text-white/60 text-base font-normal font-['Arial_MT_Pro'] leading-6">
                  Matches athletes in 60-second strength showdowns using sub-200ms Elo matchmaking queues.
                </div>
              </div>

              {/* Card 3 */}
              <div className="self-stretch h-60 p-7 bg-white/5 rounded-[50px] shadow-[inset_5px_3px_65.9000015258789px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-4 text-left">
                <div className="size-12 bg-[#FF8000] rounded-full flex flex-col justify-center items-center shrink-0">
                  <img src={iconPulse} alt="Biometric Sensor Sync" className="w-6 h-6 object-contain" />
                </div>
                <div className="self-stretch justify-start text-white text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                  Biometric Sensor Sync
                </div>
                <div className="self-stretch justify-start text-white/60 text-base font-normal font-['Arial_MT_Pro'] leading-6">
                  Integrates ANT+ & BLE sensors for live heart rate, HRV, and dynamic wattage telemetry.
                </div>
              </div>

              {/* Card 4 */}
              <div className="self-stretch h-60 p-7 bg-white/5 rounded-[50px] shadow-[inset_5px_3px_65.9000015258789px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-4 text-left">
                <div className="size-12 bg-[#FF8000] rounded-full flex flex-col justify-center items-center shrink-0">
                  <img src={iconMapPin} alt="Territory Faction Conquest" className="w-6 h-6 object-contain" />
                </div>
                <div className="self-stretch justify-start text-white text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                  Territory Faction Conquest
                </div>
                <div className="self-stretch justify-start text-white/60 text-base font-normal font-['Arial_MT_Pro'] leading-6">
                  Aggregates rep victories to capture real-world campus and municipal map zones.
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: HOW WE SCAN & VALIDATE FORM */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-[1350px] mx-auto">
          <div className="w-full bg-gradient-to-br from-zinc-950 to-neutral-950 rounded-[120px] lg:rounded-[56px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15)] outline outline-1 outline-offset-[-1px] outline-white/10 p-6 sm:p-8 lg:p-9 space-y-6 text-left">
            
            {/* Header Block */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF8000] animate-pulse" />
                  <span className="text-[#FFB800] text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    EDGE POSE-VISION PIPELINE
                  </span>
                </div>

                <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-normal font-['Arial_MT_Pro'] uppercase leading-tight">
                  HOW WE SCAN & <span className="text-[#FF8000]">VALIDATE FORM</span>
                </h2>
              </div>

              <p className="text-white/50 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] leading-5 max-w-xs">
                Zero cloud video upload. 33 spatial keypoint tracking running on-device at 30 FPS.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

              {/* Left Pose Scan Graphic Card */}
              <div className="lg:col-span-6 h-full min-h-[360px] lg:min-h-[400px] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_32px_0px_rgba(255,128,0,0.25)] outline outline-1 outline-offset-[-1px] outline-orange-500/10 relative flex flex-col justify-between p-6 sm:p-7 select-none">
                {/* Full Bleed Background Image */}
                <img src={poseScan} alt="3D Keypoint Pose Tracking Inference" className="absolute inset-0 w-full h-full object-cover z-0" />

                {/* Top Overlay Badges */}
                <div className="relative z-10 w-full flex justify-between items-center text-black/90 text-[10px] font-normal font-['Arial_MT_Pro'] leading-4">
                  <span>● 33 LANDMARKS ACTIVE</span>
                  <span>0.4ms WASM INFERENCE</span>
                </div>

                {/* Bottom Overlay Badge */}
                <div className="relative z-10 inline-flex items-center gap-2">
                  <div className="size-2 bg-[#FF8000] rounded-full animate-pulse" />
                  <span className="text-[#FFB800] text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    TRUSTLESS ON-DEVICE INFERENCE
                  </span>
                </div>
              </div>

              {/* Right Formula & Angle Rules */}
              <div className="lg:col-span-6 h-full p-5 sm:p-6 bg-white/5 rounded-[32px] sm:rounded-[40px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <h3 className="text-white text-xl sm:text-2xl font-normal font-['Arial_MT_Pro'] leading-tight">
                    Biomechanical Kinematic Angle Math
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] leading-5">
                    Rather than counting reps based on shaky motion sensors or self-reported buttons, TrueRep continuously computes 3D joint angles in real-time:
                  </p>
                  <div className="p-3.5 bg-neutral-950 rounded-[16px] overflow-x-auto">
                    <div className="text-white text-xs font-normal font-['Aboreto'] leading-4 tracking-widest whitespace-nowrap">
                      θ = |atan2(y₃-y₂, x₃-x₂) - atan2(y₁-y₂, x₁-x₂)| × (180/π)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 sm:p-5 bg-white/5 rounded-[24px] sm:rounded-[30px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-1.5">
                    <div className="text-white text-sm sm:text-base font-normal font-['Arial_MT_Pro'] leading-5">
                      1. Lockout State (UP)
                    </div>
                    <div className="text-white/60 text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                      Requires full extension (θ ≥ 160°) before commencing rep movement.
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-white/5 rounded-[24px] sm:rounded-[30px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 space-y-1.5">
                    <div className="text-white text-sm sm:text-base font-normal font-['Arial_MT_Pro'] leading-5">
                      2. Biometric Depth (DOWN)
                    </div>
                    <div className="text-white/60 text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                      Validates complete flexion (θ ≤ 90°) before granting valid rep ACK.
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 4: TRADITIONAL FITNESS APPS VS TRUEREP */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-[1350px] mx-auto">
          <div className="w-full rounded-[40px] lg:rounded-[52px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15)] outline outline-1 outline-offset-[-1px] outline-white/10 p-6 sm:p-8 lg:p-9 space-y-6 text-left relative overflow-hidden bg-black">
            
            {/* Background Image Layer with Gradient Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] lg:rounded-[52px] overflow-hidden">
              <img src={sectionBg} alt="Section Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 to-zinc-950/90"/>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header Block */}
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="text-[#FFB800] text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                  WHY TRUEREP IS BETTER
                </div>
                <div>
                  <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal font-['Arial_MT_Pro'] uppercase leading-tight">
                    TRADITIONAL FITNESS APPS <span className="text-[#FF8000]">VS TRUEREP</span>
                  </h2>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full">

                {/* Traditional Workout Apps Card */}
                <div className="p-6 bg-white/5 rounded-[36px] sm:rounded-[44px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.07),inset_0px_-1px_10.4px_0px_rgba(255,255,255,0.03)] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-sm flex flex-col justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0">
                      <img src={iconTradApps} alt="Traditional Workout Apps" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-white text-base font-normal font-['Arial_MT_Pro'] leading-5">
                        Traditional Workout Apps
                      </div>
                      <div className="text-white/70 text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                        Honor System & High Costs
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        Honor System Reps: Easy to cheat by tapping buttons without performing exercises.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        Invasive Cloud Streams: Uploads private camera streams to expensive server GPUs.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        Static Logging: Tedious manual entry causing high user drop-off.
                      </div>
                    </div>
                  </div>
                </div>

                {/* TrueRep Competitive AI Card */}
                <div className="p-6 bg-gradient-to-br from-neutral-950/90 to-neutral-900/90 rounded-[36px] sm:rounded-[44px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-between gap-6 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0 p-1.5">
                      <img src={iconTrueRepLogo} alt="TrueRep" className="w-7 h-5 object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-white text-base font-normal font-['Arial_MT_Pro'] leading-5">
                        TrueRep Competitive AI
                      </div>
                      <div className="text-[#FFB800] text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                        100% Trustless & WASM Native
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        Trustless AI Referee: Reps only count when biometric depth thresholds (θ ≤ 90°) are achieved.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        100% On-Device Privacy: Processes MediaPipe pose estimations strictly in browser WebAssembly.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                      <div className="text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-5">
                        Geospatial Conquest: Converts resistance reps into real-world map territory capture.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: STATS DEFINING THE TRUEREP STANDARD */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-[1350px] mx-auto">
          <div className="w-full p-5 sm:p-8 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-zinc-950/95 rounded-[36px] sm:rounded-[48px] lg:rounded-[52px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-6 text-left">
            
            {/* Top Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="w-full sm:w-[620px] inline-flex flex-col justify-start items-start gap-2">
                <div className="w-full inline-flex flex-col justify-start items-start gap-2">
                  <div className="inline-flex justify-start items-center gap-2">
                    <div className="size-2.5 bg-orange-500 rounded-full"></div>
                    <div className="justify-start text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">PERFORMANCE METRICS</div>
                  </div>
                  <div className="self-stretch text-left justify-start">
                    <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal font-['Arial_MT_Pro'] uppercase leading-tight">STATS DEFINING<br/>
                    </span>
                    <span className="text-orange-500 text-3xl sm:text-4xl lg:text-5xl font-normal font-['Arial_MT_Pro'] uppercase leading-tight">THE TRUEREP STANDARD
                    </span>
                  </div>
                </div>
              </div>
              <div className="justify-start text-white/50 text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                Verified benchmarks
              </div>
            </div>

            {/* 3 Stat Cards Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Card 1: TOTAL VERIFIED REPS */}
              <div className="flex-1 h-56 px-6 py-6 relative bg-zinc-950 rounded-[40px] lg:rounded-[80px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15),inset_0px_1px_0px_0px_rgba(255,255,255,0.07),inset_0px_-1px_10.4px_0px_rgba(255,255,255,0.03),inset_11px_15px_98.8px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-center items-center overflow-hidden">
                {/* Blur Glow Graphic */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px] lg:rounded-[80px]">
                  <img src={heatGrad1} alt="Heat Gradient" className="w-full h-full object-cover mix-blend-screen" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center justify-center gap-2 text-center">
                  <div className="text-yellow-500 text-sm sm:text-base lg:text-xl font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    TOTAL VERIFIED REPS
                  </div>
                  <div className="text-white text-4xl sm:text-5xl lg:text-5xl font-normal font-['Arial_MT_Pro'] leading-10">
                    180K+
                  </div>
                </div>
              </div>
              {/* Card 2: RATING SYSTEM */}
              <div className="flex-1 h-56 relative bg-zinc-950 rounded-[40px] lg:rounded-[80px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15),inset_0px_1px_0px_0px_rgba(255,255,255,0.07),inset_0px_-1px_10.4px_0px_rgba(255,255,255,0.03),inset_11px_15px_98.8px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 overflow-hidden p-4 flex flex-col justify-between items-center">
                {/* Blur Glow Graphic */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px] lg:rounded-[80px]">
                  <img src={heatGrad2} alt="Heat Gradient" className="w-full h-full object-cover mix-blend-screen" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center justify-center">
                  <div className="text-center text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    RATING SYSTEM
                  </div>
                  <div className="text-center text-white text-3xl sm:text-4xl font-normal font-['Arial_MT_Pro'] leading-9">
                    3 Tiers
                  </div>
                </div>

                <div className="relative z-10 w-full max-w-[288px] space-y-1.5">
                  <div className="w-full h-8 px-3 bg-white/5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 flex justify-between items-center">
                    <div className="text-white text-xs font-normal font-['Arial_MT_Pro']">Tier I • Challenger</div>
                    <div className="text-white text-xs font-normal font-['Arial_MT_Pro']">1,800+ ELO</div>
                  </div>
                  <div className="w-full h-8 px-3 bg-white/5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 flex justify-between items-center">
                    <div className="text-white text-xs font-normal font-['Arial_MT_Pro']">Tier II • Master</div>
                    <div className="text-white text-xs font-normal font-['Arial_MT_Pro']">2,200+ ELO</div>
                  </div>
                  <div className="w-full h-8 px-3 bg-orange-500 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-zinc-950 rounded-full" />
                      <div className="text-zinc-950 text-xs font-medium font-['Arial_MT_Pro']">Tier III • Elite</div>
                    </div>
                    <div className="text-zinc-950 text-xs font-medium font-['Arial_MT_Pro']">2,500+ ELO</div>
                  </div>
                </div>
              </div>

              {/* Card 3: TOTAL COMPETITORS & FACTION ZONES */}
              <div className="flex-1 h-56 relative bg-zinc-950 rounded-[40px] lg:rounded-[80px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50),0px_0px_24px_0px_rgba(255,128,0,0.15),inset_0px_1px_0px_0px_rgba(255,255,255,0.07),inset_0px_-1px_10.4px_0px_rgba(255,255,255,0.03),inset_11px_15px_98.8px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 overflow-hidden p-4 flex flex-col justify-between items-center">
                {/* Blur Glow Graphic */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px] lg:rounded-[80px]">
                  <img src={heatGrad3} alt="Heat Gradient" className="w-full h-full object-cover mix-blend-screen" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center gap-0.5">
                  <div className="text-center text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    TOTAL COMPETITORS
                  </div>
                  <div className="text-center text-white text-3xl sm:text-4xl font-normal font-['Arial_MT_Pro'] leading-9">
                    500+
                  </div>
                </div>

                <div className="relative z-10 w-full pt-1.5 border-t border-white/10 flex flex-col items-center gap-0.5">
                  <div className="text-center text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    ACTIVE FACTION ZONES
                  </div>
                  <div className="text-center text-white text-3xl sm:text-4xl font-normal font-['Arial_MT_Pro'] leading-9">
                    200+
                  </div>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('aicoach')}
                  className="relative z-10 w-full max-w-[240px] h-10 bg-orange-500 hover:bg-orange-400 transition-colors rounded-full shadow-[0px_8px_18px_0px_rgba(255,128,0,0.25)] flex items-center justify-center text-zinc-950 text-sm font-normal font-['Arial_MT_Pro'] cursor-pointer"
                >
                  Start AI Workout →
                </button>
              </div>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
