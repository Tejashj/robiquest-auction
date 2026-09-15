'use client';

/**
 * ============================================================================
 * LIVE AUCTIONEER CONTROL BAR & GAVEL OVERRIDE
 * Real-Time Gavel Actions, Timer Overrides, 1-Click Bid Revocation & Step Tuning
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Gavel,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  AlertTriangle,
  Undo2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../../lib/audio-cues';

export interface LiveAuctioneerControlBarProps {
  currentLotNumber?: number;
  currentBid?: number;
  currentLeaderPaddle?: number;
  currentLeaderName?: string;
  onGavelAction?: (action: string, payload?: any) => void;
  onRevokeLastBid?: () => void;
  onOverrideIncrement?: (step: number) => void;
}

export const LiveAuctioneerControlBar: React.FC<LiveAuctioneerControlBarProps> = ({
  currentLotNumber = 18,
  currentBid = 165000000, // ₹16.50 Cr
  currentLeaderPaddle = 108,
  currentLeaderName = 'Sunrisers Hyderabad',
  onGavelAction,
  onRevokeLastBid,
  onOverrideIncrement,
}) => {
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [activeIncrementStep, setActiveIncrementStep] = useState(5000000); // Default ₹50 Lakhs
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setLastActionToast(msg);
    setTimeout(() => setLastActionToast(null), 3500);
  };

  const handleFairWarning = () => {
    soundEffects.playClockWarningTick();
    triggerToast('Fair Warning called: "Going once..."');
    if (onGavelAction) onGavelAction('FAIR_WARNING');
  };

  const handleGoingTwice = () => {
    soundEffects.playClockWarningTick();
    triggerToast('Warning escalated: "Going twice..."');
    if (onGavelAction) onGavelAction('GOING_TWICE');
  };

  const handleSoldHammer = () => {
    soundEffects.playGavelStrike();
    triggerToast(`HAMMER FALLS! Lot #${currentLotNumber} SOLD for ₹${(currentBid / 10000000).toFixed(2)} Cr to ${currentLeaderName}`);
    if (onGavelAction) onGavelAction('SOLD', { currentBid, currentLeaderName });
  };

  const handlePassLot = () => {
    triggerToast(`Lot #${currentLotNumber} PASSED UNSOLD below reserve.`);
    if (onGavelAction) onGavelAction('PASS_UNSOLD');
  };

  const handleReAuction = () => {
    triggerToast(`Lot #${currentLotNumber} RECALLED for immediate Re-Auction.`);
    if (onGavelAction) onGavelAction('RE_AUCTION_LOT');
  };

  const handleToggleClock = () => {
    const nextState = !isClockRunning;
    setIsClockRunning(nextState);
    triggerToast(nextState ? 'Stage Clock RESUMED' : 'Stage Clock PAUSED / HELD');
    if (onGavelAction) onGavelAction(nextState ? 'START_CLOCK' : 'PAUSE_CLOCK');
  };

  const handleAddClock = (seconds: number) => {
    triggerToast(`+${seconds}s Emergency Time Extension added to clock.`);
    if (onGavelAction) onGavelAction('EXTEND_CLOCK', { additionalSeconds: seconds });
  };

  const handleResetClock = () => {
    triggerToast('Stage Clock Reset to 60 seconds.');
    if (onGavelAction) onGavelAction('RESET_CLOCK');
  };

  const handleRevokeBid = () => {
    soundEffects.playOutbidAlert();
    triggerToast('LAST BID REVOKED! Reverted balance and restored previous highest bidder.');
    if (onRevokeLastBid) onRevokeLastBid();
  };

  const handleSelectIncrement = (step: number) => {
    setActiveIncrementStep(step);
    triggerToast(`Discretionary Bid Increment Step tuned to ₹${(step / 100000).toFixed(0)} Lakhs.`);
    if (onOverrideIncrement) onOverrideIncrement(step);
  };

  return (
    <div className="w-full rounded-3xl bg-[#080d19] border border-white/15 p-5 xl:p-6 shadow-2xl space-y-5">
      {/* Action Notification Toast */}
      {lastActionToast && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{lastActionToast}</span>
          </div>
          <span className="text-[10px] opacity-75">LIVE EVENT BROADCASTED</span>
        </div>
      )}

      {/* Lot Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
            ACTIVE LOT #{currentLotNumber}
          </span>
          <span className="text-white font-bold">
            Current Bid: <strong className="text-emerald-400 font-mono text-sm">₹{(currentBid / 10000000).toFixed(2)} Cr</strong>
          </span>
          <span className="text-slate-300">
            Leader: <strong className="text-cyan-300">{currentLeaderName}</strong> (Paddle #{currentLeaderPaddle})
          </span>
        </div>

        {/* 1-Click Revoke Last Bid Button */}
        <button
          onClick={handleRevokeBid}
          className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Undo2 className="w-4 h-4 text-red-400" />
          Revoke Last Bid (Restore Balance)
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ROW 1: PRIMARY GAVEL HAMMER CONTROLS                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-amber-400" />
          Primary Hammer & Gavel Execution
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Fair Warning */}
          <button
            onClick={handleFairWarning}
            className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Fair Warning</span>
            <span className="text-[9px] text-amber-300/80">"Going Once..."</span>
          </button>

          {/* Going Twice */}
          <button
            onClick={handleGoingTwice}
            className="p-3.5 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Going Twice</span>
            <span className="text-[9px] text-amber-300/80">Last Call</span>
          </button>

          {/* SOLD HAMMER STRIKE */}
          <button
            onClick={handleSoldHammer}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
          >
            <Gavel className="w-5 h-5 fill-black stroke-black" />
            <span>HAMMER: SOLD!</span>
            <span className="text-[9px] text-black/80 font-mono">Confetti & Deduct</span>
          </button>

          {/* PASS UNSOLD */}
          <button
            onClick={handlePassLot}
            className="p-3.5 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <XCircle className="w-4 h-4 text-red-400" />
            <span>Pass Unsold</span>
            <span className="text-[9px] text-red-300/80">Below Reserve</span>
          </button>

          {/* RE-AUCTION LOT */}
          <button
            onClick={handleReAuction}
            className="p-3.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>Re-Auction Lot</span>
            <span className="text-[9px] text-purple-300/80">Recall to Stage</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ROW 2: STAGE CLOCK & DISCRETIONARY BID INCREMENT STEP CONTROLS    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-white/5">
        {/* Stage Clock Controls (6 COLS) */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400">
            Stage Clock Override
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleToggleClock}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isClockRunning
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isClockRunning ? 'Hold Clock' : 'Resume Clock'}
            </button>

            <button
              onClick={() => handleAddClock(15)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              15s
            </button>

            <button
              onClick={() => handleAddClock(30)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              30s
            </button>

            <button
              onClick={handleResetClock}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
            >
              Reset 60s
            </button>
          </div>
        </div>

        {/* Discretionary Step Tuner (6 COLS) */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Discretionary Increment Step Override
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '₹10L', value: 1000000 },
              { label: '₹20L', value: 2000000 },
              { label: '₹50L', value: 5000000 },
              { label: '₹1.00 Cr', value: 10000000 },
            ].map((step) => (
              <button
                key={step.value}
                onClick={() => handleSelectIncrement(step.value)}
                className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  activeIncrementStep === step.value
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
