'use client';

/**
 * ============================================================================
 * TEAM & BIDDER ROSTER MANAGER (USER-DRIVEN CRUD)
 * Add, Edit, Delete Participating Teams/Bidders, Custom Budgets & Solvency Checks
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Lock,
  Unlock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Shield,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  AuctionTeamParticipant,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const TeamRosterManager: React.FC = () => {
  const {
    teams,
    addTeam,
    deleteTeam,
    adjustTeamPurse,
    toggleTeamFreeze,
    profile,
    activeBidderTeamId,
    setActiveBidderTeam,
  } = useAuctionEngineStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeamForAdjustment, setSelectedTeamForAdjustment] =
    useState<AuctionTeamParticipant | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('5000000');

  // New team form state
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [paddleNumber, setPaddleNumber] = useState(teams.length + 101);
  const [color, setColor] = useState('#06b6d4');
  const [initialPurse, setInitialPurse] = useState(profile.totalPurseCap || 100000000);
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  );

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({
      name,
      shortCode: shortCode || name.substring(0, 3).toUpperCase(),
      paddleNumber: Number(paddleNumber),
      color,
      accentColor: color,
      logoUrl,
      initialPurse: Number(initialPurse),
    });

    setName('');
    setShortCode('');
    setPaddleNumber(teams.length + 102);
    setIsAddModalOpen(false);
  };

  const handleAdjustPurse = (isDeduction: boolean) => {
    if (!selectedTeamForAdjustment) return;
    const amt = parseFloat(adjustmentAmount);
    if (!isNaN(amt) && amt > 0) {
      adjustTeamPurse(selectedTeamForAdjustment.id, amt, isDeduction);
    }
    setSelectedTeamForAdjustment(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#080d19] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Users className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                PARTICIPANT ROSTER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300">
                {teams.length} REGISTERED FRANCHISES
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Team & Bidder Account Management
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Custom Franchise
        </button>
      </div>

      {/* Teams Grid Table */}
      {teams.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center space-y-4 bg-black/20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-white">No Competing Teams Registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add custom participating franchises or bidders with starting budgets to place bids during the live auction.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Add First Franchise
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#060914] shadow-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-black/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Franchise & Paddle</th>
                <th className="p-4">Remaining Purse</th>
                <th className="p-4">Spent / Total</th>
                <th className="p-4">Squad / Slots</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.map((team) => {
                const isActiveBidder = team.id === activeBidderTeamId;
                const unfilledSlots = Math.max(0, profile.minSquadSize - team.squadCount);
                const reserveFloor = unfilledSlots * profile.lowestBasePrice;
                const isSolvent = team.remainingPurse >= reserveFloor;

                return (
                  <tr
                    key={team.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isActiveBidder ? 'bg-purple-500/[0.04]' : ''
                    }`}
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0"
                        style={{ borderColor: team.color }}
                      >
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">{team.name}</span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                            style={{ backgroundColor: `${team.color}25`, color: team.color }}
                          >
                            {team.shortCode}
                          </span>
                          {isActiveBidder && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-black">
                              ACTIVE PADDLE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Paddle #{team.paddleNumber}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-sm text-emerald-400">
                      {formatAuctionCurrency(team.remainingPurse, profile.currency)}
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      <div>{formatAuctionCurrency(team.totalSpent, profile.currency)} Spent</div>
                      <div className="text-[10px] text-slate-400">
                        of {formatAuctionCurrency(team.initialPurse, profile.currency)}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-200">
                      <div>{team.squadCount} / {profile.maxSquadSize} Players</div>
                      <div className="text-[10px] text-amber-300">
                        {unfilledSlots} to min quota
                      </div>
                    </td>

                    <td className="p-4">
                      {team.isFrozen ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          <Lock className="w-3 h-3 text-red-400" /> FROZEN
                        </span>
                      ) : isSolvent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SOLVENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> FLOOR DEFICIT
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {!isActiveBidder && (
                        <button
                          onClick={() => setActiveBidderTeam(team.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold"
                        >
                          Select as Bidder
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTeamForAdjustment(team)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold"
                      >
                        Adjust Purse
                      </button>

                      <button
                        onClick={() => toggleTeamFreeze(team.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          team.isFrozen
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                        title={team.isFrozen ? 'Unfreeze Bidding' : 'Freeze Bidding'}
                      >
                        {team.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#090d19] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Add New Competing Franchise
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Franchise / Bidder Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mumbai Titans or Private Trust"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Short Code</label>
                  <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MT"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Paddle #</label>
                  <input
                    type="number"
                    value={paddleNumber}
                    onChange={(e) => setPaddleNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Starting Budget</label>
                  <input
                    type="number"
                    value={initialPurse}
                    onChange={(e) => setInitialPurse(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Primary Brand Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-slate-300">{color}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Purse Modal */}
      {selectedTeamForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#090d19] border border-white/15 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              Adjust Purse: {selectedTeamForAdjustment.name}
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Adjustment Amount</label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTeamForAdjustment(null)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdjustPurse(false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40"
              >
                + Credit
              </button>
              <button
                onClick={() => handleAdjustPurse(true)}
                className="px-3 py-1.5 rounded-xl bg-red-600/30 text-red-300 text-xs font-bold border border-red-500/40"
              >
                - Deduct
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
