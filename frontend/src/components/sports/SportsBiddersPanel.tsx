'use client';

/**
 * ============================================================================
 * SPORTS FRANCHISE BIDDERS PANEL (SECURED TEAM COCKPIT & WAR ROOM)
 * Complete Bidding Cockpit Unified with Full Viewing Section Features:
 *  - ⚡ Live Cockpit (Tactile paddle raise, quick step chips, solvency reserve guard)
 *  - 🏆 Sold Contenders (Market price scouting & rival purchase inspection)
 *  - ⚠️ Unsold Lots (Tracking passed talent for re-auction)
 *  - 🛡️ Rival Franchises (Scouting all team purses and drafted players)
 *  - 📋 My Team Roster (Deep dive into team's drafted talent & remaining needs)
 *  - Persistent Quick-Bid Dock active across all scouting tabs
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Zap,
  Lock,
  Unlock,
  LogOut,
  Sparkles,
  ArrowUpRight,
  Flame,
  KeyRound,
  Eye,
  EyeOff,
  Trophy,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
} from '../../store/auction-engine-store';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';
import { UnsoldPassOverlay } from '../spectator/UnsoldPassOverlay';
import { GavelHammerStrike } from '../spectator/GavelHammerStrike';
import { InteractiveBiddingPaddle } from '../spectator/InteractiveBiddingPaddle';
import { SoldContendersView } from '../spectator/SoldContendersView';
import { UnsoldContendersView } from '../spectator/UnsoldContendersView';
import { FranchiseSquadsView } from '../spectator/FranchiseSquadsView';
import { LiveStageMiniHud } from '../spectator/LiveStageMiniHud';

export type BidderSubTab =
  | 'LIVE_COCKPIT'
  | 'SOLD_CONTENDERS'
  | 'UNSOLD_LOTS'
  | 'RIVAL_FRANCHISES'
  | 'MY_SQUAD';

export const SportsBiddersPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    clock,
    userRole,
    authenticatedTeamId,
    authenticateAsTeam,
    logoutRole,
    placeUserBid,
  } = useAuctionEngineStore();

  const [activeSubTab, setActiveSubTab] = useState<BidderSubTab>('LIVE_COCKPIT');
  const [customBidInput, setCustomBidInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedUnlockTeamId, setSelectedUnlockTeamId] = useState(teams[0]?.id || '');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [actionFeedback, setActionFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    text: string;
  } | null>(null);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // --------------------------------------------------------------------------
  // ROLE GATE: IF NOT AUTHENTICATED AS A BIDDER, SHOW SECURE TERMINAL LOCK
  // --------------------------------------------------------------------------
  const isBidderAuthenticated = userRole === 'BIDDER' && authenticatedTeamId;
  const currentTeam = teams.find((t) => t.id === authenticatedTeamId);

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (!selectedUnlockTeamId) {
      setUnlockError('Please select your team');
      return;
    }
    if (!pinInput.trim()) {
      setUnlockError('Please enter your Team Paddle PIN');
      return;
    }
    const ok = authenticateAsTeam(selectedUnlockTeamId, pinInput.trim());
    if (ok) {
      setPinInput('');
    } else {
      const targetTeam = teams.find((t) => t.id === selectedUnlockTeamId);
      const hint = targetTeam?.pin || `TEAM${targetTeam?.paddleNumber}`;
      setUnlockError(`Invalid PIN for ${targetTeam?.name}. (Default: ${hint})`);
    }
  };

  if (!isBidderAuthenticated || !currentTeam) {
    const targetTeam = teams.find((t) => t.id === selectedUnlockTeamId) || teams[0];

    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 my-8 rounded-[18px] bg-[#000000] border border-white/[0.08] text-white text-center animate-in fade-in font-poppins">
        <div className="w-16 h-16 mx-auto rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085] mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest">
          FRANCHISE BIDDING COCKPIT • SECURE ACCESS
        </span>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight mt-1 mb-2 font-poppins">
          Unlock Franchise Terminal
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
          To prevent unauthorized floor bidding, terminals are strictly locked to team PINs. Select your franchise and authenticate.
        </p>

        {unlockError && (
          <div className="mb-4 p-3.5 rounded-[18px] bg-white/[0.03] border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{unlockError}</span>
          </div>
        )}

        <form onSubmit={handleInlineLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              Select Your Franchise:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {teams.map((t) => {
                const isSelected = t.id === selectedUnlockTeamId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedUnlockTeamId(t.id);
                      setUnlockError(null);
                    }}
                    className={`p-3.5 rounded-[18px] border text-left transition-all flex items-center gap-3 bg-[#000000] ${
                      isSelected
                        ? 'border-[#16A085]'
                        : 'border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color || '#16A085' }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate font-poppins uppercase">
                        {t.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 font-semibold">
                        Paddle #{t.paddleNumber}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>{targetTeam?.name} Security PIN:</span>
              <button
                type="button"
                onClick={() => setPinInput(targetTeam?.pin || `TEAM${targetTeam?.paddleNumber}`)}
                className="text-[#16A085] text-[11px] font-mono hover:underline"
              >
                Auto-Fill ({targetTeam?.pin || `TEAM${targetTeam?.paddleNumber}`})
              </button>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder={`e.g. ${targetTeam?.pin || 'TITAN101'}`}
                className="w-full theme-input font-mono text-sm tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-[18px] theme-btn-primary text-black font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Paddle Terminal</span>
          </button>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED COCKPIT VIEW
  // --------------------------------------------------------------------------
  const isLeading = activeLot && activeLot.currentLeaderId === currentTeam.id;

  const minNextBid = activeLot
    ? activeLot.bidsCount === 0
      ? activeLot.startingBid
      : activeLot.currentHighBid + activeLot.minIncrement
    : 0;

  // Reserve floor invariant
  const unfilledSlots = Math.max(0, profile.minSquadSize - currentTeam.squadCount - 1);
  const reserveFloorNeeded = unfilledSlots * profile.lowestBasePrice;
  const maxSafeBid = profile.enforceReservePurseFloor
    ? Math.max(0, currentTeam.remainingPurse - reserveFloorNeeded)
    : currentTeam.remainingPurse;

  const canAffordNextBid = minNextBid <= maxSafeBid && !currentTeam.isFrozen;

  const handleBidSubmit = (amount: number) => {
    const res = placeUserBid(amount, currentTeam.id);
    if (res.success) {
      setActionFeedback({ type: 'SUCCESS', text: res.message });
      setCustomBidInput('');
    } else {
      setActionFeedback({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const pursePercentRemaining = Math.max(
    0,
    Math.min(100, (currentTeam.remainingPurse / currentTeam.initialPurse) * 100)
  );

  const soldCount = lots.filter((l) => l.status === 'SOLD').length;
  const unsoldCount = lots.filter((l) => l.status === 'PASSED').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200 font-poppins">
      {/* Overlays & Real-time Visual Effects */}
      <SoldCelebrationOverlay />
      <UnsoldPassOverlay />
      <GavelHammerStrike />
      <InteractiveBiddingPaddle position="bottom-right" />

      {/* =====================================================================
          FRANCHISE COCKPIT TOP HEADER
          ===================================================================== */}
      <div
        className="p-6 sm:p-7 rounded-[18px] border border-white/[0.08] bg-[#000000] relative overflow-hidden transition-all shadow-xl"
        style={{
          borderColor: currentTeam.color || 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Team Identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-[18px] overflow-hidden border p-1 bg-black flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: currentTeam.color || '#16A085' }}
            >
              <img
                src={currentTeam.logoUrl}
                alt={currentTeam.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-bold px-3 py-1 rounded-[18px] text-black"
                  style={{ backgroundColor: currentTeam.color || '#16A085' }}
                >
                  PADDLE #{currentTeam.paddleNumber}
                </span>
                <span className="text-xs font-mono text-[#16A085] font-bold flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-[18px] border border-white/[0.08]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  AUTHENTICATED
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase mt-1 font-poppins">
                {currentTeam.name}
              </h1>
            </div>
          </div>

          {/* Log Out Button */}
          <button
            onClick={logoutRole}
            className="self-start sm:self-center px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2"
            title="Log out and release terminal"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Switch Role / Release Cockpit</span>
          </button>
        </div>

        {/* Live Financial Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 mt-5 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Remaining Purse
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono mt-0.5 text-[#D8CFB4]">
              {formatAuctionCurrency(currentTeam.remainingPurse, profile.currency)}
            </div>
            <div className="w-full h-1.5 rounded-[18px] bg-white/[0.08] mt-2 overflow-hidden">
              <div
                className="h-full rounded-[18px] transition-all duration-500"
                style={{
                  width: `${pursePercentRemaining}%`,
                  backgroundColor: currentTeam.color || '#16A085',
                }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Max Safe Floor Bid
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#16A085] mt-0.5">
              {formatAuctionCurrency(maxSafeBid, profile.currency)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Reserve floor guarded</span>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Squad Acquired
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {currentTeam.acquiredPlayers?.length || 0} / {profile.minSquadSize} min
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Target roster slots</span>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-300 mt-0.5">
              {formatAuctionCurrency(currentTeam.totalSpent, profile.currency)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentTeam.acquiredPlayers?.length || 0} won
            </span>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-[18px] text-sm font-bold flex items-center gap-3 animate-in fade-in ${
            actionFeedback.type === 'SUCCESS'
              ? 'bg-[#16A085]/20 border border-[#16A085] text-white'
              : 'bg-white/[0.03] border border-red-500/40 text-red-300'
          }`}
        >
          {actionFeedback.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A085] flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* =====================================================================
          UNIFIED BIDDER NAVIGATION TABS (COCKPIT + FULL VIEWING SUITE)
          ===================================================================== */}
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-[18px] overflow-x-auto">
        {/* 1. Live Cockpit */}
        <button
          onClick={() => setActiveSubTab('LIVE_COCKPIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'LIVE_COCKPIT'
              ? 'bg-[#16A085] text-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Live Cockpit</span>
        </button>

        {/* 2. Sold Contenders */}
        <button
          onClick={() => setActiveSubTab('SOLD_CONTENDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'SOLD_CONTENDERS'
              ? 'bg-[#16A085] text-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Sold Contenders</span>
          <span
            className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
              activeSubTab === 'SOLD_CONTENDERS'
                ? 'bg-black/40 text-white'
                : 'bg-white/[0.08] text-[#16A085]'
            }`}
          >
            {soldCount}
          </span>
        </button>

        {/* 3. Unsold Lots */}
        <button
          onClick={() => setActiveSubTab('UNSOLD_LOTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'UNSOLD_LOTS'
              ? 'bg-[#16A085] text-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Unsold Lots</span>
          <span
            className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
              activeSubTab === 'UNSOLD_LOTS'
                ? 'bg-black/40 text-white'
                : 'bg-white/[0.08] text-amber-400'
            }`}
          >
            {unsoldCount}
          </span>
        </button>

        {/* 4. Rival Franchises */}
        <button
          onClick={() => setActiveSubTab('RIVAL_FRANCHISES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'RIVAL_FRANCHISES'
              ? 'bg-[#16A085] text-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Rival Franchises</span>
          <span
            className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
              activeSubTab === 'RIVAL_FRANCHISES'
                ? 'bg-black/40 text-white'
                : 'bg-white/[0.08] text-[#16A085]'
            }`}
          >
            {teams.length}
          </span>
        </button>

        {/* 5. My Team Roster */}
        <button
          onClick={() => setActiveSubTab('MY_SQUAD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'MY_SQUAD'
              ? 'bg-[#16A085] text-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>My Team Roster</span>
          <span
            className={`px-1.5 py-0.2 rounded-[18px] text-[10px] font-mono font-bold ${
              activeSubTab === 'MY_SQUAD'
                ? 'bg-black/40 text-white'
                : 'bg-white/[0.08] text-[#16A085]'
            }`}
          >
            {currentTeam.acquiredPlayers?.length || 0}
          </span>
        </button>
      </div>

      {/* =====================================================================
          PERSISTENT QUICK-BID DOCK (ACTIVE WHEN BROWSING SECONDARY TABS)
          ===================================================================== */}
      {activeSubTab !== 'LIVE_COCKPIT' && (
        <LiveStageMiniHud
          onReturnToStage={() => setActiveSubTab('LIVE_COCKPIT')}
          isBidderMode={true}
          authenticatedTeam={currentTeam}
        />
      )}

      {/* =====================================================================
          TAB 1: LIVE COCKPIT (TACTILE BIDDING FLOOR)
          ===================================================================== */}
      {activeSubTab === 'LIVE_COCKPIT' && activeLot && (
        <div className="space-y-6">
          {/* Active Stage Lot Card */}
          <div className="p-6 sm:p-8 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-[18px] text-xs font-mono font-bold bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/30">
                    STAGE LOT #{activeLot.lotNumber}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase bg-white/[0.03] px-2.5 py-1 rounded-[18px] border border-white/[0.08]">
                    {activeLot.category}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mt-2 font-poppins">
                  {activeLot.title}
                </h2>
              </div>

              {/* Current Stage Bid Display */}
              <div className="text-left md:text-right">
                <span className="text-xs font-mono text-slate-400 uppercase font-medium">
                  Current Highest Bid
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-[#D8CFB4]">
                  {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
                </div>
                {isLeading ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A085] font-mono mt-1 bg-white/[0.03] px-2.5 py-0.5 rounded-[18px] border border-white/[0.08]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> YOU HOLD THE FLOOR
                  </span>
                ) : (
                  <span className="text-xs text-[#16A085] font-mono mt-1 inline-block">
                    Leader: {activeLot.currentLeaderName || 'Floor Open for Bid'}
                  </span>
                )}
              </div>
            </div>

            {/* GIANT PADDLE RAISE BUTTON */}
            <div className="space-y-4">
              <button
                onClick={() => handleBidSubmit(minNextBid)}
                disabled={isLeading || !canAffordNextBid}
                className={`group relative w-full py-8 sm:py-9 rounded-[18px] font-bold uppercase text-xl sm:text-2xl tracking-wider transition-all transform active:scale-[0.98] flex flex-col items-center justify-center gap-1.5 overflow-hidden ${
                  isLeading
                    ? 'bg-white/[0.03] border-2 border-[#16A085] text-[#16A085] cursor-default'
                    : !canAffordNextBid
                    ? 'bg-white/[0.03] border border-white/[0.08] text-slate-500 cursor-not-allowed'
                    : 'theme-btn-primary text-black shadow-[0_10px_35px_rgba(22,160,133,0.4)] hover:shadow-[0_15px_45px_rgba(22,160,133,0.6)]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                <div className="flex items-center gap-3 font-poppins relative z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-mono font-black text-xs">
                    #{currentTeam.paddleNumber}
                  </div>
                  <span>
                    {isLeading
                      ? 'PADDLE RAISED — YOU HOLD THE FLOOR'
                      : `RAISE PADDLE #${currentTeam.paddleNumber}`}
                  </span>
                </div>
                <span className="text-sm sm:text-base font-mono font-bold opacity-95 relative z-10">
                  {isLeading
                    ? 'Awaiting counter bids from floor'
                    : `Bid ${formatAuctionCurrency(minNextBid, profile.currency)} (+${formatAuctionCurrency(activeLot.minIncrement, profile.currency)})`}
                </span>
              </button>

              {/* Practice Paddle Lever */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() =>
                    useAuctionEngineStore.getState().triggerManualPaddlePreview(currentTeam.id)
                  }
                  className="text-[11px] font-mono text-[#D8CFB4] hover:text-white flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <span>Practice Raising Paddle #{currentTeam.paddleNumber}</span>
                  <span className="text-[#16A085]">↑</span>
                </button>
              </div>

              {/* Quick Multiplier Chips */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className="text-xs font-mono text-slate-400">Multipliers:</span>
                {[1, 2, 3, 5].map((mult) => {
                  const targetAmt = activeLot.currentHighBid + activeLot.minIncrement * mult;
                  const canAfford = targetAmt <= maxSafeBid;

                  return (
                    <button
                      key={mult}
                      onClick={() => handleBidSubmit(targetAmt)}
                      disabled={isLeading || !canAfford}
                      className="px-4 py-2 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono font-bold text-slate-200 hover:text-white disabled:opacity-40 transition-all hover:border-[#16A085]"
                    >
                      +{mult}x ({formatAuctionCurrency(activeLot.minIncrement * mult, profile.currency)})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SOLD CONTENDERS (SCOUTING HAMMER PRICES)
          ===================================================================== */}
      {activeSubTab === 'SOLD_CONTENDERS' && <SoldContendersView />}

      {/* =====================================================================
          TAB 3: UNSOLD LOTS (TRACKING PASSED TALENT)
          ===================================================================== */}
      {activeSubTab === 'UNSOLD_LOTS' && <UnsoldContendersView />}

      {/* =====================================================================
          TAB 4: RIVAL FRANCHISES (SCOUTING RIVAL SQUADS & PURSES)
          ===================================================================== */}
      {activeSubTab === 'RIVAL_FRANCHISES' && <FranchiseSquadsView />}

      {/* =====================================================================
          TAB 5: MY TEAM ROSTER (DRAFTED SQUAD DEEP-DIVE)
          ===================================================================== */}
      {activeSubTab === 'MY_SQUAD' && (
        <div className="p-6 sm:p-8 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2 font-poppins">
              <Users className="w-5 h-5 text-[#16A085]" />
              <span>{currentTeam.name} Acquired Squad ({currentTeam.acquiredPlayers?.length || 0})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Target: <strong className="text-white">{profile.minSquadSize} - {profile.maxSquadSize} Contenders</strong>
            </span>
          </div>

          {(!currentTeam.acquiredPlayers || currentTeam.acquiredPlayers.length === 0) ? (
            <div className="p-12 text-center text-slate-500 rounded-[18px] bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
              No contenders won yet. Raise your paddle on live stage lots to draft talent into your squad!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentTeam.acquiredPlayers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between shadow-md"
                >
                  <div>
                    <div className="text-[10px] font-mono text-[#16A085] font-bold">
                      LOT #{p.lotNumber}
                    </div>
                    <div className="text-xs font-bold text-white uppercase truncate font-poppins mt-0.5">
                      {p.title}
                    </div>
                    {p.role && (
                      <div className="text-[10px] font-mono text-slate-400 uppercase">
                        {p.role}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#D8CFB4] ml-2">
                    {formatAuctionCurrency(p.price, profile.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SportsBiddersPanel;
