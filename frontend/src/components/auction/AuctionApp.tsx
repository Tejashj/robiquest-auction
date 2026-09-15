'use client';

/**
 * ============================================================================
 * UNIFIED ENTERPRISE SPORTS AUCTION PLATFORM SHELL
 * Dedicated 3-Way Public Role Separation:
 *  1. 🔨 Auction Admin (Live Auctioneer Desk)
 *  2. 🙋 Franchise Bidder (Team Owner Bidding Room)
 *  3. 📺 Stadium Projector (4K Broadcast Viewers Panel)
 *
 * SOFTWARE ADMIN IS STRICTLY HIDDEN & UNLISTED:
 *  - Removed from standard navigation bar / menus.
 *  - Accessible only via 'Ctrl + Shift + S' or discreet footer trigger.
 *  - Protected by Master Passkey challenge.
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
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

import { SportsAuctionAdminPanel } from '../sports/SportsAuctionAdminPanel';
import { SportsBiddersPanel } from '../sports/SportsBiddersPanel';
import { SportsViewersPanel } from '../sports/SportsViewersPanel';
import { HiddenSoftwareAdminModal } from '../sports/HiddenSoftwareAdminModal';

type PublicPanelTab = 'AUCTION_ADMIN' | 'FRANCHISE_BIDDER' | 'STADIUM_VIEWER';

export const AuctionApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PublicPanelTab>('AUCTION_ADMIN');
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isSoftwareAdminModalOpen, setIsSoftwareAdminModalOpen] = useState(false);

  const {
    profile,
    lots,
    teams,
    activeLotId,
    isMuted,
    toggleMute,
    loadPresetTemplate,
  } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // Global stealth keydown listener: Ctrl + Shift + S / Cmd + Shift + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsSoftwareAdminModalOpen((prev) => !prev);
      }
    };

    // Check URL query param ?mode=sys-admin
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

  return (
    <div className="min-h-screen bg-[#03060f] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* =====================================================================
          TOP NAVIGATION BAR (PUBLIC / ROLE-BASED HUD)
          Contains ONLY Auction Admin, Franchise Bidder, and Stadium Projector
          (Software Admin is strictly omitted from this bar)
          ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#060a17]/95 border-b border-white/10 backdrop-blur-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Left: Brand Identity & Tournament Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black border-2 border-cyan-400/40 p-0.5 shadow-lg shadow-cyan-500/20 overflow-hidden flex items-center justify-center group relative">
              <img
                src="/robocell-logo.png"
                alt="RoboCell Crest"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-mono uppercase">
                  ROBIQUEST
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[260px] sm:max-w-xs font-semibold flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">RoboCell</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-normal">Tech, Transform, Thrive</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
              {profile.currency}
            </span>
            <span className="text-slate-400">
              {lots.length} {lots.length === 1 ? 'Lot' : 'Lots'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">
              {teams.length} Teams
            </span>
          </div>
        </div>

        {/* Center: 3 Dedicated Role-Specific Panels (ONLY) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md">
          {/* 1. Auction Admin (Live Auctioneer Desk) */}
          <button
            onClick={() => setActiveTab('AUCTION_ADMIN')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUCTION_ADMIN'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            Auction Admin
          </button>

          {/* 2. Franchise Bidder Panel (Team Bidding Room) */}
          <button
            onClick={() => setActiveTab('FRANCHISE_BIDDER')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FRANCHISE_BIDDER'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Franchise Bidder
          </button>

          {/* 3. Stadium Viewers Panel (Projector 4K Feed) */}
          <button
            onClick={() => setActiveTab('STADIUM_VIEWER')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'STADIUM_VIEWER'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Stadium Projector
            <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-[9px] text-cyan-300 border border-cyan-400/30 font-mono">
              4K
            </span>
          </button>
        </nav>

        {/* Right: Template Blueprints & Controls */}
        <div className="flex items-center gap-2">
          {/* Blueprints Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
              title="Switch Blueprints"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Blueprints</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#080d1a] border border-white/20 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Blueprint
                </div>

                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => handleSelectTemplate('ROBIQUEST')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        RobiQuest 2026 (RoboCell)
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        4 Robotics Teams, High-Tech Hardware Lots, Tech-Transform-Thrive
                      </p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                      INR ₹
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectTemplate('SPORTS_IPL')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        IPL Mega Auction 2026
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ₹120 Cr Cap, Reserve Floor Rules, Squad Quotas
                      </p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                      INR ₹
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelectTemplate('EMPTY')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        Blank Slate (Zero Data)
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Clean catalog & franchises ready for custom setup
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTemplate('FINE_ART_LUXURY')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        Fine Art & Modern Masters
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        High-value galleries, private collector paddles
                      </p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                      USD $
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound FX Audio Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute Live Audio Cues' : 'Mute Live Audio Cues'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MOBILE SUB-HEADER TAB NAVIGATION
          ===================================================================== */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#060a17] border-b border-white/10 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('AUCTION_ADMIN')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'AUCTION_ADMIN' ? 'bg-amber-500 text-black' : 'text-slate-400 bg-white/5'
          }`}
        >
          Auction Admin
        </button>
        <button
          onClick={() => setActiveTab('FRANCHISE_BIDDER')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'FRANCHISE_BIDDER' ? 'bg-emerald-500 text-black' : 'text-slate-400 bg-white/5'
          }`}
        >
          Franchise Bidder
        </button>
        <button
          onClick={() => setActiveTab('STADIUM_VIEWER')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'STADIUM_VIEWER' ? 'bg-cyan-500 text-black' : 'text-slate-400 bg-white/5'
          }`}
        >
          Stadium Projector (4K)
        </button>
      </div>

      {/* =====================================================================
          MAIN OPERATIONAL VIEWPORT (ROLE-SPECIFIC)
          ===================================================================== */}
      <main className="flex-1 relative">
        {activeTab === 'AUCTION_ADMIN' && <SportsAuctionAdminPanel />}
        {activeTab === 'FRANCHISE_BIDDER' && <SportsBiddersPanel />}
        {activeTab === 'STADIUM_VIEWER' && <SportsViewersPanel />}
      </main>

      {/* =====================================================================
          FOOTER WITH DISCREET COVERT SOFTWARE ADMIN TRIGGER
          ===================================================================== */}
      <footer className="px-6 py-2 bg-[#02040a] border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">RobiQuest 2026</span>
          <span>•</span>
          <span>Conducted by RoboCell</span>
          <span>•</span>
          <span>4 Competing Robotics Squads</span>
        </div>

        {/* Discreet Hidden Trigger: Subtle text with lock icon */}
        <button
          onClick={() => setIsSoftwareAdminModalOpen(true)}
          className="group flex items-center gap-1.5 text-slate-600 hover:text-purple-400 transition-colors font-mono cursor-pointer"
          title="Press Ctrl+Shift+S or click for Master System Gate"
        >
          <Lock className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
          <span>v2.4.0 • Enterprise Engine</span>
        </button>
      </footer>

      {/* =====================================================================
          COVERT SOFTWARE ADMIN MODAL (HIDDEN BEHIND MASTER PASSKEY)
          ===================================================================== */}
      <HiddenSoftwareAdminModal
        isOpen={isSoftwareAdminModalOpen}
        onClose={() => setIsSoftwareAdminModalOpen(false)}
      />
    </div>
  );
};

export default AuctionApp;
