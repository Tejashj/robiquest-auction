'use client';

/**
 * ============================================================================
 * COMPETING TEAM PURSE & ROSTER LEADERBOARD (PROJECTOR VIEW)
 * Bound directly to User-Driven Store with Dynamic Currency & Solvency Bars
 * ============================================================================
 */

import React from 'react';
import { Users, DollarSign, Zap } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
} from '../../store/auction-engine-store';

export const TeamPurseLeaderboard: React.FC = () => {
  const { teams, profile, activeLotId, lots } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId);

  if (teams.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 rounded-3xl bg-[#060914] border border-white/10 text-xs">
        No competing teams registered. Add teams in the Team Manager space.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs xl:text-sm font-extrabold uppercase tracking-widest text-slate-300">
            RobiQuest Teams Purse Board ({teams.length} Teams)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Purse Cap: <strong className="text-white">{formatAuctionCurrency(profile.totalPurseCap, profile.currency)}</strong>
        </span>
      </div>

      <div className={`grid gap-3.5 ${
        teams.length <= 4
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {teams.map((team) => {
          const isLeading = activeLot?.currentLeaderId === team.id;
          const remainingPct = Math.max(0, Math.min(100, (team.remainingPurse / team.initialPurse) * 100));

          const getPurseBarColor = () => {
            if (remainingPct > 45) return 'from-emerald-500 to-emerald-400';
            if (remainingPct > 20) return 'from-amber-500 to-amber-400';
            return 'from-red-600 to-red-400';
          };

          return (
            <div
              key={team.id}
              className={`relative rounded-2xl p-4 border transition-all shadow-lg flex flex-col justify-between ${
                isLeading
                  ? 'bg-[#0a1226] ring-2 ring-cyan-400/40 shadow-cyan-950/40'
                  : 'bg-[#060914]/90 border-white/10'
              }`}
            >
              {isLeading && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 animate-pulse" />
              )}

              {/* Card Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden border flex-shrink-0"
                  style={{ borderColor: `${team.color}80` }}
                >
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                      style={{ backgroundColor: `${team.color}25`, color: team.color }}
                    >
                      {team.shortCode}
                    </span>
                    {isLeading && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500 text-black">
                        <Zap className="w-2.5 h-2.5 fill-black" />
                        LEADER
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{team.name}</h4>
                </div>
              </div>

              {/* Remaining Purse */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    Remaining
                  </span>
                  <span className="font-mono font-black text-sm text-white">
                    {formatAuctionCurrency(team.remainingPurse, profile.currency)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getPurseBarColor()} transition-all duration-500`}
                    style={{ width: `${remainingPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>Spent: {formatAuctionCurrency(team.totalSpent, profile.currency)}</span>
                  <span>{remainingPct.toFixed(0)}% Left</span>
                </div>
              </div>

              {/* Squad Slots */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  Roster:
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {team.squadCount} / {profile.maxSquadSize}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
