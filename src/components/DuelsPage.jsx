import React, { useState, useEffect } from 'react';
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
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import opponentImg from '../assets/athlete.jpg';

export default function DuelsPage() {
  const [matchMode, setMatchMode] = useState('quick');
  const [timer, setTimer] = useState(2.8);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0.1 ? (prev - 0.1) : 3.0));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FIT-4029');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#03060d] text-white px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* MAIN 2-COLUMN DASHBOARD GRID (8 Cols / 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT COLUMN: Matchmaking Radar & Queue (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full space-y-6 relative overflow-hidden">
            
            <div>
              {/* Mode Selector Tabs Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 bg-[#050914] p-1 rounded-full border border-slate-800">
                  <button
                    onClick={() => setMatchMode('quick')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                      matchMode === 'quick'
                        ? 'bg-[#0070F3] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Quick Ranked Match
                  </button>
                  <button
                    onClick={() => setMatchMode('private')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                      matchMode === 'private'
                        ? 'bg-[#0070F3] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Private Duel Code
                  </button>
                  <button
                    onClick={() => setMatchMode('bot')}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                      matchMode === 'bot'
                        ? 'bg-[#0070F3] text-white shadow-md'
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

              {/* TACTICAL RADAR MATCHMAKING ARENA */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[420px] my-4 flex items-center justify-center">
                {/* Radar Grid Circles */}
                <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full border border-slate-800/80 flex items-center justify-center">
                  <div className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full border border-slate-800/60 flex items-center justify-center">
                    <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center">
                      
                      {/* Center Node: YOU */}
                      <div className="w-14 h-14 rounded-full bg-[#0070F3] border-2 border-cyan-300 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(0,112,243,0.5)] z-20">
                        <span className="text-lg">🏃</span>
                        <span className="text-[9px] font-black tracking-wider uppercase leading-none">YOU</span>
                      </div>

                    </div>
                  </div>

                  {/* Degree Markers */}
                  <span className="absolute top-2 text-[9px] font-mono text-slate-600">000°</span>
                  <span className="absolute right-2 text-[9px] font-mono text-slate-600">090°</span>
                  <span className="absolute bottom-2 text-[9px] font-mono text-slate-600">180°</span>
                  <span className="absolute left-2 text-[9px] font-mono text-slate-600">270°</span>

                  {/* Node 1: Elena V. (Locked Rival - Top Right) */}
                  <div className="absolute top-[18%] right-[18%] z-30 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping absolute" />
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 relative z-10" />
                    <div className="bg-[#081326] border border-cyan-500/50 px-3 py-1.5 rounded-lg text-[10px] text-left">
                      <div className="font-bold text-cyan-300">2,480 ELO // Elena V.</div>
                      <div className="text-slate-400 text-[9px]">[Locked Rival • 94%]</div>
                    </div>
                  </div>

                  {/* Node 2: Chloé L. (Top Left) */}
                  <div className="absolute top-[32%] left-[12%] z-20 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <div className="bg-[#050914]/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[9px] text-slate-300">
                      2,495 ELO // Chloé L.
                    </div>
                  </div>

                  {/* Node 3: Marcus T. (Bottom Left) */}
                  <div className="absolute bottom-[22%] left-[16%] z-20 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div className="bg-[#050914]/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[9px] text-slate-300 text-left">
                      <div className="font-semibold text-white">2,510 ELO // Marcus T.</div>
                      <div className="text-slate-500 text-[8px]">[Nearby Node • 9ms]</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Challengers Badge */}
                <div className="absolute bottom-2 bg-[#050914]/90 border border-slate-800 px-4 py-1.5 rounded-full text-[11px] font-semibold text-slate-300">
                  14 Challengers in Skill Range <span className="font-mono text-cyan-400">[2,400 - 2,550 ELO]</span>
                </div>
              </div>
            </div>

            {/* Bottom Matchmaking Timer & Actions */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    MATCH MAKING
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-[#38bdf8] font-mono tracking-tight mt-1">
                    00:0{timer.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#0070F3] rounded-full transition-all duration-300" style={{ width: `${(timer / 3.0) * 100}%` }} />
              </div>

              {/* Queue Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button className="w-full py-3 rounded-full bg-[#131b2e] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all">
                  Cancel Queue
                </button>
                <button className="w-full py-3 rounded-full bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-semibold shadow-lg transition-all">
                  Instant Fill
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Matched Opponent, Ruleset & Room Code (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between h-full">

            {/* 1. PLAYER FOUND & MATCH LOCK CARD */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-5 text-left space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#0070F3] uppercase tracking-wider">
                  PLAYER FOUND
                </span>
                <span className="bg-[#0d223a] text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30">
                  MATCH LOCK 94%
                </span>
              </div>

              {/* Opponent Profile Box */}
              <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-xl flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/40 flex-shrink-0">
                  <img src={opponentImg} alt="Elena Vance Profile" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-[#0070F3] text-[8px] font-black px-1 rounded text-white">PRO</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Elena Vance</h3>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    Rating: <span className="text-white font-semibold">2,480 ELO</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">
                    Win Rate: 68% • Streak: 4 Wins
                  </div>
                </div>
              </div>

              {/* Biometric Sensor Sync Verification */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  BIOMETRIC SENSOR SYNC VERIFICATION
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Node 1 */}
                  <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                    <Heart className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[11px] font-bold text-white font-mono">84 BPM</span>
                    <span className="text-[8px] text-slate-400 mt-0.5">Heart Rate</span>
                  </div>

                  {/* Node 2 */}
                  <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                    <Bike className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-200">Ergometer</span>
                    <span className="text-[8px] text-slate-400 mt-0.5">ANT+ Linked</span>
                  </div>

                  {/* Node 3 */}
                  <div className="bg-[#050914] border border-slate-800 p-2.5 rounded-xl text-center flex flex-col items-center">
                    <Wind className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-200">VO2 Mask</span>
                    <span className="text-[8px] text-cyan-400 mt-0.5">Synced 100%</span>
                  </div>
                </div>
              </div>

              {/* Locked In Status Bar */}
              <div className="bg-[#071326] border border-cyan-500/40 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Both Athletes Locked In</span>
                </div>
                <button className="bg-[#0070F3] text-white text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Bout in 03s
                </button>
              </div>
            </div>

            {/* 2. DUEL RULESET & WAGER CARD */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-5 text-left space-y-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                DUEL RULESET & WAGER
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sub Card 1 */}
                <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Mode</div>
                  <div className="text-sm font-bold text-white">3 Rounds × 90s</div>
                  <div className="text-[9px] text-slate-500">30s active rest interval</div>
                </div>

                {/* Sub Card 2 */}
                <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Scoring Engine</div>
                  <div className="text-sm font-bold text-white leading-tight">Velocity & Form Precision</div>
                  <div className="text-[9px] text-cyan-400">Sudden Death Enabled</div>
                </div>
              </div>
            </div>

            {/* 3. PRIVATE DUEL ROOM CARD */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Private Duel Room</span>
              </div>

              {/* Access Passphrase Box */}
              <div className="bg-[#050914] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">ACCESS PASSPHRASE</div>
                  <div className="text-xl font-black text-[#0070F3] font-mono tracking-wider">FIT-4029</div>
                </div>

                <button 
                  onClick={handleCopyCode}
                  className="bg-[#131b2e] hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* Share WhatsApp Link Button */}
              <button className="w-full py-3 rounded-full border border-slate-700 bg-[#050914] hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                <Share2 className="w-4 h-4 text-cyan-400" />
                Share Instant WhatsApp Duel Link
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
