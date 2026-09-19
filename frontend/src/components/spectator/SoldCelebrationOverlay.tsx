'use client';

/**
 * ============================================================================
 * FULL-SCREEN "SOLD!" CELEBRATION OVERLAY
 * Strictly Styled using:
 *  - Primary: #16A085 (Hover: #1abc9c)
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Border Radius: 18px everywhere
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Trophy, Sparkles, X, CheckCircle2 } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 font-poppins">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl rounded-[18px] p-8 xl:p-10 border border-white/[0.08] text-center space-y-6 bg-[#000000]"
          style={{
            borderColor: celebration.winningTeamColor || '#16A085',
          }}
        >
          <button
            onClick={dismissCelebration}
            className="absolute top-4 right-4 p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Event Header */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-[#16A085] uppercase">
            <img src="/robocell-crest.png" alt="RoboCell" className="w-6 h-6 object-contain inline-block" />
            <span>{profile.title.toUpperCase()} • {profile.description}</span>
          </div>

          {/* Gavel Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-[18px] bg-[#16A085] text-black font-bold text-sm uppercase tracking-widest"
          >
            <Gavel className="w-5 h-5 fill-black stroke-black" />
            THE HAMMER HAS FALLEN — SOLD!
          </motion.div>

          {/* Asset Photo & Franchise Crest with HEAVY "SOLD" STAMP */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="w-full h-full rounded-[18px] overflow-hidden border-2 border-white/[0.12] bg-black p-1 shadow-2xl relative">
              <img
                src={celebration.lotImageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300'}
                alt={celebration.lotTitle}
                className="w-full h-full object-cover rounded-[14px]"
              />

              {/* ===============================================================
                  PHYSICAL "SOLD" WAX/INK STAMP SLAMS ACROSS CARD
                  =============================================================== */}
              <motion.div
                initial={{ scale: 3.5, rotate: -35, opacity: 0 }}
                animate={{ scale: 1, rotate: -10, opacity: 1 }}
                transition={{
                  delay: 0.15,
                  type: 'spring',
                  stiffness: 420,
                  damping: 18,
                }}
                className="absolute inset-0 m-auto w-40 h-20 border-4 border-[#16A085] rounded-[12px] bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center shadow-[0_0_35px_rgba(22,160,133,0.8)] pointer-events-none"
              >
                <span className="text-[9px] font-mono tracking-widest font-black text-[#D8CFB4] uppercase">
                  OFFICIAL LOT ASSIGNED
                </span>
                <span className="text-3xl font-black font-mono tracking-tighter text-[#16A085] uppercase">
                  SOLD!
                </span>
                <span className="text-[8px] font-mono tracking-wider text-emerald-300 uppercase font-bold">
                  {celebration.winningTeamName}
                </span>
              </motion.div>
            </div>

            {celebration.winningTeamLogo && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                className="absolute -bottom-3 -right-3 w-16 h-16 rounded-[18px] overflow-hidden border-2 border-white bg-black p-1.5 shadow-xl"
                style={{
                  borderColor: celebration.winningTeamColor || '#16A085',
                }}
              >
                <img
                  src={celebration.winningTeamLogo}
                  alt={celebration.winningTeamName}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl xl:text-3xl font-bold text-white uppercase tracking-tight font-poppins">
              {celebration.lotTitle}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-[18px] bg-white/[0.03] text-[#16A085] border border-white/[0.08]">
                ACQUIRED BY {celebration.winningTeamName}
              </span>
            </div>
          </div>

          {/* Winning Price */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-[18px] bg-[#000000] border border-white/[0.08] inline-block space-y-1 px-10"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-[#D8CFB4]">
              Final Winning Hammer Price
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-[#D8CFB4] tracking-tight">
              {formatAuctionCurrency(celebration.hammerPrice, profile.currency)}
            </div>
          </motion.div>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#16A085]" />
            <span>Purse automatically deducted from {celebration.winningTeamName}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SoldCelebrationOverlay;
