'use client';

/**
 * ============================================================================
 * UNIFIED ENTERPRISE SPORTS AUCTION PLATFORM SHELL
 * RobiQuest 2026 Live Auction Arena • Conducted by RoboCell
 * Custom Flutter ThemeData Applied:
 *  - Background: Pure Black (#000000)
 *  - Primary: Persian Green (#16A085)
 *  - Header / Foreground Accent: Champagne Gold (#D8CFB4)
 *  - Typography: Google Fonts Poppins
 *  - Border Radius: 18px (rounded-[18px])
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Tv,
  Users,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  FolderEdit,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

import { SportsAuctionAdminPanel } from '../sports/SportsAuctionAdminPanel';
import { SportsBiddersPanel } from '../sports/SportsBiddersPanel';
import { SportsViewersPanel } from '../sports/SportsViewersPanel';
import { HiddenSoftwareAdminModal } from '../sports/HiddenSoftwareAdminModal';
import { RoleAuthGateModal } from '../auth/RoleAuthGateModal';
import { LiveBroadcastTicker } from '../spectator/LiveBroadcastTicker';
import { ContenderManagerModal } from '../admin/ContenderManagerModal';

type PublicPanelTab = 'AUCTION_ADMIN' | 'FRANCHISE_BIDDER' | 'STADIUM_VIEWER';

export const AuctionApp: React.FC = () => {
  const {
    profile,
    lots,
    teams,
    activeLotId,
    isMuted,
    userRole,
    authenticatedTeamId,
    logoutRole,
    toggleMute,
    loadPresetTemplate,
  } = useAuctionEngineStore();

  // Public view defaults to STADIUM_VIEWER for general spectators
  const [activeTab, setActiveTab] = useState<PublicPanelTab>('STADIUM_VIEWER');
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isSoftwareAdminModalOpen, setIsSoftwareAdminModalOpen] = useState(false);

  // Role Auth Gate Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'ADMIN' | 'BIDDER' | 'VIEWER'>('ADMIN');

  // Contender CMS Studio Modal
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);

  // Sync activeTab when userRole changes
  useEffect(() => {
    if (userRole === 'ADMIN') {
      setActiveTab('AUCTION_ADMIN');
    } else if (userRole === 'BIDDER') {
      setActiveTab('FRANCHISE_BIDDER');
    }
  }, [userRole]);

  // Global stealth keydown listener: Ctrl + Shift + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsSoftwareAdminModalOpen((prev) => !prev);
      }
    };

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'sys-admin') {
        setIsSoftwareAdminModalOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSelectTemplate = (
    templateKey: 'ROBIQUEST' | 'EMPTY' | 'SPORTS_IPL' | 'FINE_ART_LUXURY' | 'REAL_ESTATE'
  ) => {
    loadPresetTemplate(templateKey);
    setIsTemplateMenuOpen(false);
  };

  const handleTabClick = (tab: PublicPanelTab) => {
    if (tab === 'AUCTION_ADMIN') {
      if (userRole === 'ADMIN') {
        setActiveTab('AUCTION_ADMIN');
      } else {
        setAuthModalTab('ADMIN');
        setIsAuthModalOpen(true);
      }
    } else if (tab === 'FRANCHISE_BIDDER') {
      if (userRole === 'BIDDER' && authenticatedTeamId) {
        setActiveTab('FRANCHISE_BIDDER');
      } else {
        setAuthModalTab('BIDDER');
        setIsAuthModalOpen(true);
      }
    } else {
      setActiveTab('STADIUM_VIEWER');
    }
  };

  const authenticatedTeam = teams.find((t) => t.id === authenticatedTeamId);

  return (
    <div className="min-h-screen bg-black text-white font-poppins flex flex-col selection:bg-[#16A085]/40 selection:text-white">
      {/* Role Authentication Gate Modal */}
      <RoleAuthGateModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onAuthenticated={(role) => {
          if (role === 'ADMIN') setActiveTab('AUCTION_ADMIN');
          if (role === 'BIDDER') setActiveTab('FRANCHISE_BIDDER');
          if (role === 'VIEWER') setActiveTab('STADIUM_VIEWER');
        }}
      />

      {/* Contender CMS Studio Modal */}
      <ContenderManagerModal
        isOpen={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
      />

      {/* Hidden Software Admin Modal */}
      <HiddenSoftwareAdminModal
        isOpen={isSoftwareAdminModalOpen}
        onClose={() => setIsSoftwareAdminModalOpen(false)}
      />

      {/* =====================================================================
          APP BAR / TOP NAVIGATION (PURE BLACK #000000 + #D8CFB4 ACCENT)
          ===================================================================== */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Left: RoboCell Brand Identity & Slogan */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[18px] bg-black border-2 border-[#16A085] p-0.5 shadow-lg shadow-[#16A085]/20 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src="/robocell-crest.png"
                alt="RoboCell Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-[#D8CFB4] uppercase font-poppins">
                  ROBIQUEST
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[18px] text-[10px] font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#D8CFB4]/80 truncate max-w-[260px] sm:max-w-xs font-semibold flex items-center gap-1.5">
                <span className="text-[#16A085] font-bold">RoboCell</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-normal">Tech, Transform, Thrive</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10 text-xs font-poppins">
            <span className="px-2 py-0.5 rounded-[18px] bg-white/[0.03] border border-white/10 text-[#D8CFB4]">
              {profile.currency}
            </span>
            <span className="text-gray-400">
              {lots.length} Contenders
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-[#16A085] font-bold">
              {teams.length} Franchises
            </span>
          </div>
        </div>

        {/* Center: 3 Role Tabs (Theme 18px Pill Navbar) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-[18px] backdrop-blur-md">
          {/* 1. Stadium Projector (Public Spectator View) */}
          <button
            onClick={() => handleTabClick('STADIUM_VIEWER')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'STADIUM_VIEWER'
                ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Stadium Screen
            <span className="px-1.5 py-0.2 rounded-[18px] bg-black/40 text-[9px] text-black font-mono font-bold">
              4K
            </span>
          </button>

          {/* 2. Franchise Bidder Panel (Locked to Team PIN) */}
          <button
            onClick={() => handleTabClick('FRANCHISE_BIDDER')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'FRANCHISE_BIDDER'
                ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Franchise Cockpit</span>
            {userRole !== 'BIDDER' && <Lock className="w-3 h-3 text-gray-500" />}
          </button>

          {/* 3. Auction Admin (Locked to Admin PIN) */}
          <button
            onClick={() => handleTabClick('AUCTION_ADMIN')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'AUCTION_ADMIN'
                ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Auctioneer Desk</span>
            {userRole !== 'ADMIN' && <Lock className="w-3 h-3 text-gray-500" />}
          </button>
        </nav>

        {/* Right: Role Status & Controls */}
        <div className="flex items-center gap-2">
          {/* Active Role Indicator */}
          {userRole === 'ADMIN' ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40 text-xs font-bold">
                <Gavel className="w-3.5 h-3.5" />
                <span>Auctioneer Authority</span>
              </span>
              <button
                onClick={logoutRole}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-rose-400 hover:text-white transition-all"
                title="Log Out & Lock Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : userRole === 'BIDDER' && authenticatedTeam ? (
            <div className="flex items-center gap-1.5">
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] text-xs font-bold border"
                style={{
                  backgroundColor: `${authenticatedTeam.color}20`,
                  borderColor: authenticatedTeam.color,
                  color: '#ffffff',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: authenticatedTeam.color }} />
                <span>{authenticatedTeam.shortCode} #{authenticatedTeam.paddleNumber}</span>
              </span>
              <button
                onClick={logoutRole}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-rose-400 hover:text-white transition-all"
                title="Release Franchise Terminal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('ADMIN');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#16A085]/20 transition-all active:scale-[0.98]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Official Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-[18px] border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all hidden sm:flex"
            title="Toggle Fullscreen Arena"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN ROLE VIEW CONTAINER
          ===================================================================== */}
      <main className="flex-1 pb-4">
        {activeTab === 'STADIUM_VIEWER' && <SportsViewersPanel />}
        {activeTab === 'FRANCHISE_BIDDER' && <SportsBiddersPanel />}
        {activeTab === 'AUCTION_ADMIN' && <SportsAuctionAdminPanel />}
      </main>

      {/* =====================================================================
          LIVE SPORTS BROADCAST TICKER (LOWER THIRDS)
          ===================================================================== */}
      <LiveBroadcastTicker />

      {/* =====================================================================
          BOTTOM FOOTER (PURE BLACK + #D8CFB4)
          ===================================================================== */}
      <footer className="bg-black border-t border-white/10 px-6 py-3 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#D8CFB4] uppercase">ROBIQUEST 2026</span>
          <span className="text-gray-600">•</span>
          <span className="text-[#16A085] font-semibold">Conducted by RoboCell</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">Tech, Transform, Thrive</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => {
              setAuthModalTab('ADMIN');
              setIsAuthModalOpen(true);
            }}
            className="hover:text-[#16A085] transition-colors flex items-center gap-1 text-[#D8CFB4]"
          >
            <KeyRound className="w-3 h-3" />
            <span>Role Sign-In</span>
          </button>

          <button
            onClick={() => setIsSoftwareAdminModalOpen(true)}
            className="hover:text-[#16A085] transition-colors opacity-60 hover:opacity-100 flex items-center gap-1 text-gray-400"
            title="Software Maintenance (Ctrl+Shift+S)"
          >
            <Lock className="w-3 h-3" />
            <span>Master Console</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AuctionApp;
