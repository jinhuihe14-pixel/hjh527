import {
  CheatType,
  PunishmentLevel,
  PlayerInput,
  CheatDetectionEvent,
} from '@nebula/shared';
import { ANTICHEAT_CONFIG } from '@nebula/shared';
import { distance, Vector2 } from '@nebula/shared';

interface PlayerCheatData {
  warnings: number;
  violations: CheatDetectionEvent[];
  lastPositions: { position: Vector2; timestamp: number }[];
  lastInputs: { timestamp: number }[];
  lastDamageDealt: { damage: number; timestamp: number }[];
  healthHistory: { health: number; timestamp: number }[];
  lastTickInputCount: number;
  lastTickTime: number;
}

interface DetectionResult {
  violation: boolean;
  type?: CheatType;
  severity?: number;
  evidence?: Record<string, any>;
}

export class AnticheatSystem {
  private playerData: Map<string, PlayerCheatData> = new Map();
  private bannedPlayers: Set<string> = new Set();

  checkInput(playerId: string, input: PlayerInput): DetectionResult {
    if (this.bannedPlayers.has(playerId)) {
      return { violation: true, type: CheatType.DATA_TAMPERING, severity: 4 };
    }

    const data = this.getOrCreatePlayerData(playerId);

    const speedCheck = this.checkSpeed(playerId, input, data);
    if (speedCheck.violation) return speedCheck;

    const frequencyCheck = this.checkInputFrequency(playerId, input, data);
    if (frequencyCheck.violation) return frequencyCheck;

    const teleportCheck = this.checkTeleport(playerId, input, data);
    if (teleportCheck.violation) return teleportCheck;

    return { violation: false };
  }

  checkDamage(playerId: string, damage: number, timestamp: number): DetectionResult {
    const data = this.getOrCreatePlayerData(playerId);

    if (damage > ANTICHEAT_CONFIG.MAX_DAMAGE_PER_HIT) {
      return {
        violation: true,
        type: CheatType.DAMAGE_HACK,
        severity: 3,
        evidence: {
          damage,
          maxAllowed: ANTICHEAT_CONFIG.MAX_DAMAGE_PER_HIT,
        },
      };
    }

    data.lastDamageDealt.push({ damage, timestamp });
    const oneSecondAgo = timestamp - 1000;
    data.lastDamageDealt = data.lastDamageDealt.filter((d) => d.timestamp > oneSecondAgo);

    const totalDamagePerSecond = data.lastDamageDealt.reduce((sum, d) => sum + d.damage, 0);
    if (totalDamagePerSecond > ANTICHEAT_CONFIG.MAX_DAMAGE_PER_HIT * 5) {
      return {
        violation: true,
        type: CheatType.DAMAGE_HACK,
        severity: 3,
        evidence: {
          totalDamagePerSecond,
          maxAllowed: ANTICHEAT_CONFIG.MAX_DAMAGE_PER_HIT * 5,
        },
      };
    }

    return { violation: false };
  }

  checkHealth(playerId: string, health: number, maxHealth: number, timestamp: number): DetectionResult {
    const data = this.getOrCreatePlayerData(playerId);

    data.healthHistory.push({ health, timestamp });
    const durationAgo = timestamp - ANTICHEAT_CONFIG.GOD_MODE_DURATION;
    data.healthHistory = data.healthHistory.filter((h) => h.timestamp > durationAgo);

    if (data.healthHistory.length > 10) {
      const minHealth = Math.min(...data.healthHistory.map((h) => h.health));
      if (minHealth > maxHealth * (ANTICHEAT_CONFIG.GOD_MODE_HEALTH_THRESHOLD / 100)) {
        const hasDamage = data.healthHistory.some((h, i) => {
          if (i === 0) return false;
          return data.healthHistory[i - 1].health > h.health;
        });

        if (!hasDamage) {
          return {
            violation: true,
            type: CheatType.GOD_MODE,
            severity: 4,
            evidence: {
              minHealth,
              maxHealth,
              duration: ANTICHEAT_CONFIG.GOD_MODE_DURATION,
            },
          };
        }
      }
    }

    return { violation: false };
  }

  private checkSpeed(playerId: string, input: PlayerInput, data: PlayerCheatData): DetectionResult {
    if (data.lastPositions.length === 0) {
      data.lastPositions.push({ position: input.movement, timestamp: input.timestamp });
      return { violation: false };
    }

    const lastPos = data.lastPositions[data.lastPositions.length - 1];
    const dist = distance(lastPos.position, input.movement);
    const timeDiff = (input.timestamp - lastPos.timestamp) / 1000;

    if (timeDiff > 0 && timeDiff < 1) {
      const speed = dist / timeDiff;
      if (speed > ANTICHEAT_CONFIG.MAX_MOVE_SPEED) {
        return {
          violation: true,
          type: CheatType.SPEED_HACK,
          severity: 2,
          evidence: {
            speed,
            maxAllowed: ANTICHEAT_CONFIG.MAX_MOVE_SPEED,
            distance: dist,
            timeDiff,
          },
        };
      }
    }

    data.lastPositions.push({ position: input.movement, timestamp: input.timestamp });
    if (data.lastPositions.length > 20) {
      data.lastPositions.shift();
    }

    return { violation: false };
  }

  private checkInputFrequency(playerId: string, input: PlayerInput, data: PlayerCheatData): DetectionResult {
    const now = Date.now();
    const secondAgo = now - 1000;

    data.lastInputs.push({ timestamp: now });
    data.lastInputs = data.lastInputs.filter((i) => i.timestamp > secondAgo);

    if (data.lastInputs.length > ANTICHEAT_CONFIG.MAX_INPUTS_PER_SECOND) {
      return {
        violation: true,
        type: CheatType.FREQUENCY_HACK,
        severity: 2,
        evidence: {
          inputsPerSecond: data.lastInputs.length,
          maxAllowed: ANTICHEAT_CONFIG.MAX_INPUTS_PER_SECOND,
        },
      };
    }

    return { violation: false };
  }

  private checkTeleport(playerId: string, input: PlayerInput, data: PlayerCheatData): DetectionResult {
    if (data.lastPositions.length < 2) return { violation: false };

    const positions = data.lastPositions.slice(-5);
    const currentPos = input.movement;

    for (const pos of positions) {
      const dist = distance(pos.position, currentPos);
      const timeDiff = Math.abs((input.timestamp - pos.timestamp) / 1000);

      if (timeDiff < 0.2 && dist > ANTICHEAT_CONFIG.MIN_TELEPORT_DISTANCE) {
        const expectedMaxDistance = ANTICHEAT_CONFIG.MAX_MOVE_SPEED * timeDiff;
        if (dist > expectedMaxDistance * 3) {
          return {
            violation: true,
            type: CheatType.TELEPORT_HACK,
            severity: 3,
            evidence: {
              distance: dist,
              timeDiff,
              expectedMaxDistance,
            },
          };
        }
      }
    }

    return { violation: false };
  }

  handleViolation(playerId: string, detection: DetectionResult): void {
    const data = this.getOrCreatePlayerData(playerId);

    const event: CheatDetectionEvent = {
      playerId,
      cheatType: detection.type || CheatType.DATA_TAMPERING,
      severity: detection.severity || 1,
      evidence: detection.evidence || {},
      timestamp: Date.now(),
    };

    data.violations.push(event);
    data.warnings++;

    const punishment = this.determinePunishment(data);

    console.warn(`[ANTICHEAT] Violation detected for player ${playerId}`, {
      type: detection.type,
      severity: detection.severity,
      punishment,
      totalWarnings: data.warnings,
    });

    if (punishment === PunishmentLevel.PERMANENT_BAN) {
      this.bannedPlayers.add(playerId);
    }
  }

  private determinePunishment(data: PlayerCheatData): PunishmentLevel {
    const totalViolations = data.violations.length;
    const recentViolations = data.violations.filter(
      (v) => Date.now() - v.timestamp < 60000
    ).length;

    if (recentViolations >= ANTICHEAT_CONFIG.PERM_BAN_THRESHOLD) {
      return PunishmentLevel.PERMANENT_BAN;
    }

    if (recentViolations >= ANTICHEAT_CONFIG.TEMP_BAN_THRESHOLD) {
      return PunishmentLevel.TEMP_BAN;
    }

    if (totalViolations >= ANTICHEAT_CONFIG.WARNING_THRESHOLD) {
      return PunishmentLevel.INVALID_GAME;
    }

    return PunishmentLevel.WARNING;
  }

  isBanned(playerId: string): boolean {
    return this.bannedPlayers.has(playerId);
  }

  getPlayerViolations(playerId: string): CheatDetectionEvent[] {
    return this.getOrCreatePlayerData(playerId).violations;
  }

  private getOrCreatePlayerData(playerId: string): PlayerCheatData {
    let data = this.playerData.get(playerId);
    if (!data) {
      data = {
        warnings: 0,
        violations: [],
        lastPositions: [],
        lastInputs: [],
        lastDamageDealt: [],
        healthHistory: [],
        lastTickInputCount: 0,
        lastTickTime: 0,
      };
      this.playerData.set(playerId, data);
    }
    return data;
  }

  resetPlayer(playerId: string): void {
    this.playerData.delete(playerId);
  }

  getStats(): { totalPlayers: number; bannedPlayers: number; totalViolations: number } {
    let totalViolations = 0;
    for (const data of this.playerData.values()) {
      totalViolations += data.violations.length;
    }
    return {
      totalPlayers: this.playerData.size,
      bannedPlayers: this.bannedPlayers.size,
      totalViolations,
    };
  }
}
