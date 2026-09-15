'use client';

/**
 * ============================================================================
 * UNIFIED LIVE AUCTION STAGE (USER-DRIVEN BIDDING & GAVEL CONTROLS)
 * 100% User-Controlled: No Fake Background Bots, No Static Dummy Data
 * Multi-Currency Support ($, ₹, €, £), Real Solvency Checks, Gavel Execution
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Clock,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Trophy,
  Undo2,
  Package,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';

export const LiveAuctionStage: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    bids,
    clock,
    activeBidderTeamId,
    setActiveBidderTeam,
    placeUserBid,
    revokeLastBid,
    startClock,
    pauseClock,
    extendClock,
    resetClock,
    tickClock,
    triggerGavelAction,
  } = useAuctionEngineStore();

  const [customBidInput, setCustomBidInput] = useState('');
  const [lastActionToast, setLastActionToast] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
  } | null>(null);

  // Clock interval when clock status is RUNNING
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (clock.status === 'RUNNING') {
      interval = setInterval(() => {
        tickClock();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clock.status, tickClock]);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];
  const activeBidderTeam = teams.find((t) => t.id === activeBidderTeamId) || teams[0];

  if (!activeLot) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4 rounded-3xl bg-[#090d19] border border-white/10 my-8 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Package className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white">No Lots Available on Live Stage</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please add lots in the <strong>Lot Catalog</strong> or load a starter template from <strong>Auction Setup</strong> to begin live bidding.
        </p>
      </div>
    );
  }

  const nextRequiredBid = activeLot.bidsCount === 0
    ? activeLot.startingBid
    : activeLot.currentHighBid + activeLot.minIncrement;

  const handleChipBid = (multiplier: number) => {
    const amt = activeLot.bidsCount === 0
      ? activeLot.startingBid + activeLot.minIncrement * (multiplier - 1)
      : activeLot.currentHighBid + activeLot.minIncrement * multiplier;

    const res = placeUserBid(amt);
    setLastActionToast({
      type: res.success ? 'SUCCESS' : 'ERROR',
      message: res.message,
    });
    setTimeout(() => setLastActionToast(null), 4000);
  };

  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customBidInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(amt) && amt > 0) {
      const res = placeUserBid(amt);
      setLastActionToast({
        type: res.success ? 'SUCCESS' : 'ERROR',
        message: res.message,
      });
      setCustomBidInput('');
      setTimeout(() => setLastActionToast(null), 4000);
    }
  };

  const handleRevoke = () => {
    const res = revokeLastBid();
    setLastActionToast({
      type: res.success ? 'SUCCESS' : 'ERROR',
      message: res.message,
    });
    setTimeout(() => setLastActionToast(null), 4000);
  };

  const currentLeaderTeam = teams.find((t) => t.id === activeLot.currentLeaderId);
  const reserveMet = activeLot.currentHighBid >= activeLot.reservePrice;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {lastActionToast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between shadow-2xl transition-all ${
            lastActionToast.type === 'SUCCESS'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {lastActionToast.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span className="font-bold">{lastActionToast.message}</span>
          </div>
          <span className="text-[10px] opacity-75">USER DRIVEN ACTION</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TOP CONTROL STRIP: ACTIVE LOT HUD & STAGE CLOCK CONTROLS          */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#080d19] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
            LOT #{activeLot.lotNumber}
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {activeLot.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{activeLot.category}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-semibold">
                Reserve: {formatAuctionCurrency(activeLot.reservePrice, profile.currency)} ({reserveMet ? 'MET' : 'UNMET'})
              </span>
            </div>
          </div>
        </div>

        {/* Stage Clock Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-white/10 font-mono">
            <Clock
              className={`w-4 h-4 ${
                clock.status === 'RUNNING' && clock.remainingSeconds <= 10
                  ? 'text-red-400 animate-bounce'
                  : 'text-cyan-400'
              }`}
            />
            <span
              className={`text-lg font-black ${
                clock.remainingSeconds <= 10 ? 'text-red-400' : 'text-white'
              }`}
            >
              {clock.remainingSeconds}s
            </span>
            <span className="text-[10px] text-slate-500 uppercase">{clock.status}</span>
          </div>

          <button
            onClick={() => (clock.status === 'RUNNING' ? pauseClock() : startClock())}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              clock.status === 'RUNNING'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {clock.status === 'RUNNING' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {clock.status === 'RUNNING' ? 'Pause' : 'Start Clock'}
          </button>

          <button
            onClick={() => extendClock(15)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>

          <button
            onClick={() => resetClock(60)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white"
            title="Reset to 60s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN BIDDING ARENA GRID (HERO DISPLAY + CONTROLS)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: LOT MEDIA & LEADER HUD (6 COLS) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0e1320] to-[#060914] border border-white/10 shadow-2xl group">
            <img
              src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800'}
              alt={activeLot.title}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
            />
            {/* Status Ribbon */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                LOT #{activeLot.lotNumber}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/70 backdrop-blur-md text-slate-200 border border-white/10">
                {activeLot.status}
              </span>
            </div>
          </div>

          {/* Current Leader Banner */}
          <div
            className="p-5 rounded-3xl border transition-all flex items-center justify-between"
            style={{
              backgroundColor: currentLeaderTeam ? `${currentLeaderTeam.color}15` : '#080d19',
              borderColor: currentLeaderTeam ? `${currentLeaderTeam.color}40` : 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              {currentLeaderTeam ? (
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0"
                  style={{ borderColor: currentLeaderTeam.color }}
                >
                  <img src={currentLeaderTeam.logoUrl} alt={currentLeaderTeam.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                  Current Highest Bidder
                </span>
                <h3 className="text-base font-black text-white">
                  {activeLot.currentLeaderName || 'No Bids Yet — Awaiting Floor Opening'}
                </h3>
                {activeLot.currentLeaderPaddle && (
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    Paddle #{activeLot.currentLeaderPaddle}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                Current Bid
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: USER-CONTROLLED BIDDING PADDLE & INCREMENT CHIPS (6 COLS) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Active Paddle Selector */}
          <div className="p-5 rounded-3xl bg-[#090d19] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Select Bidding Paddle / Franchise
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {teams.length} Participants
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teams.map((t) => {
                const isSelected = t.id === activeBidderTeamId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveBidderTeam(t.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400/40'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg overflow-hidden border flex-shrink-0"
                      style={{ borderColor: t.color }}
                    >
                      <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{t.shortCode} #{t.paddleNumber}</div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate">
                        {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-Click Increment Chips */}
          <div className="p-5 rounded-3xl bg-[#090d19] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                1-Click Bid Increment Chips
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Step: +{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 5].map((multiplier) => {
                const targetAmt = activeLot.bidsCount === 0
                  ? activeLot.startingBid + activeLot.minIncrement * (multiplier - 1)
                  : activeLot.currentHighBid + activeLot.minIncrement * multiplier;

                return (
                  <button
                    key={multiplier}
                    onClick={() => handleChipBid(multiplier)}
                    className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 text-center transition-all group active:scale-95"
                  >
                    <div className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-300">
                      +{multiplier}x Step
                    </div>
                    <div className="text-base font-mono font-bold text-white group-hover:text-amber-200 mt-0.5">
                      {formatAuctionCurrency(targetAmt, profile.currency)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Primary Action Button: Bid Next Min Required */}
            <button
              onClick={() => handleChipBid(1)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
            >
              <Gavel className="w-4 h-4 fill-black stroke-black" />
              Place Next Bid: {formatAuctionCurrency(nextRequiredBid, profile.currency)}
              {activeBidderTeam && ` (as ${activeBidderTeam.name})`}
            </button>

            {/* Custom Bid Input */}
            <form onSubmit={handleCustomBid} className="flex gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={customBidInput}
                onChange={(e) => setCustomBidInput(e.target.value)}
                placeholder={`Custom amount (e.g. ${nextRequiredBid})`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Submit Bid
              </button>
            </form>
          </div>

          {/* AUCTIONEER GAVEL HAMMER CONTROLS */}
          <div className="p-5 rounded-3xl bg-[#090d19] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-purple-400" />
                Auctioneer Gavel Controls
              </span>
              <button
                onClick={handleRevoke}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Undo2 className="w-3 h-3" /> Revoke Last Bid
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => triggerGavelAction('FAIR_WARNING')}
                className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                Going Once
              </button>
              <button
                onClick={() => triggerGavelAction('GOING_TWICE')}
                className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold"
              >
                Going Twice
              </button>
              <button
                onClick={() => triggerGavelAction('SOLD')}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black shadow-lg shadow-emerald-600/30"
              >
                HAMMER SOLD!
              </button>
              <button
                onClick={() => triggerGavelAction('PASS_UNSOLD')}
                className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold"
              >
                Pass Unsold
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RECENT BIDS STREAM AUDIT TRAIL                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-5 rounded-3xl bg-[#080d19] border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Live Bids Audit Ledger ({bids.length} Bids Placed)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {bids.length === 0 ? 'NO BIDS YET' : 'CRYPTOGRAPHICALLY ORDERED'}
          </span>
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Awaiting first bid from participating paddles above.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bids.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
                  b.isRevoked
                    ? 'bg-red-950/20 border-red-500/20 text-slate-500 line-through'
                    : 'bg-black/40 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">
                    Paddle #{b.paddleNumber}
                  </span>
                  <span className="text-white font-bold">{b.teamName}</span>
                  {b.isRevoked && (
                    <span className="text-[10px] text-red-400 no-underline font-mono">
                      [REVOKED BY GAVEL]
                    </span>
                  )}
                </div>
                <div className="font-mono font-bold text-sm text-emerald-400">
                  {formatAuctionCurrency(b.amount, profile.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen SOLD Celebration Modal */}
      <SoldCelebrationOverlay />
    </div>
  );
};
