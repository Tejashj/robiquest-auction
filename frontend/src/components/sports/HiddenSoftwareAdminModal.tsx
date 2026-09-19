'use client';

/**
 * ============================================================================
 * HIDDEN SOFTWARE ADMIN MODAL (COVERT TOURNAMENT GOVERNANCE SUITE)
 * STRICTLY UNLISTED: Hidden from Public Navbars & Unknown to Regular Viewers
 * Protected by Master Passkey Challenge (Default: 'APEX-SPORTS-MASTER-2026')
 * Master Squad Rules, Team Purse Allocation, Player Catalog, Excel Ingestion & Reset
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Key,
  X,
  Settings,
  Users,
  Package,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  CurrencyCode,
  PlayerRole,
} from '../../store/auction-engine-store';
import { ExcelImportModal } from '../auction/ExcelImportModal';

export interface HiddenSoftwareAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'RULES' | 'TEAMS' | 'CATALOG' | 'SYSTEM';

export const HiddenSoftwareAdminModal: React.FC<HiddenSoftwareAdminModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    updateProfile,
    setCurrency,
    teams,
    addTeam,
    deleteTeam,
    adjustTeamPurse,
    toggleTeamFreeze,
    lots,
    addLot,
    deleteLot,
    setActiveLot,
    isSoftwareAdminUnlocked,
    softwareAdminMasterKey,
    unlockSoftwareAdmin,
    lockSoftwareAdmin,
    setSoftwareAdminKey,
    loadPresetTemplate,
    exportTournamentState,
    importTournamentState,
  } = useAuctionEngineStore();

  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('RULES');

  // Excel Ingestion modal state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // New Team Form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamPaddle, setNewTeamPaddle] = useState(106);
  const [newTeamPurse, setNewTeamPurse] = useState(1200000000);
  const [newTeamColor, setNewTeamColor] = useState('#10b981');

  // New Player Form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('BATSMAN');
  const [newPlayerOverseas, setNewPlayerOverseas] = useState(false);
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(20000000);

  // Maintenance state
  const [newMasterKeyInput, setNewMasterKeyInput] = useState('');
  const [masterKeySuccess, setMasterKeySuccess] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPasskeyInput('');
      setAuthError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlockSoftwareAdmin(passkeyInput);
    if (ok) {
      setAuthError(false);
      setPasskeyInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    addTeam({
      name: newTeamName.trim(),
      shortCode: newTeamShort.trim().toUpperCase() || newTeamName.substring(0, 3).toUpperCase(),
      paddleNumber: newTeamPaddle,
      color: newTeamColor,
      accentColor: '#ffffff',
      logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
      initialPurse: newTeamPurse,
    });
    setNewTeamName('');
    setNewTeamShort('');
    setNewTeamPaddle((p) => p + 1);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addLot({
      lotNumber: lots.length + 1,
      title: newPlayerName.trim(),
      category: newPlayerRole,
      roleBadge: newPlayerOverseas ? 'OVERSEAS' : 'DOMESTIC',
      playerRole: newPlayerRole,
      isOverseas: newPlayerOverseas,
      startingBid: newPlayerBasePrice,
      reservePrice: newPlayerBasePrice,
      minIncrement: profile.defaultMinIncrement || 5000000,
      imageUrls: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'],
      attributes: {
        Role: newPlayerRole,
        Country: newPlayerOverseas ? 'Overseas' : 'India',
      },
    });
    setNewPlayerName('');
  };

  const handleExportJson = () => {
    const dataStr = exportTournamentState();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tournament-backup-${Date.now()}.json`;
    link.click();
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) return;
    const res = importTournamentState(importJsonText);
    setImportFeedback(res.message);
    setTimeout(() => setImportFeedback(null), 4000);
  };

  const handleUpdateMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterKeyInput.trim().length >= 6) {
      setSoftwareAdminKey(newMasterKeyInput.trim());
      setMasterKeySuccess(true);
      setNewMasterKeyInput('');
      setTimeout(() => setMasterKeySuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-[18px] bg-black border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ===================================================================
            HEADER (RESTRICTED IDENTITY)
            =================================================================== */}
        <div className="px-6 py-4 bg-black border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[18px] bg-[#16A085] flex items-center justify-center shadow-lg shadow-[#16A085]/30">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-[#16A085]">
                  RESTRICTED MASTER CONTROL
                </span>
                <span className="px-1.5 py-0.2 rounded-[18px] bg-[#16A085]/20 text-[#16A085] text-[10px] font-mono font-bold">
                  SYSADMIN ONLY
                </span>
              </div>
              <h2 className="text-base font-black text-[#D8CFB4] tracking-tight uppercase font-poppins">
                Software Administration Suite
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[18px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================
            IF LOCKED: MASTER SECURITY CHALLENGE GATE
            =================================================================== */}
        {!isSoftwareAdminUnlocked ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 text-[#16A085] flex items-center justify-center mx-auto shadow-2xl">
              <Key className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#D8CFB4] uppercase tracking-tight font-poppins">
                Authentication Required
              </h3>
              <p className="text-xs text-gray-400">
                This system governance panel is restricted. Enter the master security passkey to unlock tournament architecture.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter Master Security Key..."
                  className="w-full px-4 py-3 rounded-[18px] bg-white/[0.03] border border-transparent text-white text-center font-mono text-sm tracking-wider focus:outline-none focus:border-[#16A085] focus:ring-1 focus:ring-[#16A085]"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-red-400 font-semibold pt-1">
                    Invalid security key. Access denied.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-[18px] bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-[18px] bg-[#16A085] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-[#16A085]/30"
                >
                  Unlock Admin
                </button>
              </div>
            </form>

            <p className="text-[10px] text-gray-500 font-mono">
              Default Deployment Key: <code className="text-[#D8CFB4]">APEX-SPORTS-MASTER-2026</code>
            </p>
          </div>
        ) : (
          /* =================================================================
             AUTHENTICATED SOFTWARE ADMIN SUITE
             ================================================================= */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Nav Tabs */}
            <div className="px-6 py-2.5 bg-black border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('RULES')}
                  className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'RULES'
                      ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Tournament Rules
                </button>

                <button
                  onClick={() => setActiveTab('TEAMS')}
                  className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'TEAMS'
                      ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Franchises ({teams.length})
                </button>

                <button
                  onClick={() => setActiveTab('CATALOG')}
                  className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'CATALOG'
                      ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Player Catalog ({lots.length})
                </button>

                <button
                  onClick={() => setActiveTab('SYSTEM')}
                  className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'SYSTEM'
                      ? 'bg-[#16A085] text-black shadow-lg shadow-[#16A085]/30 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Security & Backup
                </button>
              </div>

              <button
                onClick={lockSoftwareAdmin}
                className="px-3 py-1 rounded-[18px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-bold flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Lock Console
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* -------------------------------------------------------------
                  TAB 1: TOURNAMENT RULES & SQUAD QUOTAS
                  ------------------------------------------------------------- */}
              {activeTab === 'RULES' && (
                <div className="space-y-6 text-xs">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      1. Tournament Metadata & Currency Unit
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-slate-300 font-semibold block">Tournament Title</label>
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => updateProfile({ title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Currency Standard</label>
                        <select
                          value={profile.currency}
                          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                        >
                          <option value="INR">INR (₹) — Indian Rupee (Cr / Lakhs)</option>
                          <option value="USD">USD ($) — US Dollar (M / k)</option>
                          <option value="EUR">EUR (€) — Euro</option>
                          <option value="GBP">GBP (£) — British Pound</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      2. Franchise Squad Rules & Solvency Floors
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Min Squad Size</label>
                        <input
                          type="number"
                          value={profile.minSquadSize}
                          onChange={(e) => updateProfile({ minSquadSize: parseInt(e.target.value, 10) || 1 })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Max Squad Cap</label>
                        <input
                          type="number"
                          value={profile.maxSquadSize}
                          onChange={(e) => updateProfile({ maxSquadSize: parseInt(e.target.value, 10) || 25 })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Max Overseas Slots</label>
                        <input
                          type="number"
                          value={profile.maxOverseasLimit}
                          onChange={(e) => updateProfile({ maxOverseasLimit: parseInt(e.target.value, 10) || 8 })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Lowest Base Tier</label>
                        <input
                          type="number"
                          value={profile.lowestBasePrice}
                          onChange={(e) => updateProfile({ lowestBasePrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                      <div>
                        <span className="font-bold text-white block">
                          Enforce Mathematical Reserve Purse Floor
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Formula: Remaining Purse - Bid ≥ (Min Squad - Current - 1) × Lowest Base Price
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.enforceReservePurseFloor}
                        onChange={(e) => updateProfile({ enforceReservePurseFloor: e.target.checked })}
                        className="w-5 h-5 rounded accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: FRANCHISE MANAGEMENT
                  ------------------------------------------------------------- */}
              {activeTab === 'TEAMS' && (
                <div className="space-y-6 text-xs">
                  {/* Add Franchise Form */}
                  <form onSubmit={handleCreateTeam} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-purple-400" />
                      Register New Franchise
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-slate-400">Franchise Name</label>
                        <input
                          type="text"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="e.g. Gujarat Giants"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Short Code</label>
                        <input
                          type="text"
                          value={newTeamShort}
                          onChange={(e) => setNewTeamShort(e.target.value.toUpperCase())}
                          placeholder="GG"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                          maxLength={4}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Paddle #</label>
                        <input
                          type="number"
                          value={newTeamPaddle}
                          onChange={(e) => setNewTeamPaddle(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Brand Color</label>
                        <input
                          type="color"
                          value={newTeamColor}
                          onChange={(e) => setNewTeamColor(e.target.value)}
                          className="w-full h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25"
                      >
                        Add Franchise to Tournament
                      </button>
                    </div>
                  </form>

                  {/* Registered Franchises Table */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#050811] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                        <tr>
                          <th className="p-3">Franchise</th>
                          <th className="p-3">Paddle</th>
                          <th className="p-3">Purse</th>
                          <th className="p-3">Squad</th>
                          <th className="p-3">Overseas</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {teams.map((t) => (
                          <tr key={t.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-sans font-bold text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                              {t.name} ({t.shortCode})
                            </td>
                            <td className="p-3">#{t.paddleNumber}</td>
                            <td className="p-3 text-emerald-400 font-bold">{formatAuctionCurrency(t.remainingPurse, profile.currency)}</td>
                            <td className="p-3">{t.squadCount}/{profile.maxSquadSize}</td>
                            <td className="p-3">{t.overseasCount}/{profile.maxOverseasLimit}</td>
                            <td className="p-3 font-sans">
                              <button
                                onClick={() => toggleTeamFreeze(t.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.isFrozen
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {t.isFrozen ? 'FROZEN' : 'ACTIVE'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => deleteTeam(t.id)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                title="Delete Franchise"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: PLAYER CATALOG & EXCEL INGESTION
                  ------------------------------------------------------------- */}
              {activeTab === 'CATALOG' && (
                <div className="space-y-6 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setIsExcelModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Import Excel Player Catalog
                    </button>
                  </div>

                  {/* Add Player Form */}
                  <form onSubmit={handleCreatePlayer} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-purple-400" />
                      Add Player Lot
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-slate-400">Player Name</label>
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          placeholder="e.g. Travis Head"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Role / Discipline</label>
                        <select
                          value={newPlayerRole}
                          onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                        >
                          <option value="BATSMAN">Batsman</option>
                          <option value="BOWLER">Bowler</option>
                          <option value="ALL_ROUNDER">All-Rounder</option>
                          <option value="WICKETKEEPER">Wicketkeeper</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Base Price</label>
                        <input
                          type="number"
                          value={newPlayerBasePrice}
                          onChange={(e) => setNewPlayerBasePrice(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlayerOverseas}
                          onChange={(e) => setNewPlayerOverseas(e.target.checked)}
                          className="w-4 h-4 rounded accent-purple-600"
                        />
                        <span className="text-slate-300">Overseas / Foreign Player</span>
                      </label>

                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                      >
                        Add to Catalog
                      </button>
                    </div>
                  </form>

                  {/* Player Catalog Table */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-[#050811] text-slate-400 text-[10px] uppercase border-b border-white/10 sticky top-0">
                        <tr>
                          <th className="p-3">Lot #</th>
                          <th className="p-3">Player Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Overseas</th>
                          <th className="p-3">Base Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {lots.map((l) => (
                          <tr key={l.id} className="hover:bg-white/[0.02]">
                            <td className="p-3">#{l.lotNumber}</td>
                            <td className="p-3 font-sans font-bold text-white">{l.title}</td>
                            <td className="p-3 font-sans">{l.category}</td>
                            <td className="p-3 font-sans">{l.isOverseas ? '★ Overseas' : 'Domestic'}</td>
                            <td className="p-3 text-[#D8CFB4] font-bold">{formatAuctionCurrency(l.startingBid, profile.currency)}</td>
                            <td className="p-3 font-sans">{l.status}</td>
                            <td className="p-3 text-right font-sans space-x-2">
                              <button
                                onClick={() => setActiveLot(l.id)}
                                className="px-2.5 py-1 rounded-[18px] bg-[#16A085]/20 text-[#16A085] text-[10px] font-bold border border-[#16A085]/30"
                              >
                                Stage
                              </button>
                              <button
                                onClick={() => deleteLot(l.id)}
                                className="p-1 rounded-[18px] bg-red-500/10 text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 4: SYSTEM BACKUP & PASSKEY RECONFIGURATION
                  ------------------------------------------------------------- */}
              {activeTab === 'SYSTEM' && (
                <div className="space-y-6 text-xs">
                  {/* Master Passkey Change Form */}
                  <form onSubmit={handleUpdateMasterKey} className="p-5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-poppins">
                      <Key className="w-4 h-4 text-[#16A085]" />
                      Reconfigure Master Security Key
                    </h3>
                    <p className="text-gray-400 text-[11px]">
                      Change the secret passkey required to access this hidden software admin panel.
                    </p>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMasterKeyInput}
                        onChange={(e) => setNewMasterKeyInput(e.target.value)}
                        placeholder="Enter new master key (min 6 chars)..."
                        className="flex-1 px-4 py-2 rounded-[18px] bg-black border border-white/[0.08] text-white font-mono text-xs focus:border-[#16A085] outline-none"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-extrabold"
                      >
                        Update Key
                      </button>
                    </div>

                    {masterKeySuccess && (
                      <p className="text-[#16A085] font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Master security key updated successfully!
                      </p>
                    )}
                  </form>

                  {/* Export & Import Data */}
                  <div className="p-5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">
                      Tournament Data Export / Import
                    </h3>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleExportJson}
                        className="px-4 py-2.5 rounded-[18px] bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold flex items-center gap-2 border border-white/[0.08]"
                      >
                        <Download className="w-4 h-4 text-[#16A085]" />
                        Export Tournament JSON Backup
                      </button>

                      <button
                        onClick={() => loadPresetTemplate('ROBIQUEST')}
                        className="px-4 py-2.5 rounded-[18px] bg-[#16A085]/20 hover:bg-[#16A085]/30 text-[#16A085] border border-[#16A085]/30 font-bold flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4 text-[#16A085]" />
                        Reset to RobiQuest (RoboCell) 4-Team Blueprint
                      </button>

                      <button
                        onClick={() => loadPresetTemplate('SPORTS_IPL')}
                        className="px-4 py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-[#D8CFB4] border border-white/[0.08] font-bold flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4 text-[#D8CFB4]" />
                        Reset to Sports IPL Blueprint
                      </button>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] space-y-2">
                      <label className="text-gray-400 block font-semibold">Import JSON State:</label>
                      <textarea
                        value={importJsonText}
                        onChange={(e) => setImportJsonText(e.target.value)}
                        placeholder="Paste tournament JSON payload here..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-[18px] bg-black border border-white/[0.08] text-white font-mono text-[11px] focus:border-[#16A085] outline-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#D8CFB4]">{importFeedback}</span>
                        <button
                          onClick={handleImportJson}
                          className="px-4 py-1.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-extrabold text-xs shadow-lg shadow-[#16A085]/30"
                        >
                          Import Tournament Payload
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Excel Ingestion Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />
    </div>
  );
};

export default HiddenSoftwareAdminModal;
