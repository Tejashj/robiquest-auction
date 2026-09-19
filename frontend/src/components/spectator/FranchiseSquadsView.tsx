'use client';

/**
 * ============================================================================
 * FRANCHISE SQUADS & PICKED PLAYERS VIEW (SPECTATOR & SCOUTING HUD)
 * Dedicated browser for team purse standings, squad slots, and drafted talent
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  DollarSign,
  Trophy,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Table,
  Zap,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionTeamParticipant,
  AuctionLotItem,
} from '../../store/auction-engine-store';
import { ContenderDetailModal } from './ContenderDetailModal';

export const FranchiseSquadsView: React.FC = () => {
  const { teams, profile, lots } = useAuctionEngineStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [viewMode, setViewMode] = useState<'FOCUS' | 'ALL_MATRIX'>('FOCUS');
  const [inspectLot, setInspectLot] = useState<AuctionLotItem | null>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Helper to find full lot details for an acquired player
  const getLotDetails = (lotId: string, lotNumber: number) => {
    return (
      lots.find((l) => l.id === lotId || l.lotNumber === lotNumber) || {
        id: lotId,
        lotNumber,
        title: 'Drafted Contender',
        category: 'Sports Contender',
        startingBid: 0,
        reservePrice: 0,
        minIncrement: 0,
        currentHighBid: 0,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'SOLD' as const,
        imageUrls: [],
        attributes: {},
        bidsCount: 1,
      }
    );
  };

  if (teams.length === 0) {
    return (
      <div className="p-12 text-center rounded-[18px] bg-[#000000] border border-white/[0.08] text-white">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#16A085]" />
        <h3 className="text-base font-bold uppercase font-poppins">No Franchises Registered</h3>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Competing teams will appear here once registered for the tournament.
        </p>
      </div>
    );
  }

  // Calculate league aggregates
  const totalLeagueSpent = teams.reduce((acc, t) => acc + t.totalSpent, 0);
  const totalPlayersDrafted = teams.reduce((acc, t) => acc + (t.acquiredPlayers?.length || 0), 0);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 font-poppins selection:bg-[#16A085]/30">
      {/* Contender Detail Specs Modal */}
      <ContenderDetailModal
        lot={inspectLot}
        isOpen={!!inspectLot}
        onClose={() => setInspectLot(null)}
      />

      {/* =====================================================================
          TOP HEADER & VIEW TOGGLES
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[18px] bg-[#000000] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#16A085] uppercase tracking-widest">
              FRANCHISE ROSTERS & PURSES
            </span>
            <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono bg-white/[0.03] text-white border border-white/[0.08]">
              {teams.length} Franchises
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mt-1 font-poppins">
            Picked Players by Team
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Total Drafted: <strong className="text-white">{totalPlayersDrafted}</strong> • League Spend: <strong className="text-[#D8CFB4]">{formatAuctionCurrency(totalLeagueSpent, profile.currency)}</strong>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-[18px] bg-white/[0.03] border border-white/[0.08] self-start sm:self-center">
          <button
            onClick={() => setViewMode('FOCUS')}
            className={`px-3 py-1.5 rounded-[18px] text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
              viewMode === 'FOCUS'
                ? 'bg-[#16A085] text-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Franchise Dossier</span>
          </button>

          <button
            onClick={() => setViewMode('ALL_MATRIX')}
            className={`px-3 py-1.5 rounded-[18px] text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
              viewMode === 'ALL_MATRIX'
                ? 'bg-[#16A085] text-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>All Teams Grid</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          FRANCHISE SELECTOR CAROUSEL STRIP (FOR FOCUS VIEW)
          ===================================================================== */}
      {viewMode === 'FOCUS' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {teams.map((t) => {
            const isSelected = t.id === selectedTeam.id;
            const remainingPct = Math.max(
              0,
              Math.min(100, (t.remainingPurse / t.initialPurse) * 100)
            );

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`p-3.5 rounded-[18px] border text-left transition-all relative overflow-hidden bg-[#000000] flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#16A085] shadow-[0_0_15px_rgba(22,160,133,0.3)]'
                    : 'border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: t.color || '#16A085' }}
                />

                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-[12px] overflow-hidden border p-0.5 bg-black flex-shrink-0"
                    style={{ borderColor: t.color || '#16A085' }}
                  >
                    <img src={t.logoUrl} alt={t.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">
                      #{t.paddleNumber}
                    </span>
                    <span className="text-xs font-bold text-white uppercase truncate block font-poppins">
                      {t.shortCode || t.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-[11px] font-mono">
                    <span className="text-slate-400 text-[10px]">Purse:</span>
                    <span className="font-bold text-[#D8CFB4]">
                      {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-[18px] bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-[18px]"
                      style={{
                        width: `${remainingPct}%`,
                        backgroundColor: t.color || '#16A085',
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 text-right">
                    {t.acquiredPlayers?.length || 0} Drafted
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          VIEW MODE 1: FOCUS TEAM DOSSIER
          ===================================================================== */}
      {viewMode === 'FOCUS' && selectedTeam && (
        <div className="space-y-6">
          {/* Selected Franchise Master Dossier Card */}
          <div
            className="p-6 sm:p-8 rounded-[18px] bg-[#000000] border relative overflow-hidden transition-all shadow-xl"
            style={{ borderColor: selectedTeam.color || '#16A085' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Franchise Crest & Identity */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] overflow-hidden border p-1 bg-black flex-shrink-0"
                  style={{ borderColor: selectedTeam.color || '#16A085' }}
                >
                  <img
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-[18px] text-xs font-mono font-bold text-black"
                      style={{ backgroundColor: selectedTeam.color || '#16A085' }}
                    >
                      PADDLE #{selectedTeam.paddleNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-[18px] text-xs font-mono font-bold bg-white/[0.03] text-white border border-white/[0.08]">
                      {selectedTeam.shortCode}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight mt-1.5 font-poppins">
                    {selectedTeam.name}
                  </h3>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-center sm:text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Remaining Purse
                  </span>
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#D8CFB4] mt-0.5">
                    {formatAuctionCurrency(selectedTeam.remainingPurse, profile.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-center sm:text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Total Invested
                  </span>
                  <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                    {formatAuctionCurrency(selectedTeam.totalSpent, profile.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-center sm:text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Roster Size
                  </span>
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#16A085] mt-0.5">
                    {selectedTeam.acquiredPlayers?.length || 0} / {profile.maxSquadSize}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Capacity Progress Bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Purse Solvency:</span>
                <span className="text-[#D8CFB4] font-bold">
                  {((selectedTeam.remainingPurse / selectedTeam.initialPurse) * 100).toFixed(1)}% remaining
                </span>
              </div>
              <div className="w-full h-2.5 rounded-[18px] bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-[18px] transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (selectedTeam.remainingPurse / selectedTeam.initialPurse) * 100))}%`,
                    backgroundColor: selectedTeam.color || '#16A085',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Picked Players Grid for Selected Team */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 font-poppins">
                <ShieldCheck className="w-4 h-4 text-[#16A085]" />
                <span>Drafted Contenders Roster</span>
                <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                  {selectedTeam.acquiredPlayers?.length || 0} Picked
                </span>
              </h4>

              <span className="text-xs font-mono text-slate-400">
                Minimum Squad Target: <strong className="text-white">{profile.minSquadSize} Contenders</strong>
              </span>
            </div>

            {(!selectedTeam.acquiredPlayers || selectedTeam.acquiredPlayers.length === 0) ? (
              <div className="p-12 text-center rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-3">
                <div className="w-14 h-14 mx-auto rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white uppercase font-poppins">
                    No Contenders Drafted Yet
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm mx-auto">
                    {selectedTeam.name} has not made any winning bids yet. When their paddle wins live lots, their squad roster will populate here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTeam.acquiredPlayers.map((player) => {
                  const fullLot = getLotDetails(player.id, player.lotNumber);

                  return (
                    <div
                      key={player.id}
                      className="p-4 rounded-[18px] bg-[#000000] border border-white/[0.08] hover:border-white/[0.2] transition-all flex flex-col justify-between group shadow-md"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Player Photo */}
                        <div className="w-14 h-14 rounded-[14px] overflow-hidden border border-white/[0.08] bg-white/[0.03] flex-shrink-0 flex items-center justify-center">
                          {fullLot.imageUrls && fullLot.imageUrls[0] ? (
                            <img
                              src={fullLot.imageUrls[0]}
                              alt={player.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Zap className="w-6 h-6 text-[#16A085]" />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-[18px] text-[9px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                              LOT #{player.lotNumber}
                            </span>
                            {player.role && (
                              <span className="text-[10px] font-mono text-slate-400 uppercase truncate">
                                {player.role}
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-white uppercase truncate mt-1 font-poppins">
                            {player.title}
                          </h5>
                        </div>
                      </div>

                      {/* Pricing & Inspect Action */}
                      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase block">
                            Acquired At
                          </span>
                          <span className="text-sm font-mono font-bold text-[#D8CFB4]">
                            {formatAuctionCurrency(player.price, profile.currency)}
                          </span>
                        </div>

                        <button
                          onClick={() => setInspectLot(fullLot as AuctionLotItem)}
                          className="px-3 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-[#16A085] hover:text-white transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Specs</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW MODE 2: ALL TEAMS SIDE-BY-SIDE MATRIX
          ===================================================================== */}
      {viewMode === 'ALL_MATRIX' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-6 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4 shadow-lg"
              >
                {/* Team Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[14px] overflow-hidden border p-1 bg-black flex-shrink-0"
                      style={{ borderColor: team.color || '#16A085' }}
                    >
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded-[18px] text-[9px] font-mono font-bold text-black"
                          style={{ backgroundColor: team.color || '#16A085' }}
                        >
                          #{team.paddleNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{team.shortCode}</span>
                      </div>
                      <h4 className="text-base font-bold text-white uppercase truncate font-poppins">
                        {team.name}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Purse Left</span>
                    <div className="text-sm font-mono font-bold text-[#D8CFB4]">
                      {formatAuctionCurrency(team.remainingPurse, profile.currency)}
                    </div>
                  </div>
                </div>

                {/* Acquired List for this team */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>Drafted Squad ({team.acquiredPlayers?.length || 0}):</span>
                    <span>Slots: {team.acquiredPlayers?.length || 0}/{profile.maxSquadSize}</span>
                  </div>

                  {(!team.acquiredPlayers || team.acquiredPlayers.length === 0) ? (
                    <div className="p-4 text-center rounded-[18px] bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-500">
                      No contenders won yet
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {team.acquiredPlayers.map((p) => {
                        const full = getLotDetails(p.id, p.lotNumber);
                        return (
                          <div
                            key={p.id}
                            className="px-3.5 py-2 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="px-1.5 py-0.5 rounded-[18px] text-[9px] font-mono font-bold bg-[#16A085]/20 text-[#16A085]">
                                #{p.lotNumber}
                              </span>
                              <span className="font-medium text-white truncate font-poppins">
                                {p.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="font-mono font-bold text-[#D8CFB4]">
                                {formatAuctionCurrency(p.price, profile.currency)}
                              </span>
                              <button
                                onClick={() => setInspectLot(full as AuctionLotItem)}
                                className="p-1 rounded-[18px] hover:bg-white/[0.08] text-slate-400 hover:text-white"
                                title="View specs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseSquadsView;
