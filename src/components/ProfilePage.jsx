import React, { useState } from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  MapPin, 
  Flame, 
  Zap, 
  Activity, 
  User, 
  Award, 
  CheckCircle2, 
  Copy, 
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import userAvatar from '../assets/athlete.jpg';

export default function ProfilePage() {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText('TR-8842-CYBER');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#03060d] text-white px-4 sm:px-8 lg:px-12 py-6 select-none">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. PROFILE HEADER BANNER */}
        <div className="w-full bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left: User Identity */}
          <div className="flex items-center gap-5 z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/50 flex-shrink-0 shadow-lg">
              <img src={userAvatar} alt="Athlete Profile" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 bg-[#0070F3] text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                TIER III
              </span>
            </div>

            <div className="text-left space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Alex Vance</h1>
                <span className="bg-[#0d223a] text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30">
                  CYBER TITAN
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-3 pt-0.5">
                <span>Athlete ID: <strong className="text-slate-200">TR-8842-CYBER</strong></span>
                <button 
                  onClick={handleCopyId} 
                  className="text-cyan-400 hover:text-white transition-colors"
                  aria-label="Copy Athlete ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedId && <span className="text-emerald-400 text-[10px]">Copied!</span>}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Faction Territory: <strong className="text-cyan-300 font-semibold">RGPV Civil Engineering Block</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Key Stats Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 z-10 w-full md:w-auto">
            <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl text-center">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">RANK ELO</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">2,510</div>
            </div>

            <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl text-center">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">WIN RATE</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">78.4%</div>
            </div>

            <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">VERIFIED REPS</div>
              <div className="text-xl font-bold text-[#0070F3] font-mono mt-0.5">14,820</div>
            </div>
          </div>
        </div>

        {/* 2. MAIN PROFILE GRID (8 Cols / 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Performance & Match History (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Performance Overview Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl text-left">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">DUEL RECORD</span>
                  <Trophy className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  124 <span className="text-sm font-normal text-slate-500">W</span> / 32 <span className="text-sm font-normal text-slate-500">L</span>
                </div>
                <div className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> +140 ELO This Week
                </div>
              </div>

              <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl text-left">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">FORM PRECISION</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                  98.2%
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                  Verified by Edge-AI Referee
                </div>
              </div>

              <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl text-left">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">TERRITORY CONTROL</span>
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  4 <span className="text-sm font-normal text-slate-400">Zones Held</span>
                </div>
                <div className="text-[10px] text-cyan-400 mt-2 font-semibold">
                  Faction Score: 4,850 pts
                </div>
              </div>
            </div>

            {/* Recent Match History Section */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  RECENT RANKED DUELS
                </h3>
                <span className="text-xs text-cyan-400 font-semibold cursor-pointer hover:underline">
                  View Full Career Log →
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { opponent: 'Elena Vance', elo: '+24 ELO', result: 'VICTORY', reps: '45/45 Reps', time: '10 mins ago', mode: 'Push-Ups Showdown' },
                  { opponent: 'Marcus T.', elo: '+18 ELO', result: 'VICTORY', reps: '38/40 Reps', time: '2 hours ago', mode: 'Barbell Clean & Jerk' },
                  { opponent: 'Chloé L.', elo: '-12 ELO', result: 'DEFEAT', reps: '40/45 Reps', time: '1 day ago', mode: 'Squat Power Surge' },
                  { opponent: 'Ghost Bot Alpha', elo: '+15 ELO', result: 'VICTORY', reps: '50/50 Reps', time: '2 days ago', mode: 'Solo WASM Referee' }
                ].map((match, idx) => (
                  <div key={idx} className="bg-[#050914] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${match.result === 'VICTORY' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>vs {match.opponent}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${match.result === 'VICTORY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}`}>
                            {match.result}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {match.mode} • {match.reps}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${match.result === 'VICTORY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {match.elo}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{match.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Loadout, Badges & Hardware Sync (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Active Cyber Loadout & Cosmetics Card */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> ACTIVE COSMETIC LOADOUT
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Cyber-Titan Visor HUD</div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">EQUIPPED</span>
                </div>

                <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Neon Skeleton Overlay</div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">EQUIPPED</span>
                </div>

                <div className="bg-[#050914] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Campus Conqueror Title</div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Hardware & Biometric Sync Card */}
            <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 text-left space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> SENSOR SYNC STATUS
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center bg-[#050914] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Edge Camera (30 FPS WASM):</span>
                  <span className="text-emerald-400 font-semibold font-mono">ONLINE</span>
                </div>

                <div className="flex justify-between items-center bg-[#050914] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300">Heart Rate Sensor (ANT+):</span>
                  <span className="text-emerald-400 font-semibold font-mono">CONNECTED</span>
                </div>

                <div className="flex justify-between items-center bg-[#050914] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300">PostGIS Map GPS Layer:</span>
                  <span className="text-emerald-400 font-semibold font-mono">ACTIVE</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
