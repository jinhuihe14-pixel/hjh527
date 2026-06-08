import { EventEmitter } from 'events';
import {
  PlayerState,
  BulletState,
  PowerUpState,
  GameStateData,
  PlayerInput,
  GameState,
  GameMode,
  PlayerGameStats,
} from '@nebula/shared';
import { GAME_CONFIG, generateId } from '@nebula/shared';
import {
  addVectors,
  scale,
  normalize,
  distance,
  circleCollision,
  clampVectorToBounds,
  magnitude,
} from '@nebula/shared';

interface GameEngineOptions {
  playerIds: string[];
  mode: GameMode;
  duration: number;
  map: string;
}

export class GameEngine extends EventEmitter {
  private state: GameState = GameState.WAITING;
  private tick: number = 0;
  private startTime: number = 0;
  private duration: number;
  private timeLeft: number;
  private mode: GameMode;
  private map: string;
  private players: Map<string, PlayerState> = new Map();
  private bullets: BulletState[] = [];
  private powerUps: PowerUpState[] = [];
  private lastFireTime: Map<string, number> = new Map();
  private isRunning: boolean = false;

  constructor(options: GameEngineOptions) {
    super();
    this.duration = options.duration;
    this.timeLeft = options.duration;
    this.mode = options.mode;
    this.map = options.map;

    for (const playerId of options.playerIds) {
      this.players.set(playerId, this.createPlayerState(playerId));
    }

    this.initPowerUps();
  }

  private createPlayerState(playerId: string): PlayerState {
    const spawnPos = this.getRandomSpawnPosition();
    return {
      id: playerId,
      position: spawnPos,
      velocity: { x: 0, y: 0 },
      rotation: 0,
      health: GAME_CONFIG.PLAYER.MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
      energy: GAME_CONFIG.PLAYER.MAX_ENERGY,
      maxEnergy: GAME_CONFIG.PLAYER.MAX_ENERGY,
      score: 0,
      kills: 0,
      deaths: 0,
      isAlive: true,
      respawnTimer: 0,
      skills: {
        dash: { cooldown: 0, maxCooldown: 5000 },
        shield: { cooldown: 0, maxCooldown: 8000 },
        missile: { cooldown: 0, maxCooldown: 10000 },
      },
      buffs: [],
    };
  }

  private getRandomSpawnPosition() {
    const margin = 100;
    return {
      x: margin + Math.random() * (GAME_CONFIG.MAP.WIDTH - margin * 2),
      y: margin + Math.random() * (GAME_CONFIG.MAP.HEIGHT - margin * 2),
    };
  }

  private initPowerUps(): void {
    const powerUpTypes = ['health', 'energy', 'speed', 'damage'];
    const count = 8;

    for (let i = 0; i < count; i++) {
      this.powerUps.push({
        id: generateId(),
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        position: {
          x: 100 + Math.random() * (GAME_CONFIG.MAP.WIDTH - 200),
          y: 100 + Math.random() * (GAME_CONFIG.MAP.HEIGHT - 200),
        },
        respawnTime: 0,
      });
    }
  }

  start(): void {
    this.state = GameState.PLAYING;
    this.startTime = Date.now();
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
    this.state = GameState.ENDED;
  }

  tick(deltaTime: number): void {
    if (!this.isRunning || this.state !== GameState.PLAYING) return;

    this.tick++;

    const elapsed = (Date.now() - this.startTime) / 1000;
    this.timeLeft = Math.max(0, this.duration - elapsed);

    if (this.timeLeft <= 0) {
      this.endGame();
      return;
    }

    this.updatePlayers(deltaTime);
    this.updateBullets(deltaTime);
    this.updatePowerUps(deltaTime);
    this.checkCollisions();
    this.regenerateEnergy(deltaTime);
    this.updateSkillCooldowns(deltaTime);
  }

  private updatePlayers(deltaTime: number): void {
    for (const player of this.players.values()) {
      if (!player.isAlive) {
        player.respawnTimer -= deltaTime * 1000;
        if (player.respawnTimer <= 0) {
          this.respawnPlayer(player);
        }
        continue;
      }

      const speed = GAME_CONFIG.PLAYER.SPEED;
      const velocity = scale(player.velocity, speed * deltaTime);
      player.position = addVectors(player.position, velocity);

      player.position = clampVectorToBounds(
        player.position,
        GAME_CONFIG.MAP.WIDTH,
        GAME_CONFIG.MAP.HEIGHT,
        GAME_CONFIG.PLAYER.SIZE
      );

      if (magnitude(player.velocity) > 0.1) {
        player.rotation = Math.atan2(player.velocity.y, player.velocity.x);
      }
    }
  }

  private updateBullets(deltaTime: number): void {
    const newBullets: BulletState[] = [];

    for (const bullet of this.bullets) {
      bullet.life -= deltaTime * 1000;
      if (bullet.life <= 0) continue;

      const move = scale(bullet.velocity, bullet.speed * deltaTime);
      bullet.position = addVectors(bullet.position, move);

      if (
        bullet.position.x < 0 ||
        bullet.position.x > GAME_CONFIG.MAP.WIDTH ||
        bullet.position.y < 0 ||
        bullet.position.y > GAME_CONFIG.MAP.HEIGHT
      ) {
        continue;
      }

      newBullets.push(bullet);
    }

    this.bullets = newBullets;
  }

  private updatePowerUps(deltaTime: number): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.respawnTime > 0) {
        powerUp.respawnTime -= deltaTime * 1000;
      }
    }
  }

  private checkCollisions(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      let hit = false;

      for (const player of this.players.values()) {
        if (!player.isAlive || player.id === bullet.ownerId) continue;

        if (
          circleCollision(
            bullet.position,
            GAME_CONFIG.BULLET.SIZE,
            player.position,
            GAME_CONFIG.PLAYER.SIZE
          )
        ) {
          this.applyDamage(player.id, bullet.ownerId, bullet.damage);
          hit = true;
          break;
        }
      }

      if (hit) {
        this.bullets.splice(i, 1);
      }
    }

    for (const powerUp of this.powerUps) {
      if (powerUp.respawnTime > 0) continue;

      for (const player of this.players.values()) {
        if (!player.isAlive) continue;

        if (
          circleCollision(
            powerUp.position,
            15,
            player.position,
            GAME_CONFIG.PLAYER.SIZE
          )
        ) {
          this.applyPowerUp(player.id, powerUp.type);
          powerUp.respawnTime = 10000;
          break;
        }
      }
    }
  }

  private applyDamage(targetId: string, attackerId: string, damage: number): void {
    const target = this.players.get(targetId);
    if (!target || !target.isAlive) return;

    target.health -= damage;

    this.emit('damage', {
      targetId,
      attackerId,
      damage,
      remainingHealth: target.health,
    });

    if (target.health <= 0) {
      this.killPlayer(targetId, attackerId);
    }
  }

  private killPlayer(victimId: string, killerId: string): void {
    const victim = this.players.get(victimId);
    const killer = this.players.get(killerId);

    if (!victim) return;

    victim.isAlive = false;
    victim.deaths++;
    victim.respawnTimer = GAME_CONFIG.RESPAWN_TIME;

    if (killer) {
      killer.kills++;
      killer.score += 100;
    }

    this.emit('kill', {
      victimId,
      killerId,
      victimScore: victim.score,
      killerScore: killer?.score || 0,
    });
  }

  private respawnPlayer(player: PlayerState): void {
    player.isAlive = true;
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    player.position = this.getRandomSpawnPosition();
    player.velocity = { x: 0, y: 0 };
  }

  private applyPowerUp(playerId: string, powerUpType: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (powerUpType) {
      case 'health':
        player.health = Math.min(player.maxHealth, player.health + 30);
        break;
      case 'energy':
        player.energy = Math.min(player.maxEnergy, player.energy + 50);
        break;
      case 'speed':
        player.buffs.push({ type: 'speed', duration: 5000, value: 1.5 });
        break;
      case 'damage':
        player.buffs.push({ type: 'damage', duration: 5000, value: 1.5 });
        break;
    }
  }

  private regenerateEnergy(deltaTime: number): void {
    for (const player of this.players.values()) {
      if (!player.isAlive) continue;
      player.energy = Math.min(
        player.maxEnergy,
        player.energy + GAME_CONFIG.PLAYER.ENERGY_REGEN * deltaTime
      );
    }
  }

  private updateSkillCooldowns(deltaTime: number): void {
    for (const player of this.players.values()) {
      for (const skill of Object.values(player.skills)) {
        if (skill.cooldown > 0) {
          skill.cooldown = Math.max(0, skill.cooldown - deltaTime * 1000);
        }
      }
    }

    for (const player of this.players.values()) {
      player.buffs = player.buffs.filter((b) => {
        b.duration -= deltaTime * 1000;
        return b.duration > 0;
      });
    }
  }

  handleInput(playerId: string, input: PlayerInput): void {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) return;

    const moveVector = normalize(input.movement);
    player.velocity = moveVector;

    if (input.mouseAngle !== undefined) {
      player.rotation = input.mouseAngle;
    }

    if (input.shooting) {
      this.fireBullet(playerId);
    }
  }

  private fireBullet(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) return;

    const now = Date.now();
    const lastFire = this.lastFireTime.get(playerId) || 0;

    if (now - lastFire < GAME_CONFIG.PLAYER.FIRE_RATE) return;

    this.lastFireTime.set(playerId, now);

    const damageMultiplier = player.buffs.find((b) => b.type === 'damage')?.value || 1;

    const bullet: BulletState = {
      id: generateId(),
      ownerId: playerId,
      position: { ...player.position },
      velocity: {
        x: Math.cos(player.rotation),
        y: Math.sin(player.rotation),
      },
      damage: GAME_CONFIG.BULLET.DAMAGE * damageMultiplier,
      speed: GAME_CONFIG.BULLET.SPEED,
      life: GAME_CONFIG.BULLET.LIFE,
    };

    this.bullets.push(bullet);
  }

  handleSkill(playerId: string, skillType: string): void {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) return;

    const skill = player.skills[skillType];
    if (!skill || skill.cooldown > 0) return;

    const energyCost = 20;
    if (player.energy < energyCost) return;

    player.energy -= energyCost;
    skill.cooldown = skill.maxCooldown;

    switch (skillType) {
      case 'dash':
        const dashDistance = 150;
        const dashDir = normalize(player.velocity);
        player.position = addVectors(
          player.position,
          scale(dashDir, dashDistance)
        );
        player.position = clampVectorToBounds(
          player.position,
          GAME_CONFIG.MAP.WIDTH,
          GAME_CONFIG.MAP.HEIGHT,
          GAME_CONFIG.PLAYER.SIZE
        );
        break;

      case 'shield':
        player.health = Math.min(player.maxHealth, player.health + 20);
        break;

      case 'missile':
        for (let i = 0; i < 5; i++) {
          const angle = player.rotation + (i - 2) * 0.2;
          const bullet: BulletState = {
            id: generateId(),
            ownerId: playerId,
            position: { ...player.position },
            velocity: {
              x: Math.cos(angle),
              y: Math.sin(angle),
            },
            damage: GAME_CONFIG.BULLET.DAMAGE * 0.8,
            speed: GAME_CONFIG.BULLET.SPEED * 0.8,
            life: GAME_CONFIG.BULLET.LIFE * 1.5,
          };
          this.bullets.push(bullet);
        }
        break;
    }
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  setPlayerDisconnected(playerId: string, disconnected: boolean): void {
    // 玩家断开连接时保持位置，但停止移动
  }

  private endGame(): void {
    this.stop();

    const playerStats: PlayerGameStats[] = [];
    const sortedPlayers = Array.from(this.players.values()).sort(
      (a, b) => b.score - a.score
    );

    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      playerStats.push({
        playerId: player.id,
        nickname: player.id,
        team: 0,
        kills: player.kills,
        deaths: player.deaths,
        assists: 0,
        damage: 0,
        score: player.score,
        rankChange: 0,
        result: i === 0 ? 'win' : 'lose',
      });
    }

    this.emit('game_end', { players: playerStats });
  }

  getState(): GameStateData {
    const players: Record<string, PlayerState> = {};
    for (const [id, player] of this.players) {
      players[id] = { ...player };
    }

    return {
      state: this.state,
      tick: this.tick,
      timestamp: Date.now(),
      duration: this.duration,
      timeLeft: this.timeLeft,
      players,
      bullets: [...this.bullets],
      powerUps: [...this.powerUps],
    };
  }

  getPlayerState(playerId: string): PlayerState | undefined {
    return this.players.get(playerId);
  }

  destroy(): void {
    this.stop();
    this.players.clear();
    this.bullets = [];
    this.powerUps = [];
    this.removeAllListeners();
  }
}
