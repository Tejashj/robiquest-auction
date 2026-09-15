/**
 * ============================================================================
 * TOURNAMENT AUCTION & SQUAD GOVERNANCE SCHEMAS (ZOD + TYPESCRIPT)
 * Strict Mathematical Validation Rules, Category Quotas, and Purse Constraints
 * ============================================================================
 */

import { z } from 'zod';

export enum EnforcementPolicy {
  STRICT_DISQUALIFICATION = 'STRICT_DISQUALIFICATION', // Hard rejection of invalid bids
  WARNING_AND_PENALTY = 'WARNING_AND_PENALTY', // Flagged warning with administrative fine
}

export enum PlayerRoleCategory {
  BATTER = 'BATTER',
  BOWLER = 'BOWLER',
  ALL_ROUNDER = 'ALL_ROUNDER',
  WICKETKEEPER = 'WICKETKEEPER',
  OVERSEAS = 'OVERSEAS',
  UNCAPPED_EMERGING = 'UNCAPPED_EMERGING',
  CUSTOM = 'CUSTOM',
}

// ----------------------------------------------------------------------------
// 1. DYNAMIC CATEGORY QUOTA RULE SCHEMA
// ----------------------------------------------------------------------------

export const CategoryQuotaRuleSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  categoryName: z.string().min(2, { message: 'Category name required' }),
  roleType: z.nativeEnum(PlayerRoleCategory),
  minRequired: z.coerce.number().int().nonnegative({ message: 'Min required must be >= 0' }),
  maxAllowed: z.coerce.number().int().positive({ message: 'Max allowed must be >= 1' }),
  isMandatory: z.boolean().default(true),
  notes: z.string().optional().default(''),
}).refine((data) => data.minRequired <= data.maxAllowed, {
  message: 'Minimum required cannot exceed maximum allowed quota',
  path: ['minRequired'],
});

export type CategoryQuotaRule = z.infer<typeof CategoryQuotaRuleSchema>;

// ----------------------------------------------------------------------------
// 2. GLOBAL SQUAD & PURSE CONSTRAINTS SCHEMA
// ----------------------------------------------------------------------------

export const GlobalSquadConstraintsSchema = z.object({
  minSquadSize: z.coerce.number().int().min(11, { message: 'Minimum squad must be at least 11 players' }).max(30),
  maxSquadSize: z.coerce.number().int().min(15, { message: 'Maximum squad must be at least 15 players' }).max(35),
  totalPurseCap: z.coerce.number().positive({ message: 'Total purse cap must be greater than zero' }),
  lowestBasePrice: z.coerce.number().positive({ message: 'Lowest base price must be positive' }),
  enforceReservePurseFloor: z.boolean().default(true),
  minOverseasLimit: z.coerce.number().int().nonnegative().default(0),
  maxOverseasLimit: z.coerce.number().int().positive().default(8),
  minUncappedLimit: z.coerce.number().int().nonnegative().default(4),
  policy: z.nativeEnum(EnforcementPolicy).default(EnforcementPolicy.STRICT_DISQUALIFICATION),
}).refine((data) => data.minSquadSize <= data.maxSquadSize, {
  message: 'Minimum squad size cannot exceed maximum squad size',
  path: ['minSquadSize'],
}).refine((data) => data.minOverseasLimit <= data.maxOverseasLimit, {
  message: 'Minimum overseas players cannot exceed maximum overseas players',
  path: ['minOverseasLimit'],
});

export type GlobalSquadConstraints = z.infer<typeof GlobalSquadConstraintsSchema>;

// ----------------------------------------------------------------------------
// 3. COMPLETE TOURNAMENT GOVERNANCE CONFIGURATION SCHEMA
// ----------------------------------------------------------------------------

export const TournamentGovernanceConfigSchema = z.object({
  tournamentId: z.string().min(2),
  tournamentName: z.string().min(3),
  seasonYear: z.coerce.number().int().min(2024),
  currencySymbol: z.string().default('₹'),
  currencyCode: z.string().default('INR'),
  globalConstraints: GlobalSquadConstraintsSchema,
  categoryQuotas: z.array(CategoryQuotaRuleSchema).min(1, { message: 'At least one category quota rule is required' }),
  defaultBidIncrementSteps: z.array(z.number().positive()).default([
    2000000,  // ₹20 Lakhs
    5000000,  // ₹50 Lakhs
    10000000, // ₹1.00 Crore
    20000000, // ₹2.00 Crore
  ]),
});

export type TournamentGovernanceConfig = z.infer<typeof TournamentGovernanceConfigSchema>;

// ----------------------------------------------------------------------------
// 4. TEAM PURSE & SQUAD MANAGEMENT SCHEMA
// ----------------------------------------------------------------------------

export const TeamPurseAdjustmentSchema = z.object({
  teamId: z.string().uuid(),
  adjustmentAmount: z.coerce.number(), // Positive to credit, negative for penalty
  reason: z.string().min(5, { message: 'A descriptive reason is required for purse alterations' }),
  authorizedBy: z.string().min(2),
  freezeBiddingRights: z.boolean().optional(),
});

export type TeamPurseAdjustment = z.infer<typeof TeamPurseAdjustmentSchema>;

// ----------------------------------------------------------------------------
// 5. LIVE HAMMER & STAGE OVERRIDE PAYLOAD SCHEMA
// ----------------------------------------------------------------------------

export enum AdminHammerActionType {
  START_CLOCK = 'START_CLOCK',
  PAUSE_CLOCK = 'PAUSE_CLOCK',
  EXTEND_CLOCK = 'EXTEND_CLOCK',
  RESET_CLOCK = 'RESET_CLOCK',
  FAIR_WARNING = 'FAIR_WARNING',
  GOING_TWICE = 'GOING_TWICE',
  SOLD = 'SOLD',
  PASS_UNSOLD = 'PASS_UNSOLD',
  RE_AUCTION_LOT = 'RE_AUCTION_LOT',
  REVOKE_LAST_BID = 'REVOKE_LAST_BID',
  OVERRIDE_INCREMENT = 'OVERRIDE_INCREMENT',
  REORDER_QUEUE = 'REORDER_QUEUE',
}

export const AdminHammerCommandSchema = z.object({
  lotId: z.string().uuid(),
  action: z.nativeEnum(AdminHammerActionType),
  additionalSeconds: z.number().optional(),
  overrideIncrementStep: z.number().optional(),
  targetQueueLotIds: z.array(z.string().uuid()).optional(),
  operatorId: z.string().min(2),
  notes: z.string().optional(),
});

export type AdminHammerCommand = z.infer<typeof AdminHammerCommandSchema>;
