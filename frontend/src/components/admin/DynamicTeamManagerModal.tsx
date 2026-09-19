'use client';

/**
 * ============================================================================
 * DYNAMIC FRANCHISE / TEAM ROSTER STUDIO
 * Complete Dynamic Control over Participating Teams:
 *  - ➕ Add New Team with Custom Color, Logo, Paddle & Starting Purse
 *  - ✏️ Edit Existing Team Data & PIN
 *  - 🗑️ Delete Team
 *  - 💰 Adjust Purse Balance (Credit / Penalty) with Reason
 *  - ❄️ Freeze / Unfreeze Team Bidding Rights
 *  - 📋 View Acquired Squad Roster
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Shield,
  Palette,
  Image as ImageIcon,
  Trophy,
  History,
  Coins,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  AuctionTeamParticipant,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

interface DynamicTeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { label: 'Primary Emerald', color: '#16A085' },
  { label: 'Primary Mint', color: '#1abc9c' },
  { label: 'Headline Cream', color: '#D8CFB4' },
  { label: 'Titanium White', color: '#ffffff' },
  { label: 'Slate Gray', color: '#94a3b8' },
  { label: 'Deep Forest', color: '#0e6655' },
];

export const DynamicTeamManagerModal: React.FC<DynamicTeamManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    teams,
    profile,
    addTeam,
    updateTeam,
    deleteTeam,
    adjustTeamPurse,
    toggleTeamFreeze,
  } = useAuctionEngineStore();

  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT' | 'ROSTER'>('LIST');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [paddleNumber, setPaddleNumber] = useState<number>(101);
  const [color, setColor] = useState('#16A085');
  const [initialPurse, setInitialPurse] = useState<number>(profile.totalPurseCap);
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');
  const [pin, setPin] = useState('');

  // Purse adjustment state
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustReason, setAdjustReason] = useState('Official Governance Adjustment');
  const [isDeduction, setIsDeduction] = useState(true);

  const [toast, setToast] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  if (!isOpen) return null;

  const showToast = (type: 'SUCCESS' | 'ERROR', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartCreate = () => {
    const nextPaddle = Math.max(...teams.map((t) => t.paddleNumber), 100) + 1;
    setName('');
    setShortCode('');
    setPaddleNumber(nextPaddle);
    setColor(COLOR_PRESETS[teams.length % COLOR_PRESETS.length].color);
    setInitialPurse(profile.totalPurseCap);
    setLogoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');
    setPin(`TEAM${nextPaddle}`);
    setActiveTab('CREATE');
  };

  const handleStartEdit = (team: AuctionTeamParticipant) => {
    setSelectedTeamId(team.id);
    setName(team.name);
    setShortCode(team.shortCode);
    setPaddleNumber(team.paddleNumber);
    setColor(team.color);
    setInitialPurse(team.initialPurse);
    setLogoUrl(team.logoUrl);
    setPin(team.pin || `TEAM${team.paddleNumber}`);
    setActiveTab('EDIT');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('ERROR', 'Please enter a franchise team name');
      return;
    }

    const code = shortCode.trim() || name.substring(0, 3).toUpperCase();
    addTeam({
      name: name.trim(),
      shortCode: code,
      paddleNumber: Number(paddleNumber),
      color,
      accentColor: color,
      logoUrl: logoUrl.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      initialPurse: Number(initialPurse),
      pin: pin.trim().toUpperCase(),
    });

    showToast('SUCCESS', `Created team "${name}" (Paddle #${paddleNumber})!`);
    setActiveTab('LIST');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    updateTeam(selectedTeamId, {
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      paddleNumber: Number(paddleNumber),
      color,
      accentColor: color,
      logoUrl: logoUrl.trim(),
      pin: pin.trim().toUpperCase(),
    });

    showToast('SUCCESS', `Updated franchise settings for "${name}"!`);
    setActiveTab('LIST');
  };

  const handleDelete = (id: string, teamName: string) => {
    if (confirm(`Are you sure you want to remove team "${teamName}"?`)) {
      deleteTeam(id);
      showToast('SUCCESS', `Removed "${teamName}" from active roster.`);
    }
  };

  const handleApplyAdjustment = (teamId: string) => {
    if (adjustAmount <= 0) return;
    adjustTeamPurse(teamId, adjustAmount, isDeduction, adjustReason);
    showToast(
      'SUCCESS',
      `Applied ${isDeduction ? 'penalty deduction' : 'purse credit'} of ${formatAuctionCurrency(adjustAmount, profile.currency)}`
    );
  };

  // Image Upload Helper (converts file to Base64 DataURL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setLogoUrl(loadEvt.target.result as string);
          showToast('SUCCESS', 'Uploaded custom team logo!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in font-poppins">
      <div className="relative w-full max-w-4xl rounded-[18px] bg-[#000000] border border-white/[0.08] shadow-2xl p-6 sm:p-8 my-8 text-white max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] shadow-lg shadow-[#16A085]/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-poppins font-black uppercase tracking-wider text-[#D8CFB4]">
                Dynamic Franchise Roster Studio
              </h2>
              <p className="text-xs text-gray-400">
                Register teams, configure budgets, color palettes, and track acquired players
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'LIST' && (
              <button
                onClick={() => setActiveTab('LIST')}
                className="px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-gray-300 transition-all border border-white/[0.08]"
              >
                Back to List
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all border border-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`my-3 p-3 rounded-[18px] border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === 'SUCCESS'
                ? 'bg-[#16A085]/20 border-[#16A085]/40 text-[#16A085]'
                : 'bg-red-500/20 border-red-500/40 text-red-200'
            }`}
          >
            {toast.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A085]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        {/* TAB: LIST OF TEAMS */}
        {activeTab === 'LIST' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                Registered Franchises ({teams.length})
              </span>
              <button
                onClick={handleStartCreate}
                className="px-4 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#16A085]/30"
              >
                <Plus className="w-4 h-4" />
                Add New Team
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const remainingPct = Math.max(
                  0,
                  Math.min(100, (team.remainingPurse / team.initialPurse) * 100)
                );

                return (
                  <div
                    key={team.id}
                    className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] hover:border-[#16A085]/50 flex flex-col justify-between gap-3 relative overflow-hidden transition-all"
                  >
                    {/* Top line accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: team.color || '#16A085' }}
                    />

                    {/* Team Info Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-[18px] overflow-hidden border-2 bg-black p-1 flex-shrink-0"
                          style={{ borderColor: team.color || '#16A085' }}
                        >
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-black"
                              style={{ backgroundColor: `${team.color || '#16A085'}25`, color: team.color || '#16A085' }}
                            >
                              {team.shortCode}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              Paddle #{team.paddleNumber}
                            </span>
                            {team.isFrozen && (
                              <span className="px-1.5 py-0.2 rounded-[18px] text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                                FROZEN
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-poppins font-black text-white uppercase mt-0.5">
                            {team.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(team)}
                          className="p-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"
                          title="Edit Team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleTeamFreeze(team.id)}
                          className="p-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-[#D8CFB4] transition-all"
                          title={team.isFrozen ? 'Restore Bidding Rights' : 'Freeze Bidding Rights'}
                        >
                          {team.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(team.id, team.name)}
                          className="p-1.5 rounded-[18px] bg-white/[0.03] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Purse Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-[10px] font-mono text-gray-400 uppercase">
                          Remaining Purse:
                        </span>
                        <span className="font-mono font-black text-sm text-[#D8CFB4]">
                          {formatAuctionCurrency(team.remainingPurse, profile.currency)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-[18px] bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-[18px] transition-all duration-500"
                          style={{
                            width: `${remainingPct}%`,
                            backgroundColor: team.color || '#16A085',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>Spent: {formatAuctionCurrency(team.totalSpent, profile.currency)}</span>
                        <span>{remainingPct.toFixed(0)}% Solvency</span>
                      </div>
                    </div>

                    {/* Squad Slot count & Roster trigger */}
                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px] flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-[#16A085]" />
                        Squad: <strong className="text-white">{team.squadCount || team.acquiredPlayers?.length || 0}</strong> / {profile.maxSquadSize}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setActiveTab('ROSTER');
                        }}
                        className="text-[11px] font-bold text-[#16A085] hover:text-[#1abc9c] flex items-center gap-1"
                      >
                        View Roster ({team.acquiredPlayers?.length || 0})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: CREATE OR EDIT TEAM */}
        {(activeTab === 'CREATE' || activeTab === 'EDIT') && (
          <form
            onSubmit={activeTab === 'CREATE' ? handleCreateSubmit : handleEditSubmit}
            className="flex-1 overflow-y-auto py-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Franchise / Team Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (activeTab === 'CREATE' && !shortCode) {
                      setShortCode(e.target.value.substring(0, 3).toUpperCase());
                    }
                  }}
                  className="w-full theme-input"
                  placeholder="Robo Titans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Short Code (3-4 chars)
                </label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                  className="w-full theme-input font-mono font-bold uppercase"
                  placeholder="RBT"
                  maxLength={5}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Floor Paddle #
                </label>
                <input
                  type="number"
                  value={paddleNumber}
                  onChange={(e) => setPaddleNumber(Number(e.target.value))}
                  className="w-full theme-input font-mono"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Initial Purse ({profile.currency})
                </label>
                <input
                  type="number"
                  value={initialPurse}
                  onChange={(e) => setInitialPurse(Number(e.target.value))}
                  className="w-full theme-input font-mono"
                  min={1000}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Confidential PIN
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="w-full theme-input font-mono uppercase"
                  placeholder="TITAN101"
                  required
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#16A085]" />
                Team Brand Color
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setColor(p.color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border text-xs font-bold transition-all ${
                      color === p.color
                        ? 'border-white ring-2 ring-white/30 scale-105'
                        : 'border-white/[0.08] hover:border-white/30'
                    }`}
                    style={{ backgroundColor: `${p.color}20` }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span style={{ color: p.color }}>{p.label}</span>
                  </button>
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-[18px] cursor-pointer bg-transparent border-0"
                  title="Pick custom color"
                />
              </div>
            </div>

            {/* Logo URL & File Upload */}
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Franchise Crest / Logo
              </label>
              <div className="flex gap-3 items-center">
                <div
                  className="w-14 h-14 rounded-[18px] border-2 bg-black p-1 flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: color }}
                >
                  <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full theme-input text-xs px-3.5 py-2"
                    placeholder="https://... or upload below"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-gray-300 cursor-pointer transition-all">
                    <ImageIcon className="w-3.5 h-3.5 text-[#16A085]" />
                    <span>Upload Local Logo (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-5 py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-gray-300 border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-[#16A085]/30"
              >
                {activeTab === 'CREATE' ? 'Register Franchise' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB: ACQUIRED ROSTER & PURSE ADJUSTMENTS */}
        {activeTab === 'ROSTER' && selectedTeam && (
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[18px] overflow-hidden border-2 bg-black p-1 flex-shrink-0"
                  style={{ borderColor: selectedTeam.color || '#16A085' }}
                >
                  <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-poppins font-black text-white uppercase">
                    {selectedTeam.name} Roster
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Remaining Purse: <strong className="text-[#D8CFB4]">{formatAuctionCurrency(selectedTeam.remainingPurse, profile.currency)}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-gray-400">Total Players Won:</span>
                <p className="text-xl font-poppins font-black text-[#16A085]">
                  {selectedTeam.acquiredPlayers?.length || 0}
                </p>
              </div>
            </div>

            {/* Acquired Players List */}
            <div>
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                Acquired Contenders / Players
              </h4>

              {(!selectedTeam.acquiredPlayers || selectedTeam.acquiredPlayers.length === 0) ? (
                <div className="p-8 text-center text-gray-500 rounded-[18px] bg-white/[0.02] border border-white/[0.08] text-xs font-mono">
                  No lots acquired yet. Win lots in live bidding to build roster.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTeam.acquiredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                          LOT #{player.lotNumber}
                        </span>
                        <span className="text-sm font-bold text-white uppercase font-poppins">
                          {player.title}
                        </span>
                        <span className="text-xs text-gray-400">({player.role})</span>
                      </div>

                      <div className="text-right font-mono text-xs font-bold text-[#D8CFB4]">
                        {formatAuctionCurrency(player.price, profile.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Purse Adjustment Tool */}
            <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#16A085]" />
                Governance Purse Adjustment
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Adjustment Type:</label>
                  <select
                    value={isDeduction ? 'PENALTY' : 'CREDIT'}
                    onChange={(e) => setIsDeduction(e.target.value === 'PENALTY')}
                    className="w-full theme-input bg-black text-xs px-3 py-2"
                  >
                    <option value="PENALTY" className="bg-black text-white">Penalty Deduction (-)</option>
                    <option value="CREDIT" className="bg-black text-white">Purse Credit (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Amount ({profile.currency}):</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full theme-input font-mono text-xs px-3 py-2"
                    min={1000}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Reason / Note:</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full theme-input text-xs px-3 py-2"
                    placeholder="Violation fine or credit adjustment"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyAdjustment(selectedTeam.id)}
                className="px-4 py-2 rounded-[18px] bg-[#16A085]/20 hover:bg-[#16A085]/30 border border-[#16A085]/40 text-[#16A085] text-xs font-bold transition-all"
              >
                Apply Purse Adjustment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicTeamManagerModal;
