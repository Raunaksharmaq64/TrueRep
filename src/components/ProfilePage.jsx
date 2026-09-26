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
  Music
} from 'lucide-react';
import userAvatar from '../assets/athlete.jpg';
import roninBanner from '../assets/ronin_banner.jpg';
import samuraiPfp from '../assets/samurai_pfp.png';
import cyberpunk2D from '../assets/cyberpunk_2d.jpg';
import { useAuth, useNearbyDevices } from '../hooks';

export default function ProfilePage() {
  const { profile, updateProfile, addXP } = useAuth();
  const { nearbyDevices = [] } = useNearbyDevices() || {};
  const [copiedId, setCopiedId] = useState(false);

  // Designed PFP & Banner Selection State
  const [activeAvatar, setActiveAvatar] = useState(samuraiPfp);
  const [activeBanner, setActiveBanner] = useState(roninBanner);
  const [activeEditTab, setActiveEditTab] = useState('banner'); // 'banner' | 'pfp'

  // PFP & Banner Live Adjustments State
  const [pfpScale, setPfpScale] = useState(100);    // 50% to 200%
  const [pfpRotate, setPfpRotate] = useState(0);    // -180 to 180 deg
  const [pfpX, setPfpX] = useState(0);              // -350px to +350px
  const [pfpY, setPfpY] = useState(0);              // -220px to +220px

  // Banner Framing & Shift State
  const [bannerScale, setBannerScale] = useState(100); // 100% to 250%
  const [bannerX, setBannerX] = useState(0);           // -200px to +200px
  const [bannerY, setBannerY] = useState(0);           // -150px to +150px

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
    setBannerScale(100);
    setBannerX(0);
    setBannerY(0);
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

  // Designed Artwork Presets
  const pfpPresetList = [
    { id: 'ronin_2d', name: '2D Shadow Ronin', img: samuraiPfp },
    { id: 'cyber_vector', name: 'Cyber Neon Fighter', img: cyberpunk2D },
    { id: 'titan_classic', name: 'Athletic Titan', img: userAvatar },
  ];

  const bannerPresetList = [
    { id: 'ronin_slash', name: 'Slashed Samurai & Crows', img: roninBanner },
    { id: 'cyber_arena', name: 'Cyber Neon Arena', img: cyberpunk2D },
    { id: 'classic_arena', name: 'Titan Arena', img: userAvatar },
  ];

  // 2D Character & Banner Artwork State
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);

  // 2D Character Presets (Matching Image 2 Reference)
  const character2DPresets = [
    {
      id: 'ronin',
      name: 'Shadow Ronin (2D Ink Wash)',
      quote: 'Are you ready to show your strength and fight with powerful warriors to take the place of the supreme?',
      bannerImg: roninBanner,
      badgeBg: 'bg-[#EAB308] text-[#18181B]'
    },
    {
      id: 'cyberpunk',
      name: 'Cyber Neon Fighter (2D Vector)',
      quote: 'Unleash sub-14ms kinematic precision and dominate the campus leaderboard arena.',
      bannerImg: cyberpunk2D,
      badgeBg: 'bg-[#1E222A] text-white'
    },
    {
      id: 'athlete',
      name: 'Athletic Titan (Classic)',
      quote: 'Consistency today. A stronger, unstoppable version of yourself tomorrow.',
      bannerImg: userAvatar,
      badgeBg: 'bg-emerald-700 text-white'
    }
  ];

  const currentCharacter = character2DPresets[activeCharacterIndex];

  // Interactive Stat & Mode Selection States
  const [unit, setUnit] = useState(profile?.unit_preference?.toLowerCase() || 'kg');
  const [targetWeight, setTargetWeight] = useState(70);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Helper for safe icon mapping
  const getGoalIcon = (iconName) => {
    if (iconName === 'Clock') return Clock;
    if (iconName === 'Dumbbell') return Dumbbell;
    if (iconName === 'Trophy') return Trophy;
    if (iconName === 'Droplets') return Droplets;
    return Target;
  };

  // Interactive Goals State with Manual Input Support
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
      { id: 1, title: 'Daily TUT Staking', current: 45, target: 60, unit: 'Mins', color: 'bg-[#EAB308]', iconName: 'Clock' },
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
      color: 'bg-[#EAB308]',
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
      { id: 1, title: 'Cyber Ronin (140 BPM)', artist: 'Phonk Industrial', duration: '3:24', bpm: 140, tag: 'Hype' },
      { id: 2, title: 'Sub-Degree Cadence', artist: 'Dark Techno', duration: '2:48', bpm: 132, tag: 'Focus' },
      { id: 3, title: 'MediaPipe Velocity', artist: 'Synthwave', duration: '4:12', bpm: 128, tag: 'Sprint' },
      { id: 4, title: 'Titan Lockout', artist: 'Hardstyle Heavy', duration: '3:05', bpm: 150, tag: 'Beast' },
    ];
  });

  const [activeSongId, setActiveSongId] = useState(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongBpm, setNewSongBpm] = useState(135);
  const [newSongTag, setNewSongTag] = useState('Workout');

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
      tag: newSongTag.trim() || 'Hype'
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

  // Settings Modal Form State
  const [editDisplayName, setEditDisplayName] = useState(profile?.display_name || 'Abhay Sharma');
  const [editUsername, setEditUsername] = useState(profile?.username || 'Abhay');
  const [editTitle, setEditTitle] = useState(profile?.title || 'Kinematic Athlete');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatar_url || '');
  const [editBannerUrl, setEditBannerUrl] = useState(profile?.banner_url || '');

  // Custom Workout Logs List State
  const [historyLogs, setHistoryLogs] = useState([
    { id: 1, type: 'exercise', name: 'Explosive Squats', detail: '50 Reps • 99% Depth', icon: Dumbbell, isAIVerified: true },
    { id: 2, type: 'duel', name: 'vs Elena (1v1 Bout)', detail: '+24 ELO Won', icon: Swords },
    { id: 3, type: 'exercise', name: 'Lockout Push-Ups', detail: '42 Reps • 98% Form', icon: Dumbbell, isAIVerified: true },
  ]);

  // Sync AI Coach Workout History
  useEffect(() => {
    const loadAISessions = () => {
      try {
        const savedHistory = JSON.parse(localStorage.getItem('truerep_workout_history') || '[]');
        if (savedHistory.length > 0) {
          const formattedSaved = savedHistory.map(item => ({
            ...item,
            icon: item.type === 'duel' ? Swords : Dumbbell
          }));
          setHistoryLogs(prev => {
            const combined = [...formattedSaved, ...prev];
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
      avatar_url: editAvatarUrl,
      banner_url: editBannerUrl || currentCharacter.bannerImg,
      unit_preference: unit.toUpperCase()
    });
    setShowSettingsModal(false);
  };

  // Friends & Nearby Opponents List (Matching Image 1 Right Column)
  const friendsList = [
    { id: 1, name: 'Elena R.', status: 'In Duel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', color: 'bg-emerald-600' },
    { id: 2, name: 'Nikitin', status: 'Online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', color: 'bg-emerald-600' },
    { id: 3, name: 'Rohan K.', status: 'In Gym', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', color: 'bg-[#EAB308]' },
    { id: 4, name: 'Priya M.', status: 'Online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', color: 'bg-emerald-600' },
    { id: 5, name: 'Vikram S.', status: 'Offline', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', color: 'bg-slate-400' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F4F1EA] text-[#18181B] p-3 sm:p-6 lg:p-8 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* MAIN CONTAINER FRAMEWORK (TRUEREP WARM CREAM & CRISP WHITE SYSTEM)        */}
      {/* ========================================================================= */}
      <div className="max-w-[1700px] mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* DASHBOARD GRID CONTAINER (MAIN CONTENT + FAR RIGHT FRIENDS STACK)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT & CENTER REGION (lg:col-span-10) */}
          <div className="lg:col-span-10 space-y-6">
            
            {/* TOP ROW: FIRST BLOCK (HERO 2D ARTWORK) + TOP RIGHT QUICK LIST */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {/* =================================================================== */}
              {/* FIRST BLOCK: TWO OVERLAPPING BLOCKS CANVAS CONTAINER (EQUAL HEIGHT) */}
              {/* =================================================================== */}
              <div 
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}
                onMouseLeave={handleMouseUpCanvas}
                className="xl:col-span-8 relative rounded-3xl overflow-hidden bg-[#1E222A] text-white border border-[#1E222A]/20 h-full min-h-[360px] sm:min-h-[400px] shadow-xl flex items-center justify-center p-0 select-none cursor-default"
              >
                
                {/* ----------------------------------------------------------------- */}
                {/* BLOCK 1: FULL CANVAS BACKGROUND BLOCK (BELOW / UNDERNEATH)        */}
                {/* ----------------------------------------------------------------- */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#1E222A]">
                  {/* Full Canvas Banner Image with Framing Transform (Zoom Size + Offset X/Y) */}
                  <img 
                    src={activeBanner || roninBanner} 
                    alt="Full Canvas Banner" 
                    className="w-full h-full object-cover object-center transition-transform duration-75 origin-center"
                    style={{
                      transform: `scale(${bannerScale / 100}) translate(${bannerX}px, ${bannerY}px)`
                    }}
                  />
                  {/* Subtle Gradient Vignette to blend edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141A]/70 via-transparent to-[#12141A]/40 pointer-events-none" />
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* BLOCK 2: CENTER OVERLAPPING IMAGE BLOCK (PFP - POSITIONABLE & ROTATABLE) */}
                {/* ----------------------------------------------------------------- */}
                <div 
                  onMouseDown={handleMouseDownPfp}
                  className={`relative z-20 flex flex-col items-center justify-center p-4 transition-transform duration-75 select-none ${
                    isDraggingPfp ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                  style={{
                    transform: `translate(${pfpX}px, ${pfpY}px) scale(${pfpScale / 100}) rotate(${pfpRotate}deg)`
                  }}
                >
                  <div className="relative group">
                    {/* Positioned 2D Cutout PFP */}
                    <img 
                      src={activeAvatar || samuraiPfp} 
                      alt="Adjustable PFP" 
                      draggable={false}
                      className="h-56 sm:h-64 w-auto object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300 pointer-events-auto"
                    />
                  </div>
                </div>

              </div>

              {/* =================================================================== */}
              {/* SECOND BLOCK: USER CONTROL PANEL & COMPRESSED EDIT OPTIONS (SQUARISH) */}
              {/* =================================================================== */}
              <div className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between space-y-3.5 shadow-sm min-h-[280px] sm:min-h-[320px]">
                
                {/* Header & Edit Profile Modal Trigger */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#EAB308]" />
                    <h3 className="text-xs font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                      User Control Panel
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-1 bg-[#1E222A] hover:bg-[#2A303C] text-[#EAB308] text-[11px] font-bold px-2.5 py-1 rounded-xl transition shadow-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit Profile
                  </button>
                </div>

                {/* User Identity Details */}
                <div className="space-y-1.5 bg-[#F8F6F0] p-3 border border-slate-200 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-black text-[#18181B] tracking-tight leading-none">
                        {profile?.display_name || 'Abhay Sharma'}
                      </h2>
                      <p className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                        @{profile?.username || 'Abhay'} • TR-8842-CYBER
                      </p>
                    </div>
                    <span className="bg-[#EAB308] text-[#18181B] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      LVL {profile?.current_level || 1}
                    </span>
                  </div>

                  {/* Title Badge */}
                  <div className="inline-flex items-center gap-1 bg-[#1E222A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md border-l-2 border-[#EAB308]">
                    <ShieldCheck className="w-3 h-3 text-[#EAB308]" />
                    <span>{profile?.title || 'Kinematic Grandmaster'}</span>
                  </div>
                </div>

                {/* Upload Custom Media Buttons */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Upload className="w-3 h-3 text-[#EAB308]" />
                    Upload Custom Media:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Upload PFP Button */}
                    <label className="flex items-center justify-center gap-1.5 bg-[#1E222A] hover:bg-[#2A303C] text-white text-[11px] font-bold p-2 rounded-xl cursor-pointer transition shadow-xs group">
                      <Camera className="w-3.5 h-3.5 text-[#EAB308] group-hover:scale-110 transition-transform" />
                      <span>Upload PFP</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePfpUpload}
                      />
                    </label>

                    {/* Upload Banner Button */}
                    <label className="flex items-center justify-center gap-1.5 bg-[#1E222A] hover:bg-[#2A303C] text-white text-xs font-bold p-2 rounded-xl cursor-pointer transition shadow-xs group">
                      <ImageIcon className="w-3.5 h-3.5 text-[#EAB308] group-hover:scale-110 transition-transform" />
                      <span>Upload Banner</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleBannerUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Quick Designed Artwork Presets */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold uppercase">
                    <span>Designed Presets:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setActiveAvatar(samuraiPfp)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${activeAvatar === samuraiPfp ? 'border-[#EAB308] bg-[#1E222A] text-white' : 'border-slate-200 bg-[#F8F6F0]'}`}
                      >
                        Ronin PFP
                      </button>
                      <button 
                        onClick={() => setActiveBanner(roninBanner)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${activeBanner === roninBanner ? 'border-[#EAB308] bg-[#1E222A] text-white' : 'border-slate-200 bg-[#F8F6F0]'}`}
                      >
                        Ronin Banner
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compressed Tabbed Canvas Adjustments Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-200 bg-[#F8F6F0] p-3 border rounded-2xl">
                  {/* Tab Bar Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg">
                      <button
                        onClick={() => setActiveEditTab('banner')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-md transition ${
                          activeEditTab === 'banner' ? 'bg-[#1E222A] text-[#EAB308] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" /> Banner Frame
                      </button>
                      <button
                        onClick={() => setActiveEditTab('pfp')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-md transition ${
                          activeEditTab === 'pfp' ? 'bg-[#1E222A] text-[#EAB308] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <User className="w-3 h-3" /> PFP Controls
                      </button>
                    </div>
                    <button 
                      onClick={resetTransforms}
                      className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-[#18181B] bg-white border border-slate-300 px-1.5 py-0.5 rounded-md transition"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Reset
                    </button>
                  </div>

                  {/* Tab 1: Banner Framing Controls */}
                  {activeEditTab === 'banner' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                          <span>Banner Frame Size (Zoom)</span>
                          <span>{bannerScale}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="250" 
                          value={bannerScale}
                          onChange={(e) => setBannerScale(Number(e.target.value))}
                          className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>Shift X</span>
                            <span>{bannerX}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="-200" 
                            max="200" 
                            value={bannerX}
                            onChange={(e) => setBannerX(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>Shift Y</span>
                            <span>{bannerY}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="-150" 
                            max="150" 
                            value={bannerY}
                            onChange={(e) => setBannerY(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: PFP Adjustments Controls */}
                  {activeEditTab === 'pfp' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>PFP Size</span>
                            <span>{pfpScale}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="50" 
                            max="200" 
                            value={pfpScale}
                            onChange={(e) => setPfpScale(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>Angle</span>
                            <span>{pfpRotate}°</span>
                          </div>
                          <input 
                            type="range" 
                            min="-180" 
                            max="180" 
                            value={pfpRotate}
                            onChange={(e) => setPfpRotate(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>Pos X</span>
                            <span>{pfpX}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="-350" 
                            max="350" 
                            value={pfpX}
                            onChange={(e) => setPfpX(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-600 font-semibold">
                            <span>Pos Y</span>
                            <span>{pfpY}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="-220" 
                            max="220" 
                            value={pfpY}
                            onChange={(e) => setPfpY(Number(e.target.value))}
                            className="w-full h-1 bg-slate-300 rounded-lg accent-[#EAB308] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* ========================================================================= */}
            {/* ROW 2: DAY-WISE WORKOUT HEATMAP & YOUR GOALS CARD                        */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              
              {/* ----------------------------------------------------------------- */}
              {/* BLOCK 1: DAY-WISE DATA BLOCK (WEEKLY WORKOUT & KINEMATIC HEATMAP)  */}
              {/* ----------------------------------------------------------------- */}
              <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#EAB308]" />
                    <h3 className="text-sm font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                      Day-Wise Workout Heatmap
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-[#F8F6F0] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                    This Week • 12,340s TUT
                  </span>
                </div>

                {/* Day-by-Day Bar Visualizer */}
                <div className="grid grid-cols-7 gap-2 items-end min-h-[140px] pt-4 pb-2 border-b border-[#E2E8F0]">
                  {[
                    { day: 'Mon', reps: 120, tut: '1,800s', height: '75%', active: true },
                    { day: 'Tue', reps: 95, tut: '1,420s', height: '60%', active: true },
                    { day: 'Wed', reps: 140, tut: '2,100s', height: '90%', active: true, highlighted: true },
                    { day: 'Thu', reps: 80, tut: '1,200s', height: '45%', active: false },
                    { day: 'Fri', reps: 160, tut: '2,400s', height: '100%', active: true },
                    { day: 'Sat', reps: 110, tut: '1,650s', height: '70%', active: true },
                    { day: 'Sun', reps: 40, tut: '600s', height: '30%', active: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-[#18181B] transition">
                        {item.reps}r
                      </div>
                      <div className="w-full bg-[#F8F6F0] h-28 rounded-xl relative overflow-hidden flex items-end p-0.5">
                        <div 
                          className={`w-full rounded-lg transition-all duration-500 ${
                            item.highlighted 
                              ? 'bg-[#EAB308] shadow-md' 
                              : item.active 
                                ? 'bg-[#1E222A] group-hover:bg-[#EAB308]' 
                                : 'bg-slate-300'
                          }`}
                          style={{ height: item.height }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold font-mono ${item.highlighted ? 'text-[#EAB308] font-black' : 'text-slate-600'}`}>
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day Summary Highlights */}
                <div className="flex items-center justify-between text-xs font-mono bg-[#F8F6F0] p-3 rounded-2xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
                    <span className="font-bold text-[#18181B]">Peak Training Day:</span>
                    <span className="text-slate-600">Friday (2,400s TUT • 160 Reps)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#EAB308] bg-[#1E222A] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#EAB308]" /> 100% Automated AI Logging
                  </span>
                </div>

                {/* Recent AI-Verified Rep Logs Stack */}
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
                      Recent Rep Logs & AI Proof
                    </span>
                    <span className="text-[10px] font-mono text-[#EAB308] font-bold bg-[#1E222A] px-2 py-0.5 rounded-md">
                      Auto-Synced
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {historyLogs.map(log => (
                      <div key={log.id} className="bg-[#F8F6F0] border border-[#E2E8F0] p-2.5 rounded-2xl flex items-center justify-between hover:border-slate-400 transition">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#1E222A] text-[#EAB308] flex items-center justify-center font-bold">
                            <Dumbbell className="w-3.5 h-3.5 text-[#EAB308]" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                              <span>{log.name}</span>
                              {log.isAIVerified && (
                                <span className="bg-[#EAB308] text-[#18181B] text-[8px] font-black px-1.5 py-0.5 rounded-md font-mono uppercase">
                                  🤖 AI Verified
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{log.detail}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          Recorded
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* RIGHT COLUMN STACK: YOUR GOALS + YOUR SONGS                       */}
              {/* ----------------------------------------------------------------- */}
              <div className="xl:col-span-5 flex flex-col gap-4 self-start">
                
                {/* BLOCK 2: YOUR GOALS BLOCK */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 flex flex-col justify-start space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#EAB308]" />
                      <h3 className="text-xs font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                        Active Goals
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {goals.filter(g => g.current >= g.target).length} / {goals.length} Complete
                      </span>
                      <button
                        onClick={() => setShowAddGoalModal(true)}
                        className="px-2 py-1 bg-[#1E222A] hover:bg-black text-[#EAB308] text-[10px] font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3" /> Goal
                      </button>
                    </div>
                  </div>

                  {/* Compact Interactive Goals Progress Stack */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {goals.map(goal => {
                      const percent = Math.min(100, Math.max(0, Math.round((goal.current / Math.max(1, goal.target)) * 100)));
                      const IconComp = getGoalIcon(goal.iconName);
                      return (
                        <div key={goal.id} className="group relative space-y-1 bg-[#F8F6F0] p-2.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-400 transition">
                          <div className="flex justify-between items-center text-xs font-bold text-[#18181B]">
                            <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                              <IconComp className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
                              <span className="truncate">{goal.title}</span>
                            </span>
                            
                            {/* Manual Input Controls */}
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <input
                                type="number"
                                step="any"
                                value={goal.current}
                                onChange={(e) => handleUpdateGoalCurrent(goal.id, e.target.value)}
                                className="w-12 text-right px-1 py-0.5 text-[11px] font-mono font-black text-[#18181B] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#EAB308]"
                              />
                              <span className="text-slate-400">/</span>
                              <input
                                type="number"
                                step="any"
                                value={goal.target}
                                onChange={(e) => handleUpdateGoalTarget(goal.id, e.target.value)}
                                className="w-12 text-left px-1 py-0.5 text-[11px] font-mono font-bold text-slate-600 bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#EAB308]"
                              />
                              <span className="text-[10px] text-slate-500 font-bold ml-0.5">{goal.unit}</span>
                              
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition ml-0.5"
                                title="Delete Goal"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Compact Slim Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${goal.color || 'bg-[#EAB308]'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BLOCK 3: YOUR SONGS BLOCK (WORKOUT HYPE PLAYLIST) */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 flex flex-col justify-start space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-[#EAB308]" />
                      <h3 className="text-xs font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                        Your Songs & Hype Tracks
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {songs.length} Tracks
                      </span>
                      <button
                        onClick={() => setShowAddSongModal(true)}
                        className="px-2 py-1 bg-[#1E222A] hover:bg-black text-[#EAB308] text-[10px] font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3" /> Song
                      </button>
                    </div>
                  </div>

                  {/* Playlist Tracks Stack */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {songs.map(song => {
                      const isSelected = activeSongId === song.id;
                      const isPlaying = isSelected && isPlayingSong;
                      return (
                        <div 
                          key={song.id} 
                          className={`group relative p-2.5 rounded-2xl border transition flex items-center justify-between ${
                            isSelected 
                              ? 'bg-[#1E222A] text-white border-[#1E222A] shadow-md' 
                              : 'bg-[#F8F6F0] text-[#18181B] border-[#E2E8F0] hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => togglePlaySong(song.id)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 ${
                                isSelected 
                                  ? 'bg-[#EAB308] text-[#18181B] shadow-sm' 
                                  : 'bg-white text-[#18181B] border border-slate-200 hover:border-[#EAB308]'
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold truncate">{song.title}</span>
                                {isPlaying && (
                                  <span className="flex items-center gap-0.5">
                                    <span className="w-1 h-3 bg-[#EAB308] animate-pulse rounded-full" />
                                    <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                                    <span className="w-1 h-3.5 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono opacity-70 truncate">{song.artist} • {song.bpm} BPM</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                            <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                              isSelected ? 'bg-black/40 text-amber-300' : 'bg-white text-slate-600 border border-slate-200'
                            }`}>
                              {song.tag}
                            </span>
                            <span className="opacity-70">{song.duration}</span>
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition"
                              title="Remove Song"
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

            {/* ========================================================================= */}
            {/* ROW 3: GYMS ACQUIRED & STATISTICAL HEALTH PERFORMANCE DATA               */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              
              {/* ----------------------------------------------------------------- */}
              {/* BLOCK 3: GYMS ACQUIRED (TERRITORY & CAMPUS CONQUEST)               */}
              {/* ----------------------------------------------------------------- */}
              <div className="xl:col-span-6 bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#EAB308]" />
                    <h3 className="text-sm font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                      Gyms Acquired & Staked
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#EAB308] bg-[#1E222A] px-2.5 py-1 rounded-lg">
                    3 Gyms Controlled
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Gym 1 */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between hover:border-slate-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1E222A] text-[#EAB308] flex items-center justify-center font-bold shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B]">Main Campus Power Gym</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Tier 1 Fortress • #1 Leaderboard Staker</p>
                      </div>
                    </div>
                    <span className="bg-[#EAB308] text-[#18181B] text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase">
                      +450 RT/day
                    </span>
                  </div>

                  {/* Gym 2 */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between hover:border-slate-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1E222A] text-emerald-400 flex items-center justify-center font-bold shadow-sm">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B]">Sector-7 Iron Vault</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Tier 2 Outpost • Acquired 3 Days Ago</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase border border-emerald-300">
                      +280 RT/day
                    </span>
                  </div>

                  {/* Gym 3 */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between hover:border-slate-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1E222A] text-cyan-400 flex items-center justify-center font-bold shadow-sm">
                        <Swords className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B]">Cyber Fitness Arena</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Tier 1 Colosseum • Active Bout Contest</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase border border-amber-300">
                      +600 RT/day
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* BLOCK 4: STATISTICAL HEALTH DATA (BIOMETRICS & PERFORMANCE)       */}
              {/* ----------------------------------------------------------------- */}
              <div className="xl:col-span-6 bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#EAB308]" />
                    <h3 className="text-sm font-extrabold text-[#18181B] uppercase tracking-wider font-heading">
                      Health & Statistical Biometrics
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Optimal Health
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Stat 1: Heart Rate */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Kinetic Pulse</span>
                    </div>
                    <div className="text-lg font-black text-[#18181B] font-mono">142 BPM</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Optimal Cardio Zone</div>
                  </div>

                  {/* Stat 2: Form Score */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">3D Form Precision</span>
                    </div>
                    <div className="text-lg font-black text-[#18181B] font-mono">98.4%</div>
                    <div className="text-[10px] text-slate-600 font-semibold">MediaPipe Depth Validated</div>
                  </div>

                  {/* Stat 3: Energy Burn */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Caloric Burn</span>
                    </div>
                    <div className="text-lg font-black text-[#18181B] font-mono">680 kcal</div>
                    <div className="text-[10px] text-amber-600 font-semibold">Active Staking Output</div>
                  </div>

                  {/* Stat 4: Recovery Index */}
                  <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Fatigue Recovery</span>
                    </div>
                    <div className="text-lg font-black text-[#18181B] font-mono">88% Ready</div>
                    <div className="text-[10px] text-cyan-600 font-semibold">Peak Power State</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* FAR RIGHT COLUMN: ACTIVE FRIENDS & NEARBY OPPONENTS STACK (IMAGE 1 FAR RIGHT) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between space-y-4 min-h-[600px] shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Users className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Opponents</span>
                </h3>
                {(nearbyDevices?.length || 0) > 0 && (
                  <span className="bg-[#EAB308] text-[#18181B] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
                    {nearbyDevices.length}
                  </span>
                )}
              </div>

              {/* Vertical Stack of Avatars with Status Badges */}
              <div className="space-y-4">
                {friendsList.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-10 h-10 rounded-2xl object-cover border border-[#E2E8F0] group-hover:scale-105 transition"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${friend.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#18181B] truncate group-hover:text-[#EAB308] transition">{friend.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{friend.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Challenge Action Box */}
            <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3 rounded-2xl text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-600 uppercase font-bold block">1v1 Duel Radar</span>
              <button 
                onClick={() => window.location.hash = '#duels'}
                className="w-full py-2 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Challenge</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 2: COMPLETE PROFILE CUSTOMIZATION MODAL                             */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <form onSubmit={handleSaveSettings} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4 text-[#18181B] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#18181B] uppercase tracking-tight font-heading">Customize 2D Profile</h3>
                <p className="text-[11px] text-slate-500">Pair your profile with 2D character artwork</p>
              </div>
              <button type="button" onClick={() => setShowSettingsModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Abhay Sharma" 
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-bold text-[#18181B]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username (@handle)</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Abhay" 
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-mono text-[#18181B]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Athlete Title</label>
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-bold text-[#18181B]"
                >
                  <option value="Kinematic Athlete">Kinematic Athlete</option>
                  <option value="Shadow Ronin (2D)">Shadow Ronin (2D)</option>
                  <option value="Cyber Neon Fighter (2D)">Cyber Neon Fighter (2D)</option>
                  <option value="Cannon Division Champion">Cannon Division Champion</option>
                  <option value="TrueRep Legend">TrueRep Legend</option>
                </select>
              </div>

              {/* 2D Character Preset Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Preset 2D Characters & Backgrounds</label>
                <div className="grid grid-cols-3 gap-2">
                  {character2DPresets.map((preset, idx) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActiveCharacterIndex(idx);
                        setEditBannerUrl(preset.bannerImg);
                      }}
                      className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeCharacterIndex === idx ? 'border-[#EAB308] scale-[1.02] shadow-md' : 'border-[#E2E8F0] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.bannerImg} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                        <span className="text-[9px] font-extrabold text-white uppercase">{preset.id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custom Banner / 2D Artwork URL</label>
                <input 
                  type="url" 
                  value={editBannerUrl}
                  onChange={(e) => setEditBannerUrl(e.target.value)}
                  placeholder="https://..." 
                  className="w-full mt-1 p-2.5 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-slate-400 font-mono text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-md mt-2"
            >
              Save 2D Profile Setup
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD CUSTOM GOAL MODAL                                            */}
      {/* ========================================================================= */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddGoalSubmit} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4 text-[#18181B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-tight font-heading flex items-center gap-2">
                <Target className="w-4 h-4 text-[#EAB308]" /> Set Custom Fitness Goal
              </h3>
              <button type="button" onClick={() => setShowAddGoalModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Goal Title</label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Bench Press 100kg"
                  className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-bold text-[#18181B] focus:outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current</label>
                  <input
                    type="number"
                    step="any"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono font-bold text-[#18181B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target</label>
                  <input
                    type="number"
                    step="any"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono font-bold text-[#18181B] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                  <input
                    type="text"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="Reps / kg"
                    className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono text-[#18181B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Save Active Goal</span>
            </button>
          </form>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 4: ADD CUSTOM SONG MODAL                                            */}
      {/* ========================================================================= */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddSongSubmit} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4 text-[#18181B]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-tight font-heading flex items-center gap-2">
                <Music className="w-4 h-4 text-[#EAB308]" /> Add Workout Track
              </h3>
              <button type="button" onClick={() => setShowAddSongModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Song Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="e.g. Eye of the Tiger / Phonk Beat"
                  className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-bold text-[#18181B] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Artist / Genre</label>
                <input
                  type="text"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  placeholder="e.g. Survivor / Dark Techno"
                  className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono text-[#18181B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={newSongBpm}
                    onChange={(e) => setNewSongBpm(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono font-bold text-[#18181B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vibe Tag</label>
                  <input
                    type="text"
                    value={newSongTag}
                    onChange={(e) => setNewSongTag(e.target.value)}
                    placeholder="Hype / Focus"
                    className="w-full mt-1 p-2 text-xs bg-[#F8F6F0] border border-[#E2E8F0] rounded-xl font-mono text-[#18181B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Add to Playlist</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
