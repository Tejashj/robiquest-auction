/**
 * ============================================================================
 * SERVER-SIDE BID GOVERNANCE VALIDATION ENGINE
 * Strict Mathematical Validation: Purse Solvency, Reserve Floors & Squad Quotas
 * ============================================================================
 */

import {
  GlobalSquadConstraints,
  CategoryQuotaRule,
  EnforcementPolicy,
} from './governance-schema';

export interface TeamGovernanceContext {
  teamId: string;
  teamName: string;
  isBiddingFrozen: boolean;
  remainingPurse: number;
  currentSquadCount: number;
  currentOverseasCount: number;
  currentUncappedCount: number;
  categoryCounts: Record<string, number>; // e.g. { 'BATTER': 4, 'WICKETKEEPER': 1 }
}

export interface LotGovernanceContext {
  lotId: string;
  title: string;
  isOverseas: boolean;
  isUncapped: boolean;
  roleCategory: string; // e.g. 'WICKETKEEPER', 'BATTER'
  basePrice: number;
}

export interface BidGovernanceValidationResult {
  isValid: boolean;
  errorCode?:
    | 'TEAM_BIDDING_FROZEN'
    | 'INSUFFICIENT_PURSE'
    | 'MAX_SQUAD_CAP_REACHED'
    | 'MAX_OVERSEAS_CAP_EXCEEDED'
    | 'RESERVE_PURSE_FLOOR_VIOLATION'
    | 'CATEGORY_QUOTA_EXCEEDED';
  errorMessage?: string;
  metrics?: {
    attemptedBid: number;
    remainingPurseAfterBid: number;
    mandatoryReserveFloorNeeded: number;
    unfilledMandatorySlots: number;
  };
}

/**
 * DETERMINISTIC BID GOVERNANCE VALIDATOR
 * Evaluates whether an incoming bid satisfies squad limits, overseas caps,
 * and mathematical reserve purse floor equations.
 */
export function validateBidGovernance(
  bidAmount: number,
  team: TeamGovernanceContext,
  lot: LotGovernanceContext,
  constraints: GlobalSquadConstraints,
  categoryQuotas: CategoryQuotaRule[] = []
): BidGovernanceValidationResult {
  // 1. Check if Team is Administratively Frozen
  if (team.isBiddingFrozen) {
    return {
      isValid: false,
      errorCode: 'TEAM_BIDDING_FROZEN',
      errorMessage: `Bidding rights for ${team.teamName} have been frozen by the Tournament Director.`,
    };
  }

  // 2. Check Absolute Purse Solvency
  if (team.remainingPurse < bidAmount) {
    return {
      isValid: false,
      errorCode: 'INSUFFICIENT_PURSE',
      errorMessage: `Bid amount ₹${(bidAmount / 10000000).toFixed(2)} Cr exceeds ${team.teamName}'s total remaining purse of ₹${(team.remainingPurse / 10000000).toFixed(2)} Cr.`,
      metrics: {
        attemptedBid: bidAmount,
        remainingPurseAfterBid: team.remainingPurse - bidAmount,
        mandatoryReserveFloorNeeded: 0,
        unfilledMandatorySlots: 0,
      },
    };
  }

  // 3. Check Maximum Squad Size Hard Cap
  if (team.currentSquadCount >= constraints.maxSquadSize) {
    return {
      isValid: false,
      errorCode: 'MAX_SQUAD_CAP_REACHED',
      errorMessage: `${team.teamName} has already reached the maximum squad cap of ${constraints.maxSquadSize} players.`,
    };
  }

  // 4. Check Overseas Player Cap
  if (lot.isOverseas && team.currentOverseasCount >= constraints.maxOverseasLimit) {
    return {
      isValid: false,
      errorCode: 'MAX_OVERSEAS_CAP_EXCEEDED',
      errorMessage: `${team.teamName} already holds ${team.currentOverseasCount} overseas players, reaching the tournament maximum of ${constraints.maxOverseasLimit}.`,
    };
  }

  // 5. Check Dynamic Role Quotas (e.g. Max Batters, Max Bowlers)
  const matchingQuota = categoryQuotas.find(
    (q) => q.roleType === lot.roleCategory || q.categoryName.toLowerCase() === lot.roleCategory.toLowerCase()
  );
  if (matchingQuota) {
    const currentCountInRole = team.categoryCounts[matchingQuota.categoryName] || 0;
    if (currentCountInRole >= matchingQuota.maxAllowed) {
      return {
        isValid: false,
        errorCode: 'CATEGORY_QUOTA_EXCEEDED',
        errorMessage: `${team.teamName} has reached the maximum allowed limit of ${matchingQuota.maxAllowed} for ${matchingQuota.categoryName}.`,
      };
    }
  }

  // 6. MATHEMATICAL SQUAD RESERVE PURSE FLOOR PRESERVATION
  // Formula: RemainingPurse - BidAmount >= (MinSquadSize - CurrentSquadCount - 1) * LowestBasePrice
  if (constraints.enforceReservePurseFloor) {
    const unfilledMandatorySlots = Math.max(0, constraints.minSquadSize - team.currentSquadCount - 1);
    const mandatoryReserveFloorNeeded = unfilledMandatorySlots * constraints.lowestBasePrice;
    const remainingPurseAfterBid = team.remainingPurse - bidAmount;

    if (remainingPurseAfterBid < mandatoryReserveFloorNeeded) {
      return {
        isValid: false,
        errorCode: 'RESERVE_PURSE_FLOOR_VIOLATION',
        errorMessage: `Reserve purse floor violation! After bidding ₹${(bidAmount / 10000000).toFixed(2)} Cr, ${team.teamName} would be left with ₹${(remainingPurseAfterBid / 10000000).toFixed(2)} Cr, which is below the mandatory reserve floor of ₹${(mandatoryReserveFloorNeeded / 10000000).toFixed(2)} Cr required to fill ${unfilledMandatorySlots} remaining mandatory squad slots (at ₹${(constraints.lowestBasePrice / 100000).toFixed(0)} Lakhs base).`,
        metrics: {
          attemptedBid: bidAmount,
          remainingPurseAfterBid,
          mandatoryReserveFloorNeeded,
          unfilledMandatorySlots,
        },
      };
    }
  }

  // All invariants satisfied!
  return {
    isValid: true,
    metrics: {
      attemptedBid: bidAmount,
      remainingPurseAfterBid: team.remainingPurse - bidAmount,
      mandatoryReserveFloorNeeded: Math.max(0, constraints.minSquadSize - team.currentSquadCount - 1) * constraints.lowestBasePrice,
      unfilledMandatorySlots: Math.max(0, constraints.minSquadSize - team.currentSquadCount - 1),
    },
  };
}
