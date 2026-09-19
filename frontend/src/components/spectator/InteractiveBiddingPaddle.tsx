'use client';

/**
 * ============================================================================
 * INTERACTIVE PHYSICAL BIDDING PADDLE COMPONENT
 * Authentic Auction Paddle with Up/Down Physics, Wooden Handle,
 * Franchise Crest, and Glowing High-Contrast Numerals.
 * Strictly Styled:
 *  - Primary: #16A085 (Hover: #1abc9c, Glow: rgba(22, 160, 133, 0.35))
 *  - Headline Accent: #D8CFB4
 *  - Pitch Black: #000000
 *  - Radius: 18px
 *  - Font: Poppins
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, ArrowUp, X } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  BidEvent,
} from '../../store/auction-engine-store';

interface InteractiveBiddingPaddleProps {
  position?: 'bottom-right' | 'bottom-center' | 'stage-embedded';
  compact?: boolean;
}

export const InteractiveBiddingPaddle: React.FC<InteractiveBiddingPaddleProps> = ({
  position = 'bottom-right',
  compact = false,
}) => {
  const { lastBidEvent, clearLastBidEvent, profile } = useAuctionEngineStore();
  const [activePaddle, setActivePaddle] = useState<BidEvent | null>(null);

  // Auto-dismiss paddle after 3.2 seconds
  useEffect(() => {
    if (lastBidEvent) {
      setActivePaddle(lastBidEvent);
      const timer = setTimeout(() => {
        setActivePaddle(null);
      }, 3400);

      return () => clearTimeout(timer);
    }
  }, [lastBidEvent]);

  if (!activePaddle) return null;

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
    'stage-embedded': 'absolute bottom-4 right-4 z-30',
  }[position];

  return (
    <AnimatePresence>
      <div className={`${positionClasses} pointer-events-auto font-poppins select-none`}>
        <motion.div
          key={activePaddle.id}
          initial={{ y: 280, rotate: -22, opacity: 0, scale: 0.8 }}
          animate={{
            y: 0,
            rotate: [ -22, 4, -2, 0 ],
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 18,
              mass: 0.8,
            },
          }}
          exit={{
            y: 300,
            rotate: 15,
            opacity: 0,
            scale: 0.85,
            transition: { duration: 0.35, ease: 'easeIn' },
          }}
          className="relative flex flex-col items-center"
        >
          {/* Quick Dismiss Button */}
          <button
            onClick={() => {
              setActivePaddle(null);
              clearLastBidEvent();
            }}
            className="absolute -top-3 -right-3 z-50 p-1.5 rounded-full bg-black/80 hover:bg-black text-slate-400 hover:text-white border border-white/10 transition-colors shadow-lg"
            title="Dismiss Paddle"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Glowing Aura Ring around Paddle */}
          <div
            className="absolute -inset-3 rounded-[32px] blur-xl opacity-50 animate-pulse pointer-events-none"
            style={{ backgroundColor: activePaddle.teamColor || '#16A085' }}
          />

          {/* =================================================================
              PADDLE HEAD (High-Gloss Textured Face with Metallic Rims)
              ================================================================= */}
          <div
            className="relative w-64 sm:w-72 rounded-[26px] p-1 bg-gradient-to-b from-[#D8CFB4]/40 via-white/10 to-[#16A085]/60 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            style={{
              borderColor: activePaddle.teamColor || '#16A085',
            }}
          >
            <div className="relative w-full rounded-[22px] bg-[#000000] border-2 border-white/10 p-4 sm:p-5 flex flex-col items-center overflow-hidden">
              {/* Gloss Light Sweep Animation */}
              <motion.div
                initial={{ x: '-150%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
              />

              {/* Top Pill: Floor Bid Status */}
              <div className="w-full flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-[#16A085] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#16A085] animate-ping" />
                  FLOOR BID IN PLAY
                </span>
                <span className="text-[10px] font-mono text-[#D8CFB4] font-bold bg-white/5 px-2 py-0.5 rounded-[12px] border border-[#D8CFB4]/20 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-[#16A085]" />
                  RAISED
                </span>
              </div>

              {/* CENTER: GIANT PADDLE NUMBER */}
              <div className="py-2.5 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  OFFICIAL PADDLE
                </span>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-[#D8CFB4] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  #{String(activePaddle.paddleNumber).padStart(2, '0')}
                </div>
              </div>

              {/* FRANCHISE BADGE & LOGO */}
              <div
                className="w-full mt-1 p-2.5 rounded-[16px] bg-white/[0.03] border border-white/10 flex items-center gap-3"
                style={{
                  borderLeftColor: activePaddle.teamColor || '#16A085',
                  borderLeftWidth: '4px',
                }}
              >
                {activePaddle.teamLogoUrl ? (
                  <div className="w-9 h-9 rounded-[12px] bg-black border border-white/10 p-0.5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={activePaddle.teamLogoUrl}
                      alt={activePaddle.teamName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-300">
                    <Shield className="w-4 h-4" />
                  </div>
                )}

                <div className="truncate text-left">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#16A085] tracking-wider truncate">
                    {activePaddle.shortCode || 'TEAM'}
                  </div>
                  <div className="text-xs font-bold text-white uppercase truncate font-poppins">
                    {activePaddle.teamName}
                  </div>
                </div>
              </div>

              {/* CURRENT BID CHIP */}
              <div className="w-full mt-2.5 py-2 px-3 rounded-[16px] bg-[#16A085]/15 border border-[#16A085]/40 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#D8CFB4] font-semibold">
                  Tendered Bid
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-[#D8CFB4] tracking-tight">
                  {formatAuctionCurrency(activePaddle.amount, profile.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================
              WOODEN PADDLE HANDLE (Turned Natural Wood Texture)
              ================================================================= */}
          <div className="relative -mt-1 flex flex-col items-center">
            {/* Paddle Neck Connector Ring (Brass / Gold Accent) */}
            <div className="w-10 h-3 rounded-full bg-gradient-to-r from-[#D8CFB4] via-amber-200 to-[#D8CFB4] shadow-md border border-amber-400/40 z-10" />

            {/* Turned Wood Shaft */}
            <div className="w-6 h-28 sm:h-36 bg-gradient-to-r from-[#4a2e18] via-[#8c5828] to-[#4a2e18] rounded-b-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] border-x border-[#361e0b] relative overflow-hidden">
              {/* Wood Grain Highlights */}
              <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,#000000,#000000_2px,transparent_2px,transparent_6px)]" />
              {/* Grip Indentations */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-black/40" />
              <div className="absolute top-12 left-0 right-0 h-1 bg-black/40" />
              <div className="absolute top-16 left-0 right-0 h-1 bg-black/40" />
              <div className="absolute top-20 left-0 right-0 h-1 bg-black/40" />
            </div>

            {/* Handle Pommel End Cap */}
            <div className="w-8 h-3 -mt-1 rounded-full bg-gradient-to-r from-[#D8CFB4] via-amber-200 to-[#D8CFB4] border border-amber-500/30 shadow-sm" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InteractiveBiddingPaddle;
