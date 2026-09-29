import React, { useState } from 'react';
import { Radio, Menu, X, LayoutGrid, Activity, Swords, User } from 'lucide-react';
import logoImg from '../assets/logo.png';
import samuraiPfp from '../assets/samurai_pfp.png';
import SphericalAvatar from './common/SphericalAvatar';
import { useNearbyDevices, useAuth } from '../hooks';
import AuthModal from './auth/AuthModal';

export default function Navbar({ activeTab = 'home', onSelectTab }) {
  const { nearbyDevices } = useNearbyDevices();
  const { user, profile, levelProgress, rankProgress } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavClick = (tab) => {
    if (tab === 'profile' && !user && !profile) {
      setShowAuthModal(true);
      return;
    }
    if (onSelectTab) onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`w-full px-4 sm:px-6 lg:px-12 py-3 sm:py-4 relative z-50 transition-all duration-300 bg-[#050505]/90 backdrop-blur-[18px] border-b border-white/10 select-none ${mobileMenuOpen ? 'rounded-3xl' : 'rounded-full'}`}>
        <div className="max-w-[1408px] mx-auto flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none flex items-center justify-center w-[58px] sm:w-[73px] h-[48px] sm:h-[58px]"
              aria-label="Home"
            >
              <img
                src={logoImg}
                alt="TRUE REP Logo"
                className="w-[46px] sm:w-[54px] h-[36px] sm:h-[42px] object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </button>
          </div>

          {/* Center: Desktop Navigation Tabs Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-5 py-2 rounded-full text-[13px] font-medium tracking-[-1.2px] leading-[16px] transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'home' || activeTab === 'overview'
                  ? 'bg-[#FF8000] text-white font-semibold shadow-[0px_8px_18px_rgba(255,128,0,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleNavClick('aicoach')}
              className={`px-5 py-2 rounded-full text-[13px] font-medium tracking-[-1.2px] leading-[16px] transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'aicoach'
                  ? 'bg-[#FF8000] text-white font-semibold shadow-[0px_8px_18px_rgba(255,128,0,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>AI Coach</span>
            </button>
            <button
              onClick={() => handleNavClick('duels')}
              className={`px-5 py-2 rounded-full text-[13px] font-medium tracking-[-1.2px] leading-[16px] transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'duels'
                  ? 'bg-[#FF8000] text-white font-semibold shadow-[0px_8px_18px_rgba(255,128,0,0.25)]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>1v1 Duels</span>
              <span className="bg-[#FF8000] text-[#050505] text-[9px] font-bold px-1.5 py-0 rounded-full tracking-[-0.8px] leading-[16px]">
                {nearbyDevices.length > 0 ? nearbyDevices.length : 1}
              </span>
            </button>
          </nav>

          {/* Right: Auth & Logged-In User Profile Capsule */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="group flex items-center gap-2 p-1.5 pl-2 pr-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-[inset_5px_3px_65px_0px_rgba(255,255,255,0.15)]"
                title="View Athlete Profile"
              >
                {/* Spherical PFP Avatar synced across site */}
                <SphericalAvatar 
                  avatarUrl={profile?.avatar_url}
                  bannerUrl={profile?.banner_url}
                  pfpTransform={profile?.pfp_transform}
                  className="w-8 h-8"
                  borderClassName="border-2 border-yellow-500"
                  alt={profile?.display_name || 'Athlete'}
                />

                {/* Level Pill */}
                <div className="px-2.5 py-0.5 bg-yellow-500 text-zinc-900 text-[10px] font-black font-mono rounded-full uppercase tracking-wider shrink-0 shadow-xs">
                  LVL {profile?.current_level || levelProgress?.currentLevel || 14}
                </div>

                {/* Rank & ELO Pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-yellow-400 text-[10px] font-bold font-mono uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span>{profile?.rank_tier || 'RANK #1 • 2,510 ELO'}</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-[100px] sm:w-[124px] h-[40px] sm:h-[46px] bg-[#FF8000] hover:bg-[#FF9000] text-white text-[13px] sm:text-[14px] font-bold tracking-[-1.2px] leading-[16px] rounded-full shadow-[0px_8px_18px_rgba(255,128,0,0.25)] drop-shadow-[0_0_1px_#FF8000] transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Sign in</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-full bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 animate-fadeIn">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all min-h-[44px] ${
                activeTab === 'home' || activeTab === 'overview'
                  ? 'bg-[#FF8000] border-[#FF8000] text-black'
                  : 'bg-white/[0.04] border-white/10 text-white/80'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleNavClick('aicoach')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all min-h-[44px] ${
                activeTab === 'aicoach'
                  ? 'bg-[#FF8000] border-[#FF8000] text-black'
                  : 'bg-white/[0.04] border-white/10 text-white/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>AICoach</span>
            </button>

            <button
              onClick={() => handleNavClick('duels')}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all min-h-[44px] ${
                activeTab === 'duels'
                  ? 'bg-[#FF8000] border-[#FF8000] text-black'
                  : 'bg-white/[0.04] border-white/10 text-white/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Swords className="w-4 h-4" />
                <span>1v1 Duels</span>
              </div>
              <span className="bg-[#FFB800] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                {nearbyDevices.length > 0 ? nearbyDevices.length : 1}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('profile')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all min-h-[44px] ${
                activeTab === 'profile'
                  ? 'bg-[#FF8000] border-[#FF8000] text-black'
                  : 'bg-white/[0.04] border-white/10 text-white/80'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{user ? 'Athlete Profile' : 'Sign In'}</span>
            </button>
          </nav>
        )}
      </header>

      {/* Auth Modal Integration */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
