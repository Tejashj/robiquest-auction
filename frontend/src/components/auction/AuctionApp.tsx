'use client';

/**
 * ============================================================================
 * UNIFIED ENTERPRISE SPORTS AUCTION PLATFORM SHELL
 * RobiQuest 2026 Live Auction Arena • Conducted by RoboCell
 * Modern Cyber Stadium HUD with Glassmorphism & 100% Dynamic Engine
 * Strict Role Separation: Viewers never see admin controls or auctioneer desk
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
  Settings,
  Bot,
  Activity,
  Radio,
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
import { DynamicTeamManagerModal } from '../admin/DynamicTeamManagerModal';
import { TournamentSettingsModal } from '../admin/TournamentSettingsModal';

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
    isSimulatingBids,
    toggleBidSimulation,
    placeUserBid,
    extendClock,
    logoutRole,
    toggleMute,
    loadPresetTemplate,
    isAutoAuctioneer,
    toggleAutoAuctioneer,
    isVoiceEnabled,
    toggleVoice,
  } = useAuctionEngineStore();

  // Public view defaults to STADIUM_VIEWER for general spectators
  const [activeTab, setActiveTab] = useState<PublicPanelTab>('STADIUM_VIEWER');
  const [isSoftwareAdminModalOpen, setIsSoftwareAdminModalOpen] = useState(false);

  // Role Auth Gate Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'ADMIN' | 'BIDDER' | 'VIEWER'>('ADMIN');

  // Dynamic Studio Modals (Admin Only)
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync activeTab when userRole changes
  useEffect(() => {
    if (userRole === 'ADMIN') {
      setActiveTab('AUCTION_ADMIN');
    } else if (userRole === 'BIDDER') {
      setActiveTab('FRANCHISE_BIDDER');
    } else {
      setActiveTab('STADIUM_VIEWER');
    }
  }, [userRole]);

  // Global stealth keydown listeners:
  // - Ctrl + Shift + S: Software Admin Modal
  // - Ctrl + Shift + A: Admin Gate Auth Prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'S' || e.key === 's') {
          e.preventDefault();
          setIsSoftwareAdminModalOpen((prev) => !prev);
        } else if (e.key === 'A' || e.key === 'a') {
          e.preventDefault();
          setAuthModalTab('ADMIN');
          setIsAuthModalOpen(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'sys-admin') {
        setIsSoftwareAdminModalOpen(true);
      } else if (params.get('mode') === 'admin' || params.get('role') === 'admin') {
        setAuthModalTab('ADMIN');
        setIsAuthModalOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --------------------------------------------------------------------------
  // LIVE ARENA BIDDING SIMULATION LOOP
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isSimulatingBids) return;

    const interval = setInterval(() => {
      const state = useAuctionEngineStore.getState();
      const lot = state.lots.find((l) => l.id === state.activeLotId) || state.lots[0];
      if (!lot || (lot.status !== 'LIVE' && lot.status !== 'FAIR_WARNING')) return;
      if (state.teams.length === 0) return;

      const eligibleTeams = state.teams.filter(
        (t) => t.id !== lot.currentLeaderId && !t.isFrozen
      );
      if (eligibleTeams.length === 0) return;

      const randomTeam = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
      const nextBid =
        lot.bidsCount === 0 ? lot.startingBid : lot.currentHighBid + lot.minIncrement;

      if (randomTeam.remainingPurse >= nextBid) {
        placeUserBid(nextBid, randomTeam.id);
        if (state.clock.status === 'RUNNING' && state.clock.remainingSeconds < 15) {
          extendClock(15);
        }
      }
    }, 4200);

    return () => clearInterval(interval);
  }, [isSimulatingBids, placeUserBid, extendClock]);

  // --------------------------------------------------------------------------
  // AUTONOMOUS SOFTWARE AUCTIONEER MASTER HEARTBEAT
  // --------------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useAuctionEngineStore.getState();
      if (!state.isAutoAuctioneer) return;

      const activeLot = state.lots.find((l) => l.id === state.activeLotId);
      if (!activeLot) return;

      if (activeLot.status === 'LIVE' || activeLot.status === 'FAIR_WARNING') {
        if (state.clock.status === 'IDLE') {
          state.startClock();
        } else if (state.clock.status === 'RUNNING') {
          state.tickClock();
        }
      }

      if (activeLot.status === 'SOLD' || activeLot.status === 'PASSED') {
        if (state.autoAdvanceCountdown === null) {
          state.setAutoAdvanceCountdown(activeLot.status === 'SOLD' ? 7 : 5);
        } else if (state.autoAdvanceCountdown > 1) {
          state.setAutoAdvanceCountdown(state.autoAdvanceCountdown - 1);
        } else {
          state.setAutoAdvanceCountdown(null);
          state.advanceToNextLot();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
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
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#000000] text-white font-poppins flex flex-col selection:bg-[#16A085]/30 selection:text-white">
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

      {/* Dynamic Contender CMS Studio Modal (Admin Only) */}
      {isAdmin && (
        <ContenderManagerModal
          isOpen={isCmsModalOpen}
          onClose={() => setIsCmsModalOpen(false)}
        />
      )}

      {/* Dynamic Team Studio Modal (Admin Only) */}
      {isAdmin && (
        <DynamicTeamManagerModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
        />
      )}

      {/* Tournament Settings Modal (Admin Only) */}
      {isAdmin && (
        <TournamentSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Hidden Software Maintenance Modal */}
      <HiddenSoftwareAdminModal
        isOpen={isSoftwareAdminModalOpen}
        onClose={() => setIsSoftwareAdminModalOpen(false)}
      />

      {/* =====================================================================
          APP BAR / TOP NAVIGATION
          ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#000000] border-b border-white/[0.08] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Telemetry */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[18px] bg-[#000000] border border-[#16A085]/40 p-1 flex items-center justify-center flex-shrink-0">
              <img
                src="/robocell-crest.png"
                alt="RoboCell Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white uppercase font-poppins">
                  {profile.title.split(' ')[0] || 'ROBIQUEST'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A085] animate-ping" />
                  LIVE ARENA
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[260px] sm:max-w-xs flex items-center gap-1.5">
                <span className="text-[#16A085] font-bold">RoboCell</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 truncate">{profile.description}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Badge: Informational for Viewers, Interactive for Admin */}
          <div className="hidden xl:flex items-center gap-2.5 pl-4 border-l border-white/[0.08] text-xs font-mono">
            <span className="px-3 py-1 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-[#D8CFB4] font-bold">
              {profile.currency}
            </span>

            {isAdmin ? (
              <>
                <button
                  onClick={() => setIsCmsModalOpen(true)}
                  className="px-2.5 py-1 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
                >
                  {lots.length} Contenders
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-2.5 py-1 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#16A085] font-bold transition-all"
                >
                  {teams.length} Franchises
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={toggleAutoAuctioneer}
                  className={`px-3 py-1 rounded-[18px] border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isAutoAuctioneer
                      ? 'bg-[#16A085]/15 border-[#16A085]/50 text-[#16A085]'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                  title="Autonomous Software Auctioneer: Automatically runs timer and gavel"
                >
                  <span className={`w-2 h-2 rounded-full ${isAutoAuctioneer ? 'bg-[#16A085] animate-ping' : 'bg-slate-500'}`} />
                  <span>{isAutoAuctioneer ? 'AUTO GAVEL: ON' : 'AUTO GAVEL: PAUSED'}</span>
                </button>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-slate-300">
                  {lots.length} Contenders
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-2.5 py-1 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-[#16A085] font-bold">
                  {teams.length} Franchises
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center Navigation: Strictly role-isolated */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-[18px]">
          {/* 1. Stadium Projector View */}
          <button
            onClick={() => handleTabClick('STADIUM_VIEWER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'STADIUM_VIEWER'
                ? 'bg-[#16A085] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Stadium Screen</span>
            <span className="px-1.5 py-0.2 rounded-[18px] bg-black/30 text-[9px] font-mono font-bold">
              4K
            </span>
          </button>

          {/* 2. Franchise Bidder Panel */}
          <button
            onClick={() => handleTabClick('FRANCHISE_BIDDER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'FRANCHISE_BIDDER'
                ? 'bg-[#16A085] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Franchise Cockpit</span>
            {userRole !== 'BIDDER' && <Lock className="w-3 h-3 text-slate-500" />}
          </button>

          {/* 3. Auction Admin Desk: ONLY rendered when user is authenticated as ADMIN! */}
          {isAdmin && (
            <button
              onClick={() => handleTabClick('AUCTION_ADMIN')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
                activeTab === 'AUCTION_ADMIN'
                  ? 'bg-[#16A085] text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Auctioneer Desk</span>
            </button>
          )}
        </nav>

        {/* Right: Quick Studios & Controls (Admin Studios hidden from viewers) */}
        <div className="flex items-center gap-2">
          {/* Admin-Only Studio Buttons */}
          {isAdmin && (
            <>
              <button
                onClick={() => setIsCmsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white transition-all"
                title="Open Contender Studio"
              >
                <FolderEdit className="w-3.5 h-3.5 text-[#16A085]" />
                <span>Contenders</span>
              </button>

              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white transition-all"
                title="Open Franchise Team Studio"
              >
                <Users className="w-3.5 h-3.5 text-[#16A085]" />
                <span>Teams</span>
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
                title="Tournament Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={toggleBidSimulation}
                className={`p-2 rounded-[18px] border transition-all ${
                  isSimulatingBids
                    ? 'bg-[#16A085]/20 border-[#16A085] text-[#16A085]'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title={isSimulatingBids ? 'Pause AI Arena Simulation' : 'Run AI Arena Simulation'}
              >
                <Bot className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Active Role Indicator / Franchise Sign-In */}
          {userRole === 'ADMIN' ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40 text-xs font-bold font-mono">
                <Gavel className="w-3.5 h-3.5" />
                <span>AUCTIONEER</span>
              </span>
              <button
                onClick={logoutRole}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                title="Log Out & Lock Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : userRole === 'BIDDER' && authenticatedTeam ? (
            <div className="flex items-center gap-1.5">
              <span
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] text-xs font-bold border font-mono"
                style={{
                  backgroundColor: `${authenticatedTeam.color || '#16A085'}20`,
                  borderColor: authenticatedTeam.color || '#16A085',
                  color: '#ffffff',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: authenticatedTeam.color || '#16A085' }}
                />
                <span>
                  {authenticatedTeam.shortCode} #{authenticatedTeam.paddleNumber}
                </span>
              </span>
              <button
                onClick={logoutRole}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                title="Release Franchise Terminal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('BIDDER');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-[#16A085] hover:text-white transition-all flex items-center gap-1.5 font-poppins"
            >
              <Users className="w-3.5 h-3.5 text-[#16A085]" />
              <span>Franchise Login</span>
            </button>
          )}

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
            title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Voice Commentary Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-[18px] border transition-all ${
              isVoiceEnabled && !isMuted
                ? 'bg-[#16A085]/20 border-[#16A085] text-[#16A085]'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-white'
            }`}
            title={
              isVoiceEnabled && !isMuted
                ? 'Auctioneer Voice Commentary: ACTIVE'
                : 'Auctioneer Voice Commentary: MUTED'
            }
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all hidden sm:flex"
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
        {activeTab === 'AUCTION_ADMIN' && isAdmin && <SportsAuctionAdminPanel />}
      </main>

      {/* =====================================================================
          LIVE SPORTS BROADCAST TICKER (LOWER THIRDS)
          ===================================================================== */}
      <LiveBroadcastTicker />

      {/* =====================================================================
          BOTTOM FOOTER: Clean & Discrete
          ===================================================================== */}
      <footer className="bg-[#000000] border-t border-white/[0.08] px-6 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wide font-poppins">
            {profile.title}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[#16A085] font-medium">{profile.description}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Franchise sign-in link */}
          <button
            onClick={() => {
              setAuthModalTab('BIDDER');
              setIsAuthModalOpen(true);
            }}
            className="hover:text-[#16A085] transition-colors flex items-center gap-1.5 text-slate-400 font-medium"
          >
            <Users className="w-3.5 h-3.5 text-[#16A085]" />
            <span>Team Paddle Sign-In</span>
          </button>

          {/* Subtle Staff Link with stealth shortcut hint */}
          <button
            onClick={() => {
              setAuthModalTab('ADMIN');
              setIsAuthModalOpen(true);
            }}
            className="hover:text-slate-300 transition-colors opacity-40 hover:opacity-100 flex items-center gap-1 text-[11px] font-mono text-slate-500"
            title="Staff Access (Ctrl + Shift + A)"
          >
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Staff Portal</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AuctionApp;
