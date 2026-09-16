'use client';

/**
 * ============================================================================
 * HERO STAGE (4K STADIUM PROJECTOR VIEW)
 * High-Impact Sports Contender Draft Card:
 *  - High-res Contender Portrait with Neon Cyber-Hologram Frame
 *  - 4 Dynamic Sports Performance Meters (Power, Velocity, Armor, AI Compute)
 *  - Signature Special Weapon & Win Rate Badges
 *  - Oversized Spring Real-Time Bid Counter
 *  - Leading Franchise Crest & Animated Circular SVG Stage Clock
 * ============================================================================
 */

import React from 'react';
import {
  Gavel,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Trophy,
  Activity,
  Flame,
  Award,
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
      <div className="p-16 text-center text-slate-500 rounded-3xl bg-[#060914] border border-white/10">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
        <p className="text-lg font-bold text-white uppercase">Awaiting Next Lot On Stage</p>
        <p className="text-xs text-slate-400 mt-1">Official Auctioneer will summon the next contender shortly.</p>
      </div>
    );
  }

  const leadingTeam = teams.find((t) => t.id === activeLot.currentLeaderId);
  const stats = activeLot.contenderStats || {
    power: 88,
    velocity: 85,
    armor: 90,
    aiCompute: 85,
    specialty: 'High-Impact Kinetic Weapon',
    winRate: '90%',
  };

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
          color: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-300 shadow-cyan-500/30 font-black',
          icon: <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping mr-1" />,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="relative w-full rounded-[18px] bg-black border border-[#16A085]/30 p-6 xl:p-8 shadow-2xl overflow-hidden">
      {/* Dynamic Ambient Backlight matching Leading Team Color or Emerald Default */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: leadingTeam?.color || '#16A085' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-20 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: leadingTeam?.accentColor || '#D8CFB4' }}
      />

      {/* STAGE HEADER: STATUS BANNER & LOT IDENTIFIERS */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-[18px] text-xs xl:text-sm font-mono font-black bg-white/[0.03] text-[#D8CFB4] border border-[#16A085]/40 tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#16A085]" />
            LOT #{activeLot.lotNumber}
          </span>
          <span className="px-3.5 py-1.5 rounded-[18px] text-xs xl:text-sm font-bold uppercase tracking-wider bg-white/[0.03] text-gray-300 border border-white/10">
            {activeLot.category}
          </span>
          {activeLot.roleBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] text-xs font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#16A085]" />
              {activeLot.roleBadge}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-[18px] text-xs xl:text-sm font-black uppercase tracking-widest border shadow-xl ${badge.color}`}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      </div>

      {/* CENTER GRID: SPORTS CONTENDER CARD + MEGA COUNTER */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch pt-6">
        {/* LEFT: LOT PORTRAIT & SPORTS ATTRIBUTES (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-[18px] overflow-hidden bg-black border-2 border-[#16A085]/40 shadow-2xl group">
            <img
              src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}
              alt={activeLot.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

            {/* Overlaid Title & Category */}
            <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-[18px] bg-black/85 backdrop-blur-xl border border-white/15">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#16A085] uppercase tracking-widest mb-0.5">
                <span>ROBIQUEST CONTENDER #{activeLot.lotNumber}</span>
                {stats.winRate && (
                  <span className="text-[#D8CFB4] font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#16A085]" />
                    {stats.winRate} Win
                  </span>
                )}
              </div>
              <h2 className="text-lg xl:text-xl font-black text-[#D8CFB4] tracking-tight uppercase truncate font-poppins">
                {activeLot.title}
              </h2>
            </div>
          </div>

          {/* Sports Performance Radar / Rating Bars */}
          <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[#16A085]">
                <Activity className="w-3.5 h-3.5" />
                Performance Telemetry
              </span>
              {stats.specialty && (
                <span className="text-gray-300 font-normal truncate max-w-[200px]">
                  {stats.specialty}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {/* Power */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-1">
                  <span>⚡ Power / Torque</span>
                  <strong className="text-[#16A085]">{stats.power}/100</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16A085] transition-all duration-500"
                    style={{ width: `${stats.power}%` }}
                  />
                </div>
              </div>

              {/* Velocity */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-1">
                  <span>🚀 Agility / Speed</span>
                  <strong className="text-[#16A085]">{stats.velocity}/100</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16A085] transition-all duration-500"
                    style={{ width: `${stats.velocity}%` }}
                  />
                </div>
              </div>

              {/* Armor */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-1">
                  <span>🛡️ Durability / Armor</span>
                  <strong className="text-[#D8CFB4]">{stats.armor}/100</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D8CFB4] transition-all duration-500"
                    style={{ width: `${stats.armor}%` }}
                  />
                </div>
              </div>

              {/* AI IQ */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-1">
                  <span>🧠 AI / SLAM IQ</span>
                  <strong className="text-[#16A085]">{stats.aiCompute}/100</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16A085] transition-all duration-500"
                    style={{ width: `${stats.aiCompute}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: MEGA SPRING BID COUNTER & LEADING FRANCHISE (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          {/* Highest Bid Showcase */}
          <div className="p-6 xl:p-8 rounded-[18px] bg-white/[0.03] border border-[#16A085]/30 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs xl:text-sm uppercase font-mono font-black tracking-widest text-[#16A085] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16A085]" />
                Current Highest Bid
              </span>
              <span className="text-xs font-mono text-gray-400">
                Opening Base: <strong className="text-white">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</strong>
              </span>
            </div>

            {/* Oversized Bid Display */}
            <div className="text-5xl sm:text-6xl xl:text-7xl font-black font-mono tracking-tight text-[#D8CFB4]">
              {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs xl:text-sm">
              <span className="text-gray-400 font-mono">Minimum Next Increment:</span>
              <span className="font-mono font-black text-[#16A085]">
                +{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}
              </span>
            </div>
          </div>

          {/* LEADING TEAM BADGE & CIRCULAR STAGE CLOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Leading Bidder Card */}
            <div
              className="sm:col-span-8 p-5 rounded-[18px] border transition-all flex items-center gap-4 relative overflow-hidden shadow-xl"
              style={{
                backgroundColor: leadingTeam ? `${leadingTeam.color}20` : '#000000',
                borderColor: leadingTeam ? leadingTeam.color : 'rgba(255,255,255,0.1)',
                boxShadow: leadingTeam ? `0 0 25px ${leadingTeam.color}30` : undefined,
              }}
            >
              {leadingTeam ? (
                <div
                  className="w-14 h-14 xl:w-16 xl:h-16 rounded-[18px] overflow-hidden border-2 shadow-xl flex-shrink-0 bg-black p-1"
                  style={{ borderColor: leadingTeam.color }}
                >
                  <img src={leadingTeam.logoUrl} alt={leadingTeam.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-[18px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400">
                  <Shield className="w-6 h-6" />
                </div>
              )}

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-gray-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#16A085]" />
                    Leading Franchise
                  </span>
                  {leadingTeam && (
                    <span
                      className="text-xs font-mono font-black px-2 py-0.2 rounded-[18px]"
                      style={{ backgroundColor: `${leadingTeam.color}30`, color: leadingTeam.accentColor }}
                    >
                      PADDLE #{leadingTeam.paddleNumber}
                    </span>
                  )}
                </div>

                <h3 className="text-lg xl:text-xl font-black text-white tracking-tight uppercase mt-1 truncate font-poppins">
                  {activeLot.currentLeaderName || 'Awaiting Floor Bid'}
                </h3>
              </div>
            </div>

            {/* Circular Countdown Clock */}
            <div className="sm:col-span-4 p-4 rounded-[18px] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center relative shadow-xl">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={circleRadius} className="text-white/10 stroke-current" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    className={isLowTime ? 'text-red-500 stroke-current animate-pulse' : 'text-[#16A085] stroke-current'}
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
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
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
