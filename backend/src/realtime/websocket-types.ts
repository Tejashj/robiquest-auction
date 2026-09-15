/**
 * ============================================================================
 * ENTERPRISE REAL-TIME WEBSOCKET PROTOCOL SPECIFICATIONS
 * Ultra-Low Latency Bid Messaging, Synchronization & Heartbeat Engine
 * ============================================================================
 */

export enum WebSocketClientEvent {
  NTP_PING = 'NTP_PING',
  JOIN_AUCTION = 'JOIN_AUCTION',
  LEAVE_AUCTION = 'LEAVE_AUCTION',
  PLACE_BID = 'PLACE_BID',
  SET_PROXY_BID = 'SET_PROXY_BID',
  HAMMER_COMMAND = 'HAMMER_COMMAND',
}

export enum WebSocketServerEvent {
  NTP_PONG = 'NTP_PONG',
  SYNC_STATE = 'SYNC_STATE',
  BID_ACCEPTED = 'BID_ACCEPTED',
  BID_REJECTED = 'BID_REJECTED',
  TIME_EXTENDED = 'TIME_EXTENDED',
  HAMMER_EVENT = 'HAMMER_EVENT',
  PROXY_UPDATED = 'PROXY_UPDATED',
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  ERROR = 'ERROR',
}

export enum BidRejectionReason {
  AUCTION_NOT_LIVE = 'AUCTION_NOT_LIVE',
  LOT_NOT_ACTIVE = 'LOT_NOT_ACTIVE',
  LOT_ALREADY_CLOSED = 'LOT_ALREADY_CLOSED',
  OUTDATED_BID = 'OUTDATED_BID', // Bid is less than or equal to current high bid
  INSUFFICIENT_INCREMENT = 'INSUFFICIENT_INCREMENT', // Bid does not satisfy current + minIncrement
  OUTBID_IMMEDIATELY_BY_PROXY = 'OUTBID_IMMEDIATELY_BY_PROXY', // Competing proxy automatically countered
  SELF_BID_DISALLOWED = 'SELF_BID_DISALLOWED', // Already the highest bidder
  ESCROW_HOLD_REQUIRED = 'ESCROW_HOLD_REQUIRED', // User missing verified deposit hold
  KYC_NOT_VERIFIED = 'KYC_NOT_VERIFIED', // Bidder role not authorized
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED', // Flood protection triggered
  CONCURRENCY_LOCK_TIMEOUT = 'CONCURRENCY_LOCK_TIMEOUT', // Distributed Redlock contention
}

export enum HammerAction {
  OPEN_LOT = 'OPEN_LOT',
  FAIR_WARNING = 'FAIR_WARNING',
  LAST_CALL = 'LAST_CALL',
  SOLD = 'SOLD',
  PASS_UNSOLD = 'PASS_UNSOLD',
  PAUSE_AUCTION = 'PAUSE_AUCTION',
  RESUME_AUCTION = 'RESUME_AUCTION',
  MANUAL_TIME_ADD = 'MANUAL_TIME_ADD',
  DROP_RESERVE = 'DROP_RESERVE',
}

// ----------------------------------------------------------------------------
// Client -> Server Payloads
// ----------------------------------------------------------------------------

export interface NtpPingPayload {
  clientSendTime: number; // Date.now() on client
}

export interface JoinAuctionPayload {
  auctionId: string;
  authToken?: string;
  clientNonce: string;
}

export interface LeaveAuctionPayload {
  auctionId: string;
}

export interface PlaceBidPayload {
  auctionId: string;
  lotId: string;
  amount: number;
  clientNonce: string; // Idempotency key (UUID v4)
  clientTimestamp: number;
}

export interface SetProxyBidPayload {
  auctionId: string;
  lotId: string;
  maxCeiling: number;
  clientNonce: string;
}

export interface HammerCommandPayload {
  auctionId: string;
  lotId: string;
  action: HammerAction;
  additionalSeconds?: number;
  notes?: string;
}

// ----------------------------------------------------------------------------
// Server -> Client Payloads
// ----------------------------------------------------------------------------

export interface NtpPongPayload {
  clientSendTime: number;
  serverReceiveTime: number;
  serverSendTime: number;
}

export interface LotRealtimeState {
  lotId: string;
  lotNumber: number;
  title: string;
  category: string;
  status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'PAUSED' | 'FAIR_WARNING' | 'SOLD' | 'UNSOLD_PASSED';
  startingBid: number;
  reservePrice?: number | null; // Nullified for spectators/bidders; visible only to auctioneer
  reserveMet: boolean;
  minIncrement: number;
  currentHighBid: number;
  currentHighBidderId: string | null;
  currentHighBidderPaddle: number | null;
  nextMinimumBid: number;
  closingTimeEpochMs: number;
  softCloseExtendedCount: number;
  bidsCount: number;
  imageUrls: string[];
}

export interface SyncStatePayload {
  serverEpochMs: number;
  auctionId: string;
  auctionTitle: string;
  auctionStatus: string;
  antiSnipingWindowSeconds: number;
  antiSnipingExtensionSeconds: number;
  activeLot: LotRealtimeState | null;
  upcomingLots: Array<Pick<LotRealtimeState, 'lotId' | 'lotNumber' | 'title' | 'startingBid' | 'status' | 'imageUrls'>>;
  userState?: {
    userId: string;
    paddleNumber: number;
    isVerified: boolean;
    hasEscrowDeposit: boolean;
    isCurrentHighBidder: boolean;
    activeProxyCeiling: number | null;
  };
  connectedParticipantsCount: number;
}

export interface BidAcceptedPayload {
  auctionId: string;
  lotId: string;
  bidId: string;
  amount: number;
  nextMinimumBid: number;
  bidderId: string;
  bidderPaddle: number;
  isProxy: boolean;
  sequenceNumber: number;
  timestampEpochMs: number;
  reserveMet: boolean;
  bidHistorySnippet: {
    bidId: string;
    amount: number;
    paddleNumber: number;
    timestampEpochMs: number;
    isProxy: boolean;
  };
}

export interface BidRejectedPayload {
  auctionId: string;
  lotId: string;
  attemptedAmount: number;
  reason: BidRejectionReason;
  message: string;
  currentHighBid: number;
  nextMinimumBid: number;
  clientNonce: string;
  timestampEpochMs: number;
}

export interface TimeExtendedPayload {
  auctionId: string;
  lotId: string;
  previousClosingTimeEpochMs: number;
  newClosingTimeEpochMs: number;
  extensionSeconds: number;
  extensionCount: number;
  reason: 'ANTI_SNIPE_TRIGGER' | 'AUCTIONEER_OVERRIDE';
}

export interface HammerEventPayload {
  auctionId: string;
  lotId: string;
  action: HammerAction;
  hammerPrice?: number | null;
  winningBidderPaddle?: number | null;
  timestampEpochMs: number;
  operatorId: string;
  message: string;
}

export interface PresenceUpdatePayload {
  auctionId: string;
  activeSpectators: number;
  activeBidders: number;
}

export interface SystemNotificationPayload {
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  title: string;
  message: string;
  timestampEpochMs: number;
}
