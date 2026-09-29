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
  ShieldCheck,
  ShieldAlert,
  Target,
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
  Droplet,
  User,
  Sliders,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import iconTradApps from '../assets/icon_trad_apps.svg';
import iconImprove from '../assets/icon_improve.svg';
import iconPulse from '../assets/icon_pulse.svg';
import PoseCanvas from './camera/PoseCanvas';
import { RestPauseOverlay, WorkoutAnalyticsModal } from './workout';
import { useWebSpeech, useAuth } from '../hooks';
import { audioAlerts } from '../utils';
import { EXERCISE_CONFIGS } from '../ai';

export default function AICoachPage() {
  const { addXP, profile, updateProfile } = useAuth();
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
      } catch { }
      return next;
    });
  };

  // Solo Challenge Engine & Timers
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

  // Smart Rest-Pause Detection
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
    setIsSessionActive(true);
  }, []);

  const averageSessionScore = useMemo(() => {
    if (!telemetry.repHistory || telemetry.repHistory.length === 0) {
      return telemetry.formScore || 98.8;
    }
    const scores = telemetry.repHistory
      .filter((r) => r.valid && r.score)
      .map((r) => r.score);
    if (scores.length === 0) return telemetry.formScore || 98.8;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [telemetry.repHistory, telemetry.formScore]);

  const [hasClaimedCurrentSessionXP, setHasClaimedCurrentSessionXP] = useState(false);

  // Sync Active AI Telemetry to localStorage
  useEffect(() => {
    if (repCount > 0) {
      const activeData = {
        exercise: exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Parallel Squats' : 'Jumping Jacks',
        reps: repCount,
        tut: elapsedSeconds,
        formScore: (averageSessionScore / 100) || 0.98,
        intensity: 1.0,
        timestamp: Date.now()
      };
      try {
        localStorage.setItem('truerep_active_ai_telemetry', JSON.stringify(activeData));
        window.dispatchEvent(new Event('truerep_ai_telemetry_updated'));
      } catch { }
    }
  }, [repCount, elapsedSeconds, exercise, averageSessionScore]);

  // Automated XP Granting
  const autoClaimSessionXP = useCallback(async () => {
    if (repCount === 0 || hasClaimedCurrentSessionXP) return;
    setHasClaimedCurrentSessionXP(true);

    const exerciseName = exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Parallel Squats' : 'Jumping Jacks';
    const formScore = (averageSessionScore / 100) || 0.98;
    const intensity = 1.0;
    const xpEarned = Math.round(((elapsedSeconds * 2) + (repCount * 10)) * formScore * intensity);
    const tokensEarned = Math.floor(xpEarned * 0.1);

    if (addXP) {
      const res = await addXP(elapsedSeconds, repCount, formScore, intensity);
      if (!res && updateProfile && profile) {
        const newTotalXP = (profile.total_xp || 3420) + xpEarned;
        const newTokens = (profile.rep_tokens || 1840) + tokensEarned;
        const newLevel = Math.floor(newTotalXP / 250) + 1;
        await updateProfile({
          total_xp: newTotalXP,
          rep_tokens: newTokens,
          current_level: newLevel
        });
      }
    }

    const sessionEntry = {
      id: Date.now(),
      type: 'exercise',
      name: `AI Coach: ${exerciseName}`,
      detail: `${repCount} Reps • ${elapsedSeconds}s TUT • ${Math.round(formScore * 100)}% Form • +${xpEarned} XP`,
      iconName: 'Dumbbell',
      isAIVerified: true,
      timestamp: Date.now()
    };

    try {
      const existingHistory = JSON.parse(localStorage.getItem('truerep_workout_history') || '[]');
      localStorage.setItem('truerep_workout_history', JSON.stringify([sessionEntry, ...existingHistory]));
      window.dispatchEvent(new Event('truerep_session_logged'));
    } catch { }
  }, [repCount, elapsedSeconds, exercise, averageSessionScore, hasClaimedCurrentSessionXP, addXP, updateProfile, profile]);

  useEffect(() => {
    if (isAnalyticsOpen) {
      autoClaimSessionXP();
    }
  }, [isAnalyticsOpen, autoClaimSessionXP]);

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
    setHasClaimedCurrentSessionXP(false);
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
    setHasClaimedCurrentSessionXP(false);
    repHistoryRef.current = [];
    try {
      localStorage.removeItem('truerep_active_ai_telemetry');
    } catch { }
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

  const progressPercent = Math.min(100, Math.round((repCount / targetReps) * 100));

  // Dynamic Weekly Workout Chart State
  const [selectedChartDayIndex, setSelectedChartDayIndex] = useState(4); // Thursday
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
    return `${Math.min(100, Math.max(18, Math.round((value / maxVal) * 100)))}%`;
  };

  const activeChartItem = baseWeeklyData[selectedChartDayIndex];

  return (
    <div className="w-full bg-zinc-950 text-white min-h-[calc(100vh-80px)] flex flex-col justify-start items-center overflow-x-hidden pt-4 pb-16 select-none font-sans">
      <div className="w-full max-w-[1408px] px-4 sm:px-6 lg:px-10 flex flex-col justify-start items-start gap-6">

        {/* ── MAIN DASHBOARD LAYOUT ── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN: CAMERA WORKSPACE (lg:col-span-7) ── */}
          <div className="lg:col-span-7 w-full flex flex-col justify-start items-start gap-4">

            {/* Inner Fiery Red Gradient Camera Card */}
            <div className="w-full bg-gradient-to-b from-black via-[#700000] via-60% to-[#FF3B00] rounded-[44px] sm:rounded-[64px] lg:rounded-[80px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-6 sm:p-8 space-y-6 relative overflow-hidden text-left">

              {/* Subtitle & Voice Controls Row */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col justify-start items-start gap-1 max-w-md">
                  <div className="text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    {telemetry.state === 'IDLE' ? 'STEP INTO FRAME AND START CAMERA' : 'POSTURE CALIBRATION & TRACKING ACTIVE'}
                  </div>
                  <div className="text-white text-sm sm:text-base font-normal font-['Arial_MT_Pro'] leading-5">
                    BlazePose 3D with Irreversible Error Latching & Bilateral Anti-Cheat
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      audioAlerts.playValidRepChime();
                      speak("TrueRep Voice Coach active! Systems operational.", true);
                    }}
                    title="Test Sound & Voice"
                    className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-all flex items-center justify-center text-zinc-900 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.30)] cursor-pointer active:scale-95 shrink-0"
                  >
                    <Volume2 className="w-4.5 h-4.5" />
                  </button>

                  <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-2 text-xs text-white font-['Arial_MT_Pro']">
                    <div className={`w-2.5 h-2.5 rounded-full ${voiceEnabled ? 'bg-yellow-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span>Web Audio API • {voiceEnabled ? 'Active' : 'Muted'}</span>
                  </div>
                </div>
              </div>

              {/* Viewport Box (PoseCanvas Camera Feed & Reticles + Laser HUD) */}
              <div className="w-full relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] rounded-[36px] sm:rounded-[56px] overflow-hidden flex flex-col justify-center items-center bg-black border border-white/10 shadow-2xl">

                {/* Reticle Corner Markers (Yellow L-Brackets) */}
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-yellow-500 pointer-events-none z-20" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-yellow-500 pointer-events-none z-20" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-yellow-500 pointer-events-none z-20" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-yellow-500 pointer-events-none z-20" />

                {/* Real PoseCanvas Vision Pipeline Component */}
                <PoseCanvas
                  exercise={exercise}
                  isExpanded={isExpanded}
                  isSessionActive={isSessionActive}
                  onToggleExpand={() => setIsExpanded((prev) => !prev)}
                  onRepUpdate={handleRepUpdate}
                  onTelemetryUpdate={handleTelemetryUpdate}
                  onVoiceFeedback={speak}
                />

                {/* HUD Bottom Left Label Overlay */}
                <div className="absolute bottom-8 left-8 z-20 flex flex-col justify-start items-start pointer-events-none">
                  <div className="text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4">
                    CAMERA PREVIEW
                  </div>
                  <div className="text-white text-sm font-normal font-['Arial_MT_Pro'] leading-4">
                    {telemetry.postureGuidance || 'Center yourself in the frame'}
                  </div>
                </div>

                {/* Rest Pause Overlay */}
                <RestPauseOverlay
                  isOpen={isRestPauseOpen}
                  onDismiss={() => setIsRestPauseOpen(false)}
                  duration={15}
                  currentReps={repCount}
                />

              </div>

              {/* Bottom Controls Bar */}
              <div className="w-full flex items-center justify-between gap-4 pt-1">
                <div className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full outline outline-1 outline-white/20 inline-flex items-center gap-2">
                  <div className="text-white text-xs font-normal font-['Arial_MT_Pro'] leading-4">
                    {exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Squats' : 'Jumping Jacks'}
                  </div>
                </div>

                <button
                  onClick={toggleSession}
                  className="px-8 py-3.5 bg-white hover:bg-yellow-400 text-zinc-900 rounded-full shadow-[0px_10px_24px_0px_rgba(0,0,0,0.30)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer font-['Arial_MT_Pro'] text-xs font-bold uppercase tracking-wider active:scale-95"
                >
                  <span>{isSessionActive ? 'PAUSE AI CAMERA' : 'START AI CAMERA'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: EXERCISE CONTROL & BENTO METRICS (lg:col-span-5) ── */}
          <div className="lg:col-span-5 w-full flex flex-col justify-start items-start gap-6">

            {/* CARD 1: EXERCISE SELECTION */}
            <div className="w-full bg-black rounded-[44px] sm:rounded-[60px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-5 sm:p-6 space-y-4 text-center">
              <div className="w-full flex items-center justify-center gap-3">
                <div className="text-yellow-500 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">
                  EXERCISE SELECTION
                </div>
                <div className="px-4 py-1.5 bg-black/60 border border-white/10 rounded-full text-white text-xs font-normal font-['Arial_MT_Pro']">
                  {exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Squats' : 'Jumping Jacks'}
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSelectExercise('pushup')}
                  className={`py-3 px-4 rounded-full text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] transition-all flex items-center justify-center cursor-pointer ${exercise === 'pushup'
                    ? 'bg-yellow-500 text-zinc-900 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.30)] font-bold'
                    : 'bg-black/80 text-slate-300 hover:text-white border border-white/10'
                    }`}
                >
                  Push-Ups
                </button>

                <button
                  onClick={() => handleSelectExercise('squat')}
                  className={`py-3 px-4 rounded-full text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] transition-all flex items-center justify-center cursor-pointer ${exercise === 'squat'
                    ? 'bg-yellow-500 text-zinc-900 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.30)] font-bold'
                    : 'bg-black/80 text-slate-300 hover:text-white border border-white/10'
                    }`}
                >
                  Squats
                </button>

                <button
                  onClick={() => handleSelectExercise('jumpingjack')}
                  className={`py-3 px-4 rounded-full text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] transition-all flex items-center justify-center cursor-pointer ${exercise === 'jumpingjack'
                    ? 'bg-yellow-500 text-zinc-900 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.30)] font-bold'
                    : 'bg-black/80 text-slate-300 hover:text-white border border-white/10'
                    }`}
                >
                  Jumping Jacks
                </button>
              </div>
            </div>

            {/* CARD 2: COACHING FEEDBACK */}
            <div className="w-full bg-black rounded-[44px] sm:rounded-[60px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-5 sm:p-6 space-y-3.5 text-left">
              <div className="w-full flex items-center justify-center gap-3">
                <div className="text-yellow-500 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">
                  COACHING FEEDBACK
                </div>
                <div className="px-4 py-1.5 bg-yellow-500 rounded-full text-zinc-900 text-xs font-normal font-['Arial_MT_Pro']">
                  Active
                </div>
              </div>

                {/* Row 1: REP GOAL */}
                <div className="w-full p-3.5 bg-white/5 rounded-[28px] sm:rounded-[36px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#1e2638] rounded-full flex items-center justify-center shrink-0 border border-slate-700/30">
                      <img src={iconTradApps} alt="Rep Goal Dumbbell" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-slate-400 text-[10px] sm:text-[11px] font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">REP GOAL</div>
                      <div className="text-white text-base sm:text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                        {repCount} / {targetReps} Reps
                      </div>
                    </div>
                  </div>
                  <div className="text-white text-base sm:text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                    {progressPercent}%
                  </div>
                </div>

                {/* Row 2: CLEAN POSTURE */}
                <div className="w-full p-3.5 bg-white/5 rounded-[28px] sm:rounded-[36px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#1e2638] rounded-full flex items-center justify-center shrink-0 border border-slate-700/30">
                      <img src={iconImprove} alt="Clean Posture Arrow" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-slate-400 text-[10px] sm:text-[11px] font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">CLEAN POSTURE</div>
                      <div className="text-white text-base sm:text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                        ✓ Form Clean ({averageSessionScore}%)
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-1 bg-yellow-500 rounded-full text-zinc-900 text-xs font-normal font-['Arial_MT_Pro']">
                    Active
                  </div>
                </div>

                {/* Row 3: REP DURATION (TUT) */}
                <div className="w-full p-3.5 bg-white/5 rounded-[28px] sm:rounded-[36px] shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#1e2638] rounded-full flex items-center justify-center shrink-0 border border-slate-700/30">
                      <img src={iconPulse} alt="Rep Duration Pulse" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-slate-400 text-[10px] sm:text-[11px] font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">REP DURATION (TUT)</div>
                      <div className="text-white text-base sm:text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                        {telemetry.lastRepDuration ? `${telemetry.lastRepDuration.toFixed(2)}s` : '1.80s'}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] leading-4">
                    0.65s Min
                  </div>
                </div>
              </div>

            {/* CARD 3: WEEKLY ACTIVITY */}
            <div className="w-full bg-black rounded-[44px] sm:rounded-[60px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-5 sm:p-6 space-y-4 text-left">
              <div className="w-full flex items-center justify-center gap-3">
                <div className="text-yellow-500 text-xs sm:text-sm font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">
                  WEEKLY ACTIVITY
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setChartMetric('volume')}
                    className={`px-3 py-1 rounded-full text-[10px] font-normal font-['Arial_MT_Pro'] transition-all cursor-pointer ${chartMetric === 'volume' ? 'bg-white text-zinc-900 font-bold' : 'bg-black/60 border border-white/10 text-slate-300'}`}
                  >
                    Vol
                  </button>
                  <button
                    onClick={() => setChartMetric('tut')}
                    className={`px-3 py-1 rounded-full text-[10px] font-normal font-['Arial_MT_Pro'] transition-all cursor-pointer ${chartMetric === 'tut' ? 'bg-white text-zinc-900 font-bold' : 'bg-black/60 border border-white/10 text-slate-300'}`}
                  >
                    TUT
                  </button>
                  <button
                    onClick={() => setChartMetric('form')}
                    className={`px-3 py-1 rounded-full text-[10px] font-normal font-['Arial_MT_Pro'] transition-all cursor-pointer ${chartMetric === 'form' ? 'bg-white text-black font-bold' : 'bg-black/60 border border-white/10 text-slate-300'}`}
                  >
                    Form
                  </button>
                </div>
              </div>

              {/* 7-Day Bar Chart */}
              <div className="w-full flex items-end justify-between gap-2 h-28 pt-2">
                {baseWeeklyData.map((item, idx) => {
                  const isSelected = selectedChartDayIndex === idx;
                  const barH = getBarHeight(item);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedChartDayIndex(idx)}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group focus:outline-none"
                    >
                      <div className="w-full bg-[#1c2230] rounded-full overflow-hidden flex items-end h-full">
                        <div
                          className={`w-full rounded-full transition-all duration-300 ${isSelected ? 'bg-yellow-500' : 'bg-[#252c3d] group-hover:bg-[#2e374d]'}`}
                          style={{ height: barH }}
                        />
                      </div>
                      <span className={`text-[10px] font-normal font-['Arial_MT_Pro'] ${isSelected ? 'text-white underline font-bold' : 'text-slate-400'}`}>
                        {item.day}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Chart Stats */}
              <div className="w-full flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-col gap-0.5">
                  <div className="text-yellow-500 text-xs font-normal font-['Arial_MT_Pro'] uppercase leading-4 tracking-wider">THIS WEEK</div>
                  <div className="text-white text-base sm:text-lg font-normal font-['Arial_MT_Pro'] leading-6">
                    {activeChartItem.day}: {chartMetric === 'volume' ? `${activeChartItem.volume} reps` : chartMetric === 'tut' ? `${activeChartItem.tut}s TUT` : `${activeChartItem.form}% Form`}
                  </div>
                </div>

                <div className="px-4 py-1.5 bg-black/60 border border-white/10 rounded-full text-white text-xs font-normal font-['Arial_MT_Pro']">
                  Volume
                </div>
              </div>
            </div>

            {/* CARD 4: QUICK TELEMETRY WIDGETS (RUNNING & HYDRATION) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Widget 1: Running */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1a1d26] to-[#090b10] rounded-[44px] sm:rounded-[56px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-between items-center text-center gap-3 relative overflow-hidden">
                <div className="text-slate-300 text-xs font-normal font-['Arial_MT_Pro']">460 Cal</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FF4560] rounded-full flex items-center justify-center shrink-0 shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal font-['Arial_MT_Pro'] leading-none">00:27</div>
                </div>
                <div className="text-white text-sm sm:text-base font-normal font-['Arial_MT_Pro'] uppercase tracking-wider">
                  RUNNING
                </div>
              </div>

              {/* Widget 2: Hydration */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1a1d26] to-[#090b10] rounded-[44px] sm:rounded-[56px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-between items-center text-center gap-3 relative overflow-hidden">
                <div className="text-slate-300 text-xs font-normal font-['Arial_MT_Pro']">Left Today</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#38BDF8] rounded-full flex items-center justify-center shrink-0 shadow-lg">
                    <Droplet className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal font-['Arial_MT_Pro'] leading-none">1.07L</div>
                </div>
                <div className="text-white text-sm sm:text-base font-normal font-['Arial_MT_Pro'] uppercase tracking-wider">
                  HYDRATION
                </div>
              </div>

            </div>

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
      </div>
    </div>
  );
}
