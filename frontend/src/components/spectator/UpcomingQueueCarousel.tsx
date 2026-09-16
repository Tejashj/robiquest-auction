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
    <div className="w-full rounded-[18px] bg-black border border-white/10 p-5 xl:p-6 space-y-3 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#16A085]" />
          <h3 className="text-xs xl:text-sm font-black uppercase tracking-widest text-[#D8CFB4] font-poppins">
            On Deck: Next Lots In Line ({upcomingLots.length})
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">ORDER OF SALE</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {upcomingLots.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLot(item.id)}
            className="flex-shrink-0 w-64 p-3.5 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 hover:border-[#16A085]/50 transition-all group cursor-pointer"
            title="Click to Send to Live Stage"
          >
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-[18px] overflow-hidden bg-black border border-white/10 flex-shrink-0">
                <img
                  src={item.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#16A085]">
                    LOT #{item.lotNumber}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate ml-1">{item.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-[#D8CFB4] transition-colors font-poppins">
                  {item.title}
                </h4>
                <div className="text-[11px] font-mono font-semibold text-[#D8CFB4] mt-1 flex items-center justify-between">
                  <span>Open: {formatAuctionCurrency(item.startingBid, profile.currency)}</span>
                  <span className="text-[9px] text-[#16A085] opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
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
