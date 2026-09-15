'use client';

/**
 * ============================================================================
 * LIVE EVENT BROADCAST MARQUEE
 * Real-Time Streaming Ticker for Instant Bidding & Hammer Feeds
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Zap, Trophy, TrendingUp } from 'lucide-react';
import { useSpectatorStore } from '../../store/spectator-store';

export const LiveEventMarquee: React.FC = () => {
  const { recentEvents } = useSpectatorStore();

  return (
    <div className="w-full bg-[#03050a] border-y border-white/10 px-4 py-2 flex items-center gap-3 overflow-hidden">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        LIVE WIRE
      </div>

      {/* Ticker Stream */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 28,
            ease: 'linear',
          }}
          className="flex items-center gap-8 whitespace-nowrap text-xs font-mono"
        >
          {/* Double the list for seamless continuous infinite marquee loop */}
          {[...recentEvents, ...recentEvents].map((evt, idx) => (
            <div key={`${evt.id}-${idx}`} className="flex items-center gap-2 text-slate-300">
              {evt.type === 'HAMMER' ? (
                <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                  <Trophy className="w-3 h-3" />
                </span>
              ) : (
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-300">
                  <Zap className="w-3 h-3" />
                </span>
              )}
              {evt.teamCode && (
                <span className="font-bold text-amber-300">[{evt.teamCode}]</span>
              )}
              <span className="text-slate-200">{evt.text}</span>
              <span className="text-white/20">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
