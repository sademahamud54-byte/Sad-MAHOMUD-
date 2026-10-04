import React, { useState } from 'react';
import { TelegramProvider, useTelegram } from './context/TelegramContext.tsx';
import { SimulatorBar } from './components/SimulatorBar.tsx';
import { Header } from './components/Header.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { EarnTab } from './components/EarnTab.tsx';
import { UpgradeTab } from './components/UpgradeTab.tsx';
import { FriendsTab } from './components/FriendsTab.tsx';
import { RewardsTab } from './components/RewardsTab.tsx';
import { LeaderboardTab } from './components/LeaderboardTab.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Loader2, AlertTriangle, ShieldX } from 'lucide-react';
import { botBackground } from './assets/index.ts';

const MainContent: React.FC = () => {
  const { user, loading, error, refreshUser } = useTelegram();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4 select-none">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="font-heading font-black text-xl text-white">Launching Mining Bot</h2>
        <p className="text-xs text-slate-500 mt-1">Verifying Telegram authentication credentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-xl text-white">Access Notice</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">{error}</p>
        <button
          onClick={() => refreshUser()}
          className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (user?.status === 'banned') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-xl text-rose-300">Account Suspended</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">
          Your Telegram account (ID: {user.profile.telegramId}) has been suspended by the administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative">
      {/* Bot Wallpaper: Rainforest & Exotic Dove */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center opacity-35 filter brightness-90 saturate-110"
        style={{ backgroundImage: `url(${botBackground})` }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95 backdrop-blur-[1px]" />

      {/* Dev Simulator bar shown only outside native Telegram */}
      <div className="relative z-10">
        <SimulatorBar />
      </div>

      {/* Main Header */}
      <div className="relative z-10">
        <Header
          onOpenAbout={() => setAboutOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'earn' && <EarnTab />}
        {activeTab === 'upgrade' && <UpgradeTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'rewards' && <RewardsTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Bottom Sticky Navigation */}
      <div className="relative z-10">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* About & Config Support Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <TelegramProvider>
      <MainContent />
    </TelegramProvider>
  );
}
