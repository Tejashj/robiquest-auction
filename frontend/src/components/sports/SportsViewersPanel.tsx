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
    <div className="w-full text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-between">
      {/* Celebration Modal Overlay */}
      <SoldCelebrationOverlay />

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
