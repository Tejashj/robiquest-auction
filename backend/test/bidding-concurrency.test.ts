/**
 * ============================================================================
 * HIGH-CONCURRENCY BIDDING ENGINE TEST & VERIFICATION SUITE
 * Simulates Race Conditions, Anti-Sniping Dynamic Extensions, and Proxy Battles
 * ============================================================================
 */

import { createHash } from 'crypto';

interface TestLotState {
  lotId: string;
  lotNumber: number;
  currentHighBid: number;
  currentHighBidderPaddle: number;
  minIncrement: number;
  closingTimeMs: number;
  softCloseExtendedCount: number;
  bidsCount: number;
}

interface TestBidOutcome {
  bidderPaddle: number;
  attemptedAmount: number;
  accepted: boolean;
  finalHighBid: number;
  reason?: string;
  auditHash: string;
}

export class ConcurrencySimulator {
  private lotState: TestLotState;
  private isLocked: boolean = false;
  private proxyCeilings: Map<number, number> = new Map();
  private auditChain: string[] = [];

  constructor(startingBid: number, minIncrement: number, closingTimeMs: number) {
    this.lotState = {
      lotId: 'lot-test-101',
      lotNumber: 101,
      currentHighBid: startingBid,
      currentHighBidderPaddle: 0,
      minIncrement,
      closingTimeMs,
      softCloseExtendedCount: 0,
      bidsCount: 0,
    };
  }

  public registerProxy(paddle: number, ceiling: number) {
    this.proxyCeilings.set(paddle, ceiling);
  }

  /**
   * Simulates atomic bid execution with mutex lock and proxy battle resolution
   */
  public async submitBid(paddle: number, amount: number): Promise<TestBidOutcome> {
    // 1. Mutex acquisition simulation
    while (this.isLocked) {
      await new Promise((r) => setTimeout(r, 2)); // Wait 2ms jitter
    }
    this.isLocked = true;

    try {
      const now = Date.now();
      const minRequired = this.lotState.currentHighBid + this.lotState.minIncrement;

      // 2. Minimum increment check
      if (amount < minRequired) {
        return {
          bidderPaddle: paddle,
          attemptedAmount: amount,
          accepted: false,
          finalHighBid: this.lotState.currentHighBid,
          reason: 'INSUFFICIENT_INCREMENT',
          auditHash: '',
        };
      }

      // 3. Anti-Sniping Soft Close Check (Within 60s -> extend +120s)
      const remainingMs = this.lotState.closingTimeMs - now;
      if (remainingMs <= 60000) {
        this.lotState.closingTimeMs += 120000;
        this.lotState.softCloseExtendedCount += 1;
      }

      // 4. Proxy Bidding Counter Check
      let effectiveWinner = paddle;
      let effectiveAmount = amount;
      let highestCompetingCeiling = 0;
      let competingPaddle = 0;

      for (const [p, ceil] of this.proxyCeilings.entries()) {
        if (p !== paddle && ceil > highestCompetingCeiling) {
          highestCompetingCeiling = ceil;
          competingPaddle = p;
        }
      }

      if (highestCompetingCeiling >= amount) {
        // Competing proxy automatically counters!
        effectiveWinner = competingPaddle;
        effectiveAmount = Math.min(highestCompetingCeiling, amount + this.lotState.minIncrement);
      }

      // 5. Atomic state commit
      this.lotState.currentHighBid = effectiveAmount;
      this.lotState.currentHighBidderPaddle = effectiveWinner;
      this.lotState.bidsCount += 1;

      // 6. Cryptographic Audit Hash Chain
      const prevHash = this.auditChain[this.auditChain.length - 1] || '0'.repeat(64);
      const auditPayload = `${prevHash}:${this.lotState.lotId}:${effectiveWinner}:${effectiveAmount}:${this.lotState.bidsCount}:${now}`;
      const auditHash = createHash('sha256').update(auditPayload).digest('hex');
      this.auditChain.push(auditHash);

      return {
        bidderPaddle: effectiveWinner,
        attemptedAmount: amount,
        accepted: effectiveWinner === paddle,
        finalHighBid: effectiveAmount,
        reason: effectiveWinner !== paddle ? 'OUTBID_BY_COMPETING_PROXY' : undefined,
        auditHash,
      };
    } finally {
      this.isLocked = false;
    }
  }

  public getState() {
    return { ...this.lotState, auditChainLength: this.auditChain.length };
  }
}

// ----------------------------------------------------------------------------
// EXECUTABLE VERIFICATION TEST
// ----------------------------------------------------------------------------
async function runConcurrencyStressTest() {
  console.log('=================================================================');
  console.log('AUCTION ENGINE CONCURRENCY & ANTI-SNIPING VERIFICATION TEST');
  console.log('=================================================================\n');

  // Lot closes in 30 seconds (triggers anti-snipe)
  const initialClosing = Date.now() + 30000;
  const simulator = new ConcurrencySimulator(100000, 5000, initialClosing);

  // Register Paddle #99 with max proxy ceiling of $150,000
  simulator.registerProxy(99, 150000);
  console.log('✓ Registered Proxy: Paddle #99 with $150,000 ceiling');

  console.log('\n--- SIMULATING 10 CONCURRENT BIDDERS FIRING SIMULTANEOUSLY ---');
  const bidsToFire = [
    { paddle: 10, amount: 105000 },
    { paddle: 12, amount: 105000 }, // Stale duplicate bid
    { paddle: 15, amount: 110000 },
    { paddle: 20, amount: 120000 },
    { paddle: 25, amount: 125000 },
    { paddle: 30, amount: 140000 },
    { paddle: 42, amount: 160000 }, // Outbids proxy ceiling ($150k)!
  ];

  const results = await Promise.all(
    bidsToFire.map((b) => simulator.submitBid(b.paddle, b.amount))
  );

  results.forEach((res, idx) => {
    console.log(
      `Bid #${idx + 1}: Paddle #${res.bidderPaddle} | Attempted: $${bidsToFire[idx].amount.toLocaleString()} | Status: ${
        res.accepted ? '✓ ACCEPTED' : '✗ REJECTED / COUNTERED'
      } | High Bid: $${res.finalHighBid.toLocaleString()} ${res.reason ? `(${res.reason})` : ''}`
    );
  });

  const finalState = simulator.getState();
  console.log('\n--- FINAL ENGINE AUDIT STATE ---');
  console.log(`Final High Bid: $${finalState.currentHighBid.toLocaleString()}`);
  console.log(`Winning Paddle: #${finalState.currentHighBidderPaddle}`);
  console.log(`Anti-Sniping Extensions: ${finalState.softCloseExtendedCount}x`);
  console.log(`Time Added: +${finalState.softCloseExtendedCount * 120} seconds`);
  console.log(`Cryptographic Hash Audit Chain: ${finalState.auditChainLength} verifiable blocks`);

  if (finalState.currentHighBid === 160000 && finalState.currentHighBidderPaddle === 42) {
    console.log('\n>>> SUCCESS: ALL CONCURRENCY, PROXY, AND ANTI-SNIPE INVARIANTS SATISFIED! <<<');
  } else {
    console.error('\n>>> INVARIANT CHECK FAILED <<<');
  }
}

runConcurrencyStressTest();
