import React, { useState } from 'react';
import { Radio, Menu, X, LayoutGrid, Activity, Swords, User } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useNearbyDevices, useAuth } from '../hooks';
import AuthModal from './auth/AuthModal';

export default function Navbar({ activeTab = 'home', onSelectTab }) {
  const { nearbyDevices } = useNearbyDevices();
  const { user, profile, levelProgress, rankProgress } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavClick = (tab) => {
    if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full px-4 sm:px-6 lg:px-12 py-3.5 sm:py-5 relative z-50 bg-[#F4F1EA] border-b border-[#E2E8F0]/80 select-none">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none"
            >
              <img
                src={logoImg}
                alt="TrueRep Logo"
                className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition-transform duration-200"
              />
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

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white border border-[#E2E8F0] p-1.5 rounded-full shadow-sm">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 lg:px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${activeTab === 'home' || activeTab === 'overview'
                  ? 'bg-[#1E222A] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleNavClick('aicoach')}
              className={`px-3.5 lg:px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${activeTab === 'aicoach'
                  ? 'bg-[#1E222A] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
                }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>AI Coach</span>
            </button>
            <button
              onClick={() => handleNavClick('duels')}
              className={`px-3.5 lg:px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${activeTab === 'duels'
                  ? 'bg-[#1E222A] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
                }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>1v1 Duels</span>
              {nearbyDevices.length > 0 && (
                <span className="bg-[#EAB308] text-[#18181B] text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5" />
                  <span>{nearbyDevices.length}</span>
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('profile')}
              className={`px-3.5 lg:px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${activeTab === 'profile'
                  ? 'bg-[#1E222A] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100'
                }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right: User Level / RepTokens Pill & Auth Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:flex items-center gap-2 bg-white border border-[#E2E8F0] hover:border-slate-400 px-3.5 py-1.5 rounded-full shadow-sm transition-all"
                title={`Level ${levelProgress?.currentLevel || 1} • ${levelProgress?.progressPercent || 0}% to Lvl ${levelProgress?.nextLevel || 2}`}
              >
                <span className="text-xs font-bold text-[#1E222A] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[#EAB308] flex items-center justify-center text-[10px] font-black">L</span>
                  <span>Lvl {levelProgress?.currentLevel || profile?.current_level || 1}</span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold">({levelProgress?.progressPercent || 0}%)</span>
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#1E222A] text-[#EAB308]">
                  {rankProgress?.rankTier || profile?.rank_tier || 'Bronze II'}
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1 font-mono">
                  <span>🪙</span>
                  <span>{profile?.rep_tokens || 1840}</span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white hover:bg-slate-100 text-[#1E222A] border border-[#E2E8F0] text-xs font-bold px-4 py-2 rounded-full shadow-sm transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Sign In</span>
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
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${activeTab === 'home' || activeTab === 'overview'
                  ? 'bg-[#1E222A] border-[#1E222A] text-white'
                  : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleNavClick('aicoach')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${activeTab === 'aicoach'
                  ? 'bg-[#1E222A] border-[#1E222A] text-white'
                  : 'bg-white border-[#E2E8F0] text-slate-700 hover:text-black'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>AI Coach</span>
            </button>

            <button
              onClick={() => handleNavClick('duels')}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all ${activeTab === 'duels'
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
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${activeTab === 'profile'
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

      {/* Auth Modal Integration */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
