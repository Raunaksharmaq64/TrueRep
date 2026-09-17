import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Activity, 
  Copy, 
  Sparkles,
  MoreHorizontal,
  ArrowUpRight,
  Footprints,
  Play,
  Pause,
  Scale,
  Swords,
  Dumbbell,
  CheckCircle2,
  Wind,
  Gauge,
  Plus,
  X,
  SlidersHorizontal,
  Check,
  RotateCcw
} from 'lucide-react';
import userAvatar from '../assets/athlete.jpg';

export default function ProfilePage() {
  const [copiedId, setCopiedId] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(1096); // 00:18:16
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Mon
  const [unit, setUnit] = useState('kg'); // 'kg' | 'lbs'
  const [targetWeight, setTargetWeight] = useState(70); // in kg
  const [activityModeIndex, setActivityModeIndex] = useState(0);
  const [activeAttributeModal, setActiveAttributeModal] = useState(null); // 'stamina' | 'strength' | 'agility' | null
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(3); // April (0-indexed 3)

  // Custom Workout Logs List State
  const [historyLogs, setHistoryLogs] = useState([
    { id: 1, type: 'exercise', name: 'Push-Ups', detail: '50 Reps • 99%', icon: Dumbbell, color: 'text-emerald-700' },
    { id: 2, type: 'duel', name: 'vs Elena', detail: '+24 ELO', icon: Swords, color: 'text-[#18181B]' },
    { id: 3, type: 'exercise', name: 'Squats', detail: '42 Reps • 98%', icon: Dumbbell, color: 'text-emerald-700' },
  ]);

  // New Workout Log Form State
  const [newLogName, setNewLogName] = useState('');
  const [newLogDetail, setNewLogDetail] = useState('');

  // Live Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTracking) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Formatter for HH:MM:SS
  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText('TR-8842-CYBER');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Activity Modes
  const activityModes = [
    { name: 'Running', distance: '3.37 km', icon: Footprints },
    { name: 'Cycling', distance: '12.4 km', icon: Wind },
    { name: 'Rep Training', distance: '450 reps', icon: Dumbbell },
  ];

  const currentActivity = activityModes[activityModeIndex];

  const handleCycleActivity = () => {
    setActivityModeIndex((prev) => (prev + 1) % activityModes.length);
  };

  // Weekly Data for Calendar Strip
  const weeklyData = [
    { day: 'Mon', date: '17', stamina: 88, strength: 92, agility: 84, distance: '3.37 km', form: '98.2%', winRate: '78.4%' },
    { day: 'Tue', date: '18', stamina: 90, strength: 94, agility: 86, distance: '5.12 km', form: '99.0%', winRate: '80.1%' },
    { day: 'Wed', date: '19', stamina: 85, strength: 89, agility: 82, distance: '2.80 km', form: '97.5%', winRate: '76.5%' },
    { day: 'Thu', date: '20', stamina: 92, strength: 95, agility: 88, distance: '4.50 km', form: '98.8%', winRate: '79.0%' },
    { day: 'Fri', date: '21', stamina: 91, strength: 93, agility: 87, distance: '6.20 km', form: '99.2%', winRate: '82.0%' },
    { day: 'Sat', date: '22', stamina: 87, strength: 90, agility: 85, distance: '1.90 km', form: '96.8%', winRate: '75.0%' },
    { day: 'Sun', date: '23', stamina: 94, strength: 96, agility: 90, distance: '7.10 km', form: '99.5%', winRate: '84.5%' },
  ];

  const activeDayData = weeklyData[selectedDayIndex];

  // Weight Trend Months
  const monthlyWeightData = [
    { month: 'Jan', weightKg: 82, label: 'Jan, 82 kg' },
    { month: 'Feb', weightKg: 79, label: 'Feb, 79 kg' },
    { month: 'Mar', weightKg: 77, label: 'Mar, 77 kg' },
    { month: 'Apr', weightKg: 75, label: 'Apr, 75 kg' },
    { month: 'May', weightKg: 73, label: 'May, 73 kg' },
    { month: 'Jun', weightKg: 71, label: 'Jun, 71 kg' },
  ];

  const activeMonth = monthlyWeightData[selectedMonthIndex];

  const displayWeight = (kg) => {
    if (unit === 'lbs') {
      return `${Math.round(kg * 2.20462)} lbs`;
    }
    return `${kg} kg`;
  };

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    if (!newLogName.trim()) return;
    const newEntry = {
      id: Date.now(),
      type: 'exercise',
      name: newLogName.trim(),
      detail: newLogDetail.trim() || 'Verified Log',
      icon: Dumbbell,
      color: 'text-emerald-700'
    };
    setHistoryLogs([newEntry, ...historyLogs]);
    setNewLogName('');
    setNewLogDetail('');
    setShowAddLogModal(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F4F1EA] text-[#18181B] px-3 sm:px-6 lg:px-12 py-5 sm:py-7 select-none flex flex-col items-center">
      <div className="w-full max-w-7xl">

        {/* BENTO GRID DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">

          {/* ========================================================================= */}
          {/* CARD 1: TOP LEFT - HERO ATHLETE PROFILE CARD (lg:col-span-5)              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-[#1E222A] text-white border border-[#1E222A] min-h-[340px] sm:min-h-[380px] shadow-sm group flex flex-col justify-end p-6 sm:p-7">
            {/* Background Athlete Image */}
            <img 
              src={userAvatar} 
              alt="Alex Vance Profile" 
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700 opacity-60" 
            />
            
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E222A] via-[#1E222A]/60 to-transparent" />
            
            {/* Top Right Tier Pill */}
            <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
              <span className="bg-[#EAB308] text-[#18181B] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                ELITE ATHLETE • 2,510 ELO
              </span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="relative z-10 space-y-2 pr-14">
              <div className="text-[10px] font-bold text-[#EAB308] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                RANK #1 CANNON DIVISION
              </div>

              <h1 className="font-hero-slant text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight leading-none">
                UNLOCK YOUR POTENTIAL
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium tracking-wide pt-1">
                <span>Alex Vance</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#EAB308] font-mono">TR-8842-CYBER</span>
                <button onClick={handleCopyId} className="text-[#EAB308] hover:text-white p-0.5 transition-colors" title="Copy ID">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedId && <span className="text-emerald-400 text-[9px] font-bold">Copied!</span>}
              </div>
            </div>

            {/* Bottom-Right Round Logo Badge */}
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="absolute bottom-6 right-6 z-10 w-12 h-12 rounded-full bg-white text-[#18181B] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform hover:bg-[#EAB308]"
              title="Open Profile Settings"
            >
              TR
            </button>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: TOP RIGHT - DAILY ACTIVITY & ATTRIBUTES BARS (lg:col-span-7)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#18181B]" />
                <h2 className="text-base font-bold text-[#18181B] tracking-tight uppercase">
                  Daily Activity & Attributes
                </h2>
              </div>
              <button 
                onClick={() => setShowSettingsModal(true)} 
                className="text-slate-400 hover:text-black p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Options & Settings"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Weekly Calendar Strip (Clickable Interactive Day Selector) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-[#F8F6F0] p-2 rounded-2xl border border-[#E2E8F0] text-center">
              {weeklyData.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${
                    selectedDayIndex === idx 
                      ? 'bg-[#1E222A] text-white font-bold shadow-sm scale-105' 
                      : 'text-slate-500 hover:text-black hover:bg-slate-200/50'
                  }`}
                >
                  <div className="text-[10px] uppercase font-semibold">{item.day}</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{item.date}</div>
                </button>
              ))}
            </div>

            {/* Attribute Progress Rows */}
            <div className="space-y-3">

              {/* Stamina */}
              <div 
                onClick={() => setActiveAttributeModal('stamina')}
                className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-slate-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-[#1E222A] text-white">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Stamina</div>
                    <div className="text-xs font-bold text-[#18181B] font-mono mt-0.5">
                      {activeDayData.stamina}% <span className="text-slate-500 font-normal">/ Tier 4 • High Endurance</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Tier 4</div>
                    <div className="text-xs font-bold font-mono text-[#18181B]">{activeDayData.stamina}%</div>
                  </div>
                  <div className="w-20 sm:w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E222A] rounded-full transition-all duration-500" style={{ width: `${activeDayData.stamina}%` }} />
                  </div>
                  <div className="p-1.5 rounded-full bg-[#1E222A] text-white hover:bg-[#EAB308] hover:text-[#18181B] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Strength */}
              <div 
                onClick={() => setActiveAttributeModal('strength')}
                className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-slate-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-[#1E222A] text-[#EAB308]">
                    <Flame className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Strength</div>
                    <div className="text-xs font-bold text-[#18181B] font-mono mt-0.5">
                      {activeDayData.strength}% <span className="text-slate-500 font-normal">/ Tier 5 • 435W Power</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Tier 5</div>
                    <div className="text-xs font-bold font-mono text-[#18181B]">{activeDayData.strength}%</div>
                  </div>
                  <div className="w-20 sm:w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#EAB308] rounded-full transition-all duration-500" style={{ width: `${activeDayData.strength}%` }} />
                  </div>
                  <div className="p-1.5 rounded-full bg-[#1E222A] text-white hover:bg-[#EAB308] hover:text-[#18181B] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Agility */}
              <div 
                onClick={() => setActiveAttributeModal('agility')}
                className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-slate-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-[#1E222A] text-white">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Agility & Speed</div>
                    <div className="text-xs font-bold text-[#18181B] font-mono mt-0.5">
                      {activeDayData.agility}% <span className="text-slate-500 font-normal">/ Tier 4 • 52 reps/min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Tier 4</div>
                    <div className="text-xs font-bold font-mono text-[#18181B]">{activeDayData.agility}%</div>
                  </div>
                  <div className="w-20 sm:w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E222A] rounded-full transition-all duration-500" style={{ width: `${activeDayData.agility}%` }} />
                  </div>
                  <div className="p-1.5 rounded-full bg-[#1E222A] text-white hover:bg-[#EAB308] hover:text-[#18181B] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* CARD 3 & 4: BOTTOM LEFT STACK (COMBINED STATS & DISTANCE PILL) (lg:col-span-4) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">

            {/* CARD 3: Combined Average Good Form & Win Rate Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18181B]" />
                  AVERAGE FORM & WIN RATE
                </div>
                <span className="text-[9px] font-mono font-bold text-[#18181B] bg-[#EAB308] px-2 py-0.5 rounded-full">
                  AI VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3 rounded-2xl">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">AVG FORM</div>
                  <div className="text-2xl font-bold font-mono text-[#18181B] mt-0.5">{activeDayData.form}</div>
                  <div className="text-[9px] text-emerald-600 mt-0.5 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Posture Latch
                  </div>
                </div>

                <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3 rounded-2xl">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">WIN RATE</div>
                  <div className="text-2xl font-bold font-mono text-[#18181B] mt-0.5">{activeDayData.winRate}</div>
                  <div className="text-[9px] text-slate-600 mt-0.5 font-semibold">124 W / 32 L</div>
                </div>
              </div>
            </div>

            {/* CARD 4: Distance & Rivals */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ACTIVITY LOG</div>
                  <div className="text-2xl font-bold font-mono text-[#18181B] mt-0.5">
                    {activeDayData.distance}
                  </div>
                </div>

                {/* Overlapping Rival Avatar Stack */}
                <div className="flex -space-x-2 overflow-hidden" title="Top Rival Athletes">
                  <div className="inline-block h-8 w-8 rounded-full bg-[#1E222A] text-white text-xs font-bold flex items-center justify-center border border-white">
                    EV
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full bg-[#1E222A] text-white text-xs font-bold flex items-center justify-center border border-white">
                    MT
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full bg-[#1E222A] text-white text-xs font-bold flex items-center justify-center border border-white">
                    CL
                  </div>
                </div>
              </div>

              {/* Bottom Action Pill (Clickable Activity Switcher) */}
              <button 
                onClick={handleCycleActivity}
                className="bg-[#F8F6F0] border border-[#E2E8F0] p-2.5 rounded-2xl flex items-center justify-between hover:border-slate-400 transition-all text-left w-full group"
                title="Click to cycle activity mode"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-[#1E222A] text-white">
                    <currentActivity.icon className="w-4 h-4 text-[#EAB308]" />
                  </div>
                  <span className="text-xs font-bold text-[#18181B]">{currentActivity.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 font-bold group-hover:text-black">Switch</span>
                  <div className="p-1.5 rounded-full bg-[#1E222A] text-white group-hover:bg-[#EAB308] group-hover:text-[#18181B] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* CARD 5: BOTTOM MIDDLE - EXERCISE & DUELS HISTORY (lg:col-span-3)          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between shadow-sm text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  LIVE WORKOUT TIMER
                </div>
                <div className="text-2xl font-bold font-mono text-[#18181B] tracking-wider mt-0.5">
                  {formatTimer(timerSeconds)}
                </div>
              </div>
              <button 
                onClick={() => setShowAddLogModal(true)}
                className="p-2 rounded-full bg-[#1E222A] text-white hover:bg-[#EAB308] hover:text-[#18181B] transition-colors"
                title="Log New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Exercise & Duel History list */}
            <div className="space-y-2 text-xs font-mono text-left py-1 max-h-[160px] overflow-y-auto pr-1">
              {historyLogs.map(log => {
                const IconComponent = log.icon || Dumbbell;
                return (
                  <div key={log.id} className="flex justify-between items-center bg-[#F8F6F0] p-2 rounded-2xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="w-3 h-3 text-[#18181B]" />
                      <span className="text-[#18181B] font-bold">{log.name}</span>
                    </div>
                    <span className={`${log.color} text-[10px] font-bold`}>{log.detail}</span>
                  </div>
                );
              })}
            </div>

            {/* Media Controls Pill Bar (Working Stop / Pause / Reset) */}
            <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-2 rounded-2xl flex items-center justify-around">
              <button 
                onClick={() => { setIsTracking(false); setTimerSeconds(0); }}
                className="p-1.5 rounded-full bg-slate-200 text-slate-700 hover:text-black hover:bg-slate-300 transition-colors"
                title="Reset Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsTracking(prev => !prev)}
                className="p-1.5 px-3 rounded-full bg-[#1E222A] hover:bg-black text-white font-bold transition-all shadow-sm flex items-center gap-1.5 text-[11px]"
                title="Pause / Resume"
              >
                {isTracking ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isTracking ? 'Pause' : 'Start'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 6: BOTTOM RIGHT - WEIGHT LOSS / GOAL LINE CHART (lg:col-span-5)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-[#1E222A] text-white">
                  <Scale className="w-5 h-5 text-[#EAB308]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    WEIGHT TREND & TARGET
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#18181B] mt-0.5">
                    {displayWeight(targetWeight)} GOAL <span className="text-sm font-normal text-slate-500 font-sans">• 2,510 ELO</span>
                  </div>
                </div>
              </div>

              {/* Unit Toggle Button (KG / LBS) */}
              <button 
                onClick={() => setUnit(prev => prev === 'kg' ? 'lbs' : 'kg')}
                className="px-3 py-1 bg-[#1E222A] text-white text-[10px] font-bold rounded-full hover:bg-[#EAB308] hover:text-[#18181B] transition-colors font-mono"
                title="Toggle Unit (KG / LBS)"
              >
                {unit.toUpperCase()}
              </button>
            </div>

            {/* SVG Interactive Curve Line Chart */}
            <div className="relative w-full h-44 mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 350 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E222A" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1E222A" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1E222A" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#1E222A" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="20" x2="340" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="30" y1="55" x2="340" y2="55" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="30" y1="90" x2="340" y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="30" y1="125" x2="340" y2="125" stroke="#e2e8f0" />

                {/* Y-Axis Labels */}
                <text x="5" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">{unit === 'kg' ? '120' : '260'}</text>
                <text x="5" y="59" fill="#94a3b8" fontSize="10" fontFamily="monospace">{unit === 'kg' ? '100' : '220'}</text>
                <text x="5" y="94" fill="#94a3b8" fontSize="10" fontFamily="monospace">{unit === 'kg' ? '80' : '175'}</text>
                <text x="5" y="129" fill="#94a3b8" fontSize="10" fontFamily="monospace">{unit === 'kg' ? '40' : '90'}</text>

                {/* Area Fill */}
                <path 
                  d="M 40,75 Q 90,20 140,85 T 240,65 T 330,90 L 330,125 L 40,125 Z" 
                  fill="url(#chartGradient)" 
                />

                {/* Smooth Curve Line */}
                <path 
                  d="M 40,75 Q 90,20 140,85 T 240,65 T 330,90" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3.5" 
                  fill="none" 
                  strokeLinecap="round"
                />

                {/* Clickable Month Data Points */}
                {monthlyWeightData.map((m, i) => {
                  const cx = 40 + i * 58;
                  const cyArray = [75, 55, 85, 65, 70, 90];
                  const cy = cyArray[i];
                  const isSelected = selectedMonthIndex === i;

                  return (
                    <g key={m.month} onClick={() => setSelectedMonthIndex(i)} className="cursor-pointer">
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isSelected ? "6" : "4"} 
                        fill={isSelected ? "#EAB308" : "#1E222A"} 
                        stroke="#18181B" 
                        strokeWidth="2" 
                      />
                    </g>
                  );
                })}

                {/* Tooltip Badge for Selected Month */}
                {(() => {
                  const cxArray = [40, 98, 156, 214, 272, 330];
                  const cyArray = [75, 55, 85, 65, 70, 90];
                  const cx = cxArray[selectedMonthIndex];
                  const cy = cyArray[selectedMonthIndex];

                  return (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <circle r="6" fill="#EAB308" className="animate-ping opacity-75" />
                      <circle r="5" fill="#EAB308" stroke="#18181B" strokeWidth="2" />
                      
                      {/* Tooltip Badge */}
                      <g transform="translate(-40, -35)">
                        <rect width="80" height="22" rx="6" fill="#1E222A" stroke="#1E222A" strokeWidth="1" />
                        <text x="40" y="14" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                          {activeMonth.month}, {displayWeight(activeMonth.weightKg)}
                        </text>
                      </g>
                    </g>
                  );
                })()}

                {/* Clickable X-Axis Labels */}
                {monthlyWeightData.map((m, i) => {
                  const xPos = 40 + i * 58;
                  const isSelected = selectedMonthIndex === i;
                  return (
                    <text 
                      key={m.month}
                      x={xPos} 
                      y="138" 
                      fill={isSelected ? "#18181B" : "#94a3b8"} 
                      fontSize="10" 
                      fontWeight={isSelected ? "bold" : "normal"} 
                      textAnchor="middle" 
                      fontFamily="sans-serif"
                      onClick={() => setSelectedMonthIndex(i)}
                      className="cursor-pointer"
                    >
                      {m.month}
                    </text>
                  );
                })}
              </svg>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ATTRIBUTE DETAIL BREAKDOWN MODAL                                 */}
      {/* ========================================================================= */}
      {activeAttributeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-lg space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EAB308]" />
                <h3 className="text-lg font-bold text-[#18181B] uppercase tracking-tight">
                  {activeAttributeModal} Breakdown
                </h3>
              </div>
              <button onClick={() => setActiveAttributeModal(null)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-[#F8F6F0] p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold">
                <span>Current Tier</span>
                <span className="text-[#EAB308]">Tier 4 / 5</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Verified Reps:</span>
                <span className="font-bold">1,420 Reps</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>WASM Accuracy:</span>
                <span className="font-bold text-emerald-600">99.1%</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Next Milestone:</span>
                <span className="font-bold">+150 XP for Tier 5</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Calculated on-device using AI joint angle acceleration vectors and camera refereeing. Complete 3 more 1v1 duels to unlock Tier 5!
            </p>

            <button 
              onClick={() => setActiveAttributeModal(null)} 
              className="w-full py-2.5 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW WORKOUT LOG MODAL                                        */}
      {/* ========================================================================= */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddLogSubmit} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#18181B] uppercase tracking-tight">Log Quick Workout</h3>
              <button type="button" onClick={() => setShowAddLogModal(false)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Exercise Name</label>
                <input 
                  type="text" 
                  value={newLogName}
                  onChange={(e) => setNewLogName(e.target.value)}
                  placeholder="e.g. Jumping Jacks" 
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Detail / Reps</label>
                <input 
                  type="text" 
                  value={newLogDetail}
                  onChange={(e) => setNewLogDetail(e.target.value)}
                  placeholder="e.g. 60 Reps • 98%" 
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all">
              Save Session Log
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROFILE SETTINGS & TARGET WEIGHT MODAL                           */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#18181B] uppercase tracking-tight">Profile Options</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Goal Weight ({unit.toUpperCase()})</label>
                <input 
                  type="number" 
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value) || 70)}
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-mono font-bold"
                />
              </div>
              <div className="bg-[#F8F6F0] p-3 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Athlete ID:</span>
                  <span className="font-mono font-bold text-[#18181B]">TR-8842-CYBER</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Division:</span>
                  <span className="font-bold text-[#EAB308]">Cannon Division #1</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowSettingsModal(false)} 
              className="w-full py-2.5 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
            >
              Save Profile Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

