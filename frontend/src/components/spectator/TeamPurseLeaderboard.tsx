'use client';

/**
 * ============================================================================
 * COMPETING TEAM PURSE & ROSTER LEADERBOARD (PROJECTOR VIEW)
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Fills & Borders: rgba(255, 255, 255, 0.03) / rgba(255, 255, 255, 0.08)
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useState } from 'react';
import { Users, DollarSign, Zap, Trophy, ChevronRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
} from '../../store/auction-engine-store';

export const TeamPurseLeaderboard: React.FC = () => {
  const { teams, profile, activeLotId, lots } = useAuctionEngineStore();
  const [inspectTeam, setInspectTeam] = useState<AuctionTeamParticipant | null>(null);

  const activeLot = lots.find((l) => l.id === activeLotId);

  if (teams.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 rounded-[18px] bg-[#000000] border border-white/[0.08] text-xs font-mono">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#16A085] opacity-60" />
        No competing teams registered. Add teams via Franchise Studio.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between px-1.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs xl:text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span>Franchise Standings</span>
            <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono bg-white/[0.03] text-[#16A085] border border-white/[0.08]">
              {teams.length} Teams
            </span>
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-300 bg-white/[0.03] px-3 py-1 rounded-[18px] border border-white/[0.08]">
          Cap: <strong className="text-[#D8CFB4] font-bold">{formatAuctionCurrency(profile.totalPurseCap, profile.currency)}</strong>
        </span>
      </div>

      {/* Grid of Teams */}
      <div
        className={`grid gap-4 ${
          teams.length <= 4
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {teams.map((team) => {
          const isLeading = activeLot?.currentLeaderId === team.id;
          const remainingPct = Math.max(
            0,
            Math.min(100, (team.remainingPurse / team.initialPurse) * 100)
          );

          return (
            <div
              key={team.id}
              onClick={() => setInspectTeam(team)}
              className={`relative rounded-[18px] p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer group overflow-hidden bg-[#000000] ${
                isLeading
                  ? 'border-[#16A085] shadow-[0_0_20px_rgba(22,160,133,0.3)]'
                  : 'border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              {/* Top team accent indicator */}
              <div
                className="absolute top-0 right-0 left-0 h-1 transition-all"
                style={{ backgroundColor: team.color || '#16A085' }}
              />

              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-[18px] overflow-hidden border flex-shrink-0 bg-black p-1"
                  style={{ borderColor: team.color || '#16A085' }}
                >
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold border"
                      style={{
                        backgroundColor: `${team.color || '#16A085'}20`,
                        color: '#ffffff',
                        borderColor: team.color || '#16A085',
                      }}
                    >
                      {team.shortCode}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">
                      #{team.paddleNumber}
                    </span>
                    {isLeading && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[18px] text-[9px] font-mono font-bold bg-[#16A085] text-black">
                        <Zap className="w-2.5 h-2.5 fill-black" />
                        LEADER
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-1">
                    {team.name}
                  </h4>
                </div>
              </div>

              {/* Remaining Purse */}
              <div className="space-y-2 mb-3.5 bg-white/[0.03] p-3 rounded-[18px] border border-white/[0.08]">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    Remaining Purse
                  </span>
                  <span className="font-mono font-bold text-base text-[#D8CFB4]">
                    {formatAuctionCurrency(team.remainingPurse, profile.currency)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-[18px] bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-[18px] transition-all duration-500"
                    style={{
                      width: `${remainingPct}%`,
                      backgroundColor: team.color || '#16A085',
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>Spent: <strong className="text-white">{formatAuctionCurrency(team.totalSpent, profile.currency)}</strong></span>
                  <span>{remainingPct.toFixed(0)}% Left</span>
                </div>
              </div>

              {/* Squad Slots & View Acquired Trigger */}
              <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#16A085]" />
                  Roster: <strong className="text-white">{team.squadCount || team.acquiredPlayers?.length || 0}</strong> / {profile.maxSquadSize}
                </span>

                <span className="text-[11px] font-bold text-[#16A085] group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                  Roster <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Acquired Roster Inspect Modal */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-[18px] bg-[#000000] border border-white/[0.08] p-6 sm:p-8 text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-[18px] overflow-hidden border bg-black p-1"
                  style={{ borderColor: inspectTeam.color || '#16A085' }}
                >
                  <img src={inspectTeam.logoUrl} alt={inspectTeam.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-poppins">
                    {inspectTeam.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Remaining: <strong className="text-[#D8CFB4]">{formatAuctionCurrency(inspectTeam.remainingPurse, profile.currency)}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectTeam(null)}
                className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A085]" />
                Acquired Contenders ({inspectTeam.acquiredPlayers?.length || 0})
              </h4>
              {(!inspectTeam.acquiredPlayers || inspectTeam.acquiredPlayers.length === 0) ? (
                <div className="p-8 text-center text-slate-500 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
                  No lots acquired by {inspectTeam.name} yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1.5">
                  {inspectTeam.acquiredPlayers.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                          LOT #{item.lotNumber}
                        </span>
                        <span className="text-xs font-bold text-white uppercase font-poppins">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#D8CFB4]">
                        {formatAuctionCurrency(item.price, profile.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPurseLeaderboard;
