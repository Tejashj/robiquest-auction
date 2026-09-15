'use client';

/**
 * ============================================================================
 * SPORTS AUCTION ADMIN PANEL (THE LIVE AUCTIONEER DESK)
 * Designed for the Official Tournament Auctioneer (Hammer Official)
 * Stage Player Selection, Synchronized Countdown Clock, Gavel Hammer Strikes,
 * Disputed Bid Revocations, Floor Paddle Bids, and Cryptographic Bid Ledger
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
  ExternalLink,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';

export const SportsAuctionAdminPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    bids,
    clock,
    activeBidderTeamId,
    setActiveBidderTeam,
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

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  const handleFloorBid = (teamId: string) => {
    if (!activeLot) return;
    const nextAmount = activeLot.bidsCount === 0
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

  if (!activeLot) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <p>No catalog lots available. Use the hidden software admin to import lots.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* Celebration Modal Overlay */}
      <SoldCelebrationOverlay />

      {/* =====================================================================
          AUCTIONEER DESK HEADER
          ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-400/30">
            <Gavel className="w-6 h-6 text-black transform -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ROBICELL AUCTIONEER CONSOLE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300">
                LOT #{activeLot.lotNumber} ACTIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              RobiQuest Stage & Gavel Authority
            </h1>
          </div>
        </div>

        {/* Quick Player Stage Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">Put on Stage:</label>
          <select
            value={activeLot.id}
            onChange={(e) => setActiveLot(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
          >
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                Lot #{l.lotNumber}: {l.title} ({l.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xl ${
            toast.type === 'SUCCESS'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {toast.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* =====================================================================
          MAIN OPERATIONAL ARENA: STAGE CONTROLS + FLOOR PADDLES
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Lot Hero, Timer, Gavel Strikes */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Player Card */}
          <div className="p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-36 h-44 rounded-2xl overflow-hidden border border-white/15 bg-black/50 flex-shrink-0">
                <img
                  src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400'}
                  alt={activeLot.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    {activeLot.category}
                  </span>
                  {activeLot.isOverseas && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      Overseas ★
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                    activeLot.status === 'SOLD' ? 'bg-emerald-500/20 text-emerald-400' :
                    activeLot.status === 'PASSED' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white'
                  }`}>
                    {activeLot.status}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white">{activeLot.title}</h2>
                <p className="text-xs text-slate-400">{activeLot.attributes?.Country || 'International'} • {activeLot.attributes?.Discipline || activeLot.category}</p>

                <div className="pt-2 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">BASE PRICE</span>
                    <span className="text-white font-bold">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">MIN INCREMENT</span>
                    <span className="text-amber-300 font-bold">+{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Leader / High Bid */}
            <div className="mt-5 p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current High Bid</span>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Leader</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {activeLot.currentLeaderName
                    ? `${activeLot.currentLeaderName} (#${activeLot.currentLeaderPaddle})`
                    : 'Awaiting Floor Bid'}
                </div>
              </div>
            </div>
          </div>

          {/* Synchronized Stage Countdown Clock Controls */}
          <div className="p-5 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Stage Clock Synchronization
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                clock.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' :
                clock.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400' :
                'bg-white/10 text-slate-400'
              }`}>
                {clock.status}: {clock.remainingSeconds}s
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={startClock}
                disabled={clock.status === 'RUNNING'}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5" /> Start Clock
              </button>

              <button
                onClick={pauseClock}
                disabled={clock.status !== 'RUNNING'}
                className="py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>

              <button
                onClick={() => extendClock(15)}
                className="py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> +15s Anti-Snipe
              </button>

              <button
                onClick={() => resetClock(60)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset (60s)
              </button>
            </div>
          </div>

          {/* Gavel Strikes & Stage Authority */}
          <div className="p-5 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-amber-400" />
                Hammer Authority & Gavel Calls
              </span>
              <button
                onClick={handleRevoke}
                className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1"
                title="Revoke and roll back the last accepted bid"
              >
                <Undo2 className="w-3.5 h-3.5" /> Revoke Last Bid
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => triggerGavelAction('FAIR_WARNING')}
                className="py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-extrabold transition-all"
              >
                Going Once...
              </button>

              <button
                onClick={() => triggerGavelAction('GOING_TWICE')}
                className="py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-extrabold transition-all"
              >
                Going Twice...
              </button>

              <button
                onClick={() => triggerGavelAction('SOLD')}
                disabled={!activeLot.currentLeaderId || activeLot.status === 'SOLD'}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-40 text-black text-xs font-black shadow-lg shadow-emerald-500/30 uppercase tracking-wider transition-all active:scale-95"
              >
                HAMMER SOLD! 🔨
              </button>

              <button
                onClick={() => triggerGavelAction('PASS_UNSOLD')}
                className="py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
              >
                Pass Unsold
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Floor Paddles Bidding Desk & Ledger */}
        <div className="lg:col-span-5 space-y-5">
          {/* Floor Paddles Matrix (Direct Auctioneer Bid Entry) */}
          <div className="p-5 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Floor Paddle Entry ({teams.length} Teams)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Click to record bid</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {teams.map((t) => {
                const isLeader = activeLot.currentLeaderId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleFloorBid(t.id)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isLeader
                        ? 'bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400/40'
                        : 'bg-black/40 hover:bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg overflow-hidden border p-0.5 bg-black/60 flex-shrink-0"
                        style={{ borderColor: t.color }}
                      >
                        <img src={t.logoUrl} alt={t.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{t.shortCode} #{t.paddleNumber}</span>
                          {isLeader && <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-400 text-black font-extrabold">LEADING</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Purse: {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-amber-300 block">
                        Raise Next
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {t.squadCount}/{profile.maxSquadSize} Slots
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Live Bid Audit Ledger */}
          <div className="p-5 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Live Bid Ledger ({bids.length} Bids)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SHA-256 Verified</span>
            </div>

            {bids.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Awaiting opening bid from participating floor paddles.</p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {bids.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      b.isRevoked
                        ? 'bg-red-500/10 border-red-500/20 line-through text-red-400'
                        : 'bg-black/40 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{new Date(b.timestamp).toLocaleTimeString()}</span>
                      <span className="font-bold text-white">{b.teamName} (#{b.paddleNumber})</span>
                    </div>
                    <span className="font-bold text-emerald-400">{formatAuctionCurrency(b.amount, profile.currency)}</span>
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

export default SportsAuctionAdminPanel;
