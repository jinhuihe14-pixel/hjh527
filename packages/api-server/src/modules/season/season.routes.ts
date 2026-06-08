import { Router, Request, Response } from 'express';
import { DataStore } from '../../data/DataStore';
import { SeasonInfo } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.get('/current', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;

  const currentSeason = dataStore.getCurrentSeason();
  if (!currentSeason) {
    return res.status(404).json({ error: '当前没有活跃的赛季' });
  }

  const now = Date.now();
  const timeLeft = Math.max(0, currentSeason.endTime - now);
  const totalDuration = currentSeason.endTime - currentSeason.startTime;
  const elapsed = now - currentSeason.startTime;
  const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  res.json({
    season: {
      id: currentSeason.id,
      name: currentSeason.name,
      startTime: currentSeason.startTime,
      endTime: currentSeason.endTime,
      status: currentSeason.status,
      timeLeft,
      progress,
    },
    rewards: currentSeason.rewards,
  });
});

router.get('/list', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;

  const seasons = dataStore.getAllSeasons();

  res.json({
    seasons: seasons.map((s) => ({
      id: s.id,
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
    })),
    total: seasons.length,
  });
});

router.get('/:seasonId/rank', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { seasonId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const leaderboard = dataStore.getLeaderboard(
    Math.min(100, parseInt(limit as string)),
    parseInt(offset as string)
  );

  res.json({
    seasonId,
    leaderboard,
    total: leaderboard.length,
  });
});

router.get('/:seasonId/rewards', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { seasonId } = req.params;

  const seasons = dataStore.getAllSeasons();
  const season = seasons.find((s) => s.id === seasonId);

  if (!season) {
    return res.status(404).json({ error: '赛季不存在' });
  }

  const userId = req.userId!;
  const rankRecord = dataStore.getRankRecord(userId);

  let claimedRewards: any[] = [];
  if (rankRecord && season.status === 'ended') {
    for (const reward of season.rewards) {
      if (rankRecord.highestTier >= reward.rankTier) {
        claimedRewards.push(reward);
      }
    }
  }

  res.json({
    seasonId,
    rewards: season.rewards,
    claimedRewards,
    playerTier: rankRecord?.highestTier || 0,
  });
});

export { router as seasonRouter };
