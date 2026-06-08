import { MatchRequest, GameMode } from '@nebula/shared';

interface PlayerInfo {
  nickname: string;
  avatar: string;
  rankTier: number;
}

interface QueueItem {
  request: MatchRequest;
  playerInfo: PlayerInfo;
  currentRange: number;
}

export class MatchQueue {
  private queues: Map<GameMode, QueueItem[]> = new Map();
  private playerModes: Map<string, GameMode> = new Map();
  private matchHistory: { timestamp: number; waitTime: number; mode: GameMode }[] = [];

  constructor() {
    this.queues.set(GameMode.QUICK, []);
    this.queues.set(GameMode.RANKED, []);
  }

  add(request: MatchRequest, playerInfo: Partial<PlayerInfo>): void {
    const queue = this.queues.get(request.mode);
    if (!queue) return;

    const existingIndex = queue.findIndex((item) => item.request.playerId === request.playerId);
    if (existingIndex >= 0) {
      queue.splice(existingIndex, 1);
    }

    queue.push({
      request,
      playerInfo: {
        nickname: playerInfo.nickname || 'Player',
        avatar: playerInfo.avatar || '',
        rankTier: playerInfo.rankTier || 1,
      },
      currentRange: this.getInitialRange(request.mode),
    });

    this.playerModes.set(request.playerId, request.mode);
  }

  remove(playerId: string): boolean {
    const mode = this.playerModes.get(playerId);
    if (!mode) return false;

    const queue = this.queues.get(mode);
    if (!queue) return false;

    const index = queue.findIndex((item) => item.request.playerId === playerId);
    if (index >= 0) {
      queue.splice(index, 1);
      this.playerModes.delete(playerId);
      return true;
    }

    return false;
  }

  find(playerId: string): MatchRequest | undefined {
    const mode = this.playerModes.get(playerId);
    if (!mode) return undefined;

    const queue = this.queues.get(mode);
    if (!queue) return undefined;

    const item = queue.find((i) => i.request.playerId === playerId);
    return item?.request;
  }

  getQueue(mode: GameMode): QueueItem[] {
    return this.queues.get(mode) || [];
  }

  getQueueSize(mode: GameMode): number {
    return this.queues.get(mode)?.length || 0;
  }

  size(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  getPlayerInfo(playerId: string): PlayerInfo | undefined {
    const mode = this.playerModes.get(playerId);
    if (!mode) return undefined;

    const queue = this.queues.get(mode);
    if (!queue) return undefined;

    const item = queue.find((i) => i.request.playerId === playerId);
    return item?.playerInfo;
  }

  getAverageWaitTime(mode: GameMode): number {
    const recentMatches = this.matchHistory.filter((m) => m.mode === mode).slice(-50);
    if (recentMatches.length === 0) return 0;

    const total = recentMatches.reduce((sum, m) => sum + m.waitTime, 0);
    return total / recentMatches.length;
  }

  recordMatch(mode: GameMode, waitTime: number): void {
    this.matchHistory.push({
      timestamp: Date.now(),
      waitTime,
      mode,
    });

    if (this.matchHistory.length > 1000) {
      this.matchHistory.shift();
    }
  }

  updateRanges(): void {
    const now = Date.now();

    for (const queue of this.queues.values()) {
      for (const item of queue) {
        const waitTime = now - item.request.timestamp;
        const rangeIncrements = Math.floor(waitTime / 5000);
        item.currentRange = Math.min(
          this.getInitialRange(item.request.mode) + rangeIncrements * 50,
          500
        );
      }
    }
  }

  private getInitialRange(mode: GameMode): number {
    switch (mode) {
      case GameMode.RANKED:
        return 100;
      case GameMode.QUICK:
        return 300;
      default:
        return 200;
    }
  }
}
