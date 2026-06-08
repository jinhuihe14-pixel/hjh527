import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { generateAdminToken, AdminInfo } from '../middleware/auth'
import { ItemRarity, ItemType, GameMode, TaskType, TaskConditionType, AchievementCategory, GameFeature } from '@nebula/shared'
import type { TaskConfig, AchievementConfig, FeatureConfig, ConfigBackup, GameplayStats } from '@nebula/shared'

interface User {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  level: number
  exp: number
  coins: number
  diamonds: number
  rankPoints: number
  rankTier: number
  wins: number
  losses: number
  winStreak: number
  gamesPlayed: number
  totalKills: number
  totalDeaths: number
  isBanned: boolean
  banReason?: string
  banEndTime?: number
  isMuted: boolean
  muteEndTime?: number
  createdAt: number
  lastLoginAt: number
  status: 'online' | 'offline' | 'playing'
}

interface ShopItem {
  id: string
  name: string
  description: string
  type: ItemType
  price: number
  currency: 'coins' | 'diamonds'
  rarity: ItemRarity
  isActive: boolean
  isHot: boolean
  isNew: boolean
  sortOrder: number
  stock: number
  attributes: Record<string, any>
  createdAt: number
  updatedAt: number
}

interface Season {
  id: string
  name: string
  description: string
  startTime: number
  endTime: number
  status: 'upcoming' | 'active' | 'ended'
  rewards: SeasonReward[]
  createdAt: number
}

interface SeasonReward {
  rankTier: number
  type: 'item' | 'currency' | 'title'
  itemId?: string
  amount?: number
  title?: string
}

interface GameRecord {
  id: string
  mode: GameMode
  map: string
  duration: number
  startTime: number
  endTime: number
  winnerTeam?: number
  players: GamePlayerStat[]
}

interface GamePlayerStat {
  playerId: string
  nickname: string
  team: number
  kills: number
  deaths: number
  assists: number
  damage: number
  score: number
  rankChange: number
  result: 'win' | 'lose' | 'draw'
}

interface AnticheatRecord {
  id: string
  playerId: string
  playerName: string
  cheatType: string
  cheatTypeName: string
  severity: number
  evidence: Record<string, any>
  gameId?: string
  timestamp: number
  handled: boolean
  handledBy?: string
  handledAt?: number
  punishment?: string
}

interface OperationResult {
  success: boolean
  message?: string
  itemId?: string
  seasonId?: string
}

interface AuditLogEntry {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: string
  targetId: string
  details: Record<string, any>
  ip?: string
  timestamp: number
}

interface AdminAccount {
  id: string
  username: string
  passwordHash: string
  nickname: string
  role: 'super_admin' | 'admin' | 'operator'
  permissions: string[]
  createdAt: number
  lastLoginAt: number
  isActive: boolean
}

export class AdminDataStore {
  private adminAccounts: Map<string, AdminAccount> = new Map()
  private users: Map<string, User> = new Map()
  private shopItems: Map<string, ShopItem> = new Map()
  private seasons: Map<string, Season> = new Map()
  private gameRecords: Map<string, GameRecord> = new Map()
  private anticheatRecords: Map<string, AnticheatRecord> = new Map()
  private auditLogs: AuditLogEntry[] = []
  private configs: Map<string, any> = new Map()
  private taskConfigs: Map<string, TaskConfig> = new Map()
  private achievementConfigs: Map<string, AchievementConfig> = new Map()
  private featureConfig: FeatureConfig = {
    [GameFeature.TASKS]: true,
    [GameFeature.ACHIEVEMENTS]: true,
    [GameFeature.WEEKLY_RANK]: true,
    [GameFeature.SHOP]: true,
    [GameFeature.RANKED]: true,
  }
  private configBackups: Map<string, ConfigBackup[]> = new Map()

  constructor() {
    this.initDefaultAdmins()
    this.initDefaultUsers()
    this.initDefaultShopItems()
    this.initDefaultSeasons()
    this.initDefaultGameRecords()
    this.initDefaultAnticheatRecords()
    this.initDefaultConfigs()
    this.initDefaultTasks()
    this.initDefaultAchievements()
  }

  private initDefaultAdmins() {
    const salt = bcrypt.genSaltSync(10)
    const passwordHash = bcrypt.hashSync('admin123', salt)

    this.adminAccounts.set('admin_001', {
      id: 'admin_001',
      username: 'admin',
      passwordHash,
      nickname: '超级管理员',
      role: 'super_admin',
      permissions: [],
      createdAt: Date.now(),
      lastLoginAt: 0,
      isActive: true,
    })

    const passwordHash2 = bcrypt.hashSync('operator123', salt)
    this.adminAccounts.set('admin_002', {
      id: 'admin_002',
      username: 'operator',
      passwordHash: passwordHash2,
      nickname: '运营人员',
      role: 'operator',
      permissions: ['user.view', 'shop.view', 'game.view'],
      createdAt: Date.now(),
      lastLoginAt: 0,
      isActive: true,
    })
  }

  private initDefaultUsers() {
    for (let i = 1; i <= 50; i++) {
      const id = `player_${i.toString().padStart(4, '0')}`
      const rankPoints = Math.floor(Math.random() * 5000) + 500
      const rankTier = Math.floor(rankPoints / 1000) + 1
      const wins = Math.floor(Math.random() * 200) + 10
      const losses = Math.floor(Math.random() * 200) + 10
      
      this.users.set(id, {
        id,
        username: `user_${i}`,
        nickname: ['星际猎手', '幻影刺客', '光速战机', '暗夜游侠', '量子追击', 
          '银河守护', '风暴之眼', '极光剑圣', '暗影刺客', '烈焰战士'][i % 10] + i,
        avatar: ['🚀', '⚔️', '🛡️', '💎', '🔥', '⚡', '🌙', '🌟', '🎯', '💀'][i % 10],
        email: `user_${i}@example.com`,
        phone: `138${String(10000000 + i).slice(0, 8)}`,
        level: Math.floor(Math.random() * 50) + 1,
        exp: Math.floor(Math.random() * 50000),
        coins: Math.floor(Math.random() * 100000),
        diamonds: Math.floor(Math.random() * 5000),
        rankPoints,
        rankTier,
        wins,
        losses,
        winStreak: Math.floor(Math.random() * 10),
        gamesPlayed: wins + losses,
        totalKills: Math.floor(Math.random() * 5000) + 100,
        totalDeaths: Math.floor(Math.random() * 3000) + 100,
        isBanned: false,
        isMuted: false,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        lastLoginAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        status: Math.random() > 0.7 ? 'online' : 'offline',
      })
    }
  }

  private initDefaultShopItems() {
    const items = [
      { id: 'item_health_potion', name: '生命药剂', type: ItemType.CONSUMABLE, price: 100, rarity: ItemRarity.COMMON },
      { id: 'item_energy_potion', name: '能量药剂', type: ItemType.CONSUMABLE, price: 80, rarity: ItemRarity.COMMON },
      { id: 'item_speed_boost', name: '加速卷轴', type: ItemType.CONSUMABLE, price: 200, rarity: ItemRarity.RARE },
      { id: 'item_damage_boost', name: '伤害增益', type: ItemType.CONSUMABLE, price: 250, rarity: ItemRarity.RARE },
      { id: 'skin_neon_blue', name: '霓虹蓝战机', type: ItemType.SKIN, price: 500, rarity: ItemRarity.RARE },
      { id: 'skin_cosmic_purple', name: '宇宙紫战机', type: ItemType.SKIN, price: 800, rarity: ItemRarity.EPIC },
      { id: 'skin_legendary_gold', name: '传奇黄金战机', type: ItemType.SKIN, price: 2000, rarity: ItemRarity.LEGENDARY },
      { id: 'trail_rainbow', name: '彩虹拖尾', type: ItemType.TRAIL, price: 500, rarity: ItemRarity.EPIC },
      { id: 'emote_thumbs_up', name: '点赞表情', type: ItemType.EMOTE, price: 150, rarity: ItemRarity.COMMON },
    ]

    items.forEach((item, index) => {
      this.shopItems.set(item.id, {
        ...item,
        description: `${item.name} - ${item.rarity}品质`,
        currency: 'coins',
        isActive: true,
        isHot: index < 3,
        isNew: index >= items.length - 2,
        sortOrder: index,
        stock: -1,
        attributes: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    })
  }

  private initDefaultSeasons() {
    this.seasons.set('season_001', {
      id: 'season_001',
      name: '第一赛季：星云启航',
      description: 'Nebula Arena首个赛季，开启你的星际征途！',
      startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
      status: 'active',
      rewards: [
        { rankTier: 1, type: 'currency', amount: 100 },
        { rankTier: 2, type: 'currency', amount: 200 },
        { rankTier: 3, type: 'currency', amount: 500 },
        { rankTier: 4, type: 'currency', amount: 1000 },
        { rankTier: 5, type: 'item', itemId: 'trail_rainbow', amount: 1 },
        { rankTier: 6, type: 'item', itemId: 'skin_cosmic_purple', amount: 1 },
        { rankTier: 7, type: 'title', title: '王者战神' },
      ],
      createdAt: Date.now(),
    })
  }

  private initDefaultGameRecords() {
    for (let i = 1; i <= 30; i++) {
      const gameId = `game_${i.toString().padStart(6, '0')}`
      const players: GamePlayerStat[] = []
      
      for (let j = 1; j <= 6; j++) {
        const team = j % 2 === 0 ? 1 : 0
        const isWin = Math.random() > 0.5
        players.push({
          playerId: `player_${(j + i).toString().padStart(4, '0')}`,
          nickname: `玩家${j + i}`,
          team,
          kills: Math.floor(Math.random() * 20),
          deaths: Math.floor(Math.random() * 15),
          assists: Math.floor(Math.random() * 10),
          damage: Math.floor(Math.random() * 3000) + 500,
          score: Math.floor(Math.random() * 1500) + 200,
          rankChange: isWin ? Math.floor(Math.random() * 20) + 5 : -Math.floor(Math.random() * 20) - 5,
          result: isWin ? 'win' : 'lose',
        })
      }

      this.gameRecords.set(gameId, {
        id: gameId,
        mode: [GameMode.QUICK, GameMode.RANKED][i % 2] as GameMode,
        map: '星云战场',
        duration: 180 + Math.floor(Math.random() * 120),
        startTime: Date.now() - i * 60 * 60 * 1000,
        endTime: Date.now() - i * 60 * 60 * 1000 + 300 * 1000,
        winnerTeam: Math.random() > 0.5 ? 0 : 1,
        players,
      })
    }
  }

  private initDefaultAnticheatRecords() {
    const cheatTypes = [
      { type: 'speed_hack', name: '加速作弊' },
      { type: 'damage_hack', name: '伤害篡改' },
      { type: 'frequency_hack', name: '高频攻击' },
      { type: 'teleport_hack', name: '瞬移作弊' },
      { type: 'god_mode', name: '锁血不死' },
    ]

    for (let i = 1; i <= 20; i++) {
      const cheat = cheatTypes[i % cheatTypes.length]
      this.anticheatRecords.set(`anticheat_${i}`, {
        id: `anticheat_${i}`,
        playerId: `player_${(10 + i).toString().padStart(4, '0')}`,
        playerName: `可疑玩家${i}`,
        cheatType: cheat.type,
        cheatTypeName: cheat.name,
        severity: Math.floor(Math.random() * 10) + 1,
        evidence: {
          abnormalValue: Math.floor(Math.random() * 1000),
          normalRange: '0-300',
          duration: Math.floor(Math.random() * 300) + '秒',
        },
        gameId: `game_${(100 + i).toString().padStart(6, '0')}`,
        timestamp: Date.now() - i * 2 * 60 * 60 * 1000,
        handled: i > 10,
        handledBy: i > 10 ? 'admin' : undefined,
        handledAt: i > 10 ? Date.now() - (i - 10) * 60 * 60 * 1000 : undefined,
        punishment: i > 10 ? (i > 15 ? '封禁7天' : '警告') : undefined,
      })
    }
  }

  private initDefaultConfigs() {
    this.configs.set('game', {
      tickRate: 20,
      gameDuration: 300,
      respawnTime: 3000,
      playerMaxHealth: 100,
      playerMaxEnergy: 100,
      playerSpeed: 200,
      bulletDamage: 10,
      bulletSpeed: 500,
    })

    this.configs.set('rank', {
      baseWinPoints: 20,
      baseLosePoints: -15,
      minWinPoints: 10,
      maxWinPoints: 30,
      minLosePoints: -25,
      maxLosePoints: -5,
      winStreakBonus: [0, 0, 2, 5, 8, 12, 15],
    })

    this.configs.set('match', {
      initialRange: 100,
      maxRange: 500,
      rangeIncreaseRate: 50,
      rangeIncreaseInterval: 5000,
      maxWaitTime: 120000,
      defaultPlayers: 6,
    })

    this.configs.set('anticheat', {
      maxMoveSpeed: 400,
      maxDamagePerHit: 50,
      maxInputsPerSecond: 60,
      minTeleportDistance: 200,
      godModeHealthThreshold: 95,
      godModeDuration: 30000,
      warningThreshold: 3,
      tempBanThreshold: 5,
      permBanThreshold: 10,
    })
  }

  async adminLogin(username: string, password: string) {
    for (const admin of this.adminAccounts.values()) {
      if (admin.username === username && admin.isActive) {
        const isValid = await bcrypt.compare(password, admin.passwordHash)
        if (isValid) {
          admin.lastLoginAt = Date.now()
          const adminInfo: AdminInfo = {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            nickname: admin.nickname,
            permissions: admin.permissions,
          }
          const token = generateAdminToken(adminInfo)
          return { success: true, token, admin: adminInfo }
        }
      }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  getUsers(params: { page: number; pageSize: number; search?: string; status?: string }) {
    let users = Array.from(this.users.values())

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      users = users.filter(u => 
        u.nickname.toLowerCase().includes(searchLower) ||
        u.id.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      )
    }

    if (params.status) {
      if (params.status === 'banned') {
        users = users.filter(u => u.isBanned)
      } else if (params.status === 'online') {
        users = users.filter(u => u.status === 'online')
      }
    }

    const total = users.length
    const start = (params.page - 1) * params.pageSize
    const list = users.slice(start, start + params.pageSize)

    return { list, total, page: params.page, pageSize: params.pageSize }
  }

  getUserDetail(userId: string) {
    return this.users.get(userId) || null
  }

  banUser(userId: string, reason: string, duration: number, adminId: string) {
    const user = this.users.get(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    user.isBanned = true
    user.banReason = reason
    if (duration > 0) {
      user.banEndTime = Date.now() + duration
    } else {
      user.banEndTime = -1
    }

    return { success: true }
  }

  unbanUser(userId: string, adminId: string) {
    const user = this.users.get(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    user.isBanned = false
    user.banReason = undefined
    user.banEndTime = undefined

    return { success: true }
  }

  muteUser(userId: string, reason: string, duration: number, adminId: string) {
    const user = this.users.get(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    user.isMuted = true
    user.muteEndTime = Date.now() + duration

    return { success: true }
  }

  rewardUser(userId: string, type: string, amount: number, reason: string, adminId: string) {
    const user = this.users.get(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (type === 'coins') {
      user.coins += amount
    } else if (type === 'diamonds') {
      user.diamonds += amount
    } else if (type === 'exp') {
      user.exp += amount
    }

    return { success: true }
  }

  getConfigs() {
    const result: Record<string, any> = {}
    this.configs.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  updateConfig(configKey: string, value: any, adminId: string) {
    if (!this.configs.has(configKey)) {
      return { success: false, message: '配置项不存在' }
    }

    this.configs.set(configKey, value)
    return { success: true }
  }

  getShopItems() {
    return Array.from(this.shopItems.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  addShopItem(item: Partial<ShopItem>, adminId: string): OperationResult {
    const id = `item_${Date.now()}`
    const newItem: ShopItem = {
      id,
      name: item.name || '',
      description: item.description || '',
      type: item.type || ItemType.CONSUMABLE,
      price: item.price || 0,
      currency: item.currency || 'coins',
      rarity: item.rarity || ItemRarity.COMMON,
      isActive: item.isActive !== undefined ? item.isActive : true,
      isHot: item.isHot || false,
      isNew: item.isNew || false,
      sortOrder: item.sortOrder || this.shopItems.size,
      stock: item.stock || -1,
      attributes: item.attributes || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.shopItems.set(id, newItem)
    return { success: true, itemId: id }
  }

  updateShopItem(itemId: string, updates: Partial<ShopItem>, adminId: string) {
    const item = this.shopItems.get(itemId)
    if (!item) {
      return { success: false, message: '商品不存在' }
    }

    Object.assign(item, updates, { updatedAt: Date.now() })
    return { success: true }
  }

  deleteShopItem(itemId: string, adminId: string) {
    if (!this.shopItems.has(itemId)) {
      return { success: false, message: '商品不存在' }
    }

    this.shopItems.delete(itemId)
    return { success: true }
  }

  getSeasons() {
    return Array.from(this.seasons.values())
  }

  addSeason(season: Partial<Season>, adminId: string): OperationResult {
    const id = `season_${Date.now()}`
    const newSeason: Season = {
      id,
      name: season.name || '',
      description: season.description || '',
      startTime: season.startTime || Date.now(),
      endTime: season.endTime || Date.now() + 90 * 24 * 60 * 60 * 1000,
      status: season.status || 'upcoming',
      rewards: season.rewards || [],
      createdAt: Date.now(),
    }

    this.seasons.set(id, newSeason)
    return { success: true, seasonId: id }
  }

  getGameRecords(params: { page: number; pageSize: number; mode?: string }) {
    let records = Array.from(this.gameRecords.values())

    if (params.mode) {
      records = records.filter(r => r.mode === params.mode)
    }

    records.sort((a, b) => b.startTime - a.startTime)

    const total = records.length
    const start = (params.page - 1) * params.pageSize
    const list = records.slice(start, start + params.pageSize)

    return { list, total, page: params.page, pageSize: params.pageSize }
  }

  getGameDetail(gameId: string) {
    return this.gameRecords.get(gameId) || null
  }

  getAnticheatRecords(params: { page: number; pageSize: number; type?: string }) {
    let records = Array.from(this.anticheatRecords.values())

    if (params.type) {
      records = records.filter(r => r.cheatType === params.type)
    }

    records.sort((a, b) => b.timestamp - a.timestamp)

    const total = records.length
    const start = (params.page - 1) * params.pageSize
    const list = records.slice(start, start + params.pageSize)

    return { list, total, page: params.page, pageSize: params.pageSize }
  }

  addAuditLog(adminId: string, action: string, targetType: string, targetId: string, details: Record<string, any>) {
    const admin = this.adminAccounts.get(adminId)
    const entry: AuditLogEntry = {
      id: uuidv4(),
      adminId,
      adminName: admin?.nickname || 'unknown',
      action,
      targetType,
      targetId,
      details,
      timestamp: Date.now(),
    }

    this.auditLogs.unshift(entry)
    if (this.auditLogs.length > 5000) {
      this.auditLogs = this.auditLogs.slice(0, 5000)
    }
  }

  getAuditLogs(params: { page: number; pageSize: number; action?: string; adminId?: string }) {
    let logs = [...this.auditLogs]

    if (params.action) {
      logs = logs.filter(l => l.action === params.action)
    }

    if (params.adminId) {
      logs = logs.filter(l => l.adminId === params.adminId)
    }

    const total = logs.length
    const start = (params.page - 1) * params.pageSize
    const list = logs.slice(start, start + params.pageSize)

    return { list, total, page: params.page, pageSize: params.pageSize }
  }

  private initDefaultTasks() {
    const dailyTasks = [
      {
        id: 'daily_login',
        name: '每日签到',
        description: '每日登录游戏',
        type: TaskType.DAILY,
        conditionType: TaskConditionType.LOGIN,
        targetValue: 1,
        rewards: [{ type: 'coins', amount: 100 }],
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'daily_play_3',
        name: '战斗达人',
        description: '完成3场对局',
        type: TaskType.DAILY,
        conditionType: TaskConditionType.PLAY_GAMES,
        targetValue: 3,
        rewards: [{ type: 'coins', amount: 200 }, { type: 'exp', amount: 50 }],
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 'daily_win_1',
        name: '首胜奖励',
        description: '获得1场胜利',
        type: TaskType.DAILY,
        conditionType: TaskConditionType.WIN_GAMES,
        targetValue: 1,
        rewards: [{ type: 'diamonds', amount: 10 }],
        sortOrder: 3,
        isActive: true,
      },
      {
        id: 'daily_kills_10',
        name: '收割者',
        description: '累计击败10名敌人',
        type: TaskType.DAILY,
        conditionType: TaskConditionType.GET_KILLS,
        targetValue: 10,
        rewards: [{ type: 'coins', amount: 150 }],
        sortOrder: 4,
        isActive: true,
      },
      {
        id: 'daily_damage_5000',
        name: '火力全开',
        description: '累计造成5000点伤害',
        type: TaskType.DAILY,
        conditionType: TaskConditionType.GET_DAMAGE,
        targetValue: 5000,
        rewards: [{ type: 'exp', amount: 100 }],
        sortOrder: 5,
        isActive: true,
      },
    ]

    const weeklyTasks = [
      {
        id: 'weekly_play_20',
        name: '周常战斗狂人',
        description: '本周完成20场对局',
        type: TaskType.WEEKLY,
        conditionType: TaskConditionType.PLAY_GAMES,
        targetValue: 20,
        rewards: [{ type: 'coins', amount: 1000 }, { type: 'diamonds', amount: 50 }],
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'weekly_win_10',
        name: '常胜将军',
        description: '本周获得10场胜利',
        type: TaskType.WEEKLY,
        conditionType: TaskConditionType.WIN_GAMES,
        targetValue: 10,
        rewards: [{ type: 'coins', amount: 800 }, { type: 'exp', amount: 300 }],
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 'weekly_kills_50',
        name: '百人斩',
        description: '本周累计击败50名敌人',
        type: TaskType.WEEKLY,
        conditionType: TaskConditionType.GET_KILLS,
        targetValue: 50,
        rewards: [{ type: 'diamonds', amount: 30 }],
        sortOrder: 3,
        isActive: true,
      },
      {
        id: 'weekly_rank_up',
        name: '进阶之路',
        description: '本周段位提升',
        type: TaskType.WEEKLY,
        conditionType: TaskConditionType.RANK_UP,
        targetValue: 1,
        rewards: [{ type: 'coins', amount: 500 }, { type: 'diamonds', amount: 20 }],
        sortOrder: 4,
        isActive: true,
      },
      {
        id: 'weekly_damage_30000',
        name: '毁灭者',
        description: '本周累计造成30000点伤害',
        type: TaskType.WEEKLY,
        conditionType: TaskConditionType.GET_DAMAGE,
        targetValue: 30000,
        rewards: [{ type: 'exp', amount: 500 }],
        sortOrder: 5,
        isActive: true,
      },
    ]

    const now = Date.now()
    ;[...dailyTasks, ...weeklyTasks].forEach((task) => {
      this.taskConfigs.set(task.id, {
        ...task,
        createdAt: now,
        updatedAt: now,
      } as TaskConfig)
    })
  }

  private initDefaultAchievements() {
    const achievements = [
      {
        id: 'ach_first_game',
        name: '初出茅庐',
        description: '完成第一场对局',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'play_games',
        targetValue: 1,
        rewards: [{ type: 'coins', amount: 200 }],
        badge: '🎮',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'ach_play_100',
        name: '身经百战',
        description: '累计完成100场对局',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'play_games',
        targetValue: 100,
        rewards: [{ type: 'coins', amount: 2000 }, { type: 'title', title: '百战老兵' }],
        badge: '⚔️',
        sortOrder: 2,
        isActive: true,
      },
      {
        id: 'ach_win_50',
        name: '常胜将军',
        description: '累计获得50场胜利',
        category: AchievementCategory.COMBAT,
        conditionType: 'win_games',
        targetValue: 50,
        rewards: [{ type: 'diamonds', amount: 100 }],
        badge: '🏆',
        sortOrder: 3,
        isActive: true,
      },
      {
        id: 'ach_kills_100',
        name: '百人斩',
        description: '累计击败100名敌人',
        category: AchievementCategory.COMBAT,
        conditionType: 'get_kills',
        targetValue: 100,
        rewards: [{ type: 'coins', amount: 1000 }],
        badge: '💀',
        sortOrder: 4,
        isActive: true,
      },
      {
        id: 'ach_kills_1000',
        name: '千人斩',
        description: '累计击败1000名敌人',
        category: AchievementCategory.COMBAT,
        conditionType: 'get_kills',
        targetValue: 1000,
        rewards: [{ type: 'diamonds', amount: 500 }, { type: 'title', title: '杀戮之王' }],
        badge: '☠️',
        sortOrder: 5,
        isActive: true,
      },
      {
        id: 'ach_damage_100000',
        name: '毁灭者',
        description: '累计造成100000点伤害',
        category: AchievementCategory.COMBAT,
        conditionType: 'get_damage',
        targetValue: 100000,
        rewards: [{ type: 'coins', amount: 3000 }],
        badge: '💥',
        sortOrder: 6,
        isActive: true,
      },
      {
        id: 'ach_rank_bronze',
        name: '青铜斗士',
        description: '达到青铜段位',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'rank_tier',
        targetValue: 1,
        rewards: [{ type: 'coins', amount: 300 }],
        badge: '🥉',
        sortOrder: 7,
        isActive: true,
      },
      {
        id: 'ach_rank_gold',
        name: '黄金战士',
        description: '达到黄金段位',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'rank_tier',
        targetValue: 3,
        rewards: [{ type: 'diamonds', amount: 200 }, { type: 'title', title: '黄金猎手' }],
        badge: '🥇',
        sortOrder: 8,
        isActive: true,
      },
      {
        id: 'ach_rank_diamond',
        name: '钻石精英',
        description: '达到钻石段位',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'rank_tier',
        targetValue: 5,
        rewards: [{ type: 'diamonds', amount: 500 }],
        badge: '💎',
        sortOrder: 9,
        isActive: true,
      },
      {
        id: 'ach_rank_master',
        name: '大师风范',
        description: '达到大师段位',
        category: AchievementCategory.PROGRESSION,
        conditionType: 'rank_tier',
        targetValue: 6,
        rewards: [{ type: 'diamonds', amount: 1000 }, { type: 'title', title: '星际大师' }],
        badge: '👑',
        sortOrder: 10,
        isActive: true,
      },
      {
        id: 'ach_collect_5_skins',
        name: '收藏家',
        description: '收集5个战机皮肤',
        category: AchievementCategory.COLLECTION,
        conditionType: 'collect_skins',
        targetValue: 5,
        rewards: [{ type: 'coins', amount: 1500 }],
        badge: '🎨',
        sortOrder: 11,
        isActive: true,
      },
      {
        id: 'ach_login_7_days',
        name: '坚持不懈',
        description: '连续登录7天',
        category: AchievementCategory.ACTIVITY,
        conditionType: 'consecutive_login',
        targetValue: 7,
        rewards: [{ type: 'diamonds', amount: 50 }],
        badge: '📅',
        sortOrder: 12,
        isActive: true,
      },
      {
        id: 'ach_login_30_days',
        name: '月度达人',
        description: '累计登录30天',
        category: AchievementCategory.ACTIVITY,
        conditionType: 'total_login',
        targetValue: 30,
        rewards: [{ type: 'coins', amount: 2000 }, { type: 'title', title: '月度达人' }],
        badge: '🌟',
        sortOrder: 13,
        isActive: true,
      },
      {
        id: 'ach_friends_10',
        name: '社交达人',
        description: '添加10个好友',
        category: AchievementCategory.SOCIAL,
        conditionType: 'add_friends',
        targetValue: 10,
        rewards: [{ type: 'coins', amount: 800 }],
        badge: '👥',
        sortOrder: 14,
        isActive: true,
      },
      {
        id: 'ach_win_streak_5',
        name: '五连胜',
        description: '连续获得5场胜利',
        category: AchievementCategory.COMBAT,
        conditionType: 'win_streak',
        targetValue: 5,
        rewards: [{ type: 'diamonds', amount: 80 }],
        badge: '🔥',
        sortOrder: 15,
        isActive: true,
      },
    ]

    const now = Date.now()
    achievements.forEach((ach) => {
      this.achievementConfigs.set(ach.id, {
        ...ach,
        createdAt: now,
      } as AchievementConfig)
    })
  }

  getTasks(params: { page?: number; pageSize?: number; type?: TaskType; isActive?: boolean }) {
    let tasks = Array.from(this.taskConfigs.values())

    if (params.type) {
      tasks = tasks.filter(t => t.type === params.type)
    }
    if (params.isActive !== undefined) {
      tasks = tasks.filter(t => t.isActive === params.isActive)
    }

    tasks.sort((a, b) => a.sortOrder - b.sortOrder)

    const total = tasks.length
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const list = tasks.slice(start, start + pageSize)

    return { list, total, page, pageSize }
  }

  getTaskDetail(taskId: string) {
    return this.taskConfigs.get(taskId) || null
  }

  addTask(task: Partial<TaskConfig>, adminId: string): OperationResult {
    const id = `task_${Date.now()}`
    const now = Date.now()
    const newTask: TaskConfig = {
      id,
      name: task.name || '',
      description: task.description || '',
      type: task.type || TaskType.DAILY,
      conditionType: task.conditionType || TaskConditionType.PLAY_GAMES,
      targetValue: task.targetValue || 1,
      rewards: task.rewards || [],
      sortOrder: task.sortOrder || this.taskConfigs.size,
      isActive: task.isActive !== undefined ? task.isActive : true,
      createdAt: now,
      updatedAt: now,
    }

    this.taskConfigs.set(id, newTask)

    this.addAuditLog(adminId, 'task_add', 'task', id, newTask)

    return { success: true, itemId: id }
  }

  updateTask(taskId: string, updates: Partial<TaskConfig>, adminId: string) {
    const task = this.taskConfigs.get(taskId)
    if (!task) {
      return { success: false, message: '任务不存在' }
    }

    Object.assign(task, updates, { updatedAt: Date.now() })

    this.addAuditLog(adminId, 'task_update', 'task', taskId, updates)

    return { success: true }
  }

  deleteTask(taskId: string, adminId: string) {
    if (!this.taskConfigs.has(taskId)) {
      return { success: false, message: '任务不存在' }
    }

    this.taskConfigs.delete(taskId)

    this.addAuditLog(adminId, 'task_delete', 'task', taskId, {})

    return { success: true }
  }

  getAchievements(params: { page?: number; pageSize?: number; category?: AchievementCategory; isActive?: boolean }) {
    let achievements = Array.from(this.achievementConfigs.values())

    if (params.category) {
      achievements = achievements.filter(a => a.category === params.category)
    }
    if (params.isActive !== undefined) {
      achievements = achievements.filter(a => a.isActive === params.isActive)
    }

    achievements.sort((a, b) => a.sortOrder - b.sortOrder)

    const total = achievements.length
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const list = achievements.slice(start, start + pageSize)

    return { list, total, page, pageSize }
  }

  getAchievementDetail(achievementId: string) {
    return this.achievementConfigs.get(achievementId) || null
  }

  addAchievement(achievement: Partial<AchievementConfig>, adminId: string): OperationResult {
    const id = `ach_${Date.now()}`
    const newAchievement: AchievementConfig = {
      id,
      name: achievement.name || '',
      description: achievement.description || '',
      category: achievement.category || AchievementCategory.PROGRESSION,
      conditionType: achievement.conditionType || 'play_games',
      targetValue: achievement.targetValue || 1,
      rewards: achievement.rewards || [],
      badge: achievement.badge,
      sortOrder: achievement.sortOrder || this.achievementConfigs.size,
      isActive: achievement.isActive !== undefined ? achievement.isActive : true,
      createdAt: Date.now(),
    }

    this.achievementConfigs.set(id, newAchievement)

    this.addAuditLog(adminId, 'achievement_add', 'achievement', id, newAchievement)

    return { success: true, itemId: id }
  }

  updateAchievement(achievementId: string, updates: Partial<AchievementConfig>, adminId: string) {
    const achievement = this.achievementConfigs.get(achievementId)
    if (!achievement) {
      return { success: false, message: '成就不存在' }
    }

    Object.assign(achievement, updates)

    this.addAuditLog(adminId, 'achievement_update', 'achievement', achievementId, updates)

    return { success: true }
  }

  deleteAchievement(achievementId: string, adminId: string) {
    if (!this.achievementConfigs.has(achievementId)) {
      return { success: false, message: '成就不存在' }
    }

    this.achievementConfigs.delete(achievementId)

    this.addAuditLog(adminId, 'achievement_delete', 'achievement', achievementId, {})

    return { success: true }
  }

  getFeatureConfig(): FeatureConfig {
    return { ...this.featureConfig }
  }

  updateFeatureConfig(config: Partial<FeatureConfig>, adminId: string): OperationResult {
    Object.assign(this.featureConfig, config)

    this.addAuditLog(adminId, 'feature_config_update', 'config', 'features', config)

    return { success: true }
  }

  getGameplayStats(): GameplayStats {
    const totalUsers = this.users.size
    const activeUsers = Math.floor(totalUsers * 0.6)
    const taskActiveUsers = Math.floor(activeUsers * 0.8)
    const achievementActiveUsers = Math.floor(activeUsers * 0.6)

    return {
      totalTasksCompleted: Math.floor(taskActiveUsers * 2.5),
      dailyTasksCompleted: Math.floor(taskActiveUsers * 1.8),
      weeklyTasksCompleted: Math.floor(taskActiveUsers * 0.7),
      totalAchievementsUnlocked: Math.floor(achievementActiveUsers * 3),
      activeTaskUsers: taskActiveUsers,
      activeAchievementUsers: achievementActiveUsers,
      taskCompletionRate: Math.floor((taskActiveUsers / totalUsers) * 100) / 100,
      achievementUnlockRate: Math.floor((achievementActiveUsers / totalUsers) * 100) / 100,
    }
  }

  backupConfig(configKey: string, data: Record<string, any>, adminId: string, note?: string): ConfigBackup {
    const backups = this.configBackups.get(configKey) || []
    const version = backups.length + 1
    const backup: ConfigBackup = {
      id: `backup_${Date.now()}`,
      configKey,
      version,
      data: JSON.parse(JSON.stringify(data)),
      createdAt: Date.now(),
      createdBy: adminId,
      note,
    }
    backups.unshift(backup)
    this.configBackups.set(configKey, backups)

    this.addAuditLog(adminId, 'config_backup', 'config', configKey, { version, note })

    return backup
  }

  getConfigBackups(configKey: string) {
    return this.configBackups.get(configKey) || []
  }

  getConfigBackupDetail(backupId: string): ConfigBackup | null {
    for (const backups of this.configBackups.values()) {
      const backup = backups.find(b => b.id === backupId)
      if (backup) return backup
    }
    return null
  }

  restoreConfigBackup(backupId: string, adminId: string) {
    const backup = this.getConfigBackupDetail(backupId)
    if (!backup) {
      return { success: false, message: '备份不存在' }
    }

    this.addAuditLog(adminId, 'config_restore', 'config', backup.configKey, { backupId })

    return { success: true, data: backup.data }
  }

  getStats() {
    const onlineUsers = Array.from(this.users.values()).filter(u => u.status === 'online').length
    const playingUsers = Array.from(this.users.values()).filter(u => u.status === 'playing').length
    const totalGames = this.gameRecords.size
    const totalBanned = Array.from(this.users.values()).filter(u => u.isBanned).length
    const todayGames = Math.floor(Math.random() * 500) + 100
    const todayNewUsers = Math.floor(Math.random() * 50) + 10
    const peakOnline = Math.floor(Math.random() * 2000) + 500

    const gameplayStats = this.getGameplayStats()

    return {
      totalUsers: this.users.size,
      onlineUsers,
      playingUsers,
      totalGames,
      todayGames,
      todayNewUsers,
      peakOnline,
      totalBanned,
      pendingAnticheat: Array.from(this.anticheatRecords.values()).filter(r => !r.handled).length,
      revenue: {
        today: Math.floor(Math.random() * 10000) + 5000,
        week: Math.floor(Math.random() * 70000) + 30000,
        month: Math.floor(Math.random() * 300000) + 100000,
      },
      gameplay: gameplayStats,
    }
  }
}

export const adminDataStore = new AdminDataStore()
