'use client';

/**
 * ============================================================================
 * UPCOMING QUEUE ("ON DECK" CAROUSEL)
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Fills & Borders: rgba(255, 255, 255, 0.03) / rgba(255, 255, 255, 0.08)
 *  - Border Radius: 18px everywhere
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
    <div className="w-full rounded-[18px] bg-[#000000] border border-white/[0.08] p-5 xl:p-6 space-y-4 font-poppins">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16A085]">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs xl:text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span>On Deck: Next Lots In Line</span>
            <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono bg-white/[0.03] text-[#16A085] border border-white/[0.08]">
              {upcomingLots.length} Queued
            </span>
          </h3>
        </div>
        <span className="text-[11px] text-slate-300 font-mono tracking-wider bg-white/[0.03] px-3 py-1 rounded-[18px] border border-white/[0.08]">
          ORDER OF SALE
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {upcomingLots.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLot(item.id)}
            className="flex-shrink-0 w-72 p-4 rounded-[18px] bg-[#000000] border border-white/[0.08] hover:border-[#16A085] transition-all group cursor-pointer"
            title="Click to Send to Live Stage"
          >
            <div className="flex gap-3.5 items-center">
              <div className="w-16 h-16 rounded-[18px] overflow-hidden bg-black border border-white/[0.08] flex-shrink-0">
                <img
                  src={item.imageUrls[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                    LOT #{item.lotNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate ml-1">{item.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-[#16A085] transition-colors font-poppins">
                  {item.title}
                </h4>
                <div className="text-[11px] font-mono font-bold text-[#D8CFB4] mt-1.5 flex items-center justify-between">
                  <span>Open: {formatAuctionCurrency(item.startingBid, profile.currency)}</span>
                  <span className="text-[10px] text-[#16A085] opacity-0 group-hover:opacity-100 flex items-center gap-1 font-bold transition-opacity bg-white/[0.03] px-1.5 py-0.5 rounded-[18px] border border-white/[0.08]">
                    <Play className="w-2.5 h-2.5 fill-[#16A085]" /> Stage
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

export default UpcomingQueueCarousel;
