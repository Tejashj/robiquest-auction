'use client';

/**
 * ============================================================================
 * LIVE STAGE MINI HUD & QUICK-BID DOCK
 * Persistent telemetry banner shown when viewing secondary tabs (Sold/Unsold/Squads)
 * Allows viewers to jump back to live stage, and bidders to place bids instantly.
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React from 'react';
import {
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
} from '../../store/auction-engine-store';

interface LiveStageMiniHudProps {
  onReturnToStage: () => void;
  isBidderMode?: boolean;
  authenticatedTeam?: AuctionTeamParticipant;
}

export const LiveStageMiniHud: React.FC<LiveStageMiniHudProps> = ({
  onReturnToStage,
  isBidderMode = false,
  authenticatedTeam,
}) => {
  const { lots, activeLotId, profile, clock, placeUserBid } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  if (!activeLot) return null;

  const isLive = activeLot.status === 'LIVE' || activeLot.status === 'FAIR_WARNING';
  if (!isLive) return null;

  const isLeading =
    authenticatedTeam && activeLot.currentLeaderId === authenticatedTeam.id;

  const nextBid =
    activeLot.bidsCount === 0
      ? activeLot.startingBid
      : activeLot.currentHighBid + activeLot.minIncrement;

  // Reserve floor calculation
  const unfilledSlots = authenticatedTeam
    ? Math.max(0, profile.minSquadSize - authenticatedTeam.squadCount - 1)
    : 0;
  const reserveFloorNeeded = unfilledSlots * profile.lowestBasePrice;
  const maxSafeBid = authenticatedTeam
    ? profile.enforceReservePurseFloor
      ? Math.max(0, authenticatedTeam.remainingPurse - reserveFloorNeeded)
      : authenticatedTeam.remainingPurse
    : 0;

  const canAfford = authenticatedTeam ? nextBid <= maxSafeBid : false;

  const handleQuickBid = (amount: number) => {
    if (!authenticatedTeam) return;
    placeUserBid(amount, authenticatedTeam.id);
  };

  return (
    <aside
      aria-label="Live stage telemetry"
      className="sticky top-16 z-30 w-full mb-6 p-3.5 sm:p-4 rounded-[18px] bg-black/95 backdrop-blur-md border border-[#16A085]/40 shadow-[0_10px_30px_rgba(22,160,133,0.2)] animate-in slide-in-from-top-3 font-poppins"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Live Stage Telemetry */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[14px] bg-[#16A085]/20 border border-[#16A085]/40 flex items-center justify-center text-[#16A085] flex-shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[18px] text-[9px] font-mono font-bold bg-[#16A085] text-black">
                LOT #{activeLot.lotNumber} LIVE
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {activeLot.category}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase truncate font-poppins mt-0.5">
              {activeLot.title}
            </h4>
          </div>
        </div>

        {/* Center: Current Bid & Timer */}
        <div className="flex items-center gap-4 bg-white/[0.03] px-3.5 py-1.5 rounded-[18px] border border-white/[0.08] self-start md:self-center">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase block">High Bid</span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#D8CFB4]">
              {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
            </span>
          </div>

          <div className="h-6 w-px bg-white/[0.08]" />

          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Leader</span>
            <span className="text-xs font-mono font-bold text-[#16A085] truncate max-w-[120px] block">
              {activeLot.currentLeaderName || 'Floor Open'}
            </span>
          </div>

          {clock.status === 'RUNNING' && (
            <>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-[#16A085]" />
                <span>{clock.remainingSeconds}s</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* If Bidder Mode: Instant Bid Button! */}
          {isBidderMode && authenticatedTeam && (
            <button
              onClick={() => handleQuickBid(nextBid)}
              disabled={isLeading || !canAfford}
              className={`px-4 py-2 rounded-[18px] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isLeading
                  ? 'bg-[#16A085]/20 border border-[#16A085] text-[#16A085] cursor-default'
                  : !canAfford
                  ? 'bg-white/[0.03] border border-white/[0.08] text-slate-500 cursor-not-allowed'
                  : 'bg-[#16A085] hover:bg-[#1abc9c] text-black shadow-md'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {isLeading
                  ? 'Holding Floor'
                  : `Bid ${formatAuctionCurrency(nextBid, profile.currency)}`}
              </span>
            </button>
          )}

          {/* Jump to Live Stage */}
          <button
            onClick={onReturnToStage}
            className="px-3.5 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Live Stage</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#16A085]" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default LiveStageMiniHud;
