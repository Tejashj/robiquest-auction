'use client';

/**
 * ============================================================================
 * SPORTS FRANCHISE BIDDERS PANEL (SECURED TEAM COCKPIT)
 * Exclusively for Verified Franchise Paddle Operators:
 *  - Protected by Team Confidential PIN (e.g. TITAN101)
 *  - 100% Locked to Authenticated Franchise (Zero cross-team hijacking)
 *  - 1-Click Tactile Paddle Raise with Solvency Guards
 *  - Real-Time Live Purse, Squad Quota, and Acquired Roster
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
    userRole,
    authenticatedTeamId,
    authenticateAsTeam,
    logoutRole,
    placeUserBid,
  } = useAuctionEngineStore();

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
  // ROLE GATE: IF NOT AUTHENTICATED AS A BIDDER, SHOW TERMINAL LOCK
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
      <div className="max-w-xl mx-auto p-6 sm:p-8 my-8 rounded-[18px] bg-black border border-[#16A085]/40 shadow-2xl shadow-[#16A085]/15 text-white text-center animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-[18px] bg-[#16A085]/10 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] mb-4 shadow-lg shadow-[#16A085]/20">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest">
          FRANCHISE BIDDING COCKPIT • AUTHENTICATION REQUIRED
        </span>
        <h2 className="text-2xl font-black text-[#D8CFB4] uppercase tracking-tight mt-1 mb-2 font-poppins">
          Unlock Franchise Terminal
        </h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
          To prevent unauthorized bidding, floor paddles are strictly locked to team PINs. Select your franchise and authenticate.
        </p>

        {unlockError && (
          <div className="mb-4 p-3 rounded-[18px] bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{unlockError}</span>
          </div>
        )}

        <form onSubmit={handleInlineLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase mb-2">
              Select Your Team:
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`p-3 rounded-[18px] border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-2 shadow-lg'
                        : 'bg-white/[0.02] border-white/10 opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? t.color : undefined,
                      backgroundColor: isSelected ? `${t.color}20` : undefined,
                    }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{t.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">Paddle #{t.paddleNumber}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase mb-2 flex items-center justify-between">
              <span>{targetTeam?.name} PIN:</span>
              <button
                type="button"
                onClick={() => setPinInput(targetTeam?.pin || `TEAM${targetTeam?.paddleNumber}`)}
                className="text-[#16A085] text-[10px] hover:underline"
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
                className="w-full px-4 py-3 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-sm tracking-widest placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#16A085]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Paddle Terminal</span>
          </button>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED COCKPIT VIEW FOR LOCKED TEAM
  // --------------------------------------------------------------------------
  const isLeading =
    activeLot && activeLot.currentLeaderId === currentTeam.id;

  const minNextBid = activeLot
    ? activeLot.bidsCount === 0
      ? activeLot.startingBid
      : activeLot.currentHighBid + activeLot.minIncrement
    : 0;

  // Calculate reserve floor invariant for this team
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

  const pursePercentRemaining = Math.max(0, Math.min(100, (currentTeam.remainingPurse / currentTeam.initialPurse) * 100));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* =====================================================================
          FRANCHISE COCKPIT HEADER (VERIFIED TABLE LOCK)
          ===================================================================== */}
      <div
        className="p-5 sm:p-6 rounded-[18px] border shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: '#000000',
          borderColor: `${currentTeam.color}80`,
          boxShadow: `0 0 35px ${currentTeam.color}25`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTeam.color }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Team Identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-[18px] overflow-hidden border-2 p-1 bg-black shadow-xl flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: currentTeam.color }}
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
                  className="text-xs font-mono font-black px-2.5 py-0.5 rounded-[18px] text-black"
                  style={{ backgroundColor: currentTeam.color }}
                >
                  PADDLE #{currentTeam.paddleNumber}
                </span>
                <span className="text-xs font-mono text-[#16A085] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AUTHENTICATED TABLE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#D8CFB4] tracking-tight uppercase mt-1 font-poppins">
                {currentTeam.name}
              </h1>
            </div>
          </div>

          {/* Release / Log Out Button */}
          <button
            onClick={logoutRole}
            className="self-start sm:self-center px-3.5 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Log out and release terminal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Switch Role / Log Out</span>
          </button>
        </div>

        {/* Live Financial Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/10">
          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Remaining Purse</span>
            <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-[#D8CFB4]">
              {formatAuctionCurrency(currentTeam.remainingPurse, profile.currency)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pursePercentRemaining}%`, backgroundColor: '#16A085' }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Max Allowed Bid</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#16A085] mt-0.5">
              {formatAuctionCurrency(maxSafeBid, profile.currency)}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Reserve floor protected</span>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Squad Acquired</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {currentTeam.squadCount} / {profile.minSquadSize} min
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Slots filled</span>
          </div>

          <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Spent</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-gray-300 mt-0.5">
              {formatAuctionCurrency(currentTeam.totalSpent, profile.currency)}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{currentTeam.acquiredPlayers.length} contenders won</span>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback (SnackBar styled with #16A085 background & black text) */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-[18px] text-sm font-bold flex items-center gap-3 animate-in fade-in shadow-xl ${
            actionFeedback.type === 'SUCCESS'
              ? 'bg-[#16A085] text-black font-bold'
              : 'bg-red-500 text-white font-bold'
          }`}
        >
          {actionFeedback.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* =====================================================================
          ACTIVE STAGE LOT & TACTILE BIDDING COCKPIT
          ===================================================================== */}
      {activeLot && (
        <div className="p-6 rounded-[18px] bg-black border border-[#16A085]/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[18px] text-xs font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40">
                  STAGE LOT #{activeLot.lotNumber}
                </span>
                <span className="text-xs font-mono text-gray-400 uppercase">
                  {activeLot.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#D8CFB4] uppercase tracking-tight mt-1 font-poppins">
                {activeLot.title}
              </h2>
            </div>

            {/* Current Stage Bid Display */}
            <div className="text-left md:text-right">
              <span className="text-xs font-mono text-gray-400 uppercase">Current High Bid</span>
              <div className="text-3xl font-black font-mono text-[#D8CFB4]">
                {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
              </div>
              {isLeading ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A085] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> YOU ARE THE HIGHEST BIDDER
                </span>
              ) : (
                <span className="text-xs text-[#16A085] font-mono">
                  Leader: {activeLot.currentLeaderName || 'Floor Open'}
                </span>
              )}
            </div>
          </div>

          {/* GIANT PADDLE RAISE BUTTON (Elevated Button Theme: #16A085, black text, 18px radius) */}
          <div className="space-y-4">
            <button
              onClick={() => handleBidSubmit(minNextBid)}
              disabled={isLeading || !canAffordNextBid}
              className={`w-full py-6 sm:py-8 rounded-[18px] font-black uppercase text-xl sm:text-2xl tracking-wider shadow-2xl transition-all flex flex-col items-center justify-center gap-1 active:scale-[0.99] ${
                isLeading
                  ? 'bg-[#16A085]/20 border-2 border-[#16A085] text-[#16A085] cursor-default'
                  : !canAffordNextBid
                  ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-[#16A085] hover:bg-[#1abc9c] text-black shadow-[#16A085]/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>
                  {isLeading
                    ? 'PADDLE RAISED — CURRENT HIGH BID'
                    : `RAISE PADDLE #${currentTeam.paddleNumber}`}
                </span>
              </div>
              <span className="text-sm sm:text-base font-mono font-bold opacity-90">
                {isLeading
                  ? 'Awaiting counter bids from floor'
                  : `Bid ${formatAuctionCurrency(minNextBid, profile.currency)} (+${formatAuctionCurrency(activeLot.minIncrement, profile.currency)})`}
              </span>
            </button>

            {/* Quick Step Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs font-mono text-gray-400">Quick Increment Multipliers:</span>
              {[1, 2, 3, 5].map((mult) => {
                const targetAmt = activeLot.currentHighBid + activeLot.minIncrement * mult;
                const canAfford = targetAmt <= maxSafeBid;

                return (
                  <button
                    key={mult}
                    onClick={() => handleBidSubmit(targetAmt)}
                    disabled={isLeading || !canAfford}
                    className="px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-[#D8CFB4] hover:text-white disabled:opacity-40 transition-all"
                  >
                    +{mult}x ({formatAuctionCurrency(activeLot.minIncrement * mult, profile.currency)})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ACQUIRED ROSTER ACCORDION
          ===================================================================== */}
      <div className="p-6 rounded-[18px] bg-black border border-white/10 space-y-4">
        <h3 className="text-base font-black text-[#D8CFB4] uppercase tracking-tight flex items-center gap-2 font-poppins">
          <Users className="w-4 h-4 text-[#16A085]" />
          <span>{currentTeam.name} Acquired Roster ({currentTeam.acquiredPlayers.length})</span>
        </h3>

        {currentTeam.acquiredPlayers.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center font-mono">
            No contenders acquired yet. Raise your paddle on active stage lots!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentTeam.acquiredPlayers.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/10 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#16A085] uppercase">Lot #{p.lotNumber}</span>
                  <div className="text-sm font-bold text-white uppercase">{p.title}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-400">Hammer</span>
                  <div className="text-xs font-black font-mono text-[#16A085]">
                    {formatAuctionCurrency(p.price, profile.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
