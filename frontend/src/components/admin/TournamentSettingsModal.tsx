'use client';

/**
 * ============================================================================
 * TOURNAMENT & ARENA SETTINGS MODAL
 * Dynamic Tournament Rules, Currency Switching & Instant Blueprint Loaders
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Settings,
  X,
  Sparkles,
  DollarSign,
  Clock,
  Shield,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  CurrencyCode,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';

interface TournamentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentSettingsModal: React.FC<TournamentSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    updateProfile,
    loadPresetTemplate,
    exportTournamentState,
    importTournamentState,
  } = useAuctionEngineStore();

  const [title, setTitle] = useState(profile.title);
  const [description, setDescription] = useState(profile.description);
  const [currency, setCurrency] = useState<CurrencyCode>(profile.currency);
  const [totalPurseCap, setTotalPurseCap] = useState(profile.totalPurseCap);
  const [minSquadSize, setMinSquadSize] = useState(profile.minSquadSize);
  const [maxSquadSize, setMaxSquadSize] = useState(profile.maxSquadSize);
  const [defaultMinIncrement, setDefaultMinIncrement] = useState(profile.defaultMinIncrement);
  const [lowestBasePrice, setLowestBasePrice] = useState(profile.lowestBasePrice);

  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    text: string;
  } | null>(null);

  const [importJsonText, setImportJsonText] = useState('');

  if (!isOpen) return null;

  const showToast = (type: 'SUCCESS' | 'ERROR', text: string) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      title,
      description,
      currency,
      totalPurseCap: Number(totalPurseCap),
      minSquadSize: Number(minSquadSize),
      maxSquadSize: Number(maxSquadSize),
      defaultMinIncrement: Number(defaultMinIncrement),
      lowestBasePrice: Number(lowestBasePrice),
    });
    showToast('SUCCESS', 'Tournament configuration updated dynamically!');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportTournamentState();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SUCCESS', 'Tournament JSON state exported to your device!');
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      showToast('ERROR', 'Please paste valid JSON state');
      return;
    }
    const res = importTournamentState(importJsonText.trim());
    if (res.success) {
      showToast('SUCCESS', res.message);
      setImportJsonText('');
      setTimeout(() => onClose(), 1000);
    } else {
      showToast('ERROR', res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in font-poppins">
      <div className="relative w-full max-w-2xl rounded-[18px] bg-[#000000] border border-white/[0.08] shadow-2xl p-6 sm:p-8 my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] shadow-lg shadow-[#16A085]/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-poppins font-black uppercase tracking-wider text-[#D8CFB4]">
                Tournament & Arena Settings
              </h2>
              <p className="text-xs text-gray-400">
                Configure currency, purse limits, and tournament rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {statusFeedback && (
          <div
            className={`mb-4 p-3.5 rounded-[18px] border text-xs font-semibold flex items-center gap-2.5 ${
              statusFeedback.type === 'SUCCESS'
                ? 'bg-[#16A085]/20 border-[#16A085]/40 text-[#16A085]'
                : 'bg-red-500/20 border-red-500/40 text-red-200'
            }`}
          >
            {statusFeedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A085]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Tournament Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full theme-input px-3.5 py-2.5"
                placeholder="RobiQuest 2026 Live Arena"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Organizer / Conducted By
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full theme-input px-3.5 py-2.5"
                placeholder="Conducted by RoboCell • Tech, Transform, Thrive"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Active Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full theme-input bg-black px-3.5 py-2.5"
              >
                <option value="INR" className="bg-black text-white">₹ INR (Indian Rupee - Lakhs & Crores)</option>
                <option value="USD" className="bg-black text-white">$ USD (United States Dollar)</option>
                <option value="EUR" className="bg-black text-white">€ EUR (Euro)</option>
                <option value="GBP" className="bg-black text-white">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Team Purse Cap ({currency})
              </label>
              <input
                type="number"
                value={totalPurseCap}
                onChange={(e) => setTotalPurseCap(Number(e.target.value))}
                className="w-full theme-input font-mono px-3.5 py-2.5"
                min={1000}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Min Squad Size
              </label>
              <input
                type="number"
                value={minSquadSize}
                onChange={(e) => setMinSquadSize(Number(e.target.value))}
                className="w-full theme-input font-mono px-3.5 py-2.5"
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Max Squad Size
              </label>
              <input
                type="number"
                value={maxSquadSize}
                onChange={(e) => setMaxSquadSize(Number(e.target.value))}
                className="w-full theme-input font-mono px-3.5 py-2.5"
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                Default Min Increment
              </label>
              <input
                type="number"
                value={defaultMinIncrement}
                onChange={(e) => setDefaultMinIncrement(Number(e.target.value))}
                className="w-full theme-input font-mono px-3.5 py-2.5"
                min={100}
              />
            </div>
          </div>

          {/* Quick Preset Blueprint Loaders */}
          <div className="pt-3 border-t border-white/[0.08]">
            <label className="block text-xs font-mono font-bold text-[#16A085] uppercase mb-2">
              ⚡ Quick Blueprint Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  loadPresetTemplate('ROBIQUEST');
                  showToast('SUCCESS', 'Loaded RobiQuest 2026 Robotics Blueprint!');
                  onClose();
                }}
                className="p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-[#16A085]/20 hover:border-[#16A085]/50 border border-white/[0.08] font-bold text-gray-200 hover:text-white transition-all text-center"
              >
                🤖 RobiQuest
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPresetTemplate('SPORTS_IPL');
                  showToast('SUCCESS', 'Loaded IPL Sports Tournament Blueprint!');
                  onClose();
                }}
                className="p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-[#16A085]/20 hover:border-[#16A085]/50 border border-white/[0.08] font-bold text-gray-200 hover:text-white transition-all text-center"
              >
                🏏 IPL Cricket
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPresetTemplate('FINE_ART_LUXURY');
                  showToast('SUCCESS', 'Loaded Fine Art & Luxury Blueprint!');
                  onClose();
                }}
                className="p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-[#16A085]/20 hover:border-[#16A085]/50 border border-white/[0.08] font-bold text-gray-200 hover:text-white transition-all text-center"
              >
                🎨 Luxury Art
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPresetTemplate('EMPTY');
                  showToast('SUCCESS', 'Started Fresh Blank Canvas!');
                  onClose();
                }}
                className="p-2.5 rounded-[18px] bg-white/[0.03] hover:bg-red-500/20 hover:border-red-500/50 border border-white/[0.08] font-bold text-gray-300 hover:text-white transition-all text-center"
              >
                ✨ Blank Slate
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-wrap gap-2 justify-between items-center">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-[#16A085]" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#16A085]/30"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentSettingsModal;
