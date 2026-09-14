import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AICoachPage from './components/AICoachPage';
import DuelsPage from './components/DuelsPage';
import ProfilePage from './components/ProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-[#03060d] text-white flex flex-col justify-between relative overflow-hidden select-none">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && <Hero />}
        {activeTab === 'aicoach' && <AICoachPage />}
        {activeTab === 'duels' && <DuelsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}
