import React, { useState, useCallback } from 'react';
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
  Target,
  Dumbbell,
  Droplet,
  User,
  Sliders
} from 'lucide-react';
import PoseCanvas from './camera/PoseCanvas';
import { useWebSpeech } from '../hooks';
import { audioAlerts } from '../utils';

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
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (next) {
        speak("Voice referee enabled! Ready for posture tracking.", true);
      }
      return next;
    });
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
    return `${Math.min(100, Math.max(18, Math.round((value / maxVal) * 100)))}%`;
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
              onClick={() => setShowDeepTelemetry(prev => !prev)}
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

          {/* ── LEFT COLUMN: EXERCISE SELECTOR & BIG HERO CAMERA BOX (lg:col-span-7) ── */}
          <div className="lg:col-span-7 w-full space-y-4">
            
            {/* ── EXERCISE SELECTOR PILL BOX (ABOVE LEFT CAMERA CARD) ── */}
            <div className="w-full bg-white border border-[#E2E8F0] p-1.5 rounded-2xl sm:rounded-full shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => setExercise('pushup')}
                  className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    exercise === 'pushup'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Push-Ups</span>
                </button>

                <button
                  onClick={() => setExercise('squat')}
                  className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    exercise === 'squat'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Squats</span>
                </button>

                <button
                  onClick={() => setExercise('jumpingjack')}
                  className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    exercise === 'jumpingjack'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Jumping Jacks</span>
                </button>
              </div>
            </div>

            {/* BIG HERO CAMERA CARD */}
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
                  onToggleExpand={() => setIsExpanded(prev => !prev)}
                  onRepUpdate={handleRepUpdate}
                  onTelemetryUpdate={handleTelemetryUpdate}
                  onVoiceFeedback={speak}
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

          </div>

          {/* ── RIGHT COLUMN: COMBINED AI COACH & METRICS (lg:col-span-5) ── */}
          <div className="lg:col-span-5 w-full space-y-5">

            {/* ── UNIFIED CARD: ATLAS AI POSTURE COACH & METRICS (ONE BOX) ── */}
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

              {/* 2. THREE KEY METRICS (REP GOAL, CLEAN POSTURE, DURATION) INSIDE THE SAME BOX */}
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

                  {/* Metric Switcher Button (Volume / TUT / Form) */}
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
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 shadow-sm grid grid-cols-2 gap-3 h-[200px]">
                
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
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

