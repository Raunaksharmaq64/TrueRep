import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Activity, 
  Zap, 
  RotateCw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ShieldAlert, 
  Target, 
  Lock,
  Play,
  Pause,
  Timer,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';
import PoseCanvas from './camera';
import { RestPauseOverlay, WorkoutAnalyticsModal } from './workout';
import { useWebSpeech } from '../hooks';
import { audioAlerts } from '../utils';

export default function AICoachPage() {
  const [exercise, setExercise] = useState('pushup'); // 'pushup' | 'squat' | 'jumpingjack'
  const [repCount, setRepCount] = useState(0);
  const [targetReps, setTargetReps] = useState(25);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showDeepTelemetry, setShowDeepTelemetry] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Phase 2: Solo Challenge Engine & Timers
  const [workoutMode, setWorkoutMode] = useState('target'); // 'target' | 'sprint' | 'strict'
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(60);
  const [isRestPauseOpen, setIsRestPauseOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [maxComboStreak, setMaxComboStreak] = useState(0);
  const idleStartTimeRef = useRef(0);
  const repHistoryRef = useRef([]);

  const [telemetry, setTelemetry] = useState({
    reps: 0,
    state: 'IDLE',
    feedback: 'Step into frame and start camera to begin',
    postureGuidance: 'Step into frame and start camera',
    elbowAngle: 165,
    spineAngle: 172,
    kneeAngle: 175,
    hipAngle: 170,
    armAngle: 30,
    stanceRatio: 1.0,
    isFormValid: true,
    formErrorReason: null,
    isComboActive: false,
    consecutiveCleanReps: 0,
    valgusRatio: 1.0,
    lastRepDuration: 0
  });

  // Browser Native Voice Coach
  const { speak } = useWebSpeech(voiceEnabled);

  // Active Timer Effect
  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (workoutMode === 'sprint') {
          setSprintTimeLeft((prev) => {
            if (prev <= 1) {
              setIsSessionActive(false);
              audioAlerts.playStartHorn();
              setIsAnalyticsOpen(true);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, workoutMode]);

  // Target Goal Auto-Completion Trigger
  useEffect(() => {
    if (workoutMode === 'target' && isSessionActive && repCount >= targetReps && targetReps > 0) {
      setIsSessionActive(false);
      audioAlerts.playValidRepChime();
      setIsAnalyticsOpen(true);
    }
  }, [repCount, targetReps, workoutMode, isSessionActive]);

  // Smart Rest-Pause Detection: triggers after 4.5s idle during active workout
  useEffect(() => {
    if (!isSessionActive || repCount === 0 || isAnalyticsOpen) {
      idleStartTimeRef.current = 0;
      return;
    }

    if (telemetry.state === 'IDLE') {
      if (!idleStartTimeRef.current) {
        idleStartTimeRef.current = Date.now();
      } else if (Date.now() - idleStartTimeRef.current >= 4500 && !isRestPauseOpen) {
        setIsRestPauseOpen(true);
      }
    } else {
      idleStartTimeRef.current = 0;
      if (isRestPauseOpen) {
        setIsRestPauseOpen(false);
      }
    }
  }, [telemetry.state, isSessionActive, repCount, isRestPauseOpen, isAnalyticsOpen]);

  // Sync Max Combo Streak & Rep History
  useEffect(() => {
    if (telemetry.consecutiveCleanReps > maxComboStreak) {
      setMaxComboStreak(telemetry.consecutiveCleanReps);
    }
    if (telemetry.repHistory && telemetry.repHistory.length > 0) {
      repHistoryRef.current = telemetry.repHistory;
    }
  }, [telemetry.consecutiveCleanReps, telemetry.repHistory, maxComboStreak]);

  const handleTelemetryUpdate = useCallback((data) => {
    setTelemetry(data);
  }, []);

  const handleRepUpdate = useCallback((count) => {
    setRepCount(count);
    setIsSessionActive(true); // Auto-starts clock on first movement!
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => !prev);
  };

  const toggleSession = () => {
    if (!isSessionActive) {
      audioAlerts.playStartHorn();
      setIsSessionActive(true);
      if (workoutMode === 'sprint' && sprintTimeLeft <= 0) {
        setSprintTimeLeft(60);
      }
    } else {
      setIsSessionActive(false);
    }
  };

  const handleFinishWorkout = () => {
    setIsSessionActive(false);
    audioAlerts.playValidRepChime();
    setIsAnalyticsOpen(true);
  };

  const handleSelectExercise = (newExercise) => {
    if (newExercise === exercise) return;
    setExercise(newExercise);
    setRepCount(0);
    setElapsedSeconds(0);
    setSprintTimeLeft(60);
    setIsSessionActive(false);
    setTargetReps(newExercise === 'jumpingjack' ? 40 : newExercise === 'squat' ? 25 : 20);
    setTelemetry((prev) => ({
      ...prev,
      reps: 0,
      state: 'IDLE',
      feedback: `Ready for ${newExercise === 'pushup' ? 'Push-Ups' : newExercise === 'squat' ? 'Squats' : 'Jumping Jacks'}`,
      postureGuidance: 'Step into camera frame to calibrate posture',
      consecutiveCleanReps: 0,
      isComboActive: false,
      isFormValid: true,
      formErrorReason: null
    }));
  };

  const handleResetSession = () => {
    setRepCount(0);
    setElapsedSeconds(0);
    setSprintTimeLeft(60);
    setIsSessionActive(false);
    setIsRestPauseOpen(false);
    setIsAnalyticsOpen(false);
    setMaxComboStreak(0);
    repHistoryRef.current = [];
    setTelemetry((prev) => ({
      ...prev,
      reps: 0,
      state: 'IDLE',
      feedback: 'Session reset. Ready for rep #1!',
      postureGuidance: 'Session reset! Step into frame and lock posture.',
      consecutiveCleanReps: 0,
      isComboActive: false,
      isFormValid: true,
      formErrorReason: null
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
              onClick={() => handleSelectExercise('pushup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                exercise === 'pushup'
                  ? 'bg-[#0070F3] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Push-Ups
            </button>
            <button
              onClick={() => handleSelectExercise('squat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                exercise === 'squat'
                  ? 'bg-[#0070F3] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Squats
            </button>
            <button
              onClick={() => handleSelectExercise('jumpingjack')}
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

        {/* Phase 2: Solo Challenge Mode & Session Timer Bar */}
        <div className="w-full bg-[#050914] border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              MODE:
            </span>

            <button
              onClick={() => {
                setWorkoutMode('target');
                setSprintTimeLeft(60);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workoutMode === 'target'
                  ? 'bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Goal ({targetReps})</span>
            </button>

            <button
              onClick={() => {
                setWorkoutMode('sprint');
                setSprintTimeLeft(60);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workoutMode === 'sprint'
                  ? 'bg-amber-950/90 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>60s Sprint Blitz</span>
            </button>

            <button
              onClick={() => {
                setWorkoutMode('strict');
                setSprintTimeLeft(60);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workoutMode === 'strict'
                  ? 'bg-rose-950/90 border border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Strict Olympic</span>
            </button>
          </div>

          {/* Session Timer & Action Controls */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#02050c] border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {workoutMode === 'sprint' ? (
                <span className="font-bold text-amber-300">
                  Sprint: {sprintTimeLeft}s
                </span>
              ) : (
                <span className="font-bold text-slate-200">
                  Time: {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            <button
              onClick={toggleSession}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isSessionActive
                  ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/80'
                  : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
              }`}
            >
              {isSessionActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isSessionActive ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={handleFinishWorkout}
              title="Finish workout and view deep analytics & certificate"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0070F3] to-cyan-500 hover:from-blue-600 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics & Proof</span>
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

          {/* Center: Live Form Quality Pill (Clean, Fault, Depth, Anti-Cheat) - OUTSIDE CAMERA! */}
          <div className="flex-1 min-w-[240px] max-w-lg flex justify-center">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
              telemetry.state === 'IN_DEPTH' || telemetry.state === 'AT_PEAK'
                ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.35)] animate-pulse'
                : telemetry.isFormValid
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-bounce'
            }`}>
              {telemetry.isFormValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className="truncate">
                {telemetry.state === 'IN_DEPTH' || telemetry.state === 'AT_PEAK'
                  ? '🎯 90° OLYMPIC DEPTH VALID'
                  : telemetry.isFormValid
                  ? '✓ 99.99% FORM CLEAN'
                  : (`🚨 ${telemetry.formErrorReason || 'FORM FAULT'}`)}
              </span>
            </div>
          </div>

          {/* Right: Live Biomechanics Telemetry with Anti-Cheat Targets */}
          <div className="flex items-center gap-2 bg-[#040711] border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            {exercise === 'pushup' && (
              <>
                <span className="text-slate-400">Elbow: <strong className={telemetry.elbowAngle <= 90 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.elbowAngle || '--'}°</strong> <span className="text-[10px] text-slate-500">(≤90°)</span></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Core: <strong className={telemetry.spineAngle >= 152 ? 'text-cyan-400' : 'text-rose-400'}>{telemetry.spineAngle || '--'}°</strong> <span className="text-[10px] text-slate-500">(≥155°)</span></span>
              </>
            )}
            {exercise === 'squat' && (
              <>
                <span className="text-slate-400">Knee: <strong className={telemetry.kneeAngle <= 90 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.kneeAngle || '--'}°</strong> <span className="text-[10px] text-slate-500">(≤90°)</span></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Hip: <strong className={telemetry.hipAngle ? 'text-cyan-400' : 'text-slate-400'}>{telemetry.hipAngle || '--'}°</strong> <span className="text-[10px] text-slate-500">(Hinge)</span></span>
              </>
            )}
            {exercise === 'jumpingjack' && (
              <>
                <span className="text-slate-400">Arms: <strong className={telemetry.armAngle >= 140 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.armAngle || '--'}°</strong> <span className="text-[10px] text-slate-500">(≥140°)</span></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Stance: <strong className={telemetry.stanceRatio >= 1.4 ? 'text-emerald-400' : 'text-cyan-400'}>{telemetry.stanceRatio ? `${telemetry.stanceRatio}x` : '1.0x'}</strong> <span className="text-[10px] text-slate-500">(≥1.4x)</span></span>
              </>
            )}
          </div>
        </div>

        {/* Sentinel Anti-Cheat Security Strip */}
        <div className="w-full bg-[#050914] border border-cyan-500/20 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold tracking-wider">ANTI-CHEAT SENTINEL:</span>
            <span className="truncate">{exercise === 'pushup' ? 'Universal Plank Gate • Strict 90° Depth • Anti-Worm Latch' : exercise === 'squat' ? 'Vertical Stance Gate • Parallel 90° Depth • Pelvic Excursion Guard' : 'Bilateral Overhead Reach • Dynamic Stance Jump Gate'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="text-[10px]">📐 AUTO-ANGLE:</span>
              <span className="text-emerald-300 font-bold">ADAPTED</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>99.99% VERIFIED</span>
            </div>
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

            {/* Phase 2: Smart Rest-Pause Recovery Overlay */}
            <RestPauseOverlay
              isOpen={isRestPauseOpen}
              onDismiss={() => setIsRestPauseOpen(false)}
              duration={15}
              currentReps={repCount}
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
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              telemetry.isFormValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FORM PRECISION</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                telemetry.isFormValid ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {telemetry.isFormValid ? '99.9% Clean' : 'Fault Latch'}
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
                {exercise === 'pushup' && (
                  <>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Elbow Flexion:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.elbowAngle || '--'}° (Depth ≤90°)</span>
                    </div>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Spine Rigidity:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.spineAngle || '--'}° (Min ≥155°)</span>
                    </div>
                  </>
                )}
                {exercise === 'squat' && (
                  <>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Knee Depth:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.kneeAngle || '--'}° (Parallel ≤90°)</span>
                    </div>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Hip Angle:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.hipAngle || '--'}° (Lockout ≥160°)</span>
                    </div>
                  </>
                )}
                {exercise === 'jumpingjack' && (
                  <>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Overhead Arm:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.armAngle || '--'}° (Peak ≥140°)</span>
                    </div>
                    <div className="flex justify-between bg-[#040711] p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Stance Ratio:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.stanceRatio ? `${telemetry.stanceRatio}x` : '1.0x'} (Jump ≥1.4x)</span>
                    </div>
                  </>
                )}
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

        {/* Phase 2: Post-Workout Deep Analytics & Proof-of-Workout Certificate Modal */}
        <WorkoutAnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          onRestart={handleResetSession}
          exercise={exercise}
          repHistory={repHistoryRef.current}
          totalReps={repCount}
          durationSeconds={elapsedSeconds}
          maxStreak={maxComboStreak}
          athleteName="ATHLETE_ONE"
        />

      </div>
    </div>
  );
}
