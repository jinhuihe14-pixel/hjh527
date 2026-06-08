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
} from '@nebula/shared';
import { getRankTier } from '@nebula/shared';

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

  constructor() {
    this.initShopItems();
    this.initCurrentSeason();
    this.createTestUser();
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
}
