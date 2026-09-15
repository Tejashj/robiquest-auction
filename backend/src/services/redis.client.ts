/**
 * ============================================================================
 * REDIS & REDLOCK CLUSTER MANAGER
 * High-Throughput In-Memory Storage, Pub/Sub, and Distributed Mutex Locking
 * ============================================================================
 */

import Redis from 'ioredis';
import Redlock, { Lock } from 'redlock';

export class RedisClusterManager {
  private static instance: RedisClusterManager;
  public redisClient: Redis;
  public redisSubClient: Redis;
  public redlock: Redlock;

  private constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // Standard client for commands, caching, and atomic Lua scripts
    this.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Dedicated subscriber client for pub/sub events
    this.redisSubClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    // Redlock instance with jitter and aggressive retry for sub-50ms lock acquisition
    this.redlock = new Redlock([this.redisClient], {
      driftFactor: 0.01, // 1% drift
      retryCount: 15,    // Retry up to 15 times
      retryDelay: 30,    // 30ms between retries
      retryJitter: 15,   // 15ms random jitter to avoid lock convoying
      automaticExtensionThreshold: 500, // Extend if execution takes > 500ms
    });

    this.redisClient.on('error', (err) => console.error('[Redis Client Error]', err));
    this.redisSubClient.on('error', (err) => console.error('[Redis Sub Error]', err));
  }

  public static getInstance(): RedisClusterManager {
    if (!RedisClusterManager.instance) {
      RedisClusterManager.instance = new RedisClusterManager();
    }
    return RedisClusterManager.instance;
  }

  /**
   * Acquire a distributed lock with automatic TTL release
   * @param resourceKey e.g. "lock:lot:8823f9b2-..."
   * @param ttlMs Lock TTL (e.g. 1500ms)
   */
  public async acquireLock(resourceKey: string, ttlMs: number = 1500): Promise<Lock> {
    return await this.redlock.acquire([resourceKey], ttlMs);
  }

  /**
   * Redis Key Builders for standard naming conventions
   */
  public static keys = {
    lotState: (lotId: string) => `auction:lot:${lotId}:state`,
    lotLeaderboard: (lotId: string) => `auction:lot:${lotId}:leaderboard`, // ZSET by amount
    lotBidsList: (lotId: string) => `auction:lot:${lotId}:bids`,
    lotProxyCeilings: (lotId: string) => `auction:lot:${lotId}:proxies`, // HASH: bidderId -> maxCeiling
    auctionRooms: (auctionId: string) => `auction:${auctionId}:presence`,
    rateLimit: (userId: string) => `ratelimit:bid:${userId}`,
  };
}
