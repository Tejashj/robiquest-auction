'use client';

/**
 * ============================================================================
 * UNSOLD / PASSED CONTENDERS SHOWCASE (SPECTATOR & SCOUTING VIEW)
 * Real-time catalog of passed lots awaiting accelerated re-auction
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Search,
  DollarSign,
  Layers,
  RotateCcw,
  Sparkles,
  Eye,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionLotItem,
} from '../../store/auction-engine-store';
import { ContenderDetailModal } from './ContenderDetailModal';

export const UnsoldContendersView: React.FC = () => {
  const { lots, profile } = useAuctionEngineStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [inspectLot, setInspectLot] = useState<AuctionLotItem | null>(null);

  // Filter only PASSED / UNSOLD lots
  const unsoldLots = useMemo(() => {
    return lots.filter((lot) => lot.status === 'PASSED');
  }, [lots]);

  // Aggregate metrics
  const totalBaseValue = useMemo(() => {
    return unsoldLots.reduce((acc, lot) => acc + lot.startingBid, 0);
  }, [unsoldLots]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    unsoldLots.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [unsoldLots]);

  // Filtered list
  const filteredLots = useMemo(() => {
    return unsoldLots.filter((lot) => {
      const matchesSearch =
        lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lot.roleBadge && lot.roleBadge.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'ALL' || lot.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [unsoldLots, searchQuery, selectedCategoryFilter]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 font-poppins selection:bg-[#16A085]/30">
      {/* Contender Detailed Specs Modal */}
      <ContenderDetailModal
        lot={inspectLot}
        isOpen={!!inspectLot}
        onClose={() => setInspectLot(null)}
      />

      {/* =====================================================================
          TOP METRICS & RULES BANNER
          ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Unsold Count */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Passed Contenders
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {unsoldLots.length}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              of {lots.length} total tournament lots
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Base Valuation */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#D8CFB4]" />
              Total Base Valuation
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#D8CFB4] mt-1">
              {formatAuctionCurrency(totalBaseValue, profile.currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              combined reserve pool
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D8CFB4]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Re-Auction Accelerated Rule Notice */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-start gap-3">
          <div className="w-9 h-9 rounded-[14px] bg-[#16A085]/10 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] flex-shrink-0 mt-0.5">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#16A085] uppercase tracking-wider font-bold block">
              Accelerated Round Notice
            </span>
            <p className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed">
              Unsold lots remain eligible for the <strong>Accelerated Re-Auction Round</strong> upon conclusion of the primary catalog.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          FILTER & SEARCH TOOLBAR
          ===================================================================== */}
      <div className="p-4 rounded-[18px] bg-[#000000] border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search unsold contenders by name, category, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] focus:border-[#16A085] text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white outline-none focus:border-[#16A085] transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-black text-white">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-black text-white">
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* =====================================================================
          UNSOLD LOTS GRID
          ===================================================================== */}
      {filteredLots.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <CheckCircle2 className="w-8 h-8 opacity-90 text-[#16A085]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase font-poppins">
              {unsoldLots.length === 0 ? 'Clean Floor Record • Zero Unsold Lots' : 'No Contenders Match Search'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1 max-w-md mx-auto">
              {unsoldLots.length === 0
                ? 'Every contender brought to the floor so far has received qualifying bids and found an acquiring franchise!'
                : 'No passed lots match your search query. Try resetting your filter.'}
            </p>
          </div>
          {unsoldLots.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono font-bold text-[#16A085] transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="rounded-[18px] bg-[#000000] border border-white/[0.08] hover:border-white/[0.2] transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
            >
              {/* Image & Top Badges */}
              <div className="relative h-44 w-full bg-white/[0.02] border-b border-white/[0.08] overflow-hidden flex items-center justify-center">
                {lot.imageUrls && lot.imageUrls[0] ? (
                  <img
                    src={lot.imageUrls[0]}
                    alt={lot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                ) : (
                  <div className="text-slate-600 font-mono text-xs text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                    Contender Imagery
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-bold bg-black/80 text-white border border-white/[0.2]">
                    LOT #{lot.lotNumber}
                  </span>

                  <span className="px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-bold bg-white/[0.1] text-amber-400 border border-amber-400/40">
                    PASSED BY FLOOR
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 uppercase truncate">
                    {lot.category}
                  </span>
                  {lot.roleBadge && (
                    <span className="px-2 py-0.5 rounded-[18px] bg-white/[0.1] text-slate-300 border border-white/[0.15] text-[9px] font-bold">
                      {lot.roleBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight line-clamp-1 font-poppins">
                    {lot.title}
                  </h4>

                  {/* Reserve Base Price */}
                  <div className="mt-3 p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Base Reserve
                    </span>
                    <span className="text-base font-mono font-bold text-[#D8CFB4]">
                      {formatAuctionCurrency(lot.startingBid, profile.currency)}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 mt-2.5">
                    No qualifying opening bids received during primary stage run.
                  </p>
                </div>

                {/* Inspect specs action */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400/80 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Eligible for Re-Entry
                  </span>

                  <button
                    onClick={() => setInspectLot(lot)}
                    className="px-3 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-[#16A085] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Specs</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnsoldContendersView;
