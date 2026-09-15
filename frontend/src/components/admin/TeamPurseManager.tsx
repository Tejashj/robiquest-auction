'use client';

/**
 * ============================================================================
 * TEAM & PURSE MANAGER (SPACE 2: FRANCHISE LIQUIDITY & GOVERNANCE)
 * Real-Time Mathematical Solvency Matrix, Purse Penalties & Freeze Overrides
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useSpectatorStore, CompetingTeam } from '../../store/spectator-store';

export const TeamPurseManager: React.FC = () => {
  const { competingTeams } = useSpectatorStore();
  const [teams, setTeams] = useState<CompetingTeam[]>(competingTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamForPenalty, setSelectedTeamForPenalty] = useState<CompetingTeam | null>(null);
  const [penaltyAmountCr, setPenaltyAmountCr] = useState<string>('5.00');
  const [penaltyReason, setPenaltyReason] = useState<string>('Breach of slow-bid ceiling protocol');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Invariant config
  const minSquadSize = 18;
  const lowestBasePrice = 3000000; // ₹30 Lakhs

  const triggerMessage = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleToggleFreeze = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const nextState = !t.isLeading; // Toggle freeze simulation
        triggerMessage(
          nextState
            ? `Bidding rights FROZEN for ${t.name}!`
            : `Bidding rights RESTORED for ${t.name}!`
        );
        return { ...t, isLeading: nextState };
      })
    );
  };

  const handleApplyPurseAdjustment = (isDeduction: boolean) => {
    if (!selectedTeamForPenalty) return;

    const adjustmentAmount = parseFloat(penaltyAmountCr) * 10000000;
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) return;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeamForPenalty.id) return t;
        const newPurse = isDeduction
          ? Math.max(0, t.remainingPurse - adjustmentAmount)
          : t.remainingPurse + adjustmentAmount;

        triggerMessage(
          `Purse ${isDeduction ? 'Penalized' : 'Credited'} by ₹${penaltyAmountCr} Cr for ${t.name}. Reason: ${penaltyReason}`
        );

        return {
          ...t,
          remainingPurse: newPurse,
          totalSpent: isDeduction ? t.totalSpent + adjustmentAmount : t.totalSpent - adjustmentAmount,
        };
      })
    );

    setSelectedTeamForPenalty(null);
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Toast Banner */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{actionSuccessMessage}</span>
          </div>
          <span className="text-[10px] opacity-75">REAL-TIME DB SYNC</span>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#080d19] border border-white/10 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Franchise Liquidity, Handicap & Solvency Monitor
          </h3>
          <p className="text-xs text-slate-400">
            Real-time verification matrix testing: Remaining Purse ≥ (Min Squad - Count) × Lowest Base
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by franchise..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Teams Grid Table */}
      <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#060914] shadow-2xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-black/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
            <tr>
              <th className="p-4">Franchise</th>
              <th className="p-4">Purse Remaining</th>
              <th className="p-4">Spent / Total</th>
              <th className="p-4">Squad Slots</th>
              <th className="p-4">Solvency Status</th>
              <th className="p-4 text-right">Quick Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTeams.map((team) => {
              const unfilledMandatory = Math.max(0, minSquadSize - team.squadCount);
              const mandatoryReserveNeeded = unfilledMandatory * lowestBasePrice;
              const isSolvent = team.remainingPurse >= mandatoryReserveNeeded;

              return (
                <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Franchise Info */}
                  <td className="p-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl overflow-hidden border flex-shrink-0"
                      style={{ borderColor: team.color }}
                    >
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{team.name}</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                          style={{ backgroundColor: `${team.color}25`, color: team.accentColor }}
                        >
                          {team.shortCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Primary Color: {team.color}
                      </span>
                    </div>
                  </td>

                  {/* Purse Remaining */}
                  <td className="p-4 font-mono font-bold text-sm text-emerald-400">
                    ₹{(team.remainingPurse / 10000000).toFixed(2)} Cr
                  </td>

                  {/* Spent / Total */}
                  <td className="p-4 font-mono text-slate-300">
                    <div>₹{(team.totalSpent / 10000000).toFixed(2)} Cr Spent</div>
                    <div className="text-[10px] text-slate-400">
                      of ₹{(team.initialPurse / 10000000).toFixed(2)} Cr
                    </div>
                  </td>

                  {/* Squad Slots */}
                  <td className="p-4 font-mono text-slate-200">
                    <div>{team.squadCount} / {team.maxSquadSlots} Players</div>
                    <div className="text-[10px] text-amber-300">
                      Need {unfilledMandatory} more for min roster
                    </div>
                  </td>

                  {/* Solvency Status */}
                  <td className="p-4">
                    {isSolvent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        SOLVENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        INSOLVENT FLOOR
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedTeamForPenalty(team)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-colors"
                    >
                      Purse Adjust +/-
                    </button>

                    <button
                      onClick={() => handleToggleFreeze(team.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors"
                    >
                      Freeze Bidding
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Purse Adjustment Modal */}
      {selectedTeamForPenalty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#090d19] border border-white/15 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Adjust Purse: {selectedTeamForPenalty.name}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Adjustment Amount (₹ Crores)
              </label>
              <input
                type="number"
                value={penaltyAmountCr}
                onChange={(e) => setPenaltyAmountCr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Administrative Audit Reason
              </label>
              <textarea
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTeamForPenalty(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyPurseAdjustment(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
              >
                + Credit Purse
              </button>
              <button
                onClick={() => handleApplyPurseAdjustment(true)}
                className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-bold"
              >
                - Penalize / Deduct
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
