'use client';

/**
 * ============================================================================
 * ANIMATED GAVEL & HAMMER STRIKE COMPONENT
 * Authentic Turned Wooden & Brass Auctioneer's Gavel with Sound Block,
 * Radial Shockwave Physics, Particle Sparks, and Broadcast Callouts.
 * Strictly Styled:
 *  - Primary: #16A085
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Radius: 18px
 *  - Font: Poppins
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Sparkles, AlertOctagon, Trophy, X } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  GavelEvent,
} from '../../store/auction-engine-store';

export const GavelHammerStrike: React.FC = () => {
  const { activeGavelEvent, dismissGavelEvent, profile } = useAuctionEngineStore();
  const [currentEvent, setCurrentEvent] = useState<GavelEvent | null>(null);

  useEffect(() => {
    if (activeGavelEvent) {
      setCurrentEvent(activeGavelEvent);
      // Auto-dismiss after 2.6s
      const timer = setTimeout(() => {
        setCurrentEvent(null);
        dismissGavelEvent();
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, [activeGavelEvent, dismissGavelEvent]);

  if (!currentEvent) return null;

  const isSold = currentEvent.type === 'SOLD';
  const isPassed = currentEvent.type === 'PASSED';
  const isWarning = currentEvent.type === 'GOING_ONCE' || currentEvent.type === 'GOING_TWICE';

  const getCalloutInfo = () => {
    switch (currentEvent.type) {
      case 'GOING_ONCE':
        return {
          title: 'GOING ONCE...',
          subtitle: `Floor Bid at ${formatAuctionCurrency(currentEvent.amount, profile.currency)}`,
          badge: 'FAIR WARNING',
          accentColor: '#D8CFB4',
          borderColor: 'rgba(216, 207, 180, 0.4)',
        };
      case 'GOING_TWICE':
        return {
          title: 'GOING TWICE... LAST CALL!',
          subtitle: currentEvent.leaderName ? `Held by ${currentEvent.leaderName}` : 'Final warning before hammer drops',
          badge: 'FINAL WARNING',
          accentColor: '#D8CFB4',
          borderColor: 'rgba(216, 207, 180, 0.8)',
        };
      case 'SOLD':
        return {
          title: 'THE HAMMER HAS FALLEN — SOLD!',
          subtitle: `Acquired by ${currentEvent.leaderName || 'Floor High Bidder'} for ${formatAuctionCurrency(currentEvent.amount, profile.currency)}`,
          badge: 'OFFICIAL ADJUDICATION',
          accentColor: '#16A085',
          borderColor: '#16A085',
        };
      case 'PASSED':
      default:
        return {
          title: 'PASSED — LOT UNSOLD',
          subtitle: `Reserve Floor not met (${formatAuctionCurrency(currentEvent.amount, profile.currency)}) — Moving to Accelerated Round`,
          badge: 'LOT CLOSED',
          accentColor: '#ef4444',
          borderColor: 'rgba(239, 68, 68, 0.6)',
        };
    }
  };

  const callout = getCalloutInfo();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto font-poppins select-none">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl rounded-[24px] bg-[#000000] border-2 p-6 sm:p-8 text-center space-y-6 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
          style={{ borderColor: callout.borderColor }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              setCurrentEvent(null);
              dismissGavelEvent();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-35 pointer-events-none"
            style={{ backgroundColor: callout.accentColor }}
          />

          {/* Badge */}
          <div className="flex items-center justify-center">
            <span
              className="px-4 py-1.5 rounded-[18px] text-xs font-mono font-bold uppercase tracking-widest border"
              style={{
                backgroundColor: `${callout.accentColor}18`,
                color: callout.accentColor,
                borderColor: `${callout.accentColor}40`,
              }}
            >
              {callout.badge}
            </span>
          </div>

          {/* =================================================================
              REALISTIC WOODEN GAVEL & SOUND BLOCK ANIMATION
              ================================================================= */}
          <div className="relative w-full h-44 sm:h-52 flex items-center justify-center">
            {/* Radial Shockwave Rings (triggered on strike) */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.8, 2.5], opacity: [0.9, 0.4, 0] }}
              transition={{ delay: 0.4, duration: 0.85, ease: 'easeOut' }}
              className="absolute w-36 h-36 rounded-full border-2 border-white/40 pointer-events-none"
              style={{ borderColor: callout.accentColor }}
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.3, 1.9], opacity: [1, 0.5, 0] }}
              transition={{ delay: 0.43, duration: 0.75, ease: 'easeOut' }}
              className="absolute w-36 h-36 rounded-full border-4 border-white/60 pointer-events-none"
              style={{ borderColor: callout.accentColor }}
            />

            {/* Brass / Wood Sound Block Anvil */}
            <div className="absolute bottom-6 flex flex-col items-center z-10">
              {/* Sound Block Top Brass Ring */}
              <div className="w-32 sm:w-36 h-3 rounded-full bg-gradient-to-r from-[#D8CFB4] via-amber-200 to-[#D8CFB4] border border-amber-500/40 shadow-md" />
              {/* Polished Walnut Anvil Base */}
              <div className="w-28 sm:w-32 h-6 rounded-b-xl bg-gradient-to-b from-[#5a361c] via-[#3a210f] to-[#251307] border border-[#301a0a] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#000000,#000000_3px,transparent_3px,transparent_8px)]" />
              </div>
            </div>

            {/* THE ANIMATED GAVEL */}
            <motion.div
              initial={{ rotate: -55, y: -45, originX: 0.85, originY: 0.85 }}
              animate={{
                rotate: [ -55, -65, 0, -8, 0 ],
                y: [ -45, -55, -2, -10, -2 ],
              }}
              transition={{
                delay: 0.1,
                duration: 0.5,
                times: [0, 0.25, 0.65, 0.8, 1],
                ease: 'easeInOut',
              }}
              className="absolute bottom-8 z-20 flex flex-col items-center"
              style={{ transformOrigin: '80% 85%' }}
            >
              {/* Turned Walnut Wood Handle */}
              <div className="w-4 h-28 sm:h-32 bg-gradient-to-b from-[#8c5828] via-[#5a361c] to-[#3a210f] rounded-full border-x border-[#281507] shadow-xl relative -mb-2 z-10">
                <div className="absolute top-4 left-0 right-0 h-1 bg-amber-400/40" />
                <div className="absolute top-8 left-0 right-0 h-1 bg-amber-400/40" />
              </div>

              {/* Solid Wood Gavel Head with Brass Rings */}
              <div className="relative w-28 sm:w-32 h-14 rounded-[14px] bg-gradient-to-r from-[#3e2210] via-[#75441d] to-[#3e2210] border-2 border-[#261206] shadow-2xl flex items-center justify-between px-2 overflow-hidden">
                {/* Left Brass Strike Face */}
                <div className="w-3.5 h-12 rounded-[6px] bg-gradient-to-b from-[#D8CFB4] via-amber-200 to-[#D8CFB4] border border-amber-500/50 shadow-inner" />
                {/* Center Wood Grain */}
                <div className="flex-1 px-1.5 flex flex-col items-center">
                  <div className="w-full h-1 bg-amber-400/30 rounded-full" />
                  <span className="text-[8px] font-mono font-bold text-amber-200/60 uppercase tracking-widest mt-1">
                    OFFICIAL
                  </span>
                </div>
                {/* Right Brass Strike Face */}
                <div className="w-3.5 h-12 rounded-[6px] bg-gradient-to-b from-[#D8CFB4] via-amber-200 to-[#D8CFB4] border border-amber-500/50 shadow-inner" />
              </div>
            </motion.div>
          </div>

          {/* =================================================================
              CALLOUT TEXT & LOT INFORMATION
              ================================================================= */}
          <div className="space-y-2">
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
              style={{ color: callout.accentColor }}
            >
              {callout.title}
            </motion.h2>

            <p className="text-sm font-medium text-slate-300">
              {callout.subtitle}
            </p>

            <div className="pt-2 text-xs font-mono text-slate-400">
              LOT #{currentEvent.lotNumber}: <span className="text-white font-bold">{currentEvent.lotTitle}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GavelHammerStrike;
