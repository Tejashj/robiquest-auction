'use client';

/**
 * ============================================================================
 * SOLD CONTENDERS SHOWCASE (SPECTATOR & SCOUTING VIEW)
 * Real-time showroom of all hammer sales, franchise acquisitions, and records
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Eye,
  ArrowUpDown,
  Sparkles,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionLotItem,
} from '../../store/auction-engine-store';
import { ContenderDetailModal } from './ContenderDetailModal';

export const SoldContendersView: React.FC = () => {
  const { lots, profile, teams } = useAuctionEngineStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_DESC' | 'PRICE_ASC' | 'LOT_ASC' | 'RECENT'>('RECENT');
  const [inspectLot, setInspectLot] = useState<AuctionLotItem | null>(null);

  // Filter only SOLD lots
  const soldLots = useMemo(() => {
    return lots.filter((lot) => lot.status === 'SOLD');
  }, [lots]);

  // Aggregate metrics
  const totalSpent = useMemo(() => {
    return soldLots.reduce((acc, lot) => acc + lot.currentHighBid, 0);
  }, [soldLots]);

  const topBuy = useMemo(() => {
    if (soldLots.length === 0) return null;
    return [...soldLots].sort((a, b) => b.currentHighBid - a.currentHighBid)[0];
  }, [soldLots]);

  const topBuyTeam = topBuy && topBuy.currentLeaderId
    ? teams.find((t) => t.id === topBuy.currentLeaderId)
    : null;

  const averagePrice = soldLots.length > 0 ? Math.round(totalSpent / soldLots.length) : 0;

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    soldLots.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [soldLots]);

  // Filtered and sorted lots
  const filteredLots = useMemo(() => {
    return soldLots
      .filter((lot) => {
        const matchesSearch =
          lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lot.roleBadge && lot.roleBadge.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (lot.currentLeaderName && lot.currentLeaderName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTeam =
          selectedTeamFilter === 'ALL' || lot.currentLeaderId === selectedTeamFilter;

        const matchesCategory =
          selectedCategoryFilter === 'ALL' || lot.category === selectedCategoryFilter;

        return matchesSearch && matchesTeam && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_DESC') return b.currentHighBid - a.currentHighBid;
        if (sortBy === 'PRICE_ASC') return a.currentHighBid - b.currentHighBid;
        if (sortBy === 'LOT_ASC') return a.lotNumber - b.lotNumber;
        return 0; // RECENT retains natural gavel order
      });
  }, [soldLots, searchQuery, selectedTeamFilter, selectedCategoryFilter, sortBy]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 font-poppins selection:bg-[#16A085]/30">
      {/* Contender Detailed Specs Modal */}
      <ContenderDetailModal
        lot={inspectLot}
        isOpen={!!inspectLot}
        onClose={() => setInspectLot(null)}
      />

      {/* =====================================================================
          TOP KPI AGGREGATE SUMMARY RIBBON
          ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contenders Sold */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A085]" />
              Contenders Sold
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {soldLots.length}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              of {lots.length} total lots
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* Total Capital Spent */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#D8CFB4]" />
              Total Spent
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#D8CFB4] mt-1">
              {formatAuctionCurrency(totalSpent, profile.currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              across all franchises
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D8CFB4]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Record Top Buy */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#16A085]" />
              Tournament Record Sale
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 truncate">
              {topBuy ? formatAuctionCurrency(topBuy.currentHighBid, profile.currency) : '-'}
            </div>
            <span className="text-[11px] text-[#16A085] font-mono truncate block">
              {topBuy ? `${topBuy.title} (${topBuy.currentLeaderName || 'Floor'})` : 'No sales yet'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Average Hammer Price */}
        <div className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#16A085]" />
              Average Hammer
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {formatAuctionCurrency(averagePrice, profile.currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              per acquired lot
            </span>
          </div>
          <div className="w-12 h-12 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* =====================================================================
          FILTER & CONTROLS TOOLBAR
          ===================================================================== */}
      <div className="p-4 rounded-[18px] bg-[#000000] border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sold contenders, buyer franchise, category, role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] focus:border-[#16A085] text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Buying Team Filter */}
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="px-3 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white outline-none focus:border-[#16A085] transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-black text-white">All Franchises</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-black text-white">
                {t.name} (#{t.paddleNumber})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white outline-none focus:border-[#16A085] transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-black text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-black text-white">
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white outline-none focus:border-[#16A085] transition-all cursor-pointer"
          >
            <option value="RECENT" className="bg-black text-white">Most Recent Sale</option>
            <option value="PRICE_DESC" className="bg-black text-white">Highest Price (High → Low)</option>
            <option value="PRICE_ASC" className="bg-black text-white">Lowest Price (Low → High)</option>
            <option value="LOT_ASC" className="bg-black text-white">Lot Number (1 → N)</option>
          </select>
        </div>
      </div>

      {/* =====================================================================
          SOLD CONTENDERS GRID
          ===================================================================== */}
      {filteredLots.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] bg-[#000000] border border-white/[0.08] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <Gavel className="w-8 h-8 opacity-80" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase font-poppins">
              {soldLots.length === 0 ? 'No Contenders Sold Yet' : 'No Contenders Match Filters'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1 max-w-md mx-auto">
              {soldLots.length === 0
                ? 'The auction floor is actively underway. As hammer strikes conclude on live lots, winning sales and acquisitions will appear here in real time.'
                : 'Try adjusting your search keywords or clearing franchise/category filters.'}
            </p>
          </div>
          {soldLots.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTeamFilter('ALL');
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
          {filteredLots.map((lot) => {
            const buyerTeam = lot.currentLeaderId
              ? teams.find((t) => t.id === lot.currentLeaderId)
              : null;

            const markupPct =
              lot.startingBid > 0
                ? Math.round(((lot.currentHighBid - lot.startingBid) / lot.startingBid) * 100)
                : 0;

            return (
              <div
                key={lot.id}
                className="rounded-[18px] bg-[#000000] border border-white/[0.08] hover:border-white/[0.2] transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                {/* Image & Top Badges */}
                <div className="relative h-48 w-full bg-white/[0.02] border-b border-white/[0.08] overflow-hidden flex items-center justify-center">
                  {lot.imageUrls && lot.imageUrls[0] ? (
                    <img
                      src={lot.imageUrls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-600 font-mono text-xs text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-1 text-[#16A085]/60" />
                      RoboCell Contender
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Header Tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-bold bg-black/80 text-[#16A085] border border-[#16A085]/40 backdrop-blur-md">
                      LOT #{lot.lotNumber}
                    </span>

                    <span className="px-2.5 py-1 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085] text-black">
                      HAMMER SOLD
                    </span>
                  </div>

                  {/* Bottom Category Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300 uppercase truncate">
                      {lot.category}
                    </span>
                    {lot.roleBadge && (
                      <span className="px-2 py-0.5 rounded-[18px] bg-white/[0.1] text-white border border-white/[0.15] text-[9px] font-bold">
                        {lot.roleBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-tight line-clamp-1 font-poppins">
                      {lot.title}
                    </h4>

                    {/* Pricing Comparison */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          Base Price
                        </span>
                        <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                          {formatAuctionCurrency(lot.startingBid, profile.currency)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-[#16A085] uppercase font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Sold Price
                        </span>
                        <div className="text-base font-mono font-bold text-[#D8CFB4] mt-0.5">
                          {formatAuctionCurrency(lot.currentHighBid, profile.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Price markup badge */}
                    {markupPct > 0 && (
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Price Appreciation:</span>
                        <span className="text-[#16A085] font-bold">
                          +{markupPct}% over base
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Winning Team Banner */}
                  {buyerTeam && (
                    <div
                      className="p-3 rounded-[18px] border flex items-center justify-between bg-black/60"
                      style={{ borderColor: buyerTeam.color || '#16A085' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-[12px] overflow-hidden border p-0.5 bg-black flex-shrink-0"
                          style={{ borderColor: buyerTeam.color || '#16A085' }}
                        >
                          <img
                            src={buyerTeam.logoUrl}
                            alt={buyerTeam.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono uppercase text-[#16A085] font-bold block">
                            Acquired by
                          </span>
                          <span className="text-xs font-bold text-white uppercase truncate block font-poppins">
                            {buyerTeam.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold text-black flex-shrink-0 ml-2"
                        style={{ backgroundColor: buyerTeam.color || '#16A085' }}
                      >
                        #{buyerTeam.paddleNumber}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Bids Placed: <strong className="text-white">{lot.bidsCount || 1}</strong>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SoldContendersView;
