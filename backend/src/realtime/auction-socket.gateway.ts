/**
 * ============================================================================
 * REAL-TIME AUCTION SOCKET.IO GATEWAY
 * Ultra-Low Latency Bid Streaming, Room Sharding, NTP Sync & Hammer Controls
 * ============================================================================
 */

import { Server as SocketIoServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { PrismaClient } from '@prisma/client';
import { RedisClusterManager } from '../services/redis.client';
import { BiddingService } from '../services/bidding.service';
import {
  WebSocketClientEvent,
  WebSocketServerEvent,
  NtpPingPayload,
  NtpPongPayload,
  JoinAuctionPayload,
  PlaceBidPayload,
  SetProxyBidPayload,
  HammerCommandPayload,
  HammerEventPayload,
  PresenceUpdatePayload,
  SyncStatePayload,
  HammerAction,
} from './websocket-types';

export class AuctionSocketGateway {
  private io: SocketIoServer;
  private prisma: PrismaClient;
  private redisManager: RedisClusterManager;
  private biddingService: BiddingService;

  constructor(server: any, prisma: PrismaClient) {
    this.prisma = prisma;
    this.redisManager = RedisClusterManager.getInstance();

    // Initialize Socket.io with Redis Adapter for horizontal scaling
    this.io = new SocketIoServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingInterval: 20000,
      pingTimeout: 5000,
    });

    // Attach Redis Adapter
    this.io.adapter(
      createAdapter(this.redisManager.redisClient, this.redisManager.redisSubClient)
    );

    this.biddingService = new BiddingService(this.prisma, this.io);
    this.registerSocketHandlers();
  }

  public getIoServer(): SocketIoServer {
    return this.io;
  }

  private registerSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket Connected] ID: ${socket.id}`);

      // 1. High-Precision NTP Clock Sync Handler
      socket.on(WebSocketClientEvent.NTP_PING, (data: NtpPingPayload) => {
        const serverReceiveTime = Date.now();
        const pong: NtpPongPayload = {
          clientSendTime: data.clientSendTime,
          serverReceiveTime,
          serverSendTime: Date.now(),
        };
        socket.emit(WebSocketServerEvent.NTP_PONG, pong);
      });

      // 2. Join Auction Room Handler
      socket.on(WebSocketClientEvent.JOIN_AUCTION, async (data: JoinAuctionPayload) => {
        try {
          const { auctionId, authToken } = data;
          const roomKey = `auction:${auctionId}`;
          await socket.join(roomKey);

          // Authenticate user if token provided, otherwise assign Spectator
          const user = await this.authenticateUserFromToken(authToken);
          if (user) {
            socket.data.userId = user.id;
            socket.data.paddleNumber = user.paddleNumber;
            socket.data.role = user.role;
            await socket.join(`user:${user.id}`);
          }

          // Track presence in Redis
          await this.incrementPresence(auctionId, !!user);

          // Fetch current state and send immediate synchronization snapshot
          const syncState = await this.buildSyncState(auctionId, socket.data.userId);
          socket.emit(WebSocketServerEvent.SYNC_STATE, syncState);

          // Broadcast updated participant presence to room
          const presence = await this.getPresence(auctionId);
          this.io.to(roomKey).emit(WebSocketServerEvent.PRESENCE_UPDATE, presence);
        } catch (err) {
          console.error(`[Join Error] Socket ${socket.id}:`, err);
          socket.emit(WebSocketServerEvent.ERROR, { message: 'Failed to join auction room' });
        }
      });

      // 3. Place Atomic Bid Handler
      socket.on(WebSocketClientEvent.PLACE_BID, async (data: PlaceBidPayload) => {
        const userId = socket.data.userId;
        const paddleNumber = socket.data.paddleNumber || 999;

        if (!userId) {
          socket.emit(WebSocketServerEvent.ERROR, {
            message: 'Authentication required to place bids.',
          });
          return;
        }

        const ip = (socket.handshake.headers['x-forwarded-for'] as string) || socket.handshake.address;
        const userAgent = socket.handshake.headers['user-agent'] as string;

        const result = await this.biddingService.processBidAtomic({
          auctionId: data.auctionId,
          lotId: data.lotId,
          bidderId: userId,
          bidderPaddle: paddleNumber,
          amount: data.amount,
          clientNonce: data.clientNonce,
          clientTimestamp: data.clientTimestamp,
          ipAddress: ip,
          userAgent,
        });

        // Unicast direct feedback if rejected (accepted bids are broadcast to the room inside service)
        if (!result.success) {
          socket.emit(WebSocketServerEvent.BID_REJECTED, result.payload);
        }
      });

      // 4. Set Proxy Bid Ceiling Handler
      socket.on(WebSocketClientEvent.SET_PROXY_BID, async (data: SetProxyBidPayload) => {
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit(WebSocketServerEvent.ERROR, { message: 'Authentication required' });
          return;
        }

        try {
          const redis = this.redisManager.redisClient;
          const ceilingKey = RedisClusterManager.keys.lotProxyCeilings(data.lotId);

          // Save proxy ceiling in Redis
          await redis.hset(ceilingKey, userId, data.maxCeiling.toString());

          // Upsert in PostgreSQL database
          await this.prisma.proxyBid.upsert({
            where: { lotId_bidderId: { lotId: data.lotId, bidderId: userId } },
            create: {
              lotId: data.lotId,
              bidderId: userId,
              maxCeiling: data.maxCeiling,
              currentAllocatedBid: 0,
            },
            update: {
              maxCeiling: data.maxCeiling,
              isActive: true,
            },
          });

          socket.emit(WebSocketServerEvent.PROXY_UPDATED, {
            lotId: data.lotId,
            maxCeiling: data.maxCeiling,
            status: 'ACTIVE',
          });
        } catch (err) {
          console.error('[Proxy Bid Error]', err);
          socket.emit(WebSocketServerEvent.ERROR, { message: 'Failed to configure proxy ceiling' });
        }
      });

      // 5. Auctioneer Live Hammer Control Handler
      socket.on(WebSocketClientEvent.HAMMER_COMMAND, async (data: HammerCommandPayload) => {
        // Enforce RBAC: Only AUCTIONEER and SUPERADMIN can trigger hammer actions
        if (socket.data.role !== 'AUCTIONEER' && socket.data.role !== 'SUPERADMIN') {
          socket.emit(WebSocketServerEvent.ERROR, {
            message: 'Forbidden: Insufficient privileges for auctioneer hammer controls.',
          });
          return;
        }

        await this.handleHammerCommand(data, socket.data.userId);
      });

      // 6. Disconnect Handler
      socket.on('disconnect', async () => {
        console.log(`[Socket Disconnected] ID: ${socket.id}`);
        // Presence decrement logic
      });
    });
  }

  /**
   * Auctioneer Live Hammer state machine executor
   */
  private async handleHammerCommand(payload: HammerCommandPayload, operatorId: string) {
    const { auctionId, lotId, action } = payload;
    const redis = this.redisManager.redisClient;
    const lotStateKey = RedisClusterManager.keys.lotState(lotId);
    const roomKey = `auction:${auctionId}`;

    const raw = await redis.get(lotStateKey);
    if (!raw) return;
    const state = JSON.parse(raw);
    const now = Date.now();

    let message = '';
    let hammerPrice: number | null = null;
    let winningPaddle: number | null = null;

    switch (action) {
      case HammerAction.FAIR_WARNING:
        state.status = 'FAIR_WARNING';
        message = `Fair warning on Lot #${state.lotNumber}! Going once, going twice...`;
        break;

      case HammerAction.SOLD:
        state.status = 'SOLD';
        hammerPrice = state.currentHighBid;
        winningPaddle = state.currentHighBidderPaddle;
        message = `Lot #${state.lotNumber} is SOLD to Paddle #${winningPaddle || 'N/A'} for $${hammerPrice.toLocaleString()}!`;
        await this.finalizeLotSale(lotId, state.currentHighBidderId, hammerPrice);
        break;

      case HammerAction.PASS_UNSOLD:
        state.status = 'UNSOLD_PASSED';
        message = `Lot #${state.lotNumber} has passed unsold below reserve.`;
        await this.prisma.lot.update({
          where: { id: lotId },
          data: { status: 'UNSOLD_PASSED' },
        });
        break;

      case HammerAction.PAUSE_AUCTION:
        state.status = 'PAUSED';
        message = `Auction has been paused by the auctioneer.`;
        break;

      case HammerAction.RESUME_AUCTION:
        state.status = 'LIVE';
        message = `Auction bidding has resumed.`;
        break;

      case HammerAction.MANUAL_TIME_ADD:
        const addedSeconds = payload.additionalSeconds || 30;
        state.closingTimeEpochMs += addedSeconds * 1000;
        message = `Auctioneer added +${addedSeconds}s to Lot #${state.lotNumber}.`;
        break;

      case HammerAction.DROP_RESERVE:
        state.reservePrice = state.currentHighBid;
        state.reserveMet = true;
        message = `Reserve dropped by the seller! The lot is now selling on the current high bid!`;
        break;
    }

    // Persist updated lot state to Redis
    await redis.set(lotStateKey, JSON.stringify(state));

    const eventPayload: HammerEventPayload = {
      auctionId,
      lotId,
      action,
      hammerPrice,
      winningBidderPaddle: winningPaddle,
      timestampEpochMs: now,
      operatorId,
      message,
    };

    // Broadcast hammer event to all room participants
    this.io.to(roomKey).emit(WebSocketServerEvent.HAMMER_EVENT, eventPayload);

    // Audit log
    await this.prisma.itemAuditLog.create({
      data: {
        auctionId,
        lotId,
        actorId: operatorId,
        action: `HAMMER_${action}`,
        details: message,
        newState: state,
      },
    });
  }

  private async finalizeLotSale(lotId: string, winningBidderId: string | null, hammerPrice: number) {
    if (!winningBidderId) return;

    await this.prisma.lot.update({
      where: { id: lotId },
      data: {
        status: 'SOLD',
        hammerPrice,
        winningBidderId,
      },
    });
  }

  private async authenticateUserFromToken(token?: string) {
    if (!token) return null;
    try {
      // In production, decode and verify JWT (e.g. Clerk/Auth0/jose)
      // Here we query or mock for demonstration:
      const user = await this.prisma.user.findFirst({
        where: { id: token },
      });
      return user;
    } catch {
      return null;
    }
  }

  private async incrementPresence(auctionId: string, isBidder: boolean) {
    const redis = this.redisManager.redisClient;
    const key = RedisClusterManager.keys.auctionRooms(auctionId);
    if (isBidder) {
      await redis.hincrby(key, 'bidders', 1);
    } else {
      await redis.hincrby(key, 'spectators', 1);
    }
  }

  private async getPresence(auctionId: string): Promise<PresenceUpdatePayload> {
    const redis = this.redisManager.redisClient;
    const key = RedisClusterManager.keys.auctionRooms(auctionId);
    const data = await redis.hgetall(key);
    return {
      auctionId,
      activeSpectators: parseInt(data.spectators || '12', 10),
      activeBidders: parseInt(data.bidders || '5', 10),
    };
  }

  private async buildSyncState(auctionId: string, userId?: string): Promise<SyncStatePayload> {
    const auction = await this.prisma.auction.findUniqueOrThrow({
      where: { id: auctionId },
      include: {
        lots: {
          orderBy: { lotNumber: 'asc' },
          take: 10,
        },
      },
    });

    const activeLotRaw = auction.lots.find((l) => l.status === 'LIVE' || l.status === 'FAIR_WARNING') || auction.lots[0];
    let activeLotState = null;

    if (activeLotRaw) {
      activeLotState = await this.biddingService.hydrateLotStateFromDb(activeLotRaw.id);
    }

    const presence = await this.getPresence(auctionId);

    return {
      serverEpochMs: Date.now(),
      auctionId: auction.id,
      auctionTitle: auction.title,
      auctionStatus: auction.status,
      antiSnipingWindowSeconds: auction.antiSnipingWindowSeconds,
      antiSnipingExtensionSeconds: auction.antiSnipingExtensionSeconds,
      activeLot: activeLotState,
      upcomingLots: auction.lots.map((l) => ({
        lotId: l.id,
        lotNumber: l.lotNumber,
        title: l.title,
        startingBid: Number(l.startingBid),
        status: l.status as any,
        imageUrls: l.imageUrls,
      })),
      userState: userId
        ? {
            userId,
            paddleNumber: 42,
            isVerified: true,
            hasEscrowDeposit: true,
            isCurrentHighBidder: activeLotState?.currentHighBidderId === userId,
            activeProxyCeiling: null,
          }
        : undefined,
      connectedParticipantsCount: presence.activeBidders + presence.activeSpectators,
    };
  }
}
