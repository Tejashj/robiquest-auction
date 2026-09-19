'use client';

/**
 * ============================================================================
 * CONTENDER & TOURNAMENT ROSTER MANAGER (DYNAMIC CMS STUDIO)
 * Gives Event Organizers 100% Dynamic Control:
 *  - ➕ Add New Contender / Hardware Lot with Custom Photo & Sports Stats
 *  - ⚡ Procedural Contender Generator (1-Click generate 6 or 12 dynamic lots)
 *  - ✏️ Live Edit Name, Base Price, Category, and Combat/Sports Ratings
 *  - 📑 Duplicate Contender
 *  - 🗑️ Delete Contenders
 *  - ⚡ 1-Click Put on Stage
 *  - 📥 CSV & JSON Roster Import & Export
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
  Copy,
  FileSpreadsheet,
  Cpu,
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
    duplicateLot,
    generateDynamicContenders,
    importCsvLots,
    exportTournamentState,
    importTournamentState,
  } = useAuctionEngineStore();

  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD_EDIT' | 'IMPORT_EXPORT'>('LIST');
  const [editingLotId, setEditingLotId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Edge AI & Robotics',
    roleBadge: 'SUPERCOMPUTE CORE',
    startingBid: 20000,
    minIncrement: 2000,
    imageUrl: PRESET_AVATARS[0].url,
    power: 90,
    velocity: 85,
    armor: 90,
    aiCompute: 85,
    specialty: 'Autonomous High-Velocity Kinematics',
    winRate: '90%',
    spec1Key: 'Drive',
    spec1Val: 'Brushless Vector FOC',
    spec2Key: 'Chassis',
    spec2Val: 'Titanium Grade-5 Weave',
  });

  const [csvInput, setCsvInput] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  if (!isOpen) return null;

  const showToast = (type: 'SUCCESS' | 'ERROR', text: string) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleStartAdd = () => {
    setEditingLotId(null);
    setFormData({
      title: '',
      category: 'Robotics Combatant',
      roleBadge: 'SUPERCOMPUTE CORE',
      startingBid: profile.lowestBasePrice || 20000,
      minIncrement: profile.defaultMinIncrement || 2000,
      imageUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url,
      power: 88,
      velocity: 85,
      armor: 92,
      aiCompute: 85,
      specialty: 'Autonomous Vector Dynamic Drive',
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
      spec1Key: attrEntries[0]?.[0] || 'Chassis',
      spec1Val: attrEntries[0]?.[1] || 'Reinforced Frame',
      spec2Key: attrEntries[1]?.[0] || 'Compute',
      spec2Val: attrEntries[1]?.[1] || 'Industrial Controller',
    });
    setActiveTab('ADD_EDIT');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFormData((prev) => ({ ...prev, imageUrl: loadEvt.target!.result as string }));
          showToast('SUCCESS', 'Loaded image from local file!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveContender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('ERROR', 'Contender title is required');
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
      showToast('SUCCESS', `Updated "${formData.title}"!`);
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
      showToast('SUCCESS', `Added Lot #${nextLotNum}: "${formData.title}"!`);
    }

    setActiveTab('LIST');
  };

  const handleDeleteContender = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      deleteLot(id);
      showToast('SUCCESS', `Removed "${title}" from catalog.`);
    }
  };

  const handleDuplicate = (id: string, title: string) => {
    duplicateLot(id);
    showToast('SUCCESS', `Duplicated "${title}"!`);
  };

  const handleGenerateRoster = (count: number) => {
    generateDynamicContenders(count);
    showToast('SUCCESS', `Procedurally generated ${count} dynamic contenders!`);
  };

  const handleImportCsv = () => {
    if (!csvInput.trim()) {
      showToast('ERROR', 'Please paste CSV content');
      return;
    }
    const res = importCsvLots(csvInput);
    if (res.success) {
      showToast('SUCCESS', res.message);
      setCsvInput('');
      setActiveTab('LIST');
    } else {
      showToast('ERROR', res.message);
    }
  };

  const handleExportJson = () => {
    const json = exportTournamentState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-catalog-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SUCCESS', 'Exported tournament JSON!');
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      showToast('ERROR', 'Please paste tournament JSON data.');
      return;
    }
    const res = importTournamentState(importJsonText.trim());
    if (res.success) {
      showToast('SUCCESS', res.message);
      setImportJsonText('');
      setActiveTab('LIST');
    } else {
      showToast('ERROR', res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 font-poppins">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-[18px] bg-[#000000] border border-white/[0.08] shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] shadow-lg shadow-[#16A085]/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-poppins font-black uppercase tracking-wider text-[#D8CFB4]">
                  Dynamic Contender & Lot Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                  {lots.length} Contenders
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Create, edit, duplicate, upload photos, and procedurally generate dynamic lots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-[18px] border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('LIST')}
                className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
                  activeTab === 'LIST' ? 'bg-[#16A085] text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Catalog ({lots.length})
              </button>
              <button
                onClick={handleStartAdd}
                className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
                  activeTab === 'ADD_EDIT' && !editingLotId ? 'bg-[#16A085] text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                + Add Contender
              </button>
              <button
                onClick={() => setActiveTab('IMPORT_EXPORT')}
                className={`px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all ${
                  activeTab === 'IMPORT_EXPORT' ? 'bg-[#16A085] text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Import / Export
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all ml-2 border border-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusFeedback && (
          <div
            className={`mx-6 mt-3 p-3 rounded-[18px] border text-xs font-semibold flex items-center gap-2.5 ${
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

        {/* ================================================================= */}
        {/* TAB: LIST VIEW */}
        {/* ================================================================= */}
        {activeTab === 'LIST' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A085]" />
                <span className="text-xs font-bold text-white uppercase font-poppins">
                  Instant Procedural Generation:
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Generate realistic dynamic squads with 1 click
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateRoster(6)}
                  className="px-3.5 py-1.5 rounded-[18px] bg-[#16A085]/20 hover:bg-[#16A085]/30 border border-[#16A085]/40 text-[#16A085] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  +6 Dynamic Lots
                </button>
                <button
                  onClick={() => handleGenerateRoster(12)}
                  className="px-3.5 py-1.5 rounded-[18px] bg-[#16A085]/20 hover:bg-[#16A085]/30 border border-[#16A085]/40 text-[#16A085] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  +12 Dynamic Lots
                </button>
              </div>
            </div>

            {/* Lots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {lots.map((lot) => {
                const isActive = activeLotId === lot.id;
                return (
                  <div
                    key={lot.id}
                    className={`p-4 rounded-[18px] bg-[#000000] border transition-all flex items-center justify-between gap-3 ${
                      isActive ? 'border-[#16A085] ring-2 ring-[#16A085]/25 shadow-lg shadow-[#16A085]/20' : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-[18px] overflow-hidden bg-black border border-white/[0.08] flex-shrink-0">
                        <img
                          src={lot.imageUrls[0] || PRESET_AVATARS[0].url}
                          alt={lot.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-black bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                            LOT #{lot.lotNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                            {lot.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-[18px] text-[9px] font-bold ${
                              lot.status === 'SOLD'
                                ? 'bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40'
                                : lot.status === 'LIVE'
                                ? 'bg-[#D8CFB4]/20 text-[#D8CFB4] border border-[#D8CFB4]/40 animate-pulse'
                                : 'bg-white/[0.05] text-gray-300'
                            }`}
                          >
                            {lot.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-poppins font-black text-white uppercase truncate mt-0.5">
                          {lot.title}
                        </h4>
                        <div className="text-xs font-mono font-bold text-[#D8CFB4] mt-1">
                          Base: {formatAuctionCurrency(lot.startingBid, profile.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setActiveLot(lot.id);
                          showToast('SUCCESS', `Sent Lot #${lot.lotNumber} to Live Stage!`);
                        }}
                        className={`p-2 rounded-[18px] text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#16A085] text-black font-black shadow-lg shadow-[#16A085]/30'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/[0.08]'
                        }`}
                        title="Send to Live Stage"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(lot)}
                        className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all border border-white/[0.08]"
                        title="Edit Lot"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(lot.id, lot.title)}
                        className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all border border-white/[0.08]"
                        title="Duplicate Lot"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContender(lot.id, lot.title)}
                        className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-white/[0.08]"
                        title="Delete Lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: ADD OR EDIT CONTENDER */}
        {/* ================================================================= */}
        {activeTab === 'ADD_EDIT' && (
          <form onSubmit={handleSaveContender} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                  Contender Title / Hardware Item
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full theme-input px-3.5 py-2.5"
                  placeholder="NVIDIA Jetson Orin Nano Developer Kit"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                  Category / Classification
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full theme-input px-3.5 py-2.5"
                  placeholder="Edge AI & SLAM Compute"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                  Role Badge / Combat Class
                </label>
                <input
                  type="text"
                  value={formData.roleBadge}
                  onChange={(e) => setFormData({ ...formData, roleBadge: e.target.value.toUpperCase() })}
                  className="w-full theme-input font-mono uppercase px-3.5 py-2.5"
                  placeholder="SUPERCOMPUTE CORE"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                  Starting Base Bid ({profile.currency})
                </label>
                <input
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => setFormData({ ...formData, startingBid: Number(e.target.value) })}
                  className="w-full theme-input font-mono font-bold text-[#D8CFB4] px-3.5 py-2.5"
                  min={100}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-1">
                  Minimum Bid Increment ({profile.currency})
                </label>
                <input
                  type="number"
                  value={formData.minIncrement}
                  onChange={(e) => setFormData({ ...formData, minIncrement: Number(e.target.value) })}
                  className="w-full theme-input font-mono px-3.5 py-2.5"
                  min={50}
                  required
                />
              </div>
            </div>

            {/* Performance Ratings Sliders */}
            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#16A085] uppercase">
                <Activity className="w-4 h-4" />
                <span>Telemetry Performance Ratings (0-100)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                    <span>Power / Torque</span>
                    <strong className="text-[#16A085]">{formData.power}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: Number(e.target.value) })}
                    className="w-full accent-[#16A085]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                    <span>Agility / Speed</span>
                    <strong className="text-[#16A085]">{formData.velocity}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.velocity}
                    onChange={(e) => setFormData({ ...formData, velocity: Number(e.target.value) })}
                    className="w-full accent-[#16A085]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                    <span>Durability / Armor</span>
                    <strong className="text-[#D8CFB4]">{formData.armor}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.armor}
                    onChange={(e) => setFormData({ ...formData, armor: Number(e.target.value) })}
                    className="w-full accent-[#16A085]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                    <span>AI Compute / IQ</span>
                    <strong className="text-[#16A085]">{formData.aiCompute}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.aiCompute}
                    onChange={(e) => setFormData({ ...formData, aiCompute: Number(e.target.value) })}
                    className="w-full accent-[#16A085]"
                  />
                </div>
              </div>
            </div>

            {/* Image Selection & File Upload */}
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                Contender Image (Photo / Avatar)
              </label>

              <div className="flex gap-4 items-start mb-3">
                <div className="w-24 h-24 rounded-[18px] overflow-hidden border-2 border-[#16A085]/40 bg-black p-1 flex-shrink-0">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-[14px]" />
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full theme-input text-xs px-3.5 py-2"
                    placeholder="https://images.unsplash.com/..."
                  />

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-gray-200 cursor-pointer transition-all">
                    <ImageIcon className="w-4 h-4 text-[#16A085]" />
                    <span>Upload Real Photo From Device (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Avatar Preset Chips */}
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: av.url })}
                    className={`px-3 py-1 rounded-[18px] text-[11px] font-bold border transition-all ${
                      formData.imageUrl === av.url
                        ? 'bg-[#16A085]/20 border-[#16A085] text-[#16A085]'
                        : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white'
                    }`}
                  >
                    {av.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-5 py-2.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-bold text-gray-300 border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-[#16A085]/30"
              >
                {editingLotId ? 'Save Contender Changes' : 'Create Contender'}
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* TAB: IMPORT / EXPORT */}
        {/* ================================================================= */}
        {activeTab === 'IMPORT_EXPORT' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* CSV Batch Ingestion */}
            <div className="p-5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#16A085]" />
                  <h3 className="text-sm font-poppins font-black text-white uppercase">
                    CSV Spreadsheet Batch Import
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  Header: title,category,startingBid,minIncrement
                </span>
              </div>

              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={`title,category,startingBid,minIncrement\nQuantum Core Processor,Compute,35000,3000\nCarbon Kinetic Chassis,Structural,40000,4000`}
                className="w-full h-28 theme-input font-mono text-xs resize-none p-3"
              />

              <button
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#16A085]/30"
              >
                <Upload className="w-3.5 h-3.5" />
                Ingest Lots from CSV
              </button>
            </div>

            {/* JSON Tournament Import/Export */}
            <div className="p-5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#16A085]" />
                  <h3 className="text-sm font-poppins font-black text-white uppercase">
                    Complete Tournament JSON Backup
                  </h3>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-1.5 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-gray-200 transition-all flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-[#16A085]" />
                  Export JSON
                </button>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste previously exported tournament JSON here..."
                className="w-full h-24 theme-input font-mono text-xs resize-none p-3"
              />

              <button
                onClick={handleImportJson}
                className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-gray-200 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#16A085]" />
                Restore Tournament from JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContenderManagerModal;
