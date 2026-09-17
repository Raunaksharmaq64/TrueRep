import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AICoachPage from './components/AICoachPage';
import DuelsPage from './components/DuelsPage';
import ProfilePage from './components/ProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Trigger dumbbell 360 spin & background blur overlay on tab switch
  const handleSelectTab = (newTab) => {
    if (newTab === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#18181B] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />
      
      {/* Background Blur & Dumbbell 360 Spin Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black/15 backdrop-blur-md flex items-center justify-center pointer-events-none animate-blur-overlay">
          <div className="w-16 h-16 rounded-full bg-[#1E222A] text-[#EAB308] border border-[#E2E8F0]/30 shadow-2xl flex items-center justify-center animate-dumbbell-spin">
            <Dumbbell className="w-8 h-8 fill-current" />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col relative">
        <div key={activeTab} className="animate-page-enter flex-1 flex flex-col w-full">
          {activeTab === 'home' && <Hero onNavigate={handleSelectTab} />}
          {activeTab === 'aicoach' && <AICoachPage />}
          {activeTab === 'duels' && <DuelsPage onNavigate={handleSelectTab} />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>
    </div>
  );
}
