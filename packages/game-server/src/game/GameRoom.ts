import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { GameEngine } from './GameEngine';
import {
  GameMode,
  RoomStatus,
  GameState,
  MessageType,
  RoomInfo,
  RoomPlayer,
  RankTier,
  PlayerInput,
  GameStateData,
  PlayerGameStats,
  GameResult,
} from '@nebula/shared';
import { GAME_CONFIG } from '@nebula/shared';

interface RoomPlayerData extends RoomPlayer {
  socket: Socket | null;
  isConnected: boolean;
  disconnectTime?: number;
}

interface CreateRoomOptions {
  mode: GameMode;
  maxPlayers: number;
  name: string;
  hostId: string;
  hostSocket: Socket;
  hostInfo: Omit<RoomPlayer, 'rankTier' | 'team'> & { rankTier?: RankTier; team?: number };
}

export class GameRoom {
  public readonly id: string;
  public readonly name: string;
  public readonly mode: GameMode;
  private maxPlayers: number;
  private hostId: string;
  private status: RoomStatus;
  private players: Map<string, RoomPlayerData> = new Map();
  private gameEngine: GameEngine | null = null;
  private createdAt: number;
  private endedAt: number = 0;
  private gameStartTime: number = 0;
  private gameEndTime: number = 0;
  private gameDuration: number;
  private map: string = 'default';
  private tickInterval: NodeJS.Timeout | null = null;
  private stateBroadcastInterval: NodeJS.Timeout | null = null;

  constructor(options: CreateRoomOptions) {
    this.id = uuidv4();
    this.name = options.name;
    this.mode = options.mode;
    this.maxPlayers = options.maxPlayers;
    this.hostId = options.hostId;
    this.status = RoomStatus.WAITING;
    this.createdAt = Date.now();
    this.gameDuration = GAME_CONFIG.GAME_DURATION;

    this.players.set(options.hostId, {
      ...options.hostInfo,
      id: options.hostId,
      rankTier: options.hostInfo.rankTier || RankTier.BRONZE,
      isReady: options.hostInfo.isReady ?? true,
      isHost: true,
      socket: options.hostSocket,
      isConnected: true,
      team: options.hostInfo.team || 0,
    });
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  getMode(): GameMode {
    return this.mode;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getMaxPlayers(): number {
    return this.maxPlayers;
  }

  getCreatedAt(): number {
    return this.createdAt;
  }

  getEndedAt(): number {
    return this.endedAt;
  }

  isHost(playerId: string): boolean {
    return this.hostId === playerId;
  }

  isPlaying(): boolean {
    return this.status === RoomStatus.PLAYING && this.gameEngine !== null;
  }

  isPlayerConnected(playerId: string): boolean {
    const player = this.players.get(playerId);
    return player?.isConnected ?? false;
  }

  addPlayer(socket: Socket, playerInfo: Omit<RoomPlayer, 'rankTier' | 'team'> & { rankTier?: RankTier; team?: number }): boolean {
    if (this.players.size >= this.maxPlayers) return false;
    if (this.status !== RoomStatus.WAITING && this.status !== RoomStatus.READY) return false;

    this.players.set(playerInfo.id, {
      ...playerInfo,
      rankTier: playerInfo.rankTier || RankTier.BRONZE,
      isReady: false,
      isHost: false,
      socket,
      isConnected: true,
      team: playerInfo.team || this.getSmallestTeam(),
    });

    this.checkReadyStatus();
    this.broadcastRoomInfo();
    this.broadcastPlayerJoined(playerInfo.id);

    return true;
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.players.delete(playerId);

    if (this.gameEngine) {
      this.gameEngine.removePlayer(playerId);
    }

    if (playerId === this.hostId && this.players.size > 0) {
      const firstPlayer = this.players.values().next().value;
      if (firstPlayer) {
        this.hostId = firstPlayer.id;
        firstPlayer.isHost = true;
        firstPlayer.isReady = true;
      }
    }

    this.checkReadyStatus();
    this.broadcastRoomInfo();
    this.broadcastPlayerLeft(playerId);

    if (this.players.size === 0) {
      this.endGame();
    }
  }

  setPlayerReady(playerId: string, isReady: boolean): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.isReady = isReady;
    this.checkReadyStatus();
    this.broadcastRoomInfo();
  }

  canStart(): boolean {
    if (this.players.size < GAME_CONFIG.MIN_PLAYERS_PER_GAME) return false;
    return Array.from(this.players.values()).every((p) => p.isReady);
  }

  startGame(): void {
    if (!this.canStart()) return;

    this.status = RoomStatus.PLAYING;
    this.gameStartTime = Date.now();

    const playerIds = Array.from(this.players.keys());
    this.gameEngine = new GameEngine({
      playerIds,
      mode: this.mode,
      duration: this.gameDuration,
      map: this.map,
    });

    this.gameEngine.on('kill', (data) => {
      this.broadcast(MessageType.KILL_EVENT, data);
    });

    this.gameEngine.on('damage', (data) => {
      this.broadcast(MessageType.DAMAGE_EVENT, data);
    });

    this.gameEngine.on('game_end', (result) => {
      this.endGameWithResult(result);
    });

    this.gameEngine.start();

    this.broadcast(MessageType.GAME_START, {
      startTime: this.gameStartTime,
      duration: this.gameDuration,
      players: this.getRoomPlayers(),
    });

    this.startGameLoop();
  }

  private startGameLoop(): void {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.stateBroadcastInterval) clearInterval(this.stateBroadcastInterval);

    this.tickInterval = setInterval(() => {
      if (this.gameEngine) {
        this.gameEngine.tick(GAME_CONFIG.TICK_INTERVAL / 1000);
      }
    }, GAME_CONFIG.TICK_INTERVAL);

    this.stateBroadcastInterval = setInterval(() => {
      if (this.gameEngine) {
        const state = this.gameEngine.getState();
        this.broadcast(MessageType.GAME_STATE, state);
      }
    }, GAME_CONFIG.TICK_INTERVAL * 2);
  }

  private endGameWithResult(result: any): void {
    this.status = RoomStatus.ENDED;
    this.gameEndTime = Date.now();
    this.endedAt = Date.now();

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.stateBroadcastInterval) {
      clearInterval(this.stateBroadcastInterval);
      this.stateBroadcastInterval = null;
    }

    const gameResult: GameResult = {
      gameId: this.id,
      mode: this.mode,
      map: this.map,
      duration: (this.gameEndTime - this.gameStartTime) / 1000,
      startTime: this.gameStartTime,
      endTime: this.gameEndTime,
      players: result.players || [],
    };

    this.broadcast(MessageType.GAME_END, gameResult);

    setTimeout(() => {
      this.status = RoomStatus.WAITING;
      this.gameEngine = null;
      for (const player of this.players.values()) {
        player.isReady = false;
      }
      this.broadcastRoomInfo();
    }, 5000);
  }

  endGame(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.stateBroadcastInterval) {
      clearInterval(this.stateBroadcastInterval);
      this.stateBroadcastInterval = null;
    }
    if (this.gameEngine) {
      this.gameEngine.destroy();
      this.gameEngine = null;
    }
    this.status = RoomStatus.ENDED;
    this.endedAt = Date.now();
  }

  handlePlayerInput(playerId: string, input: PlayerInput): void {
    if (this.gameEngine) {
      this.gameEngine.handleInput(playerId, input);
    }
  }

  handlePlayerSkill(playerId: string, skillData: { skillType: string }): void {
    if (this.gameEngine) {
      this.gameEngine.handleSkill(playerId, skillData.skillType);
    }
  }

  handleDisconnect(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isConnected = false;
      player.disconnectTime = Date.now();
      if (this.gameEngine) {
        this.gameEngine.setPlayerDisconnected(playerId, true);
      }
    }
  }

  reconnectPlayer(socket: Socket, playerId: string, nickname: string, avatar: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.socket = socket;
    player.isConnected = true;
    player.disconnectTime = undefined;

    if (this.gameEngine) {
      this.gameEngine.setPlayerDisconnected(playerId, false);
    }

    return true;
  }

  getReconnectState(playerId: string): any {
    if (!this.gameEngine) return null;
    return {
      state: this.gameEngine.getState(),
      playerId,
      timeLeft: this.gameDuration - (Date.now() - this.gameStartTime) / 1000,
    };
  }

  getRoomInfo(): RoomInfo {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      status: this.status,
      maxPlayers: this.maxPlayers,
      hostId: this.hostId,
      players: this.getRoomPlayers(),
      map: this.map,
      gameDuration: this.gameDuration,
    };
  }

  private getRoomPlayers(): RoomPlayer[] {
    return Array.from(this.players.values()).map((p) => ({
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      rankTier: p.rankTier,
      isReady: p.isReady,
      isHost: p.isHost,
      team: p.team,
    }));
  }

  private getSmallestTeam(): number {
    const teamCounts: Record<number, number> = {};
    for (const player of this.players.values()) {
      const team = player.team || 0;
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    }

    let minTeam = 0;
    let minCount = Infinity;

    for (let i = 0; i < 2; i++) {
      const count = teamCounts[i] || 0;
      if (count < minCount) {
        minCount = count;
        minTeam = i;
      }
    }

    return minTeam;
  }

  private checkReadyStatus(): void {
    if (this.status !== RoomStatus.WAITING && this.status !== RoomStatus.READY) return;

    const allReady = this.canStart();
    this.status = allReady ? RoomStatus.READY : RoomStatus.WAITING;
  }

  private broadcastRoomInfo(): void {
    this.broadcast(MessageType.ROOM_INFO, this.getRoomInfo());
  }

  private broadcastPlayerJoined(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      this.broadcast(MessageType.PLAYER_JOINED, {
        id: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        rankTier: player.rankTier,
        isHost: player.isHost,
        team: player.team,
      });
    }
  }

  private broadcastPlayerLeft(playerId: string): void {
    this.broadcast(MessageType.PLAYER_LEFT, { playerId });
  }

  broadcast(type: string, data: any): void {
    for (const player of this.players.values()) {
      if (player.socket && player.isConnected) {
        player.socket.emit(type, {
          type,
          timestamp: Date.now(),
          data,
        });
      }
    }
  }

  sendToPlayer(playerId: string, type: string, data: any): void {
    const player = this.players.get(playerId);
    if (player?.socket && player.isConnected) {
      player.socket.emit(type, {
        type,
        timestamp: Date.now(),
        data,
      });
    }
  }

  destroy(): void {
    this.endGame();
    for (const player of this.players.values()) {
      if (player.socket) {
        player.socket.disconnect();
      }
    }
    this.players.clear();
  }
}
