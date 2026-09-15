'use client';

/**
 * ============================================================================
 * UPCOMING QUEUE ("ON DECK" CAROUSEL - BOUND TO USER-DRIVEN STORE)
 * Reflects Actual Ingested or User-Created Lots
 * ============================================================================
 */

import React from 'react';
import { Layers, Play } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const UpcomingQueueCarousel: React.FC = () => {
  const { lots, activeLotId, setActiveLot, profile } = useAuctionEngineStore();

  const upcomingLots = lots.filter((l) => l.id !== activeLotId);

  if (upcomingLots.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-3xl bg-[#060914]/80 border border-white/10 p-5 xl:p-6 space-y-3 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs xl:text-sm font-extrabold uppercase tracking-widest text-slate-300">
            On Deck: Next Lots In Line ({upcomingLots.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">ORDER OF SALE</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {upcomingLots.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLot(item.id)}
            className="flex-shrink-0 w-64 p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-400/40 transition-all group cursor-pointer"
            title="Click to Send to Live Stage"
          >
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                <img
                  src={item.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    LOT #{item.lotNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate ml-1">{item.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <div className="text-[11px] font-mono font-semibold text-emerald-400 mt-1 flex items-center justify-between">
                  <span>Open: {formatAuctionCurrency(item.startingBid, profile.currency)}</span>
                  <span className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                    <Play className="w-2.5 h-2.5" /> Stage
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
