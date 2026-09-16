'use client';

/**
 * ============================================================================
 * SPORTS AUCTION ADMIN PANEL (THE LIVE AUCTIONEER DESK)
 * Secured Authority for Tournament Officials:
 *  - Protected by Admin Master PIN (e.g. ROBOCELL2026)
 *  - 🔨 Gavel Authority (Fair Warning, Going Twice, Hammer Sold!, Pass Unsold)
 *  - ⏱️ Synchronized Stage Clock & Anti-Snipe Controls
 *  - 📋 Contender CMS Studio: Dynamic Add, Edit, Delete, Import/Export Contenders
 *  - 🙋 Floor Paddle Entry & Disputed Bid Revocations
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
  Undo2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  LogOut,
  FolderEdit,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';
import { ContenderManagerModal } from '../admin/ContenderManagerModal';

export const SportsAuctionAdminPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    bids,
    clock,
    userRole,
    authenticateAsAdmin,
    logoutRole,
    setActiveLot,
    placeUserBid,
    revokeLastBid,
    startClock,
    pauseClock,
    extendClock,
    resetClock,
    triggerGavelAction,
  } = useAuctionEngineStore();

  const [toast, setToast] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);
  const [isContenderModalOpen, setIsContenderModalOpen] = useState(false);

  // Inline Admin PIN state
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // --------------------------------------------------------------------------
  // ROLE GATE: IF NOT AUTHENTICATED AS ADMIN, SHOW LOCK SCREEN
  // --------------------------------------------------------------------------
  if (userRole !== 'ADMIN') {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      if (!adminPinInput.trim()) {
        setLoginError('Please enter the Auctioneer PIN');
        return;
      }
      const ok = authenticateAsAdmin(adminPinInput.trim());
      if (ok) {
        setAdminPinInput('');
      } else {
        setLoginError('Invalid Auctioneer Master PIN. Default: ROBOCELL2026');
      }
    };

    return (
      <div className="max-w-lg mx-auto p-6 sm:p-8 my-10 rounded-[18px] bg-black border border-[#16A085]/40 shadow-2xl shadow-[#16A085]/20 text-white text-center animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-[18px] bg-[#16A085]/10 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] mb-4 shadow-lg shadow-[#16A085]/20">
          <Gavel className="w-8 h-8 transform -rotate-12" />
        </div>

        <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest">
          ROBICELL TOURNAMENT OFFICIALS ONLY
        </span>
        <h2 className="text-2xl font-black text-[#D8CFB4] uppercase tracking-tight mt-1 mb-2 font-poppins">
          Auctioneer Console Locked
        </h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
          This console holds hammer authority, clock synchronization, and lot catalog management. Enter the official passcode to proceed.
        </p>

        {loginError && (
          <div className="mb-4 p-3 rounded-[18px] bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase mb-2 flex items-center justify-between">
              <span>Master Passcode:</span>
              <button
                type="button"
                onClick={() => setAdminPinInput('ROBOCELL2026')}
                className="text-[#16A085] text-[10px] hover:underline"
              >
                Auto-Fill (ROBOCELL2026)
              </button>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="ROBOCELL2026"
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
            <span>Unlock Official Desk</span>
          </button>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED AUCTIONEER DESK
  // --------------------------------------------------------------------------
  const handleFloorBid = (teamId: string) => {
    if (!activeLot) return;
    const nextAmount =
      activeLot.bidsCount === 0
        ? activeLot.startingBid
        : activeLot.currentHighBid + activeLot.minIncrement;
    const res = placeUserBid(nextAmount, teamId);
    if (res.success) {
      setToast({ type: 'SUCCESS', text: res.message });
    } else {
      setToast({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevoke = () => {
    const res = revokeLastBid();
    if (res.success) {
      setToast({ type: 'SUCCESS', text: res.message });
    } else {
      setToast({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* Celebration Modal Overlay */}
      <SoldCelebrationOverlay />

      {/* Dynamic Contender CMS Studio Modal */}
      <ContenderManagerModal
        isOpen={isContenderModalOpen}
        onClose={() => setIsContenderModalOpen(false)}
      />

      {/* =====================================================================
          AUCTIONEER DESK HEADER
          ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-[18px] bg-black border border-[#16A085]/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[18px] bg-[#16A085] flex items-center justify-center shadow-lg shadow-[#16A085]/25 border border-[#16A085]/50">
            <Gavel className="w-6 h-6 text-black transform -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#16A085] font-bold">
                ROBICELL AUCTIONEER CONSOLE
              </span>
              {activeLot && (
                <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.03] text-gray-300 border border-white/10">
                  LOT #{activeLot.lotNumber} ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#D8CFB4] tracking-tight uppercase font-poppins">
              RobiQuest Stage & Gavel Authority
            </h1>
          </div>
        </div>

        {/* Action Controls: Contender CMS Studio + Put on Stage + Lock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsContenderModalOpen(true)}
            className="px-4 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#16A085]/25 transition-all"
          >
            <FolderEdit className="w-3.5 h-3.5" />
            <span>Manage Contenders ({lots.length})</span>
          </button>

          {activeLot && (
            <div className="flex items-center gap-2">
              <select
                value={activeLot.id}
                onChange={(e) => setActiveLot(e.target.value)}
                className="px-3 py-2 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#16A085] max-w-[200px] truncate"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id} className="bg-black text-white">
                    #{l.lotNumber}: {l.title} ({l.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={logoutRole}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            title="Lock Auctioneer Console"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Toast Feedback (SnackBar style: #16A085 background, black text) */}
      {toast && (
        <div
          className={`p-3.5 rounded-[18px] text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xl ${
            toast.type === 'SUCCESS'
              ? 'bg-[#16A085] text-black font-bold'
              : 'bg-red-500 text-white font-bold'
          }`}
        >
          {toast.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* If no lots are loaded */}
      {!activeLot ? (
        <div className="p-12 text-center text-gray-400 rounded-[18px] bg-black border border-white/10 space-y-3">
          <p className="text-base font-bold text-white">No Contenders in Catalog</p>
          <button
            onClick={() => setIsContenderModalOpen(true)}
            className="px-4 py-2 rounded-[18px] bg-[#16A085] text-black font-extrabold text-xs"
          >
            Open Contender Studio & Add Lots
          </button>
        </div>
      ) : (
        <>
          {/* =====================================================================
              PRIMARY OPERATIONAL ROW: ACTIVE LOT CARD + 4-TEAM PADDLE ENTRY
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Stage Lot Overview (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-[18px] bg-black border border-white/10 shadow-2xl flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 h-24 rounded-[18px] overflow-hidden bg-black border border-white/15 flex-shrink-0 relative">
                  <img
                    src={activeLot.imageUrls[0]}
                    alt={activeLot.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[18px] bg-black/80 font-mono text-xs font-bold text-[#D8CFB4]">
                    #{activeLot.lotNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-[18px] text-xs font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40">
                      {activeLot.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.03] text-gray-300 uppercase border border-white/10">
                      {activeLot.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#D8CFB4] uppercase tracking-tight font-poppins">
                    {activeLot.title}
                  </h2>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-4 pt-1">
                    <span>Base: <strong className="text-white">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</strong></span>
                    <span>Increment: <strong className="text-[#16A085]">+{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Current High Bid Hero Banner */}
              <div className="p-5 rounded-[18px] bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400">Current Highest Bid</span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-[#D8CFB4]">
                    {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Current Leader</span>
                  <div className="text-lg font-black text-[#16A085] uppercase truncate">
                    {activeLot.currentLeaderName || 'No Floor Bids Yet'}
                  </div>
                  {activeLot.currentLeaderPaddle && (
                    <span className="text-xs font-mono text-gray-400">Paddle #{activeLot.currentLeaderPaddle}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick 4-Team Floor Paddle Triggers (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-[18px] bg-black border border-white/10 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-[#D8CFB4] uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#16A085]" />
                  Floor Paddle Entry (4 Teams)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Click to record bid</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {teams.map((t) => {
                  const isLeader = activeLot.currentLeaderId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleFloorBid(t.id)}
                      disabled={isLeader}
                      className={`p-3 rounded-[18px] border text-left transition-all flex items-center justify-between ${
                        isLeader
                          ? 'bg-[#16A085]/10 border-[#16A085]/40 text-[#16A085] shadow-md'
                          : 'bg-white/[0.02] border-white/10 hover:border-[#16A085]/40 hover:bg-white/5 active:scale-[0.99]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{t.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">#{t.paddleNumber}</span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">
                            Purse: {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isLeader ? (
                          <span className="text-xs font-bold text-[#16A085] font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> LEADER
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#16A085]">
                            Raise Next
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =====================================================================
              SECONDARY OPERATIONAL ROW: STAGE CLOCK + GAVEL HAMMER CALLS
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stage Clock Controls (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-[18px] bg-black border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[#D8CFB4] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#16A085]" />
                  Stage Clock Synchronization
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-[18px] bg-white/[0.03] text-white font-bold border border-white/10">
                  {clock.status}: {clock.remainingSeconds}s
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {clock.status === 'RUNNING' ? (
                  <button
                    onClick={pauseClock}
                    className="py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={startClock}
                    className="py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#16A085]/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Start</span>
                  </button>
                )}

                <button
                  onClick={() => extendClock(15)}
                  className="py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-[#16A085]/20 border border-[#16A085]/40 text-[#16A085] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+15s Anti-Snipe</span>
                </button>

                <button
                  onClick={() => resetClock(60)}
                  className="py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset (60s)</span>
                </button>
              </div>
            </div>

            {/* Gavel Hammer Strikes (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-[18px] bg-black border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[#D8CFB4] flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-[#16A085]" />
                  Hammer Authority & Gavel Calls
                </span>

                <button
                  onClick={handleRevoke}
                  disabled={bids.length === 0}
                  className="px-2.5 py-1 rounded-[18px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold disabled:opacity-40 flex items-center gap-1 transition-all"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Revoke Last Bid</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => triggerGavelAction('FAIR_WARNING')}
                  className="py-3 px-2 rounded-[18px] bg-white/[0.03] hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase transition-all"
                >
                  Going Once
                </button>
                <button
                  onClick={() => triggerGavelAction('GOING_TWICE')}
                  className="py-3 px-2 rounded-[18px] bg-white/[0.03] hover:bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase transition-all"
                >
                  Going Twice
                </button>
                <button
                  onClick={() => triggerGavelAction('SOLD')}
                  disabled={!activeLot.currentLeaderId}
                  className="py-3 px-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase shadow-lg shadow-[#16A085]/30 disabled:opacity-40 transition-all active:scale-[0.98]"
                >
                  🔨 SOLD!
                </button>
                <button
                  onClick={() => triggerGavelAction('PASS_UNSOLD')}
                  className="py-3 px-2 rounded-[18px] bg-white/[0.03] hover:bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black uppercase transition-all"
                >
                  Pass Unsold
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
