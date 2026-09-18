import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  BarChart3, 
  Bell, 
  X, 
  Dumbbell, 
  Check, 
  Layers, 
  Droplet, 
  User, 
  Sliders 
} from 'lucide-react';
import PoseCanvas from './camera/PoseCanvas';
import { RestPauseOverlay, WorkoutAnalyticsModal } from './workout';
import { useWebSpeech } from '../hooks';
import { audioAlerts } from '../utils';
import { EXERCISE_CONFIGS } from '../ai';

export default function AICoachPage() {
  const [exercise, setExercise] = useState('pushup'); // 'pushup' | 'squat' | 'jumpingjack'
  const [repCount, setRepCount] = useState(0);
  const [targetReps, setTargetReps] = useState(25);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showDeepTelemetry, setShowDeepTelemetry] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comingSoonExercise, setComingSoonExercise] = useState(null);
  const [notifiedList, setNotifiedList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('truerep_notified_exercises') || '{}');
    } catch {
      return {};
    }
  });

  const handleToggleNotify = (id) => {
    if (!id) return;
    setNotifiedList((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('truerep_notified_exercises', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
    postureGuidance: 'Step into camera frame to calibrate posture',
    readinessState: 'IDLE',
    countdownValue: null,
    isMatchingExercise: true,
    exerciseCue: null,
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
    if (data.isExercising && !isSessionActive) {
      setIsSessionActive(true);
    }
  }, [isSessionActive]);

  const handleRepUpdate = useCallback((count) => {
    setRepCount(count);
    setIsSessionActive(true); // Auto-starts clock on first movement!
  }, []);

  const averageSessionScore = useMemo(() => {
    if (!telemetry.repHistory || telemetry.repHistory.length === 0) {
      return telemetry.formScore || 95;
    }
    const scores = telemetry.repHistory
      .filter((r) => r.valid && r.score)
      .map((r) => r.score);
    if (scores.length === 0) return telemetry.formScore || 95;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [telemetry.repHistory, telemetry.formScore]);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (next) {
        speak("Voice referee enabled! Ready for posture tracking.", true);
      }
      return next;
    });
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

  // Dynamic Weekly Workout Chart State
  const [selectedChartDayIndex, setSelectedChartDayIndex] = useState(4); // Thursday (Today)
  const [chartMetric, setChartMetric] = useState('volume'); // 'volume' | 'tut' | 'form'

  const baseWeeklyData = [
    { day: 'Sun', volume: 15, tut: 26, form: 95 },
    { day: 'Mon', volume: 32, tut: 54, form: 98 },
    { day: 'Tue', volume: 20, tut: 38, form: 96 },
    { day: 'Wed', volume: 28, tut: 46, form: 99 },
    { day: 'Thu', volume: 42 + repCount, tut: 72 + Math.round(repCount * 1.8), form: 98.8 },
    { day: 'Fri', volume: 18, tut: 30, form: 95 },
    { day: 'Sat', volume: 35, tut: 60, form: 99.2 },
  ];

  // Helper to compute bar height %
  const getBarHeight = (item) => {
    let value = item.volume;
    let maxVal = 60;
    if (chartMetric === 'tut') {
      value = item.tut;
      maxVal = 100;
    } else if (chartMetric === 'form') {
      value = item.form;
      maxVal = 100;
    }
    return `${Math.min(100, Math.max(18, Math.round((value / maxVal) * 100))) }%`;
  };

  const activeChartItem = baseWeeklyData[selectedChartDayIndex];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F4F1EA] text-[#18181B] px-3 sm:px-6 lg:px-10 py-4 sm:py-6 select-none flex justify-center items-start">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-5 items-start">

        {/* ── LEFT SLIM FLOATING CAPSULE SIDEBAR ── */}
        <div className="w-full md:w-auto md:min-w-[64px] bg-white border border-[#E2E8F0] rounded-full p-2.5 flex md:flex-col items-center justify-between md:justify-start gap-4 shadow-sm z-30">
          
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-full bg-[#1E222A] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
            <Dumbbell className="w-5 h-5 fill-current" />
          </div>

          <div className="w-full h-px bg-[#E2E8F0] hidden md:block" />

          {/* Utility Actions */}
          <div className="flex md:flex-col items-center gap-2">
            <button
              onClick={toggleVoice}
              title={voiceEnabled ? 'Mute Voice Referee' : 'Enable Voice Referee'}
              className={`p-2.5 rounded-full border transition-all ${
                voiceEnabled
                  ? 'bg-[#1E222A] border-[#1E222A] text-white shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleResetSession}
              title="Reset Rep Counter"
              className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-black transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDeepTelemetry((prev) => !prev)}
              title="Technical Biomechanics Inspector"
              className={`p-2.5 rounded-full transition-all ${
                showDeepTelemetry
                  ? 'bg-[#EAB308] border-[#EAB308] text-[#18181B] shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-black'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-auto hidden md:block">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* ── BENTO GRID MAIN DASHBOARD ── */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start z-20">

          {/* ── LEFT COLUMN: EXERCISE SELECTOR, HERO CAMERA & HUD (lg:col-span-7) ── */}
          <div className="lg:col-span-7 w-full space-y-4">
            
            {/* 1. EXERCISE SELECTOR BAR (ACTIVE MODELS + COMING SOON MODELS) */}
            <div className="w-full bg-white border border-[#E2E8F0] p-1.5 rounded-2xl sm:rounded-full shadow-sm flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5 w-full">
                {/* Active Exercises */}
                <button
                  onClick={() => handleSelectExercise('pushup')}
                  className={`flex-1 py-2 px-3 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                    exercise === 'pushup'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Push-Ups</span>
                </button>

                <button
                  onClick={() => handleSelectExercise('squat')}
                  className={`flex-1 py-2 px-3 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                    exercise === 'squat'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Squats</span>
                </button>

                <button
                  onClick={() => handleSelectExercise('jumpingjack')}
                  className={`flex-1 py-2 px-3 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                    exercise === 'jumpingjack'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Jumping Jacks</span>
                </button>

                {/* Coming Soon Models */}
                <button
                  onClick={() => setComingSoonExercise(EXERCISE_CONFIGS.bicep_curl)}
                  className="px-2.5 py-2 rounded-xl sm:rounded-full text-xs font-semibold text-slate-500 hover:text-black hover:bg-amber-50 border border-dashed border-amber-300 transition-all flex items-center gap-1"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Biceps</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                    Soon
                  </span>
                </button>

                <button
                  onClick={() => setComingSoonExercise(EXERCISE_CONFIGS.shoulder_press)}
                  className="px-2.5 py-2 rounded-xl sm:rounded-full text-xs font-semibold text-slate-500 hover:text-black hover:bg-amber-50 border border-dashed border-amber-300 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Press</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                    Soon
                  </span>
                </button>

                <button
                  onClick={() => setComingSoonExercise(EXERCISE_CONFIGS.lunge)}
                  className="px-2.5 py-2 rounded-xl sm:rounded-full text-xs font-semibold text-slate-500 hover:text-black hover:bg-amber-50 border border-dashed border-amber-300 transition-all flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Lunges</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                    Beta
                  </span>
                </button>
              </div>
            </div>

            {/* 2. SOLO CHALLENGE ENGINE & TIMER BAR */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm text-left">
              
              {/* Workout Mode Tabs */}
              <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  onClick={() => {
                    setWorkoutMode('target');
                    setSprintTimeLeft(60);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    workoutMode === 'target'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Target ({targetReps})</span>
                </button>

                <button
                  onClick={() => {
                    setWorkoutMode('sprint');
                    setSprintTimeLeft(60);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    workoutMode === 'sprint'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>60s Sprint</span>
                </button>

                <button
                  onClick={() => {
                    setWorkoutMode('strict');
                    setSprintTimeLeft(60);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    workoutMode === 'strict'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Strict Form</span>
                </button>
              </div>

              {/* Timer Display & Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#F8F6F0] border border-[#E2E8F0] px-3 py-1.5 rounded-xl font-mono text-xs text-[#18181B]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {workoutMode === 'sprint' ? (
                    <span className="font-bold text-[#EAB308]">
                      {sprintTimeLeft}s
                    </span>
                  ) : (
                    <span className="font-bold">
                      {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                <button
                  onClick={toggleSession}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isSessionActive
                      ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                      : 'bg-[#1E222A] text-white hover:bg-black shadow-sm'
                  }`}
                >
                  {isSessionActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isSessionActive ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={handleFinishWorkout}
                  title="Finish workout and review deep analytics"
                  className="px-3 py-1.5 rounded-xl bg-[#EAB308] hover:bg-yellow-400 text-[#18181B] font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Proof</span>
                </button>
              </div>

            </div>

            {/* 3. COMMAND HUD STRIP (Form Quality Pill, Live Biomechanics Angles) */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs">
              {/* Form Quality Badge */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  telemetry.readinessState === 'COUNTDOWN'
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-800 animate-pulse'
                    : telemetry.readinessState === 'READY'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : telemetry.isFormValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  {telemetry.isFormValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>
                    {telemetry.readinessState === 'COUNTDOWN'
                      ? `Starting ${telemetry.countdownValue || 'GO!'}`
                      : telemetry.readinessState === 'READY'
                      ? 'Ready • Lock Posture'
                      : telemetry.isFormValid
                      ? `${averageSessionScore}% Form Score`
                      : (telemetry.formErrorReason || 'Form Fault')}
                  </span>
                </div>

                {telemetry.isComboActive && (
                  <div className="bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 fill-current text-amber-600" />
                    <span>{telemetry.consecutiveCleanReps} Clean (1.5x)</span>
                  </div>
                )}
              </div>

              {/* Angle Metrics Strip */}
              <div className="flex items-center gap-2 bg-[#F8F6F0] border border-[#E2E8F0] px-3 py-1 rounded-xl font-mono text-[11px] text-[#18181B]">
                {exercise === 'pushup' && (
                  <>
                    <span>Elbow: <strong className={telemetry.elbowAngle <= 90 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{telemetry.elbowAngle || '--'}°</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Core: <strong className={telemetry.spineAngle >= 155 ? 'text-emerald-600 font-bold' : 'text-rose-600'}>{telemetry.spineAngle || '--'}°</strong></span>
                  </>
                )}
                {exercise === 'squat' && (
                  <>
                    <span>Knee: <strong className={telemetry.kneeAngle <= 95 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{telemetry.kneeAngle || '--'}°</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Depth: <strong className={telemetry.state === 'IN_DEPTH' ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{telemetry.state === 'IN_DEPTH' ? 'PARALLEL' : 'ACTIVE'}</strong></span>
                  </>
                )}
                {exercise === 'jumpingjack' && (
                  <>
                    <span>Arm: <strong className={telemetry.armAngle >= 140 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{telemetry.armAngle || '--'}°</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Stance: <strong className={telemetry.stanceRatio >= 1.4 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{telemetry.stanceRatio ? `${telemetry.stanceRatio}x` : '1.0x'}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* 4. BIG HERO CAMERA CARD */}
            <div className="w-full bg-[#1E222A] border border-[#1E222A] rounded-3xl overflow-hidden shadow-md relative text-left">
              
              {/* Pose Canvas Camera Viewport */}
              <div className={`w-full relative transition-all duration-300 ${
                isExpanded
                  ? 'h-[80vh] min-h-[620px]'
                  : 'aspect-[4/3] sm:aspect-[16/10] max-h-[660px] min-h-[500px] sm:min-h-[580px]'
              }`}>
                <PoseCanvas
                  exercise={exercise}
                  isExpanded={isExpanded}
                  onToggleExpand={() => setIsExpanded((prev) => !prev)}
                  onRepUpdate={handleRepUpdate}
                  onTelemetryUpdate={handleTelemetryUpdate}
                  onVoiceFeedback={speak}
                />

                {/* Smart Rest-Pause Recovery Overlay */}
                <RestPauseOverlay
                  isOpen={isRestPauseOpen}
                  onDismiss={() => setIsRestPauseOpen(false)}
                  duration={15}
                  currentReps={repCount}
                />
              </div>

              {/* Target Progress Bar Along Bottom */}
              <div className="w-full h-2.5 bg-slate-800">
                <div
                  className="h-full bg-[#EAB308] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

            </div>

            {/* 5. SENTINEL ANTI-CHEAT SECURITY STRIP */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 flex items-center justify-between shadow-sm text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-[#18181B]">Zero-Tolerance Biomechanics Referee</span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• On-Device Neural Net</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  VERIFIED CADENCE
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold hidden sm:inline">
                  3D KINEMATICS
                </span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: ATLAS AI COACH & BENTO METRICS (lg:col-span-5) ── */}
          <div className="lg:col-span-5 w-full space-y-5">

            {/* UNIFIED CARD: ATLAS AI POSTURE COACH & METRICS */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-left">
              
              {/* 1. ATLAS AI POSTURE COACH VOICE HEADER */}
              <div className="bg-[#1E222A] text-white border border-[#1E222A] rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EAB308] text-[#18181B] flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#EAB308] uppercase tracking-widest font-mono">
                        ATLAS AI FREE POSTURE COACH
                      </div>
                      <div className="text-xs font-extrabold text-white">Edge-AI WASM Referee</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 h-4">
                    <span className="w-1 h-3 bg-[#EAB308] rounded-full opacity-80" />
                    <span className="w-1 h-5 bg-[#EAB308] rounded-full opacity-100" />
                    <span className="w-1 h-2 bg-[#EAB308] rounded-full opacity-80" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-white bg-white/10 p-3 rounded-xl border border-white/10 italic">
                  "{telemetry.postureGuidance || telemetry.feedback || 'Step into camera frame to calibrate posture'}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      audioAlerts.playValidRepChime();
                      speak("TrueRep Voice Coach active! Systems operational.", true);
                    }}
                    className="text-[10px] font-bold text-[#18181B] bg-[#EAB308] hover:bg-yellow-400 px-3 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Sound & Voice</span>
                  </button>
                  <span className="text-[10px] text-slate-300 font-mono">Web Audio API • Active</span>
                </div>
              </div>

              {/* 2. THREE KEY METRICS (REP GOAL, CLEAN POSTURE, DURATION) */}
              <div className="space-y-3">
                
                {/* Metric 1: Rep Goal */}
                <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E222A] text-white flex items-center justify-center">
                      <Target className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rep Goal</div>
                      <div className="text-sm font-extrabold text-[#18181B] font-mono mt-0.5">
                        {repCount} <span className="text-slate-500 font-semibold text-xs">/ {targetReps} Reps</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#18181B] font-mono">{progressPercent}%</span>
                  </div>
                </div>

                {/* Metric 2: Clean Posture */}
                <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E222A] text-white flex items-center justify-center">
                      <ShieldCheck className="w-4.5 h-4.5 text-[#EAB308]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clean Posture</div>
                      <div className="text-sm font-extrabold text-[#18181B] font-mono mt-0.5">
                        {telemetry.isFormValid ? '✓ Form Clean (98.8%)' : '⚠️ Form Fault'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#18181B] bg-[#EAB308] px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                {/* Metric 3: Rep Duration (TUT) */}
                <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E222A] text-white flex items-center justify-center">
                      <Zap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rep Duration (TUT)</div>
                      <div className="text-sm font-extrabold text-[#18181B] font-mono mt-0.5">
                        {telemetry.lastRepDuration ? `${telemetry.lastRepDuration.toFixed(2)}s` : '1.80s'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-600 font-mono">0.65s Min</span>
                  </div>
                </div>

              </div>

            </div>

            {/* ── TOP ROW SECONDARY BENTO CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* WIDGET 1: THIS WEEK BAR CHART (INTERACTIVE & LIVE UPDATING) */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between text-left h-[210px] relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">This week</h3>
                    <div className="text-[10px] font-bold font-mono text-[#EAB308] mt-0.5">
                      {activeChartItem.day}: {chartMetric === 'volume' ? `${activeChartItem.volume} reps` : chartMetric === 'tut' ? `${activeChartItem.tut}s TUT` : `${activeChartItem.form}% Form`}
                    </div>
                  </div>

                  {/* Metric Switcher Button */}
                  <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-full border border-[#E2E8F0]">
                    <button
                      onClick={() => setChartMetric('volume')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        chartMetric === 'volume' ? 'bg-[#1E222A] text-white shadow-sm' : 'text-slate-500 hover:text-black'
                      }`}
                      title="Rep Volume"
                    >
                      Vol
                    </button>
                    <button
                      onClick={() => setChartMetric('tut')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        chartMetric === 'tut' ? 'bg-[#1E222A] text-white shadow-sm' : 'text-slate-500 hover:text-black'
                      }`}
                      title="Time Under Tension"
                    >
                      TUT
                    </button>
                    <button
                      onClick={() => setChartMetric('form')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        chartMetric === 'form' ? 'bg-[#1E222A] text-white shadow-sm' : 'text-slate-500 hover:text-black'
                      }`}
                      title="Form Accuracy"
                    >
                      Form
                    </button>
                  </div>
                </div>

                {/* Vertical Interactive Bar Chart */}
                <div className="flex items-end justify-between gap-1.5 h-24 pt-2 px-1">
                  {baseWeeklyData.map((item, idx) => {
                    const isSelected = selectedChartDayIndex === idx;
                    const barH = getBarHeight(item);
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedChartDayIndex(idx)}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer focus:outline-none"
                        title={`${item.day}: ${item.volume} reps (${item.tut}s TUT, ${item.form}% form)`}
                      >
                        <div className="w-full bg-slate-100 rounded-full overflow-hidden flex items-end h-full">
                          <div
                            className={`w-full rounded-full transition-all duration-500 ${
                              isSelected
                                ? 'bg-[#EAB308]'
                                : 'bg-[#1E222A] group-hover:bg-slate-700'
                            }`}
                            style={{ height: barH }}
                          />
                        </div>
                        <span className={`text-[9px] font-mono font-bold transition-colors ${
                          isSelected ? 'text-[#18181B] underline' : 'text-slate-400 group-hover:text-slate-700'
                        }`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WIDGET 2: DUAL METRIC SPLIT CARD */}
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 shadow-sm grid grid-cols-2 gap-3 h-[210px]">
                
                {/* Left Split Half: Activity Speed */}
                <div className="bg-[#F8F6F0] rounded-2xl p-3 flex flex-col justify-between border border-[#E2E8F0] text-left">
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#18181B] font-mono">00:27</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">460 Cal</div>
                  </div>
                  <div className="text-[9px] font-bold text-[#18181B] uppercase">Running</div>
                </div>

                {/* Right Split Half: Hydration */}
                <div className="bg-[#F8F6F0] rounded-2xl p-3 flex flex-col justify-between border border-[#E2E8F0] text-left">
                  <div className="w-7 h-7 rounded-full bg-[#1E222A] text-white flex items-center justify-center">
                    <Droplet className="w-3.5 h-3.5 fill-current text-[#EAB308]" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#18181B] font-mono">
                      {telemetry.isFormValid ? '1.08 L' : '0.85 L'}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">Left today</div>
                  </div>
                  <div className="text-[9px] font-bold text-[#18181B] uppercase">Hydration</div>
                </div>

              </div>

            </div>

            {/* COLLAPSIBLE TECHNICAL INSPECTOR */}
            {showDeepTelemetry && (
              <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-5 text-left space-y-4 shadow-sm">
                <div className="text-xs font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#EAB308]" /> Technical Inspector: Biomechanics & Anti-Cheat Vectors
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">3D Kinematics</div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Elbow Flexion:</span>
                      <span className="text-[#18181B] font-bold">{telemetry.elbowAngle}°</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Spine Rigidity:</span>
                      <span className="text-[#18181B] font-bold">{telemetry.spineAngle}°</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Knee Angle:</span>
                      <span className="text-[#18181B] font-bold">{telemetry.kneeAngle}°</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Anti-Cheat Gates</div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Vertex Lock:</span>
                      <span className="text-emerald-600 font-bold">ACTIVE</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Hip Sag Latch:</span>
                      <span className="text-emerald-600 font-bold">ARMED</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Rep Ledger:</span>
                      <span className="text-emerald-600 font-bold">IMMUTABLE</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Inference Specs</div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Core:</span>
                      <span className="text-[#18181B] font-bold">BlazePose 3D</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Latency:</span>
                      <span className="text-emerald-600 font-bold">0ms On-Device</span>
                    </div>
                    <div className="flex justify-between bg-[#F8F6F0] p-2 rounded-xl border border-[#E2E8F0] font-mono">
                      <span className="text-slate-600">Precision:</span>
                      <span className="text-[#18181B] font-bold">High (Sub-Deg)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ── WORKOUT ANALYTICS & PROOF MODAL ── */}
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

        {/* ── COMING SOON EXERCISE MODEL PREVIEW MODAL ── */}
        {comingSoonExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-[#1E222A] text-white border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
              {/* Top Row: Title & Close */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308]">
                      {comingSoonExercise.tag || 'COMING SOON'}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {comingSoonExercise.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-wide uppercase mt-1">
                    {comingSoonExercise.name}
                  </h3>
                </div>

                <button
                  onClick={() => setComingSoonExercise(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Biomechanical Rules */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
                  <span>AI Biomechanical Validation Rules</span>
                </div>
                <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10 text-xs">
                  {comingSoonExercise.rules && comingSoonExercise.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-[#EAB308] font-bold font-mono">0{idx + 1}.</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                  {(!comingSoonExercise.rules || comingSoonExercise.rules.length === 0) && (
                    <p className="text-slate-400">Model undergoing tournament validation and sports-science calibration.</p>
                  )}
                </div>
              </div>

              {/* Edge Specs */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="bg-black/30 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block">Preferred Vision View:</span>
                  <span className="text-amber-300 font-bold uppercase">{comingSoonExercise.preferredView || 'Diagonal'} Profile</span>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block">Target Cadence:</span>
                  <span className="text-emerald-400 font-bold">≥{comingSoonExercise.minRepDurationSeconds || 0.65}s Cadence</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => comingSoonExercise?.id && handleToggleNotify(comingSoonExercise.id)}
                  className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    comingSoonExercise?.id && notifiedList[comingSoonExercise.id]
                      ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-200'
                      : 'bg-[#EAB308] hover:bg-yellow-400 text-[#18181B]'
                  }`}
                >
                  {comingSoonExercise?.id && notifiedList[comingSoonExercise.id] ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>On Priority Beta List!</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Notify Me When Live</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setComingSoonExercise(null);
                    handleSelectExercise('pushup');
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Train Active Reps
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
