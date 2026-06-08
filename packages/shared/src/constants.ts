import { RankTier, GameMode } from './enums';

export const GAME_CONFIG = {
  TICK_RATE: 20,
  TICK_INTERVAL: 50,
  MAX_PLAYERS_PER_ROOM: 8,
  MIN_PLAYERS_PER_GAME: 4,
  GAME_DURATION: 300,
  RESPAWN_TIME: 3000,
  COUNTDOWN_TIME: 3,

  PLAYER: {
    MAX_HEALTH: 100,
    MAX_ENERGY: 100,
    SPEED: 200,
    SIZE: 20,
    FIRE_RATE: 200,
    ENERGY_REGEN: 5,
  },

  BULLET: {
    SPEED: 500,
    DAMAGE: 10,
    SIZE: 4,
    LIFE: 2000,
  },

  MAP: {
    WIDTH: 1600,
    HEIGHT: 900,
  },
};

export const RANK_CONFIG: Record<RankTier, { name: string; minPoints: number; color: string }> = {
  [RankTier.BRONZE]: { name: '青铜', minPoints: 0, color: '#CD7F32' },
  [RankTier.SILVER]: { name: '白银', minPoints: 1000, color: '#C0C0C0' },
  [RankTier.GOLD]: { name: '黄金', minPoints: 2000, color: '#FFD700' },
  [RankTier.PLATINUM]: { name: '铂金', minPoints: 3000, color: '#E5E4E2' },
  [RankTier.DIAMOND]: { name: '钻石', minPoints: 4000, color: '#B9F2FF' },
  [RankTier.MASTER]: { name: '大师', minPoints: 5000, color: '#9966CC' },
  [RankTier.CHALLENGER]: { name: '王者', minPoints: 6000, color: '#FF4500' },
};

export const MATCH_CONFIG = {
  SCAN_INTERVAL: 1000,
  INITIAL_RANGE: 100,
  MAX_RANGE: 500,
  RANGE_INCREASE_RATE: 50,
  RANGE_INCREASE_INTERVAL: 5000,
  MAX_WAIT_TIME: 120000,
  DEFAULT_PLAYERS: 6,
};

export const ANTICHEAT_CONFIG = {
  MAX_MOVE_SPEED: 400,
  MAX_DAMAGE_PER_HIT: 50,
  MAX_INPUTS_PER_SECOND: 60,
  MIN_TELEPORT_DISTANCE: 200,
  GOD_MODE_HEALTH_THRESHOLD: 95,
  GOD_MODE_DURATION: 30000,
  WARNING_THRESHOLD: 3,
  TEMP_BAN_THRESHOLD: 5,
  PERM_BAN_THRESHOLD: 10,
  TEMP_BAN_DURATION: 86400000,
};

export const RANK_RULES = {
  BASE_WIN_POINTS: 20,
  BASE_LOSE_POINTS: -15,
  MIN_WIN_POINTS: 10,
  MAX_WIN_POINTS: 30,
  MIN_LOSE_POINTS: -25,
  MAX_LOSE_POINTS: -5,
  WIN_STREAK_BONUS: [0, 0, 2, 5, 8, 12, 15],
  RANK_DIFF_MULTIPLIER: 0.1,
};

export const RECONNECT_CONFIG = {
  HEARTBEAT_INTERVAL: 5000,
  DISCONNECT_TIMEOUT: 15000,
  RECONNECT_WINDOW: 30000,
  MAX_RECONNECT_ATTEMPTS: 5,
};

export const COLORS = {
  primary: '#00f0ff',
  secondary: '#ff00ff',
  accent: '#8b5cf6',
  success: '#00ff88',
  warning: '#ff6b35',
  danger: '#ff3366',
  background: '#0a0e27',
  backgroundLight: '#1a1f3a',
  backgroundLighter: '#2d3561',
  text: '#e8ecff',
  textSecondary: '#8892c4',
};

export function getRankTier(points: number): RankTier {
  if (points >= 6000) return RankTier.CHALLENGER;
  if (points >= 5000) return RankTier.MASTER;
  if (points >= 4000) return RankTier.DIAMOND;
  if (points >= 3000) return RankTier.PLATINUM;
  if (points >= 2000) return RankTier.GOLD;
  if (points >= 1000) return RankTier.SILVER;
  return RankTier.BRONZE;
}

export function calculateRankChange(
  playerPoints: number,
  opponentAvgPoints: number,
  isWin: boolean,
  winStreak: number,
  mode: GameMode
): number {
  if (mode !== GameMode.RANKED) return 0;

  const pointDiff = opponentAvgPoints - playerPoints;
  const diffMultiplier = 1 + (pointDiff * RANK_RULES.RANK_DIFF_MULTIPLIER) / 100;

  let baseChange = isWin ? RANK_RULES.BASE_WIN_POINTS : RANK_RULES.BASE_LOSE_POINTS;
  baseChange = Math.round(baseChange * diffMultiplier);

  if (isWin && winStreak >= 2) {
    const streakBonus = RANK_RULES.WIN_STREAK_BONUS[Math.min(winStreak, RANK_RULES.WIN_STREAK_BONUS.length - 1)];
    baseChange += streakBonus;
  }

  if (isWin) {
    baseChange = Math.max(RANK_RULES.MIN_WIN_POINTS, Math.min(RANK_RULES.MAX_WIN_POINTS, baseChange));
  } else {
    baseChange = Math.max(RANK_RULES.MIN_LOSE_POINTS, Math.min(RANK_RULES.MAX_LOSE_POINTS, baseChange));
  }

  return baseChange;
}
