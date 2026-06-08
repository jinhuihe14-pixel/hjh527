export enum GameMode {
  QUICK = 'quick',
  RANKED = 'ranked',
  CUSTOM = 'custom',
  TEAM = 'team'
}

export enum RoomStatus {
  WAITING = 'waiting',
  READY = 'ready',
  PLAYING = 'playing',
  ENDED = 'ended'
}

export enum PlayerStatus {
  IDLE = 'idle',
  MATCHING = 'matching',
  IN_ROOM = 'in_room',
  PLAYING = 'playing'
}

export enum GameState {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  PLAYING = 'playing',
  ENDED = 'ended'
}

export enum RankTier {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3,
  PLATINUM = 4,
  DIAMOND = 5,
  MASTER = 6,
  CHALLENGER = 7
}

export enum ItemType {
  CONSUMABLE = 'consumable',
  SKIN = 'skin',
  EMOTE = 'emote',
  TRAIL = 'trail'
}

export enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum CheatType {
  SPEED_HACK = 'speed_hack',
  DAMAGE_HACK = 'damage_hack',
  FREQUENCY_HACK = 'frequency_hack',
  TELEPORT_HACK = 'teleport_hack',
  GOD_MODE = 'god_mode',
  DATA_TAMPERING = 'data_tampering'
}

export enum PunishmentLevel {
  WARNING = 1,
  INVALID_GAME = 2,
  TEMP_BAN = 3,
  PERMANENT_BAN = 4
}

export enum SkillType {
  DASH = 'dash',
  SHIELD = 'shield',
  MISSILE = 'missile',
  EMP = 'emp'
}

export enum EntityType {
  PLAYER = 'player',
  BULLET = 'bullet',
  POWERUP = 'powerup',
  OBSTACLE = 'obstacle'
}

export enum MessageType {
  PLAYER_INPUT = 'player_input',
  PLAYER_SKILL = 'player_skill',
  PLAYER_ITEM = 'player_item',
  PLAYER_CHAT = 'player_chat',
  HEARTBEAT = 'heartbeat',
  GAME_STATE = 'game_state',
  ENTITY_UPDATE = 'entity_update',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  KILL_EVENT = 'kill_event',
  DAMAGE_EVENT = 'damage_event',
  RECONNECT_STATE = 'reconnect_state',
  RECONNECT_REQUEST = 'reconnect_request',
  ROOM_INFO = 'room_info',
  PLAYER_READY = 'player_ready',
  MATCH_FOUND = 'match_found',
  SYNC_ACK = 'sync_ack'
}
