'use client';

/**
 * ============================================================================
 * AUCTION SETUP & GOVERNANCE STUDIO WIZARD
 * Configure Auction Title, Currency, Rules, or Choose Starter Templates
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Layers,
  Scale,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  CurrencyCode,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const AuctionSetupWizard: React.FC = () => {
  const { profile, updateProfile, setCurrency, loadPresetTemplate, lots, teams } =
    useAuctionEngineStore();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#080d19] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Settings className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                AUCTION STUDIO & GOVERNANCE ENGINE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% USER-DRIVEN
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Tournament Configuration & Rule Setup
            </h1>
          </div>
        </div>

        {/* Quick Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Load Preset:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                loadPresetTemplate(e.target.value as any);
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option value="" disabled>
              -- Select Template --
            </option>
            <option value="SPORTS_IPL">🏏 IPL / Franchise Sports Auction (₹ INR)</option>
            <option value="FINE_ART_LUXURY">🎨 Fine Art & Estate Auction ($ USD)</option>
            <option value="REAL_ESTATE">🏢 Real Estate & Commercial ($ USD)</option>
            <option value="EMPTY">✨ Clean Slate (Empty Canvas)</option>
          </select>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">
              Configuration Saved & Active Invariants Broadcasted to Live Stage!
            </span>
          </div>
          <span className="font-mono text-[10px] opacity-75">STORE SYNCED</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Information & Currency */}
        <div className="rounded-3xl bg-[#090d19] border border-white/10 p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
            <Layers className="w-4 h-4 text-cyan-400" />
            1. Auction Profile & Currency Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Auction Event Title
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => updateProfile({ title: e.target.value })}
                placeholder="e.g., TATA IPL 2026 Mega Auction"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Base Currency Unit
              </label>
              <select
                value={profile.currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="INR">INR (₹) — Indian Rupee (Crores/Lakhs)</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div className="sm:col-span-12 space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Description / Sub-header
              </label>
              <input
                type="text"
                value={profile.description}
                onChange={(e) => updateProfile({ description: e.target.value })}
                placeholder="Subtitle or location notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Squad Limits & Purse Solvency Governance */}
        <div className="rounded-3xl bg-[#090d19] border border-white/10 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              2. Squad Governance & Solvency Floor Rules
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              MATHEMATICAL SOLVENCY CHECKS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Minimum Squad Roster
              </label>
              <input
                type="number"
                value={profile.minSquadSize}
                onChange={(e) => updateProfile({ minSquadSize: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400">Mandatory minimum slots</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Maximum Squad Cap
              </label>
              <input
                type="number"
                value={profile.maxSquadSize}
                onChange={(e) => updateProfile({ maxSquadSize: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400">Hard roster ceiling</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Standard Budget Cap
              </label>
              <input
                type="number"
                value={profile.totalPurseCap}
                onChange={(e) => updateProfile({ totalPurseCap: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-cyan-400 font-mono">
                {formatAuctionCurrency(profile.totalPurseCap, profile.currency)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Lowest Base Price Tier
              </label>
              <input
                type="number"
                value={profile.lowestBasePrice}
                onChange={(e) => updateProfile({ lowestBasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-emerald-400 font-mono">
                {formatAuctionCurrency(profile.lowestBasePrice, profile.currency)}
              </span>
            </div>
          </div>

          {/* Solvency Invariant Toggle */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Enforce Mathematical Reserve Purse Floor Preservation
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                Remaining Purse - Bid ≥ (Min Squad - Count - 1) × Lowest Base Price
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.enforceReservePurseFloor}
                onChange={(e) => updateProfile({ enforceReservePurseFloor: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>
        </div>

        {/* Current Workspace Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#090d19] border border-white/10 text-xs">
            <span className="text-slate-400 block mb-1">Catalog Lots</span>
            <span className="text-xl font-mono font-bold text-white">{lots.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d19] border border-white/10 text-xs">
            <span className="text-slate-400 block mb-1">Registered Teams</span>
            <span className="text-xl font-mono font-bold text-cyan-300">{teams.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d19] border border-white/10 text-xs">
            <span className="text-slate-400 block mb-1">Active Currency</span>
            <span className="text-xl font-mono font-bold text-amber-300">{profile.currency}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d19] border border-white/10 text-xs">
            <span className="text-slate-400 block mb-1">Reserve Floor</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {profile.enforceReservePurseFloor ? 'ENABLED' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all"
          >
            Save Auction Settings
          </button>
        </div>
      </form>
    </div>
  );
};
