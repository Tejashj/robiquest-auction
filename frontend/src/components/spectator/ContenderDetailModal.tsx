'use client';

/**
 * ============================================================================
 * CONTENDER DETAIL MODAL (SPECTATOR & SCOUTING SPEC SHEET)
 * Cyber Stadium HUD with Glassmorphism
 * Theme:
 *  - Primary: #16A085
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React from 'react';
import {
  X,
  Shield,
  Zap,
  Cpu,
  Trophy,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  AuctionLotItem,
  formatAuctionCurrency,
  useAuctionEngineStore,
} from '../../store/auction-engine-store';

interface ContenderDetailModalProps {
  lot: AuctionLotItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContenderDetailModal: React.FC<ContenderDetailModalProps> = ({
  lot,
  isOpen,
  onClose,
}) => {
  const { profile, teams } = useAuctionEngineStore();

  if (!isOpen || !lot) return null;

  const winningTeam = lot.currentLeaderId
    ? teams.find((t) => t.id === lot.currentLeaderId)
    : null;

  const stats = lot.contenderStats;
  const playerStats = lot.playerStats;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-poppins">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[18px] bg-[#000000] border border-white/[0.08] p-6 sm:p-8 text-white space-y-6 shadow-2xl selection:bg-[#16A085]/30">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-[#16A085]/40 flex items-center justify-center text-[#16A085] flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                  LOT #{lot.lotNumber}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {lot.category}
                </span>
                {lot.status === 'SOLD' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085] text-black">
                    <CheckCircle2 className="w-3 h-3" />
                    SOLD
                  </span>
                )}
                {lot.status === 'PASSED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.08] text-amber-400 border border-amber-400/30">
                    <AlertCircle className="w-3 h-3" />
                    PASSED
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mt-1 font-poppins">
                {lot.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image & Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          <div className="w-full h-56 rounded-[18px] overflow-hidden border border-white/[0.08] bg-white/[0.02] flex items-center justify-center p-2">
            {lot.imageUrls && lot.imageUrls[0] ? (
              <img
                src={lot.imageUrls[0]}
                alt={lot.title}
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <div className="text-center text-slate-500 font-mono text-xs">
                <Cpu className="w-10 h-10 mx-auto mb-2 text-[#16A085]" />
                Contender Imagery
              </div>
            )}
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Starting Base Price
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {formatAuctionCurrency(lot.startingBid, profile.currency)}
              </div>
            </div>

            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {lot.status === 'SOLD' ? 'Hammer Sale Price' : 'Current High Bid'}
              </span>
              <div className="text-2xl font-bold font-mono text-[#D8CFB4] mt-0.5">
                {formatAuctionCurrency(lot.currentHighBid, profile.currency)}
              </div>
            </div>

            {winningTeam && (
              <div
                className="p-3.5 rounded-[18px] border flex items-center gap-3 bg-[#000000]"
                style={{ borderColor: winningTeam.color || '#16A085' }}
              >
                <div
                  className="w-10 h-10 rounded-[14px] overflow-hidden border p-1 bg-black flex-shrink-0"
                  style={{ borderColor: winningTeam.color || '#16A085' }}
                >
                  <img
                    src={winningTeam.logoUrl}
                    alt={winningTeam.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase text-[#16A085] font-bold">
                    Acquiring Franchise
                  </div>
                  <div className="text-sm font-bold text-white uppercase truncate">
                    {winningTeam.name} (#{winningTeam.paddleNumber})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Combat / Technical Ratings */}
        {stats && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16A085]" />
              Specification & Telemetry Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'AI Compute', val: stats.aiCompute, icon: Cpu },
                { label: 'Power', val: stats.power, icon: Zap },
                { label: 'Velocity', val: stats.velocity, icon: Flame },
                { label: 'Armor', val: stats.armor, icon: Shield },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[18px] bg-white/[0.03] border border-white/[0.08]"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>{item.label}</span>
                    <item.icon className="w-3 h-3 text-[#16A085]" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {item.val || 80}/100
                  </div>
                  <div className="w-full h-1.5 rounded-[18px] bg-white/[0.08] mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-[18px] bg-[#16A085]"
                      style={{ width: `${item.val || 80}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sports Statistics (if applicable) */}
        {playerStats && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D8CFB4]" />
              Player Career Metrics
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Matches</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {playerStats.matches ?? '-'}
                </div>
              </div>
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Runs</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {playerStats.runs ?? '-'}
                </div>
              </div>
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Wickets</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {playerStats.wickets ?? '-'}
                </div>
              </div>
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Strike Rate</div>
                <div className="text-base font-bold font-mono text-[#16A085] mt-0.5">
                  {playerStats.strikeRate ?? '-'}
                </div>
              </div>
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Economy</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {playerStats.economy ?? '-'}
                </div>
              </div>
              <div className="p-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-slate-400">Average</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {playerStats.average ?? '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Attributes / Specifications */}
        {lot.attributes && Object.keys(lot.attributes).length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#16A085]" />
              Detailed Attributes & Specifications
            </h4>
            <div className="space-y-1.5">
              {Object.entries(lot.attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="px-3.5 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-400 uppercase text-[11px]">
                    {key}
                  </span>
                  <span className="font-medium text-white text-right ml-4">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all"
          >
            Close Spec Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContenderDetailModal;
