'use client';

/**
 * ============================================================================
 * ROLE AUTHENTICATION GATE MODAL
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-poppins">
      <div className="relative w-full max-w-lg rounded-[18px] bg-[#000000] border border-white/[0.08] text-white p-6 sm:p-8">
        {/* Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[18px] bg-black border border-[#16A085]/40 p-1 flex items-center justify-center">
              <img src="/robocell-crest.png" alt="RoboCell" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-wider">
                  SECURITY & ROLES
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase font-poppins">
                Arena Access Gate
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-[18px]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
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
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'BIDDER'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
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
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all ${
              activeTab === 'VIEWER'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Tv className="w-4 h-4 mb-1" />
            <span>Spectator</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-[18px] bg-white/[0.03] border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: AUCTIONEER ADMIN */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-[#16A085] mb-1">
                <Lock className="w-3.5 h-3.5" />
                Tournament Official Authority
              </div>
              Unlocks full stage clock control, gavel strikes (Going Once, Going Twice, Hammer Sold), Contender Studio, and Franchise Management.
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
                  className="w-full theme-input font-mono text-sm tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400 font-mono">
                <span>Default PIN: <strong className="text-[#16A085]">ROBOCELL2026</strong></span>
                <button
                  type="button"
                  onClick={() => setAdminPinInput('ROBOCELL2026')}
                  className="text-[#16A085] hover:underline"
                >
                  Auto-Fill
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-[18px] theme-btn-primary text-black font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2"
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
                Select Your Franchise Team:
              </label>
              <div className="grid grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
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
                      className={`p-3 rounded-[18px] border text-left transition-all flex items-center gap-2.5 bg-[#000000] ${
                        isSelected
                          ? 'border-[#16A085]'
                          : 'border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                      style={{
                        borderColor: isSelected ? '#16A085' : undefined,
                        backgroundColor: isSelected ? 'rgba(22, 160, 133, 0.15)' : undefined,
                      }}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color || '#16A085' }} />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate font-poppins uppercase">{t.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">Paddle #{t.paddleNumber}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{selectedTeam?.name} Security PIN:</span>
                <button
                  type="button"
                  onClick={() => setTeamPinInput(selectedTeam?.pin || `TEAM${selectedTeam?.paddleNumber}`)}
                  className="text-[#16A085] text-[11px] font-mono hover:underline"
                >
                  Auto-Fill ({selectedTeam?.pin || `TEAM${selectedTeam?.paddleNumber}`})
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={teamPinInput}
                  onChange={(e) => setTeamPinInput(e.target.value)}
                  placeholder={`e.g. ${selectedTeam?.pin || 'TITAN101'}`}
                  className="w-full theme-input font-mono text-sm tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-[18px] theme-btn-primary text-black font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Unlock Franchise Cockpit</span>
            </button>
          </form>
        )}

        {/* TAB 3: SPECTATOR */}
        {activeTab === 'VIEWER' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-[#16A085]">
                <Tv className="w-4 h-4" />
                4K Stadium Projector Feed
              </div>
              <p>
                Public broadcast display mode with zero bidding buttons and zero administrative controls.
                Ideal for stadium projectors, auditorium displays, and live tournament streams.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSpectatorSelect}
              className="w-full py-4 rounded-[18px] theme-btn-primary text-black font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Launch Stadium View</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleAuthGateModal;
