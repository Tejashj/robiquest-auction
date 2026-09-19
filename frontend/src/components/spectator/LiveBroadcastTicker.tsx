'use client';

/**
 * ============================================================================
 * LIVE BROADCAST SPORTS TICKER (LOWER THIRDS)
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Fills & Borders: rgba(255, 255, 255, 0.03) / rgba(255, 255, 255, 0.08)
 *  - Border Radius: 18px
 * ============================================================================
 */

import React from 'react';
import { Radio, Zap, Shield, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const LiveBroadcastTicker: React.FC = () => {
  const { profile, lots, activeLotId, teams, bids, isMuted } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];
  const soldLots = lots.filter((l) => l.status === 'SOLD');

  return (
    <div className="w-full bg-[#000000] border-t border-white/[0.08] py-2.5 px-4 flex items-center relative z-30 overflow-hidden select-none font-poppins">
      {/* Static Left Live Indicator Badge */}
      <div className="flex items-center gap-3 pr-4 border-r border-white/[0.08] flex-shrink-0 z-10 bg-[#000000]">
        {/* Equalizer bars */}
        {!isMuted ? (
          <div className="flex items-end gap-1 h-4 px-1 py-0.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
            <span className="w-1 bg-[#16A085] rounded-[18px] bar-1" />
            <span className="w-1 bg-[#1abc9c] rounded-[18px] bar-2" />
            <span className="w-1 bg-[#16A085] rounded-[18px] bar-3" />
            <span className="w-1 bg-[#1abc9c] rounded-[18px] bar-4" />
          </div>
        ) : (
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A085] animate-ping" />
        )}

        <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2 font-poppins">
          <span className="text-[#16A085] flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            ARENA
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[#1abc9c] flex items-center gap-1.5 font-bold bg-white/[0.03] px-2 py-0.5 rounded-[18px] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A085] animate-ping" /> LIVE
          </span>
        </span>
      </div>

      {/* Marquee Ticker Track */}
      <div className="flex-1 overflow-hidden whitespace-nowrap pl-4 relative">
        <div className="inline-flex items-center gap-10 animate-marquee text-xs font-mono">
          {/* Active Lot Item Info */}
          {activeLot && (
            <div className="inline-flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-[18px] bg-[#16A085]/20 text-[#16A085] font-bold border border-[#16A085]/30">
                STAGE LOT #{activeLot.lotNumber}
              </span>
              <span className="font-poppins font-bold text-white uppercase tracking-wide">{activeLot.title}</span>
              <span className="text-slate-400">BID:</span>
              <span className="text-[#D8CFB4] font-bold text-sm">
                {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
              </span>
              {activeLot.currentLeaderName ? (
                <span className="text-[#16A085] font-bold bg-white/[0.03] px-2 py-0.5 rounded-[18px] border border-white/[0.08]">
                  [{activeLot.currentLeaderName} #{activeLot.currentLeaderPaddle}]
                </span>
              ) : (
                <span className="text-slate-500">[AWAITING FLOOR BID]</span>
              )}
            </div>
          )}

          <span className="text-white/20 text-sm font-bold">✦</span>

          {/* Dynamic Teams Quick Purse Standings */}
          <div className="inline-flex items-center gap-3.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider">FRANCHISE PURSES:</span>
            {teams.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-[18px] border border-white/[0.08]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#16A085' }} />
                <span className="text-white font-bold font-poppins">{t.shortCode}:</span>
                <span className="text-[#D8CFB4] font-bold">
                  {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                </span>
              </span>
            ))}
          </div>

          <span className="text-white/20 text-sm font-bold">✦</span>

          {/* Sold Summary */}
          {soldLots.length > 0 && (
            <div className="inline-flex items-center gap-2.5 bg-white/[0.03] px-3 py-1 rounded-[18px] border border-white/[0.08]">
              <Trophy className="w-4 h-4 text-[#D8CFB4] inline" />
              <span className="text-[#16A085] font-bold uppercase">HAMMER SALE:</span>
              <span className="text-white font-bold">{soldLots[soldLots.length - 1].title}</span>
              <span className="text-[#16A085] font-bold">
                ACQUIRED BY {soldLots[soldLots.length - 1].currentLeaderName?.toUpperCase()} (
                {formatAuctionCurrency(soldLots[soldLots.length - 1].currentHighBid, profile.currency)})
              </span>
            </div>
          )}

          <span className="text-white/20 text-sm font-bold">✦</span>

          {/* Tournament Slogan */}
          <div className="inline-flex items-center gap-2 text-[#16A085]">
            <Sparkles className="w-3.5 h-3.5 text-[#D8CFB4]" />
            <span className="font-poppins font-bold text-white tracking-wide">{profile.title.toUpperCase()}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-normal">{profile.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBroadcastTicker;
