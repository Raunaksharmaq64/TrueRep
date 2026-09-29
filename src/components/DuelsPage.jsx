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
  VideoOff,
  MapPin
} from 'lucide-react';
import opponentImg from '../assets/athlete.jpg';
import fitnessPlateImg from '../assets/fitness_plate.jpg';
import samuraiPfp from '../assets/samurai_pfp.png';
import duelsBg from '../assets/duels_bg.png';
import fieryBackdrop from '../assets/fiery_backdrop.png';
import PoseCanvas from './camera/PoseCanvas';
import LevelUpModal from './reward/LevelUpModal';
import SphericalAvatar from './common/SphericalAvatar';
import { useWebSpeech, useNearbyDevices, useAuth } from '../hooks';
import { audioAlerts, matchmakeLobby, calculateThreeScores, calculateCompositeMatchScore } from '../utils';

// Roster of available competitive rivals for matchmaking with 3-Tier Scores (AFS, MMR, RR)
const RIVAL_ROSTER = [
  {
    id: 'elena',
    name: 'Elena Vance',
    role: 'Organizer',
    mmr_rating: 2480,
    afs_score: 248.00,
    rr_rating: 80,
    rank_tier: 'Diamond II',
    elo: 2480,
    winRate: '72%',
    streak: 8,
    bpm: 168,
    wattage: 395,
    ping: '14ms',
    distance: '45m away',
    status: 'Matched Rival',
    avatar: opponentImg,
    initials: 'EV'
  },
  {
    id: 'marcus',
    name: 'Marcus Thorne',
    role: 'Athlete',
    mmr_rating: 2410,
    afs_score: 241.00,
    rr_rating: 60,
    rank_tier: 'Diamond I',
    elo: 2410,
    winRate: '74%',
    streak: 6,
    bpm: 172,
    wattage: 415,
    ping: '9ms',
    distance: '120m away',
    status: 'Nearby Node',
    avatar: opponentImg,
    initials: 'MT'
  },
  {
    id: 'nina',
    name: 'Nina Okoro',
    role: 'Athlete',
    mmr_rating: 2365,
    afs_score: 236.50,
    rr_rating: 50,
    rank_tier: 'Platinum III',
    elo: 2365,
    winRate: '71%',
    streak: 4,
    bpm: 162,
    wattage: 380,
    ping: '22ms',
    distance: '210m away',
    status: 'Nearby Node',
    avatar: opponentImg,
    initials: 'NO'
  },
  {
    id: 'alex',
    name: 'Alex Rivers',
    role: 'Challenger',
    mmr_rating: 2220,
    afs_score: 222.00,
    rr_rating: 40,
    rank_tier: 'Platinum II',
    elo: 2220,
    winRate: '80%',
    streak: 8,
    bpm: 175,
    wattage: 430,
    ping: '11ms',
    distance: '85m away',
    status: 'Elite Challenger',
    avatar: opponentImg,
    initials: 'AR'
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

  // Active Opponent State (Default selected from roster: Elena Vance)
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
  const pendingRepBroadcastRef = useRef(null);
  const repBroadcastIntervalRef = useRef(null);

  // Optional live peer video streaming
  const [cameraStreamEnabled, setCameraStreamEnabled] = useState(true);
  const [isPlayerCameraOn, setIsPlayerCameraOn] = useState(true);
  const opponentVideoRef = useRef(null);

  // Auto-acquire live camera stream for opponent arena viewport when battle is live
  useEffect(() => {
    let streamTrack = null;

    async function startOpponentFeed() {
      if (duelStage === 'live_battle' && cameraStreamEnabled) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 } },
              audio: false
            });
            streamTrack = stream;
            if (opponentVideoRef.current) {
              opponentVideoRef.current.srcObject = stream;
              opponentVideoRef.current.play().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Opponent feed fallback stream error:', err);
        }
      } else {
        if (opponentVideoRef.current && opponentVideoRef.current.srcObject) {
          const tracks = opponentVideoRef.current.srcObject.getTracks();
          tracks.forEach(t => t.stop());
          opponentVideoRef.current.srcObject = null;
        }
      }
    }

    startOpponentFeed();

    return () => {
      if (streamTrack) {
        streamTrack.getTracks().forEach(t => t.stop());
      }
    };
  }, [duelStage, cameraStreamEnabled]);

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

  const [deviceNameInput, setDeviceNameInput] = useState(myDevice?.name || 'Athlete Node');

  // Auto-reconnect to presence network whenever we return to lobby
  useEffect(() => {
    if (duelStage === 'lobby') {
      reconnectAfterBout();
    }
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
        avatar: opponentImg,
        initials: boutEvent.opponent.name ? boutEvent.opponent.name.substring(0, 2).toUpperCase() : 'ON'
      });
      setMatchMode('nearby');

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
      let botInfo = { name: 'Spartan_AI (Bot)', role: 'AI Rival', mmr_rating: 1250, afs_score: 125.00, rr_rating: 50, rank_tier: 'Silver II', elo: 1250, winRate: '72%', streak: 5, bpm: 160, wattage: 410, status: 'AI Ghost Simulation', avatar: opponentImg, initials: 'SA' };
      if (botDifficulty === 'rookie') { botInfo = { name: 'Rookie_AI (Bot)', role: 'Novice AI', mmr_rating: 950, afs_score: 95.00, rr_rating: 50, rank_tier: 'Iron I', elo: 950, winRate: '54%', streak: 1, bpm: 145, wattage: 320, status: 'Novice Simulation', avatar: opponentImg, initials: 'RA' }; }
      if (botDifficulty === 'titan') { botInfo = { name: 'Titan_AI (Bot)', role: 'Master AI', mmr_rating: 1850, afs_score: 185.00, rr_rating: 50, rank_tier: 'Diamond I', elo: 1850, winRate: '88%', streak: 12, bpm: 178, wattage: 460, status: 'Master Simulation', avatar: opponentImg, initials: 'TA' }; }
      const cms = calculateCompositeMatchScore(userThreeScores, botInfo);
      setOpponent({ ...botInfo, cms });
    } else {
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

  const handleRepUpdate = useCallback((count) => {
    setPlayerReps(count);
    pendingRepBroadcastRef.current = { reps: count };
  }, []);

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
    <div className="w-full min-h-[calc(100vh-80px)] bg-zinc-950 text-white p-3 sm:p-6 lg:p-8 select-none flex flex-col items-center justify-start font-sans">
      <div className="w-full max-w-[1360px] space-y-6">

        {/* ========================================================= */}
        {/* 1. LOBBY & INTERACTIVE MATCHMAKING STAGE                  */}
        {/* ========================================================= */}
        {(duelStage === 'lobby' || duelStage === 'matchmaking' || duelStage === 'match_locked') && (
          <div className="w-full flex flex-col gap-6">

            {/* ── TOP HERO BENTO CONTAINER ── */}
            <div className="w-full relative min-h-[720px] lg:min-h-[821px] bg-zinc-950/70 rounded-[40px] sm:rounded-[60px] lg:rounded-[120px] shadow-[0px_18px_40px_0px_rgba(0,0,0,0.40)] shadow-[0px_0px_28px_0px_rgba(234,179,8,0.10)] border border-stone-900 overflow-hidden p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
              
              {/* Background Image Asset */}
              <img
                src={duelsBg}
                alt="Duels Athlete Hero Background"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-60 mix-blend-screen pointer-events-none z-0"
              />

              {/* Decorative Ambient Radial Gradient Glows */}
              <div className="w-80 h-[640px] left-0 top-0 absolute bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none z-0" />
              <div className="w-72 h-[640px] right-0 top-0 absolute bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none z-0" />
              <div className="w-full h-44 left-0 bottom-0 absolute bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-0" />
              <div className="size-96 right-[-80px] top-[-100px] absolute opacity-20 bg-orange-500 rounded-full blur-3xl pointer-events-none" />
              <div className="size-96 left-[-90px] bottom-[-50px] absolute opacity-20 bg-yellow-400 rounded-full blur-3xl pointer-events-none" />
              <div className="size-56 right-[100px] bottom-[50px] absolute opacity-5 bg-white rounded-full blur-[50px] pointer-events-none" />

              {/* HERO INNER SPLIT GRID */}
              <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">

                {/* LEFT HERO TEXT & ACTION COLUMN (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-start items-start gap-5">
                  
                  {/* BADGES HEADER ROW */}
                  <div className="w-full flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="px-3 py-1.5 bg-yellow-500 rounded-full shadow-[0px_0px_12px_0px_rgba(234,179,8,0.40)] flex items-center justify-center">
                        <span className="text-zinc-900 text-[10px] font-normal uppercase leading-4 font-mono">ELITE ATHLETE • 2,510 ELO</span>
                      </div>
                      <div className="px-3 py-1.5 bg-white/5 rounded-full outline outline-1 outline-offset-[-1px] outline-white/5 flex items-center justify-center">
                        <span className="text-yellow-400 text-[10px] font-normal uppercase leading-4 font-mono">RANK #1 CANNON DIVISION</span>
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 bg-white/5 rounded-full outline outline-1 outline-offset-[-1px] outline-white/5 flex items-center justify-center">
                      <span className="text-white text-xs font-normal leading-4 font-mono">TR-8842-CYBER</span>
                    </div>
                  </div>

                  {/* GIANT BOLD HEADLINE */}
                  <h1 className="self-stretch text-white text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.0] tracking-tight uppercase">
                    UNLOCK YOUR<br />POTENTIAL
                  </h1>

                  {/* SUBTITLE */}
                  <p className="max-w-xl text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                    {(profile?.display_name || profile?.username || 'Alex Vance')} • Elite athlete • {profile?.elo || 2510} ELO • Immediate 1v1 duels with verified AI edge referees.
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="inline-flex items-center gap-3 pt-1">
                    <button
                      onClick={handleStartQueue}
                      disabled={duelStage === 'matchmaking'}
                      className="px-6 py-3.5 bg-gradient-to-br from-orange-500 via-yellow-400 via-55% to-white rounded-[20px] shadow-[0px_10px_24px_0px_rgba(255,128,0,0.20)] inline-flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-zinc-900 text-base font-normal uppercase tracking-wider">
                        {duelStage === 'matchmaking' ? `Queueing (${queueTimer.toFixed(1)}s)...` : 'Join Game'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveLobbyTab(activeLobbyTab === 'nearby' ? 'quick' : 'nearby')}
                      className="px-6 py-3.5 bg-white/5 hover:bg-white/10 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white/10 inline-flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)]"
                    >
                      <span className="text-white text-base font-normal uppercase tracking-wider">
                        {activeLobbyTab === 'nearby' ? 'Quick Battle' : 'Check on map'}
                      </span>
                    </button>
                  </div>

                  {/* 3 ATHLETE BIOMETRIC STAT CARDS (STAMINA, STRENGTH, AGILITY) */}
                  <div className="w-full pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-neutral-900/80 rounded-[24px] sm:rounded-[50px] outline outline-1 outline-offset-[-1px] outline-white/5 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex flex-col justify-center items-center text-center gap-1">
                      <span className="text-slate-400 text-[10px] font-normal uppercase leading-4 font-mono">STAMINA</span>
                      <span className="text-white text-3xl font-normal leading-8">88%</span>
                      <span className="text-yellow-400 text-xs font-normal">Tier 4 • High Endurance</span>
                    </div>

                    <div className="p-4 bg-neutral-900/80 rounded-[24px] sm:rounded-[80px] outline outline-1 outline-offset-[-1px] outline-white/5 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex flex-col justify-center items-center text-center gap-1">
                      <span className="text-slate-400 text-[10px] font-normal uppercase leading-4 font-mono">STRENGTH</span>
                      <span className="text-white text-3xl font-normal leading-8">92%</span>
                      <span className="text-yellow-400 text-xs font-normal">Tier 5 • 435W Power</span>
                    </div>

                    <div className="p-4 bg-neutral-900/80 rounded-[24px] sm:rounded-[80px] outline outline-1 outline-offset-[-1px] outline-white/5 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] flex flex-col justify-center items-center text-center gap-1">
                      <span className="text-slate-400 text-[10px] font-normal uppercase leading-4 font-mono">AGILITY</span>
                      <span className="text-white text-3xl font-normal leading-8">84%</span>
                      <span className="text-yellow-400 text-xs font-normal">Tier 4 • 52 reps/min</span>
                    </div>
                  </div>

                </div>

                {/* RIGHT HERO FLOATING CARD WITH 2-WAY TAB MODE TOGGLE (lg:col-span-5) */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                  <div className="w-full max-w-[554px] min-h-[420px] bg-neutral-950/60 rounded-[40px] sm:rounded-[60px] lg:rounded-[80px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.20)] outline outline-1 outline-offset-[-1px] outline-stone-900 overflow-hidden relative p-6 sm:p-7 flex flex-col justify-between">
                    
                    {/* FIERY GRADIENT BACKDROP IMAGE AT BOTTOM */}
                    <div className="w-[600px] h-[360px] left-[-30px] bottom-[0px] absolute pointer-events-none z-0 overflow-hidden opacity-80">
                      <img src={fieryBackdrop} alt="Fiery Glow" className="w-full h-full object-cover object-bottom" />
                    </div>

                    {/* CONTENT CONTAINER */}
                    <div className="relative z-10 space-y-4">
                      
                      {/* 2-WAY SEGMENTED CONTROL BAR */}
                      <div className="w-full grid grid-cols-2 gap-1 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        <button
                          onClick={() => setActiveLobbyTab('quick')}
                          className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeLobbyTab === 'quick'
                              ? 'bg-[#FF8000] text-white shadow-[0px_4px_12px_rgba(255,128,0,0.35)]'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Quick Battle</span>
                        </button>
                        <button
                          onClick={() => setActiveLobbyTab('nearby')}
                          className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeLobbyTab === 'nearby' || activeLobbyTab === 'map'
                              ? 'bg-[#FF8000] text-white shadow-[0px_4px_12px_rgba(255,128,0,0.35)]'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Nearby Devices ({nearbyDevices?.length || 3})</span>
                        </button>
                      </div>

                      {/* MODE 1: QUICK BATTLE (LIVE QUEUE) */}
                      {activeLobbyTab === 'quick' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="w-full flex items-center justify-between">
                            <div className="px-3.5 py-1.5 bg-white/5 rounded-full outline outline-1 outline-offset-[-1px] outline-white/10 inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-white text-xs font-normal uppercase tracking-wider">Live Matchmaking Queue</span>
                            </div>
                            <div className="px-3 py-1.5 bg-yellow-500 rounded-full inline-flex items-center">
                              <span className="text-zinc-900 text-xs font-bold uppercase tracking-wider font-mono">12 Ready</span>
                            </div>
                          </div>

                          {/* ATHLETES LIST */}
                          <div className="space-y-2.5">
                            {RIVAL_ROSTER.slice(0, 3).map((rival, index) => {
                              const isSelected = selectedRivalId === rival.id;
                              return (
                                <div
                                  key={rival.id}
                                  onClick={() => selectRival(rival)}
                                  className={`w-full p-3.5 rounded-[50px] shadow-[inset_0px_4px_30px_0px_rgba(255,255,255,0.25)] flex items-center gap-3 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-white/15 outline outline-1 outline-yellow-500/60 shadow-lg'
                                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                                  }`}
                                >
                                  {index === 0 ? (
                                    <img className="size-11 rounded-full object-cover border border-yellow-500/40" src={rival.avatar || opponentImg} alt={rival.name} />
                                  ) : (
                                    <div className="size-11 bg-neutral-800 rounded-full flex items-center justify-center text-white text-sm font-semibold border border-white/10">
                                      {rival.initials}
                                    </div>
                                  )}
                                  <div className="flex-1 flex flex-col justify-start items-start gap-0.5">
                                    <span className="text-white text-sm font-bold leading-5">{rival.name}</span>
                                    <span className="text-zinc-400 text-xs font-mono leading-4">{rival.role} • {rival.distance || 'Near'}</span>
                                  </div>
                                  <div className="px-3 py-1 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span className="text-zinc-900 text-xs font-mono font-bold">{rival.elo} ELO</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="w-full pt-1 flex items-center justify-between text-xs font-mono text-zinc-300 border-t border-white/10">
                            <span>Next match in: <strong className="text-yellow-400">00:03</strong></span>
                            <span className="uppercase text-yellow-500/90 font-bold">Verified AI Referee</span>
                          </div>
                        </div>
                      )}

                      {/* MODE 2: NEARBY ATHLETES / NEARBY DEVICES DETECTOR */}
                      {(activeLobbyTab === 'nearby' || activeLobbyTab === 'map') && (
                        <div className="space-y-3.5 animate-fadeIn">
                          {/* HEADER PILLS */}
                          <div className="w-full flex items-center justify-between">
                            <div className="px-3.5 py-1.5 bg-white/5 rounded-full outline outline-1 outline-offset-[-1px] outline-white/10 inline-flex items-center gap-2">
                              <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                              <span className="text-white text-xs font-normal uppercase tracking-wider">Nearby Devices Radar</span>
                            </div>
                            <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full inline-flex items-center">
                              <span className="text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider">
                                {nearbyDevices && nearbyDevices.length > 0 ? `${nearbyDevices.length} Detected` : '3 Nodes Active'}
                              </span>
                            </div>
                          </div>

                          {/* NEARBY DEVICES LIST */}
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {nearbyDevices && nearbyDevices.length > 0 ? (
                              nearbyDevices.map((device) => (
                                <div
                                  key={device.id}
                                  className="w-full p-3.5 rounded-[50px] bg-white/5 hover:bg-white/10 border border-white/10 shadow-[inset_0px_4px_30px_0px_rgba(255,255,255,0.15)] flex items-center justify-between gap-3 transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="size-11 bg-yellow-500/20 border border-yellow-500/40 rounded-full flex items-center justify-center text-yellow-400">
                                      {device.type === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="text-white text-sm font-bold leading-5">{device.name || 'Athlete Node'}</span>
                                      <span className="text-zinc-400 text-xs font-mono">
                                        {device.type || 'device'} • {latencyMap?.[device.id] ? `${latencyMap[device.id]}ms` : '12ms'} ping
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => sendChallenge(device)}
                                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                    Challenge
                                  </button>
                                </div>
                              ))
                            ) : (
                              /* FALLBACK ROSTER WHEN NO REAL PEER IS ON THE SAME LOCAL PRESENCE CHANNEL */
                              RIVAL_ROSTER.slice(0, 3).map((rival) => (
                                <div
                                  key={rival.id}
                                  onClick={() => selectRival(rival)}
                                  className={`w-full p-3.5 rounded-[50px] shadow-[inset_0px_4px_30px_0px_rgba(255,255,255,0.25)] flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                    selectedRivalId === rival.id
                                      ? 'bg-white/15 outline outline-1 outline-yellow-500/60 shadow-lg'
                                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img className="size-11 rounded-full object-cover border border-yellow-500/40" src={rival.avatar || opponentImg} alt={rival.name} />
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="text-white text-sm font-bold leading-5">{rival.name}</span>
                                      <span className="text-zinc-400 text-xs font-mono">{rival.distance || '45m away'} • {rival.elo} ELO</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectRival(rival);
                                      handleStartQueue();
                                    }}
                                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                    Challenge
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* PRESENCE RADAR FOOTER */}
                          <div className="w-full pt-1 flex items-center justify-between text-xs font-mono text-zinc-300 border-t border-white/10">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Room Code: <strong className="text-yellow-400">{roomCode}</strong>
                            </span>
                            <span className="uppercase text-yellow-500/90 font-bold">Real-Time Sync</span>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                </div>

              </div>

            </div>


            {/* ── BOTTOM BENTO GRID (3 CARDS) ── */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* CARD 1: ATHLETE PROFILE */}
              <div className="w-full min-h-[380px] bg-neutral-950/80 rounded-[40px] sm:rounded-[48px] lg:rounded-[80px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 overflow-hidden relative p-5 sm:p-6 flex flex-col justify-between">
                <div className="w-40 h-[800px] right-0 top-0 absolute bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 space-y-4">
                  {/* CARD HEADER */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-white text-2xl font-normal leading-7">Athlete Profile</span>
                    <div className="px-3 py-1.5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-zinc-900 text-xs font-normal uppercase leading-4">Verified</span>
                    </div>
                  </div>

                  {/* AVATAR + ATHLETE INFO */}
                  <div className="w-full flex items-center gap-4 pt-1">
                    <div className="size-14 sm:size-16 rounded-[28px] sm:rounded-[36px] overflow-hidden border-2 border-yellow-500/40 flex-shrink-0 bg-neutral-800">
                      <img src={opponent.avatar || samuraiPfp} alt={opponent.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-start items-start gap-1">
                      <span className="text-white text-2xl sm:text-3xl font-normal leading-8">{opponent.name || 'Elena Vance'}</span>
                      <span className="text-zinc-400 text-xs font-normal leading-4">{opponent.role || 'Organizer'} • {opponent.elo || 2480} ELO</span>
                    </div>
                  </div>

                  {/* 3 STAT BOXES */}
                  <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-4 bg-white/5 rounded-[20px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-1.5">
                      <span className="text-zinc-400 text-xs font-normal uppercase leading-4">ELO</span>
                      <span className="text-white text-2xl sm:text-3xl font-normal leading-7">{opponent.elo || 2480}</span>
                    </div>
                    <div className="p-3 sm:p-4 bg-white/5 rounded-[20px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-1.5">
                      <span className="text-zinc-400 text-xs font-normal uppercase leading-4">Win Rate</span>
                      <span className="text-white text-2xl sm:text-3xl font-normal leading-7">{opponent.winRate || '72%'}</span>
                    </div>
                    <div className="p-3 sm:p-4 bg-white/5 rounded-[20px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-1.5">
                      <span className="text-zinc-400 text-xs font-normal uppercase leading-4">Active</span>
                      <span className="text-white text-2xl sm:text-3xl font-normal leading-7">12m</span>
                    </div>
                  </div>

                  {/* LOCATION CAPSULE PILL */}
                  <div className="w-full p-3.5 sm:p-4 bg-white/5 rounded-[20px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-3">
                    <div className="size-3.5 relative overflow-hidden flex-shrink-0">
                      <div className="size-2 left-[1.75px] top-[1.75px] absolute outline outline-1 outline-offset-[-0.58px] outline-yellow-500 rounded-full" />
                      <div className="size-1 left-[7.58px] top-[7.58px] absolute outline outline-1 outline-offset-[-0.58px] outline-yellow-500 rounded-full" />
                    </div>
                    <span className="flex-1 text-gray-300 text-xs sm:text-sm font-normal leading-5 truncate">
                      Shōten • 123 Sakura Park, Sakyo-ku, Kyoto
                    </span>
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="relative z-10 w-full flex items-center gap-3 pt-3">
                  <button
                    onClick={handleLockMatch}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-br from-orange-500 via-yellow-400 via-55% to-white rounded-[20px] shadow-[0px_10px_24px_0px_rgba(255,128,0,0.20)] text-zinc-900 text-sm sm:text-base font-normal uppercase leading-4 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Join Game
                  </button>
                  <button
                    onClick={handleStartQueue}
                    className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 rounded-[20px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 text-white text-sm sm:text-base font-normal uppercase leading-4 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Queue Up
                  </button>
                </div>
              </div>


              {/* CARD 2: CHOOSE DISCIPLINE */}
              <div className="w-full min-h-[380px] bg-neutral-950/80 rounded-[40px] sm:rounded-[48px] lg:rounded-[80px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 overflow-hidden relative p-5 sm:p-6 flex flex-col justify-between">
                <div className="w-40 h-[800px] left-0 top-0 absolute bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none z-0" />
                <div className="w-full h-48 left-0 bottom-0 absolute bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 space-y-4">
                  {/* CARD HEADER */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-white text-2xl font-normal leading-7">Choose Discipline</span>
                    <div className="px-3 py-1.5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-zinc-900 text-xs font-normal uppercase leading-4">3 Options</span>
                    </div>
                  </div>

                  {/* DISCIPLINE ITEMS LIST WITH FIERY BACKDROP FOR SELECTED */}
                  <div className="space-y-3 pt-1">

                    {/* Push-ups Option */}
                    <div
                      onClick={() => setExercise('pushup')}
                      className={`relative w-full rounded-[80px] p-4 transition-all cursor-pointer overflow-hidden ${exercise === 'pushup'
                          ? 'bg-black shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)]'
                          : 'bg-white/5 hover:bg-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10'
                        }`}
                    >
                      {exercise === 'pushup' && (
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                          <img src={fieryBackdrop} alt="Fiery Glow" className="w-full h-full object-cover opacity-90 blur-[4px]" />
                        </div>
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="size-10 bg-neutral-800 rounded-[20px] flex items-center justify-center text-yellow-500 text-lg font-bold flex-shrink-0">
                            💪
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-white text-lg font-normal leading-5">Push-Ups</span>
                            <span className={exercise === 'pushup' ? 'text-yellow-50 text-xs font-normal leading-4' : 'text-zinc-400 text-xs font-normal leading-4'}>
                              Fastest queue • 64 reps
                            </span>
                          </div>
                        </div>
                        {exercise === 'pushup' && (
                          <div className="px-3.5 py-1.5 bg-zinc-900 rounded-full text-yellow-500 text-xs font-normal uppercase leading-4 border border-white/10 shadow-sm">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Squats Option */}
                    <div
                      onClick={() => setExercise('squat')}
                      className={`relative w-full rounded-[80px] p-4 transition-all cursor-pointer overflow-hidden ${exercise === 'squat'
                          ? 'bg-black shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)]'
                          : 'bg-white/5 hover:bg-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10'
                        }`}
                    >
                      {exercise === 'squat' && (
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                          <img src={fieryBackdrop} alt="Fiery Glow" className="w-full h-full object-cover opacity-90 blur-[4px]" />
                        </div>
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="size-10 bg-neutral-800 rounded-[20px] flex items-center justify-center text-zinc-300 text-lg font-bold flex-shrink-0">
                            🏋️
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-white text-lg font-normal leading-5">Squats</span>
                            <span className={exercise === 'squat' ? 'text-yellow-50 text-xs font-normal leading-4' : 'text-zinc-400 text-xs font-normal leading-4'}>
                              High-intensity • 64 reps
                            </span>
                          </div>
                        </div>
                        {exercise === 'squat' && (
                          <div className="px-3.5 py-1.5 bg-zinc-900 rounded-full text-yellow-500 text-xs font-normal uppercase leading-4 border border-white/10 shadow-sm">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Jacks Option */}
                    <div
                      onClick={() => setExercise('jumpingjack')}
                      className={`relative w-full rounded-[80px] p-4 transition-all cursor-pointer overflow-hidden ${exercise === 'jumpingjack'
                          ? 'bg-black shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)]'
                          : 'bg-white/5 hover:bg-white/10 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10'
                        }`}
                    >
                      {exercise === 'jumpingjack' && (
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                          <img src={fieryBackdrop} alt="Fiery Glow" className="w-full h-full object-cover opacity-90 blur-[4px]" />
                        </div>
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="size-10 bg-neutral-800 rounded-[20px] flex items-center justify-center text-zinc-300 text-lg font-bold flex-shrink-0">
                            ⚡
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-white text-lg font-normal leading-5">Jacks</span>
                            <span className={exercise === 'jumpingjack' ? 'text-yellow-50 text-xs font-normal leading-4' : 'text-zinc-400 text-xs font-normal leading-4'}>
                              Cardio burst • 64 reps
                            </span>
                          </div>
                        </div>
                        {exercise === 'jumpingjack' && (
                          <div className="px-3.5 py-1.5 bg-zinc-900 rounded-full text-yellow-500 text-xs font-normal uppercase leading-4 border border-white/10 shadow-sm">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* BOTTOM FOOTER BAR */}
                <div className="relative z-10 w-full flex items-center justify-between text-xs font-normal pt-2 px-1">
                  <span className="text-zinc-400">Best match in 3s</span>
                  <span className="text-yellow-500 uppercase font-normal">Competitive</span>
                </div>
              </div>


              {/* CARD 3: NEARBY NODE */}
              <div className="w-full min-h-[380px] bg-neutral-950/80 rounded-[40px] sm:rounded-[48px] lg:rounded-[80px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 overflow-hidden relative p-5 sm:p-6 flex flex-col justify-between">
                <div className="w-full h-56 left-0 top-0 absolute bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 space-y-4">
                  {/* CARD HEADER */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-white text-2xl font-normal leading-7">Nearby Node</span>
                    <div className="px-3 py-1.5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-zinc-900 text-xs font-normal uppercase leading-4">1 Active</span>
                    </div>
                  </div>

                  {/* INNER GLASS CONTAINER */}
                  <div className="w-full bg-white/5 rounded-[40px] sm:rounded-[52px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-4 sm:p-5 space-y-4">
                    {/* NODE HEADER INFO */}
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="flex-1 flex flex-col justify-start items-start gap-1">
                        <span className="text-white text-xl font-normal leading-6">{roomCode || 'FIT-4029'}</span>
                        <span className="text-zinc-400 text-xs font-normal leading-4">{deviceNameInput || 'Athlete Node (Laptop #360)'}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-zinc-900 text-xs font-normal uppercase leading-4">Ready</span>
                      </div>
                    </div>

                    {/* STATS (LATENCY & QUEUE) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-[30px] sm:rounded-[40px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-1.5">
                        <span className="text-zinc-400 text-xs font-normal uppercase leading-4">Latency</span>
                        <span className="text-white text-2xl sm:text-3xl font-normal leading-7">12ms</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-[26px] sm:rounded-[34px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-start items-start gap-1.5">
                        <span className="text-zinc-400 text-xs font-normal uppercase leading-4">Queue</span>
                        <span className="text-white text-2xl sm:text-3xl font-normal leading-7">12</span>
                      </div>
                    </div>

                    {/* GLOWING REFEREE AI FIERY BANNER */}
                    <div className="w-full h-16 sm:h-20 rounded-full overflow-hidden relative bg-white/5 shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 px-6 flex items-center justify-between shadow-lg">
                      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        <img src={fieryBackdrop} alt="Fiery Glow" className="w-full h-full object-cover opacity-95 blur-[3px]" />
                      </div>
                      <span className="relative z-10 text-white text-xs font-normal uppercase tracking-wider leading-4">Referee</span>
                      <span className="relative z-10 text-white text-3xl sm:text-4xl font-normal leading-7">AI</span>
                    </div>

                    {/* BOTTOM FOOTER BAR */}
                    <div className="w-full flex items-center justify-between text-xs font-normal pt-1 px-1">
                      <span className="text-zinc-400">Verified edge referee</span>
                      <span className="text-yellow-500 uppercase font-normal">Immediate</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}



        {/* ========================================================= */}
        {/* 2. LIVE 1v1 DUEL BATTLE ARENA                             */}
        {/* ========================================================= */}
        {duelStage === 'live_battle' && (
          <div className="w-full space-y-6 animate-fadeIn">

            {/* TOP AUTHORITATIVE SCORE BAR */}
            <div className="w-full bg-neutral-950/80 rounded-[40px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">

              {/* Player Score & Exit */}
              <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4 w-full md:w-auto border-b md:border-b-0 border-stone-800 pb-3 md:pb-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelQueue}
                    className="p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Exit Duel & Return to Lobby"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Exit</span>
                  </button>

                  <SphericalAvatar 
                    avatarUrl={profile?.avatar_url}
                    bannerUrl={profile?.banner_url}
                    pfpTransform={profile?.pfp_transform}
                    className="w-12 h-12"
                    borderClassName="border-2 border-yellow-500"
                    alt="Your PFP"
                  />
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[130px]">
                      {(profile?.display_name || profile?.username || 'YOU').toUpperCase()}
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
                      {playerReps}
                    </div>
                  </div>
                </div>

                {playerTelemetry.isComboActive && (
                  <div className="bg-yellow-500 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                    <span>1.5x</span>
                  </div>
                )}
              </div>

              {/* Match Timer & Status Lead Pill */}
              <div className="flex flex-col items-center py-1 md:py-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    LIVE DUEL • 60S SPRINT
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight my-0.5">
                  00:{matchTimeLeft < 10 ? `0${matchTimeLeft}` : matchTimeLeft}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    isPlayerAhead
                      ? 'bg-emerald-600 text-white'
                      : isOpponentAhead
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-white'
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
              <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse text-right w-full md:w-auto justify-between md:justify-start border-t md:border-t-0 border-stone-800 pt-3 md:pt-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500 shadow-sm flex-shrink-0">
                  <img src={opponent.avatar || opponentImg} alt={opponent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {opponent.name.toUpperCase()}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
                    {opponentReps}
                  </div>
                </div>
              </div>

            </div>

            {/* SPLIT SCREEN VIEWPORTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Player Pose Camera Viewport */}
              <div className="bg-neutral-950/80 rounded-[40px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 p-5 flex flex-col space-y-3 relative text-white">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <SphericalAvatar 
                      avatarUrl={profile?.avatar_url}
                      bannerUrl={profile?.banner_url}
                      pfpTransform={profile?.pfp_transform}
                      className="w-5 h-5"
                      borderClassName="border border-yellow-500"
                      alt="PFP"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {(profile?.display_name || profile?.username || 'YOUR').toUpperCase()}'S ARENA • AI REFEREE
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* CAMERA TOGGLE BUTTON */}
                    <button
                      onClick={() => setIsPlayerCameraOn(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isPlayerCameraOn
                          ? 'bg-yellow-500 text-zinc-900 border-yellow-500 shadow-sm'
                          : 'bg-zinc-800 border-stone-700 text-zinc-300 hover:text-white'
                      }`}
                      title={isPlayerCameraOn ? "Mute Camera Feed" : "Turn On Camera Feed"}
                    >
                      {isPlayerCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      <span>{isPlayerCameraOn ? 'Camera ON' : 'Turn On Camera'}</span>
                    </button>

                    <button
                      onClick={handleManualRep}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-white/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+1 Rep</span>
                    </button>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden bg-black border border-white/10">
                  {isPlayerCameraOn ? (
                    <PoseCanvas
                      exercise={exercise}
                      isSessionActive={isPlayerCameraOn}
                      onRepUpdate={handleRepUpdate}
                      onTelemetryUpdate={handleTelemetryUpdate}
                      onVoiceFeedback={speak}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center space-y-3.5 z-10">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
                        <VideoOff className="w-8 h-8 text-yellow-500 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-white text-base font-bold">Camera Vision Muted</h4>
                        <p className="text-zinc-400 text-xs mt-1 max-w-xs">
                          Turn on your camera feed to activate AI Referee pose tracking & automatic rep counts.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsPlayerCameraOn(true)}
                        className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold uppercase rounded-full tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Turn On Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Form Precision:</span>
                  <span className={playerTelemetry.isFormValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {playerTelemetry.isFormValid ? '✓ CLEAN FORM' : '⚠️ FAULT LATCHED'}
                  </span>
                </div>
              </div>

              {/* Opponent Arena Viewport */}
              <div className="bg-neutral-950/80 rounded-[40px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 p-5 flex flex-col space-y-3 relative text-white">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      OPPONENT ARENA • {opponent.name.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCameraStreamEnabled(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        cameraStreamEnabled
                          ? 'bg-yellow-500 text-zinc-900 border-yellow-500'
                          : 'bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {cameraStreamEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{cameraStreamEnabled ? 'Live Feed ON' : 'Watch Live'}</span>
                    </button>
                    <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      PING: {opponent.ping || '14ms'}
                    </span>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden bg-black border border-white/10 flex flex-col items-center justify-center p-6 text-center group text-white">
                  <video
                    ref={opponentVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      cameraStreamEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />

                  <img
                    src={opponent.avatar || opponentImg}
                    alt={opponent.name}
                    className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-500 ${
                      cameraStreamEnabled ? 'opacity-0' : 'opacity-40 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                  {!cameraStreamEnabled && (
                    <div className="relative z-10 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-yellow-500 border border-yellow-500/30 backdrop-blur-md">
                        <Swords className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white">{opponent.name}</h3>
                        <div className="text-xs font-mono text-yellow-400 mt-0.5">
                          Performing {exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Squats' : 'Jumping Jacks'}
                        </div>
                      </div>

                      <div className="bg-black/60 backdrop-blur-md border border-stone-700 px-4 py-2 rounded-full text-xs font-mono text-white inline-block">
                        Reps: <strong className="text-yellow-400 text-base font-black">{opponentReps}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Opponent Reps (Live Sync):</span>
                  <span className="text-white font-bold">{opponentReps} REPS • SYNCED</span>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center bg-neutral-950/80 rounded-[35px] shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.25)] outline outline-1 outline-offset-[-1px] outline-stone-900 p-4">
              <button
                onClick={handleCancelQueue}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
                <span>Exit Arena</span>
              </button>

              <button
                onClick={finishMatch}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
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
          <div className="relative w-full max-w-3xl mx-auto py-6">

            <div className="w-full bg-neutral-900 border border-stone-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl text-center relative overflow-hidden text-white">

              <div className="relative z-10 space-y-4">
                {playerReps > opponentReps && (
                  <div className="space-y-3">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/40 p-1 flex items-center justify-center shadow-md">
                        <Crown className="w-12 h-12 text-yellow-500" />
                      </div>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 bg-yellow-500 text-zinc-900 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-sm">
                        <Trophy className="w-5 h-5 fill-current" />
                        <span>VICTORY UNLOCKED! YOU WIN!</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight mt-3">
                        CHAMPION OF THE ARENA
                      </h2>
                    </div>
                  </div>
                )}

                {playerReps <= opponentReps && (
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">MATCH COMPLETED</h2>
                    <p className="text-zinc-400 text-sm font-medium">Phenomenal effort! Keep pushing your limits.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-950 border border-stone-800 p-6 rounded-2xl relative z-10">
                <div className="text-center border-r border-stone-800 pr-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                    {(profile?.display_name || profile?.username || 'YOUR').toUpperCase()}'S REPS
                  </div>
                  <div className="text-5xl font-bold text-white font-mono mt-1">{playerReps}</div>
                  {playerReps > opponentReps && (
                    <div className="text-[10px] font-bold text-emerald-400 mt-1">+{playerReps - opponentReps} AHEAD 🔥</div>
                  )}
                </div>

                <div className="text-center pl-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{opponent.name.toUpperCase()}</div>
                  <div className="text-5xl font-bold text-white font-mono mt-1">{opponentReps}</div>
                  {opponentReps > playerReps && (
                    <div className="text-[10px] font-bold text-rose-400 mt-1">+{opponentReps - playerReps} AHEAD</div>
                  )}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => { reconnectAfterBout(); setDuelStage('lobby'); handleStartQueue(); }}
                  className="w-full py-4 rounded-full bg-gradient-to-br from-orange-500 via-yellow-400 via-55% to-white text-zinc-900 font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Play Next Duel</span>
                </button>

                <button
                  onClick={() => { reconnectAfterBout(); setDuelStage('lobby'); }}
                  className="w-full py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-stone-700 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
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
            <div className="bg-neutral-900 border-2 border-yellow-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500 border-2 border-yellow-300 mx-auto flex items-center justify-center text-zinc-900 text-2xl shadow-lg">
                ⚔️
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3.5 py-1 rounded-full border border-yellow-500/30">
                  INCOMING REAL-TIME BOUT CHALLENGE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-3 leading-tight">
                  {activeChallenge.senderDevice?.name || 'Nearby Device Node'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  wants to battle you in a 60-second <strong className="text-yellow-400 uppercase">{activeChallenge.exercise || 'pushup'}</strong> duel!
                </p>
              </div>

              <div className="bg-zinc-950 border border-stone-800 p-3.5 rounded-2xl flex items-center justify-around text-xs font-mono text-zinc-400">
                <div>Type: <strong className="text-white">{activeChallenge.senderDevice?.type || 'desktop'}</strong></div>
                <div>Rating: <strong className="text-yellow-400">{activeChallenge.senderDevice?.elo || 2480} ELO</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={declineChallenge}
                  className="py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={acceptChallenge}
                  className="py-3.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
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
        <div className="w-full min-h-[600px] flex items-center justify-center p-8 bg-zinc-950">
          <div className="bg-neutral-900 border border-stone-800 p-8 rounded-3xl max-w-lg text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white">Duels Interface Recovery</h3>
            <p className="text-xs text-zinc-400">
              An unexpected render event occurred: {this.state.error?.message || 'State sync glitch'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-sm"
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
