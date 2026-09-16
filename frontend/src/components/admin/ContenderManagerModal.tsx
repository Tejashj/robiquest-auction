'use client';

/**
 * ============================================================================
 * CONTENDER & TOURNAMENT ROSTER MANAGER (DYNAMIC CMS)
 * Gives Event Organizers Complete Dynamic Control:
 *  - ➕ Add New Contender / Player / Hardware Lot with Photo & Sports Stats
 *  - ✏️ Live Edit Name, Base Price, Category, and Combat/Sports Ratings
 *  - 🗑️ Delete / Archive Lots
 *  - ⚡ 1-Click Put on Stage
 *  - 📥 / 📤 JSON Roster Import & Export
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  Upload,
  Download,
  X,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Activity,
  Layers,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  formatAuctionCurrency,
  AuctionLotItem,
  SportsContenderStats,
} from '../../store/auction-engine-store';

interface ContenderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset Avatars for instant 1-click selection
const PRESET_AVATARS = [
  { label: 'Jetson AI Core', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { label: 'LiDAR Sensor', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Titan Combat Bot', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Robotic Arm', url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Brushless Motors', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Spatial AI 3D', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber Mech', url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Quantum Drone', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80' },
];

export const ContenderManagerModal: React.FC<ContenderManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    lots,
    activeLotId,
    addLot,
    updateLot,
    deleteLot,
    setActiveLot,
    exportTournamentState,
    importTournamentState,
  } = useAuctionEngineStore();

  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD_EDIT' | 'IMPORT_EXPORT'>('LIST');
  const [editingLotId, setEditingLotId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Robotics Combatant',
    roleBadge: 'COMBAT CLASS S',
    startingBid: 20000,
    minIncrement: 2000,
    imageUrl: PRESET_AVATARS[0].url,
    power: 90,
    velocity: 85,
    armor: 90,
    aiCompute: 80,
    specialty: 'High-Impact Kinetic Weapon',
    winRate: '88%',
    spec1Key: 'Chassis',
    spec1Val: 'Reinforced Titanium',
    spec2Key: 'Power Unit',
    spec2Val: '48V LiFePO4 High C-Rate',
  });

  const [importJsonText, setImportJsonText] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingLotId(null);
    setFormData({
      title: '',
      category: 'Robotics Combatant',
      roleBadge: 'COMBAT CLASS S',
      startingBid: 20000,
      minIncrement: 2000,
      imageUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url,
      power: 88,
      velocity: 85,
      armor: 92,
      aiCompute: 80,
      specialty: 'High-Velocity Armor Piercing Drum',
      winRate: '90%',
      spec1Key: 'Drive',
      spec1Val: 'Brushless 6WD Torque Vectoring',
      spec2Key: 'Telemetry',
      spec2Val: 'Sub-Ghz Low Latency Video',
    });
    setActiveTab('ADD_EDIT');
  };

  const handleStartEdit = (lot: AuctionLotItem) => {
    setEditingLotId(lot.id);
    const attrEntries = Object.entries(lot.attributes || {});
    setFormData({
      title: lot.title,
      category: lot.category,
      roleBadge: lot.roleBadge || 'PRO CONTENDER',
      startingBid: lot.startingBid,
      minIncrement: lot.minIncrement,
      imageUrl: lot.imageUrls[0] || PRESET_AVATARS[0].url,
      power: lot.contenderStats?.power ?? 85,
      velocity: lot.contenderStats?.velocity ?? 85,
      armor: lot.contenderStats?.armor ?? 85,
      aiCompute: lot.contenderStats?.aiCompute ?? 85,
      specialty: lot.contenderStats?.specialty ?? 'Universal High Performance',
      winRate: lot.contenderStats?.winRate ?? '85%',
      spec1Key: attrEntries[0]?.[0] || 'Feature A',
      spec1Val: attrEntries[0]?.[1] || 'Industrial Grade',
      spec2Key: attrEntries[1]?.[0] || 'Feature B',
      spec2Val: attrEntries[1]?.[1] || 'High Durability',
    });
    setActiveTab('ADD_EDIT');
  };

  const handleSaveContender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusFeedback({ type: 'ERROR', text: 'Contender title/name is required' });
      return;
    }

    const contenderStats: SportsContenderStats = {
      power: Number(formData.power),
      velocity: Number(formData.velocity),
      armor: Number(formData.armor),
      aiCompute: Number(formData.aiCompute),
      specialty: formData.specialty,
      winRate: formData.winRate,
      combatClass: formData.roleBadge,
    };

    const attributes: Record<string, string> = {};
    if (formData.spec1Key && formData.spec1Val) attributes[formData.spec1Key] = formData.spec1Val;
    if (formData.spec2Key && formData.spec2Val) attributes[formData.spec2Key] = formData.spec2Val;

    if (editingLotId) {
      updateLot(editingLotId, {
        title: formData.title.trim(),
        category: formData.category.trim(),
        roleBadge: formData.roleBadge.trim(),
        startingBid: Number(formData.startingBid),
        reservePrice: Number(formData.startingBid),
        minIncrement: Number(formData.minIncrement),
        imageUrls: [formData.imageUrl.trim()],
        contenderStats,
        attributes,
      });
      setStatusFeedback({ type: 'SUCCESS', text: `Updated "${formData.title}"` });
    } else {
      const nextLotNum = lots.length > 0 ? Math.max(...lots.map((l) => l.lotNumber)) + 1 : 1;
      addLot({
        lotNumber: nextLotNum,
        title: formData.title.trim(),
        category: formData.category.trim(),
        roleBadge: formData.roleBadge.trim(),
        startingBid: Number(formData.startingBid),
        reservePrice: Number(formData.startingBid),
        minIncrement: Number(formData.minIncrement),
        imageUrls: [formData.imageUrl.trim()],
        contenderStats,
        attributes,
      });
      setStatusFeedback({ type: 'SUCCESS', text: `Added Lot #${nextLotNum}: "${formData.title}"` });
    }

    setTimeout(() => {
      setStatusFeedback(null);
      setActiveTab('LIST');
    }, 1200);
  };

  const handleDeleteContender = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      deleteLot(id);
      setStatusFeedback({ type: 'SUCCESS', text: `Removed "${title}"` });
      setTimeout(() => setStatusFeedback(null), 2500);
    }
  };

  const handleExportJson = () => {
    const json = exportTournamentState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robiquest-tournament-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusFeedback({ type: 'SUCCESS', text: 'Exported tournament configuration JSON!' });
    setTimeout(() => setStatusFeedback(null), 2500);
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      setStatusFeedback({ type: 'ERROR', text: 'Please paste tournament JSON data.' });
      return;
    }
    const res = importTournamentState(importJsonText.trim());
    if (res.success) {
      setStatusFeedback({ type: 'SUCCESS', text: res.message });
      setImportJsonText('');
      setTimeout(() => {
        setStatusFeedback(null);
        setActiveTab('LIST');
      }, 1500);
    } else {
      setStatusFeedback({ type: 'ERROR', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[18px] bg-black border border-[#16A085]/40 shadow-2xl shadow-[#16A085]/20 overflow-hidden text-white">
        {/* Top Header */}
        <div className="px-6 py-4 bg-black border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-black border-2 border-[#16A085] p-1 shadow-lg shadow-[#16A085]/30 flex items-center justify-center">
              <img src="/robocell-crest.png" alt="RoboCell" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#16A085] uppercase tracking-widest">
                  ROBICELL CMS STUDIO
                </span>
                <span className="px-2 py-0.2 rounded-[18px] text-[10px] font-mono bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40">
                  {lots.length} Contenders Loaded
                </span>
              </div>
              <h2 className="text-lg font-black text-[#D8CFB4] uppercase tracking-tight font-poppins">
                Contender & Roster Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartAdd}
              className="px-4 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#16A085]/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contender</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-black border-b border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3.5 py-1.5 rounded-[18px] transition-all ${
              activeTab === 'LIST'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-gray-400 hover:text-[#D8CFB4]'
            }`}
          >
            Catalog List ({lots.length})
          </button>
          <button
            onClick={() => {
              if (activeTab !== 'ADD_EDIT') handleStartAdd();
            }}
            className={`px-3.5 py-1.5 rounded-[18px] transition-all ${
              activeTab === 'ADD_EDIT'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-gray-400 hover:text-[#D8CFB4]'
            }`}
          >
            {editingLotId ? 'Edit Contender' : 'New Contender Form'}
          </button>
          <button
            onClick={() => setActiveTab('IMPORT_EXPORT')}
            className={`px-3.5 py-1.5 rounded-[18px] transition-all flex items-center gap-1.5 ${
              activeTab === 'IMPORT_EXPORT'
                ? 'bg-[#16A085] text-black font-bold'
                : 'text-gray-400 hover:text-[#D8CFB4]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>JSON Import / Export</span>
          </button>
        </div>

        {/* Feedback Message */}
        {statusFeedback && (
          <div
            className={`mx-6 mt-3 p-3.5 rounded-[18px] text-xs font-bold flex items-center gap-2 shadow-xl ${
              statusFeedback.type === 'SUCCESS'
                ? 'bg-[#16A085] text-black'
                : 'bg-red-500 text-white'
            }`}
          >
            {statusFeedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white flex-shrink-0" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* VIEW 1: CATALOG LIST */}
          {activeTab === 'LIST' && (
            <div className="space-y-3">
              {lots.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#16A085]" />
                  <p className="text-sm font-semibold text-white">No contenders in the catalog yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "+ Add Contender" to create your first auction lot.</p>
                </div>
              ) : (
                lots.map((lot) => {
                  const isActive = lot.id === activeLotId;
                  const stats = lot.contenderStats;

                  return (
                    <div
                      key={lot.id}
                      className={`p-4 rounded-[18px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-[#16A085]/10 border-[#16A085] shadow-lg shadow-[#16A085]/10 ring-1 ring-[#16A085]/40'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[18px] overflow-hidden bg-black border border-white/15 flex-shrink-0 relative">
                          <img
                            src={lot.imageUrls[0] || PRESET_AVATARS[0].url}
                            alt={lot.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-[18px] bg-black/80 font-mono text-[9px] font-bold text-[#D8CFB4]">
                            #{lot.lotNumber}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#16A085] uppercase">
                              {lot.category}
                            </span>
                            {lot.roleBadge && (
                              <span className="px-2 py-0.2 rounded-[18px] text-[10px] font-mono bg-white/[0.03] text-gray-300 border border-white/10">
                                {lot.roleBadge}
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.2 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40 animate-pulse">
                                ON STAGE NOW
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-[#D8CFB4] uppercase tracking-tight mt-0.5 font-poppins">
                            {lot.title}
                          </h3>

                          {/* Sports Stats Mini Badges */}
                          {stats && (
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono">
                              <span className="text-[#16A085]">⚡ PWR: {stats.power}</span>
                              <span className="text-[#16A085]">🚀 VEL: {stats.velocity}</span>
                              <span className="text-[#D8CFB4]">🛡️ ARM: {stats.armor}</span>
                              <span className="text-[#16A085]">🧠 AI: {stats.aiCompute}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Pricing & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] font-mono text-gray-400 uppercase">Base Price</div>
                          <div className="text-base font-black font-mono text-white">
                            {formatAuctionCurrency(lot.startingBid, profile.currency)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isActive && (
                            <button
                              onClick={() => setActiveLot(lot.id)}
                              className="px-3 py-1.5 rounded-[18px] bg-[#16A085]/20 hover:bg-[#16A085]/30 border border-[#16A085]/40 text-[#16A085] text-xs font-bold transition-all flex items-center gap-1"
                              title="Put directly on auction stage"
                            >
                              <Play className="w-3 h-3" />
                              <span className="hidden sm:inline">Put on Stage</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleStartEdit(lot)}
                            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                            title="Edit Contender"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteContender(lot.id, lot.title)}
                            className="p-2 rounded-[18px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all"
                            title="Delete Contender"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: ADD / EDIT CONTENDER FORM */}
          {activeTab === 'ADD_EDIT' && (
            <form onSubmit={handleSaveContender} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                    Contender Name / Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. TITAN VORTEX (Heavyweight Combat Bot)"
                    className="w-full px-4 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                    Category / Discipline
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Heavyweight Armor & Kinetic Flipper"
                    className="w-full px-4 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                    Role Badge / Combat Class
                  </label>
                  <input
                    type="text"
                    value={formData.roleBadge}
                    onChange={(e) => setFormData({ ...formData, roleBadge: e.target.value })}
                    placeholder="e.g. GRADE S+ TITAN"
                    className="w-full px-4 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                      Base Price ({profile.currency})
                    </label>
                    <input
                      type="number"
                      value={formData.startingBid}
                      onChange={(e) => setFormData({ ...formData, startingBid: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                      min={1000}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                      Min Increment
                    </label>
                    <input
                      type="number"
                      value={formData.minIncrement}
                      onChange={(e) => setFormData({ ...formData, minIncrement: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                      min={500}
                    />
                  </div>
                </div>
              </div>

              {/* Photo & Quick Thumbnail Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#D8CFB4] uppercase tracking-wider mb-1.5">
                  Contender Image URL (or select preset below)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                  <div className="w-10 h-10 rounded-[18px] overflow-hidden bg-black border border-white/20 flex-shrink-0">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Instant Avatar Selector Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400 font-mono">Presets:</span>
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: avatar.url })}
                      className={`px-2.5 py-1 rounded-[18px] text-[10px] font-mono border transition-all flex items-center gap-1.5 ${
                        formData.imageUrl === avatar.url
                          ? 'bg-[#16A085]/20 border-[#16A085] text-[#16A085] font-bold'
                          : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#16A085]" />
                      <span>{avatar.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sports & Combat Attributes Sliders */}
              <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A085] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Sports & Combat Performance Ratings (0 - 100)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>⚡ Power / Torque:</span>
                      <strong className="text-[#16A085]">{formData.power}/100</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.power}
                      onChange={(e) => setFormData({ ...formData, power: Number(e.target.value) })}
                      className="w-full accent-[#16A085] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>🚀 Velocity / Agility:</span>
                      <strong className="text-[#16A085]">{formData.velocity}/100</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.velocity}
                      onChange={(e) => setFormData({ ...formData, velocity: Number(e.target.value) })}
                      className="w-full accent-[#16A085] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>🛡️ Armor / Durability:</span>
                      <strong className="text-[#D8CFB4]">{formData.armor}/100</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.armor}
                      onChange={(e) => setFormData({ ...formData, armor: Number(e.target.value) })}
                      className="w-full accent-[#D8CFB4] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                      <span>🧠 AI / SLAM Compute:</span>
                      <strong className="text-[#16A085]">{formData.aiCompute}/100</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.aiCompute}
                      onChange={(e) => setFormData({ ...formData, aiCompute: Number(e.target.value) })}
                      className="w-full accent-[#16A085] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                      Signature Weapon / Feature
                    </label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="e.g. 12,000 RPM Hardox Disc"
                      className="w-full px-3 py-2 rounded-[18px] bg-white/[0.03] border-none text-white text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                      Win Rate / Combat Record
                    </label>
                    <input
                      type="text"
                      value={formData.winRate}
                      onChange={(e) => setFormData({ ...formData, winRate: e.target.value })}
                      placeholder="e.g. 92% (14 Wins - 1 Loss)"
                      className="w-full px-3 py-2 rounded-[18px] bg-white/[0.03] border-none text-white text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-[#16A085]/30 transition-all active:scale-[0.98]"
                >
                  {editingLotId ? 'Save Changes' : 'Create & Add Contender'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: JSON IMPORT / EXPORT */}
          {activeTab === 'IMPORT_EXPORT' && (
            <div className="space-y-6">
              <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase font-poppins">Export Tournament State</h4>
                    <p className="text-xs text-gray-400">Download the complete list of contenders, team budgets, and configuration as JSON.</p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-[#16A085]" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-[18px] bg-white/[0.02] border border-white/10 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-poppins">Import Tournament JSON</h4>
                  <p className="text-xs text-gray-400">Paste an exported JSON tournament configuration to overwrite or load arbitrary custom rosters instantly.</p>
                </div>

                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste tournament JSON configuration here..."
                  rows={6}
                  className="w-full p-3 rounded-[18px] bg-white/[0.03] border-none text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleImportJson}
                    className="px-5 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-[#16A085]/30 transition-all active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Apply & Load JSON Roster</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
