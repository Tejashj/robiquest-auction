'use client';

/**
 * ============================================================================
 * HERO STAGE (STADIUM VIEW)
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c, Glow: rgba(22, 160, 133, 0.35))
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Fills & Borders: rgba(255, 255, 255, 0.03) / rgba(255, 255, 255, 0.08)
 *  - Border Radius: 18px everywhere
 *  - Font: Poppins
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
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
import { InteractiveBiddingPaddle } from './InteractiveBiddingPaddle';
import { GavelHammerStrike } from './GavelHammerStrike';

export const HeroStage: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    clock,
    triggerManualPaddlePreview,
    isAutoAuctioneer,
    autoAdvanceCountdown,
    advanceToNextLot,
  } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  if (!activeLot) {
    return (
      <div className="p-16 text-center text-slate-400 rounded-[18px] bg-[#000000] border border-white/[0.08]">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#16A085]" />
        <p className="text-xl font-bold text-white uppercase tracking-wide">
          Awaiting Next Contender On Stage
        </p>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Tournament Official will summon the next lot to the center floor.
        </p>
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
    if (activeLot.status === 'SOLD') {
      return {
        text: `HAMMER SOLD • ${activeLot.currentLeaderName?.toUpperCase() || 'HIGH BIDDER'}`,
        color: 'bg-[#16A085] text-black border border-[#1abc9c] font-bold',
        icon: <Trophy className="w-4 h-4 fill-black text-black" />,
      };
    }
    if (activeLot.status === 'PASSED') {
      return {
        text: 'UNSOLD • BELOW RESERVE FLOOR',
        color: 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold',
        icon: <AlertOctagon className="w-4 h-4" />,
      };
    }
    if (clock.status === 'RUNNING' && clock.remainingSeconds <= 5 && clock.remainingSeconds > 0) {
      return {
        text: 'FINAL WARNING • GOING TWICE...',
        color: 'bg-[#D8CFB4] text-black border border-[#D8CFB4] font-bold animate-pulse',
        icon: <Gavel className="w-4 h-4 fill-black stroke-black" />,
      };
    }
    if (clock.status === 'RUNNING' && clock.remainingSeconds <= 10 && clock.remainingSeconds > 5) {
      return {
        text: 'FAIR WARNING • GOING ONCE...',
        color: 'bg-[#D8CFB4] text-black border border-[#D8CFB4] font-bold',
        icon: <Gavel className="w-4 h-4 fill-black stroke-black" />,
      };
    }
    if (activeLot.status === 'FAIR_WARNING') {
      return {
        text: 'FAIR WARNING • GOING ONCE...',
        color: 'bg-[#D8CFB4] text-black border border-[#D8CFB4] font-bold',
        icon: <Gavel className="w-4 h-4 fill-black stroke-black" />,
      };
    }
    return {
      text: isAutoAuctioneer ? 'AUTOMATIC GAVEL ACTIVE' : 'LIVE FLOOR IN PLAY',
      color: 'bg-[#16A085] text-black border border-[#1abc9c] font-bold',
      icon: <span className="w-2 h-2 rounded-full bg-black animate-ping mr-1" />,
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="relative w-full rounded-[18px] bg-[#000000] border border-white/[0.08] p-6 xl:p-8 overflow-hidden active-stage-glow">
      {/* Ambient Backlight matching #16A085 */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ backgroundColor: leadingTeam?.color || '#16A085' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ backgroundColor: '#D8CFB4' }}
      />

      {/* STAGE HEADER: STATUS BANNER & LOT IDENTIFIERS */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-1.5 rounded-[18px] text-xs xl:text-sm font-mono font-bold bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/40 tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#16A085]" />
            LOT #{activeLot.lotNumber}
          </span>
          <span className="px-4 py-1.5 rounded-[18px] text-xs xl:text-sm font-semibold uppercase tracking-wider bg-white/[0.03] text-white border border-white/[0.08]">
            {activeLot.category}
          </span>
          {activeLot.roleBadge && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] text-xs font-mono font-bold bg-[#D8CFB4]/15 text-[#D8CFB4] border border-[#D8CFB4]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#D8CFB4]" />
              {activeLot.roleBadge}
            </span>
          )}
        </div>

        {/* Status Badge & Interactive Paddle Preview */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerManualPaddlePreview()}
            className="px-3.5 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.12] text-[#D8CFB4] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Preview Physical Bidding Paddle Up & Down Animation"
          >
            <Shield className="w-3.5 h-3.5 text-[#16A085]" />
            <span>Raise Paddle Demo</span>
          </button>

          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-xs xl:text-sm uppercase tracking-widest ${badge.color}`}
          >
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        </div>
      </div>

      {/* AUTONOMOUS SOFTWARE ENGINE: AUTOMATIC PROGRESSION BAR */}
      {autoAdvanceCountdown !== null && (
        <div className="relative z-20 mt-4 p-4 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A085] animate-ping" />
            <span className="text-xs sm:text-sm font-mono text-white">
              Software Engine Summoning Next Contender in <strong className="text-[#D8CFB4] text-base font-bold">{autoAdvanceCountdown}s</strong>...
            </span>
          </div>

          <button
            onClick={advanceToNextLot}
            className="px-4 py-1.5 rounded-[14px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all"
          >
            Summon Next Contender Now →
          </button>
        </div>
      )}

      {/* CENTER GRID: LOT CARD + MEGA COUNTER */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch pt-6">
        {/* LEFT: LOT PORTRAIT & ATTRIBUTES (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-[18px] overflow-hidden bg-[#000000] border border-white/[0.08] group">
            <img
              src={activeLot.imageUrls[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}
              alt={activeLot.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95" />

            {/* DRAMATIC OFFICIAL STAMPS ON CONTENDER CARD */}
            {activeLot.status === 'SOLD' && (
              <motion.div
                initial={{ scale: 3, rotate: -35, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                className="absolute inset-0 m-auto w-48 h-24 border-4 border-[#16A085] rounded-[14px] bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center shadow-[0_0_35px_rgba(22,160,133,0.85)] z-20 pointer-events-none"
              >
                <span className="text-[9px] font-mono tracking-widest font-black text-[#D8CFB4] uppercase">
                  OFFICIAL ADJUDICATION
                </span>
                <span className="text-3xl font-black font-mono tracking-tighter text-[#16A085] uppercase">
                  SOLD!
                </span>
                <span className="text-[9px] font-mono tracking-wider text-emerald-300 uppercase font-bold truncate max-w-[170px]">
                  {activeLot.currentLeaderName || 'CLAIMED'}
                </span>
              </motion.div>
            )}

            {activeLot.status === 'PASSED' && (
              <motion.div
                initial={{ scale: 3, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                className="absolute inset-0 m-auto w-48 h-24 border-4 border-red-600 rounded-[14px] bg-red-950/90 backdrop-blur-xs flex flex-col items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.85)] z-20 pointer-events-none"
              >
                <span className="text-[9px] font-mono tracking-widest font-black text-red-400 uppercase">
                  RESERVE UNMET
                </span>
                <span className="text-3xl font-black font-mono tracking-tighter text-red-500 uppercase">
                  UNSOLD
                </span>
                <span className="text-[8px] font-mono tracking-wider text-red-300 uppercase font-bold">
                  PASSED TO ACCELERATED
                </span>
              </motion.div>
            )}

            {/* Overlaid Title & Category */}
            <div className="absolute bottom-3 left-3 right-3 p-4 rounded-[18px] bg-black/90 border border-white/[0.08] z-10">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#16A085] uppercase tracking-widest mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A085] animate-ping" />
                  CONTENDER #{activeLot.lotNumber}
                </span>
                {stats.winRate && (
                  <span className="text-[#D8CFB4] font-bold flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-[18px] border border-white/[0.08]">
                    <Award className="w-3.5 h-3.5 text-[#D8CFB4]" />
                    {stats.winRate} Rating
                  </span>
                )}
              </div>
              <h2 className="text-lg xl:text-xl font-bold text-white tracking-tight uppercase truncate font-poppins">
                {activeLot.title}
              </h2>
            </div>
          </div>

          {/* Performance Telemetry */}
          <div className="p-4.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[#16A085]">
                <Activity className="w-3.5 h-3.5" />
                Performance Telemetry
              </span>
              {stats.specialty && (
                <span className="text-[#D8CFB4] font-medium truncate max-w-[200px]">
                  {stats.specialty}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {/* Power */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>Power / Torque</span>
                  <strong className="text-[#16A085]">{stats.power}/100</strong>
                </div>
                <div className="w-full h-2 rounded-[18px] bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-[18px] bg-[#16A085] transition-all duration-500"
                    style={{ width: `${stats.power}%` }}
                  />
                </div>
              </div>

              {/* Velocity */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>Agility / Speed</span>
                  <strong className="text-[#1abc9c]">{stats.velocity}/100</strong>
                </div>
                <div className="w-full h-2 rounded-[18px] bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-[18px] bg-[#1abc9c] transition-all duration-500"
                    style={{ width: `${stats.velocity}%` }}
                  />
                </div>
              </div>

              {/* Armor */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>Durability / Armor</span>
                  <strong className="text-[#D8CFB4]">{stats.armor}/100</strong>
                </div>
                <div className="w-full h-2 rounded-[18px] bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-[18px] bg-[#D8CFB4] transition-all duration-500"
                    style={{ width: `${stats.armor}%` }}
                  />
                </div>
              </div>

              {/* AI Compute */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span>AI / SLAM IQ</span>
                  <strong className="text-[#16A085]">{stats.aiCompute}/100</strong>
                </div>
                <div className="w-full h-2 rounded-[18px] bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-[18px] bg-[#16A085] transition-all duration-500"
                    style={{ width: `${stats.aiCompute}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: MEGA COUNTER & LEADING FRANCHISE (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          {/* Highest Bid Showcase */}
          <div className="p-6 xl:p-8 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs xl:text-sm uppercase font-mono font-bold tracking-widest text-[#16A085] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16A085]" />
                Current Highest Floor Bid
              </span>
              <span className="text-xs font-mono text-slate-300 bg-white/[0.03] px-3 py-1 rounded-[18px] border border-white/[0.08]">
                Base: <strong className="text-white">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</strong>
              </span>
            </div>

            {/* Oversized Bid Display in headlineAccent #D8CFB4 */}
            <div className="text-6xl sm:text-7xl xl:text-8xl font-black font-mono tracking-tight text-[#D8CFB4] py-2">
              {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs xl:text-sm">
              <span className="text-slate-300 font-mono">Minimum Next Floor Step:</span>
              <span className="font-mono font-bold text-[#16A085] px-3 py-1 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                +{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}
              </span>
            </div>
          </div>

          {/* LEADING TEAM BADGE & CIRCULAR CLOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Leading Bidder Card */}
            <div
              className="sm:col-span-8 p-5 rounded-[18px] border border-white/[0.08] bg-[#000000] flex items-center gap-4 relative overflow-hidden"
              style={{
                borderColor: leadingTeam ? leadingTeam.color : 'rgba(255,255,255,0.08)',
              }}
            >
              {leadingTeam ? (
                <div
                  className="w-16 h-16 rounded-[18px] overflow-hidden border p-1 bg-black flex-shrink-0"
                  style={{ borderColor: leadingTeam.color }}
                >
                  <img src={leadingTeam.logoUrl} alt={leadingTeam.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <Shield className="w-6 h-6" />
                </div>
              )}

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-[#16A085] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#16A085]" />
                    Leading Franchise
                  </span>
                  {leadingTeam && (
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-[18px]"
                      style={{ backgroundColor: `${leadingTeam.color}30`, color: '#ffffff', border: `1px solid ${leadingTeam.color}` }}
                    >
                      #{leadingTeam.paddleNumber}
                    </span>
                  )}
                </div>

                <h3 className="text-xl xl:text-2xl font-bold text-white tracking-tight uppercase mt-1 truncate font-poppins">
                  {activeLot.currentLeaderName || 'Awaiting Floor Bid'}
                </h3>
              </div>
            </div>

            {/* Circular Stage Countdown Clock */}
            <div className="sm:col-span-4 p-4 rounded-[18px] bg-[#000000] border border-white/[0.08] flex flex-col items-center justify-center relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={circleRadius} className="text-white/[0.08] stroke-current" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    className={
                      isLowTime
                        ? 'text-[#D8CFB4] stroke-current animate-pulse'
                        : clock.status === 'RUNNING'
                        ? 'text-[#16A085] stroke-current'
                        : 'text-slate-500 stroke-current'
                    }
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className={`text-2xl xl:text-3xl font-bold ${isLowTime ? 'text-[#D8CFB4]' : 'text-white'}`}>
                    {clock.remainingSeconds}s
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                    {clock.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Bidding Paddle and Gavel Strikes */}
      <InteractiveBiddingPaddle position="bottom-right" />
      <GavelHammerStrike />
    </div>
  );
};

export default HeroStage;
