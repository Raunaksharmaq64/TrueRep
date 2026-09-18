import React, { useState } from 'react';
import { ArrowRight, Radio, Menu, X, LayoutGrid, Activity, Swords, User, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useNearbyDevices } from '../hooks';

export default function Navbar({ activeTab = 'home', onSelectTab }) {
  const { nearbyDevices } = useNearbyDevices();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full px-4 sm:px-6 lg:px-12 py-3.5 sm:py-5 relative z-50 bg-[#F4F1EA] border-b border-[#E2E8F0]/80">
      <div className="flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none"
          >
            {/* Brand Logo Image */}
            <img 
              src={logoImg} 
              alt="TrueRep Logo" 
              className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform duration-200" 
            />

            {/* Logo Text Stack */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-extrabold tracking-tight text-base sm:text-lg leading-none text-[#18181B]">
                <span>TRUE</span>
                <span className="text-[#64748B] font-light">REP</span>
                <span className="w-2 h-2 rounded-full bg-[#EAB308] inline-block ml-0.5"></span>
              </div>
              <div className="text-[8px] sm:text-[9.5px] font-medium text-slate-400 tracking-widest uppercase leading-tight mt-0.5 hidden xs:block">
                <span>AI ATHLETIC REFEREE ENGINE</span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Tabs with Minimalist Outline Icons */}
        <nav className="hidden md:flex items-center gap-1 bg-white border border-[#E2E8F0] p-1.5 rounded-full shadow-sm">
          <button 
            onClick={() => handleNavClick('home')} 
            className={`px-4 lg:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'home' 
                ? 'bg-[#1E222A] text-white shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => handleNavClick('aicoach')} 
            className={`px-4 lg:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'aicoach' 
                ? 'bg-[#1E222A] text-white shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI Coach</span>
          </button>
          <button 
            onClick={() => handleNavClick('duels')} 
            className={`px-4 lg:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'duels' 
                ? 'bg-[#1E222A] text-white shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1v1 Duels</span>
            {nearbyDevices.length > 0 && (
              <span className="bg-[#EAB308] text-[#18181B] text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1" title={`${nearbyDevices.length} nearby device(s) ready`}>
                <Radio className="w-2.5 h-2.5" />
                <span>{nearbyDevices.length}</span>
              </span>
            )}
          </button>
          <button 
            onClick={() => handleNavClick('profile')} 
            className={`px-4 lg:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'bg-[#1E222A] text-white shadow-sm font-semibold' 
                : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Right: Start Now Button (Home tab only) & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {(activeTab === 'home' || activeTab === 'overview') && (
            <button 
              onClick={() => handleNavClick('aicoach')}
              className="bg-[#1E222A] hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-full transition-all duration-200 shadow-sm flex items-center gap-1.5 sm:gap-2 group"
            >
              <span>Start Now</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform text-[#EAB308]" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-full bg-white border border-[#E2E8F0] text-slate-700 hover:text-[#18181B] focus:outline-none shadow-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Dropdown Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 animate-fadeIn">
          <button
            onClick={() => handleNavClick('home')}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-[#1E222A] border-[#1E222A] text-white'
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleNavClick('aicoach')}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
              activeTab === 'aicoach'
                ? 'bg-[#1E222A] border-[#1E222A] text-white'
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={() => handleNavClick('duels')}
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${
              activeTab === 'duels'
                ? 'bg-[#1E222A] border-[#1E222A] text-white'
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Swords className="w-4 h-4" />
              <span>1v1 Duels</span>
            </div>
            {nearbyDevices.length > 0 && (
              <span className="bg-[#EAB308] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                {nearbyDevices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('profile')}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#1E222A] border-[#1E222A] text-white'
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </nav>
      )}
    </header>
  );
}

