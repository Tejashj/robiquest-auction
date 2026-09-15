'use client';

/**
 * ============================================================================
 * HERO STAGE (PROJECTOR VIEW - BOUND TO USER-DRIVEN STORE)
 * Reflects User Lots, User Teams, Real Currency Formatting, and User Gavel Events
 * ============================================================================
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const HeroStage: React.FC = () => {
  const { profile, lots, activeLotId, teams, clock } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  if (!activeLot) {
    return (
      <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#060914] border border-white/10">
        No active lot on stage.
      </div>
    );
  }

  const leadingTeam = teams.find((t) => t.id === activeLot.currentLeaderId);

  // Circular clock parameters
  const circleRadius = 46;
  const circumference = 2 * Math.PI * circleRadius;
  const maxTime = clock.totalDurationSeconds || 60;
  const strokeOffset =
    circumference - (Math.min(maxTime, clock.remainingSeconds) / maxTime) * circumference;

  const isLowTime = clock.status === 'RUNNING' && clock.remainingSeconds <= 10;

  const getStatusBadge = () => {
    switch (activeLot.status) {
      case 'FAIR_WARNING':
        return {
          text: 'FAIR WARNING (GOING ONCE, TWICE...)',
          color: 'bg-amber-500 text-black border-amber-300 shadow-amber-500/50',
          icon: <Gavel className="w-5 h-5 fill-black stroke-black animate-bounce" />,
        };
      case 'SOLD':
        return {
          text: `SOLD TO ${activeLot.currentLeaderName?.toUpperCase() || 'HIGH BIDDER'}`,
          color: 'bg-emerald-500 text-black border-emerald-300 shadow-emerald-500/50',
          icon: <Trophy className="w-5 h-5 fill-black text-black" />,
        };
      case 'PASSED':
        return {
          text: 'UNSOLD — BELOW RESERVE',
          color: 'bg-red-500 text-white border-red-300 shadow-red-500/50',
          icon: <AlertOctagon className="w-5 h-5" />,
        };
      case 'LIVE':
      default:
        return {
          text: 'LIVE IN PLAY',
          color: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-300 shadow-cyan-500/30',
          icon: <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping mr-1" />,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#050811] to-[#04060d] border border-white/15 p-6 xl:p-8 shadow-2xl overflow-hidden">
      {/* Dynamic Ambient Backlight matching Leading Team Color */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: leadingTeam?.color || '#06b6d4' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-20 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: leadingTeam?.accentColor || '#3b82f6' }}
      />

      {/* STAGE HEADER: STATUS BANNER & LOT IDENTIFIERS */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-xl text-xs xl:text-sm font-mono font-extrabold bg-white/10 text-amber-300 border border-white/15 tracking-wider shadow-inner">
            LOT #{activeLot.lotNumber}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
            {activeLot.category}
          </span>
          {activeLot.roleBadge && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {activeLot.roleBadge}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-xs xl:text-sm font-extrabold uppercase tracking-widest border shadow-xl ${badge.color}`}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      </div>

      {/* CENTER GRID: MEDIA + MEGA BID COUNTER + TIMER */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center pt-6">
        {/* LEFT: LOT PORTRAIT (5 COLS) */}
        <div className="lg:col-span-5 relative group">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-t from-black via-slate-950/60 to-transparent border border-white/15 shadow-2xl">
            <img
              src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800'}
              alt={activeLot.title}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060d] via-transparent to-transparent opacity-90" />

            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                CATALOG ITEM #{activeLot.lotNumber}
              </span>
              <h2 className="text-xl xl:text-2xl font-black text-white tracking-tight uppercase">
                {activeLot.title}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                {Object.entries(activeLot.attributes).slice(0, 3).map(([k, v]) => (
                  <span key={k}>
                    <strong className="text-slate-400 font-normal">{k}:</strong> {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: MEGA BID DISPLAY & LEADING TEAM EMBLAZON (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="p-6 xl:p-8 rounded-3xl bg-[#090e1c]/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs xl:text-sm uppercase font-mono font-bold tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Current Highest Bid
              </span>
              <span className="text-xs font-mono text-slate-400">
                Opening: <strong className="text-slate-200">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</strong>
              </span>
            </div>

            {/* Oversized Spring Bid Number */}
            <div className="text-5xl sm:text-6xl xl:text-7xl font-black font-mono tracking-tight text-white">
              {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs xl:text-sm">
              <span className="text-slate-400">Next Step:</span>
              <span className="font-mono font-bold text-cyan-300">
                +{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}
              </span>
            </div>
          </div>

          {/* LEADING TEAM BADGE & CIRCULAR CLOCK RING */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div
              className="sm:col-span-8 p-5 rounded-3xl border transition-all flex items-center gap-4 relative overflow-hidden"
              style={{
                backgroundColor: leadingTeam ? `${leadingTeam.color}15` : '#080d19',
                borderColor: leadingTeam ? `${leadingTeam.color}45` : 'rgba(255,255,255,0.1)',
              }}
            >
              {leadingTeam ? (
                <div
                  className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl overflow-hidden border-2 shadow-xl flex-shrink-0"
                  style={{ borderColor: leadingTeam.color }}
                >
                  <img src={leadingTeam.logoUrl} alt={leadingTeam.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Shield className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Leading Bidder
                </span>
                <h3 className="text-lg xl:text-xl font-black text-white tracking-tight uppercase">
                  {activeLot.currentLeaderName || 'No Bids Received Yet'}
                </h3>
                {activeLot.currentLeaderPaddle && (
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    Paddle #{activeLot.currentLeaderPaddle}
                  </span>
                )}
              </div>
            </div>

            {/* Circular Countdown Clock Ring */}
            <div className="sm:col-span-4 p-4 rounded-3xl bg-[#090e1c]/80 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={circleRadius} className="text-white/10 stroke-current" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    className={isLowTime ? 'text-red-500 stroke-current' : 'text-cyan-400 stroke-current'}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className={`text-2xl xl:text-3xl font-black ${isLowTime ? 'text-red-400 animate-bounce' : 'text-white'}`}>
                    {clock.remainingSeconds}s
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                    {clock.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
