'use client';

/**
 * ============================================================================
 * SPORTS FRANCHISE BIDDERS PANEL (TEAM OPERATOR COCKPIT)
 * Designed for Team Owners & Table Representatives (e.g. IPL / Premier League)
 * Real-time Team Purse, Squad Composition, Overseas Quotas, Reserve Floor Guard
 * 100% User-Driven: Raise Paddle, 1-Click Increment Chips, Zero Gavel Access
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Globe,
  Zap,
  Lock,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
} from '../../store/auction-engine-store';

export const SportsBiddersPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    clock,
    activeFranchiseId,
    setActiveFranchise,
    placeUserBid,
  } = useAuctionEngineStore();

  const [customBidInput, setCustomBidInput] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    text: string;
  } | null>(null);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // Current selected franchise for this bidder terminal
  const currentTeam =
    teams.find((t) => t.id === activeFranchiseId) || teams[0];

  const isLeading =
    activeLot && currentTeam && activeLot.currentLeaderId === currentTeam.id;

  const minNextBid = activeLot
    ? activeLot.bidsCount === 0
      ? activeLot.startingBid
      : activeLot.currentHighBid + activeLot.minIncrement
    : 0;

  // Calculate reserve floor invariant for this team
  const unfilledSlots = currentTeam
    ? Math.max(0, profile.minSquadSize - currentTeam.squadCount - 1)
    : 0;
  const reserveFloorNeeded = unfilledSlots * profile.lowestBasePrice;
  const maxSafeBid = currentTeam
    ? profile.enforceReservePurseFloor
      ? Math.max(0, currentTeam.remainingPurse - reserveFloorNeeded)
      : currentTeam.remainingPurse
    : 0;

  const canAffordNextBid = minNextBid <= maxSafeBid && !currentTeam?.isFrozen;

  // Overseas quota check
  const isOverseasCapReached =
    activeLot?.isOverseas &&
    currentTeam &&
    currentTeam.overseasCount >= profile.maxOverseasLimit;

  // Squad capacity check
  const isSquadFull =
    currentTeam && currentTeam.squadCount >= profile.maxSquadSize;

  const handleBidSubmit = (amount: number) => {
    if (!currentTeam) return;
    const res = placeUserBid(amount, currentTeam.id);
    if (res.success) {
      setActionFeedback({ type: 'SUCCESS', text: res.message });
      setCustomBidInput('');
    } else {
      setActionFeedback({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  if (!currentTeam || !activeLot) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center text-slate-400">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-base font-semibold">No active player or franchise available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* =====================================================================
          FRANCHISE COCKPIT TOP BAR (TEAM IDENTITY & LIVE FINANCIAL STATUS)
          ===================================================================== */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: '#070c1a',
          borderColor: currentTeam.color ? `${currentTeam.color}40` : 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 opacity-15 pointer-events-none"
             style={{ backgroundColor: currentTeam.color }} />

        {/* Quick 4-Team Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-white/10">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">
            Active Team Table:
          </span>
          {teams.map((t) => {
            const isSelected = t.id === currentTeam.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveFranchise(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'shadow-lg'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? `${t.color}25` : undefined,
                  borderColor: isSelected ? t.color : undefined,
                  color: isSelected ? '#ffffff' : undefined,
                  boxShadow: isSelected ? `0 0 15px ${t.color}30` : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.name}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                  style={{ backgroundColor: `${t.color}35`, color: t.accentColor }}
                >
                  #{t.paddleNumber}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Team Selector & Emblem */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden border-2 p-1 bg-black/50 shadow-xl flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: currentTeam.color }}
            >
              <img
                src={currentTeam.logoUrl}
                alt={currentTeam.name}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-md text-black"
                  style={{ backgroundColor: currentTeam.color }}
                >
                  PADDLE #{currentTeam.paddleNumber}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  FRANCHISE OPERATOR
                </span>
                {currentTeam.isFrozen && (
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
                    BIDDING SUSPENDED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {currentTeam.name}
                </h1>

                {/* Team Switcher dropdown for table operators */}
                <div className="relative group">
                  <select
                    value={currentTeam.id}
                    onChange={(e) => setActiveFranchise(e.target.value)}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    title="Switch Franchise Table"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#090d19] text-white">
                        {t.name} (#{t.paddleNumber})
                      </option>
                    ))}
                  </select>
                  <button className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <span>Switch Table</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Franchise Financial & Squad Quota Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Remaining Purse */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Remaining Purse
              </span>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-0.5">
                {formatAuctionCurrency(currentTeam.remainingPurse, profile.currency)}
              </div>
              <span className="text-[10px] text-slate-400">
                Spent: {formatAuctionCurrency(currentTeam.totalSpent, profile.currency)}
              </span>
            </div>

            {/* Squad Count */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Squad Capacity
              </span>
              <div className="text-lg sm:text-xl font-black font-mono text-white mt-0.5">
                {currentTeam.squadCount} / {profile.maxSquadSize}
              </div>
              <span className="text-[10px] text-slate-400">
                Min Req: {profile.minSquadSize} players
              </span>
            </div>

            {/* Overseas Quota */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Overseas Quota
              </span>
              <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 ${
                currentTeam.overseasCount >= profile.maxOverseasLimit ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {currentTeam.overseasCount} / {profile.maxOverseasLimit}
              </div>
              <span className="text-[10px] text-slate-400">
                {profile.maxOverseasLimit - currentTeam.overseasCount} slots left
              </span>
            </div>

            {/* Reserve Floor Protection */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Reserve Floor
              </span>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-300 mt-0.5">
                {formatAuctionCurrency(reserveFloorNeeded, profile.currency)}
              </div>
              <span className="text-[10px] text-slate-400">
                {unfilledSlots} slots × {formatAuctionCurrency(profile.lowestBasePrice, profile.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ACTION FEEDBACK BANNER (SUCCESS / ERROR SOLVENCY ALERTS)
          ===================================================================== */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 shadow-xl transition-all ${
            actionFeedback.type === 'SUCCESS'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {actionFeedback.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* =====================================================================
          CENTER: CURRENT PLAYER ON THE BLOCK & PADDLE BIDDING COCKPIT
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player on Stage Card (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Live Indicator & Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  ON THE BLOCK: LOT #{activeLot.lotNumber}
                </span>
                {activeLot.isOverseas && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Overseas ★
                  </span>
                )}
              </div>

              {/* Stage Clock Display */}
              <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-xl bg-black/50 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className={clock.remainingSeconds <= 10 && clock.status === 'RUNNING' ? 'text-red-400 font-bold animate-pulse' : 'text-slate-300'}>
                  {clock.status === 'RUNNING' ? `${clock.remainingSeconds}s` : clock.status}
                </span>
              </div>
            </div>

            {/* Player Photo & Information */}
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <div className="w-36 h-44 rounded-2xl overflow-hidden border border-white/15 bg-black/40 flex-shrink-0 shadow-xl">
                <img
                  src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400'}
                  alt={activeLot.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                    {activeLot.category}
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {activeLot.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {activeLot.attributes?.Country || 'International'} • {activeLot.attributes?.Role || activeLot.category}
                  </p>
                </div>

                {/* Player Stats Chips */}
                {activeLot.playerStats && (
                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                    {activeLot.playerStats.matches && (
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[9px]">MATCHES</span>
                        <span className="font-bold text-white">{activeLot.playerStats.matches}</span>
                      </div>
                    )}
                    {activeLot.playerStats.strikeRate && (
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[9px]">STRIKE RATE</span>
                        <span className="font-bold text-cyan-400">{activeLot.playerStats.strikeRate}</span>
                      </div>
                    )}
                    {activeLot.playerStats.economy && (
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[9px]">ECONOMY</span>
                        <span className="font-bold text-emerald-400">{activeLot.playerStats.economy}</span>
                      </div>
                    )}
                    {activeLot.playerStats.runs && (
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[9px]">TOTAL RUNS</span>
                        <span className="font-bold text-amber-300">{activeLot.playerStats.runs}</span>
                      </div>
                    )}
                    {activeLot.playerStats.wickets && (
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[9px]">WICKETS</span>
                        <span className="font-bold text-purple-300">{activeLot.playerStats.wickets}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Base Price:</span>
                  <span className="text-white font-bold">
                    {formatAuctionCurrency(activeLot.startingBid, profile.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Highest Bid Banner */}
            <div className="mt-5 p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Current Highest Bid
                </span>
                <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                  {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Leading Franchise
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {activeLot.currentLeaderName
                    ? `${activeLot.currentLeaderName} (#${activeLot.currentLeaderPaddle})`
                    : 'Opening Bid Floor'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactile Bidding Paddle Console (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl space-y-5">
            {/* Franchise Bidding Status Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Live Paddle Console
              </span>

              {isLeading ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  YOU HOLD THE WINNING BID
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  PADDLE IDLE / OUTBID
                </span>
              )}
            </div>

            {/* Primary Big Raise Paddle Button */}
            <div>
              <button
                disabled={!canAffordNextBid || isLeading || isOverseasCapReached || isSquadFull}
                onClick={() => handleBidSubmit(minNextBid)}
                className={`w-full py-5 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${
                  isLeading
                    ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : canAffordNextBid && !isOverseasCapReached && !isSquadFull
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Shield className="w-6 h-6" />
                {isLeading ? (
                  <span>Paddle Raised: You Lead at {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}</span>
                ) : isSquadFull ? (
                  <span>Squad Limit Full (Max {profile.maxSquadSize})</span>
                ) : isOverseasCapReached ? (
                  <span>Overseas Limit Reached (Max {profile.maxOverseasLimit})</span>
                ) : !canAffordNextBid ? (
                  <span>Cannot Bid: Breaches Reserve Floor</span>
                ) : (
                  <span>
                    RAISE PADDLE #{currentTeam.paddleNumber} — {formatAuctionCurrency(minNextBid, profile.currency)}
                  </span>
                )}
              </button>

              {/* Solvency Warning Explainer if blocked */}
              {!canAffordNextBid && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Reserve Floor Lock:</strong> Your remaining purse is{' '}
                    {formatAuctionCurrency(currentTeam.remainingPurse, profile.currency)}, but you must
                    preserve at least {formatAuctionCurrency(reserveFloorNeeded, profile.currency)} to guarantee
                    base prices for your {unfilledSlots} unfilled squad slots. Max permissible bid:{' '}
                    <strong>{formatAuctionCurrency(maxSafeBid, profile.currency)}</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Quick 1-Click Increment Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Fast Multiplier Chips:</span>
                <span className="font-mono">Step: +{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 4].map((multiplier) => {
                  const targetAmt =
                    activeLot.bidsCount === 0
                      ? activeLot.startingBid + activeLot.minIncrement * (multiplier - 1)
                      : activeLot.currentHighBid + activeLot.minIncrement * multiplier;
                  const canAfford = targetAmt <= maxSafeBid && !isOverseasCapReached && !isSquadFull && !currentTeam.isFrozen;

                  return (
                    <button
                      key={multiplier}
                      disabled={!canAfford}
                      onClick={() => handleBidSubmit(targetAmt)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        canAfford
                          ? 'bg-white/5 hover:bg-amber-500/20 border-white/10 hover:border-amber-400/50 text-white group'
                          : 'bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 group-hover:text-amber-300">
                        +{multiplier}x Step
                      </div>
                      <div className="text-sm font-mono font-bold mt-0.5">
                        {formatAuctionCurrency(targetAmt, profile.currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Bid Input */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="number"
                value={customBidInput}
                onChange={(e) => setCustomBidInput(e.target.value)}
                placeholder={`Custom Amount (min ${formatAuctionCurrency(minNextBid, profile.currency)})`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  const amt = parseFloat(customBidInput);
                  if (!isNaN(amt) && amt >= minNextBid) {
                    handleBidSubmit(amt);
                  } else {
                    setActionFeedback({
                      type: 'ERROR',
                      text: `Custom bid must be at least ${formatAuctionCurrency(minNextBid, profile.currency)}`,
                    });
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono transition-all"
              >
                Submit Bid
              </button>
            </div>
          </div>

          {/* Acquired Players Drawer for this franchise */}
          <div className="p-5 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {currentTeam.name} Roster ({currentTeam.acquiredPlayers?.length || 0} Acquired)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Total Spent: {formatAuctionCurrency(currentTeam.totalSpent, profile.currency)}
              </span>
            </div>

            {(!currentTeam.acquiredPlayers || currentTeam.acquiredPlayers.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No players acquired yet. Use your paddle above to win auctions.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentTeam.acquiredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">{player.title}</span>
                      <span className="text-[10px] text-slate-400">({player.role})</span>
                      {player.isOverseas && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                          Overseas
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatAuctionCurrency(player.price, profile.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBiddersPanel;
