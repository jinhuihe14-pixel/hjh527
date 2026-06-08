import { v4 as uuidv4 } from 'uuid';
import {
  RankTier,
  ItemType,
  ItemRarity,
  ShopItem,
  InventoryItem,
  RankRecord,
  LeaderboardEntry,
  SeasonInfo,
  SeasonReward,
  PlayerGameStats,
  TaskConfig,
  TaskReward,
  PlayerTask,
  AchievementConfig,
  AchievementReward,
  PlayerAchievement,
  WeeklyRankEntry,
  RankArchive,
  GameplayStats,
  FeatureConfig,
  ConfigBackup,
  TaskType,
  TaskStatus,
  TaskConditionType,
  AchievementCategory,
  AchievementStatus,
  LeaderboardType,
  GameFeature,
} from '@nebula/shared';
import {
  getRankTier,
  getDailyPeriodKey,
  getWeeklyPeriodKey,
  isNewDay,
  isNewWeek,
  DEFAULT_FEATURE_CONFIG,
} from '@nebula/shared';

interface User {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar: string;
  level: number;
  exp: number;
  coins: number;
  diamonds: number;
  vipLevel: number;
  createdAt: number;
  updatedAt: number;
  lastLogin: number;
  status: 'active' | 'banned' | 'muted';
  banEndTime?: number;
  muteEndTime?: number;
}

interface GameRecord {
  id: string;
  gameId: string;
  mode: string;
  map: string;
  playerCount: number;
  duration: number;
  startTime: number;
  endTime: number;
  result: string;
}

interface PlayerGameRecord {
  id: string;
  gameId: string;
  userId: string;
  team: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  score: number;
  rankChange: number;
  result: 'win' | 'lose' | 'draw';
}

export class DataStore {
  private users: Map<string, User> = new Map();
  private usernameIndex: Map<string, string> = new Map();
  private inventories: Map<string, Map<string, InventoryItem>> = new Map();
  private rankRecords: Map<string, RankRecord> = new Map();
  private leaderboard: string[] = [];
  private shopItems: ShopItem[] = [];
  private seasons: SeasonInfo[] = [];
  private gameRecords: GameRecord[] = [];
  private playerGameRecords: PlayerGameRecord[] = [];
  private taskConfigs: Map<string, TaskConfig> = new Map();
  private playerTasks: Map<string, Map<string, PlayerTask>> = new Map();
  private achievementConfigs: Map<string, AchievementConfig> = new Map();
  private playerAchievements: Map<string, Map<string, PlayerAchievement>> = new Map();
  private weeklyRankPoints: Map<string, number> = new Map();
  private weeklyRankWins: Map<string, number> = new Map();
  private rankArchives: RankArchive[] = [];
  private featureConfig: FeatureConfig = { ...DEFAULT_FEATURE_CONFIG };
  private configBackups: Map<string, ConfigBackup[]> = new Map();
  private lastDailyRefresh: number = 0;
  private lastWeeklyRefresh: number = 0;

  constructor() {
    this.initShopItems();
    this.initCurrentSeason();
    this.createTestUser();
    this.initTaskConfigs();
    this.initAchievementConfigs();
    this.refreshDailyTasks();
    this.refreshWeeklyTasks();
  }

  private initShopItems(): void {
    this.shopItems = [
      {
        id: 'item_health_potion',
        name: '生命药剂',
        description: '使用后立即恢复50点生命值',
        type: ItemType.CONSUMABLE,
        price: 100,
        currency: 'coins',
        rarity: ItemRarity.COMMON,
        isActive: true,
        attributes: { healAmount: 50 },
      },
      {
        id: 'item_energy_potion',
        name: '能量药剂',
        description: '使用后立即恢复50点能量',
        type: ItemType.CONSUMABLE,
        price: 80,
        currency: 'coins',
        rarity: ItemRarity.COMMON,
        isActive: true,
        attributes: { energyAmount: 50 },
      },
      {
        id: 'item_speed_boost',
        name: '加速卷轴',
        description: '战斗中移动速度提升20%，持续10秒',
        type: ItemType.CONSUMABLE,
        price: 200,
        currency: 'coins',
        rarity: ItemRarity.RARE,
        isActive: true,
        attributes: { speedBoost: 0.2, duration: 10000 },
      },
      {
        id: 'skin_neon_blue',
        name: '霓虹蓝战机',
        description: '炫酷的霓虹蓝色战机皮肤',
        type: ItemType.SKIN,
        price: 500,
        currency: 'coins',
        rarity: ItemRarity.RARE,
        isActive: true,
        attributes: { color: '#00f0ff', trail: 'neon' },
      },
      {
        id: 'skin_cosmic_purple',
        name: '宇宙紫战机',
        description: '神秘的宇宙紫色战机皮肤',
        type: ItemType.SKIN,
        price: 800,
        currency: 'coins',
        rarity: ItemRarity.EPIC,
        isActive: true,
        attributes: { color: '#8b5cf6', trail: 'cosmic' },
      },
      {
        id: 'skin_legendary_gold',
        name: '传奇黄金战机',
        description: '稀有的传奇黄金战机皮肤',
        type: ItemType.SKIN,
        price: 2000,
        currency: 'coins',
        rarity: ItemRarity.LEGENDARY,
        isActive: true,
        attributes: { color: '#ffd700', trail: 'golden' },
      },
    ];
  }

  private initCurrentSeason(): void {
    const now = Date.now();
    const seasonDuration = 90 * 24 * 60 * 60 * 1000; // 90天

    this.seasons = [
      {
        id: 'season_s1',
        name: '第一赛季：星云启航',
        startTime: now - 30 * 24 * 60 * 60 * 1000,
        endTime: now + seasonDuration,
        status: 'active',
        rewards: [
          { rankTier: RankTier.BRONZE, type: 'currency', amount: 100 },
          { rankTier: RankTier.SILVER, type: 'currency', amount: 300 },
          { rankTier: RankTier.GOLD, type: 'currency', amount: 800 },
          { rankTier: RankTier.PLATINUM, type: 'item', itemId: 'skin_cosmic_purple', amount: 1 },
          { rankTier: RankTier.DIAMOND, type: 'item', itemId: 'skin_legendary_gold', amount: 1 },
          { rankTier: RankTier.MASTER, type: 'title', title: '赛季大师' },
          { rankTier: RankTier.CHALLENGER, type: 'title', title: '赛季王者' },
        ],
      },
    ];
  }

  private createTestUser(): void {
    const testUser: User = {
      id: 'test_user_001',
      username: 'testplayer',
      passwordHash: 'test123',
      nickname: '测试玩家',
      avatar: '🎮',
      level: 5,
      exp: 2500,
      coins: 5000,
      diamonds: 100,
      vipLevel: 0,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now(),
      lastLogin: Date.now(),
      status: 'active',
    };

    this.users.set(testUser.id, testUser);
    this.usernameIndex.set(testUser.username, testUser.id);

    this.rankRecords.set(testUser.id, {
      userId: testUser.id,
      seasonId: 'season_s1',
      rankTier: RankTier.SILVER,
      rankPoints: 1250,
      highestTier: RankTier.SILVER,
      highestPoints: 1250,
      winStreak: 0,
      gamesPlayed: 15,
      wins: 8,
      losses: 7,
    });

    const inventory = new Map<string, InventoryItem>();
    inventory.set('item_health_potion', {
      itemId: 'item_health_potion',
      count: 5,
      obtainedAt: Date.now() - 86400000,
    });
    inventory.set('item_energy_potion', {
      itemId: 'item_energy_potion',
      count: 3,
      obtainedAt: Date.now() - 86400000,
    });
    this.inventories.set(testUser.id, inventory);
  }

  createUser(username: string, passwordHash: string, nickname: string): User {
    const id = uuidv4();
    const user: User = {
      id,
      username,
      passwordHash,
      nickname,
      avatar: '🚀',
      level: 1,
      exp: 0,
      coins: 1000,
      diamonds: 0,
      vipLevel: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
      status: 'active',
    };

    this.users.set(id, user);
    this.usernameIndex.set(username, id);

    this.rankRecords.set(id, {
      userId: id,
      seasonId: this.getCurrentSeasonId(),
      rankTier: RankTier.BRONZE,
      rankPoints: 0,
      highestTier: RankTier.BRONZE,
      highestPoints: 0,
      winStreak: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    });

    this.inventories.set(id, new Map());

    return user;
  }

  createGuestUser(): { user: User; token: string } {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const id = uuidv4();
    const nickname = `游客${Math.floor(10000 + Math.random() * 90000)}`;

    const user: User = {
      id,
      username: guestId,
      passwordHash: '',
      nickname,
      avatar: '👾',
      level: 1,
      exp: 0,
      coins: 500,
      diamonds: 0,
      vipLevel: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
      status: 'active',
    };

    this.users.set(id, user);

    this.rankRecords.set(id, {
      userId: id,
      seasonId: this.getCurrentSeasonId(),
      rankTier: RankTier.BRONZE,
      rankPoints: 0,
      highestTier: RankTier.BRONZE,
      highestPoints: 0,
      winStreak: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    });

    this.inventories.set(id, new Map());

    return { user, token: id };
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByUsername(username: string): User | undefined {
    const userId = this.usernameIndex.get(username);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    Object.assign(user, updates, { updatedAt: Date.now() });
    return user;
  }

  getUserCount(): number {
    return this.users.size;
  }

  getRankRecord(userId: string): RankRecord | undefined {
    return this.rankRecords.get(userId);
  }

  updateRankPoints(userId: string, pointsChange: number, isWin: boolean): RankRecord | undefined {
    const record = this.rankRecords.get(userId);
    if (!record) return undefined;

    record.rankPoints = Math.max(0, record.rankPoints + pointsChange);
    record.rankTier = getRankTier(record.rankPoints);
    record.gamesPlayed++;

    if (isWin) {
      record.wins++;
      record.winStreak++;
    } else {
      record.losses++;
      record.winStreak = 0;
    }

    if (record.rankPoints > record.highestPoints) {
      record.highestPoints = record.rankPoints;
      record.highestTier = record.rankTier;
    }

    this.updateLeaderboard();

    return record;
  }

  private updateLeaderboard(): void {
    const entries = Array.from(this.rankRecords.values()).sort(
      (a, b) => b.rankPoints - a.rankPoints
    );
    this.leaderboard = entries.map((e) => e.userId);
  }

  getLeaderboard(limit: number = 100, offset: number = 0): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (let i = offset; i < Math.min(offset + limit, this.leaderboard.length); i++) {
      const userId = this.leaderboard[i];
      const user = this.users.get(userId);
      const rankRecord = this.rankRecords.get(userId);

      if (user && rankRecord) {
        const winRate = rankRecord.gamesPlayed > 0
          ? Math.round((rankRecord.wins / rankRecord.gamesPlayed) * 100) / 100
          : 0;

        entries.push({
          rank: i + 1,
          userId,
          nickname: user.nickname,
          avatar: user.avatar,
          rankTier: rankRecord.rankTier,
          rankPoints: rankRecord.rankPoints,
          winRate,
        });
      }
    }

    return entries;
  }

  getUserRank(userId: string): number {
    return this.leaderboard.indexOf(userId) + 1;
  }

  getShopItems(): ShopItem[] {
    return this.shopItems.filter((item) => item.isActive);
  }

  getShopItem(itemId: string): ShopItem | undefined {
    return this.shopItems.find((item) => item.id === itemId && item.isActive);
  }

  getInventory(userId: string): Map<string, InventoryItem> {
    let inventory = this.inventories.get(userId);
    if (!inventory) {
      inventory = new Map();
      this.inventories.set(userId, inventory);
    }
    return inventory;
  }

  addItemToInventory(userId: string, itemId: string, count: number = 1): boolean {
    const inventory = this.getInventory(userId);
    const existing = inventory.get(itemId);

    if (existing) {
      existing.count += count;
    } else {
      inventory.set(itemId, {
        itemId,
        count,
        obtainedAt: Date.now(),
      });
    }

    return true;
  }

  removeItemFromInventory(userId: string, itemId: string, count: number = 1): boolean {
    const inventory = this.getInventory(userId);
    const existing = inventory.get(itemId);

    if (!existing || existing.count < count) {
      return false;
    }

    existing.count -= count;
    if (existing.count <= 0) {
      inventory.delete(itemId);
    }

    return true;
  }

  getCurrentSeason(): SeasonInfo | undefined {
    return this.seasons.find((s) => s.status === 'active');
  }

  getCurrentSeasonId(): string {
    return this.getCurrentSeason()?.id || 'season_s1';
  }

  getAllSeasons(): SeasonInfo[] {
    return this.seasons;
  }

  addCoins(userId: string, amount: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.coins = Math.max(0, user.coins + amount);
    return true;
  }

  addDiamonds(userId: string, amount: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.diamonds = Math.max(0, user.diamonds + amount);
    return true;
  }

  banUser(userId: string, duration?: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = 'banned';
    if (duration) {
      user.banEndTime = Date.now() + duration;
    }
    return true;
  }

  unbanUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = 'active';
    user.banEndTime = undefined;
    return true;
  }

  muteUser(userId: string, duration: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = 'muted';
    user.muteEndTime = Date.now() + duration;
    return true;
  }

  recordGame(gameData: any, playerStats: PlayerGameStats[]): string {
    const gameId = uuidv4();

    this.gameRecords.push({
      id: uuidv4(),
      gameId,
      mode: gameData.mode,
      map: gameData.map || 'default',
      playerCount: playerStats.length,
      duration: gameData.duration || 0,
      startTime: gameData.startTime || Date.now(),
      endTime: gameData.endTime || Date.now(),
      result: gameData.result || '',
    });

    for (const stat of playerStats) {
      this.playerGameRecords.push({
        id: uuidv4(),
        gameId,
        userId: stat.playerId,
        team: stat.team,
        kills: stat.kills,
        deaths: stat.deaths,
        assists: stat.assists,
        damage: stat.damage,
        score: stat.score,
        rankChange: stat.rankChange,
        result: stat.result,
      });

      if (stat.rankChange !== 0) {
        this.updateRankPoints(stat.playerId, stat.rankChange, stat.result === 'win');
      }
    }

    return gameId;
  }

  getUserGameHistory(userId: string, limit: number = 20): PlayerGameRecord[] {
    return this.playerGameRecords
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, limit);
  }

  searchUsers(query: string, limit: number = 20): User[] {
    const results: User[] = [];
    const lowerQuery = query.toLowerCase();

    for (const user of this.users.values()) {
      if (
        user.nickname.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        user.id.includes(query)
      ) {
        results.push(user);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  private initTaskConfigs(): void {
    const dailyTasks: TaskConfig[] = [
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const weeklyTasks: TaskConfig[] = [
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    [...dailyTasks, ...weeklyTasks].forEach((task) => {
      this.taskConfigs.set(task.id, task);
    });
  }

  private initAchievementConfigs(): void {
    const achievements: AchievementConfig[] = [
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
      },
    ];

    achievements.forEach((ach) => {
      this.achievementConfigs.set(ach.id, ach);
    });
  }

  private refreshDailyTasks(): void {
    const today = getDailyPeriodKey();
    const lastDay = this.lastDailyRefresh ? getDailyPeriodKey(new Date(this.lastDailyRefresh)) : '';
    if (today === lastDay) return;

    this.lastDailyRefresh = Date.now();
    const dailyTasks = this.getActiveTaskConfigs(TaskType.DAILY);

    for (const userId of this.users.keys()) {
      const userTasks = this.getPlayerTaskMap(userId);
      for (const task of dailyTasks) {
        userTasks.set(task.id, {
          taskId: task.id,
          status: TaskStatus.IN_PROGRESS,
          progress: 0,
          periodKey: today,
        });
      }
    }
  }

  private refreshWeeklyTasks(): void {
    const thisWeek = getWeeklyPeriodKey();
    const lastWeek = this.lastWeeklyRefresh ? getWeeklyPeriodKey(new Date(this.lastWeeklyRefresh)) : '';
    if (thisWeek === lastWeek) return;

    if (this.lastWeeklyRefresh > 0) {
      this.archiveWeeklyRank();
    }

    this.lastWeeklyRefresh = Date.now();
    this.weeklyRankPoints.clear();
    this.weeklyRankWins.clear();

    const weeklyTasks = this.getActiveTaskConfigs(TaskType.WEEKLY);

    for (const userId of this.users.keys()) {
      const userTasks = this.getPlayerTaskMap(userId);
      for (const task of weeklyTasks) {
        userTasks.set(task.id, {
          taskId: task.id,
          status: TaskStatus.IN_PROGRESS,
          progress: 0,
          periodKey: thisWeek,
        });
      }
    }
  }

  private getPlayerTaskMap(userId: string): Map<string, PlayerTask> {
    let tasks = this.playerTasks.get(userId);
    if (!tasks) {
      tasks = new Map();
      this.playerTasks.set(userId, tasks);
    }
    return tasks;
  }

  private getPlayerAchievementMap(userId: string): Map<string, PlayerAchievement> {
    let achievements = this.playerAchievements.get(userId);
    if (!achievements) {
      achievements = new Map();
      this.playerAchievements.set(userId, achievements);
    }
    return achievements;
  }

  getActiveTaskConfigs(type?: TaskType): TaskConfig[] {
    let configs = Array.from(this.taskConfigs.values()).filter((t) => t.isActive);
    if (type) {
      configs = configs.filter((t) => t.type === type);
    }
    return configs.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getTaskConfig(taskId: string): TaskConfig | undefined {
    return this.taskConfigs.get(taskId);
  }

  addTaskConfig(config: Omit<TaskConfig, 'id' | 'createdAt' | 'updatedAt'>): TaskConfig {
    const id = `task_${Date.now()}`;
    const now = Date.now();
    const task: TaskConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.taskConfigs.set(id, task);
    return task;
  }

  updateTaskConfig(taskId: string, updates: Partial<TaskConfig>): TaskConfig | undefined {
    const task = this.taskConfigs.get(taskId);
    if (!task) return undefined;
    Object.assign(task, updates, { updatedAt: Date.now() });
    return task;
  }

  deleteTaskConfig(taskId: string): boolean {
    return this.taskConfigs.delete(taskId);
  }

  getPlayerTasks(userId: string, type?: TaskType): { config: TaskConfig; progress: PlayerTask }[] {
    this.ensureTaskRefresh(userId);
    const userTasks = this.getPlayerTaskMap(userId);
    const configs = this.getActiveTaskConfigs(type);

    return configs
      .map((config) => {
        const progress = userTasks.get(config.id) || {
          taskId: config.id,
          status: TaskStatus.IN_PROGRESS,
          progress: 0,
          periodKey: type === TaskType.DAILY ? getDailyPeriodKey() : getWeeklyPeriodKey(),
        };
        return { config, progress };
      })
      .filter(({ progress }) => progress.status !== undefined);
  }

  private ensureTaskRefresh(userId: string): void {
    const today = getDailyPeriodKey();
    const thisWeek = getWeeklyPeriodKey();
    const userTasks = this.getPlayerTaskMap(userId);

    let needsDailyInit = false;
    let needsWeeklyInit = false;

    const dailyTasks = this.getActiveTaskConfigs(TaskType.DAILY);
    const weeklyTasks = this.getActiveTaskConfigs(TaskType.WEEKLY);

    for (const task of dailyTasks) {
      const pt = userTasks.get(task.id);
      if (!pt || pt.periodKey !== today) {
        needsDailyInit = true;
        break;
      }
    }

    for (const task of weeklyTasks) {
      const pt = userTasks.get(task.id);
      if (!pt || pt.periodKey !== thisWeek) {
        needsWeeklyInit = true;
        break;
      }
    }

    if (needsDailyInit) {
      for (const task of dailyTasks) {
        userTasks.set(task.id, {
          taskId: task.id,
          status: TaskStatus.IN_PROGRESS,
          progress: 0,
          periodKey: today,
        });
      }
    }

    if (needsWeeklyInit) {
      for (const task of weeklyTasks) {
        userTasks.set(task.id, {
          taskId: task.id,
          status: TaskStatus.IN_PROGRESS,
          progress: 0,
          periodKey: thisWeek,
        });
      }
    }
  }

  updateTaskProgress(
    userId: string,
    conditionType: TaskConditionType,
    value: number = 1,
    taskTypes?: TaskType[]
  ): void {
    if (!this.featureConfig[GameFeature.TASKS]) return;

    this.ensureTaskRefresh(userId);
    const userTasks = this.getPlayerTaskMap(userId);
    const types = taskTypes || [TaskType.DAILY, TaskType.WEEKLY];

    for (const taskConfig of this.taskConfigs.values()) {
      if (!taskConfig.isActive) continue;
      if (!types.includes(taskConfig.type)) continue;
      if (taskConfig.conditionType !== conditionType) continue;

      const playerTask = userTasks.get(taskConfig.id);
      if (!playerTask) continue;
      if (playerTask.status === TaskStatus.CLAIMED) continue;

      const newProgress = Math.min(taskConfig.targetValue, playerTask.progress + value);
      playerTask.progress = newProgress;

      if (newProgress >= taskConfig.targetValue && playerTask.status === TaskStatus.IN_PROGRESS) {
        playerTask.status = TaskStatus.COMPLETED;
        playerTask.completedAt = Date.now();
      }
    }
  }

  claimTaskReward(userId: string, taskId: string): { success: boolean; rewards?: TaskReward[]; message?: string } {
    const userTasks = this.getPlayerTaskMap(userId);
    const playerTask = userTasks.get(taskId);
    const taskConfig = this.taskConfigs.get(taskId);

    if (!playerTask || !taskConfig) {
      return { success: false, message: '任务不存在' };
    }

    if (playerTask.status !== TaskStatus.COMPLETED) {
      return { success: false, message: '任务尚未完成' };
    }

    for (const reward of taskConfig.rewards) {
      if (reward.type === 'coins') {
        this.addCoins(userId, reward.amount);
      } else if (reward.type === 'diamonds') {
        this.addDiamonds(userId, reward.amount);
      } else if (reward.type === 'exp') {
        const user = this.users.get(userId);
        if (user) {
          user.exp += reward.amount;
        }
      } else if (reward.type === 'item' && reward.itemId) {
        this.addItemToInventory(userId, reward.itemId, reward.amount);
      }
    }

    playerTask.status = TaskStatus.CLAIMED;
    playerTask.claimedAt = Date.now();

    return { success: true, rewards: taskConfig.rewards };
  }

  getActiveAchievementConfigs(category?: AchievementCategory): AchievementConfig[] {
    let configs = Array.from(this.achievementConfigs.values()).filter((a) => a.isActive);
    if (category) {
      configs = configs.filter((a) => a.category === category);
    }
    return configs.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getAchievementConfig(achievementId: string): AchievementConfig | undefined {
    return this.achievementConfigs.get(achievementId);
  }

  addAchievementConfig(config: Omit<AchievementConfig, 'id' | 'createdAt'>): AchievementConfig {
    const id = `ach_${Date.now()}`;
    const achievement: AchievementConfig = {
      ...config,
      id,
      createdAt: Date.now(),
    };
    this.achievementConfigs.set(id, achievement);
    return achievement;
  }

  updateAchievementConfig(achievementId: string, updates: Partial<AchievementConfig>): AchievementConfig | undefined {
    const achievement = this.achievementConfigs.get(achievementId);
    if (!achievement) return undefined;
    Object.assign(achievement, updates);
    return achievement;
  }

  deleteAchievementConfig(achievementId: string): boolean {
    return this.achievementConfigs.delete(achievementId);
  }

  getPlayerAchievements(
    userId: string,
    category?: AchievementCategory
  ): { config: AchievementConfig; progress: PlayerAchievement }[] {
    const userAchievements = this.getPlayerAchievementMap(userId);
    const configs = this.getActiveAchievementConfigs(category);

    return configs.map((config) => {
      const progress = userAchievements.get(config.id) || {
        achievementId: config.id,
        status: AchievementStatus.LOCKED,
        progress: 0,
      };
      return { config, progress };
    });
  }

  updateAchievementProgress(userId: string, conditionType: string, value: number = 1): void {
    if (!this.featureConfig[GameFeature.ACHIEVEMENTS]) return;

    const userAchievements = this.getPlayerAchievementMap(userId);

    for (const achConfig of this.achievementConfigs.values()) {
      if (!achConfig.isActive) continue;
      if (achConfig.conditionType !== conditionType) continue;

      let playerAch = userAchievements.get(achConfig.id);
      if (!playerAch) {
        playerAch = {
          achievementId: achConfig.id,
          status: AchievementStatus.LOCKED,
          progress: 0,
        };
        userAchievements.set(achConfig.id, playerAch);
      }

      if (playerAch.status !== AchievementStatus.LOCKED) continue;

      const newProgress = Math.min(achConfig.targetValue, playerAch.progress + value);
      playerAch.progress = newProgress;

      if (newProgress >= achConfig.targetValue) {
        playerAch.status = AchievementStatus.UNLOCKED;
        playerAch.unlockedAt = Date.now();
      }
    }
  }

  claimAchievementReward(
    userId: string,
    achievementId: string
  ): { success: boolean; rewards?: AchievementReward[]; message?: string } {
    const userAchievements = this.getPlayerAchievementMap(userId);
    const playerAch = userAchievements.get(achievementId);
    const achConfig = this.achievementConfigs.get(achievementId);

    if (!playerAch || !achConfig) {
      return { success: false, message: '成就不存在' };
    }

    if (playerAch.status !== AchievementStatus.UNLOCKED) {
      return { success: false, message: '成就尚未解锁' };
    }

    for (const reward of achConfig.rewards) {
      if (reward.type === 'coins' && reward.amount) {
        this.addCoins(userId, reward.amount);
      } else if (reward.type === 'diamonds' && reward.amount) {
        this.addDiamonds(userId, reward.amount);
      } else if (reward.type === 'exp' && reward.amount) {
        const user = this.users.get(userId);
        if (user) {
          user.exp += reward.amount;
        }
      } else if (reward.type === 'item' && reward.itemId && reward.amount) {
        this.addItemToInventory(userId, reward.itemId, reward.amount);
      }
    }

    playerAch.status = AchievementStatus.CLAIMED;
    playerAch.claimedAt = Date.now();

    return { success: true, rewards: achConfig.rewards };
  }

  updateGameProgress(userId: string, stats: { kills: number; damage: number; isWin: boolean }): void {
    this.updateTaskProgress(userId, TaskConditionType.PLAY_GAMES, 1);
    this.updateTaskProgress(userId, TaskConditionType.GET_KILLS, stats.kills);
    this.updateTaskProgress(userId, TaskConditionType.GET_DAMAGE, stats.damage);
    if (stats.isWin) {
      this.updateTaskProgress(userId, TaskConditionType.WIN_GAMES, 1);
    }

    this.updateAchievementProgress(userId, 'play_games', 1);
    this.updateAchievementProgress(userId, 'get_kills', stats.kills);
    this.updateAchievementProgress(userId, 'get_damage', stats.damage);
    if (stats.isWin) {
      this.updateAchievementProgress(userId, 'win_games', 1);
    }

    if (this.featureConfig[GameFeature.WEEKLY_RANK]) {
      const currentWeekPoints = this.weeklyRankPoints.get(userId) || 0;
      const currentWeekWins = this.weeklyRankWins.get(userId) || 0;
      const rankRecord = this.getRankRecord(userId);
      if (rankRecord) {
        this.weeklyRankPoints.set(userId, currentWeekPoints + (stats.isWin ? 20 : -10));
        if (stats.isWin) {
          this.weeklyRankWins.set(userId, currentWeekWins + 1);
        }
      }
    }
  }

  getWeeklyLeaderboard(limit: number = 100, offset: number = 0): WeeklyRankEntry[] {
    const entries: WeeklyRankEntry[] = [];

    const sortedUserIds = Array.from(this.weeklyRankPoints.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([userId]) => userId);

    for (let i = offset; i < Math.min(offset + limit, sortedUserIds.length); i++) {
      const userId = sortedUserIds[i];
      const user = this.users.get(userId);
      const rankRecord = this.rankRecords.get(userId);
      const weekPoints = this.weeklyRankPoints.get(userId) || 0;
      const weekWins = this.weeklyRankWins.get(userId) || 0;

      if (user && rankRecord) {
        entries.push({
          rank: i + 1,
          userId,
          nickname: user.nickname,
          avatar: user.avatar,
          rankTier: rankRecord.rankTier,
          rankPoints: rankRecord.rankPoints,
          weekPoints,
          wins: weekWins,
          winRate: weekWins > 0 ? Math.round((weekWins / (weekWins + Math.max(1, 5 - weekWins))) * 100) / 100 : 0,
        });
      }
    }

    return entries;
  }

  getUserWeeklyRank(userId: string): number {
    const sortedUserIds = Array.from(this.weeklyRankPoints.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
    return sortedUserIds.indexOf(userId) + 1;
  }

  private archiveWeeklyRank(): void {
    const periodKey = getWeeklyPeriodKey(new Date(this.lastWeeklyRefresh));
    const entries = this.getLeaderboard(100, 0);

    const archive: RankArchive = {
      id: `archive_${Date.now()}`,
      periodType: 'weekly',
      periodKey,
      type: LeaderboardType.WEEKLY,
      entries,
      archivedAt: Date.now(),
    };

    this.rankArchives.unshift(archive);

    if (this.rankArchives.length > 52) {
      this.rankArchives = this.rankArchives.slice(0, 52);
    }
  }

  getRankArchives(periodType?: 'weekly' | 'monthly' | 'seasonal'): RankArchive[] {
    let archives = [...this.rankArchives];
    if (periodType) {
      archives = archives.filter((a) => a.periodType === periodType);
    }
    return archives;
  }

  getRankArchive(archiveId: string): RankArchive | undefined {
    return this.rankArchives.find((a) => a.id === archiveId);
  }

  getFeatureConfig(): FeatureConfig {
    return { ...this.featureConfig };
  }

  setFeatureConfig(config: Partial<FeatureConfig>): void {
    Object.assign(this.featureConfig, config);
  }

  isFeatureEnabled(feature: GameFeature): boolean {
    return this.featureConfig[feature] ?? true;
  }

  getGameplayStats(): GameplayStats {
    let totalTasksCompleted = 0;
    let dailyTasksCompleted = 0;
    let weeklyTasksCompleted = 0;
    let totalAchievementsUnlocked = 0;
    let activeTaskUsers = 0;
    let activeAchievementUsers = 0;

    for (const [, userTasks] of this.playerTasks) {
      let hasActiveTask = false;
      for (const task of userTasks.values()) {
        if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CLAIMED) {
          totalTasksCompleted++;
          const config = this.taskConfigs.get(task.taskId);
          if (config?.type === TaskType.DAILY) {
            dailyTasksCompleted++;
          } else if (config?.type === TaskType.WEEKLY) {
            weeklyTasksCompleted++;
          }
          hasActiveTask = true;
        }
        if (task.progress > 0) {
          hasActiveTask = true;
        }
      }
      if (hasActiveTask) activeTaskUsers++;
    }

    for (const [, userAchievements] of this.playerAchievements) {
      let hasActiveAch = false;
      for (const ach of userAchievements.values()) {
        if (ach.status === AchievementStatus.UNLOCKED || ach.status === AchievementStatus.CLAIMED) {
          totalAchievementsUnlocked++;
          hasActiveAch = true;
        }
        if (ach.progress > 0) {
          hasActiveAch = true;
        }
      }
      if (hasActiveAch) activeAchievementUsers++;
    }

    const totalUsers = this.users.size;
    const taskCompletionRate = totalUsers > 0 ? Math.round((activeTaskUsers / totalUsers) * 100) / 100 : 0;
    const achievementUnlockRate = totalUsers > 0 ? Math.round((activeAchievementUsers / totalUsers) * 100) / 100 : 0;

    return {
      totalTasksCompleted,
      dailyTasksCompleted,
      weeklyTasksCompleted,
      totalAchievementsUnlocked,
      activeTaskUsers,
      activeAchievementUsers,
      taskCompletionRate,
      achievementUnlockRate,
    };
  }

  backupConfig(configKey: string, data: Record<string, any>, createdBy?: string, note?: string): ConfigBackup {
    const backups = this.configBackups.get(configKey) || [];
    const version = backups.length + 1;
    const backup: ConfigBackup = {
      id: `backup_${Date.now()}`,
      configKey,
      version,
      data: JSON.parse(JSON.stringify(data)),
      createdAt: Date.now(),
      createdBy,
      note,
    };
    backups.unshift(backup);
    this.configBackups.set(configKey, backups);
    return backup;
  }

  getConfigBackups(configKey: string): ConfigBackup[] {
    return this.configBackups.get(configKey) || [];
  }

  getConfigBackup(backupId: string): ConfigBackup | undefined {
    for (const backups of this.configBackups.values()) {
      const backup = backups.find((b) => b.id === backupId);
      if (backup) return backup;
    }
    return undefined;
  }

  restoreConfigBackup(backupId: string): ConfigBackup | undefined {
    const backup = this.getConfigBackup(backupId);
    if (!backup) return undefined;
    return backup;
  }

  recordLogin(userId: string): void {
    this.updateTaskProgress(userId, TaskConditionType.LOGIN, 1, [TaskType.DAILY]);
    this.updateAchievementProgress(userId, 'total_login', 1);
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = Date.now();
    }
  }
}
