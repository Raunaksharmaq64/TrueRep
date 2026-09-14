import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar({ activeTab = 'home', onSelectTab }) {
  return (
    <header className="w-full px-6 lg:px-12 py-5 flex items-center justify-between relative z-50 bg-[#03060d] border-b border-slate-900/60">
      {/* Left: Brand Logo & Search */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onSelectTab && onSelectTab('home')} 
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          {/* Logo Vector Image */}
          <img 
            src={logoImg} 
            alt="TrueRep Vector Logo" 
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform duration-200" 
          />

          {/* Logo Text Stack */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 font-extrabold tracking-wider text-lg leading-none">
              <span className="text-white">TRUE</span>
              <span className="text-cyan-400">REP</span>
            </div>
            <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 tracking-[0.18em] uppercase leading-tight mt-0.5">
              <span>TRAIN • TRACK •</span>
              <br />
              <span>PROGRESS • BELONG</span>
            </div>
          </div>
        </button>

        {/* Search Icon */}
        <button 
          aria-label="Search"
          className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 ml-2 p-1 focus:outline-none"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button 
          onClick={() => onSelectTab && onSelectTab('home')} 
          className={`relative py-1 font-semibold transition-colors ${
            activeTab === 'home' 
              ? 'text-white after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Home
        </button>
        <button 
          onClick={() => onSelectTab && onSelectTab('aicoach')} 
          className={`relative py-1 font-semibold transition-colors ${
            activeTab === 'aicoach' 
              ? 'text-white after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          AI Coach
        </button>
        <button 
          onClick={() => onSelectTab && onSelectTab('duels')} 
          className={`relative py-1 font-semibold transition-colors ${
            activeTab === 'duels' 
              ? 'text-white after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          1v1 duels
        </button>
        <button 
          onClick={() => onSelectTab && onSelectTab('profile')} 
          className={`relative py-1 font-semibold transition-colors ${
            activeTab === 'profile' 
              ? 'text-white after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Profile
        </button>
      </nav>

      {/* Right: Use Now Button with Arrow */}
      <div>
        <button 
          onClick={() => onSelectTab && onSelectTab('aicoach')}
          className="bg-[#0070F3] hover:bg-[#0060DF] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-2 group"
        >
          <span>Use Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
}
