'use client';

/**
 * ============================================================================
 * SPORTS VIEWERS PANEL (STADIUM SCREEN / 4K PROJECTOR FEED)
 * Designed for Spectators, Fans, Broadcast Streams, and Stadium Projectors
 * 100% Read-Only: Zero Bidding Buttons, Zero Admin Controls, Pure Broadcast HUD
 * Live Central Stage, SVG Countdown Ring, Franchise Purse Leaderboard & Queue
 * ============================================================================
 */

import React from 'react';
import {
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  Radio,
  Gavel,
  Globe,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuctionEngineStore, formatAuctionCurrency } from '../../store/auction-engine-store';
import { HeroStage } from '../spectator/HeroStage';
import { TeamPurseLeaderboard } from '../spectator/TeamPurseLeaderboard';
import { UpcomingQueueCarousel } from '../spectator/UpcomingQueueCarousel';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';

export const SportsViewersPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    isMuted,
    toggleMute,
  } = useAuctionEngineStore();

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  return (
    <div className="min-h-screen w-full bg-[#03060f] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-between">
      {/* Celebration Modal Overlay */}
      <SoldCelebrationOverlay />

      {/* =====================================================================
          TOP BROADCAST ON-AIR HUD
          ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#060a17]/90 border-b border-white/10 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black border-2 border-cyan-400/40 p-0.5 shadow-lg shadow-cyan-500/25 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src="/robocell-crest.png"
                alt="RoboCell Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  ROBIQUEST • OFFICIAL 4K FEED
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  <Radio className="w-2.5 h-2.5" />
                  ON AIR (4K UHD)
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>{profile.title}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono lowercase">
                  conducted by robocell
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Broadcast Meta & Display Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          {activeLot && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">STATUS:</span>
              <span className={`font-bold ${
                activeLot.status === 'SOLD' ? 'text-emerald-400' :
                activeLot.status === 'PASSED' ? 'text-red-400' :
                'text-amber-300 animate-pulse'
              }`}>
                {activeLot.status === 'SOLD' ? `SOLD TO ${activeLot.currentLeaderName?.toUpperCase()}` : activeLot.status}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-cyan-300">{teams.length} Teams</span>
          </div>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute Stadium Audio Cues' : 'Mute Stadium Audio Cues'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Toggle Stadium 4K Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN ARENA: HERO STAGE + LEADERBOARD
          ===================================================================== */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Central Hero Stage (8 cols on large displays) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <HeroStage />
        </div>

        {/* Side Franchise Leaderboard (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <TeamPurseLeaderboard />
        </div>
      </main>

      {/* =====================================================================
          BOTTOM DOCK: UPCOMING PLAYER QUEUE CAROUSEL
          ===================================================================== */}
      <footer className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 pt-0">
        <UpcomingQueueCarousel />
      </footer>
    </div>
  );
};

export default SportsViewersPanel;
