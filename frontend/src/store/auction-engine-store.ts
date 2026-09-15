/**
 * ============================================================================
 * UNIFIED USER-DRIVEN SPORTS AUCTION ENGINE STORE (ZUSTAND + LOCALSTORAGE)
 * Specialised for Sports Franchise Bidding (IPL / Premier League Model)
 * Supports INR (₹), USD ($), EUR (€), GBP (£), Solvency Floors, Quota Rules
 * Hidden Software Admin Authentication & Role Separation
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundEffects } from '../lib/audio-cues';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type PlayerRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER' | 'GENERAL';

export interface PlayerStats {
  matches?: number;
  runs?: number;
  wickets?: number;
  strikeRate?: number;
  economy?: number;
  average?: number;
  battingStyle?: string;
  bowlingStyle?: string;
  country?: string;
}

export interface AuctionProfile {
  id: string;
  title: string;
  description: string;
  category: 'SPORTS_TOURNAMENT' | 'FINE_ART_LUXURY' | 'REAL_ESTATE' | 'GENERAL_ASSETS';
  currency: CurrencyCode;
  minSquadSize: number;
  maxSquadSize: number;
  totalPurseCap: number;
  lowestBasePrice: number;
  enforceReservePurseFloor: boolean;
  minOverseasLimit: number;
  maxOverseasLimit: number;
  defaultMinIncrement: number;
}

export interface AuctionLotItem {
  id: string;
  lotNumber: number;
  title: string;
  category: string;
  roleBadge?: string;
  sellerName?: string;
  startingBid: number;
  reservePrice: number;
  minIncrement: number;
  currentHighBid: number;
  currentLeaderId: string | null;
  currentLeaderName: string | null;
  currentLeaderPaddle: number | null;
  status: 'UPCOMING' | 'LIVE' | 'FAIR_WARNING' | 'SOLD' | 'PASSED';
  imageUrls: string[];
  attributes: Record<string, string>;
  bidsCount: number;
  // Sports Specific Fields
  playerRole?: PlayerRole;
  isOverseas?: boolean;
  playerStats?: PlayerStats;
}

export interface AcquiredPlayer {
  id: string;
  lotNumber: number;
  title: string;
  role: string;
  isOverseas: boolean;
  price: number;
  timestamp: number;
}

export interface AuctionTeamParticipant {
  id: string;
  name: string;
  shortCode: string;
  paddleNumber: number;
  color: string;
  accentColor: string;
  logoUrl: string;
  initialPurse: number;
  remainingPurse: number;
  totalSpent: number;
  squadCount: number;
  overseasCount: number;
  isFrozen: boolean;
  acquiredPlayers: AcquiredPlayer[];
}

export interface PlacedBidEntry {
  id: string;
  lotId: string;
  teamId: string;
  teamName: string;
  paddleNumber: number;
  amount: number;
  timestamp: number;
  isRevoked?: boolean;
}

export interface StageClockState {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'EXPIRED';
  remainingSeconds: number;
  totalDurationSeconds: number;
  extensionCount: number;
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

export interface AuctionEngineState {
  // 1. Auction Profile & Tournament Rules
  profile: AuctionProfile;

  // 2. Data Collections
  lots: AuctionLotItem[];
  activeLotId: string | null;
  teams: AuctionTeamParticipant[];
  bids: PlacedBidEntry[];

  // 3. Stage Clock & Controls
  clock: StageClockState;

  // 4. Celebration Modal
  celebration: CelebrationState;

  // 5. Active User Operator Context
  activeBidderTeamId: string | null;
  activeFranchiseId: string | null; // For Franchise Bidder Panel
  isMuted: boolean;

  // 6. Covert / Hidden Software Admin State
  isSoftwareAdminUnlocked: boolean;
  softwareAdminMasterKey: string;

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  // Covert Software Admin Authentication
  unlockSoftwareAdmin: (key: string) => boolean;
  lockSoftwareAdmin: () => void;
  setSoftwareAdminKey: (newKey: string) => void;

  // Franchise Selection
  setActiveFranchise: (teamId: string) => void;

  // Profile Actions
  updateProfile: (updates: Partial<AuctionProfile>) => void;
  setCurrency: (currency: CurrencyCode) => void;

  // Lot Actions
  addLot: (lot: Omit<AuctionLotItem, 'id' | 'currentHighBid' | 'currentLeaderId' | 'currentLeaderName' | 'currentLeaderPaddle' | 'status' | 'bidsCount'>) => void;
  updateLot: (id: string, updates: Partial<AuctionLotItem>) => void;
  deleteLot: (id: string) => void;
  setActiveLot: (id: string) => void;
  reorderLots: (newOrder: AuctionLotItem[]) => void;

  // Team Actions
  addTeam: (team: Omit<AuctionTeamParticipant, 'id' | 'remainingPurse' | 'totalSpent' | 'squadCount' | 'overseasCount' | 'isFrozen' | 'acquiredPlayers'>) => void;
  updateTeam: (id: string, updates: Partial<AuctionTeamParticipant>) => void;
  deleteTeam: (id: string) => void;
  adjustTeamPurse: (teamId: string, amount: number, isDeduction: boolean, reason?: string) => void;
  toggleTeamFreeze: (teamId: string) => void;
  setActiveBidderTeam: (teamId: string) => void;

  // Bidding Actions
  placeUserBid: (amount: number, teamId?: string) => { success: boolean; message: string };
  revokeLastBid: () => { success: boolean; message: string };

  // Clock Actions
  startClock: () => void;
  pauseClock: () => void;
  extendClock: (seconds: number) => void;
  resetClock: (seconds?: number) => void;
  tickClock: () => void;

  // Gavel Actions
  triggerGavelAction: (action: 'FAIR_WARNING' | 'GOING_TWICE' | 'SOLD' | 'PASS_UNSOLD' | 'RE_AUCTION') => void;
  dismissCelebration: () => void;
  toggleMute: () => void;

  // Templates & Maintenance
  loadPresetTemplate: (templateType: 'ROBIQUEST' | 'EMPTY' | 'SPORTS_IPL' | 'FINE_ART_LUXURY' | 'REAL_ESTATE') => void;
  exportTournamentState: () => string;
  importTournamentState: (jsonString: string) => { success: boolean; message: string };
}

// ----------------------------------------------------------------------------
// CURRENCY FORMATTING UTILITY
// ----------------------------------------------------------------------------
export function formatAuctionCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'INR') {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  const symbolMap: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };

  const symbol = symbolMap[currency] || '$';

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}k`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

// ----------------------------------------------------------------------------
// STARTER PRESETS (ROBICELL ROBIQUEST & SPORTS BLUEPRINTS)
// ----------------------------------------------------------------------------
export const STARTER_TEMPLATES = {
  ROBIQUEST: {
    profile: {
      id: 'auction-robiquest-2026',
      title: 'RobiQuest 2026 Live Auction',
      description: 'Conducted by RoboCell • Tech, Transform, Thrive • Robo A.I.',
      category: 'SPORTS_TOURNAMENT' as const,
      currency: 'INR' as const,
      minSquadSize: 4,
      maxSquadSize: 10,
      totalPurseCap: 1000000, // ₹10,00,000 (10 Lakhs)
      lowestBasePrice: 10000, // ₹10,000 base reserve
      enforceReservePurseFloor: true,
      minOverseasLimit: 0,
      maxOverseasLimit: 5,
      defaultMinIncrement: 2000, // ₹2,000 step
    },
    lots: [
      {
        id: 'lot-rq-1',
        lotNumber: 1,
        title: 'NVIDIA Jetson Orin Nano Developer Kit (8GB)',
        category: 'Edge AI & SLAM Compute',
        roleBadge: 'AI SUPERCOMPUTE',
        startingBid: 25000,
        reservePrice: 25000,
        minIncrement: 2500,
        currentHighBid: 25000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'LIVE' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Compute: '40 TOPS Ampere GPU AI Engine',
          Memory: '8GB 128-bit LPDDR5 High Bandwidth',
          Application: 'Autonomous Navigation, SLAM & Vision AI',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-rq-2',
        lotNumber: 2,
        title: 'RPLiDAR S2 360° Laser Range Scanner',
        category: 'Autonomous LiDAR & Perception',
        roleBadge: 'PERCEPTION SENSOR',
        startingBid: 18000,
        reservePrice: 18000,
        minIncrement: 2000,
        currentHighBid: 18000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Range: '30 Meters Omni-directional 360°',
          SampleRate: '32 kHz High-Frequency Pulse',
          Application: 'Real-time 2D/3D Point Cloud SLAM',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-rq-3',
        lotNumber: 3,
        title: 'Titan Grade-5 Titanium Combat Bot Chassis',
        category: 'Heavy Armor & Structural Frame',
        roleBadge: 'COMBAT GRADE',
        startingBid: 30000,
        reservePrice: 30000,
        minIncrement: 3000,
        currentHighBid: 30000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Material: 'Grade-5 Titanium & Carbon Fiber Weave',
          Drive: '6WD Integrated Planetary Gearbox',
          MaxPayload: '25 kg Combat Stress Load',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-rq-4',
        lotNumber: 4,
        title: '6-DOF Precision Robotic Arm with Harmonic Drive',
        category: 'Robotic Manipulation & Kinematics',
        roleBadge: 'PRECISION MANIPULATOR',
        startingBid: 35000,
        reservePrice: 35000,
        minIncrement: 3500,
        currentHighBid: 35000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Kinematics: '6 Degrees of Freedom Inverse Kinematics',
          Repeatability: '±0.05 mm Industrial Precision',
          Payload: '3.5 kg Dynamic Load Capacity',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-rq-5',
        lotNumber: 5,
        title: 'High-Torque Brushless Motor & FOC Vector ESC (4x Set)',
        category: 'High-Performance Actuation',
        roleBadge: 'HIGH-TORQUE DRIVE',
        startingBid: 20000,
        reservePrice: 20000,
        minIncrement: 2000,
        currentHighBid: 20000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Torque: '5.2 Nm Continuous Peak per Motor',
          Voltage: '24V - 48V Field-Oriented Control',
          Efficiency: '94% Brushless Core Efficiency',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-rq-6',
        lotNumber: 6,
        title: 'OAK-D Pro Spatial AI 3D Vision Camera Module',
        category: 'Computer Vision & Depth Perception',
        roleBadge: 'SPATIAL AI',
        startingBid: 16000,
        reservePrice: 16000,
        minIncrement: 2000,
        currentHighBid: 16000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Vision: 'Active Stereo IR + 12MP RGB Camera',
          OnDeviceAI: '4 TOPS Myriad X VPU Edge Inference',
          Tracking: 'Sub-millimeter 3D Spatial Feature Tracking',
        },
        bidsCount: 0,
      },
    ] as AuctionLotItem[],
    teams: [
      {
        id: 'team-titans',
        name: 'Robo Titans',
        shortCode: 'RBT',
        paddleNumber: 101,
        color: '#06b6d4',
        accentColor: '#67e8f9',
        logoUrl: '/robocell-logo.png',
        initialPurse: 1000000,
        remainingPurse: 1000000,
        totalSpent: 0,
        squadCount: 0,
        overseasCount: 0,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-knights',
        name: 'Cyber Knights',
        shortCode: 'CKT',
        paddleNumber: 102,
        color: '#f43f5e',
        accentColor: '#fda4af',
        logoUrl: '/robocell-logo.png',
        initialPurse: 1000000,
        remainingPurse: 1000000,
        totalSpent: 0,
        squadCount: 0,
        overseasCount: 0,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-dynamos',
        name: 'Neural Dynamos',
        shortCode: 'NDY',
        paddleNumber: 103,
        color: '#a855f7',
        accentColor: '#d8b4fe',
        logoUrl: '/robocell-logo.png',
        initialPurse: 1000000,
        remainingPurse: 1000000,
        totalSpent: 0,
        squadCount: 0,
        overseasCount: 0,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-warriors',
        name: 'Mecha Warriors',
        shortCode: 'MWR',
        paddleNumber: 104,
        color: '#f59e0b',
        accentColor: '#fde68a',
        logoUrl: '/robocell-logo.png',
        initialPurse: 1000000,
        remainingPurse: 1000000,
        totalSpent: 0,
        squadCount: 0,
        overseasCount: 0,
        isFrozen: false,
        acquiredPlayers: [],
      },
    ] as AuctionTeamParticipant[],
  },
  SPORTS_IPL: {
    profile: {
      id: 'auction-ipl-2026',
      title: 'TATA IPL 2026 Mega Player Auction',
      description: 'Official Live Franchise Player Acquisition Arena',
      category: 'SPORTS_TOURNAMENT' as const,
      currency: 'INR' as const,
      minSquadSize: 18,
      maxSquadSize: 25,
      totalPurseCap: 1200000000, // ₹120 Cr
      lowestBasePrice: 3000000,   // ₹30 L minimum reserve unit
      enforceReservePurseFloor: true,
      minOverseasLimit: 0,
      maxOverseasLimit: 8,
      defaultMinIncrement: 5000000, // ₹50 L step
    },
    lots: [
      {
        id: 'lot-ipl-1',
        lotNumber: 1,
        title: 'Heinrich Klaasen',
        category: 'Wicketkeeper-Batsman',
        roleBadge: 'OVERSEAS MARQUEE',
        playerRole: 'WICKETKEEPER' as PlayerRole,
        isOverseas: true,
        playerStats: {
          matches: 48,
          runs: 1680,
          strikeRate: 172.4,
          average: 44.2,
          battingStyle: 'Right-Handed Finisher',
          country: 'South Africa',
        },
        startingBid: 20000000, // ₹2.00 Cr
        reservePrice: 20000000,
        minIncrement: 5000000, // ₹50 L
        currentHighBid: 20000000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'LIVE' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Role: 'Wicketkeeper / Finisher',
          Country: 'South Africa',
          Discipline: 'Power Hitter',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-ipl-2',
        lotNumber: 2,
        title: 'Mitchell Starc',
        category: 'Fast Bowler',
        roleBadge: 'OVERSEAS MARQUEE',
        playerRole: 'BOWLER' as PlayerRole,
        isOverseas: true,
        playerStats: {
          matches: 84,
          wickets: 175,
          economy: 7.78,
          average: 20.4,
          bowlingStyle: 'Left-Arm Express Fast (145+ km/h)',
          country: 'Australia',
        },
        startingBid: 20000000, // ₹2.00 Cr
        reservePrice: 20000000,
        minIncrement: 5000000,
        currentHighBid: 20000000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Role: 'Fast Bowler',
          Country: 'Australia',
          Discipline: 'Death Overs Specialist',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-ipl-3',
        lotNumber: 3,
        title: 'Jasprit Bumrah',
        category: 'Fast Bowler',
        roleBadge: 'DOMESTIC MARQUEE',
        playerRole: 'BOWLER' as PlayerRole,
        isOverseas: false,
        playerStats: {
          matches: 133,
          wickets: 165,
          economy: 6.42,
          average: 22.1,
          bowlingStyle: 'Right-Arm Fast Yorker Specialist',
          country: 'India',
        },
        startingBid: 20000000,
        reservePrice: 20000000,
        minIncrement: 5000000,
        currentHighBid: 20000000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Role: 'Fast Bowler',
          Country: 'India',
          Discipline: 'Pace Spearhead',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-ipl-4',
        lotNumber: 4,
        title: 'Shubman Gill',
        category: 'Top-Order Batsman',
        roleBadge: 'DOMESTIC MARQUEE',
        playerRole: 'BATSMAN' as PlayerRole,
        isOverseas: false,
        playerStats: {
          matches: 103,
          runs: 3216,
          strikeRate: 137.9,
          average: 37.8,
          battingStyle: 'Right-Hand Opening Batsman',
          country: 'India',
        },
        startingBid: 20000000,
        reservePrice: 20000000,
        minIncrement: 5000000,
        currentHighBid: 20000000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Role: 'Opening Batsman',
          Country: 'India',
          Discipline: 'Class Stroke Player',
        },
        bidsCount: 0,
      },
      {
        id: 'lot-ipl-5',
        lotNumber: 5,
        title: 'Rashid Khan',
        category: 'All-Rounder',
        roleBadge: 'OVERSEAS MARQUEE',
        playerRole: 'ALL_ROUNDER' as PlayerRole,
        isOverseas: true,
        playerStats: {
          matches: 121,
          wickets: 149,
          runs: 620,
          strikeRate: 168.0,
          economy: 6.75,
          bowlingStyle: 'Right-Arm Leg Spin Googly',
          battingStyle: 'Right-Hand Finisher',
          country: 'Afghanistan',
        },
        startingBid: 20000000,
        reservePrice: 20000000,
        minIncrement: 5000000,
        currentHighBid: 20000000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'UPCOMING' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Role: 'Spin All-Rounder',
          Country: 'Afghanistan',
          Discipline: 'Mystery Spinner & Finisher',
        },
        bidsCount: 0,
      },
    ],
    teams: [
      {
        id: 'team-srh',
        name: 'Sunrisers Hyderabad',
        shortCode: 'SRH',
        paddleNumber: 101,
        color: '#f97316',
        accentColor: '#fdba74',
        logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        totalSpent: 0,
        squadCount: 12,
        overseasCount: 4,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-rcb',
        name: 'Royal Challengers Bengaluru',
        shortCode: 'RCB',
        paddleNumber: 102,
        color: '#dc2626',
        accentColor: '#fca5a5',
        logoUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=120&q=80',
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        totalSpent: 0,
        squadCount: 14,
        overseasCount: 5,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-csk',
        name: 'Chennai Super Kings',
        shortCode: 'CSK',
        paddleNumber: 103,
        color: '#eab308',
        accentColor: '#fef08a',
        logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        totalSpent: 0,
        squadCount: 15,
        overseasCount: 6,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-mi',
        name: 'Mumbai Titans',
        shortCode: 'MI',
        paddleNumber: 104,
        color: '#0284c7',
        accentColor: '#7dd3fc',
        logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=120&q=80',
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        totalSpent: 0,
        squadCount: 13,
        overseasCount: 4,
        isFrozen: false,
        acquiredPlayers: [],
      },
      {
        id: 'team-kkr',
        name: 'Kolkata Knight Riders',
        shortCode: 'KKR',
        paddleNumber: 105,
        color: '#7c3aed',
        accentColor: '#c4b5fd',
        logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=120&q=80',
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        totalSpent: 0,
        squadCount: 14,
        overseasCount: 5,
        isFrozen: false,
        acquiredPlayers: [],
      },
    ],
  },

  EMPTY: {
    profile: {
      id: 'auction-custom',
      title: 'New Custom Sports Auction',
      description: 'Configure tournament rules, player catalog, and franchise rosters.',
      category: 'SPORTS_TOURNAMENT' as const,
      currency: 'INR' as const,
      minSquadSize: 18,
      maxSquadSize: 25,
      totalPurseCap: 1200000000,
      lowestBasePrice: 3000000,
      enforceReservePurseFloor: true,
      minOverseasLimit: 0,
      maxOverseasLimit: 8,
      defaultMinIncrement: 5000000,
    },
    lots: [],
    teams: [],
  },

  FINE_ART_LUXURY: {
    profile: {
      id: 'auction-art-2026',
      title: 'Evening Modern & Contemporary Masters',
      description: 'Important Works from Private European and American Collections',
      category: 'FINE_ART_LUXURY' as const,
      currency: 'USD' as const,
      minSquadSize: 1,
      maxSquadSize: 20,
      totalPurseCap: 50000000,
      lowestBasePrice: 100000,
      enforceReservePurseFloor: false,
      minOverseasLimit: 0,
      maxOverseasLimit: 20,
      defaultMinIncrement: 50000,
    },
    lots: [
      {
        id: 'lot-art-1',
        lotNumber: 1,
        title: 'Jean-Michel Basquiat — Untitled (Fallen Angel, 1981)',
        category: 'Contemporary & Post-War Art',
        roleBadge: 'MUSEUM MASTERPIECE',
        sellerName: 'Private European Foundation',
        startingBid: 850000,
        reservePrice: 1200000,
        minIncrement: 50000,
        currentHighBid: 850000,
        currentLeaderId: null,
        currentLeaderName: null,
        currentLeaderPaddle: null,
        status: 'LIVE' as const,
        imageUrls: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        ],
        attributes: {
          Medium: 'Acrylic and oilstick on canvas',
          Dimensions: '198 x 173 cm',
          Provenance: 'Acquired directly from the artist',
        },
        bidsCount: 0,
      },
    ],
    teams: [
      {
        id: 'collector-1',
        name: 'Monaco Private Trust',
        shortCode: 'MPT',
        paddleNumber: 42,
        color: '#f59e0b',
        accentColor: '#fde68a',
        logoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        initialPurse: 15000000,
        remainingPurse: 15000000,
        totalSpent: 0,
        squadCount: 0,
        overseasCount: 0,
        isFrozen: false,
        acquiredPlayers: [],
      },
    ],
  },

  REAL_ESTATE: {
    profile: {
      id: 'auction-re-2026',
      title: 'Prime Commercial & Luxury Estate Auction',
      description: 'Institutional Commercial Real Estate & Waterfront Developments',
      category: 'REAL_ESTATE' as const,
      currency: 'USD' as const,
      minSquadSize: 1,
      maxSquadSize: 10,
      totalPurseCap: 250000000,
      lowestBasePrice: 1000000,
      enforceReservePurseFloor: false,
      minOverseasLimit: 0,
      maxOverseasLimit: 10,
      defaultMinIncrement: 250000,
    },
    lots: [],
    teams: [],
  },
};

// ----------------------------------------------------------------------------
// ZUSTAND STORE CREATION WITH PERSISTENCE
// ----------------------------------------------------------------------------
export const useAuctionEngineStore = create<AuctionEngineState>()(
  persist(
    (set, get) => ({
      // Defaults out-of-the-box to RoboCell RobiQuest Mega Auction
      profile: STARTER_TEMPLATES.ROBIQUEST.profile,
      lots: STARTER_TEMPLATES.ROBIQUEST.lots,
      activeLotId: STARTER_TEMPLATES.ROBIQUEST.lots[0]?.id || null,
      teams: STARTER_TEMPLATES.ROBIQUEST.teams,
      bids: [],

      clock: {
        status: 'IDLE',
        remainingSeconds: 60,
        totalDurationSeconds: 60,
        extensionCount: 0,
      },

      celebration: {
        isOpen: false,
        lotTitle: '',
        lotNumber: 0,
        lotImageUrl: '',
        hammerPrice: 0,
        winningTeamName: '',
        winningTeamLogo: '',
        winningTeamColor: '#06b6d4',
      },

      activeBidderTeamId: STARTER_TEMPLATES.ROBIQUEST.teams[0]?.id || null,
      activeFranchiseId: STARTER_TEMPLATES.ROBIQUEST.teams[0]?.id || null,
      isMuted: false,

      // Hidden Software Admin State
      isSoftwareAdminUnlocked: false,
      softwareAdminMasterKey: 'APEX-SPORTS-MASTER-2026',

      unlockSoftwareAdmin: (key: string) => {
        const state = get();
        if (key.trim() === state.softwareAdminMasterKey.trim()) {
          set({ isSoftwareAdminUnlocked: true });
          return true;
        }
        return false;
      },

      lockSoftwareAdmin: () => set({ isSoftwareAdminUnlocked: false }),

      setSoftwareAdminKey: (newKey: string) => {
        if (newKey.trim().length >= 6) {
          set({ softwareAdminMasterKey: newKey.trim() });
        }
      },

      setActiveFranchise: (teamId: string) =>
        set({ activeFranchiseId: teamId, activeBidderTeamId: teamId }),

      // ----------------------------------------------------------------------
      // PROFILE ACTIONS
      // ----------------------------------------------------------------------
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      setCurrency: (currency) =>
        set((state) => ({ profile: { ...state.profile, currency } })),

      // ----------------------------------------------------------------------
      // LOT ACTIONS
      // ----------------------------------------------------------------------
      addLot: (lotData) =>
        set((state) => {
          const newLot: AuctionLotItem = {
            ...lotData,
            id: `lot-${Date.now()}`,
            currentHighBid: lotData.startingBid,
            currentLeaderId: null,
            currentLeaderName: null,
            currentLeaderPaddle: null,
            status: state.lots.length === 0 ? 'LIVE' : 'UPCOMING',
            bidsCount: 0,
          };
          const nextLots = [...state.lots, newLot];
          return {
            lots: nextLots,
            activeLotId: state.activeLotId || newLot.id,
          };
        }),

      updateLot: (id, updates) =>
        set((state) => ({
          lots: state.lots.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      deleteLot: (id) =>
        set((state) => {
          const nextLots = state.lots.filter((l) => l.id !== id);
          const nextActive = state.activeLotId === id ? nextLots[0]?.id || null : state.activeLotId;
          return { lots: nextLots, activeLotId: nextActive };
        }),

      setActiveLot: (id) =>
        set((state) => ({
          activeLotId: id,
          lots: state.lots.map((l) => (l.id === id ? { ...l, status: 'LIVE' } : l)),
          clock: { status: 'IDLE', remainingSeconds: 60, totalDurationSeconds: 60, extensionCount: 0 },
        })),

      reorderLots: (newOrder) => set({ lots: newOrder }),

      // ----------------------------------------------------------------------
      // TEAM ACTIONS
      // ----------------------------------------------------------------------
      addTeam: (teamData) =>
        set((state) => {
          const newTeam: AuctionTeamParticipant = {
            ...teamData,
            id: `team-${Date.now()}`,
            remainingPurse: teamData.initialPurse,
            totalSpent: 0,
            squadCount: 0,
            overseasCount: 0,
            isFrozen: false,
            acquiredPlayers: [],
          };
          return {
            teams: [...state.teams, newTeam],
            activeBidderTeamId: state.activeBidderTeamId || newTeam.id,
            activeFranchiseId: state.activeFranchiseId || newTeam.id,
          };
        }),

      updateTeam: (id, updates) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTeam: (id) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
          activeBidderTeamId: state.activeBidderTeamId === id ? state.teams[0]?.id || null : state.activeBidderTeamId,
          activeFranchiseId: state.activeFranchiseId === id ? state.teams[0]?.id || null : state.activeFranchiseId,
        })),

      adjustTeamPurse: (teamId, amount, isDeduction) =>
        set((state) => ({
          teams: state.teams.map((t) => {
            if (t.id !== teamId) return t;
            const newPurse = isDeduction
              ? Math.max(0, t.remainingPurse - amount)
              : t.remainingPurse + amount;
            return {
              ...t,
              remainingPurse: newPurse,
              totalSpent: isDeduction ? t.totalSpent + amount : Math.max(0, t.totalSpent - amount),
            };
          }),
        })),

      toggleTeamFreeze: (teamId) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, isFrozen: !t.isFrozen } : t)),
        })),

      setActiveBidderTeam: (teamId) => set({ activeBidderTeamId: teamId }),

      // ----------------------------------------------------------------------
      // USER-DRIVEN BIDDING (STRICT SPORTS SOLVENCY CHECKS)
      // ----------------------------------------------------------------------
      placeUserBid: (amount, explicitTeamId) => {
        const state = get();
        const activeLot = state.lots.find((l) => l.id === state.activeLotId);
        const teamId = explicitTeamId || state.activeBidderTeamId || state.activeFranchiseId;
        const team = state.teams.find((t) => t.id === teamId);

        if (!activeLot) return { success: false, message: 'No active player on stage' };
        if (!team) return { success: false, message: 'No franchise bidder selected' };
        if (team.isFrozen) return { success: false, message: `${team.name} bidding rights are frozen by Governance` };

        // 1. Check max squad capacity
        if (team.squadCount >= state.profile.maxSquadSize) {
          return {
            success: false,
            message: `Squad Ceiling Reached: ${team.name} already has ${state.profile.maxSquadSize} players (max capacity).`,
          };
        }

        // 2. Check overseas quota limit
        if (activeLot.isOverseas && team.overseasCount >= state.profile.maxOverseasLimit) {
          return {
            success: false,
            message: `Overseas Cap Exceeded: ${team.name} already has ${team.overseasCount}/${state.profile.maxOverseasLimit} foreign players.`,
          };
        }

        // 3. Solvency check
        if (team.remainingPurse < amount) {
          return { success: false, message: `${team.name} has insufficient purse balance` };
        }

        // 4. Mathematical reserve purse floor preservation
        if (state.profile.enforceReservePurseFloor) {
          const unfilledSlots = Math.max(0, state.profile.minSquadSize - team.squadCount - 1);
          const reserveFloorNeeded = unfilledSlots * state.profile.lowestBasePrice;
          if (team.remainingPurse - amount < reserveFloorNeeded) {
            return {
              success: false,
              message: `Reserve Floor Violation: ${team.name} must reserve at least ${formatAuctionCurrency(reserveFloorNeeded, state.profile.currency)} for ${unfilledSlots} unfilled squad slots.`,
            };
          }
        }

        // 5. Min increment check
        const requiredMin = activeLot.bidsCount === 0
          ? activeLot.startingBid
          : activeLot.currentHighBid + activeLot.minIncrement;

        if (amount < requiredMin) {
          return {
            success: false,
            message: `Bid must be at least ${formatAuctionCurrency(requiredMin, state.profile.currency)}`,
          };
        }

        // Anti-sniping soft close: if clock is running and <= 15s, extend by +45s
        let nextClock = { ...state.clock };
        if (state.clock.status === 'RUNNING' && state.clock.remainingSeconds <= 15) {
          nextClock.remainingSeconds += 45;
          nextClock.extensionCount += 1;
        }

        const newBid: PlacedBidEntry = {
          id: `bid-${Date.now()}`,
          lotId: activeLot.id,
          teamId: team.id,
          teamName: team.name,
          paddleNumber: team.paddleNumber,
          amount,
          timestamp: Date.now(),
        };

        const updatedLots = state.lots.map((l) =>
          l.id === activeLot.id
            ? {
                ...l,
                currentHighBid: amount,
                currentLeaderId: team.id,
                currentLeaderName: team.name,
                currentLeaderPaddle: team.paddleNumber,
                bidsCount: l.bidsCount + 1,
              }
            : l
        );

        soundEffects.playBidAccepted();

        set({
          lots: updatedLots,
          bids: [newBid, ...state.bids],
          clock: nextClock,
        });

        return { success: true, message: `Paddle #${team.paddleNumber} (${team.shortCode}): Bid ${formatAuctionCurrency(amount, state.profile.currency)} placed!` };
      },

      // ----------------------------------------------------------------------
      // 1-CLICK BID REVOCATION
      // ----------------------------------------------------------------------
      revokeLastBid: () => {
        const state = get();
        const activeLot = state.lots.find((l) => l.id === state.activeLotId);
        if (!activeLot) return { success: false, message: 'No active player on stage' };

        const lotBids = state.bids.filter((b) => b.lotId === activeLot.id && !b.isRevoked);
        if (lotBids.length === 0) return { success: false, message: 'No bids to revoke' };

        const bidToRevoke = lotBids[0];
        const previousBid = lotBids[1] || null;

        const updatedLots = state.lots.map((l) =>
          l.id === activeLot.id
            ? {
                ...l,
                currentHighBid: previousBid ? previousBid.amount : l.startingBid,
                currentLeaderId: previousBid ? previousBid.teamId : null,
                currentLeaderName: previousBid ? previousBid.teamName : null,
                currentLeaderPaddle: previousBid ? previousBid.paddleNumber : null,
                bidsCount: Math.max(0, l.bidsCount - 1),
              }
            : l
        );

        const updatedBids = state.bids.map((b) =>
          b.id === bidToRevoke.id ? { ...b, isRevoked: true } : b
        );

        soundEffects.playOutbidAlert();

        set({ lots: updatedLots, bids: updatedBids });
        return { success: true, message: `Revoked bid of ${formatAuctionCurrency(bidToRevoke.amount, state.profile.currency)}` };
      },

      // ----------------------------------------------------------------------
      // STAGE CLOCK (OPERATOR DRIVEN)
      // ----------------------------------------------------------------------
      startClock: () =>
        set((state) => ({ clock: { ...state.clock, status: 'RUNNING' } })),

      pauseClock: () =>
        set((state) => ({ clock: { ...state.clock, status: 'PAUSED' } })),

      extendClock: (seconds) =>
        set((state) => ({
          clock: {
            ...state.clock,
            remainingSeconds: state.clock.remainingSeconds + seconds,
            extensionCount: state.clock.extensionCount + 1,
          },
        })),

      resetClock: (seconds = 60) =>
        set({
          clock: {
            status: 'IDLE',
            remainingSeconds: seconds,
            totalDurationSeconds: seconds,
            extensionCount: 0,
          },
        }),

      tickClock: () =>
        set((state) => {
          if (state.clock.status !== 'RUNNING') return state;
          if (state.clock.remainingSeconds <= 1) {
            return {
              clock: { ...state.clock, status: 'EXPIRED', remainingSeconds: 0 },
            };
          }
          if (state.clock.remainingSeconds <= 10 && !state.isMuted) {
            soundEffects.playClockWarningTick();
          }
          return {
            clock: { ...state.clock, remainingSeconds: state.clock.remainingSeconds - 1 },
          };
        }),

      // ----------------------------------------------------------------------
      // GAVEL EXECUTION & ROSTER ASSIGNMENT
      // ----------------------------------------------------------------------
      triggerGavelAction: (action) => {
        const state = get();
        const activeLot = state.lots.find((l) => l.id === state.activeLotId);
        if (!activeLot) return;

        if (action === 'FAIR_WARNING') {
          soundEffects.playClockWarningTick();
          set((s) => ({
            lots: s.lots.map((l) => (l.id === activeLot.id ? { ...l, status: 'FAIR_WARNING' } : l)),
          }));
        } else if (action === 'GOING_TWICE') {
          soundEffects.playClockWarningTick();
        } else if (action === 'SOLD') {
          soundEffects.playGavelStrike();
          const winningTeam = state.teams.find((t) => t.id === activeLot.currentLeaderId);

          if (winningTeam) {
            const acquiredEntry: AcquiredPlayer = {
              id: activeLot.id,
              lotNumber: activeLot.lotNumber,
              title: activeLot.title,
              role: activeLot.playerRole || activeLot.category,
              isOverseas: !!activeLot.isOverseas,
              price: activeLot.currentHighBid,
              timestamp: Date.now(),
            };

            set((s) => ({
              teams: s.teams.map((t) =>
                t.id === winningTeam.id
                  ? {
                      ...t,
                      remainingPurse: Math.max(0, t.remainingPurse - activeLot.currentHighBid),
                      totalSpent: t.totalSpent + activeLot.currentHighBid,
                      squadCount: t.squadCount + 1,
                      overseasCount: t.overseasCount + (activeLot.isOverseas ? 1 : 0),
                      acquiredPlayers: [...(t.acquiredPlayers || []), acquiredEntry],
                    }
                  : t
              ),
              celebration: {
                isOpen: true,
                lotTitle: activeLot.title,
                lotNumber: activeLot.lotNumber,
                lotImageUrl: activeLot.imageUrls[0] || '',
                hammerPrice: activeLot.currentHighBid,
                winningTeamName: winningTeam.name,
                winningTeamLogo: winningTeam.logoUrl,
                winningTeamColor: winningTeam.color,
              },
            }));
          }

          set((s) => ({
            lots: s.lots.map((l) => (l.id === activeLot.id ? { ...l, status: 'SOLD' } : l)),
            clock: { ...s.clock, status: 'EXPIRED' },
          }));
        } else if (action === 'PASS_UNSOLD') {
          set((s) => ({
            lots: s.lots.map((l) => (l.id === activeLot.id ? { ...l, status: 'PASSED' } : l)),
            clock: { ...s.clock, status: 'EXPIRED' },
          }));
        } else if (action === 'RE_AUCTION') {
          set((s) => ({
            lots: s.lots.map((l) =>
              l.id === activeLot.id
                ? {
                    ...l,
                    status: 'LIVE',
                    currentHighBid: l.startingBid,
                    currentLeaderId: null,
                    currentLeaderName: null,
                    currentLeaderPaddle: null,
                    bidsCount: 0,
                  }
                : l
            ),
            clock: { status: 'IDLE', remainingSeconds: 60, totalDurationSeconds: 60, extensionCount: 0 },
          }));
        }
      },

      dismissCelebration: () =>
        set((state) => ({ celebration: { ...state.celebration, isOpen: false } })),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      loadPresetTemplate: (templateType) => {
        const selected = STARTER_TEMPLATES[templateType] || STARTER_TEMPLATES.ROBIQUEST;
        set({
          profile: selected.profile,
          lots: selected.lots,
          activeLotId: selected.lots[0]?.id || null,
          teams: selected.teams,
          bids: [],
          clock: { status: 'IDLE', remainingSeconds: 60, totalDurationSeconds: 60, extensionCount: 0 },
          activeBidderTeamId: selected.teams[0]?.id || null,
          activeFranchiseId: selected.teams[0]?.id || null,
        });
      },

      exportTournamentState: () => {
        const s = get();
        return JSON.stringify(
          {
            version: '2.4.0',
            exportedAt: new Date().toISOString(),
            profile: s.profile,
            lots: s.lots,
            teams: s.teams,
            bids: s.bids,
          },
          null,
          2
        );
      },

      importTournamentState: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (!parsed.profile || !Array.isArray(parsed.lots) || !Array.isArray(parsed.teams)) {
            return { success: false, message: 'Invalid tournament data schema' };
          }
          set({
            profile: parsed.profile,
            lots: parsed.lots,
            activeLotId: parsed.lots[0]?.id || null,
            teams: parsed.teams,
            bids: parsed.bids || [],
            activeBidderTeamId: parsed.teams[0]?.id || null,
            activeFranchiseId: parsed.teams[0]?.id || null,
          });
          return { success: true, message: `Successfully imported tournament "${parsed.profile.title}"!` };
        } catch (e: any) {
          return { success: false, message: e.message || 'JSON parse error' };
        }
      },
    }),
    {
      name: 'robocell-robiquest-auction-store-v1',
    }
  )
);
