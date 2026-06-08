export declare enum GameMode {
    QUICK = "quick",
    RANKED = "ranked",
    CUSTOM = "custom",
    TEAM = "team"
}
export declare enum RoomStatus {
    WAITING = "waiting",
    READY = "ready",
    PLAYING = "playing",
    ENDED = "ended"
}
export declare enum PlayerStatus {
    IDLE = "idle",
    MATCHING = "matching",
    IN_ROOM = "in_room",
    PLAYING = "playing"
}
export declare enum GameState {
    WAITING = "waiting",
    COUNTDOWN = "countdown",
    PLAYING = "playing",
    ENDED = "ended"
}
export declare enum RankTier {
    BRONZE = 1,
    SILVER = 2,
    GOLD = 3,
    PLATINUM = 4,
    DIAMOND = 5,
    MASTER = 6,
    CHALLENGER = 7
}
export declare enum ItemType {
    CONSUMABLE = "consumable",
    SKIN = "skin",
    EMOTE = "emote",
    TRAIL = "trail"
}
export declare enum ItemRarity {
    COMMON = "common",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
export declare enum CheatType {
    SPEED_HACK = "speed_hack",
    DAMAGE_HACK = "damage_hack",
    FREQUENCY_HACK = "frequency_hack",
    TELEPORT_HACK = "teleport_hack",
    GOD_MODE = "god_mode",
    DATA_TAMPERING = "data_tampering"
}
export declare enum PunishmentLevel {
    WARNING = 1,
    INVALID_GAME = 2,
    TEMP_BAN = 3,
    PERMANENT_BAN = 4
}
export declare enum SkillType {
    DASH = "dash",
    SHIELD = "shield",
    MISSILE = "missile",
    EMP = "emp"
}
export declare enum EntityType {
    PLAYER = "player",
    BULLET = "bullet",
    POWERUP = "powerup",
    OBSTACLE = "obstacle"
}
export declare enum MessageType {
    PLAYER_INPUT = "player_input",
    PLAYER_SKILL = "player_skill",
    PLAYER_ITEM = "player_item",
    PLAYER_CHAT = "player_chat",
    HEARTBEAT = "heartbeat",
    GAME_STATE = "game_state",
    ENTITY_UPDATE = "entity_update",
    PLAYER_JOINED = "player_joined",
    PLAYER_LEFT = "player_left",
    GAME_START = "game_start",
    GAME_END = "game_end",
    KILL_EVENT = "kill_event",
    DAMAGE_EVENT = "damage_event",
    RECONNECT_STATE = "reconnect_state",
    RECONNECT_REQUEST = "reconnect_request",
    ROOM_INFO = "room_info",
    PLAYER_READY = "player_ready",
    MATCH_FOUND = "match_found",
    SYNC_ACK = "sync_ack"
}
export declare enum TaskType {
    DAILY = "daily",
    WEEKLY = "weekly"
}
export declare enum TaskStatus {
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CLAIMED = "claimed"
}
export declare enum TaskConditionType {
    PLAY_GAMES = "play_games",
    WIN_GAMES = "win_games",
    GET_KILLS = "get_kills",
    GET_DAMAGE = "get_damage",
    LOGIN = "login",
    RANK_UP = "rank_up",
    COLLECT_ITEMS = "collect_items",
    PLAY_WITH_FRIENDS = "play_with_friends"
}
export declare enum AchievementCategory {
    PROGRESSION = "progression",
    COLLECTION = "collection",
    COMBAT = "combat",
    SOCIAL = "social",
    ACTIVITY = "activity"
}
export declare enum AchievementStatus {
    LOCKED = "locked",
    UNLOCKED = "unlocked",
    CLAIMED = "claimed"
}
export declare enum LeaderboardType {
    GLOBAL = "global",
    WEEKLY = "weekly"
}
export declare enum GameFeature {
    TASKS = "tasks",
    ACHIEVEMENTS = "achievements",
    WEEKLY_RANK = "weekly_rank",
    SHOP = "shop",
    RANKED = "ranked"
}
