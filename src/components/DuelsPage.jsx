import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Shield,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Swords,
  Flame,
  AlertCircle,
  Play,
  RotateCw,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Crown,
  Skull,
  Plus,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';
import opponentImg from '../assets/athlete.jpg';
import PoseCanvas from './camera/PoseCanvas';
import { useWebSpeech } from '../hooks';
import { audioAlerts } from '../utils';

// Roster of available competitive rivals for opponent finding
const RIVAL_ROSTER = [
  {
    id: 'elena',
    name: 'Elena Vance',
    elo: 2480,
    winRate: '68%',
    streak: 4,
    bpm: 168,
    wattage: 395,
    ping: '14ms',
    distance: '45m away',
    status: 'Locked Rival',
    avatar: opponentImg
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    elo: 2510,
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
    elo: 2495,
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
    elo: 2530,
    winRate: '80%',
    streak: 8,
    bpm: 175,
    wattage: 430,
    ping: '11ms',
    distance: '85m away',
    status: 'Elite Challenger',
    avatar: opponentImg
  }
];

export default function DuelsPage({ onNavigate }) {
  // Duel Stage: 'lobby' | 'matchmaking' | 'match_locked' | 'live_battle' | 'match_summary'
  const [duelStage, setDuelStage] = useState('lobby');
  const [matchMode, setMatchMode] = useState('quick'); // 'quick' | 'private' | 'bot'
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

  // Opponent AI simulation interval ref
  const opponentIntervalRef = useRef(null);
  const matchClockIntervalRef = useRef(null);
  const lastLeadRef = useRef(null);

  // Update active opponent when selected rival changes
  const selectRival = (rival) => {
    setSelectedRivalId(rival.id);
    setOpponent(rival);
    audioAlerts.playDepthDing();
  };

  // Generate new private room code
  const handleGenerateRoomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `FIT-${randomNum}`;
    setRoomCode(newCode);
    setRoomMessage(`Generated private room ${newCode}! Share code with friend.`);
    setTimeout(() => setRoomMessage(null), 3000);
  };

  // Join private room via code
  const handleJoinPrivateRoom = (e) => {
    e.preventDefault();
    const targetCode = inputRoomCode.trim().toUpperCase() || roomCode;
    setRoomCode(targetCode);
    setRoomMessage(`Joined Room ${targetCode}! Both athletes locked in.`);
    audioAlerts.playValidRepChime();
    setDuelStage('match_locked');
  };

  // Finish / Conclude Match
  const finishMatch = useCallback(() => {
    if (opponentIntervalRef.current) clearTimeout(opponentIntervalRef.current);
    if (matchClockIntervalRef.current) clearInterval(matchClockIntervalRef.current);
    setDuelStage('match_summary');
  }, []);

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

  // 4. OPPONENT AI REP SIMULATION (Human-like pacing based on bot/rival level)
  useEffect(() => {
    if (duelStage === 'live_battle') {
      const simulateOpponentRep = () => {
        setOpponentReps((prev) => prev + 1);
        setOpponent((prev) => ({
          ...prev,
          bpm: Math.min(185, prev.bpm + Math.floor(Math.random() * 3)),
          wattage: 380 + Math.floor(Math.random() * 40)
        }));
      };

      // Pacing speed based on selected difficulty/rival
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
  }, [duelStage, matchMode, botDifficulty]);

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

  // Start Matchmaking Radar Queue
  const handleStartQueue = () => {
    setQueueTimer(3.0);
    setDuelStage('matchmaking');

    // Pick a rival randomly or use bot
    if (matchMode === 'bot') {
      let botInfo = { name: 'Spartan_AI (Bot)', elo: 2450, winRate: '72%', streak: 5, bpm: 160, wattage: 410, status: 'AI Ghost Simulation' };
      if (botDifficulty === 'rookie') { botInfo = { name: 'Rookie_AI (Bot)', elo: 2100, winRate: '54%', streak: 1, bpm: 145, wattage: 320, status: 'Novice Simulation' }; }
      if (botDifficulty === 'titan') { botInfo = { name: 'Titan_AI (Bot)', elo: 2700, winRate: '88%', streak: 12, bpm: 178, wattage: 460, status: 'Master Simulation' }; }
      setOpponent(botInfo);
    } else {
      // Pick a random rival from roster if not manually picked
      const randomRival = RIVAL_ROSTER[Math.floor(Math.random() * RIVAL_ROSTER.length)];
      setSelectedRivalId(randomRival.id);
      setOpponent(randomRival);
    }
  };

  // Instant Match Lock
  const handleLockMatch = () => {
    setDuelStage('match_locked');
  };

  // Cancel Queue / Return to Lobby
  const handleCancelQueue = () => {
    setDuelStage('lobby');
    setQueueTimer(3.0);
    if (opponentIntervalRef.current) clearTimeout(opponentIntervalRef.current);
    if (matchClockIntervalRef.current) clearInterval(matchClockIntervalRef.current);
  };

  // Start Live Match
  const startLiveMatch = () => {
    setPlayerReps(0);
    setOpponentReps(0);
    setMatchTimeLeft(60);
    setDuelStage('live_battle');
    if (voiceEnabled) speak('60 seconds on the clock! Fight!');
  };

  // Copy Passphrase
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Manual Rep Increment for Testing
  const handleManualRep = () => {
    if (duelStage === 'live_battle') {
      setPlayerReps((prev) => prev + 1);
      audioAlerts.playValidRepChime();
    }
  };

  // Pose Telemetry Callback
  const handleTelemetryUpdate = useCallback((data) => {
    setPlayerTelemetry(data);
  }, []);

  const handleRepUpdate = useCallback((count) => {
    setPlayerReps(count);
  }, []);

  // Compute Lead Status
  const repDelta = playerReps - opponentReps;
  const isPlayerAhead = repDelta > 0;
  const isOpponentAhead = repDelta < 0;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#03060d] text-white px-4 sm:px-8 lg:px-12 py-6 select-none flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* TOP NAVIGATION / GO BACK STRIP */}
        <div className="flex items-center justify-between border-b border-slate-900/80 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (duelStage === 'live_battle' || duelStage === 'match_summary') {
                  handleCancelQueue();
                } else if (onNavigate) {
                  onNavigate('home');
                } else {
                  handleCancelQueue();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#070c18] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>{duelStage === 'lobby' ? 'Back to Home' : 'Back to Duel Lobby'}</span>
            </button>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {duelStage === 'lobby' && '1v1 Matchmaking Arena'}
                {duelStage === 'matchmaking' && 'Searching Opponent...'}
                {duelStage === 'match_locked' && 'Bout Locked'}
                {duelStage === 'live_battle' && 'Live 60s Duel'}
                {duelStage === 'match_summary' && 'Match Summary'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setVoiceEnabled(prev => !prev)}
              title={voiceEnabled ? 'Mute Voice Referee' : 'Enable Voice Referee'}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                voiceEnabled 
                  ? 'bg-[#0a1428] border-cyan-500/40 text-cyan-400' 
                  : 'bg-[#070c18] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. LOBBY & INTERACTIVE MATCHMAKING STAGE                  */}
        {/* ========================================================= */}
        {(duelStage === 'lobby' || duelStage === 'matchmaking' || duelStage === 'match_locked') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* LEFT COLUMN: Matchmaking Radar & Roster Selection (8 Cols) */}
            <div className="lg:col-span-8 bg-[#0c101d] border border-slate-800/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full space-y-6 relative overflow-hidden shadow-2xl">
              
              <div>
                {/* Mode Selector Tabs Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-[#050914] p-1.5 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => { setMatchMode('quick'); setDuelStage('lobby'); }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        matchMode === 'quick'
                          ? 'bg-[#0070F3] text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Quick Ranked Match
                    </button>
                    <button
                      onClick={() => { setMatchMode('private'); setDuelStage('lobby'); }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        matchMode === 'private'
                          ? 'bg-[#0070F3] text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Private Duel Code
                    </button>
                    <button
                      onClick={() => { setMatchMode('bot'); setDuelStage('lobby'); }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        matchMode === 'bot'
                          ? 'bg-[#0070F3] text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ghost Bot Sim
                    </button>
                  </div>

                  {/* ELO Band Badge */}
                  <div className="bg-[#050914] border border-slate-800/80 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ranked ELO Band: <strong className="text-white font-mono">2,400 - 2,550</strong></span>
                  </div>
                </div>

                {/* Exercise Selector Strip */}
                <div className="flex items-center justify-between bg-[#050914] border border-slate-800 p-3 rounded-2xl mb-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>DUEL EXERCISE:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExercise('pushup')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        exercise === 'pushup'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Push-Ups
                    </button>
                    <button
                      onClick={() => setExercise('squat')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        exercise === 'squat'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Squats
                    </button>
                    <button
                      onClick={() => setExercise('jumpingjack')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        exercise === 'jumpingjack'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Jumping Jacks
                    </button>
                  </div>
                </div>

                {/* MODE SPECIFIC INTERACTIVE CONTROLS */}
                {matchMode === 'bot' && (
                  <div className="bg-[#050914] border border-cyan-500/40 p-4 rounded-2xl mb-4 space-y-3">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>SELECT GHOST BOT DIFFICULTY</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setBotDifficulty('rookie')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          botDifficulty === 'rookie'
                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                            : 'bg-[#081326] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">🥉 Rookie Bot</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">2,100 ELO • Easy</div>
                      </button>

                      <button
                        onClick={() => setBotDifficulty('spartan')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          botDifficulty === 'spartan'
                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                            : 'bg-[#081326] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">🥈 Spartan Bot</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">2,450 ELO • Balanced</div>
                      </button>

                      <button
                        onClick={() => setBotDifficulty('titan')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          botDifficulty === 'titan'
                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                            : 'bg-[#081326] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">🥇 Titan Bot</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">2,700 ELO • Pro</div>
                      </button>
                    </div>
                  </div>
                )}

                {matchMode === 'private' && (
                  <form onSubmit={handleJoinPrivateRoom} className="bg-[#050914] border border-slate-800 p-4 rounded-2xl mb-4 space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <span>JOIN OR CREATE PRIVATE ROOM</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleGenerateRoomCode}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Generate Code
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Room Code (e.g. FIT-4029)"
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value)}
                        className="flex-1 bg-[#081326] border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                      >
                        Join Room
                      </button>
                    </div>

                    {roomMessage && (
                      <div className="text-[11px] text-cyan-300 font-mono animate-pulse">{roomMessage}</div>
                    )}
                  </form>
                )}

                {/* INTERACTIVE RADAR ARENA */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[360px] my-2 flex items-center justify-center">
                  {/* Radar Grid Circles */}
                  <div className={`relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full border flex items-center justify-center transition-all ${
                    duelStage === 'matchmaking'
                      ? 'border-cyan-500/60 shadow-[0_0_30px_rgba(0,112,243,0.3)]'
                      : 'border-slate-800/80'
                  }`}>
                    
                    {/* Rotating Radar Sweep Beam when queued */}
                    {duelStage === 'matchmaking' && (
                      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(0,112,243,0.45)_360deg)] animate-[spin_3s_linear_infinite] pointer-events-none" />
                    )}

                    <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border border-slate-800/60 flex items-center justify-center">
                      <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center">
                        
                        {/* Center Node: YOU */}
                        <div className="w-13 h-13 rounded-full bg-[#0070F3] border-2 border-cyan-300 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(0,112,243,0.5)] z-20">
                          <span className="text-base">🏃</span>
                          <span className="text-[8px] font-black tracking-wider uppercase leading-none">YOU</span>
                        </div>

                      </div>
                    </div>

                    {/* Degree Markers */}
                    <span className="absolute top-2 text-[9px] font-mono text-slate-600">000°</span>
                    <span className="absolute right-2 text-[9px] font-mono text-slate-600">090°</span>
                    <span className="absolute bottom-2 text-[9px] font-mono text-slate-600">180°</span>
                    <span className="absolute left-2 text-[9px] font-mono text-slate-600">270°</span>

                    {/* INTERACTIVE CLICKABLE RADAR NODES FROM ROSTER */}
                    
                    {/* Node 1: Elena Vance (Top Right) */}
                    <button
                      onClick={() => selectRival(RIVAL_ROSTER[0])}
                      className={`absolute top-[18%] right-[14%] z-30 flex items-center gap-2 group transition-all text-left ${
                        selectedRivalId === 'elena' ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${selectedRivalId === 'elena' ? 'bg-cyan-400 animate-ping absolute' : ''}`} />
                      <div className={`w-3.5 h-3.5 rounded-full ${selectedRivalId === 'elena' ? 'bg-cyan-400' : 'bg-slate-400'} relative z-10`} />
                      <div className={`border px-3 py-1.5 rounded-xl text-[10px] transition-all ${
                        selectedRivalId === 'elena' 
                          ? 'bg-[#081326] border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                          : 'bg-[#050914]/90 border-slate-800'
                      }`}>
                        <div className="font-bold text-cyan-300">2,480 ELO // Elena V.</div>
                        <div className="text-slate-400 text-[9px]">[Locked Rival • 14ms]</div>
                      </div>
                    </button>

                    {/* Node 2: Marcus Vance (Bottom Left) */}
                    <button
                      onClick={() => selectRival(RIVAL_ROSTER[1])}
                      className={`absolute bottom-[20%] left-[10%] z-30 flex items-center gap-2 group transition-all text-left ${
                        selectedRivalId === 'marcus' ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${selectedRivalId === 'marcus' ? 'bg-cyan-400 animate-ping absolute' : ''}`} />
                      <div className={`w-3 h-3 rounded-full ${selectedRivalId === 'marcus' ? 'bg-cyan-400' : 'bg-slate-500'} relative z-10`} />
                      <div className={`border px-2.5 py-1 rounded-xl text-[9px] transition-all ${
                        selectedRivalId === 'marcus' 
                          ? 'bg-[#081326] border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                          : 'bg-[#050914]/90 border-slate-800'
                      }`}>
                        <div className="font-bold text-white">2,510 ELO // Marcus V.</div>
                        <div className="text-slate-400 text-[8px]">[Nearby Node • 9ms]</div>
                      </div>
                    </button>

                    {/* Node 3: Chloé Laurent (Top Left) */}
                    <button
                      onClick={() => selectRival(RIVAL_ROSTER[2])}
                      className={`absolute top-[32%] left-[10%] z-20 flex items-center gap-2 group transition-all text-left ${
                        selectedRivalId === 'chloe' ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedRivalId === 'chloe' ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                      <div className={`border px-2.5 py-1 rounded-xl text-[9px] transition-all ${
                        selectedRivalId === 'chloe' 
                          ? 'bg-[#081326] border-cyan-400 text-cyan-300' 
                          : 'bg-[#050914]/90 border-slate-800 text-slate-300'
                      }`}>
                        2,495 ELO // Chloé L.
                      </div>
                    </button>

                    {/* Node 4: Alex Rivers (Bottom Right) */}
                    <button
                      onClick={() => selectRival(RIVAL_ROSTER[3])}
                      className={`absolute bottom-[22%] right-[12%] z-20 flex items-center gap-2 group transition-all text-left ${
                        selectedRivalId === 'alex' ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedRivalId === 'alex' ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                      <div className={`border px-2.5 py-1 rounded-xl text-[9px] transition-all ${
                        selectedRivalId === 'alex' 
                          ? 'bg-[#081326] border-cyan-400 text-cyan-300' 
                          : 'bg-[#050914]/90 border-slate-800 text-slate-300'
                      }`}>
                        2,530 ELO // Alex R.
                      </div>
                    </button>

                  </div>

                  {/* Bottom Challengers Badge */}
                  <div className="absolute bottom-1 bg-[#050914]/90 border border-slate-800 px-4 py-1.5 rounded-full text-[11px] font-semibold text-slate-300">
                    <span className="text-cyan-400">💡 Click any radar node above</span> to select rival directly
                  </div>
                </div>
              </div>

              {/* Bottom Matchmaking Timer & Action Controls */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {duelStage === 'matchmaking' 
                          ? queueTimer > 2.0 ? 'SCANNING RADAR NODES...' : queueTimer > 1.0 ? 'EVALUATING SENSOR HANDSHAKE...' : 'MATCH LOCK READY!' 
                          : duelStage === 'match_locked' 
                          ? 'BOUT COUNTDOWN' 
                          : 'RADAR READY'}
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-[#38bdf8] font-mono tracking-tight mt-1">
                      {duelStage === 'match_locked' ? `00:0${boutCountdown}` : `00:0${queueTimer.toFixed(1)}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">SELECTED RIVAL</span>
                    <span className="text-sm font-bold text-cyan-400 uppercase">{opponent.name}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-[#0070F3] rounded-full transition-all duration-100" 
                    style={{ width: duelStage === 'matchmaking' ? `${(queueTimer / 3.0) * 100}%` : '100%' }} 
                  />
                </div>

                {/* Queue Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {duelStage === 'matchmaking' ? (
                    <button 
                      onClick={handleCancelQueue}
                      className="w-full py-3.5 rounded-2xl bg-[#131b2e] hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Cancel Queue
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartQueue}
                      className="w-full py-3.5 rounded-2xl bg-[#131b2e] hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4 text-cyan-400" />
                      <span>Search Radar Queue</span>
                    </button>
                  )}

                  <button 
                    onClick={handleLockMatch}
                    className="w-full py-3.5 rounded-2xl bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Challenge Rival Now</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Matched Opponent, Ruleset & Room Code (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 flex flex-col justify-between h-full">

              {/* 1. SELECTED RIVAL & MATCH LOCK CARD */}
              <div className="bg-[#0c101d] border border-slate-800/80 rounded-3xl p-5 text-left space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#0070F3] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>TARGET RIVAL NODE</span>
                  </span>
                  <span className="bg-[#0d223a] text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30">
                    MATCH LOCK 94%
                  </span>
                </div>

                {/* Opponent Profile Box */}
                <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 flex-shrink-0">
                    <img src={opponent.avatar || opponentImg} alt={opponent.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-[#0070F3] text-[8px] font-black px-1 rounded text-white">PRO</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{opponent.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      Rating: <span className="text-white font-semibold">{opponent.elo} ELO</span>
                    </div>
                    <div className="text-[10px] text-cyan-400 mt-0.5 font-semibold">
                      Win Rate: {opponent.winRate} • Streak: {opponent.streak} Wins
                    </div>
                  </div>
                </div>

                {/* Biometric Sensor Sync Verification */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    BIOMETRIC SENSOR SYNC VERIFICATION
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Node 1 */}
                    <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                      <Heart className="w-4 h-4 text-cyan-400 mb-1 animate-pulse" />
                      <span className="text-[11px] font-bold text-white font-mono">{opponent.bpm} BPM</span>
                      <span className="text-[8px] text-slate-400 mt-0.5">Heart Rate</span>
                    </div>

                    {/* Node 2 */}
                    <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                      <Bike className="w-4 h-4 text-cyan-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-200">{opponent.wattage}W</span>
                      <span className="text-[8px] text-slate-400 mt-0.5">Watt Output</span>
                    </div>

                    {/* Node 3 */}
                    <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                      <Wind className="w-4 h-4 text-cyan-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-200">{opponent.ping || '12ms'}</span>
                      <span className="text-[8px] text-cyan-400 mt-0.5">Ping Latency</span>
                    </div>
                  </div>
                </div>

                {/* Locked In Status Bar */}
                <div className="bg-[#071326] border border-cyan-500/40 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>Both Athletes Locked In</span>
                  </div>
                  <button 
                    onClick={handleLockMatch}
                    className="bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md transition-all"
                  >
                    Start Bout
                  </button>
                </div>
              </div>

              {/* 2. DUEL RULESET & WAGER CARD */}
              <div className="bg-[#0c101d] border border-slate-800/80 rounded-3xl p-5 text-left space-y-3 shadow-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  DUEL RULESET & WAGER
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Sub Card 1 */}
                  <div className="bg-[#050914] border border-slate-800 p-3 rounded-2xl space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Mode</div>
                    <div className="text-sm font-bold text-white">60s Sprint Battle</div>
                    <div className="text-[9px] text-slate-500">Continuous CV Referee</div>
                  </div>

                  {/* Sub Card 2 */}
                  <div className="bg-[#050914] border border-slate-800 p-3 rounded-2xl space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Scoring Engine</div>
                    <div className="text-sm font-bold text-white leading-tight">Velocity & Depth Precision</div>
                    <div className="text-[9px] text-cyan-400">Sudden Death Enabled</div>
                  </div>
                </div>
              </div>

              {/* 3. PRIVATE DUEL ROOM CARD */}
              <div className="bg-[#0c101d] border border-slate-800/80 rounded-3xl p-5 text-left space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Private Duel Room</span>
                </div>

                {/* Access Passphrase Box */}
                <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">ACCESS PASSPHRASE</div>
                    <div className="text-xl font-black text-[#0070F3] font-mono tracking-wider">{roomCode}</div>
                  </div>

                  <button 
                    onClick={handleCopyCode}
                    className="bg-[#131b2e] hover:bg-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                {/* Share WhatsApp Link Button */}
                <button className="w-full py-3 rounded-full border border-slate-700 bg-[#050914] hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  Share Instant WhatsApp Duel Link
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 2. LIVE 1v1 DUEL BATTLE ARENA                             */}
        {/* ========================================================= */}
        {duelStage === 'live_battle' && (
          <div className="w-full space-y-6">

            {/* TOP AUTHORITATIVE SCORE & TIMER BAR WITH BACK BUTTON */}
            <div className="w-full bg-[#070c18] border border-slate-800/90 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
              
              {/* Left: Exit Duel Back Button & Player Profile */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCancelQueue}
                  className="p-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                  title="Exit Duel & Return to Lobby"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Exit Duel</span>
                </button>

                <div className="w-12 h-12 rounded-2xl bg-[#0070F3] border-2 border-cyan-300 flex flex-col items-center justify-center text-white shadow-[0_0_15px_rgba(0,112,243,0.4)]">
                  <span className="text-xs font-black">YOU</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">YOUR VERIFIED REPS</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
                    {playerReps}
                  </div>
                </div>

                {/* Flame Combo Multiplier Badge */}
                {playerTelemetry.isComboActive && (
                  <div className="bg-amber-950/80 border border-amber-500/50 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>1.5x COMBO</span>
                  </div>
                )}
              </div>

              {/* Center: Authoritative 60s Match Clock & Lead Indicator */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">
                    LIVE DUEL • 60S SPRINT
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black font-mono text-cyan-400 tracking-tight my-0.5">
                  00:{matchTimeLeft < 10 ? `0${matchTimeLeft}` : matchTimeLeft}
                </div>

                {/* Dynamic Lead Badge */}
                <div className={`px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-lg ${
                  isPlayerAhead 
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isOpponentAhead
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-cyan-950/90 border-cyan-500 text-cyan-300'
                }`}>
                  {isPlayerAhead 
                    ? `🔥 +${repDelta} REPS AHEAD`
                    : isOpponentAhead
                    ? `⚠️ -${Math.abs(repDelta)} REPS BEHIND`
                    : '⚔️ TIED MATCH'}
                </div>
              </div>

              {/* Right: Opponent Profile & Live Score */}
              <div className="flex items-center gap-4 flex-row-reverse text-right">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                  <img src={opponent.avatar || opponentImg} alt={opponent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{opponent.name.toUpperCase()}</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-tight leading-none mt-0.5">
                    {opponentReps}
                  </div>
                </div>
              </div>

            </div>

            {/* SPLIT SCREEN ARENA: YOUR CAMERA FEED (LEFT) vs OPPONENT STREAM (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 1. YOUR VIEWPORT (AI POSE CAMERA FEED) */}
              <div className="bg-[#070c18] border border-slate-800/90 rounded-3xl p-4 flex flex-col space-y-3 shadow-2xl relative">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      YOUR ARENA • AI POSE REFEREE
                    </span>
                  </div>

                  <button
                    onClick={handleManualRep}
                    className="px-3 py-1.5 rounded-xl bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+1 Rep (Test)</span>
                  </button>
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#040711] border border-slate-800">
                  <PoseCanvas
                    exercise={exercise}
                    onRepUpdate={handleRepUpdate}
                    onTelemetryUpdate={handleTelemetryUpdate}
                    onVoiceFeedback={speak}
                  />
                </div>

                {/* Form Status Bar */}
                <div className="bg-[#040711] border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Form Precision:</span>
                  <span className={playerTelemetry.isFormValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {playerTelemetry.isFormValid ? '✓ CLEAN' : '⚠️ FAULT LATCHED'}
                  </span>
                </div>
              </div>

              {/* 2. OPPONENT VIEWPORT (SIMULATED / WEBSOCKET STREAM) */}
              <div className="bg-[#070c18] border border-slate-800/90 rounded-3xl p-4 flex flex-col space-y-3 shadow-2xl relative">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      OPPONENT ARENA • {opponent.name.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 bg-[#050914] px-2.5 py-1 rounded-lg border border-slate-800">
                    PING: {opponent.ping || '14ms'}
                  </span>
                </div>

                {/* Opponent Visual Feed Placeholder */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#040711] border border-slate-800 flex flex-col items-center justify-center p-6 text-center group">
                  <img 
                    src={opponent.avatar || opponentImg} 
                    alt={opponent.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-[#040711]/80" />

                  {/* Neon Opponent HUD Overlay */}
                  <div className="relative z-10 space-y-3">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-400/80 mx-auto flex items-center justify-center bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(0,210,255,0.4)] animate-pulse">
                      <Swords className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">{opponent.name}</h3>
                      <div className="text-xs font-mono text-cyan-400 mt-0.5">
                        Performing {exercise === 'pushup' ? 'Push-Ups' : exercise === 'squat' ? 'Squats' : 'Jumping Jacks'}
                      </div>
                    </div>

                    <div className="bg-[#050914]/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 inline-block">
                      Telemetry: <strong className="text-white">{opponent.bpm} BPM</strong> | Output: <strong className="text-cyan-400">{opponent.wattage}W</strong>
                    </div>
                  </div>
                </div>

                {/* Opponent Status Bar */}
                <div className="bg-[#040711] border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Opponent Form:</span>
                  <span className="text-cyan-400 font-bold">✓ 92° VALID DEPTH</span>
                </div>
              </div>

            </div>

            {/* BOTTOM QUIT / EARLY EXIT BAR */}
            <div className="flex justify-between items-center bg-[#070c18] border border-slate-800/80 p-3.5 rounded-2xl">
              <button
                onClick={handleCancelQueue}
                className="px-4 py-2 rounded-xl bg-[#131b2e] hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Exit Duel Arena</span>
              </button>

              <button
                onClick={finishMatch}
                className="px-6 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Conclude Duel Early
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 3. POST-MATCH RESULTS & ANIMATED WIN / LOSE SUMMARY      */}
        {/* ========================================================= */}
        {duelStage === 'match_summary' && (
          <div className="relative w-full max-w-3xl mx-auto py-4">

            {/* BACKGROUND ANIMATED GLOW & SPARKLE CONTAINER */}
            <div className={`w-full bg-[#0c101d] border rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl text-center relative overflow-hidden transition-all ${
              playerReps > opponentReps
                ? 'border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.35)]'
                : playerReps < opponentReps
                ? 'border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
                : 'border-cyan-500/80 shadow-[0_0_50px_rgba(0,112,243,0.35)]'
            }`}>
              
              {/* Confetti & Particle Sparks for WIN */}
              {playerReps > opponentReps && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-2 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
                  <div className="absolute top-6 right-1/4 w-4 h-4 bg-emerald-400 rounded-sm rotate-45 animate-bounce" style={{ animationDuration: '1.8s' }} />
                  <div className="absolute bottom-8 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '2.4s' }} />
                  <div className="absolute top-1/2 right-12 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                </div>
              )}

              {/* Warning Pulse for DEFEAT */}
              {playerReps < opponentReps && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-500/10 to-transparent animate-pulse" />
                </div>
              )}

              {/* ANIMATED HERO HEADER BANNER */}
              <div className="relative z-10 space-y-3">
                
                {/* 1. WIN ANIMATION BANNER */}
                {playerReps > opponentReps && (
                  <div className="space-y-3">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-400 to-cyan-400 p-1 animate-spin" style={{ animationDuration: '8s' }}>
                        <div className="w-full h-full bg-[#050914] rounded-full flex items-center justify-center">
                          <Crown className="w-12 h-12 text-amber-400 animate-bounce" />
                        </div>
                      </div>
                      <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-400/80 px-6 py-2 rounded-full text-emerald-300 font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                        <Trophy className="w-5 h-5 text-amber-400 fill-current" />
                        <span>VICTORY UNLOCKED! YOU WIN!</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 uppercase tracking-wide mt-2 font-hero-slant">
                        CHAMPION OF THE ARENA
                      </h2>
                    </div>
                  </div>
                )}

                {/* 2. LOSE ANIMATION BANNER */}
                {playerReps < opponentReps && (
                  <div className="space-y-3">
                    <div className="w-20 h-20 rounded-full bg-rose-950/80 border-2 border-rose-500/80 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse">
                      <Skull className="w-10 h-10" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 px-6 py-2 rounded-full text-rose-300 font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                        <Swords className="w-5 h-5 text-rose-400" />
                        <span>VALIANT DEFEAT</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide mt-2 font-hero-slant">
                        TOUGH BATTLE • KEEP TRAININ'
                      </h2>
                    </div>
                  </div>
                )}

                {/* 3. TIE ANIMATION BANNER */}
                {playerReps === opponentReps && (
                  <div className="space-y-3">
                    <div className="w-20 h-20 rounded-full bg-cyan-950/80 border-2 border-cyan-500/80 mx-auto flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(0,210,255,0.4)]">
                      <Shield className="w-10 h-10" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 bg-cyan-950/90 border border-cyan-500/80 px-6 py-2 rounded-full text-cyan-300 font-black text-sm uppercase tracking-widest">
                        <span>HANDSHAKE DRAW • TIE MATCH</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide mt-2 font-hero-slant">
                        EQUAL PERFORMANCE
                      </h2>
                    </div>
                  </div>
                )}

              </div>

              {/* SCORE COMPARISONS BOX */}
              <div className="relative z-10 grid grid-cols-2 gap-4 bg-[#050914] border border-slate-800 p-6 rounded-3xl shadow-inner">
                <div className="space-y-1 text-center border-r border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase">YOUR VERIFIED REPS</div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-white">{playerReps}</div>
                  <div className={`text-xs font-bold ${playerReps >= opponentReps ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {playerReps > opponentReps ? '+24 ELO Rating Gain' : playerReps < opponentReps ? '-12 ELO Rating' : '+0 ELO Rating'}
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">{opponent.name.toUpperCase()}</div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-cyan-400">{opponentReps}</div>
                  <div className="text-xs text-slate-400 font-semibold">{opponent.elo} ELO</div>
                </div>
              </div>

              {/* TELEMETRY SUMMARY BADGES */}
              <div className="relative z-10 grid grid-cols-3 gap-3">
                <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">96.8% Clean</div>
                  <div className="text-[10px] text-slate-400">Form Precision</div>
                </div>

                <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl text-center">
                  <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">
                    {playerReps > opponentReps ? '+450 XP' : '+150 XP'}
                  </div>
                  <div className="text-[10px] text-slate-400">Ranked XP</div>
                </div>

                <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-2xl text-center">
                  <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">1.5x Multiplier</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Streak Bonus</div>
                </div>
              </div>

              {/* ACTION BUTTONS WITH CLEAR BACK BUTTON */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleStartQueue}
                  className="w-full py-4 rounded-2xl bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Play Next Duel</span>
                </button>

                <button
                  onClick={handleCancelQueue}
                  className="w-full py-4 rounded-2xl bg-[#131b2e] hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-700 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Back to Duel Lobby</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
