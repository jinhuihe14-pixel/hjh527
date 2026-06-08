import { MatchRequest, GameMode } from '@nebula/shared';
import { MATCH_CONFIG, GAME_CONFIG } from '@nebula/shared';

interface MatchGroup {
  players: MatchRequest[];
  avgPoints: number;
  score: number;
}

export class Matcher {
  findMatches(queue: { request: MatchRequest; currentRange: number }[], mode: GameMode): MatchRequest[][] {
    const matches: MatchRequest[][] = [];
    const available = [...queue].sort((a, b) => a.request.timestamp - b.request.timestamp);

    const targetSize = mode === GameMode.RANKED ? 6 : 6;

    while (available.length >= targetSize) {
      const bestGroup = this.findBestGroup(available, targetSize, mode);

      if (bestGroup) {
        matches.push(bestGroup);
        for (const player of bestGroup) {
          const idx = available.findIndex((a) => a.request.playerId === player.playerId);
          if (idx >= 0) available.splice(idx, 1);
        }
      } else {
        break;
      }
    }

    if (available.length >= GAME_CONFIG.MIN_PLAYERS_PER_GAME) {
      const fallbackGroup = this.findFallbackGroup(available, mode);
      if (fallbackGroup) {
        matches.push(fallbackGroup);
      }
    }

    return matches;
  }

  private findBestGroup(
    queue: { request: MatchRequest; currentRange: number }[],
    size: number,
    mode: GameMode
  ): MatchRequest[] | null {
    let bestGroup: MatchRequest[] | null = null;
    let bestScore = Infinity;

    for (let i = 0; i < queue.length; i++) {
      const basePlayer = queue[i];
      const group: MatchRequest[] = [basePlayer.request];
      const basePoints = basePlayer.request.rankPoints;
      const range = basePlayer.currentRange;

      const compatible = queue.filter((item) => {
        if (item.request.playerId === basePlayer.request.playerId) return false;
        const pointDiff = Math.abs(item.request.rankPoints - basePoints);
        return pointDiff <= range;
      });

      compatible.sort(
        (a, b) => Math.abs(a.request.rankPoints - basePoints) - Math.abs(b.request.rankPoints - basePoints)
      );

      for (let j = 0; j < Math.min(compatible.length, size - 1); j++) {
        group.push(compatible[j].request);
      }

      if (group.length >= GAME_CONFIG.MIN_PLAYERS_PER_GAME) {
        const score = this.calculateMatchScore(group, mode);
        if (score < bestScore) {
          bestScore = score;
          bestGroup = [...group];
        }
      }
    }

    return bestGroup;
  }

  private findFallbackGroup(
    queue: { request: MatchRequest; currentRange: number }[],
    mode: GameMode
  ): MatchRequest[] | null {
    const minPlayers = GAME_CONFIG.MIN_PLAYERS_PER_GAME;
    if (queue.length < minPlayers) return null;

    const sorted = [...queue].sort((a, b) => a.request.timestamp - b.request.timestamp);
    return sorted.slice(0, minPlayers).map((item) => item.request);
  }

  private calculateMatchScore(players: MatchRequest[], mode: GameMode): number {
    if (players.length === 0) return Infinity;

    const points = players.map((p) => p.rankPoints);
    const avgPoints = points.reduce((a, b) => a + b, 0) / points.length;
    const maxDiff = Math.max(...points) - Math.min(...points);

    const waitTimes = players.map((p) => Date.now() - p.timestamp);
    const avgWaitTime = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;

    const sizePenalty = Math.abs(players.length - 6) * 100;

    const pointDiffWeight = mode === GameMode.RANKED ? 2 : 0.5;
    const waitWeight = mode === GameMode.RANKED ? 1 : 2;

    return maxDiff * pointDiffWeight + avgWaitTime * 0.01 * waitWeight + sizePenalty;
  }

  createTeams(players: MatchRequest[]): { team1: MatchRequest[]; team2: MatchRequest[] } {
    const sorted = [...players].sort((a, b) => b.rankPoints - a.rankPoints);
    const team1: MatchRequest[] = [];
    const team2: MatchRequest[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) {
        team1.push(sorted[i]);
      } else {
        team2.push(sorted[i]);
      }
    }

    return { team1, team2 };
  }
}
