'use client';

/**
 * ============================================================================
 * ROLE AUTHENTICATION GATE MODAL
 * Strict Role Separation:
 *  - 🔨 Official Auctioneer (Admin PIN required, e.g. ROBOCELL2026)
 *  - 🙋 Franchise Bidder (Team selection + confidential Team PIN, e.g. TITAN101)
 *  - 📺 Stadium Spectator (Public 4K broadcast screen, read-only)
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  Gavel,
  Users,
  Tv,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuctionEngineStore } from '../../store/auction-engine-store';

interface RoleAuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ADMIN' | 'BIDDER' | 'VIEWER';
  onAuthenticated?: (role: 'ADMIN' | 'BIDDER' | 'VIEWER') => void;
}

export const RoleAuthGateModal: React.FC<RoleAuthGateModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'ADMIN',
  onAuthenticated,
}) => {
  const {
    teams,
    authenticateAsAdmin,
    authenticateAsTeam,
    setViewerMode,
  } = useAuctionEngineStore();

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'BIDDER' | 'VIEWER'>(initialTab);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [teamPinInput, setTeamPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!adminPinInput.trim()) {
      setErrorMsg('Please enter the Auctioneer Master PIN');
      return;
    }
    const ok = authenticateAsAdmin(adminPinInput.trim());
    if (ok) {
      setAdminPinInput('');
      onAuthenticated?.('ADMIN');
      onClose();
    } else {
      setErrorMsg('Invalid Auctioneer PIN. Hint: Default is ROBOCELL2026');
    }
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedTeamId) {
      setErrorMsg('Please select a franchise team');
      return;
    }
    if (!teamPinInput.trim()) {
      setErrorMsg('Please enter your Team Paddle PIN');
      return;
    }
    const ok = authenticateAsTeam(selectedTeamId, teamPinInput.trim());
    if (ok) {
      setTeamPinInput('');
      onAuthenticated?.('BIDDER');
      onClose();
    } else {
      const selectedTeam = teams.find((t) => t.id === selectedTeamId);
      const hintPin = selectedTeam?.pin || `TEAM${selectedTeam?.paddleNumber}`;
      setErrorMsg(`Invalid Team PIN for ${selectedTeam?.name || 'this team'}. (Default: ${hintPin})`);
    }
  };

  const handleSpectatorSelect = () => {
    setViewerMode();
    onAuthenticated?.('VIEWER');
    onClose();
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#060a17] border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden text-slate-100 p-6 sm:p-8">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black border border-cyan-400/50 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <img src="/robocell-crest.png" alt="RoboCell" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  ROBIQUEST 2026 • SECURITY GATE
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase">
                Access Verification
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-1 bg-black/50 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gavel className="w-4 h-4 mb-1" />
            <span>Auctioneer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('BIDDER');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'BIDDER'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 mb-1" />
            <span>Franchise</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('VIEWER');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'VIEWER'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4 mb-1" />
            <span>Spectator</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: AUCTIONEER ADMIN */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                <Lock className="w-3.5 h-3.5" />
                Tournament Official Authority
              </div>
              Unlocks full stage clock control, gavel strikes (Fair Warning, Going Twice, Hammer Sold), and the Contender CMS Studio.
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Auctioneer Master PIN:
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="e.g. ROBOCELL2026"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/20 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                <span>Default PIN: <strong className="text-amber-300 font-mono">ROBOCELL2026</strong></span>
                <button
                  type="button"
                  onClick={() => setAdminPinInput('ROBOCELL2026')}
                  className="text-amber-400 hover:underline"
                >
                  Quick Fill
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Gavel className="w-4 h-4" />
              <span>Unlock Auctioneer Console</span>
            </button>
          </form>
        )}

        {/* TAB 2: FRANCHISE BIDDER */}
        {activeTab === 'BIDDER' && (
          <form onSubmit={handleTeamSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Your Competing Franchise:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {teams.map((t) => {
                  const isSelected = t.id === selectedTeamId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTeamId(t.id);
                        setErrorMsg(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-2 shadow-lg'
                          : 'bg-black/40 border-white/10 opacity-70 hover:opacity-100 hover:border-white/25'
                      }`}
                      style={{
                        borderColor: isSelected ? t.color : undefined,
                        backgroundColor: isSelected ? `${t.color}20` : undefined,
                        boxShadow: isSelected ? `0 0 15px ${t.color}35` : undefined,
                      }}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{t.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">Paddle #{t.paddleNumber}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{selectedTeam.name} Confidential PIN:</span>
                <span className="text-[10px] font-normal text-slate-400">Default: {selectedTeam.pin || `TEAM${selectedTeam.paddleNumber}`}</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={teamPinInput}
                  onChange={(e) => setTeamPinInput(e.target.value)}
                  placeholder={`e.g. ${selectedTeam.pin || 'TITAN101'}`}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/20 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                <span>Locks terminal strictly to Paddle #{selectedTeam.paddleNumber}</span>
                <button
                  type="button"
                  onClick={() => setTeamPinInput(selectedTeam.pin || `TEAM${selectedTeam.paddleNumber}`)}
                  className="text-cyan-400 hover:underline"
                >
                  Auto-Fill
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Lock Terminal to {selectedTeam.shortCode} (#{selectedTeam.paddleNumber})</span>
            </button>
          </form>
        )}

        {/* TAB 3: SPECTATOR VIEWER */}
        {activeTab === 'VIEWER' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-cyan-300 mb-1">
                <Tv className="w-4 h-4" />
                Public 4K Stadium Projector Feed
              </div>
              Free read-only access designed for arena projectors, broadcast video walls, and online spectators. Bidding controls and gavel actions are completely disabled in this mode.
            </div>

            <button
              type="button"
              onClick={handleSpectatorSelect}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Spectator Broadcast (Read-Only)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
