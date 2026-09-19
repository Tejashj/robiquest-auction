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
    <div className="w-full bg-[#000000] border-y border-white/[0.08] px-4 py-2 flex items-center gap-3 overflow-hidden font-poppins">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 text-[#16A085] text-xs font-mono font-bold flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#16A085] animate-ping" />
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
            <div key={`${evt.id}-${idx}`} className="flex items-center gap-2 text-gray-300">
              {evt.type === 'HAMMER' ? (
                <span className="p-1 rounded-[18px] bg-[#D8CFB4]/20 text-[#D8CFB4]">
                  <Trophy className="w-3 h-3" />
                </span>
              ) : (
                <span className="p-1 rounded-[18px] bg-[#16A085]/20 text-[#16A085]">
                  <Zap className="w-3 h-3" />
                </span>
              )}
              {evt.teamCode && (
                <span className="font-bold text-[#D8CFB4]">[{evt.teamCode}]</span>
              )}
              <span className="text-white">{evt.text}</span>
              <span className="text-white/20">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
