'use client';

/**
 * ============================================================================
 * MASTER AUCTIONEER ADMIN & TOURNAMENT GOVERNANCE PANEL
 * Unites Space 1 (Squad Governance), Space 2 (Purse Manager), Space 3 (Hammer Override)
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Scale,
  Users,
  Gavel,
  Shield,
  Layers,
  ArrowUpDown,
  Settings2,
  Tv,
  X,
  Sparkles,
} from 'lucide-react';
import { SquadRuleGovernanceForm } from './SquadRuleGovernanceForm';
import { TeamPurseManager } from './TeamPurseManager';
import { LiveAuctioneerControlBar } from './LiveAuctioneerControlBar';

export interface AdminGovernancePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminGovernancePanel: React.FC<AdminGovernancePanelProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'GOVERNANCE' | 'PURSE_MANAGER' | 'HAMMER_OVERRIDE'>('HAMMER_OVERRIDE');
  const [currentRole, setCurrentRole] = useState<'SUPERADMIN' | 'TOURNAMENT_DIRECTOR' | 'HAMMER_OFFICIAL'>('TOURNAMENT_DIRECTOR');

  // Queue re-indexing state for Space 3
  const [queueLots, setQueueLots] = useState([
    { id: '102', lotNumber: 19, name: 'Mitchell Starc', category: 'Fast Bowler', base: '₹2.00 Cr', priority: 'NORMAL' },
    { id: '103', lotNumber: 20, name: 'Rishabh Pant', category: 'Wicketkeeper / Captain', base: '₹2.00 Cr', priority: 'HIGH' },
    { id: '104', lotNumber: 21, name: 'Rashid Khan', category: 'Leg Spinner', base: '₹2.00 Cr', priority: 'NORMAL' },
    { id: '105', lotNumber: 22, name: 'Travis Head', category: 'Explosive Opener', base: '₹2.00 Cr', priority: 'NORMAL' },
  ]);

  const handleBumpPriority = (index: number) => {
    if (index === 0) return;
    const updated = [...queueLots];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    setQueueLots(updated);
  };

  return (
    <div className="w-full min-h-screen bg-[#040711] text-slate-100 font-sans p-4 xl:p-8 space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* PANEL TOP HUD & ROLE SWITCHER                                        */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#080d19] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Shield className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                TOURNAMENT OPERATIONS & GAVEL GOVERNANCE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ROLE: {currentRole}
              </span>
            </div>
            <h1 className="text-lg xl:text-xl font-black text-white tracking-tight uppercase">
              Auctioneer Master Admin & Rule Engine
            </h1>
          </div>
        </div>

        {/* Right Tools & Role Simulator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
            <span className="text-slate-400 pl-2 text-[11px]">Role View:</span>
            {(['SUPERADMIN', 'TOURNAMENT_DIRECTOR', 'HAMMER_OFFICIAL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setCurrentRole(r)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                  currentRole === r
                    ? 'bg-cyan-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3 OPERATIONAL SPACE TABS                                             */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#080d19] border border-white/10 max-w-xl">
        <button
          onClick={() => setActiveTab('HAMMER_OVERRIDE')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'HAMMER_OVERRIDE'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gavel className="w-4 h-4" />
          Live Hammer Stage
        </button>

        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'GOVERNANCE'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          Squad Rules
        </button>

        <button
          onClick={() => setActiveTab('PURSE_MANAGER')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'PURSE_MANAGER'
              ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Purses
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* OPERATIONAL SPACE 1: SQUAD RULE GOVERNANCE                           */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'GOVERNANCE' && (
        <div className="space-y-4">
          <SquadRuleGovernanceForm />
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* OPERATIONAL SPACE 2: TEAM & PURSE MANAGER                            */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'PURSE_MANAGER' && (
        <div className="space-y-4">
          <TeamPurseManager />
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* OPERATIONAL SPACE 3: LIVE HAMMER & STAGE OVERRIDE CONSOLE           */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'HAMMER_OVERRIDE' && (
        <div className="space-y-6">
          {/* Live Auctioneer Control Bar */}
          <LiveAuctioneerControlBar />

          {/* Catalog Queue Re-Indexing & Reordering Section */}
          <div className="rounded-3xl bg-[#080d19] border border-white/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Live Catalog Queue Re-Indexing (Drag / Priority Bump)
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly bump high-demand lots forward or recall unsold players into an accelerated evening round
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">4 Lots On-Deck</span>
            </div>

            <div className="space-y-2">
              {queueLots.map((lot, idx) => (
                <div
                  key={lot.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-400 font-bold">
                      LOT #{lot.lotNumber}
                    </span>
                    <span className="font-bold text-white text-sm">{lot.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300">
                      {lot.category}
                    </span>
                    <span className="font-mono text-emerald-400">Base: {lot.base}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {idx > 0 && (
                      <button
                        onClick={() => handleBumpPriority(idx)}
                        className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-cyan-500/30 transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        Bump to Next (On-Deck)
                      </button>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">Queue Pos: #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGovernancePanel;
