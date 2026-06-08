"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameFeature = exports.LeaderboardType = exports.AchievementStatus = exports.AchievementCategory = exports.TaskConditionType = exports.TaskStatus = exports.TaskType = exports.MessageType = exports.EntityType = exports.SkillType = exports.PunishmentLevel = exports.CheatType = exports.ItemRarity = exports.ItemType = exports.RankTier = exports.GameState = exports.PlayerStatus = exports.RoomStatus = exports.GameMode = void 0;
var GameMode;
(function (GameMode) {
    GameMode["QUICK"] = "quick";
    GameMode["RANKED"] = "ranked";
    GameMode["CUSTOM"] = "custom";
    GameMode["TEAM"] = "team";
})(GameMode || (exports.GameMode = GameMode = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["WAITING"] = "waiting";
    RoomStatus["READY"] = "ready";
    RoomStatus["PLAYING"] = "playing";
    RoomStatus["ENDED"] = "ended";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["IDLE"] = "idle";
    PlayerStatus["MATCHING"] = "matching";
    PlayerStatus["IN_ROOM"] = "in_room";
    PlayerStatus["PLAYING"] = "playing";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
var GameState;
(function (GameState) {
    GameState["WAITING"] = "waiting";
    GameState["COUNTDOWN"] = "countdown";
    GameState["PLAYING"] = "playing";
    GameState["ENDED"] = "ended";
})(GameState || (exports.GameState = GameState = {}));
var RankTier;
(function (RankTier) {
    RankTier[RankTier["BRONZE"] = 1] = "BRONZE";
    RankTier[RankTier["SILVER"] = 2] = "SILVER";
    RankTier[RankTier["GOLD"] = 3] = "GOLD";
    RankTier[RankTier["PLATINUM"] = 4] = "PLATINUM";
    RankTier[RankTier["DIAMOND"] = 5] = "DIAMOND";
    RankTier[RankTier["MASTER"] = 6] = "MASTER";
    RankTier[RankTier["CHALLENGER"] = 7] = "CHALLENGER";
})(RankTier || (exports.RankTier = RankTier = {}));
var ItemType;
(function (ItemType) {
    ItemType["CONSUMABLE"] = "consumable";
    ItemType["SKIN"] = "skin";
    ItemType["EMOTE"] = "emote";
    ItemType["TRAIL"] = "trail";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "common";
    ItemRarity["RARE"] = "rare";
    ItemRarity["EPIC"] = "epic";
    ItemRarity["LEGENDARY"] = "legendary";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
var CheatType;
(function (CheatType) {
    CheatType["SPEED_HACK"] = "speed_hack";
    CheatType["DAMAGE_HACK"] = "damage_hack";
    CheatType["FREQUENCY_HACK"] = "frequency_hack";
    CheatType["TELEPORT_HACK"] = "teleport_hack";
    CheatType["GOD_MODE"] = "god_mode";
    CheatType["DATA_TAMPERING"] = "data_tampering";
})(CheatType || (exports.CheatType = CheatType = {}));
var PunishmentLevel;
(function (PunishmentLevel) {
    PunishmentLevel[PunishmentLevel["WARNING"] = 1] = "WARNING";
    PunishmentLevel[PunishmentLevel["INVALID_GAME"] = 2] = "INVALID_GAME";
    PunishmentLevel[PunishmentLevel["TEMP_BAN"] = 3] = "TEMP_BAN";
    PunishmentLevel[PunishmentLevel["PERMANENT_BAN"] = 4] = "PERMANENT_BAN";
})(PunishmentLevel || (exports.PunishmentLevel = PunishmentLevel = {}));
var SkillType;
(function (SkillType) {
    SkillType["DASH"] = "dash";
    SkillType["SHIELD"] = "shield";
    SkillType["MISSILE"] = "missile";
    SkillType["EMP"] = "emp";
})(SkillType || (exports.SkillType = SkillType = {}));
var EntityType;
(function (EntityType) {
    EntityType["PLAYER"] = "player";
    EntityType["BULLET"] = "bullet";
    EntityType["POWERUP"] = "powerup";
    EntityType["OBSTACLE"] = "obstacle";
})(EntityType || (exports.EntityType = EntityType = {}));
var MessageType;
(function (MessageType) {
    MessageType["PLAYER_INPUT"] = "player_input";
    MessageType["PLAYER_SKILL"] = "player_skill";
    MessageType["PLAYER_ITEM"] = "player_item";
    MessageType["PLAYER_CHAT"] = "player_chat";
    MessageType["HEARTBEAT"] = "heartbeat";
    MessageType["GAME_STATE"] = "game_state";
    MessageType["ENTITY_UPDATE"] = "entity_update";
    MessageType["PLAYER_JOINED"] = "player_joined";
    MessageType["PLAYER_LEFT"] = "player_left";
    MessageType["GAME_START"] = "game_start";
    MessageType["GAME_END"] = "game_end";
    MessageType["KILL_EVENT"] = "kill_event";
    MessageType["DAMAGE_EVENT"] = "damage_event";
    MessageType["RECONNECT_STATE"] = "reconnect_state";
    MessageType["RECONNECT_REQUEST"] = "reconnect_request";
    MessageType["ROOM_INFO"] = "room_info";
    MessageType["PLAYER_READY"] = "player_ready";
    MessageType["MATCH_FOUND"] = "match_found";
    MessageType["SYNC_ACK"] = "sync_ack";
})(MessageType || (exports.MessageType = MessageType = {}));
var TaskType;
(function (TaskType) {
    TaskType["DAILY"] = "daily";
    TaskType["WEEKLY"] = "weekly";
})(TaskType || (exports.TaskType = TaskType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CLAIMED"] = "claimed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskConditionType;
(function (TaskConditionType) {
    TaskConditionType["PLAY_GAMES"] = "play_games";
    TaskConditionType["WIN_GAMES"] = "win_games";
    TaskConditionType["GET_KILLS"] = "get_kills";
    TaskConditionType["GET_DAMAGE"] = "get_damage";
    TaskConditionType["LOGIN"] = "login";
    TaskConditionType["RANK_UP"] = "rank_up";
    TaskConditionType["COLLECT_ITEMS"] = "collect_items";
    TaskConditionType["PLAY_WITH_FRIENDS"] = "play_with_friends";
})(TaskConditionType || (exports.TaskConditionType = TaskConditionType = {}));
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["PROGRESSION"] = "progression";
    AchievementCategory["COLLECTION"] = "collection";
    AchievementCategory["COMBAT"] = "combat";
    AchievementCategory["SOCIAL"] = "social";
    AchievementCategory["ACTIVITY"] = "activity";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var AchievementStatus;
(function (AchievementStatus) {
    AchievementStatus["LOCKED"] = "locked";
    AchievementStatus["UNLOCKED"] = "unlocked";
    AchievementStatus["CLAIMED"] = "claimed";
})(AchievementStatus || (exports.AchievementStatus = AchievementStatus = {}));
var LeaderboardType;
(function (LeaderboardType) {
    LeaderboardType["GLOBAL"] = "global";
    LeaderboardType["WEEKLY"] = "weekly";
})(LeaderboardType || (exports.LeaderboardType = LeaderboardType = {}));
var GameFeature;
(function (GameFeature) {
    GameFeature["TASKS"] = "tasks";
    GameFeature["ACHIEVEMENTS"] = "achievements";
    GameFeature["WEEKLY_RANK"] = "weekly_rank";
    GameFeature["SHOP"] = "shop";
    GameFeature["RANKED"] = "ranked";
})(GameFeature || (exports.GameFeature = GameFeature = {}));
