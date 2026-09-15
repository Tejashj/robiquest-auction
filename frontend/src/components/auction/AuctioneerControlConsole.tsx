'use client';

/**
 * ============================================================================
 * AUCTIONEER & ADMIN LIVE HAMMER CONTROL CONSOLE
 * Real-Time Hammer Controls, Reserve Dropping, Time Extensions & GMV Telemetry
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Gavel,
  Pause,
  Play,
  Clock,
  DollarSign,
  TrendingUp,
  Flame,
  AlertOctagon,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  X,
} from 'lucide-react';
import { soundEffects } from '../../lib/audio-cues';

export interface AuctioneerConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  currentLotNumber: number;
  currentHighBid: number;
  currentHighBidderPaddle: number | null;
  reservePrice: number;
  onTriggerHammerAction: (action: string, payload?: any) => void;
}

export const AuctioneerControlConsole: React.FC<AuctioneerConsoleProps> = ({
  isOpen,
  onClose,
  currentLotNumber,
  currentHighBid,
  currentHighBidderPaddle,
  reservePrice,
  onTriggerHammerAction,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [reserveDropped, setReserveDropped] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live telemetry metrics
  const [metrics] = useState({
    gmvTotal: 14850000,
    lotsSold: 13,
    lotsPassed: 0,
    clearanceRate: 100,
    bidVelocityBpm: 8.4,
    activeBidders: 42,
    activeSpectators: 106,
  });

  if (!isOpen) return null;

  const handleFairWarning = () => {
    soundEffects.playClockWarningTick();
    onTriggerHammerAction('FAIR_WARNING');
    setStatusMessage('Broadcasting FAIR WARNING: "Going once, going twice..."');
  };

  const handleHammerSold = () => {
    soundEffects.playGavelStrike();
    onTriggerHammerAction('SOLD', { hammerPrice: currentHighBid, winningPaddle: currentHighBidderPaddle });
    setStatusMessage(`HAMMER STRUCK: Lot #${currentLotNumber} SOLD for $${currentHighBid.toLocaleString()} to Paddle #${currentHighBidderPaddle}`);
  };

  const handlePassLot = () => {
    onTriggerHammerAction('PASS_UNSOLD');
    setStatusMessage(`Lot #${currentLotNumber} PASSED UNSOLD below reserve.`);
  };

  const handleTogglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    onTriggerHammerAction(nextState ? 'PAUSE_AUCTION' : 'RESUME_AUCTION');
    setStatusMessage(nextState ? 'Auction PAUSED by operator.' : 'Auction RESUMED.');
  };

  const handleAddClock = (seconds: number) => {
    onTriggerHammerAction('MANUAL_TIME_ADD', { additionalSeconds: seconds });
    setStatusMessage(`Added +${seconds} seconds to the live countdown.`);
  };

  const handleDropReserve = () => {
    setReserveDropped(true);
    onTriggerHammerAction('DROP_RESERVE');
    setStatusMessage(`RESERVE DROPPED: Seller authorized sale at current market bid!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c1017] border border-white/15 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Auctioneer Master Hammer Console
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  AUTHORITY LEVEL: ADMIN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct low-latency command stream to all active participants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Notification */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
            <span>{statusMessage}</span>
            <span className="text-[10px] opacity-70">BROADCASTED VIA REDIS PUB/SUB</span>
          </div>
        )}

        {/* Active Lot Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Active Lot</span>
            <span className="text-lg font-mono font-bold text-white">Lot #{currentLotNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Current High Bid</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              ${currentHighBid.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Leader Paddle</span>
            <span className="text-lg font-mono font-bold text-cyan-300">
              Paddle #{currentHighBidderPaddle || 'None'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Seller Reserve</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold text-slate-300">
                ${reservePrice.toLocaleString()}
              </span>
              {currentHighBid >= reservePrice || reserveDropped ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  MET
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                  UNDER
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PRIMARY HAMMER CONTROLS */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Live Hammer Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Fair Warning */}
            <button
              onClick={handleFairWarning}
              className="p-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
            >
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Fair Warning</span>
              <span className="text-[10px] font-normal text-amber-300/80">"Going Twice..."</span>
            </button>

            {/* Hammer SOLD */}
            <button
              onClick={handleHammerSold}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-extrabold text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              <Gavel className="w-5 h-5 fill-black stroke-black" />
              <span>SOLD TO HIGH BIDDER</span>
              <span className="text-[10px] font-bold text-black/80">
                ${currentHighBid.toLocaleString()}
              </span>
            </button>

            {/* Pass Lot */}
            <button
              onClick={handlePassLot}
              className="p-4 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
            >
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Pass Lot Unsold</span>
              <span className="text-[10px] font-normal text-red-300/80">Mark Below Reserve</span>
            </button>
          </div>
        </div>

        {/* SECONDARY CONTROLS: TIME & RESERVES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          <button
            onClick={handleTogglePause}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isPaused
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume Bidding' : 'Pause Auction'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleAddClock(30)}
              className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1"
            >
              +30s Clock
            </button>
            <button
              onClick={() => handleAddClock(60)}
              className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1"
            >
              +60s Clock
            </button>
          </div>

          <button
            onClick={handleDropReserve}
            disabled={reserveDropped || currentHighBid >= reservePrice}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              reserveDropped
                ? 'bg-purple-900/40 border-purple-500/40 text-purple-300 cursor-not-allowed'
                : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/40 text-purple-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-purple-400" />
            {reserveDropped ? 'Reserve Dropped Live' : 'Drop Reserve to Current Bid'}
          </button>
        </div>

        {/* REAL-TIME GMV & VELOCITY TELEMETRY METRICS */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Auction Event Performance Telemetry
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Gross Merchandise Value</span>
              <span className="text-base font-mono font-bold text-white">
                ${(metrics.gmvTotal / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Bid Velocity</span>
              <span className="text-base font-mono font-bold text-emerald-400">
                {metrics.bidVelocityBpm} bids/min
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Reserve Clearance Rate</span>
              <span className="text-base font-mono font-bold text-cyan-400">
                {metrics.clearanceRate}% (13/13)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Verified Bidders</span>
              <span className="text-base font-mono font-bold text-amber-400">
                {metrics.activeBidders} Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
