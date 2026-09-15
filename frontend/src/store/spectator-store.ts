/**
 * ============================================================================
 * ZUSTAND REAL-TIME SPECTATOR AUCTION STORE
 * Broadcast-Grade Read-Only State Machine, WebSocket Listeners & Reconciliation
 * ============================================================================
 */

import { create } from 'zustand';
import { soundEffects } from '../lib/audio-cues';

export type LotStatusBanner =
  | 'IN_PLAY'
  | 'HAMMER_FALLING' // Fair warning (going once, going twice...)
  | 'SOLD'
  | 'UNSOLD'
  | 'PAUSED';

export interface CompetingTeam {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string;
  color: string;
  accentColor: string;
  initialPurse: number;
  totalSpent: number;
  remainingPurse: number;
  squadCount: number;
  maxSquadSlots: number;
  overseasCount: number;
  minOverseasRequired: number;
  isLeading: boolean;
  justDeducted: boolean;
}

export interface SpectatorLot {
  id: string;
  lotNumber: number;
  title: string;
  category: string; // e.g. "Wicketkeeper / Finisher", "Marquee Batsman", "Contemporary Oil"
  roleBadge: string; // e.g. "ALL-ROUNDER", "MASTERPIECE"
  ratingOrGrade: string; // e.g. "Grade A+ Tier 1", "Provenance: Royal Academy"
  basePrice: number;
  currentBid: number;
  minIncrement: number;
  leadingTeamId: string | null;
  leadingTeamName: string | null;
  leadingTeamLogo: string | null;
  closingTimeEpochMs: number;
  imageUrls: string[];
  attributes: Record<string, string>;
}

export interface UpcomingQueueItem {
  id: string;
  lotNumber: number;
  title: string;
  category: string;
  basePrice: number;
  imageUrl: string;
}

export interface LiveEventLog {
  id: string;
  type: 'BID' | 'HAMMER' | 'WARNING' | 'OUTBID';
  text: string;
  teamCode?: string;
  amount?: number;
  timestamp: Date;
}

export interface CelebrationState {
  isOpen: boolean;
  lotTitle: string;
  lotNumber: number;
  lotImageUrl: string;
  hammerPrice: number;
  winningTeamName: string;
  winningTeamLogo: string;
  winningTeamColor: string;
}

export interface SpectatorStoreState {
  // Active Lot & Bidding State
  activeLot: SpectatorLot | null;
  statusBanner: LotStatusBanner;
  timeLeftSeconds: number;
  isLowTime: boolean;
  bidJumping: boolean;

  // Competing Teams & Leaderboard
  competingTeams: CompetingTeam[];

  // Upcoming Queue & Ticker
  upcomingQueue: UpcomingQueueItem[];
  recentEvents: LiveEventLog[];

  // Celebration & Modals
  celebration: CelebrationState;

  // Telemetry & Connection
  connectionStatus: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  spectatorCount: number;
  isMuted: boolean;

  // Actions
  initWebSocketConnection: (auctionId: string) => () => void;
  syncStateSnapshot: (data: Partial<SpectatorStoreState>) => void;
  handleAuctionStateUpdate: (update: {
    lotId: string;
    currentBid: number;
    leadingTeamId: string;
    leadingTeamName: string;
    leadingTeamLogo: string;
    closingTimeEpochMs?: number;
    statusBanner?: LotStatusBanner;
  }) => void;
  handleLotHammerHit: (event: {
    lot: SpectatorLot;
    winningTeam: CompetingTeam;
    hammerPrice: number;
  }) => void;
  handleLotTransition: (nextLot: SpectatorLot, newQueue: UpcomingQueueItem[]) => void;
  handlePurseUpdated: (teamId: string, deduction: number) => void;
  setTimeLeft: (seconds: number) => void;
  dismissCelebration: () => void;
  toggleMute: () => void;
  simulateNextLiveEvent: () => void;
}

export const useSpectatorStore = create<SpectatorStoreState>((set, get) => ({
  // --------------------------------------------------------------------------
  // INITIAL MOCK / BROADCAST DATA
  // --------------------------------------------------------------------------
  activeLot: {
    id: 'lot-cricket-101',
    lotNumber: 18,
    title: 'Heinrich Klaasen',
    category: 'Wicketkeeper / Power Finisher',
    roleBadge: 'OVERSEAS MARQUEE',
    ratingOrGrade: 'ICC T20 Strike Rate 171.4',
    basePrice: 20000000, // ₹2.00 Cr
    currentBid: 165000000, // ₹16.50 Cr
    minIncrement: 5000000, // ₹50 Lakhs
    leadingTeamId: 'team-srh',
    leadingTeamName: 'Sunrisers Hyderabad',
    leadingTeamLogo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=160&q=80',
    closingTimeEpochMs: Date.now() + 42000,
    imageUrls: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    ],
    attributes: {
      Nationality: 'South Africa',
      Style: 'Right-Hand Bat / Spin Destroyer',
      BasePurse: '₹2.00 Crore',
      Capped: 'International Capped',
    },
  },

  statusBanner: 'IN_PLAY',
  timeLeftSeconds: 42,
  isLowTime: false,
  bidJumping: false,

  competingTeams: [
    {
      id: 'team-srh',
      name: 'Sunrisers Hyderabad',
      shortCode: 'SRH',
      logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
      color: '#f97316',
      accentColor: '#fdba74',
      initialPurse: 1200000000, // ₹120 Cr
      totalSpent: 485000000,
      remainingPurse: 715000000, // ₹71.50 Cr
      squadCount: 15,
      maxSquadSlots: 25,
      overseasCount: 5,
      minOverseasRequired: 8,
      isLeading: true,
      justDeducted: false,
    },
    {
      id: 'team-rcb',
      name: 'Royal Challengers Bengaluru',
      shortCode: 'RCB',
      logoUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=120&q=80',
      color: '#dc2626',
      accentColor: '#fca5a5',
      initialPurse: 1200000000,
      totalSpent: 620000000,
      remainingPurse: 580000000,
      squadCount: 16,
      maxSquadSlots: 25,
      overseasCount: 6,
      minOverseasRequired: 8,
      isLeading: false,
      justDeducted: false,
    },
    {
      id: 'team-csk',
      name: 'Chennai Super Kings',
      shortCode: 'CSK',
      logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
      color: '#eab308',
      accentColor: '#fef08a',
      initialPurse: 1200000000,
      totalSpent: 790000000,
      remainingPurse: 410000000,
      squadCount: 18,
      maxSquadSlots: 25,
      overseasCount: 7,
      minOverseasRequired: 8,
      isLeading: false,
      justDeducted: false,
    },
    {
      id: 'team-mi',
      name: 'Mumbai Indians',
      shortCode: 'MI',
      logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
      color: '#2563eb',
      accentColor: '#93c5fd',
      initialPurse: 1200000000,
      totalSpent: 540000000,
      remainingPurse: 660000000,
      squadCount: 14,
      maxSquadSlots: 25,
      overseasCount: 4,
      minOverseasRequired: 8,
      isLeading: false,
      justDeducted: false,
    },
    {
      id: 'team-kkr',
      name: 'Kolkata Knight Riders',
      shortCode: 'KKR',
      logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80',
      color: '#9333ea',
      accentColor: '#d8b4fe',
      initialPurse: 1200000000,
      totalSpent: 850000000,
      remainingPurse: 350000000,
      squadCount: 19,
      maxSquadSlots: 25,
      overseasCount: 6,
      minOverseasRequired: 8,
      isLeading: false,
      justDeducted: false,
    },
    {
      id: 'team-dc',
      name: 'Delhi Capitals',
      shortCode: 'DC',
      logoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=120&q=80',
      color: '#0284c7',
      accentColor: '#7dd3fc',
      initialPurse: 1200000000,
      totalSpent: 420000000,
      remainingPurse: 780000000,
      squadCount: 13,
      maxSquadSlots: 25,
      overseasCount: 3,
      minOverseasRequired: 8,
      isLeading: false,
      justDeducted: false,
    },
  ],

  upcomingQueue: [
    {
      id: 'lot-cricket-102',
      lotNumber: 19,
      title: 'Mitchell Starc',
      category: 'Fast Bowler / Left-Arm Pacer',
      basePrice: 20000000,
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'lot-cricket-103',
      lotNumber: 20,
      title: 'Rishabh Pant',
      category: 'Wicketkeeper / Captain',
      basePrice: 20000000,
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'lot-cricket-104',
      lotNumber: 21,
      title: 'Rashid Khan',
      category: 'Leg Spinner / Finisher',
      basePrice: 20000000,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'lot-cricket-105',
      lotNumber: 22,
      title: 'Travis Head',
      category: 'Explosive Opener / Off-Spin',
      basePrice: 20000000,
      imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
    },
  ],

  recentEvents: [
    {
      id: 'ev-1',
      type: 'BID',
      text: 'Sunrisers Hyderabad raised bid to ₹16.50 Crore',
      teamCode: 'SRH',
      amount: 165000000,
      timestamp: new Date(Date.now() - 6000),
    },
    {
      id: 'ev-2',
      type: 'BID',
      text: 'Royal Challengers Bengaluru countered at ₹16.00 Crore',
      teamCode: 'RCB',
      amount: 160000000,
      timestamp: new Date(Date.now() - 14000),
    },
    {
      id: 'ev-3',
      type: 'HAMMER',
      text: 'Pat Cummins SOLD to Sunrisers Hyderabad for ₹20.50 Crore',
      teamCode: 'SRH',
      amount: 205000000,
      timestamp: new Date(Date.now() - 48000),
    },
  ],

  celebration: {
    isOpen: false,
    lotTitle: '',
    lotNumber: 0,
    lotImageUrl: '',
    hammerPrice: 0,
    winningTeamName: '',
    winningTeamLogo: '',
    winningTeamColor: '#f97316',
  },

  connectionStatus: 'CONNECTED',
  spectatorCount: 4180,
  isMuted: false,

  // --------------------------------------------------------------------------
  // ACTIONS & REAL-TIME EVENT HANDLERS
  // --------------------------------------------------------------------------
  initWebSocketConnection: (auctionId: string) => {
    // In production, instantiate read-only Socket.io / SSE client:
    // const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/spectator`, { query: { auctionId } });
    console.log(`[Spectator WS Channel Subscribed] auction:${auctionId}:spectator`);
    set({ connectionStatus: 'CONNECTED' });

    // Return cleanup listener unmount
    return () => {
      console.log(`[Spectator WS Channel Unsubscribed] auction:${auctionId}`);
    };
  },

  syncStateSnapshot: (data) => set((state) => ({ ...state, ...data })),

  handleAuctionStateUpdate: (update) => {
    set((state) => {
      if (!state.activeLot) return state;

      const isBidChange = update.currentBid !== state.activeLot.currentBid;
      if (isBidChange) {
        soundEffects.playBidAccepted();
      }

      const updatedTeams = state.competingTeams.map((team) => ({
        ...team,
        isLeading: team.id === update.leadingTeamId,
      }));

      const newEvent: LiveEventLog = {
        id: `ev-${Date.now()}`,
        type: 'BID',
        text: `${update.leadingTeamName} raised bid to ₹${(update.currentBid / 10000000).toFixed(2)} Crore`,
        teamCode: updatedTeams.find((t) => t.id === update.leadingTeamId)?.shortCode,
        amount: update.currentBid,
        timestamp: new Date(),
      };

      return {
        activeLot: {
          ...state.activeLot,
          currentBid: update.currentBid,
          leadingTeamId: update.leadingTeamId,
          leadingTeamName: update.leadingTeamName,
          leadingTeamLogo: update.leadingTeamLogo,
          closingTimeEpochMs: update.closingTimeEpochMs || state.activeLot.closingTimeEpochMs,
        },
        statusBanner: update.statusBanner || state.statusBanner,
        competingTeams: updatedTeams,
        bidJumping: true,
        recentEvents: [newEvent, ...state.recentEvents.slice(0, 20)],
      };
    });

    // Reset bidJumping flag after spring animation
    setTimeout(() => {
      set({ bidJumping: false });
    }, 400);
  },

  handleLotHammerHit: ({ lot, winningTeam, hammerPrice }) => {
    soundEffects.playGavelStrike();

    // Trigger celebration modal
    set((state) => ({
      statusBanner: 'SOLD',
      celebration: {
        isOpen: true,
        lotTitle: lot.title,
        lotNumber: lot.lotNumber,
        lotImageUrl: lot.imageUrls[0],
        hammerPrice,
        winningTeamName: winningTeam.name,
        winningTeamLogo: winningTeam.logoUrl,
        winningTeamColor: winningTeam.color,
      },
      recentEvents: [
        {
          id: `ev-sold-${Date.now()}`,
          type: 'HAMMER',
          text: `HAMMER FALLS! ${lot.title} SOLD to ${winningTeam.name} for ₹${(hammerPrice / 10000000).toFixed(2)} Crore`,
          teamCode: winningTeam.shortCode,
          amount: hammerPrice,
          timestamp: new Date(),
        },
        ...state.recentEvents.slice(0, 20),
      ],
    }));

    // Deduct team purse & increment squad
    get().handlePurseUpdated(winningTeam.id, hammerPrice);
  },

  handleLotTransition: (nextLot, newQueue) => {
    set({
      activeLot: nextLot,
      statusBanner: 'IN_PLAY',
      upcomingQueue: newQueue,
      timeLeftSeconds: 60,
      isLowTime: false,
      celebration: {
        isOpen: false,
        lotTitle: '',
        lotNumber: 0,
        lotImageUrl: '',
        hammerPrice: 0,
        winningTeamName: '',
        winningTeamLogo: '',
        winningTeamColor: '#f97316',
      },
    });
  },

  handlePurseUpdated: (teamId: string, deduction: number) => {
    set((state) => ({
      competingTeams: state.competingTeams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          totalSpent: t.totalSpent + deduction,
          remainingPurse: Math.max(0, t.remainingPurse - deduction),
          squadCount: t.squadCount + 1,
          justDeducted: true,
        };
      }),
    }));

    setTimeout(() => {
      set((state) => ({
        competingTeams: state.competingTeams.map((t) =>
          t.id === teamId ? { ...t, justDeducted: false } : t
        ),
      }));
    }, 1500);
  },

  setTimeLeft: (seconds: number) => {
    set({
      timeLeftSeconds: seconds,
      isLowTime: seconds <= 10,
    });
  },

  dismissCelebration: () => {
    set((state) => ({
      celebration: { ...state.celebration, isOpen: false },
    }));
  },

  toggleMute: () => {
    const muted = soundEffects.toggleMute();
    set({ isMuted: muted });
  },

  // Interactive Demonstration Simulator (allows testing projector animations on-demand)
  simulateNextLiveEvent: () => {
    const state = get();
    if (!state.activeLot) return;

    const teamList = state.competingTeams;
    const currentLeadingId = state.activeLot.leadingTeamId;
    const eligibleTeams = teamList.filter((t) => t.id !== currentLeadingId);
    const nextTeam = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];

    const nextAmount = state.activeLot.currentBid + state.activeLot.minIncrement;

    state.handleAuctionStateUpdate({
      lotId: state.activeLot.id,
      currentBid: nextAmount,
      leadingTeamId: nextTeam.id,
      leadingTeamName: nextTeam.name,
      leadingTeamLogo: nextTeam.logoUrl,
      closingTimeEpochMs: Date.now() + 35000,
    });
  },
}));
