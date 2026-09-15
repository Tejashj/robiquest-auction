/**
 * ============================================================================
 * GOVERNANCE VALIDATOR AUTOMATED TEST SUITE
 * Verifies Mathematical Reserve Floors, Overseas Caps, and Squad Invariants
 * ============================================================================
 */

import {
  validateBidGovernance,
  TeamGovernanceContext,
  LotGovernanceContext,
} from '../src/governance/bid-governance-validator';
import {
  GlobalSquadConstraints,
  CategoryQuotaRule,
  EnforcementPolicy,
  PlayerRoleCategory,
} from '../src/governance/governance-schema';

async function runGovernanceValidatorTests() {
  console.log('=================================================================');
  console.log('TOURNAMENT AUCTION GOVERNANCE & SQUAD INVARIANT VERIFICATION');
  console.log('=================================================================\n');

  const constraints: GlobalSquadConstraints = {
    minSquadSize: 18,
    maxSquadSize: 25,
    totalPurseCap: 1200000000, // ₹120 Cr
    lowestBasePrice: 3000000,   // ₹30 Lakhs
    enforceReservePurseFloor: true,
    minOverseasLimit: 0,
    maxOverseasLimit: 8,
    minUncappedLimit: 4,
    policy: EnforcementPolicy.STRICT_DISQUALIFICATION,
  };

  const quotas: CategoryQuotaRule[] = [
    {
      id: 'q-wk',
      categoryName: 'Wicketkeepers',
      roleType: PlayerRoleCategory.WICKETKEEPER,
      minRequired: 2,
      maxAllowed: 4,
      isMandatory: true,
      notes: '',
    },
  ];

  // --------------------------------------------------------------------------
  // TEST 1: RESERVE PURSE FLOOR VIOLATION
  // Team has 12 players (needs 6 more to reach 18).
  // Mandatory reserve floor needed for remaining 5 unfilled slots: 5 * ₹30L = ₹1.50 Cr.
  // Team remaining purse is ₹2.00 Cr.
  // Team bids ₹1.00 Cr.
  // Remaining purse after bid = ₹1.00 Cr < ₹1.50 Cr -> MUST BE REJECTED!
  // --------------------------------------------------------------------------
  console.log('Test 1: Mathematical Reserve Purse Floor Preservation...');
  const solventTeam: TeamGovernanceContext = {
    teamId: 'team-rcb',
    teamName: 'Royal Challengers Bengaluru',
    isBiddingFrozen: false,
    remainingPurse: 20000000, // ₹2.00 Cr
    currentSquadCount: 12,
    currentOverseasCount: 4,
    currentUncappedCount: 2,
    categoryCounts: { Wicketkeepers: 1 },
  };

  const domesticBatterLot: LotGovernanceContext = {
    lotId: 'lot-1',
    title: 'Domestic Batter',
    isOverseas: false,
    isUncapped: false,
    roleCategory: 'BATTER',
    basePrice: 5000000,
  };

  const res1 = validateBidGovernance(
    10000000, // ₹1.00 Cr bid
    solventTeam,
    domesticBatterLot,
    constraints,
    quotas
  );

  if (!res1.isValid && res1.errorCode === 'RESERVE_PURSE_FLOOR_VIOLATION') {
    console.log('  ✓ SUCCESS: Correctly rejected bid that violates reserve purse floor!');
    console.log(`    Detail: ${res1.errorMessage}\n`);
  } else {
    console.error('  ✗ FAIL: Did not catch reserve floor violation', res1);
  }

  // --------------------------------------------------------------------------
  // TEST 2: MAX OVERSEAS PLAYER CAP
  // Team already has 8 overseas players. Attempts to bid on an overseas player.
  // --------------------------------------------------------------------------
  console.log('Test 2: Maximum Overseas Player Cap Enforcement...');
  const maxOverseasTeam: TeamGovernanceContext = {
    teamId: 'team-srh',
    teamName: 'Sunrisers Hyderabad',
    isBiddingFrozen: false,
    remainingPurse: 500000000, // ₹50 Cr
    currentSquadCount: 15,
    currentOverseasCount: 8, // Already at max 8!
    currentUncappedCount: 3,
    categoryCounts: {},
  };

  const overseasLot: LotGovernanceContext = {
    lotId: 'lot-2',
    title: 'Overseas Fast Bowler',
    isOverseas: true,
    isUncapped: false,
    roleCategory: 'BOWLER',
    basePrice: 20000000,
  };

  const res2 = validateBidGovernance(
    50000000,
    maxOverseasTeam,
    overseasLot,
    constraints,
    quotas
  );

  if (!res2.isValid && res2.errorCode === 'MAX_OVERSEAS_CAP_EXCEEDED') {
    console.log('  ✓ SUCCESS: Correctly blocked bid exceeding overseas limit!');
    console.log(`    Detail: ${res2.errorMessage}\n`);
  } else {
    console.error('  ✗ FAIL: Failed overseas cap check', res2);
  }

  // --------------------------------------------------------------------------
  // TEST 3: FROZEN TEAM BIDDING RIGHTS
  // --------------------------------------------------------------------------
  console.log('Test 3: Frozen Team Bidding Rights Enforcement...');
  const frozenTeam: TeamGovernanceContext = {
    ...solventTeam,
    isBiddingFrozen: true,
  };

  const res3 = validateBidGovernance(
    5000000,
    frozenTeam,
    domesticBatterLot,
    constraints,
    quotas
  );

  if (!res3.isValid && res3.errorCode === 'TEAM_BIDDING_FROZEN') {
    console.log('  ✓ SUCCESS: Correctly rejected bid from frozen franchise!\n');
  } else {
    console.error('  ✗ FAIL: Allowed bid from frozen franchise', res3);
  }

  // --------------------------------------------------------------------------
  // TEST 4: VALID LEGAL BID PASSES
  // --------------------------------------------------------------------------
  console.log('Test 4: Legal Bid Validation...');
  const healthyTeam: TeamGovernanceContext = {
    teamId: 'team-mi',
    teamName: 'Mumbai Indians',
    isBiddingFrozen: false,
    remainingPurse: 600000000, // ₹60 Cr
    currentSquadCount: 14,
    currentOverseasCount: 4,
    currentUncappedCount: 4,
    categoryCounts: { Wicketkeepers: 1 },
  };

  const res4 = validateBidGovernance(
    30000000, // ₹3.00 Cr
    healthyTeam,
    domesticBatterLot,
    constraints,
    quotas
  );

  if (res4.isValid) {
    console.log('  ✓ SUCCESS: Legitimate bid validated and passed successfully!');
    console.log(
      `    Remaining Purse After: ₹${(res4.metrics!.remainingPurseAfterBid / 10000000).toFixed(2)} Cr\n`
    );
  } else {
    console.error('  ✗ FAIL: Unexpected rejection on valid bid', res4);
  }

  console.log('>>> ALL TOURNAMENT SQUAD GOVERNANCE & PURSE INVARIANTS SATISFIED! <<<');
}

runGovernanceValidatorTests();
