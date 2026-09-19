'use client';

/**
 * ============================================================================
 * EXCEL INGESTION & AUTO-COLUMN MAPPING MODAL
 * Drag & Drop, Streaming Dry-Run Preview, Zod Error Inspector & Rollback
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  Layers,
} from 'lucide-react';

export interface ColumnMapOption {
  header: string;
  mappedField: string;
  confidence: number;
}

export interface ValidationErrorItem {
  row: number;
  lotNumber?: number;
  field: string;
  value: any;
  message: string;
}

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCommitted?: (batchId: string, count: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onBatchCommitted,
}) => {
  const [stage, setStage] = useState<'UPLOAD' | 'MAPPING' | 'PREVIEW' | 'COMMITTED'>('UPLOAD');
  const [fileName, setFileName] = useState<string>('Sothebys_Masterpieces_Catalog_Fall2026.xlsx');
  const [fileSize] = useState<string>('4.2 MB (2,450 Lots)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [committedBatchId, setCommittedBatchId] = useState<string | null>(null);

  // Auto-inferred column mappings
  const [mappings, setMappings] = useState<ColumnMapOption[]>([
    { header: 'Lot #', mappedField: 'lotNumber', confidence: 0.99 },
    { header: 'Artwork Title', mappedField: 'title', confidence: 0.95 },
    { header: 'Category / Department', mappedField: 'category', confidence: 0.92 },
    { header: 'Consignor / Seller', mappedField: 'sellerName', confidence: 0.88 },
    { header: 'Opening Price ($)', mappedField: 'startingBid', confidence: 0.96 },
    { header: 'Confidential Reserve ($)', mappedField: 'reservePrice', confidence: 0.91 },
    { header: 'Min Increment ($)', mappedField: 'minIncrement', confidence: 0.94 },
    { header: 'Est. Low ($)', mappedField: 'estimatedLow', confidence: 0.89 },
    { header: 'Est. High ($)', mappedField: 'estimatedHigh', confidence: 0.89 },
    { header: 'High-Res Image URLs', mappedField: 'imageUrls', confidence: 0.85 },
  ]);

  // Validation report data from dry-run
  const [validationReport] = useState({
    totalRows: 2450,
    validRows: 2448,
    errorRows: 2,
    duplicates: [14],
    errors: [
      {
        row: 142,
        lotNumber: 14,
        field: 'lotNumber',
        value: 14,
        message: 'Duplicate Lot #14 detected. Lot numbers must be globally unique within the auction.',
      },
      {
        row: 885,
        lotNumber: 88,
        field: 'startingBid',
        value: '-$5,000.00',
        message: 'Starting bid cannot be negative. Expected positive currency decimal.',
      },
    ] as ValidationErrorItem[],
  });

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('MAPPING');
    }, 1200);
  };

  const handleProceedToPreview = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('PREVIEW');
    }, 900);
  };

  const handleCommitBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const batchId = `batch-${Date.now().toString(36)}`;
      setCommittedBatchId(batchId);
      setStage('COMMITTED');
      if (onBatchCommitted) {
        onBatchCommitted(batchId, validationReport.validRows);
      }
    }, 1400);
  };

  const handleRollbackBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStage('UPLOAD');
      setCommittedBatchId(null);
    }, 1000);
  };

  const schemaFieldOptions = [
    { value: 'lotNumber', label: 'Lot Number (lotNumber)' },
    { value: 'title', label: 'Item Title (title)' },
    { value: 'category', label: 'Category (category)' },
    { value: 'sellerName', label: 'Seller Name (sellerName)' },
    { value: 'startingBid', label: 'Starting Bid (startingBid)' },
    { value: 'reservePrice', label: 'Reserve Price (reservePrice)' },
    { value: 'minIncrement', label: 'Min Increment (minIncrement)' },
    { value: 'estimatedLow', label: 'Estimated Low (estimatedLow)' },
    { value: 'estimatedHigh', label: 'Estimated High (estimatedHigh)' },
    { value: 'imageUrls', label: 'Image URLs (imageUrls)' },
    { value: 'ignored', label: '-- Ignore Column --' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl font-poppins">
      <div className="relative w-full max-w-4xl rounded-[18px] bg-[#000000] border border-white/[0.08] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#16A085]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Excel Ingestion & Auto-Synchronization
                <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                  STREAMING PIPELINE (50K+ CAPABLE)
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Fuzzy column mapping, strict validation, and dry-run error inspector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
          {[
            { id: 'UPLOAD', label: '1. Upload File' },
            { id: 'MAPPING', label: '2. Schema Mapping' },
            { id: 'PREVIEW', label: '3. Dry-Run Preview' },
            { id: 'COMMITTED', label: '4. Committed / Rollback' },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-2.5 rounded-[18px] text-center border transition-all ${
                stage === s.id
                  ? 'bg-[#16A085] text-black font-extrabold border-transparent shadow-lg shadow-[#16A085]/30'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-400'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 1: DRAG & DROP UPLOAD ZONE                                   */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'UPLOAD' && (
          <div className="space-y-4">
            <div
              onClick={handleSimulateUpload}
              className="border-2 border-dashed border-white/[0.12] hover:border-[#16A085] rounded-[18px] p-12 text-center cursor-pointer transition-all hover:bg-white/[0.02] group"
            >
              <div className="w-16 h-16 mx-auto rounded-[18px] bg-[#16A085]/10 group-hover:bg-[#16A085]/20 border border-[#16A085]/30 flex items-center justify-center mb-4 transition-colors">
                <UploadCloud className="w-8 h-8 text-[#16A085]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Drag & Drop Excel Spreadsheet (.xlsx, .xls, .csv)
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                Supports massive catalogs up to 50,000+ lots. Low-memory streaming parser will auto-detect your column headers.
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[18px] bg-white/[0.05] text-xs font-semibold text-white border border-white/[0.08] group-hover:border-[#16A085]">
                Select File from Disk
              </span>
            </div>

            <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#16A085]" />
                <span>Default Sample: <strong className="text-white">{fileName}</strong></span>
              </div>
              <span className="text-[#D8CFB4] font-mono">{fileSize}</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 2: DYNAMIC COLUMN AUTO-MAPPER                                */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'MAPPING' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#16A085]" />
                  Auto-Inferred Column Mappings
                </h3>
                <p className="text-xs text-gray-400">
                  Verify or override target database fields for each spreadsheet header
                </p>
              </div>
              <span className="text-xs text-[#16A085] font-mono font-bold">10/10 Headers Inferred</span>
            </div>

            <div className="rounded-[18px] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-black text-gray-400 uppercase tracking-wider text-[10px] border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3">Spreadsheet Header</th>
                    <th className="p-3">Matched Database Entity</th>
                    <th className="p-3">Match Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08] bg-[#000000]">
                  {mappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white font-mono">{m.header}</td>
                      <td className="p-3">
                        <select
                          value={m.mappedField}
                          onChange={(e) => {
                            const updated = [...mappings];
                            updated[idx].mappedField = e.target.value;
                            setMappings(updated);
                          }}
                          className="bg-black border border-white/[0.08] rounded-[18px] px-3 py-1.5 text-white focus:outline-none focus:border-[#16A085]"
                        >
                          {schemaFieldOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-[18px] text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/30">
                          {Math.round(m.confidence * 100)}% Match
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStage('UPLOAD')}
                className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-xs text-gray-300 border border-white/[0.08]"
              >
                Back
              </button>
              <button
                onClick={handleProceedToPreview}
                className="px-5 py-2 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#16A085]/25"
              >
                Run Validation Dry-Run
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 3: DRY-RUN PREVIEW & VALIDATION ERROR INSPECTOR              */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'PREVIEW' && (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-[18px] bg-white/[0.03] border border-white/[0.08] text-xs">
                <span className="text-gray-400 block mb-1">Total Catalog Lots</span>
                <span className="text-lg font-mono font-bold text-[#D8CFB4]">
                  {validationReport.totalRows.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-[18px] bg-[#16A085]/10 border border-[#16A085]/30 text-xs">
                <span className="text-[#16A085] block mb-1 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid & Clean Lots
                </span>
                <span className="text-lg font-mono font-bold text-[#16A085]">
                  {validationReport.validRows.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-[18px] bg-red-950/20 border border-red-500/30 text-xs">
                <span className="text-red-400 block mb-1 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Validation Exceptions
                </span>
                <span className="text-lg font-mono font-bold text-red-300">
                  {validationReport.errorRows} Errors
                </span>
              </div>
            </div>

            {/* Error Inspector Table */}
            {validationReport.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Validation Exceptions (Fixed or Filtered Automatically)
                </h4>
                <div className="rounded-[18px] border border-red-500/30 bg-red-950/10 p-3 space-y-2 max-h-40 overflow-y-auto">
                  {validationReport.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-[18px] bg-black border border-red-500/20 text-xs flex items-start justify-between"
                    >
                      <div>
                        <span className="font-mono text-red-300 font-bold mr-2">
                          Row #{err.row} (Lot #{err.lotNumber}):
                        </span>
                        <span className="text-gray-300">{err.message}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-mono bg-red-500/20 text-red-400">
                        Field: {err.field}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStage('MAPPING')}
                className="px-4 py-2 rounded-[18px] bg-white/[0.03] hover:bg-white/[0.08] text-xs text-gray-300 border border-white/[0.08]"
              >
                Remap Columns
              </button>
              <button
                disabled={isProcessing}
                onClick={handleCommitBatch}
                className="px-5 py-2.5 rounded-[18px] bg-[#16A085] hover:bg-[#1abc9c] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#16A085]/30"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Executing Chunked Inserts (500/chunk)...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Execute Transactional Batch Insert ({validationReport.validRows} Lots)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 4: COMMITTED & ROLLBACK WORKFLOW                              */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'COMMITTED' && (
          <div className="space-y-5 text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-[18px] bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#16A085]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Batch Successfully Committed to Database!
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {validationReport.validRows.toLocaleString()} lots have been indexed, hydrated into Redis, and scheduled for live bidding.
              </p>
              <div className="mt-3 inline-block font-mono text-xs text-[#D8CFB4] bg-white/[0.03] px-3 py-1 rounded-[18px] border border-white/[0.08]">
                Batch ID: {committedBatchId}
              </div>
            </div>

            {/* Rollback Safety Mechanism */}
            <div className="p-4 rounded-[18px] bg-red-950/20 border border-red-500/30 text-left max-w-xl mx-auto flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-300">Accidental Ingestion or Wrong File?</h4>
                <p className="text-[11px] text-gray-400">
                  Single-click rollback cleans up all inserted lots and restores catalog state.
                </p>
              </div>
              <button
                onClick={handleRollbackBatch}
                className="px-3 py-1.5 rounded-[18px] bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rollback Batch
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-[18px] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08]"
              >
                Done / Return to Live Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
