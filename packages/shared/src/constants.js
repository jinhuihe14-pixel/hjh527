"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANK_ARCHIVE_CONFIG = exports.ACHIEVEMENT_CONFIG = exports.TASK_CONFIG = exports.DEFAULT_FEATURE_CONFIG = exports.COLORS = exports.RECONNECT_CONFIG = exports.RANK_RULES = exports.ANTICHEAT_CONFIG = exports.MATCH_CONFIG = exports.RANK_CONFIG = exports.GAME_CONFIG = void 0;
exports.getRankTier = getRankTier;
exports.calculateRankChange = calculateRankChange;
exports.getDailyPeriodKey = getDailyPeriodKey;
exports.getWeeklyPeriodKey = getWeeklyPeriodKey;
exports.isNewWeek = isNewWeek;
exports.isNewDay = isNewDay;
const enums_1 = require("./enums");
exports.GAME_CONFIG = {
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
exports.RANK_CONFIG = {
    [enums_1.RankTier.BRONZE]: { name: '青铜', minPoints: 0, color: '#CD7F32' },
    [enums_1.RankTier.SILVER]: { name: '白银', minPoints: 1000, color: '#C0C0C0' },
    [enums_1.RankTier.GOLD]: { name: '黄金', minPoints: 2000, color: '#FFD700' },
    [enums_1.RankTier.PLATINUM]: { name: '铂金', minPoints: 3000, color: '#E5E4E2' },
    [enums_1.RankTier.DIAMOND]: { name: '钻石', minPoints: 4000, color: '#B9F2FF' },
    [enums_1.RankTier.MASTER]: { name: '大师', minPoints: 5000, color: '#9966CC' },
    [enums_1.RankTier.CHALLENGER]: { name: '王者', minPoints: 6000, color: '#FF4500' },
};
exports.MATCH_CONFIG = {
    SCAN_INTERVAL: 1000,
    INITIAL_RANGE: 100,
    MAX_RANGE: 500,
    RANGE_INCREASE_RATE: 50,
    RANGE_INCREASE_INTERVAL: 5000,
    MAX_WAIT_TIME: 120000,
    DEFAULT_PLAYERS: 6,
};
exports.ANTICHEAT_CONFIG = {
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
exports.RANK_RULES = {
    BASE_WIN_POINTS: 20,
    BASE_LOSE_POINTS: -15,
    MIN_WIN_POINTS: 10,
    MAX_WIN_POINTS: 30,
    MIN_LOSE_POINTS: -25,
    MAX_LOSE_POINTS: -5,
    WIN_STREAK_BONUS: [0, 0, 2, 5, 8, 12, 15],
    RANK_DIFF_MULTIPLIER: 0.1,
};
exports.RECONNECT_CONFIG = {
    HEARTBEAT_INTERVAL: 5000,
    DISCONNECT_TIMEOUT: 15000,
    RECONNECT_WINDOW: 30000,
    MAX_RECONNECT_ATTEMPTS: 5,
};
exports.COLORS = {
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
function getRankTier(points) {
    if (points >= 6000)
        return enums_1.RankTier.CHALLENGER;
    if (points >= 5000)
        return enums_1.RankTier.MASTER;
    if (points >= 4000)
        return enums_1.RankTier.DIAMOND;
    if (points >= 3000)
        return enums_1.RankTier.PLATINUM;
    if (points >= 2000)
        return enums_1.RankTier.GOLD;
    if (points >= 1000)
        return enums_1.RankTier.SILVER;
    return enums_1.RankTier.BRONZE;
}
function calculateRankChange(playerPoints, opponentAvgPoints, isWin, winStreak, mode) {
    if (mode !== enums_1.GameMode.RANKED)
        return 0;
    const pointDiff = opponentAvgPoints - playerPoints;
    const diffMultiplier = 1 + (pointDiff * exports.RANK_RULES.RANK_DIFF_MULTIPLIER) / 100;
    let baseChange = isWin ? exports.RANK_RULES.BASE_WIN_POINTS : exports.RANK_RULES.BASE_LOSE_POINTS;
    baseChange = Math.round(baseChange * diffMultiplier);
    if (isWin && winStreak >= 2) {
        const streakBonus = exports.RANK_RULES.WIN_STREAK_BONUS[Math.min(winStreak, exports.RANK_RULES.WIN_STREAK_BONUS.length - 1)];
        baseChange += streakBonus;
    }
    if (isWin) {
        baseChange = Math.max(exports.RANK_RULES.MIN_WIN_POINTS, Math.min(exports.RANK_RULES.MAX_WIN_POINTS, baseChange));
    }
    else {
        baseChange = Math.max(exports.RANK_RULES.MIN_LOSE_POINTS, Math.min(exports.RANK_RULES.MAX_LOSE_POINTS, baseChange));
    }
    return baseChange;
}
exports.DEFAULT_FEATURE_CONFIG = {
    [enums_1.GameFeature.TASKS]: true,
    [enums_1.GameFeature.ACHIEVEMENTS]: true,
    [enums_1.GameFeature.WEEKLY_RANK]: true,
    [enums_1.GameFeature.SHOP]: true,
    [enums_1.GameFeature.RANKED]: true,
};
exports.TASK_CONFIG = {
    DAILY_REFRESH_HOUR: 0,
    WEEKLY_REFRESH_DAY: 1,
    MAX_DAILY_TASKS: 5,
    MAX_WEEKLY_TASKS: 5,
};
exports.ACHIEVEMENT_CONFIG = {
    MAX_DISPLAY_PER_CATEGORY: 20,
};
exports.RANK_ARCHIVE_CONFIG = {
    WEEKLY_ARCHIVE_DAY: 1,
    WEEKLY_ARCHIVE_HOUR: 0,
    MAX_ARCHIVED_WEEKS: 52,
};
function getDailyPeriodKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function getWeeklyPeriodKey(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    return `${year}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
}
function isNewWeek(lastRefresh) {
    const now = new Date();
    const last = new Date(lastRefresh);
    const nowWeek = getWeeklyPeriodKey(now);
    const lastWeek = getWeeklyPeriodKey(last);
    return nowWeek !== lastWeek;
}
function isNewDay(lastRefresh) {
    const now = new Date();
    const last = new Date(lastRefresh);
    const nowDay = getDailyPeriodKey(now);
    const lastDay = getDailyPeriodKey(last);
    return nowDay !== lastDay;
}
