'use client';

/**
 * ============================================================================
 * TOURNAMENT & SQUAD RULE GOVERNANCE FORM (REACT HOOK FORM + ZOD)
 * Dynamic Quota Rules Builder, Reserve Purse Floor Calculator & Policy Toggles
 * ============================================================================
 */

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Scale,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export interface CategoryQuotaItem {
  id: string;
  categoryName: string;
  roleType: string;
  minRequired: number;
  maxAllowed: number;
  isMandatory: boolean;
}

export interface GovernanceFormData {
  minSquadSize: number;
  maxSquadSize: number;
  totalPurseCapCrores: number;
  lowestBasePriceLakhs: number;
  enforceReservePurseFloor: boolean;
  minOverseasLimit: number;
  maxOverseasLimit: number;
  minUncappedLimit: number;
  policy: 'STRICT_DISQUALIFICATION' | 'WARNING_AND_PENALTY';
  categoryQuotas: CategoryQuotaItem[];
}

export interface SquadRuleGovernanceFormProps {
  onSaveRuleSet?: (data: GovernanceFormData) => void;
}

export const SquadRuleGovernanceForm: React.FC<SquadRuleGovernanceFormProps> = ({
  onSaveRuleSet,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GovernanceFormData>({
    defaultValues: {
      minSquadSize: 18,
      maxSquadSize: 25,
      totalPurseCapCrores: 120,
      lowestBasePriceLakhs: 30,
      enforceReservePurseFloor: true,
      minOverseasLimit: 0,
      maxOverseasLimit: 8,
      minUncappedLimit: 4,
      policy: 'STRICT_DISQUALIFICATION',
      categoryQuotas: [
        {
          id: 'q-1',
          categoryName: 'Wicketkeepers',
          roleType: 'WICKETKEEPER',
          minRequired: 2,
          maxAllowed: 4,
          isMandatory: true,
        },
        {
          id: 'q-2',
          categoryName: 'Overseas Players',
          roleType: 'OVERSEAS',
          minRequired: 0,
          maxAllowed: 8,
          isMandatory: true,
        },
        {
          id: 'q-3',
          categoryName: 'Uncapped / Emerging',
          roleType: 'UNCAPPED_EMERGING',
          minRequired: 4,
          maxAllowed: 12,
          isMandatory: true,
        },
        {
          id: 'q-4',
          categoryName: 'Specialist Bowlers',
          roleType: 'BOWLER',
          minRequired: 5,
          maxAllowed: 10,
          isMandatory: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categoryQuotas',
  });

  // Watch key fields to dynamically calculate minimum reserve floor
  const minSquad = watch('minSquadSize');
  const basePriceLakhs = watch('lowestBasePriceLakhs');
  const enforceFloor = watch('enforceReservePurseFloor');

  const onSubmit = (data: GovernanceFormData) => {
    console.log('[Governance Rule Set Updated]', data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    if (onSaveRuleSet) {
      onSaveRuleSet(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">
              Tournament Rule Set Updated & Broadcasted Across All Engine Instances!
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-75">EVENT: RULE_SET_UPDATED</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: GLOBAL SQUAD LIMITS & PURSE CAP                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-3xl bg-[#090d19] border border-white/10 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Global Squad Limits & Purse Solvency Constraints
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            GOVERNANCE LEVEL: TOURNAMENT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Min Squad Size */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Min Players per Squad
            </label>
            <input
              type="number"
              {...register('minSquadSize', { valueAsNumber: true, min: 11, max: 30 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">Mandatory minimum roster</span>
          </div>

          {/* Max Squad Size */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Max Players Cap
            </label>
            <input
              type="number"
              {...register('maxSquadSize', { valueAsNumber: true, min: 15, max: 35 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">Hard squad limit</span>
          </div>

          {/* Total Purse Cap */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Purse Cap (₹ Crores)
            </label>
            <input
              type="number"
              {...register('totalPurseCapCrores', { valueAsNumber: true, min: 1 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">Standard franchise ceiling</span>
          </div>

          {/* Lowest Base Price */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Lowest Base Price (₹ Lakhs)
            </label>
            <input
              type="number"
              {...register('lowestBasePriceLakhs', { valueAsNumber: true, min: 5 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400">Floor player price tier</span>
          </div>
        </div>

        {/* MATHEMATICAL RESERVE PURSE FLOOR PRESERVATION BANNER */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Mathematical Reserve Purse Floor Preservation
              </span>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                {...register('enforceReservePurseFloor')}
                className="w-4 h-4 rounded text-cyan-500 bg-black border-white/20"
              />
              <span className="font-semibold">Enforce Live Invariant</span>
            </label>
          </div>

          <div className="text-xs text-slate-300 space-y-1 bg-[#050811] p-3 rounded-xl border border-white/5 font-mono">
            <div className="text-cyan-300 font-bold text-[11px]">
              SOLVENCY INVARIANT FORMULA:
            </div>
            <div className="text-slate-200">
              RemainingPurse - BidAmount ≥ (MinSquadSize - CurrentSquadCount - 1) × LowestBasePrice
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Currently preserves ₹{(basePriceLakhs || 30)} Lakhs per remaining mandatory slot. Ensures no franchise can bid itself into a state where it cannot afford to fill mandatory slots.
            </div>
          </div>
        </div>

        {/* Global Foreign & Emerging Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Max Overseas Players Allowed
            </label>
            <input
              type="number"
              {...register('maxOverseasLimit', { valueAsNumber: true, min: 1 })}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Min Uncapped Players Required
            </label>
            <input
              type="number"
              {...register('minUncappedLimit', { valueAsNumber: true, min: 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Rule Enforcement Policy
            </label>
            <select
              {...register('policy')}
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="STRICT_DISQUALIFICATION">
                Strict Disqualification (Block Invalid Bids)
              </option>
              <option value="WARNING_AND_PENALTY">
                Warning & Administrative Fine
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: DYNAMIC CATEGORY & COMPOSITION QUOTA BUILDER           */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-3xl bg-[#090d19] border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Category & Composition Quotas (Multi-Rule Builder)
            </h3>
            <p className="text-xs text-slate-400">
              Set minimum requirements and maximum caps for specific positional roles
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              append({
                id: `q-${Date.now()}`,
                categoryName: 'Custom Role',
                roleType: 'CUSTOM',
                minRequired: 1,
                maxAllowed: 5,
                isMandatory: true,
              })
            }
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category Rule
          </button>
        </div>

        {/* Dynamic Fields List */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-400">
                  Category Name
                </label>
                <input
                  type="text"
                  {...register(`categoryQuotas.${index}.categoryName` as const)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-400">
                  Role Type
                </label>
                <select
                  {...register(`categoryQuotas.${index}.roleType` as const)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="BATTER">Batter</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-Rounder</option>
                  <option value="WICKETKEEPER">Wicketkeeper</option>
                  <option value="OVERSEAS">Overseas Player</option>
                  <option value="UNCAPPED_EMERGING">Uncapped / Emerging</option>
                  <option value="CUSTOM">Custom Category</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-400">
                  Min Req.
                </label>
                <input
                  type="number"
                  {...register(`categoryQuotas.${index}.minRequired` as const, {
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-400">
                  Max Cap
                </label>
                <input
                  type="number"
                  {...register(`categoryQuotas.${index}.maxAllowed` as const, {
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 sm:pt-0">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`categoryQuotas.${index}.isMandatory` as const)}
                    className="w-3.5 h-3.5 rounded text-purple-500 bg-black border-white/20"
                  />
                  <span>Mandatory</span>
                </label>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98]"
        >
          <ShieldCheck className="w-4 h-4 fill-black stroke-black" />
          Save & Broadcast Governance Rules
        </button>
      </div>
    </form>
  );
};
