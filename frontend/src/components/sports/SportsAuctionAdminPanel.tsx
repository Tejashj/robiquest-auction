'use client';

/**
 * ============================================================================
 * SPORTS AUCTION ADMIN PANEL (THE LIVE AUCTIONEER DESK)
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Gavel,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Undo2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  LogOut,
  FolderEdit,
  Settings,
  Bot,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { SoldCelebrationOverlay } from '../spectator/SoldCelebrationOverlay';
import { UnsoldPassOverlay } from '../spectator/UnsoldPassOverlay';
import { GavelHammerStrike } from '../spectator/GavelHammerStrike';
import { InteractiveBiddingPaddle } from '../spectator/InteractiveBiddingPaddle';
import { ContenderManagerModal } from '../admin/ContenderManagerModal';
import { DynamicTeamManagerModal } from '../admin/DynamicTeamManagerModal';
import { TournamentSettingsModal } from '../admin/TournamentSettingsModal';

export const SportsAuctionAdminPanel: React.FC = () => {
  const {
    profile,
    lots,
    activeLotId,
    teams,
    bids,
    clock,
    userRole,
    isSimulatingBids,
    toggleBidSimulation,
    authenticateAsAdmin,
    logoutRole,
    setActiveLot,
    placeUserBid,
    revokeLastBid,
    startClock,
    pauseClock,
    extendClock,
    resetClock,
    triggerGavelAction,
  } = useAuctionEngineStore();

  const [toast, setToast] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);
  const [isContenderModalOpen, setIsContenderModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Inline Admin PIN state
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // --------------------------------------------------------------------------
  // ROLE GATE: IF NOT AUTHENTICATED AS ADMIN, SHOW LOCK SCREEN
  // --------------------------------------------------------------------------
  if (userRole !== 'ADMIN') {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      if (!adminPinInput.trim()) {
        setLoginError('Please enter the Auctioneer PIN');
        return;
      }
      const ok = authenticateAsAdmin(adminPinInput.trim());
      if (ok) {
        setAdminPinInput('');
      } else {
        setLoginError('Invalid Auctioneer Master PIN. Default: ROBOCELL2026');
      }
    };

    return (
      <div className="max-w-lg mx-auto p-6 sm:p-8 my-10 rounded-[18px] bg-[#000000] border border-white/[0.08] text-white text-center animate-in fade-in font-poppins">
        <div className="w-16 h-16 mx-auto rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085] mb-4">
          <Gavel className="w-8 h-8 transform -rotate-12" />
        </div>

        <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest">
          TOURNAMENT OFFICIALS ONLY
        </span>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight mt-1 mb-2 font-poppins">
          Auctioneer Console Locked
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          This console holds hammer authority, clock synchronization, and dynamic tournament controls. Enter passcode to proceed.
        </p>

        {loginError && (
          <div className="mb-4 p-3.5 rounded-[18px] bg-white/[0.03] border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>Master Passcode:</span>
              <button
                type="button"
                onClick={() => setAdminPinInput('ROBOCELL2026')}
                className="text-[#16A085] text-[11px] font-mono hover:underline"
              >
                Auto-Fill (ROBOCELL2026)
              </button>
            </label>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="ROBOCELL2026"
              className="w-full theme-input font-mono text-sm tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-[18px] theme-btn-primary text-black font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Official Desk</span>
          </button>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED AUCTIONEER DESK
  // --------------------------------------------------------------------------
  const handleFloorBid = (teamId: string) => {
    if (!activeLot) return;
    const nextAmount =
      activeLot.bidsCount === 0
        ? activeLot.startingBid
        : activeLot.currentHighBid + activeLot.minIncrement;
    const res = placeUserBid(nextAmount, teamId);
    if (res.success) {
      setToast({ type: 'SUCCESS', text: res.message });
    } else {
      setToast({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevoke = () => {
    const res = revokeLastBid();
    if (res.success) {
      setToast({ type: 'SUCCESS', text: res.message });
    } else {
      setToast({ type: 'ERROR', text: res.message });
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200 font-poppins">
      {/* Modals & Live Overlays */}
      <SoldCelebrationOverlay />
      <UnsoldPassOverlay />
      <GavelHammerStrike />
      <InteractiveBiddingPaddle position="bottom-right" />
      <ContenderManagerModal
        isOpen={isContenderModalOpen}
        onClose={() => setIsContenderModalOpen(false)}
      />
      <DynamicTeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
      <TournamentSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* =====================================================================
          AUCTIONEER DESK HEADER
          ===================================================================== */}
      <div className="p-6 sm:p-7 rounded-[18px] bg-[#000000] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[18px] bg-[#16A085] flex items-center justify-center text-black p-2.5">
            <Gavel className="w-6 h-6 transform -rotate-12 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#16A085] font-bold">
                OFFICIAL AUCTIONEER CONSOLE
              </span>
              {activeLot && (
                <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.03] text-[#16A085] border border-white/[0.08]">
                  LOT #{activeLot.lotNumber} ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-poppins">
              {profile.title} • Gavel Authority
            </h1>
          </div>
        </div>

        {/* Dynamic Studio Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Contenders Studio */}
          <button
            onClick={() => setIsContenderModalOpen(true)}
            className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#16A085] font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <FolderEdit className="w-3.5 h-3.5" />
            <span>Contenders ({lots.length})</span>
          </button>

          {/* Teams Studio */}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#16A085]" />
            <span>Franchises ({teams.length})</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-[#16A085]" />
            <span>Settings</span>
          </button>

          {/* AI Simulation Toggle */}
          <button
            onClick={toggleBidSimulation}
            className={`px-4 py-2 rounded-[18px] border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSimulatingBids
                ? 'bg-[#16A085]/20 border-[#16A085] text-[#16A085]'
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-slate-400'
            }`}
            title="Toggle Live Arena AI Bidding War"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isSimulatingBids ? 'Sim: Active' : 'Sim: Off'}</span>
          </button>

          {/* Lot Selector */}
          {activeLot && (
            <select
              value={activeLot.id}
              onChange={(e) => setActiveLot(e.target.value)}
              className="px-3 py-2 rounded-[18px] theme-input text-xs font-mono font-bold max-w-[190px] truncate bg-black border border-white/[0.08]"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id} className="bg-black text-white">
                  #{l.lotNumber}: {l.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={logoutRole}
            className="p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            title="Lock Auctioneer Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-[18px] text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            toast.type === 'SUCCESS'
              ? 'bg-[#16A085]/20 border border-[#16A085] text-white'
              : 'bg-white/[0.03] border border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A085] flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Empty Catalog Notice */}
      {!activeLot ? (
        <div className="p-12 text-center text-slate-400 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
          <p className="text-base font-bold text-white font-poppins">No Contenders in Tournament Catalog</p>
          <button
            onClick={() => setIsContenderModalOpen(true)}
            className="px-6 py-2.5 rounded-[18px] theme-btn-primary text-black font-bold text-xs uppercase"
          >
            Open Contender Studio & Create Lots
          </button>
        </div>
      ) : (
        <>
          {/* PRIMARY OPERATIONAL ROW: ACTIVE LOT CARD + FLOOR ENTRY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Stage Lot Overview (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-[18px] bg-[#000000] border border-white/[0.08] flex flex-col justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 h-24 rounded-[18px] overflow-hidden bg-black border border-white/[0.08] flex-shrink-0 relative">
                  <img
                    src={activeLot.imageUrls[0]}
                    alt={activeLot.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[18px] bg-black/90 font-mono text-xs font-bold text-[#D8CFB4]">
                    #{activeLot.lotNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-[18px] text-xs font-mono font-bold bg-white/[0.03] text-[#16A085] border border-white/[0.08]">
                      {activeLot.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.03] text-slate-300 uppercase border border-white/[0.08]">
                      {activeLot.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight font-poppins">
                    {activeLot.title}
                  </h2>
                  <div className="text-xs text-slate-300 font-mono flex items-center gap-4 pt-1">
                    <span>Base: <strong className="text-white font-bold">{formatAuctionCurrency(activeLot.startingBid, profile.currency)}</strong></span>
                    <span>Step: <strong className="text-[#16A085] font-bold">+{formatAuctionCurrency(activeLot.minIncrement, profile.currency)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Current High Bid Banner */}
              <div className="p-5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Current Highest Bid</span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-[#D8CFB4]">
                    {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Leading Franchise</span>
                  <div className="text-lg font-bold text-[#16A085] uppercase truncate font-poppins">
                    {activeLot.currentLeaderName || 'No Floor Bids Yet'}
                  </div>
                  {activeLot.currentLeaderPaddle && (
                    <span className="text-xs font-mono text-slate-400 font-medium">Paddle #{activeLot.currentLeaderPaddle}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Dynamic Floor Paddle Triggers (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 font-poppins">
                  <Users className="w-3.5 h-3.5 text-[#16A085]" />
                  Floor Paddle Entry ({teams.length} Teams)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Floor Raise</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {teams.map((t) => {
                  const isLeader = activeLot.currentLeaderId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleFloorBid(t.id)}
                      disabled={isLeader}
                      className={`p-3.5 rounded-[18px] border text-left transition-all flex items-center justify-between bg-[#000000] ${
                        isLeader
                          ? 'border-[#16A085] text-[#16A085]'
                          : 'border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color || '#16A085' }} />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="font-poppins uppercase truncate">{t.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">#{t.paddleNumber}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Purse: {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isLeader ? (
                          <span className="text-xs font-bold text-[#16A085] font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> LEADER
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-[#16A085]">
                            Raise Next
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECONDARY OPERATIONAL ROW: STAGE CLOCK + GAVEL HAMMER CALLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stage Clock Controls (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5 font-poppins">
                  <Clock className="w-3.5 h-3.5 text-[#16A085]" />
                  Synchronized Stage Clock
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-[18px] bg-white/[0.03] text-white font-bold border border-white/[0.08]">
                  {clock.status}: {clock.remainingSeconds}s
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {clock.status === 'RUNNING' ? (
                  <button
                    onClick={pauseClock}
                    className="py-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-[#D8CFB4]/40 text-[#D8CFB4] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={startClock}
                    className="py-3 rounded-[18px] theme-btn-primary text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Start</span>
                  </button>
                )}

                <button
                  onClick={() => extendClock(15)}
                  className="py-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-[#16A085]/40 text-[#16A085] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+15s Soft Close</span>
                </button>

                <button
                  onClick={() => resetClock(60)}
                  className="py-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset (60s)</span>
                </button>
              </div>
            </div>

            {/* Gavel Hammer Strikes (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5 font-poppins">
                  <Gavel className="w-3.5 h-3.5 text-[#16A085]" />
                  Hammer Authority & Gavel Calls
                </span>

                <button
                  onClick={handleRevoke}
                  disabled={bids.length === 0}
                  className="px-3 py-1 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 text-xs font-medium disabled:opacity-40 flex items-center gap-1 transition-all"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Revoke Last Bid</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => triggerGavelAction('FAIR_WARNING')}
                  className="py-3.5 px-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-[#D8CFB4] border border-[#D8CFB4]/40 text-xs font-bold uppercase transition-all"
                >
                  Going Once
                </button>
                <button
                  onClick={() => triggerGavelAction('GOING_TWICE')}
                  className="py-3.5 px-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-[#D8CFB4] border border-[#D8CFB4]/60 text-xs font-bold uppercase transition-all"
                >
                  Going Twice
                </button>
                <button
                  onClick={() => triggerGavelAction('SOLD')}
                  disabled={!activeLot.currentLeaderId}
                  className="py-3.5 px-3 rounded-[18px] theme-btn-primary text-black text-xs font-bold uppercase disabled:opacity-40 transition-all"
                >
                  🔨 HAMMER SOLD!
                </button>
                <button
                  onClick={() => triggerGavelAction('PASS_UNSOLD')}
                  className="py-3.5 px-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.15] text-white text-xs font-bold uppercase transition-all"
                >
                  Pass Unsold
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SportsAuctionAdminPanel;
