'use client';

/**
 * ============================================================================
 * SPORTS VIEWERS PANEL (STADIUM SCREEN & SPECTATOR ARENA)
 * Designed for Spectators, Fans, Broadcast Streams, and Stadium Displays
 * 100% Read-Only: Zero Admin Controls, Pure Broadcast Cyber Stadium HUD
 * Sub-Views:
 *  - 🔴 Live Arena (Hero Stage, Franchise Leaderboard, Upcoming Carousel)
 *  - 🏆 Sold Contenders (Hammer sales, buyer franchise, price appreciation)
 *  - ⚠️ Unsold Lots (Passed contenders & re-auction eligibility)
 *  - 🛡️ Franchise Squads (Picked players by each team, purse health, rosters)
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Radio,
  Tv,
  Trophy,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuctionEngineStore } from '../../store/auction-engine-store';
import { HeroStage } from '../spectator/HeroStage';
import { TeamPurseLeaderboard } from '../spectator/TeamPurseLeaderboard';
import { UpcomingQueueCarousel } from '../spectator/UpcomingQueueCarousel';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';
import { UnsoldPassOverlay } from '../spectator/UnsoldPassOverlay';
import { SoldContendersView } from '../spectator/SoldContendersView';
import { UnsoldContendersView } from '../spectator/UnsoldContendersView';
import { FranchiseSquadsView } from '../spectator/FranchiseSquadsView';
import { LiveStageMiniHud } from '../spectator/LiveStageMiniHud';

export type ViewerSubView = 'LIVE_ARENA' | 'SOLD_PLAYERS' | 'UNSOLD_PLAYERS' | 'FRANCHISE_SQUADS';

export const SportsViewersPanel: React.FC = () => {
  const { lots, teams } = useAuctionEngineStore();
  const [activeSubView, setActiveSubView] = useState<ViewerSubView>('LIVE_ARENA');

  const soldCount = lots.filter((l) => l.status === 'SOLD').length;
  const unsoldCount = lots.filter((l) => l.status === 'PASSED').length;

  return (
    <div className="w-full text-white font-poppins antialiased overflow-x-hidden selection:bg-[#16A085]/30 flex flex-col justify-between min-h-[calc(100vh-80px)]">
      {/* Celebration & Unsold Modal Overlays */}
      <SoldCelebrationOverlay />
      <UnsoldPassOverlay />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 pt-4">
        {/* =====================================================================
            VIEWER SUB-NAVIGATION BAR
            ===================================================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-[18px]">
            {/* 1. Live Arena Stage */}
            <button
              onClick={() => setActiveSubView('LIVE_ARENA')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
                activeSubView === 'LIVE_ARENA'
                  ? 'bg-[#16A085] text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Live Stage</span>
            </button>

            {/* 2. Sold Contenders */}
            <button
              onClick={() => setActiveSubView('SOLD_PLAYERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
                activeSubView === 'SOLD_PLAYERS'
                  ? 'bg-[#16A085] text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sold Contenders</span>
              <span
                className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
                  activeSubView === 'SOLD_PLAYERS'
                    ? 'bg-black/40 text-white'
                    : 'bg-white/[0.08] text-[#16A085]'
                }`}
              >
                {soldCount}
              </span>
            </button>

            {/* 3. Unsold Lots */}
            <button
              onClick={() => setActiveSubView('UNSOLD_PLAYERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
                activeSubView === 'UNSOLD_PLAYERS'
                  ? 'bg-[#16A085] text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unsold Lots</span>
              <span
                className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
                  activeSubView === 'UNSOLD_PLAYERS'
                    ? 'bg-black/40 text-white'
                    : 'bg-white/[0.08] text-amber-400'
                }`}
              >
                {unsoldCount}
              </span>
            </button>

            {/* 4. Franchise Squads & Picked Players */}
            <button
              onClick={() => setActiveSubView('FRANCHISE_SQUADS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold transition-all ${
                activeSubView === 'FRANCHISE_SQUADS'
                  ? 'bg-[#16A085] text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Franchise Squads</span>
              <span
                className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
                  activeSubView === 'FRANCHISE_SQUADS'
                    ? 'bg-black/40 text-white'
                    : 'bg-white/[0.08] text-[#16A085]'
                }`}
              >
                {teams.length}
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#16A085] animate-ping" />
            <span>STADIUM BROADCAST HUD</span>
          </div>
        </div>

        {/* Live Stage Mini HUD (Shown when navigating secondary tabs) */}
        {activeSubView !== 'LIVE_ARENA' && (
          <LiveStageMiniHud onReturnToStage={() => setActiveSubView('LIVE_ARENA')} />
        )}

        {/* =====================================================================
            ACTIVE SUB-VIEW DISPLAY
            ===================================================================== */}
        {activeSubView === 'LIVE_ARENA' && (
          <div className="space-y-6">
            <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Central Hero Stage (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <HeroStage />
              </div>

              {/* Side Franchise Leaderboard (4 cols) */}
              <div className="lg:col-span-4 h-full">
                <TeamPurseLeaderboard />
              </div>
            </main>

            {/* Bottom Dock: Upcoming Carousel */}
            <footer className="w-full pt-0">
              <UpcomingQueueCarousel />
            </footer>
          </div>
        )}

        {activeSubView === 'SOLD_PLAYERS' && <SoldContendersView />}

        {activeSubView === 'UNSOLD_PLAYERS' && <UnsoldContendersView />}

        {activeSubView === 'FRANCHISE_SQUADS' && <FranchiseSquadsView />}
      </div>
    </div>
  );
};

export default SportsViewersPanel;
