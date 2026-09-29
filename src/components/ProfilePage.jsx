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
  RotateCcw,
  Search,
  Bell,
  ShoppingBag,
  ChevronRight,
  Users,
  Radio,
  Award,
  Zap,
  Layers,
  Upload,
  Camera,
  Image as ImageIcon,
  User,
  Edit3,
  Trophy,
  Star,
  Move,
  Maximize2,
  RotateCw,
  RefreshCw,
  Sliders,
  BarChart3,
  Target,
  MapPin,
  Heart,
  TrendingUp,
  Droplets,
  Building2,
  Clock,
  Music,
  LogOut
} from 'lucide-react';
import userAvatar from '../assets/athlete.jpg';
import roninBanner from '../assets/ronin_banner.jpg';
import samuraiPfp from '../assets/samurai_pfp.png';
import cyberpunk2D from '../assets/cyberpunk_2d.jpg';
import { useAuth, useNearbyDevices } from '../hooks';

export default function ProfilePage() {
  const { profile, updateProfile, addXP, logout } = useAuth();
  const { nearbyDevices = [] } = useNearbyDevices() || {};
  const [copiedId, setCopiedId] = useState(false);

  // Designed PFP & Banner Selection State
  const [activeAvatar, setActiveAvatar] = useState(profile?.avatar_url || samuraiPfp);
  const [activeBanner, setActiveBanner] = useState(profile?.banner_url || roninBanner);

  useEffect(() => {
    if (profile?.avatar_url) setActiveAvatar(profile.avatar_url);
    if (profile?.banner_url) setActiveBanner(profile.banner_url);
  }, [profile?.avatar_url, profile?.banner_url]);

  // PFP Live Adjustments State (Zoom, Rotate, Drag X/Y, Fit Mode)
  const [pfpScale, setPfpScale] = useState(profile?.pfp_transform?.pfpScale ?? 100);
  const [pfpRotate, setPfpRotate] = useState(profile?.pfp_transform?.pfpRotate ?? 0);
  const [pfpX, setPfpX] = useState(profile?.pfp_transform?.pfpX ?? 0);
  const [pfpY, setPfpY] = useState(profile?.pfp_transform?.pfpY ?? 0);
  const [pfpFit, setPfpFit] = useState(profile?.pfp_transform?.pfpFit ?? 'cover');

  // Dragging PFP directly on canvas state
  const [isDraggingPfp, setIsDraggingPfp] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDownPfp = (e) => {
    e.preventDefault();
    setIsDraggingPfp(true);
    setDragStart({ x: e.clientX - pfpX, y: e.clientY - pfpY });
  };

  const handleMouseMoveCanvas = (e) => {
    if (!isDraggingPfp) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPfpX(Math.max(-350, Math.min(350, newX)));
    setPfpY(Math.max(-220, Math.min(220, newY)));
  };

  const handleMouseUpCanvas = () => {
    setIsDraggingPfp(false);
  };

  const resetTransforms = () => {
    setPfpScale(100);
    setPfpRotate(0);
    setPfpX(0);
    setPfpY(0);
    setPfpFit('cover');
  };

  const handlePfpUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setActiveAvatar(dataUrl);
      if (updateProfile) {
        updateProfile({ avatar_url: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setActiveBanner(dataUrl);
      if (updateProfile) {
        updateProfile({ banner_url: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  // 2D Character Presets
  const character2DPresets = [
    {
      id: 'ronin',
      name: 'Shadow Ronin (2D Ink Wash)',
      bannerImg: roninBanner,
    },
    {
      id: 'cyberpunk',
      name: 'Cyber Neon Fighter (2D Vector)',
      bannerImg: cyberpunk2D,
    },
    {
      id: 'athlete',
      name: 'Athletic Titan (Classic)',
      bannerImg: userAvatar,
    }
  ];

  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(profile?.display_name || 'Abhay Sharma');
  const [editUsername, setEditUsername] = useState(profile?.username || 'Abhay');
  const [editTitle, setEditTitle] = useState(profile?.title || 'Kinematic Grandmaster');

  // Helper for safe icon mapping
  const getGoalIcon = (iconName) => {
    if (iconName === 'Clock') return Clock;
    if (iconName === 'Dumbbell') return Dumbbell;
    if (iconName === 'Trophy') return Trophy;
    if (iconName === 'Droplets') return Droplets;
    return Target;
  };

  // Interactive Goals State
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('truerep_user_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(g => ({
            ...g,
            iconName: typeof g.icon === 'string' ? g.icon : g.iconName || 'Target'
          }));
        }
      }
    } catch {}
    return [
      { id: 1, title: 'Daily TUT Staking', current: 45, target: 60, unit: 'Mins', color: 'bg-yellow-500', iconName: 'Clock' },
      { id: 2, title: 'Explosive Form Reps', current: 250, target: 300, unit: 'Reps', color: 'bg-emerald-500', iconName: 'Dumbbell' },
      { id: 3, title: 'ELO Advancement', current: 2840, target: 3000, unit: 'ELO', color: 'bg-amber-500', iconName: 'Trophy' },
      { id: 4, title: 'Recovery Hydration', current: 2.8, target: 3.0, unit: 'Liters', color: 'bg-cyan-500', iconName: 'Droplets' },
    ];
  });

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState(0);
  const [newGoalTarget, setNewGoalTarget] = useState(100);
  const [newGoalUnit, setNewGoalUnit] = useState('Reps');

  useEffect(() => {
    try {
      const serializable = goals.map(g => ({
        id: g.id,
        title: g.title,
        current: g.current,
        target: g.target,
        unit: g.unit,
        color: g.color,
        iconName: g.iconName || 'Target'
      }));
      localStorage.setItem('truerep_user_goals', JSON.stringify(serializable));
    } catch {}
  }, [goals]);

  const handleUpdateGoalCurrent = (id, newCurrent) => {
    const val = parseFloat(newCurrent);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: isNaN(val) ? 0 : val } : g));
  };

  const handleUpdateGoalTarget = (id, newTarget) => {
    const val = parseFloat(newTarget);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, target: isNaN(val) ? 1 : val } : g));
  };

  const handleAddGoalSubmit = (e) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      title: newGoalTitle.trim(),
      current: Number(newGoalCurrent) || 0,
      target: Number(newGoalTarget) || 100,
      unit: newGoalUnit.trim() || 'Reps',
      color: 'bg-yellow-500',
      iconName: 'Target'
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalCurrent(0);
    setNewGoalTarget(100);
    setNewGoalUnit('Reps');
    setShowAddGoalModal(false);
  };

  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Interactive Songs & Playlist State
  const [songs, setSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('truerep_user_songs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, title: 'Cyber Ronin (140 BPM)', artist: 'Phonk Industrial', duration: '3:24', bpm: 140, tag: 'HYPE' },
      { id: 2, title: 'Sub-Degree Cadence', artist: 'Dark Techno', duration: '2:48', bpm: 132, tag: 'FOCUS' },
      { id: 3, title: 'MediaPipe Velocity', artist: 'Synthwave', duration: '4:12', bpm: 128, tag: 'SPRINT' },
      { id: 4, title: 'Titan Lockout', artist: 'Hardstyle Heavy', duration: '3:05', bpm: 150, tag: 'BEAST' },
    ];
  });

  const [activeSongId, setActiveSongId] = useState(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongBpm, setNewSongBpm] = useState(135);
  const [newSongTag, setNewSongTag] = useState('HYPE');

  useEffect(() => {
    try {
      localStorage.setItem('truerep_user_songs', JSON.stringify(songs));
    } catch {}
  }, [songs]);

  const togglePlaySong = (id) => {
    if (activeSongId === id) {
      setIsPlayingSong(!isPlayingSong);
    } else {
      setActiveSongId(id);
      setIsPlayingSong(true);
    }
  };

  const handleAddSongSubmit = (e) => {
    e.preventDefault();
    if (!newSongTitle.trim()) return;
    const newSong = {
      id: Date.now(),
      title: newSongTitle.trim(),
      artist: newSongArtist.trim() || 'Custom Track',
      duration: '3:15',
      bpm: Number(newSongBpm) || 130,
      tag: newSongTag.trim().toUpperCase() || 'HYPE'
    };
    setSongs(prev => [...prev, newSong]);
    setNewSongTitle('');
    setNewSongArtist('');
    setShowAddSongModal(false);
  };

  const handleDeleteSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    if (activeSongId === id) {
      setActiveSongId(null);
      setIsPlayingSong(false);
    }
  };

  // Custom Workout Logs List State
  const [historyLogs, setHistoryLogs] = useState([
    { id: 1, type: 'exercise', name: 'Explosive Squats', detail: '50 Reps • 99% Depth', isAIVerified: true },
    { id: 2, type: 'duel', name: 'vs Elena (1v1 Bout)', detail: '+24 ELO Won', isAIVerified: false },
    { id: 3, type: 'exercise', name: 'Lockout Push-Ups', detail: '42 Reps • 98% Form', isAIVerified: true },
  ]);

  // Sync AI Coach Workout History
  useEffect(() => {
    const loadAISessions = () => {
      try {
        const savedHistory = JSON.parse(localStorage.getItem('truerep_workout_history') || '[]');
        if (savedHistory.length > 0) {
          setHistoryLogs(prev => {
            const combined = [...savedHistory, ...prev];
            const uniqueMap = new Map();
            combined.forEach(l => uniqueMap.set(l.id, l));
            return Array.from(uniqueMap.values());
          });
        }
      } catch {}
    };

    loadAISessions();
    window.addEventListener('truerep_session_logged', loadAISessions);
    return () => {
      window.removeEventListener('truerep_session_logged', loadAISessions);
    };
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText('TR-8842-CYBER');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await updateProfile({
      display_name: editDisplayName,
      username: editUsername,
      title: editTitle,
      avatar_url: activeAvatar,
      banner_url: activeBanner,
    });
    setShowSettingsModal(false);
  };

  // Friends & Nearby Opponents List
  const friendsList = [
    { id: 1, name: 'Elena R.', status: 'In Duel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', color: 'bg-emerald-500' },
    { id: 2, name: 'Nikitin', status: 'Online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', color: 'bg-emerald-500' },
    { id: 3, name: 'Rohan K.', status: 'In Gym', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', color: 'bg-yellow-500' },
    { id: 4, name: 'Priya M.', status: 'Online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', color: 'bg-emerald-500' },
    { id: 5, name: 'Vikram S.', status: 'Offline', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', color: 'bg-slate-400' }
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white p-3 sm:p-6 lg:p-8 font-sans selection:bg-yellow-500 selection:text-zinc-900">
      
      {/* SYSTEMATIC 3-ZONE DASHBOARD WRAPPER */}
      <div className="max-w-[1700px] mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* ZONE 1: TOP ATHLETE HERO & STATISTICAL BIOMETRICS BANNER                 */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* ZONE 1: TOP ATHLETE HERO & STATISTICAL BIOMETRICS BANNER                 */}
        {/* ========================================================================= */}
        <div className="bg-neutral-900/90 rounded-[28px] sm:rounded-[47px] p-4 sm:p-8 outline outline-1 outline-white/10 shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50)] shadow-[0px_0px_24px_0px_rgba(255,128,0,0.15)] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-6">
          
          {/* APPLIED BACKGROUND BANNER IMAGE */}
          <img 
            src={activeBanner || profile?.banner_url || roninBanner} 
            alt="Profile Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-0 transition-opacity duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/30 pointer-events-none z-0" />

          {/* Left Athlete Summary Info & Hero Header */}
          <div className="flex-1 space-y-4 sm:space-y-5 w-full relative z-10">
            
            {/* Header Badges Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-yellow-500 rounded-full shadow-[0px_0px_12px_0px_rgba(234,179,8,0.40)] flex items-center">
                  <span className="text-zinc-900 text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-wider">
                    ELITE ATHLETE • {profile?.elo || 2510} ELO
                  </span>
                </div>
                <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white/5 rounded-full outline outline-1 outline-white/10 flex items-center">
                  <span className="text-yellow-400 text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider">
                    RANK #1 CANNON DIVISION
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCopyId}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/5 hover:bg-white/10 rounded-full outline outline-1 outline-white/10 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span className="text-white text-[10px] sm:text-xs font-mono">{profile?.cyber_id || 'TR-8842-CYBER'}</span>
                <Copy className="w-3 h-3 text-slate-400" />
                {copiedId && <span className="text-[9px] text-emerald-400 font-bold">COPIED</span>}
              </button>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight uppercase font-heading tracking-tight">
                UNLOCK YOUR POTENTIAL
              </h1>
              <p className="text-slate-300 text-xs sm:text-base lg:text-lg font-normal">
                {profile?.display_name || 'Alex Vance'} • {profile?.title || 'Elite athlete'} • {profile?.elo || 2510} ELO
              </p>
            </div>

            {/* 3 Biometrics Stat Cards Container */}
            <div className="shadow-[inset_5px_3px_65.9px_0px_rgba(255,255,255,0.25)] p-2 rounded-[28px] sm:rounded-[50px] bg-neutral-900/60 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="h-20 sm:h-24 bg-neutral-900/90 rounded-[20px] sm:rounded-[40px] outline outline-1 outline-white/5 flex flex-col items-center justify-center space-y-0.5 p-2 sm:p-3 text-center">
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider">STAMINA</span>
                <span className="text-white text-2xl sm:text-3xl font-black font-mono">88%</span>
                <span className="text-yellow-400 text-[10px] sm:text-xs font-medium">Tier 4 • High Endurance</span>
              </div>
              <div className="h-20 sm:h-24 bg-neutral-900/90 rounded-[20px] sm:rounded-[40px] outline outline-1 outline-white/5 flex flex-col items-center justify-center space-y-0.5 p-2 sm:p-3 text-center">
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider">STRENGTH</span>
                <span className="text-white text-2xl sm:text-3xl font-black font-mono">92%</span>
                <span className="text-yellow-400 text-[10px] sm:text-xs font-medium">Tier 5 • 435W Power</span>
              </div>
              <div className="h-20 sm:h-24 bg-neutral-900/90 rounded-[20px] sm:rounded-[40px] outline outline-1 outline-white/5 flex flex-col items-center justify-center space-y-0.5 p-2 sm:p-3 text-center">
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider">AGILITY</span>
                <span className="text-white text-2xl sm:text-3xl font-black font-mono">84%</span>
                <span className="text-yellow-400 text-[10px] sm:text-xs font-medium">Tier 4 • 52 reps/min</span>
              </div>
            </div>

          </div>

          {/* Right Glowing Spherical Avatar Viewport Container with Drag & Scale Transform */}
          <div className="w-44 sm:w-64 lg:w-80 h-44 sm:h-64 lg:h-80 relative bg-orange-500/10 rounded-full shadow-[0px_24px_48px_0px_rgba(0,0,0,0.50)] flex items-center justify-center shrink-0 overflow-hidden outline outline-1 outline-white/10 z-10">
            <div className="w-44 sm:w-64 h-44 sm:h-64 absolute opacity-20 bg-orange-500 rounded-full blur-3xl pointer-events-none" />
            <div className="w-36 sm:w-52 h-36 sm:h-52 absolute opacity-10 bg-yellow-400 rounded-full blur-3xl pointer-events-none" />
            <div className="w-28 sm:w-40 h-28 sm:h-40 absolute opacity-5 bg-white rounded-full blur-[50px] pointer-events-none" />
            
            {/* Spherical Viewport Frame Mask */}
            <div 
              onMouseDown={handleMouseDownPfp}
              onMouseMove={handleMouseMoveCanvas}
              onMouseUp={handleMouseUpCanvas}
              onMouseLeave={handleMouseUpCanvas}
              className="w-36 h-36 sm:w-56 sm:h-56 relative rounded-full z-10 overflow-hidden cursor-grab active:cursor-grabbing border-4 border-yellow-500/60 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center bg-transparent"
              title="Click & Drag to reposition PFP inside circular frame"
            >
              {/* Banner Backdrop filling any remaining area of the circle */}
              <img 
                src={activeBanner || profile?.banner_url || roninBanner} 
                alt="Banner Backdrop" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
              />
              <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[1px] pointer-events-none z-0" />

              {/* PFP Avatar Layer */}
              <img 
                src={activeAvatar || profile?.avatar_url || samuraiPfp} 
                alt="Profile Avatar" 
                style={{
                  transform: `scale(${pfpScale / 100}) translate(${pfpX}px, ${pfpY}px) rotate(${pfpRotate}deg)`,
                  transition: isDraggingPfp ? 'none' : 'transform 0.15s ease-out'
                }}
                className={`w-full h-full ${pfpFit === 'contain' ? 'object-contain' : 'object-cover'} pointer-events-none select-none relative z-10`}
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN SYSTEMATIC GRID LAYOUT: LEFT (4 COLS), CENTER (8 COLS), RIGHT (3 COLS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* =================================================================== */}
          {/* COLUMN 1: IDENTITY & HEALTH BIOMETRICS (xl:col-span-4)              */}
          {/* =================================================================== */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* 1. USER CONTROL PANEL & FRAMING ADJUSTMENTS */}
            <div className="p-6 bg-gray-950 rounded-3xl shadow-[0px_18px_40px_0px_rgba(0,0,0,0.40)] outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4">
              
              <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                    USER CONTROL PANEL
                  </h3>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl outline outline-1 outline-white/10 flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3 h-3 text-yellow-500" />
                  <span className="text-yellow-500 text-xs font-bold font-sans">Edit Profile</span>
                </button>
              </div>

              {/* User Identity Details Card */}
              <div className="p-3.5 bg-slate-900 rounded-2xl outline outline-1 outline-white/10 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-black text-white leading-tight font-heading">
                      {profile?.display_name || 'Abhay Sharma'}
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400 font-semibold mt-0.5">
                      @{profile?.username || 'Abhay'} • {profile?.cyber_id || 'TR-8842-CYBER'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-yellow-500 text-zinc-900 text-[9px] font-black rounded uppercase font-mono tracking-wide">
                    LVL {profile?.current_level || 14}
                  </span>
                </div>
                <div className="px-2 py-0.5 bg-white/5 rounded border-l-2 border-yellow-500 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-yellow-500" />
                  <span className="text-white text-[10px] font-bold font-mono">{profile?.title || 'Kinematic Grandmaster'}</span>
                </div>
              </div>

              {/* Upload Custom Media Buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Upload className="w-3 h-3 text-yellow-500" />
                  <span>UPLOAD CUSTOM MEDIA:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-white text-xs font-bold font-sans">Upload PFP</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePfpUpload} />
                  </label>
                  <label className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
                    <ImageIcon className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-white text-xs font-bold font-sans">Upload Banner</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                </div>
              </div>

              {/* Designed Artwork Presets Row */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                <span className="text-slate-400">DESIGNED PRESETS:</span>
                <div className="flex gap-1.5 flex-wrap">
                  <button 
                    onClick={() => {
                      setActiveAvatar(samuraiPfp);
                      if (updateProfile) updateProfile({ avatar_url: samuraiPfp });
                    }}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-yellow-500/20 rounded text-white text-[9px] outline outline-1 outline-yellow-500 cursor-pointer"
                  >
                    Ronin PFP
                  </button>
                  <button 
                    onClick={() => {
                      setActiveBanner(roninBanner);
                      if (updateProfile) updateProfile({ banner_url: roninBanner });
                    }}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-yellow-500/20 rounded text-white text-[9px] outline outline-1 outline-yellow-500 cursor-pointer"
                  >
                    Ronin Banner
                  </button>
                  <button 
                    onClick={() => {
                      setActiveBanner(cyberpunk2D);
                      if (updateProfile) updateProfile({ banner_url: cyberpunk2D });
                    }}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-yellow-500/20 rounded text-white text-[9px] outline outline-1 outline-yellow-500 cursor-pointer"
                  >
                    Cyberpunk Banner
                  </button>
                </div>
              </div>

              {/* Dedicated PFP Move & Resize Controls Box */}
              <div className="p-3 bg-slate-900 rounded-2xl outline outline-1 outline-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-yellow-500 text-[11px] font-bold font-mono uppercase">
                    <User className="w-3.5 h-3.5" />
                    <span>PFP Move & Resize Controls</span>
                  </div>
                  <button 
                    onClick={resetTransforms}
                    className="px-2 py-0.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 rounded-md text-[9px] font-black uppercase flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Reset PFP
                  </button>
                </div>

                <div className="space-y-2.5 text-[10px] font-mono">
                  {/* Fit Mode Toggle */}
                  <div className="flex items-center justify-between p-1.5 bg-neutral-800/80 rounded-xl outline outline-1 outline-white/5">
                    <span className="text-slate-300 font-bold">Image Framing Fit:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setPfpFit('cover')}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${pfpFit === 'cover' ? 'bg-yellow-500 text-zinc-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                      >
                        Crop Fill
                      </button>
                      <button 
                        onClick={() => setPfpFit('contain')}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${pfpFit === 'contain' ? 'bg-yellow-500 text-zinc-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                      >
                        Keep Full Image
                      </button>
                    </div>
                  </div>

                  {/* Row 1: Scale & Angle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>PFP Size / Scale</span>
                        <span className="text-yellow-400 font-bold">{pfpScale}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="250" 
                        value={pfpScale} 
                        onChange={(e) => setPfpScale(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg accent-yellow-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Rotate Angle</span>
                        <span className="text-yellow-400 font-bold">{pfpRotate}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={pfpRotate} 
                        onChange={(e) => setPfpRotate(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg accent-yellow-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Row 2: Shift X & Shift Y */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Position Shift X</span>
                        <span className="text-yellow-400 font-bold">{pfpX}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-200" 
                        max="200" 
                        value={pfpX} 
                        onChange={(e) => setPfpX(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg accent-yellow-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Position Shift Y</span>
                        <span className="text-yellow-400 font-bold">{pfpY}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="-150" 
                        max="150" 
                        value={pfpY} 
                        onChange={(e) => setPfpY(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg accent-yellow-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-slate-400 font-sans italic pt-0.5">
                    💡 Click and drag the PFP avatar wheel directly in the spherical header frame to reposition what part of the image shows inside!
                  </p>
                </div>
              </div>

            </div>

            {/* 2. HEALTH & KINETIC BIOMETRICS CARD */}
            <div className="p-6 bg-gray-950 rounded-3xl outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4">
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-heading">
                    HEALTH & BIOMETRICS
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 rounded-lg outline outline-1 outline-emerald-200 text-emerald-700 text-xs font-bold font-mono">
                  Optimal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500">
                      <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold font-mono uppercase">PULSE</span>
                  </div>
                  <div className="text-white text-lg font-bold font-mono">142 BPM</div>
                  <div className="text-emerald-500 text-[10px] font-semibold">Cardio Zone</div>
                </div>

                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold font-mono uppercase">FORM</span>
                  </div>
                  <div className="text-white text-lg font-bold font-mono">98.4%</div>
                  <div className="text-slate-400 text-[10px] font-semibold">MediaPipe 3D</div>
                </div>

                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Flame className="w-4 h-4 text-amber-500 fill-current" />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold font-mono uppercase">BURN</span>
                  </div>
                  <div className="text-white text-lg font-bold font-mono">680 kcal</div>
                  <div className="text-amber-500 text-[10px] font-semibold">Active Output</div>
                </div>

                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold font-mono uppercase">RECOVERY</span>
                  </div>
                  <div className="text-white text-lg font-bold font-mono">88%</div>
                  <div className="text-cyan-600 text-[10px] font-semibold">Peak Power</div>
                </div>
              </div>

            </div>

            {/* 3. SIGN OUT & SESSION CONTROL CARD */}
            <div className="p-5 bg-gradient-to-b from-neutral-900/95 to-red-950/20 rounded-3xl outline outline-1 outline-red-500/30 hover:outline-red-500/70 shadow-[0_12px_32px_rgba(239,68,68,0.15)] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.15)] transition-all duration-300 relative overflow-hidden group space-y-3">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/5 opacity-50 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 outline outline-1 outline-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                      SESSION CONTROL
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      End active workout session & logout
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (logout) await logout();
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_6px_20px_rgba(220,38,38,0.35)] cursor-pointer active:scale-95 shrink-0 border border-red-400/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

          </div>

          {/* =================================================================== */}
          {/* COLUMN 2: WORKOUT HEATMAP, GOALS, PLAYLIST & GYMS (xl:col-span-8)    */}
          {/* =================================================================== */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* 1. DAY-WISE WORKOUT HEATMAP & RECENT REP LOGS */}
            <div className="p-6 bg-gray-950 rounded-3xl shadow-[0px_18px_40px_0px_rgba(0,0,0,0.40)] outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4">
              
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-heading">
                    DAY-WISE WORKOUT HEATMAP
                  </h3>
                </div>
                <div className="px-2.5 py-1 bg-stone-100 rounded-lg outline outline-1 outline-slate-200">
                  <span className="text-slate-600 text-xs font-bold font-mono">This Week • 12,340s TUT</span>
                </div>
              </div>

              {/* Heatmap Chart Visualizer */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 items-end pt-4 pb-2 border-b border-white/10 min-h-[160px]">
                {[
                  { day: 'Mon', reps: '120r', height: 'h-20', active: false },
                  { day: 'Tue', reps: '95r', height: 'h-16', active: false },
                  { day: 'Wed', reps: '140r', height: 'h-24', active: true, highlighted: true },
                  { day: 'Thu', reps: '80r', height: 'h-12', active: false, slate: true },
                  { day: 'Fri', reps: '160r', height: 'h-28', active: false },
                  { day: 'Sat', reps: '110r', height: 'h-20', active: false },
                  { day: 'Sun', reps: '40r', height: 'h-8', active: false, slate: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-slate-400 text-[9px] font-bold font-mono">{item.reps}</span>
                    <div className="w-full h-28 p-0.5 bg-stone-100 rounded-xl flex items-end overflow-hidden">
                      <div 
                        className={`w-full rounded-lg transition-all duration-300 ${
                          item.highlighted 
                            ? 'bg-yellow-500 shadow-md' 
                            : item.slate 
                              ? 'bg-slate-300' 
                              : 'bg-neutral-800'
                        } ${item.height}`}
                      />
                    </div>
                    <span className={`text-xs font-bold font-mono ${item.highlighted ? 'text-yellow-500 font-black' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Peak Training Highlight */}
              <div className="p-3 bg-slate-900 rounded-2xl outline outline-1 outline-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-white/70 font-bold">Peak Training Day:</span>
                  <span className="text-slate-400">Friday (2,400s TUT • 160 Reps)</span>
                </div>
                <div className="px-2.5 py-1 bg-neutral-800 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-yellow-500 text-[10px] font-bold font-mono">100% Automated AI Logging</span>
                </div>
              </div>

              {/* Recent Rep Logs Sub-Section */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-white/70 text-xs font-bold font-heading uppercase tracking-wide">
                      RECENT REP LOGS & AI PROOF
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-neutral-800 rounded text-yellow-500 text-[10px] font-bold font-mono">
                    Auto-Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {historyLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-black rounded-2xl outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 bg-neutral-800 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                          <Dumbbell className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-white text-xs font-bold truncate">
                            <span className="truncate">{log.name}</span>
                          </div>
                          <span className="text-slate-400 text-[10px] font-mono block truncate">{log.detail}</span>
                        </div>
                      </div>
                      {log.isAIVerified && (
                        <span className="px-1.5 py-0.5 bg-yellow-500 rounded text-zinc-900 text-[8px] font-black font-mono uppercase shrink-0">
                          🤖 AI
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 2. SIDE-BY-SIDE SUBGRID: ACTIVE GOALS + YOUR SONGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* ACTIVE GOALS CARD */}
              <div className="p-5 bg-gray-950 rounded-3xl outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="pb-2.5 border-b border-white/10 flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-yellow-500" />
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wide font-heading">
                        ACTIVE GOALS
                      </h3>
                    </div>
                    <button 
                      onClick={() => setShowAddGoalModal(true)}
                      className="px-2 py-1 bg-black hover:bg-neutral-900 rounded-lg flex items-center gap-1 text-yellow-500 text-[10px] font-bold transition"
                    >
                      <Plus className="w-3 h-3 text-yellow-500" /> Goal
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {goals.map(goal => {
                      const percent = Math.min(100, Math.max(0, Math.round((goal.current / Math.max(1, goal.target)) * 100)));
                      const IconComp = getGoalIcon(goal.iconName);
                      return (
                        <div key={goal.id} className="p-2.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-1.5 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 max-w-[140px] truncate">
                              <IconComp className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                              <span className="text-white text-xs font-bold font-sans truncate">{goal.title}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-mono">
                              <input
                                type="number"
                                step="any"
                                value={goal.current}
                                onChange={(e) => handleUpdateGoalCurrent(goal.id, e.target.value)}
                                className="w-10 px-1 py-0.5 bg-yellow-400 text-black text-[11px] font-bold font-mono rounded text-right focus:outline-none"
                              />
                              <span className="text-white font-bold">/</span>
                              <input
                                type="number"
                                step="any"
                                value={goal.target}
                                onChange={(e) => handleUpdateGoalTarget(goal.id, e.target.value)}
                                className="w-10 px-1 py-0.5 bg-yellow-400 text-black text-[11px] font-bold font-mono rounded text-left focus:outline-none"
                              />
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${goal.color || 'bg-yellow-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* YOUR SONGS & HYPE TRACKS CARD */}
              <div className="p-5 bg-gray-950 rounded-3xl outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="pb-2.5 border-b border-white/10 flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-yellow-500" />
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wide font-heading">
                        YOUR SONGS
                      </h3>
                    </div>
                    <button 
                      onClick={() => setShowAddSongModal(true)}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-1 text-yellow-500 text-[10px] font-bold transition"
                    >
                      <Plus className="w-3 h-3 text-yellow-500" /> Song
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {songs.map(song => {
                      const isSelected = activeSongId === song.id;
                      const isPlaying = isSelected && isPlayingSong;
                      return (
                        <div 
                          key={song.id}
                          className="p-2.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button 
                              onClick={() => togglePlaySong(song.id)}
                              className="w-7 h-7 bg-black rounded-xl outline outline-1 outline-white flex items-center justify-center text-white shrink-0 hover:border-yellow-500 transition"
                            >
                              {isPlaying ? (
                                <Pause className="w-3 h-3 fill-current text-yellow-500" />
                              ) : (
                                <Play className="w-3 h-3 fill-current text-white ml-0.5" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <h4 className="text-white text-xs font-bold truncate">{song.title}</h4>
                              <p className="text-white/70 text-[9px] font-mono truncate">{song.artist} • {song.bpm} BPM</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 bg-white rounded text-slate-600 text-[8px] font-bold font-mono uppercase">
                              {song.tag}
                            </span>
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. GYMS ACQUIRED & STAKED CARD */}
            <div className="p-6 bg-gray-950 rounded-3xl outline outline-1 outline-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4">
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-heading">
                    GYMS ACQUIRED & STAKED
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-neutral-800 rounded-lg text-yellow-500 text-xs font-bold font-mono">
                  3 Gyms Controlled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                      <Building2 className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-bold font-heading truncate">Main Campus Gym</h4>
                      <p className="text-slate-400 text-[9px] font-mono truncate">Tier 1 Fortress</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500 rounded-lg text-zinc-900 text-[9px] font-extrabold uppercase font-sans shrink-0">
                    +450 RT
                  </span>
                </div>

                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-bold font-heading truncate">Sector-7 Vault</h4>
                      <p className="text-slate-400 text-[9px] font-mono truncate">Tier 2 Outpost</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 rounded-lg text-emerald-800 text-[9px] font-extrabold uppercase font-sans shrink-0">
                    +280 RT
                  </span>
                </div>

                <div className="p-3.5 bg-black rounded-2xl shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                      <Swords className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-bold font-heading truncate">Cyber Arena</h4>
                      <p className="text-slate-400 text-[9px] font-mono truncate">Tier 1 Colosseum</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 rounded-lg text-amber-800 text-[9px] font-extrabold uppercase font-sans shrink-0">
                    +600 RT
                  </span>
                </div>
              </div>

            </div>

          </div>



      </div>
    </div>

      {/* MODAL 1: SETTINGS / PROFILE CUSTOMIZATION */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveSettings} className="bg-[#12141A] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase font-heading">Edit Athlete Profile</h3>
                <p className="text-xs text-slate-400">Update display info and 2D artwork</p>
              </div>
              <button type="button" onClick={() => setShowSettingsModal(false)} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Display Name</label>
                <input 
                  type="text" 
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-black border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Username (@handle)</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Athlete Title</label>
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-black border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="Kinematic Grandmaster">Kinematic Grandmaster</option>
                  <option value="Kinematic Athlete">Kinematic Athlete</option>
                  <option value="Shadow Ronin (2D)">Shadow Ronin (2D)</option>
                  <option value="Cyber Neon Fighter (2D)">Cyber Neon Fighter (2D)</option>
                  <option value="Cannon Division Champion">Cannon Division Champion</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold rounded-xl transition shadow-md font-sans uppercase tracking-wider"
            >
              Save Profile Setup
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD CUSTOM GOAL */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddGoalSubmit} className="bg-[#12141A] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-heading flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-500" /> Set Custom Fitness Goal
              </h3>
              <button type="button" onClick={() => setShowAddGoalModal(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Goal Title</label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Bench Press 100kg"
                  className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Current</label>
                  <input
                    type="number"
                    step="any"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Target</label>
                  <input
                    type="number"
                    step="any"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Unit</label>
                  <input
                    type="text"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="Reps / kg"
                    className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4 text-zinc-900" />
              <span>Save Active Goal</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM SONG */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddSongSubmit} className="bg-[#12141A] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-heading flex items-center gap-2">
                <Music className="w-4 h-4 text-yellow-500" /> Add Workout Track
              </h3>
              <button type="button" onClick={() => setShowAddSongModal(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Song Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="e.g. Eye of the Tiger"
                  className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-bold text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Artist / Genre</label>
                <input
                  type="text"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  placeholder="e.g. Dark Techno"
                  className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={newSongBpm}
                    onChange={(e) => setNewSongBpm(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Vibe Tag</label>
                  <input
                    type="text"
                    value={newSongTag}
                    onChange={(e) => setNewSongTag(e.target.value)}
                    placeholder="HYPE / FOCUS"
                    className="w-full mt-1 p-2 text-xs bg-black border border-white/10 rounded-xl font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4 text-zinc-900" />
              <span>Add to Playlist</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

