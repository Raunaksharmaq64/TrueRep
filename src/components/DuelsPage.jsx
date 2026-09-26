import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Trophy,
  UserCheck,
  Lock,
  Copy,
  Share2,
  Heart,
  Activity,
  Wind,
  Bike,
  ShieldCheck,
  Zap,
  Clock,
  Swords,
  Flame,
  Play,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Crown,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  Laptop,
  Radio,
  Edit2,
  Check,
  Globe,
  Wifi,
  Video,
  VideoOff
} from 'lucide-react';
import opponentImg from '../assets/athlete.jpg';
import fitnessPlateImg from '../assets/fitness_plate.jpg';
import samuraiPfp from '../assets/samurai_pfp.png';
import PoseCanvas from './camera/PoseCanvas';
import LevelUpModal from './reward/LevelUpModal';
import { useWebSpeech, useNearbyDevices, useAuth } from '../hooks';
import { audioAlerts, matchmakeLobby, calculateThreeScores, calculateCompositeMatchScore } from '../utils';

// Roster of available competitive rivals for matchmaking with 3-Tier Scores (AFS, MMR, RR)
const RIVAL_ROSTER = [
  {
    id: 'elena',
    name: 'Elena Vance',
    mmr_rating: 1080,
    afs_score: 108.00,
    rr_rating: 80,
    rank_tier: 'Bronze II',
    elo: 1080,
    winRate: '68%',
    streak: 4,
    bpm: 168,
    wattage: 395,
    ping: '14ms',
    distance: '45m away',
    status: 'Matched Rival',
    avatar: opponentImg
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    mmr_rating: 1150,
    afs_score: 115.00,
    rr_rating: 50,
    rank_tier: 'Silver I',
    elo: 1150,
    winRate: '74%',
    streak: 6,
    bpm: 172,
    wattage: 415,
    ping: '9ms',
    distance: '120m away',
    status: 'Nearby Node',
    avatar: opponentImg
  },
  {
    id: 'chloe',
    name: 'Chloé Laurent',
    mmr_rating: 1040,
    afs_score: 104.00,
    rr_rating: 40,
    rank_tier: 'Bronze I',
    elo: 1040,
    winRate: '71%',
    streak: 2,
    bpm: 162,
    wattage: 380,
    ping: '22ms',
    distance: '210m away',
    status: 'Nearby Node',
    avatar: opponentImg
  },
  {
    id: 'alex',
    name: 'Alex Rivers',
    mmr_rating: 1220,
    afs_score: 122.00,
    rr_rating: 20,
    rank_tier: 'Silver II',
    elo: 1220,
    winRate: '80%',
    streak: 8,
    bpm: 175,
    wattage: 430,
    ping: '11ms',
    distance: '85m away',
    status: 'Elite Challenger',
    avatar: opponentImg
  },
  {
    id: 'viktor',
    name: 'Viktor Krum',
    mmr_rating: 980,
    afs_score: 98.00,
    rr_rating: 80,
    rank_tier: 'Iron I',
    elo: 980,
    winRate: '58%',
    streak: 1,
    bpm: 155,
    wattage: 340,
    ping: '18ms',
    distance: '320m away',
    status: 'Novice Rival',
    avatar: opponentImg
  }
];

// Helper: format latency as a colored badge label
const formatLatency = (ms) => {
  if (ms === undefined || ms === null) return null;
  if (ms < 50) return { label: `${ms}ms`, quality: 'excellent' };
  if (ms < 120) return { label: `${ms}ms`, quality: 'good' };
  if (ms < 250) return { label: `${ms}ms`, quality: 'fair' };
  return { label: `${ms}ms`, quality: 'poor' };
};

const latencyQualityClass = (quality) => ({
  excellent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
  good: 'text-cyan-400    border-cyan-500/40    bg-cyan-950/40',
  fair: 'text-amber-400   border-amber-500/40   bg-amber-950/40',
  poor: 'text-rose-400    border-rose-500/40    bg-rose-950/40',
}[quality] || 'text-slate-400 border-slate-700 bg-slate-900/40');

const latencyDot = (quality) => ({
  excellent: 'bg-emerald-400',
  good: 'bg-cyan-400',
  fair: 'bg-amber-400',
  poor: 'bg-rose-500',
}[quality] || 'bg-slate-500');

function DuelsPage({ onNavigate }) {
  // Duel Stage: 'lobby' | 'matchmaking' | 'match_locked' | 'live_battle' | 'match_summary'
  const [duelStage, setDuelStage] = useState('lobby');
  const [matchMode, setMatchMode] = useState('quick'); // 'quick' | 'nearby' | 'private' | 'bot'
  const [activeLobbyTab, setActiveLobbyTab] = useState('quick'); // 'quick' | 'nearby'
  const [exercise, setExercise] = useState('pushup'); // 'pushup' | 'squat' | 'jumpingjack'

  // Matchmaking & Timer states
  const [queueTimer, setQueueTimer] = useState(3.0);
  const [boutCountdown, setBoutCountdown] = useState(3);
  const [matchTimeLeft, setMatchTimeLeft] = useState(60);
  const [copied, setCopied] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Private room passphrase
  const [roomCode, setRoomCode] = useState('FIT-4029');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [roomMessage, setRoomMessage] = useState(null);

  // Selected Bot Level
  const [botDifficulty, setBotDifficulty] = useState('spartan'); // 'rookie' | 'spartan' | 'titan'

  // Active Opponent State (Default selected from roster)
  const [selectedRivalId, setSelectedRivalId] = useState('elena');
  const [opponent, setOpponent] = useState(RIVAL_ROSTER[0]);

  // Reps & Scores
  const [playerReps, setPlayerReps] = useState(0);
  const [opponentReps, setOpponentReps] = useState(0);
  const [playerTelemetry, setPlayerTelemetry] = useState({
    reps: 0,
    state: 'IDLE',
    feedback: 'Ready for duel',
    isFormValid: true,
    isComboActive: false,
    consecutiveCleanReps: 0,
    elbowAngle: 165,
    spineAngle: 172
  });

  // Voice coach hook
  const { speak } = useWebSpeech(voiceEnabled);

  // Refs for intervals & lead tracking
  const opponentIntervalRef = useRef(null);
  const matchClockIntervalRef = useRef(null);
  const lastLeadRef = useRef(null);

  // Decoupled rep broadcast queue — avoids blocking Supabase sends inside the AI render loop
  // The PoseCanvas render loop calls onRepUpdate which writes here; a dedicated interval drains this.
  const pendingRepBroadcastRef = useRef(null); // { reps, telemetry } or null
  const repBroadcastIntervalRef = useRef(null);

  // Optional live peer video streaming
  const [cameraStreamEnabled, setCameraStreamEnabled] = useState(false);
  const opponentVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerCallRef = useRef(null);

  // Multi-Device Real-Time Discovery & Signaling Hook
  const {
    myDevice,
    nearbyDevices,
    activeChallenge,
    outgoingChallenge,
    connectedOpponent,
    boutEvent,
    supabaseStatus,
    currentRoomCode,
    latencyMap,
    updateDeviceName,
    joinRoomCode,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    sendRepUpdate,
    sendBoutEnd,
    clearBoutEvent,
    reconnectAfterBout
  } = useNearbyDevices();

  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false);
  const [deviceNameInput, setDeviceNameInput] = useState(myDevice?.name || 'Athlete Node');
  const [showNetworkDiagnostics, setShowNetworkDiagnostics] = useState(false);

  // Auto-reconnect to presence network whenever we return to lobby —
  // ensures other devices appear without a page refresh after a bout ends.
  useEffect(() => {
    if (duelStage === 'lobby') {
      reconnectAfterBout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelStage]);


  const finishMatch = useCallback(() => {
    if (opponentIntervalRef.current) clearTimeout(opponentIntervalRef.current);
    if (matchClockIntervalRef.current) clearInterval(matchClockIntervalRef.current);
    setDuelStage('match_summary');
  }, []);

  // Auto-connect to WebRTC Peer Mesh room code
  useEffect(() => {
    joinRoomCode(roomCode);
  }, [roomCode, joinRoomCode]);

  // Sync local device name input
  useEffect(() => {
    if (myDevice?.name) {
      setDeviceNameInput(myDevice.name);
    }
  }, [myDevice?.name]);

  // Handle Multi-Device Real-Time Events
  useEffect(() => {
    if (!boutEvent) return;

    if (boutEvent.type === 'CHALLENGE_ACCEPTED' && boutEvent.opponent) {
      setOpponent({
        id: boutEvent.opponent.id,
        name: boutEvent.opponent.name,
        elo: boutEvent.opponent.elo || 2480,
        winRate: '78%',
        streak: 5,
        bpm: 168,
        wattage: 410,
        ping: '12ms',
        status: 'Real-Time Connected Node',
        avatar: opponentImg
      });
      setMatchMode('nearby');

      // Only transition to match_locked if currently in lobby or matchmaking
      setDuelStage((prevStage) => {
        if (prevStage === 'lobby' || prevStage === 'matchmaking') {
          audioAlerts.playValidRepChime();
          if (voiceEnabled) speak(`Bout connected with ${boutEvent.opponent.name}! Prepare for 60 second duel!`);
          return 'match_locked';
        }
        return prevStage;
      });

      clearBoutEvent();
    }

    if (boutEvent.type === 'REP_EVENT') {
      console.log('[TrueRep UI] Live opponent rep update received:', boutEvent.reps);
      setOpponentReps(boutEvent.reps);
      audioAlerts.playDepthDing();
      clearBoutEvent();
    }

    if (boutEvent.type === 'BOUT_END') {
      finishMatch();
      if (voiceEnabled) speak('Opponent concluded the bout!');
      clearBoutEvent();
    }
  }, [boutEvent, voiceEnabled, speak, finishMatch, clearBoutEvent]);

  const selectRival = useCallback((rival) => {
    setSelectedRivalId(rival.id);
    setOpponent(rival);
    audioAlerts.playDepthDing();
  }, []);

  const handleGenerateRoomCode = useCallback(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `FIT-${randomNum}`;
    setRoomCode(newCode);
    joinRoomCode(newCode);
    setRoomMessage(`Generated room ${newCode}! Enter this code on your phone to connect.`);
    setTimeout(() => setRoomMessage(null), 4000);
  }, [joinRoomCode]);

  const handleJoinPrivateRoom = useCallback((e) => {
    if (e) e.preventDefault();
    const targetCode = inputRoomCode.trim().toUpperCase() || roomCode;
    setRoomCode(targetCode);
    joinRoomCode(targetCode);
    setRoomMessage(`Connecting to Room ${targetCode}...`);
    audioAlerts.playValidRepChime();
  }, [inputRoomCode, roomCode, joinRoomCode]);


  // 1. MATCHMAKING QUEUE COUNTDOWN
  useEffect(() => {
    let timerId;
    if (duelStage === 'matchmaking') {
      timerId = setInterval(() => {
        setQueueTimer((prev) => {
          if (prev <= 0.2) {
            clearInterval(timerId);
            handleLockMatch();
            return 0;
          }
          return parseFloat((prev - 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(timerId);
  }, [duelStage]);

  // 2. BOUT COUNTDOWN (3..2..1.. START!)
  useEffect(() => {
    let timerId;
    if (duelStage === 'match_locked') {
      setBoutCountdown(3);
      audioAlerts.playStartHorn();
      if (voiceEnabled) speak('Match locked! Prepare for 60 second duel!');

      timerId = setInterval(() => {
        setBoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            startLiveMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [duelStage]);

  // 3. AUTHORITATIVE LIVE MATCH CLOCK (60s -> 0s)
  useEffect(() => {
    if (duelStage === 'live_battle') {
      matchClockIntervalRef.current = setInterval(() => {
        setMatchTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(matchClockIntervalRef.current);
            finishMatch();
            return 0;
          }

          if (prev === 30 && voiceEnabled) {
            speak('Halfway there! 30 seconds remaining!');
          } else if (prev === 10 && voiceEnabled) {
            speak('Final 10 seconds! Finish strong!');
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (matchClockIntervalRef.current) clearInterval(matchClockIntervalRef.current);
    };
  }, [duelStage, voiceEnabled, finishMatch]);

  // 4. OPPONENT AI REP SIMULATION (For Bot / Quick mode when no real peer is connected)
  useEffect(() => {
    if (duelStage === 'live_battle' && !connectedOpponent && matchMode !== 'nearby') {
      const simulateOpponentRep = () => {
        setOpponentReps((prev) => prev + 1);
        setOpponent((prev) => ({
          ...prev,
          bpm: Math.min(185, prev.bpm + Math.floor(Math.random() * 3)),
          wattage: 380 + Math.floor(Math.random() * 40)
        }));
      };

      let minDelay = 2200;
      let maxDelay = 3800;

      if (matchMode === 'bot') {
        if (botDifficulty === 'rookie') { minDelay = 3000; maxDelay = 4500; }
        if (botDifficulty === 'titan') { minDelay = 1800; maxDelay = 2600; }
      }

      const scheduleNextRep = () => {
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        opponentIntervalRef.current = setTimeout(() => {
          if (duelStage === 'live_battle') {
            simulateOpponentRep();
            scheduleNextRep();
          }
        }, delay);
      };

      scheduleNextRep();
    }

    return () => {
      if (opponentIntervalRef.current) clearTimeout(opponentIntervalRef.current);
    };
  }, [duelStage, matchMode, botDifficulty, connectedOpponent]);

  // 5. LEAD CHANGE ANNOUNCEMENTS
  useEffect(() => {
    if (duelStage === 'live_battle') {
      const delta = playerReps - opponentReps;
      let currentLead = 'tied';
      if (delta > 0) currentLead = 'player';
      if (delta < 0) currentLead = 'opponent';

      if (lastLeadRef.current && lastLeadRef.current !== currentLead) {
        if (currentLead === 'player' && voiceEnabled) {
          speak('You took the lead! Keep pushing!');
        } else if (currentLead === 'opponent' && voiceEnabled) {
          speak('Opponent took the lead! Push harder!');
        }
      }
      lastLeadRef.current = currentLead;
    }
  }, [playerReps, opponentReps, duelStage, voiceEnabled, speak]);

  // 6. MATCH SUMMARY AUDIO & VOICE ANNOUNCEMENT
  useEffect(() => {
    if (duelStage === 'match_summary') {
      if (playerReps >= opponentReps) {
        audioAlerts.playValidRepChime();
      } else {
        audioAlerts.playWarningBuzz();
      }

      if (voiceEnabled) {
        if (playerReps > opponentReps) {
          speak('Victory! Phenomenal performance!');
        } else if (playerReps < opponentReps) {
          speak('Match finished! Tough battle!');
        } else {
          speak('Tie match! Outstanding effort!');
        }
      }
    }
  }, [duelStage, playerReps, opponentReps, voiceEnabled, speak]);

  const { profile, processDuelResult } = useAuth();
  const [rewardData, setRewardData] = useState(null);

  // Compute 3 competitive scores for logged-in user
  const userThreeScores = useMemo(() => {
    return calculateThreeScores(profile || {});
  }, [profile]);

  useEffect(() => {
    if (duelStage === 'match_summary' && processDuelResult) {
      const isWin = playerReps >= opponentReps;
      const reward = processDuelResult({
        isWin,
        userReps: playerReps,
        opponentReps,
        tutSeconds: 60,
        avgFormScore: 0.92
      });
      if (reward?.didLevelUp || reward?.didRankUp) {
        setRewardData({
          type: reward.didRankUp ? 'RANK_UP' : 'LEVEL_UP',
          ...reward
        });
      }
    }
  }, [duelStage]);

  const handleStartQueue = useCallback(() => {
    setQueueTimer(3.0);
    setDuelStage('matchmaking');

    if (matchMode === 'bot') {
      let botInfo = { name: 'Spartan_AI (Bot)', mmr_rating: 1250, afs_score: 125.00, rr_rating: 50, rank_tier: 'Silver II', elo: 1250, winRate: '72%', streak: 5, bpm: 160, wattage: 410, status: 'AI Ghost Simulation' };
      if (botDifficulty === 'rookie') { botInfo = { name: 'Rookie_AI (Bot)', mmr_rating: 950, afs_score: 95.00, rr_rating: 50, rank_tier: 'Iron I', elo: 950, winRate: '54%', streak: 1, bpm: 145, wattage: 320, status: 'Novice Simulation' }; }
      if (botDifficulty === 'titan') { botInfo = { name: 'Titan_AI (Bot)', mmr_rating: 1850, afs_score: 185.00, rr_rating: 50, rank_tier: 'Diamond I', elo: 1850, winRate: '88%', streak: 12, bpm: 178, wattage: 460, status: 'Master Simulation' }; }
      const cms = calculateCompositeMatchScore(userThreeScores, botInfo);
      setOpponent({ ...botInfo, cms });
    } else {
      // 3-Tier Lobby Matchmaking: Find closest rival in MMR & AFS range by CMS
      const { bestMatch } = matchmakeLobby(userThreeScores, RIVAL_ROSTER, 350);
      const matched = bestMatch || RIVAL_ROSTER[0];
      setSelectedRivalId(matched.id);
      setOpponent(matched);
    }
  }, [matchMode, botDifficulty, userThreeScores]);

  const handleLockMatch = useCallback(() => {
    setDuelStage('match_locked');
  }, []);

  const handleCancelQueue = useCallback(() => {
    if (connectedOpponent) {
      sendBoutEnd();
    }
    setDuelStage('lobby');
    setQueueTimer(3.0);
    if (opponentIntervalRef.current) clearTimeout(opponentIntervalRef.current);
    if (matchClockIntervalRef.current) clearInterval(matchClockIntervalRef.current);
  }, [connectedOpponent, sendBoutEnd]);

  const startLiveMatch = useCallback(() => {
    setPlayerReps(0);
    setOpponentReps(0);
    setMatchTimeLeft(60);
    setDuelStage('live_battle');
    if (voiceEnabled) speak('60 seconds on the clock! Fight!');
  }, [voiceEnabled, speak]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomCode]);

  const handleManualRep = useCallback(() => {
    if (duelStage === 'live_battle') {
      setPlayerReps((prev) => {
        const nextReps = prev + 1;
        sendRepUpdate(nextReps, playerTelemetry);
        return nextReps;
      });
      audioAlerts.playValidRepChime();
    }
  }, [duelStage, sendRepUpdate, playerTelemetry]);

  const handleTelemetryUpdate = useCallback((data) => {
    setPlayerTelemetry(data);
  }, []);

  // Write to ref — never calls Supabase directly from inside the AI render loop.
  // The repBroadcastInterval (below) drains the queue on a clean JS tick.
  const handleRepUpdate = useCallback((count) => {
    setPlayerReps(count);
    pendingRepBroadcastRef.current = { reps: count };
  }, []);

  // Dedicated broadcast interval: drains pendingRepBroadcastRef every 200ms.
  // Completely decoupled from the 60ms render loop so Supabase sends happen on
  // a clean event-loop tick where the JS thread isn't stalled by MediaPipe.
  useEffect(() => {
    repBroadcastIntervalRef.current = setInterval(() => {
      const pending = pendingRepBroadcastRef.current;
      if (pending !== null) {
        sendRepUpdate(pending.reps, playerTelemetry);
        pendingRepBroadcastRef.current = null;
      }
    }, 200);

    return () => {
      if (repBroadcastIntervalRef.current) clearInterval(repBroadcastIntervalRef.current);
    };
  }, [sendRepUpdate, playerTelemetry]);

  const repDelta = playerReps - opponentReps;
  const isPlayerAhead = repDelta > 0;
  const isOpponentAhead = repDelta < 0;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F4F1EA] text-[#18181B] px-3 sm:px-6 lg:px-12 py-4 sm:py-6 select-none flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-4 sm:space-y-6">

        {/* ========================================================= */}
        {/* 1. LOBBY & INTERACTIVE MATCHMAKING STAGE */}
        {/* ========================================================= */}
        {(duelStage === 'lobby' || duelStage === 'matchmaking' || duelStage === 'match_locked') && (
          <div className="w-full relative rounded-[2.5rem] bg-white border border-[#E2E8F0] shadow-sm overflow-hidden p-4 sm:p-8 min-h-[600px] sm:min-h-[660px] flex flex-col justify-between">

            {/* ── TOP CONTROL CAPSULE BAR ── */}
            <div className="w-full flex flex-col xs:flex-row items-center justify-between gap-3 z-30 mb-6">

              {/* Center Capsule Pill Toggle */}
              <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <button
                  onClick={() => { setActiveLobbyTab('quick'); setMatchMode('quick'); }}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${activeLobbyTab === 'quick'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black'
                    }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Quick Battles</span>
                </button>

                <button
                  onClick={() => { setActiveLobbyTab('nearby'); setMatchMode('nearby'); }}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${activeLobbyTab === 'nearby'
                      ? 'bg-[#1E222A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-black'
                    }`}
                >
                  <Radio className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Nearby Nodes ({nearbyDevices.length})</span>
                </button>
              </div>

              {/* Right Capsule Button (My Profile / Node Status) */}
              <div className="flex items-center gap-2 z-30">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('home')}
                    className="rounded-full bg-white border border-[#E2E8F0] hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                    <span>Home</span>
                  </button>
                )}
                <div className="rounded-full bg-white border border-[#E2E8F0] px-3.5 py-1.5 text-xs font-semibold text-[#18181B] flex items-center gap-2 shadow-sm">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#1E222A] flex-shrink-0">
                    <img src={profile?.avatar_url || samuraiPfp} alt="User PFP" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-[#18181B] truncate max-w-[130px]">{profile?.display_name || profile?.username || 'Abhay Sharma'}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[#18181B] font-bold font-mono">{roomCode}</span>
                </div>
              </div>

            </div>

            {/* ── MAIN CONTENT SPLIT VIEW ── */}
            <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 z-20">

              {/* LEFT FLOATING BENTO MATCH CARD (lg:col-span-5) */}
              <div className="lg:col-span-5 w-full bg-[#F8F6F0] border border-[#E2E8F0] p-5 sm:p-6 rounded-3xl shadow-sm space-y-4 text-left z-20 transition-all">

                {activeLobbyTab === 'quick' ? (
                  <>
                    {/* Organizer / Opponent Host Profile with 3-Tier Scores */}
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1E222A] flex-shrink-0 shadow-sm">
                          <img src={opponent.avatar || opponentImg} alt={opponent.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                            <span>{opponent.name}</span>
                            <span className="bg-[#1E222A] text-[#EAB308] text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">{opponent.rank_tier || 'Bronze I'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            MMR {opponent.mmr_rating || opponent.elo || 1080} • AFS {opponent.afs_score || 108.0}
                          </div>
                        </div>
                      </div>

                      {/* Composite Match Score (CMS) Parity Badge */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-2.5 py-1 rounded-xl text-right">
                        <div className="text-[9px] font-mono font-bold uppercase">CMS Fit</div>
                        <div className="text-xs font-bold font-mono text-emerald-600">
                          {calculateCompositeMatchScore(userThreeScores, opponent)}%
                        </div>
                      </div>
                    </div>

                    {/* My 3-Tier Scores Summary Bar */}
                    <div className="bg-white border border-[#E2E8F0] p-2.5 rounded-2xl grid grid-cols-3 gap-1 text-center shadow-xs">
                      <div className="border-r border-slate-100 pr-1">
                        <div className="text-[9px] font-mono text-slate-400 font-bold">MY AFS</div>
                        <div className="text-xs font-bold text-[#18181B] font-mono">{userThreeScores.afs_score}</div>
                      </div>
                      <div className="border-r border-slate-100 pr-1">
                        <div className="text-[9px] font-mono text-slate-400 font-bold">MY MMR</div>
                        <div className="text-xs font-bold text-[#18181B] font-mono">{userThreeScores.mmr_rating}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-400 font-bold">TIER</div>
                        <div className="text-xs font-bold text-amber-600 truncate">{userThreeScores.rank_tier}</div>
                      </div>
                    </div>

                    {/* Location Subtitle */}
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <span>Shōten • 123 Sakura Park, Sakyo-ku, Kyoto</span>
                    </div>

                    {/* Exercise Selector Pills */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-[#18181B]" /> Choose Discipline
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'pushup', label: 'Push-Ups' },
                          { key: 'squat', label: 'Squats' },
                          { key: 'jumpingjack', label: 'Jacks' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setExercise(key)}
                            className={`py-2 rounded-2xl text-xs font-semibold transition-all ${exercise === key
                                ? 'bg-[#1E222A] text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-[#E2E8F0] hover:text-black'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Matchmaking Progress Bar */}
                    {duelStage === 'matchmaking' && (
                      <div className="space-y-2 py-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Connecting peer handshake...</span>
                          <span className="text-[#18181B] font-bold">{queueTimer.toFixed(1)}s</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#EAB308] rounded-full transition-all duration-100"
                            style={{ width: `${(1 - queueTimer / 3.0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Bout Countdown */}
                    {duelStage === 'match_locked' && (
                      <div className="text-center py-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">BOUT STARTS IN</div>
                        <div className="text-5xl font-black text-[#18181B] font-mono">{boutCountdown}</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-1">
                      {duelStage === 'matchmaking' ? (
                        <button
                          onClick={handleCancelQueue}
                          className="w-full py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Cancel Queue
                        </button>
                      ) : duelStage === 'match_locked' ? (
                        <button
                          onClick={handleLockMatch}
                          className="w-full py-3.5 rounded-2xl bg-[#EAB308] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                          disabled
                        >
                          Starting Match...
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => setActiveLobbyTab('nearby')}
                            className="w-full py-3 rounded-2xl bg-white text-slate-800 border border-[#E2E8F0] text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Radio className="w-3.5 h-3.5 text-[#18181B]" />
                            Check on map
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handleStartQueue}
                              className="py-3 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#18181B] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Search className="w-3.5 h-3.5" />
                              Queue Up
                            </button>
                            <button
                              onClick={handleLockMatch}
                              className="py-3 rounded-2xl bg-[#1E222A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current text-[#EAB308]" />
                              Join game
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 font-medium text-center flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Free event • Verified AI Edge Referee</span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* NEARBY DEVICES & QR CODE SCANNER VIEW */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                      <div className="text-xs font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#EAB308]" />
                        Nearby Devices ({nearbyDevices.length})
                      </div>
                      <button
                        onClick={() => reconnectAfterBout()}
                        className="text-[10px] text-slate-600 hover:text-black font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh
                      </button>
                    </div>

                    {/* QR Code section */}
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-16 h-16 rounded-xl bg-white p-1 flex-shrink-0 border border-slate-200">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}?room=${roomCode}`)}&bgcolor=ffffff&color=18181b&qzone=1`}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-slate-500">ROOM PASSPHRASE</div>
                        <div className="text-lg font-bold text-[#18181B] font-mono">{roomCode}</div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={handleCopyCode} className="text-[9px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                            {copied ? 'Copied!' : 'Copy Code'}
                          </button>
                          <button onClick={handleGenerateRoomCode} className="text-[9px] text-white bg-[#1E222A] px-2 py-0.5 rounded-full font-semibold">
                            New Code
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Devices list */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {nearbyDevices.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-medium">
                          Scanning for nearby devices on room network...
                        </div>
                      ) : (
                        nearbyDevices.map((device) => {
                          const isChallenging = outgoingChallenge?.targetDeviceId === device.id;
                          const latencyMs = latencyMap[device.id];
                          const latencyInfo = formatLatency(latencyMs);
                          return (
                            <div key={device.id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-[#E2E8F0] shadow-sm">
                              <div>
                                <div className="text-xs font-bold text-[#18181B]">{device.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{device.elo} ELO • {latencyInfo?.label || 'pinging...'}</div>
                              </div>
                              <button
                                onClick={() => { sendChallenge(device, exercise); }}
                                disabled={isChallenging}
                                className="px-3 py-1.5 rounded-full bg-[#1E222A] hover:bg-black text-white text-[10px] font-semibold uppercase"
                              >
                                {isChallenging ? 'Inviting...' : 'Battle'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT MAIN HERO SECTION */}
              <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 z-10 py-6 lg:py-12 pl-0 lg:pl-8">

                {/* Category Label */}
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest font-mono">
                  JOIN GAME
                </div>

                {/* Giant Stacked Bold Headline */}
                <h1 className="font-hero-slant text-5xl sm:text-7xl lg:text-8xl font-bold text-[#18181B] uppercase leading-[0.92] tracking-tight max-w-xl">
                  FIND YOUR <br />
                  <span className="text-[#64748B] font-light">STREET</span> <br />
                  <span>ATHLETES</span>
                </h1>

                {/* Bottom Signature Tag */}
                <div className="w-full flex items-center justify-between pt-6 pr-4">
                  <div className="text-xs font-semibold text-slate-600 bg-[#F8F6F0] px-3 py-1.5 rounded-full border border-[#E2E8F0]">
                    TRUEREP 1v1 MATCH
                  </div>

                  <div className="text-right text-slate-400 font-serif italic text-2xl tracking-tight opacity-70 rotate-[-4deg] select-none pointer-events-none">
                    TrueRep 1v1 Arena
                  </div>
                </div>

              </div>

            </div>

            <img
              src={fitnessPlateImg}
              alt="3D Fitness Weight Plate Asset"
              className="absolute -right-16 -bottom-16 sm:-right-12 sm:-bottom-12 lg:-right-8 lg:-bottom-8 w-[480px] sm:w-[620px] lg:w-[680px] opacity-40 pointer-events-none z-0 rotate-12 transition-all duration-1000"
            />

          </div>
        )}



        {/* ========================================================= */}
        {/* 2. LIVE 1v1 DUEL BATTLE ARENA                             */}
        {/* ========================================================= */}
        {duelStage === 'live_battle' && (
          <div className="w-full space-y-6">

            {/* TOP AUTHORITATIVE SCORE BAR */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-[#18181B]">

              {/* Player Score & Exit */}
              <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4 w-full md:w-auto border-b md:border-b-0 border-[#E2E8F0] pb-3 md:pb-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelQueue}
                    className="p-2 sm:p-2.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Exit Duel & Return to Lobby"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Exit</span>
                  </button>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#1E222A] shadow-sm flex-shrink-0">
                    <img src={profile?.avatar_url || samuraiPfp} alt="Your PFP" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[130px]">
                      {(profile?.display_name || profile?.username || 'YOU').toUpperCase()}
                    </div>
                    <div className="text-2xl sm:text-4xl font-extrabold font-mono text-[#18181B] tracking-tight leading-none mt-0.5">
                      {playerReps}
                    </div>
                  </div>
                </div>

                {playerTelemetry.isComboActive && (
                  <div className="bg-[#EAB308] text-[#18181B] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>1.5x</span>
                  </div>
                )}
              </div>

              {/* Match Timer & Status Lead Pill */}
              <div className="flex flex-col items-center py-1 md:py-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] animate-ping" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">
                    LIVE DUEL • 60S SPRINT
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#18181B] tracking-tight my-0.5">
                  00:{matchTimeLeft < 10 ? `0${matchTimeLeft}` : matchTimeLeft}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                  <div className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm ${isPlayerAhead
                      ? 'bg-emerald-600 text-white'
                      : isOpponentAhead
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#1E222A] text-white'
                    }`}>
                    {isPlayerAhead
                      ? `🔥 +${repDelta} AHEAD`
                      : isOpponentAhead
                        ? `⚠️ -${Math.abs(repDelta)} BEHIND`
                        : '⚔️ TIED'}
                  </div>
                </div>
              </div>

              {/* Opponent Score */}
              <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse text-right w-full md:w-auto justify-between md:justify-start border-t md:border-t-0 border-[#E2E8F0] pt-3 md:pt-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#1E222A] shadow-sm flex-shrink-0">
                  <img src={opponent.avatar || opponentImg} alt={opponent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {opponent.name.toUpperCase()}
                  </div>
                  <div className="text-2xl sm:text-4xl font-extrabold font-mono text-[#18181B] tracking-tight leading-none mt-0.5">
                    {opponentReps}
                  </div>
                </div>
              </div>

            </div>

            {/* SPLIT SCREEN VIEWPORTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 flex flex-col space-y-3 shadow-sm relative">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[#1E222A] flex-shrink-0">
                      <img src={profile?.avatar_url || samuraiPfp} alt="PFP" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                      {(profile?.display_name || profile?.username || 'YOUR').toUpperCase()}'S ARENA • AI REFEREE
                    </span>
                  </div>

                  <button
                    onClick={handleManualRep}
                    className="px-3 py-1.5 rounded-full bg-[#1E222A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+1 Rep (Test)</span>
                  </button>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#1E222A] border border-[#1E222A]">
                  <PoseCanvas
                    exercise={exercise}
                    onRepUpdate={handleRepUpdate}
                    onTelemetryUpdate={handleTelemetryUpdate}
                    onVoiceFeedback={speak}
                  />
                </div>

                <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">Form Precision:</span>
                  <span className={playerTelemetry.isFormValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {playerTelemetry.isFormValid ? '✓ CLEAN' : '⚠️ FAULT LATCHED'}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 flex flex-col space-y-3 shadow-sm relative">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1E222A]" />
                    <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                      OPPONENT ARENA • {opponent.name.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCameraStreamEnabled(prev => !prev)}
                      title={cameraStreamEnabled ? 'Stop watching opponent live' : 'Watch opponent live'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${cameraStreamEnabled
                          ? 'bg-[#1E222A] text-white border-[#1E222A]'
                          : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
                        }`}
                    >
                      {cameraStreamEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{cameraStreamEnabled ? 'Live Feed ON' : 'Watch Live'}</span>
                    </button>
                    <span className="text-xs font-mono text-slate-600 bg-[#F8F6F0] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                      PING: {opponent.ping || '14ms'}
                    </span>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#1E222A] border border-[#1E222A] flex flex-col items-center justify-center p-6 text-center group text-white">
                  {/* Opponent Live Video Stream */}
                  <video
                    ref={opponentVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraStreamEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                  />

                  {/* Static backdrop */}
                  <img
                    src={opponent.avatar || opponentImg}
                    alt={opponent.name}
                    className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-500 ${cameraStreamEnabled ? 'opacity-0' : 'opacity-30 group-hover:scale-105'
                      } transition-transform duration-500`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E222A] via-transparent to-transparent" />

                  {/* Overlay content */}
                  {!cameraStreamEnabled && (
                    <div className="relative z-10 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-[#EAB308]">
                        <Swords className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white">{opponent.name}</h3>
                        <div className="text-xs font-mono text-[#EAB308] mt-0.5">
                          Performing {exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Squats' : 'Jumping Jacks'}
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-mono text-white inline-block">
                        Reps: <strong className="text-[#EAB308] text-base font-black">{opponentReps}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">Opponent Reps (Live Sync):</span>
                  <span className="text-[#18181B] font-bold">{opponentReps} REPS • SYNCED</span>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center bg-white border border-[#E2E8F0] p-3.5 rounded-3xl shadow-sm">
              <button
                onClick={handleCancelQueue}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Exit Arena</span>
              </button>

              <button
                onClick={finishMatch}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                Conclude Duel Early
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 3. POST-MATCH RESULTS & SUMMARY                           */}
        {/* ========================================================= */}
        {duelStage === 'match_summary' && (
          <div className="relative w-full max-w-3xl mx-auto py-4">

            <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-9 space-y-6 shadow-sm text-center relative overflow-hidden text-[#18181B]">

              <div className="relative z-10 space-y-3">
                {playerReps > opponentReps && (
                  <div className="space-y-3">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#1E222A] p-1 flex items-center justify-center shadow-md">
                        <Crown className="w-12 h-12 text-[#EAB308]" />
                      </div>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 bg-[#EAB308] text-[#18181B] px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-sm">
                        <Trophy className="w-5 h-5 fill-current" />
                        <span>VICTORY UNLOCKED! YOU WIN!</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-bold text-[#18181B] uppercase tracking-tight mt-2">
                        CHAMPION OF THE ARENA
                      </h2>
                    </div>
                  </div>
                )}

                {playerReps <= opponentReps && (
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-[#18181B]">MATCH COMPLETED</h2>
                    <p className="text-[#64748B] text-sm font-medium">Phenomenal effort! Keep pushing your limits.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#F8F6F0] border border-[#E2E8F0] p-5 rounded-2xl relative z-10">
                <div className="text-center border-r border-[#E2E8F0] pr-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                    {(profile?.display_name || profile?.username || 'YOUR').toUpperCase()}'S REPS
                  </div>
                  <div className="text-5xl font-bold text-[#18181B] font-mono mt-1">{playerReps}</div>
                  {playerReps > opponentReps && (
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">+{playerReps - opponentReps} AHEAD 🔥</div>
                  )}
                </div>

                <div className="text-center pl-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{opponent.name.toUpperCase()}</div>
                  <div className="text-5xl font-bold text-[#18181B] font-mono mt-1">{opponentReps}</div>
                  {opponentReps > playerReps && (
                    <div className="text-[10px] font-bold text-rose-600 mt-1">+{opponentReps - playerReps} AHEAD</div>
                  )}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => { reconnectAfterBout(); setDuelStage('lobby'); handleStartQueue(); }}
                  className="w-full py-4 rounded-full bg-[#1E222A] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Play Next Duel</span>
                </button>

                <button
                  onClick={() => { reconnectAfterBout(); setDuelStage('lobby'); }}
                  className="w-full py-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Duel Lobby</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* INCOMING BOUT CHALLENGE MODAL OVERLAY */}
        {activeChallenge && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#0c101d] border-2 border-cyan-400/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(0,112,243,0.4)] animate-bounce-short">
              <div className="w-16 h-16 rounded-2xl bg-[#0070F3] border-2 border-cyan-300 mx-auto flex items-center justify-center text-white text-2xl shadow-[0_0_30px_rgba(0,112,243,0.8)] animate-pulse">
                ⚔️
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-3.5 py-1 rounded-full border border-cyan-500/40">
                  INCOMING REAL-TIME BOUT CHALLENGE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-3 leading-tight">
                  {activeChallenge.senderDevice?.name || 'Nearby Device Node'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  wants to battle you in a 60-second <strong className="text-cyan-300 uppercase">{activeChallenge.exercise || 'pushup'}</strong> duel!
                </p>
              </div>

              <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl flex items-center justify-around text-xs font-mono text-slate-400">
                <div>Type: <strong className="text-white">{activeChallenge.senderDevice?.type || 'desktop'}</strong></div>
                <div>Rating: <strong className="text-cyan-400">{activeChallenge.senderDevice?.elo || 2480} ELO</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={declineChallenge}
                  className="py-3.5 rounded-2xl bg-[#131b2e] hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={acceptChallenge}
                  className="py-3.5 rounded-2xl bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Accept Bout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level Up & Rank Up Reward Celebration Overlay Modal */}
        <LevelUpModal rewardData={rewardData} onClose={() => setRewardData(null)} />
      </div>
    </div>
  );
}

class DuelsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[TrueRep Duels ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[600px] flex items-center justify-center p-8 bg-[#F4F1EA]">
          <div className="bg-white border border-[#E2E8F0] p-8 rounded-3xl max-w-lg text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-[#18181B]">Duels Interface Recovery</h3>
            <p className="text-xs text-[#64748B]">
              An unexpected render event occurred: {this.state.error?.message || 'State sync glitch'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="px-6 py-3 bg-[#1E222A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Reset 1v1 Duels Hub
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DuelsPageWithBoundary(props) {
  return (
    <DuelsErrorBoundary>
      <DuelsPage {...props} />
    </DuelsErrorBoundary>
  );
}
