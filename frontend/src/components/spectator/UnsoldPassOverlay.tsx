'use client';

/**
 * ============================================================================
 * DRAMATIC "UNSOLD / PASSED" STAMP OVERLAY
 * Heavy Physical Stamped Placard Slams Down When a Lot Fails Reserve
 * Strictly Styled:
 *  - Primary: #16A085
 *  - Headline Accent: #D8CFB4
 *  - Background: #000000
 *  - Radius: 18px
 *  - Font: Poppins
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, RotateCcw, ArrowRight, X, Gavel } from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

export const UnsoldPassOverlay: React.FC = () => {
  const { unsoldNotice, dismissUnsoldNotice, triggerGavelAction, profile } =
    useAuctionEngineStore();

  useEffect(() => {
    if (unsoldNotice.isOpen) {
      // Auto-dismiss after 6.5s if not clicked
      const timer = setTimeout(() => {
        dismissUnsoldNotice();
      }, 6500);

      return () => clearTimeout(timer);
    }
  }, [unsoldNotice.isOpen, dismissUnsoldNotice]);

  if (!unsoldNotice.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-poppins select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl rounded-[24px] bg-[#000000] border-2 border-red-500/40 p-6 sm:p-8 text-center space-y-6 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        >
          {/* Close button */}
          <button
            onClick={dismissUnsoldNotice}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ambient Amber/Red Backlight */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-25 bg-red-600 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
            <AlertOctagon className="w-4 h-4" />
            <span>OFFICIAL AUCTIONEER RULING • RESERVE FLOOR UNMET</span>
          </div>

          {/* Contender Image Card with DRAMATIC STAMP */}
          <div className="relative w-44 h-44 mx-auto rounded-[18px] overflow-hidden border border-white/10 bg-black p-1 shadow-2xl">
            <img
              src={unsoldNotice.lotImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'}
              alt={unsoldNotice.lotTitle}
              className="w-full h-full object-cover rounded-[14px] opacity-60 grayscale contrast-125"
            />

            {/* ===============================================================
                HEAVY "PASSED / UNSOLD" STAMP SLAMS DOWN WITH ROTATION & IMPACT
                =============================================================== */}
            <motion.div
              initial={{ scale: 3, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: -12, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
              className="absolute inset-0 m-auto w-40 h-20 border-4 border-red-600/90 rounded-[12px] bg-red-950/80 backdrop-blur-xs flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.7)] pointer-events-none"
            >
              <span className="text-[10px] font-mono tracking-widest font-black text-red-400 uppercase">
                OFFICIAL ADJUDICATION
              </span>
              <span className="text-2xl font-black font-mono tracking-tighter text-red-500 uppercase">
                UNSOLD
              </span>
              <span className="text-[9px] font-mono tracking-wider text-red-300 uppercase font-bold">
                PASSED TO ACCELERATED
              </span>
            </motion.div>
          </div>

          {/* Lot Title & Base Price Notice */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              LOT #{unsoldNotice.lotNumber} • {unsoldNotice.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight font-poppins">
              {unsoldNotice.lotTitle}
            </h2>
            <div className="text-sm font-mono text-[#D8CFB4]">
              Reserve Floor: <strong className="text-white">{formatAuctionCurrency(unsoldNotice.basePrice, profile.currency)}</strong> (No qualifying bid entered)
            </div>
          </div>

          {/* Adjudication Explanation */}
          <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 font-mono space-y-1">
            <div className="text-red-400 font-bold flex items-center justify-center gap-1.5 uppercase">
              <Gavel className="w-3.5 h-3.5" /> Hammer Dropped Without Bidder
            </div>
            <p className="text-slate-400">
              Contender has been marked UNSOLD and relegated to the secondary accelerated auction round.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                triggerGavelAction('RE_AUCTION');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.15] text-[#D8CFB4] font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#D8CFB4]" />
              <span>Re-Open Lot Floor</span>
            </button>

            <button
              onClick={dismissUnsoldNotice}
              className="w-full sm:w-auto px-8 py-3 rounded-[18px] theme-btn-primary text-black font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
            >
              <span>Acknowledge & Next Contender</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnsoldPassOverlay;
