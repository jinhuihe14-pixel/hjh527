import { RankTier, GameMode } from './enums';
export declare const GAME_CONFIG: {
    TICK_RATE: number;
    TICK_INTERVAL: number;
    MAX_PLAYERS_PER_ROOM: number;
    MIN_PLAYERS_PER_GAME: number;
    GAME_DURATION: number;
    RESPAWN_TIME: number;
    COUNTDOWN_TIME: number;
    PLAYER: {
        MAX_HEALTH: number;
        MAX_ENERGY: number;
        SPEED: number;
        SIZE: number;
        FIRE_RATE: number;
        ENERGY_REGEN: number;
    };
    BULLET: {
        SPEED: number;
        DAMAGE: number;
        SIZE: number;
        LIFE: number;
    };
    MAP: {
        WIDTH: number;
        HEIGHT: number;
    };
};
export declare const RANK_CONFIG: Record<RankTier, {
    name: string;
    minPoints: number;
    color: string;
}>;
export declare const MATCH_CONFIG: {
    SCAN_INTERVAL: number;
    INITIAL_RANGE: number;
    MAX_RANGE: number;
    RANGE_INCREASE_RATE: number;
    RANGE_INCREASE_INTERVAL: number;
    MAX_WAIT_TIME: number;
    DEFAULT_PLAYERS: number;
};
export declare const ANTICHEAT_CONFIG: {
    MAX_MOVE_SPEED: number;
    MAX_DAMAGE_PER_HIT: number;
    MAX_INPUTS_PER_SECOND: number;
    MIN_TELEPORT_DISTANCE: number;
    GOD_MODE_HEALTH_THRESHOLD: number;
    GOD_MODE_DURATION: number;
    WARNING_THRESHOLD: number;
    TEMP_BAN_THRESHOLD: number;
    PERM_BAN_THRESHOLD: number;
    TEMP_BAN_DURATION: number;
};
export declare const RANK_RULES: {
    BASE_WIN_POINTS: number;
    BASE_LOSE_POINTS: number;
    MIN_WIN_POINTS: number;
    MAX_WIN_POINTS: number;
    MIN_LOSE_POINTS: number;
    MAX_LOSE_POINTS: number;
    WIN_STREAK_BONUS: number[];
    RANK_DIFF_MULTIPLIER: number;
};
export declare const RECONNECT_CONFIG: {
    HEARTBEAT_INTERVAL: number;
    DISCONNECT_TIMEOUT: number;
    RECONNECT_WINDOW: number;
    MAX_RECONNECT_ATTEMPTS: number;
};
export declare const COLORS: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    backgroundLight: string;
    backgroundLighter: string;
    text: string;
    textSecondary: string;
};
export declare function getRankTier(points: number): RankTier;
export declare function calculateRankChange(playerPoints: number, opponentAvgPoints: number, isWin: boolean, winStreak: number, mode: GameMode): number;
export declare const DEFAULT_FEATURE_CONFIG: {
    tasks: boolean;
    achievements: boolean;
    weekly_rank: boolean;
    shop: boolean;
    ranked: boolean;
};
export declare const TASK_CONFIG: {
    DAILY_REFRESH_HOUR: number;
    WEEKLY_REFRESH_DAY: number;
    MAX_DAILY_TASKS: number;
    MAX_WEEKLY_TASKS: number;
};
export declare const ACHIEVEMENT_CONFIG: {
    MAX_DISPLAY_PER_CATEGORY: number;
};
export declare const RANK_ARCHIVE_CONFIG: {
    WEEKLY_ARCHIVE_DAY: number;
    WEEKLY_ARCHIVE_HOUR: number;
    MAX_ARCHIVED_WEEKS: number;
};
export declare function getDailyPeriodKey(date?: Date): string;
export declare function getWeeklyPeriodKey(date?: Date): string;
export declare function isNewWeek(lastRefresh: number): boolean;
export declare function isNewDay(lastRefresh: number): boolean;
