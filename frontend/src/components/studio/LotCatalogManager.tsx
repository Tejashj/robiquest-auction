'use client';

/**
 * ============================================================================
 * LOT CATALOG & INGESTION MANAGER (USER-DRIVEN CRUD)
 * Add, Edit, Delete, Reorder Lots, Import Excel Spreadsheets, Send to Live Stage
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Trash2,
  Play,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  X,
  Eye,
} from 'lucide-react';
import {
  useAuctionEngineStore,
  AuctionLotItem,
  formatAuctionCurrency,
} from '../../store/auction-engine-store';
import { ExcelImportModal } from '../auction/ExcelImportModal';

export const LotCatalogManager: React.FC = () => {
  const { lots, activeLotId, addLot, deleteLot, setActiveLot, profile } =
    useAuctionEngineStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // New lot form state
  const [newTitle, setNewTitle] = useState('');
  const [newLotNum, setNewLotNum] = useState(lots.length + 1);
  const [newCategory, setNewCategory] = useState('Featured Asset');
  const [newStartingBid, setNewStartingBid] = useState(profile.lowestBasePrice || 50000);
  const [newReservePrice, setNewReservePrice] = useState(profile.lowestBasePrice || 50000);
  const [newIncrement, setNewIncrement] = useState(profile.defaultMinIncrement || 10000);
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
  );

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    addLot({
      lotNumber: Number(newLotNum),
      title: newTitle,
      category: newCategory,
      roleBadge: 'CATALOG ASSET',
      startingBid: Number(newStartingBid),
      reservePrice: Number(newReservePrice),
      minIncrement: Number(newIncrement),
      imageUrls: [newImageUrl],
      attributes: {
        Added: 'User Created',
      },
    });

    setNewTitle('');
    setNewLotNum(lots.length + 2);
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#080d19] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Package className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                CATALOG REPOSITORY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300">
                {lots.length} TOTAL LOTS
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Lot & Inventory Management
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Import Excel Catalog
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom Lot
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      {lots.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center space-y-4 bg-black/20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Package className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">Your Catalog is Currently Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add custom catalog lots manually or stream an existing spreadsheet to populate the live auction.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add First Lot
            </button>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/15"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Excel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#060914] shadow-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-black/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Lot # & Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Starting Bid</th>
                <th className="p-4">Reserve Price</th>
                <th className="p-4">Current Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lots.map((lot) => {
                const isActive = lot.id === activeLotId;
                return (
                  <tr
                    key={lot.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isActive ? 'bg-amber-500/[0.04]' : ''
                    }`}
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                        <img
                          src={lot.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100'}
                          alt={lot.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-amber-400 font-bold">
                            LOT #{lot.lotNumber}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-black">
                              ON STAGE
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm">{lot.title}</h4>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-semibold">{lot.category}</td>

                    <td className="p-4 font-mono font-bold text-slate-200">
                      {formatAuctionCurrency(lot.startingBid, profile.currency)}
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatAuctionCurrency(lot.reservePrice, profile.currency)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          lot.status === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : lot.status === 'SOLD'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : lot.status === 'PASSED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {lot.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {!isActive && (
                        <button
                          onClick={() => setActiveLot(lot.id)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Send to Stage
                        </button>
                      )}
                      <button
                        onClick={() => deleteLot(lot.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#090d19] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add New Catalog Lot
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-slate-300 font-semibold block">Lot #</label>
                  <input
                    type="number"
                    value={newLotNum}
                    onChange={(e) => setNewLotNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-slate-300 font-semibold block">Title / Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Heinrich Klaasen or Modern Painting"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Wicketkeeper, Fine Art, Real Estate"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Starting Bid</label>
                  <input
                    type="number"
                    value={newStartingBid}
                    onChange={(e) => setNewStartingBid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Reserve Price</label>
                  <input
                    type="number"
                    value={newReservePrice}
                    onChange={(e) => setNewReservePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Min Step</label>
                  <input
                    type="number"
                    value={newIncrement}
                    onChange={(e) => setNewIncrement(parseFloat(e.target.value) || 1000)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/25"
                >
                  Create Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Ingestion Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />
    </div>
  );
};
