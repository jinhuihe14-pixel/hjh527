import {
  GameMode,
  RoomStatus,
  GameState,
  RankTier,
  ItemType,
  ItemRarity,
  SkillType,
  EntityType
} from './enums';

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerInfo {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  rankTier: RankTier;
  rankPoints: number;
}

export interface PlayerInput {
  seq: number;
  timestamp: number;
  movement: Vector2;
  shooting: boolean;
  mouseAngle?: number;
}

export interface PlayerState {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  score: number;
  kills: number;
  deaths: number;
  isAlive: boolean;
  respawnTimer: number;
  skills: Record<string, { cooldown: number; maxCooldown: number }>;
  buffs: Buff[];
}

export interface BulletState {
  id: string;
  ownerId: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  speed: number;
  life: number;
}

export interface PowerUpState {
  id: string;
  type: string;
  position: Vector2;
  respawnTime: number;
}

export interface Buff {
  type: string;
  duration: number;
  value: number;
}

export interface GameStateData {
  state: GameState;
  tick: number;
  timestamp: number;
  duration: number;
  timeLeft: number;
  players: Record<string, PlayerState>;
  bullets: BulletState[];
  powerUps: PowerUpState[];
}

export interface RoomInfo {
  id: string;
  name: string;
  mode: GameMode;
  status: RoomStatus;
  maxPlayers: number;
  hostId: string;
  players: RoomPlayer[];
  map: string;
  gameDuration: number;
}

export interface RoomPlayer {
  id: string;
  nickname: string;
  avatar: string;
  rankTier: RankTier;
  isReady: boolean;
  isHost: boolean;
  team?: number;
}

export interface MatchRequest {
  playerId: string;
  mode: GameMode;
  rankPoints: number;
  teamMembers?: string[];
  timestamp: number;
}

export interface MatchResult {
  success: boolean;
  roomId?: string;
  serverUrl?: string;
  players?: RoomPlayer[];
  waitTime?: number;
  message?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  price: number;
  currency: 'coins' | 'diamonds';
  rarity: ItemRarity;
  isActive: boolean;
  attributes: Record<string, any>;
}

export interface InventoryItem {
  itemId: string;
  count: number;
  obtainedAt: number;
  expiresAt?: number;
}

export interface PlayerGameStats {
  playerId: string;
  nickname: string;
  team: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  score: number;
  rankChange: number;
  result: 'win' | 'lose' | 'draw';
}

export interface GameResult {
  gameId: string;
  mode: GameMode;
  map: string;
  duration: number;
  startTime: number;
  endTime: number;
  players: PlayerGameStats[];
  winnerTeam?: number;
}

export interface GameMessage<T = any> {
  type: string;
  seq?: number;
  timestamp: number;
  data: T;
}

export interface CheatDetectionEvent {
  playerId: string;
  cheatType: string;
  severity: number;
  evidence: Record<string, any>;
  timestamp: number;
}

export interface RankRecord {
  userId: string;
  seasonId: string;
  rankTier: RankTier;
  rankPoints: number;
  highestTier: RankTier;
  highestPoints: number;
  winStreak: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatar: string;
  rankTier: RankTier;
  rankPoints: number;
  winRate: number;
}

export interface SeasonInfo {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  rewards: SeasonReward[];
}

export interface SeasonReward {
  rankTier: RankTier;
  type: 'item' | 'currency' | 'title';
  itemId?: string;
  amount?: number;
  title?: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  timestamp: number;
}
