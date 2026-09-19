'use client';

/**
 * ============================================================================
 * BROADCAST-GRADE LIVE AUCTION VIEWING ROOM (4K PROJECTOR FEED)
 * Driven by User Store: Custom Lots, Custom Teams & Real-Time Gavel Sync
 * ============================================================================
 */

import React from 'react';
import {
  Tv,
  Volume2,
  VolumeX,
  Users,
  Radio,
  Gavel,
  Maximize2,
  ArrowLeft,
} from 'lucide-react';
import { useAuctionEngineStore } from '../../store/auction-engine-store';
import { HeroStage } from './HeroStage';
import { TeamPurseLeaderboard } from './TeamPurseLeaderboard';
import { UpcomingQueueCarousel } from './UpcomingQueueCarousel';
import { SoldCelebrationOverlay } from './SoldCelebrationOverlay';
import { UnsoldPassOverlay } from './UnsoldPassOverlay';

export interface BroadcastViewingRoomProps {
  onExitSpectatorMode?: () => void;
}

export const BroadcastViewingRoom: React.FC<BroadcastViewingRoomProps> = ({
  onExitSpectatorMode,
}) => {
  const {
    profile,
    teams,
    isMuted,
    toggleMute,
    triggerGavelAction,
    lots,
    activeLotId,
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
    <div className="min-h-screen w-full bg-[#000000] text-white font-poppins antialiased overflow-x-hidden selection:bg-[#16A085]/30 selection:text-white flex flex-col justify-between">
      {/* TOP BROADCAST HEADER (ON-AIR HUD) */}
      <header className="sticky top-0 z-40 bg-[#000000]/90 border-b border-white/[0.08] backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[18px] bg-[#16A085] flex items-center justify-center shadow-lg shadow-[#16A085]/25">
              <Tv className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#16A085] font-bold">
                  OFFICIAL BROADCAST FEED
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A085] animate-ping mr-1.5" />
                  ON AIR (4K UHD)
                </span>
              </div>
              <h1 className="text-sm font-black text-white tracking-tight uppercase truncate max-w-xl font-poppins">
                {profile.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          {/* Quick Gavel SOLD Trigger */}
          {activeLot && (
            <button
              onClick={() => triggerGavelAction('SOLD')}
              className="px-3.5 py-1.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black shadow-lg shadow-[#16A085]/25 flex items-center gap-1.5 transition-all"
            >
              <Gavel className="w-3.5 h-3.5 fill-black" />
              Hammer SOLD
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-[#16A085]" />
            <span className="text-gray-400">Teams:</span>
            <span className="font-bold text-[#D8CFB4]">{teams.length}</span>
          </div>

          <button
            onClick={toggleMute}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#16A085]" />}
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 transition-colors hidden sm:block"
            title="Toggle Projector Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {onExitSpectatorMode && (
            <button
              onClick={onExitSpectatorMode}
              className="px-3.5 py-1.5 rounded-[18px] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Projector View
            </button>
          )}
        </div>
      </header>

      {/* MAIN SPECTATOR VIEWPORT */}
      <main className="flex-1 max-w-[1880px] w-full mx-auto p-4 xl:p-6 space-y-6">
        <HeroStage />
        <TeamPurseLeaderboard />
        <UpcomingQueueCarousel />
      </main>

      {/* Full-Screen SOLD & UNSOLD Celebration Modals */}
      <SoldCelebrationOverlay />
      <UnsoldPassOverlay />

      {/* Broadcast Footer */}
      <footer className="border-t border-white/[0.08] bg-[#000000] px-6 py-2.5 text-[11px] font-mono text-gray-400 flex items-center justify-between font-poppins">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A085] animate-pulse" />
          <span>BROADCAST SYNC LATENCY: &lt;10ms</span>
        </div>
        <div className="text-gray-400">
          {profile.description || 'ENTERPRISE REAL-TIME AUCTION ARCHITECTURE • OBS & 4K PROJECTOR COMPLIANT'}
        </div>
      </footer>
    </div>
  );
};

export default BroadcastViewingRoom;
