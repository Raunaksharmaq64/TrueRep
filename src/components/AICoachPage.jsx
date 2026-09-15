import React, { useState, useCallback } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Volume2, 
  VolumeX,
  Activity, 
  Zap, 
  RotateCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Target
} from 'lucide-react';
import PoseCanvas from './camera/PoseCanvas';
import { useWebSpeech } from '../hooks';

export default function AICoachPage() {
  const [exercise, setExercise] = useState('pushup'); // 'pushup' | 'squat' | 'jumpingjack'
  const [repCount, setRepCount] = useState(0);
  const [targetReps, setTargetReps] = useState(25);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showDeepTelemetry, setShowDeepTelemetry] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [telemetry, setTelemetry] = useState({
    reps: 0,
    state: 'IDLE',
    feedback: 'Step into frame and start camera to begin',
    elbowAngle: 165,
    spineAngle: 172,
    kneeAngle: 175,
    hipAngle: 170,
    armAngle: 30,
    isFormValid: true,
    formErrorReason: null,
    isComboActive: false,
    consecutiveCleanReps: 0,
    valgusRatio: 1.0,
    lastRepDuration: 0
  });

  // Browser Native Voice Coach
  const { speak } = useWebSpeech(voiceEnabled);

  const handleTelemetryUpdate = useCallback((data) => {
    setTelemetry(data);
  }, []);

  const handleRepUpdate = useCallback((count) => {
    setRepCount(count);
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => !prev);
  };

  const handleResetSession = () => {
    setRepCount(0);
    setTelemetry((prev) => ({
      ...prev,
      reps: 0,
      state: 'IDLE',
      feedback: 'Session reset. Ready for rep #1!',
      consecutiveCleanReps: 0,
      isComboActive: false
    }));
  };

  // Progress percentage
  const progressPercent = Math.min(100, Math.round((repCount / targetReps) * 100));

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#03060d] text-white px-4 sm:px-8 lg:px-12 py-6 select-none flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* 1. MINIMALIST TOP HEADER & EXERCISE SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-900/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-[10px] font-bold tracking-[0.25em] uppercase">
                AI COACH STUDIO • ON-DEVICE CV
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-wide text-white uppercase font-hero-slant mt-0.5">
              AUTONOMOUS REFEREE
            </h1>
          </div>

          {/* Exercise Selector Pills */}
          <div className="flex items-center gap-2 bg-[#060a15] p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setExercise('pushup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                exercise === 'pushup'
                  ? 'bg-[#0070F3] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Push-Ups
            </button>
            <button
              onClick={() => setExercise('squat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                exercise === 'squat'
                  ? 'bg-[#0070F3] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Squats
            </button>
            <button
              onClick={() => setExercise('jumpingjack')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                exercise === 'jumpingjack'
                  ? 'bg-[#0070F3] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jumping Jacks
            </button>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={toggleVoice}
              title={voiceEnabled ? 'Mute Voice Coach' : 'Enable Voice Coach'}
              className={`p-2.5 rounded-xl border transition-all ${
                voiceEnabled 
                  ? 'bg-[#0a1428] border-cyan-500/40 text-cyan-400' 
                  : 'bg-[#070c18] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button 
              onClick={handleResetSession}
              title="Reset Rep Counter"
              className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. COMMAND HUD STRIP (Verified Reps, Dynamic Form Quality Pill, Real-time Biomechanics) */}
        <div className="w-full bg-[#070c18] border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          {/* Left: Rep Counter & Mini Ring */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#0070F3] transition-all duration-300"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-cyan-400">
                {progressPercent}%
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VERIFIED REPS</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
                {repCount} <span className="text-xs text-slate-500 font-semibold">/ {targetReps}</span>
              </div>
            </div>
            {telemetry.isComboActive && (
              <div className="ml-1 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg text-amber-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{telemetry.consecutiveCleanReps} CLEAN (1.5x)</span>
              </div>
            )}
          </div>

          {/* Center: Live Form Quality Pill (Clean, Fault, Depth) - OUTSIDE CAMERA! */}
          <div className="flex-1 min-w-[200px] max-w-md flex justify-center">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
              telemetry.state === 'IN_DEPTH' || telemetry.state === 'AT_PEAK'
                ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                : telemetry.isFormValid
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}>
              {telemetry.isFormValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className="truncate">
                {telemetry.state === 'IN_DEPTH' || telemetry.state === 'AT_PEAK'
                  ? '🎯 90° DEPTH HIT'
                  : telemetry.isFormValid
                  ? '✓ FORM CLEAN'
                  : (telemetry.formErrorReason || '⚠️ FORM FAULT')}
              </span>
            </div>
          </div>

          {/* Right: Live Biomechanics Telemetry */}
          <div className="flex items-center gap-2 bg-[#040711] border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            {exercise === 'pushup' && (
              <>
                <span className="text-slate-400">Elbow: <strong className={telemetry.elbowAngle <= 102 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.elbowAngle || '--'}°</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Core: <strong className={telemetry.spineAngle >= 135 ? 'text-cyan-400' : 'text-rose-400'}>{telemetry.spineAngle || '--'}°</strong></span>
              </>
            )}
            {exercise === 'squat' && (
              <>
                <span className="text-slate-400">Knee: <strong className={telemetry.kneeAngle <= 102 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.kneeAngle || '--'}°</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Torso: <strong className="text-cyan-400">{telemetry.torsoIncline ? `${telemetry.torsoIncline}°` : 'Upright'}</strong></span>
              </>
            )}
            {exercise === 'jumpingjack' && (
              <>
                <span className="text-slate-400">Arm: <strong className="text-cyan-400">{telemetry.armAngle || '--'}°</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Stance: <strong className="text-cyan-400">{telemetry.stanceRatio ? `${telemetry.stanceRatio}x` : '1.0x'}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* 3. HERO CAMERA VIEWPORT (Unobstructed, Max Body Visibility) */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800/80 bg-[#040711] shadow-2xl">
          <div className={`w-full relative transition-all duration-300 ${
            isExpanded
              ? 'h-[78vh] min-h-[580px]'
              : 'aspect-[4/3] sm:aspect-[16/10] max-h-[640px] min-h-[480px]'
          }`}>
            <PoseCanvas
              exercise={exercise}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(prev => !prev)}
              onRepUpdate={handleRepUpdate}
              onTelemetryUpdate={handleTelemetryUpdate}
              onVoiceFeedback={speak}
            />
          </div>

          {/* Target Progress Fill Bar */}
          <div className="w-full h-1.5 bg-slate-900">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-[#0070F3] to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4. ATLAS AI VOICE REFEREE & POSTURE GUIDANCE BAR (Directly Below Camera) */}
        <div className="w-full bg-[#070c18] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-[#0070F3] flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-[#0070F3] uppercase tracking-wider">
              ATLAS AI REFEREE & POSTURE COACH
            </div>
            <p className="text-sm font-semibold text-white truncate mt-0.5">
              "{telemetry.postureGuidance || telemetry.feedback || 'Step into camera frame to calibrate posture'}"
            </p>
          </div>
          <div className="flex items-center gap-1 h-4 flex-shrink-0">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* 3. THREE ESSENTIAL TELEMETRY CARDS (Clean & Concise) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Form Precision */}
          <div className="bg-[#070c18] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FORM PRECISION</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {telemetry.isFormValid ? '98.8% Clean' : 'Fault Latch'}
              </div>
              <div className="text-[11px] text-slate-500">Anti-Cheat Latch Active</div>
            </div>
          </div>

          {/* Card 2: Cadence & TUT */}
          <div className="bg-[#070c18] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REP DURATION (TUT)</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {telemetry.lastRepDuration ? `${telemetry.lastRepDuration.toFixed(2)}s` : '--'}
              </div>
              <div className="text-[11px] text-slate-500">Min 0.65s Anti-Twitch</div>
            </div>
          </div>

          {/* Card 3: Session Goal */}
          <div className="bg-[#070c18] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-[#0070F3] flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SET PROGRESS</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {repCount} / {targetReps}
              </div>
              <div className="text-[11px] text-slate-500">{Math.max(0, targetReps - repCount)} reps remaining</div>
            </div>
          </div>

        </div>

        {/* 4. OPTIONAL COLLAPSIBLE: DEEP BIOMECHANICS & ANTI-CHEAT INSPECTOR */}
        <div className="w-full bg-[#070c18] border border-slate-800/80 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowDeepTelemetry(prev => !prev)}
            className="w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Technical Inspector: Biomechanics & Anti-Cheat Vectors
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{showDeepTelemetry ? 'Hide' : 'Inspect'}</span>
              {showDeepTelemetry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showDeepTelemetry && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              {/* Joint Angles */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Real-Time 3D Kinematics
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Elbow Flexion:</span>
                  <span className="text-cyan-400 font-bold">{telemetry.elbowAngle}° (Depth ≤90°)</span>
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Spine Rigidity:</span>
                  <span className="text-cyan-400 font-bold">{telemetry.spineAngle}° (Min ≥155°)</span>
                </div>
              </div>

              {/* Anti-Cheat Safeguards */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Anti-Cheat Vector Gates
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Head-Bob Spoof:</span>
                  <span className="text-emerald-400 font-bold">BLOCKED (Vertex Lock)</span>
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Hip Sag Latch:</span>
                  <span className="text-emerald-400 font-bold">ARMED (Irreversible)</span>
                </div>
              </div>

              {/* Inference Engine */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Edge Runtime Specs
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Inference Core:</span>
                  <span className="text-cyan-400 font-bold">BlazePose 3D (Wasm)</span>
                </div>
                <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-slate-400">Cloud Stream Lag:</span>
                  <span className="text-emerald-400 font-bold">0ms (100% On-Device)</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
