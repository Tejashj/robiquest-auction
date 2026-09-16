'use client';

/**
 * ============================================================================
 * FULL-SCREEN "SOLD!" CELEBRATION OVERLAY
 * High-Impact Modal with Gavel Strike Sound & Canvas Confetti Cannon
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Trophy, Sparkles, X } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { triggerConfettiCannon } from '../../lib/confetti';

export const SoldCelebrationOverlay: React.FC = () => {
  const { celebration, dismissCelebration, profile } = useAuctionEngineStore();

  useEffect(() => {
    if (celebration.isOpen) {
      triggerConfettiCannon({ origin: { x: 0.25, y: 0.6 } });
      setTimeout(() => {
        triggerConfettiCannon({ origin: { x: 0.75, y: 0.6 } });
      }, 250);

      const timer = setTimeout(() => {
        dismissCelebration();
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [celebration.isOpen, dismissCelebration]);

  if (!celebration.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative w-full max-w-2xl rounded-[18px] p-8 xl:p-10 border-2 shadow-2xl overflow-hidden text-center space-y-6"
          style={{
            backgroundColor: '#000000',
            borderColor: celebration.winningTeamColor || '#16A085',
            boxShadow: `0 0 80px ${celebration.winningTeamColor || '#16A085'}35`,
          }}
        >
          <button
            onClick={dismissCelebration}
            className="absolute top-4 right-4 p-2 rounded-[18px] bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* RobiQuest / RoboCell Event Header */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-[#16A085] uppercase">
            <img src="/robocell-crest.png" alt="RoboCell" className="w-5 h-5 object-contain inline-block" />
            <span>ROBIQUEST • CONDUCTED BY ROBOCELL</span>
          </div>

          {/* Gavel Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-[18px] bg-[#16A085] text-black font-black text-sm uppercase tracking-widest shadow-xl shadow-[#16A085]/40"
          >
            <Gavel className="w-5 h-5 fill-black stroke-black" />
            THE HAMMER HAS FALLEN — SOLD!
          </motion.div>

          {/* Asset Photo & Franchise Logo */}
          <div className="relative w-36 h-36 mx-auto">
            <div className="w-full h-full rounded-[18px] overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src={celebration.lotImageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300'}
                alt={celebration.lotTitle}
                className="w-full h-full object-cover"
              />
            </div>
            {celebration.winningTeamLogo && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.35, type: 'spring' }}
                className="absolute -bottom-3 -right-3 w-14 h-14 rounded-[18px] overflow-hidden border-2 border-white shadow-2xl bg-black"
              >
                <img
                  src={celebration.winningTeamLogo}
                  alt={celebration.winningTeamName}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl xl:text-3xl font-black text-[#D8CFB4] uppercase tracking-tight font-poppins">
              {celebration.lotTitle}
            </h2>
            <p className="text-sm font-bold uppercase tracking-wider text-[#16A085]">
              ACQUIRED BY {celebration.winningTeamName}
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-[18px] bg-white/[0.03] border border-white/15 inline-block space-y-0.5 px-8"
          >
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400">
              Final Winning Hammer Price
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-[#D8CFB4] tracking-tight">
              {formatAuctionCurrency(celebration.hammerPrice, profile.currency)}
            </div>
          </motion.div>

          <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16A085]" />
            <span>Purse automatically deducted from {celebration.winningTeamName}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
