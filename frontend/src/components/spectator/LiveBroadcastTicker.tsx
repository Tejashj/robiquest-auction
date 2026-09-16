'use client';

/**
 * ============================================================================
 * LIVE BROADCAST SPORTS TICKER (LOWER THIRDS)
 * TV Sports Style Marquee with Real-time Tournament Events:
 *  - Active Lot on Stage & Highest Bid
 *  - Current Leading Franchise & Paddle
 *  - Live Franchise Purse Standings (4 Teams)
 *  - Recent Hammer Sales & Tournament Announcements
 * ============================================================================
 */

import React from 'react';
import { Radio, Zap, Shield, TrendingUp, Trophy } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const LiveBroadcastTicker: React.FC = () => {
  const { profile, lots, activeLotId, teams, bids } = useAuctionEngineStore();

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  const recentBids = bids.slice(-3).reverse();
  const soldLots = lots.filter((l) => l.status === 'SOLD');

  return (
    <div className="w-full bg-[#040817]/95 border-t border-cyan-500/30 backdrop-blur-xl py-2 px-4 flex items-center shadow-2xl relative z-30 overflow-hidden select-none">
      {/* Static Left Badge */}
      <div className="flex items-center gap-2 pr-4 border-r border-white/15 flex-shrink-0 z-10 bg-[#040817]">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="text-[11px] font-mono font-black tracking-widest text-white uppercase flex items-center gap-1">
          <span className="text-cyan-400">ROBICELL</span>
          <span className="text-slate-500">•</span>
          <span>ON AIR</span>
        </span>
      </div>

      {/* Marquee Ticker Track */}
      <div className="flex-1 overflow-hidden whitespace-nowrap pl-4 relative">
        <div className="inline-flex items-center gap-8 animate-marquee text-xs font-mono">
          {/* Active Lot Item Info */}
          {activeLot && (
            <div className="inline-flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                LOT #{activeLot.lotNumber} ACTIVE
              </span>
              <span className="font-bold text-white uppercase">{activeLot.title}</span>
              <span className="text-slate-400">CURRENT:</span>
              <span className="text-amber-400 font-black">
                {formatAuctionCurrency(activeLot.currentHighBid, profile.currency)}
              </span>
              {activeLot.currentLeaderName ? (
                <span className="text-cyan-300">
                  [{activeLot.currentLeaderName} #{activeLot.currentLeaderPaddle}]
                </span>
              ) : (
                <span className="text-slate-500">[AWAITING OPENING BID]</span>
              )}
            </div>
          )}

          <span className="text-slate-600">✦</span>

          {/* 4 Teams Quick Purse Standings */}
          <div className="inline-flex items-center gap-3">
            <span className="text-slate-400 font-bold uppercase">TEAM PURSES:</span>
            {teams.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-white font-bold">{t.shortCode}:</span>
                <span style={{ color: t.accentColor }}>
                  {formatAuctionCurrency(t.remainingPurse, profile.currency)}
                </span>
              </span>
            ))}
          </div>

          <span className="text-slate-600">✦</span>

          {/* Sold Summary */}
          {soldLots.length > 0 && (
            <div className="inline-flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400 inline" />
              <span className="text-slate-300 font-bold uppercase">LATEST SALE:</span>
              <span className="text-white font-bold">{soldLots[soldLots.length - 1].title}</span>
              <span className="text-emerald-400 font-black">
                SOLD TO {soldLots[soldLots.length - 1].currentLeaderName} (
                {formatAuctionCurrency(soldLots[soldLots.length - 1].currentHighBid, profile.currency)})
              </span>
            </div>
          )}

          <span className="text-slate-600">✦</span>

          {/* Tournament Slogan */}
          <div className="inline-flex items-center gap-2 text-cyan-300">
            <span>ROBIQUEST 2026</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">CONDUCTED BY ROBOCELL</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">TECH, TRANSFORM, THRIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
