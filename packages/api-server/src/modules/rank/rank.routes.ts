import { Router, Request, Response } from 'express';
import { DataStore } from '../../data/DataStore';
import { RankTier, getRankTier, RANK_CONFIG, LeaderboardType, GameFeature } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.get('/info', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  const rankRecord = dataStore.getRankRecord(userId);
  const user = dataStore.getUserById(userId);
  const rank = dataStore.getUserRank(userId);

  if (!rankRecord) {
    return res.status(404).json({ error: '排位信息不存在' });
  }

  const tierInfo = RANK_CONFIG[rankRecord.rankTier];
  const nextTier = rankRecord.rankTier < RankTier.CHALLENGER
    ? RANK_CONFIG[(rankRecord.rankTier + 1) as RankTier]
    : null;

  const currentTierPoints = tierInfo.minPoints;
  const nextTierPoints = nextTier?.minPoints || 6000;
  const progressInTier = rankRecord.rankPoints - currentTierPoints;
  const pointsToNext = nextTierPoints - currentTierPoints;
  const progress = Math.min(100, Math.round((progressInTier / pointsToNext) * 100));

  const winRate = rankRecord.gamesPlayed > 0
    ? Math.round((rankRecord.wins / rankRecord.gamesPlayed) * 100) / 100
    : 0;

  res.json({
    rank: {
      tier: rankRecord.rankTier,
      tierName: tierInfo.name,
      tierColor: tierInfo.color,
      points: rankRecord.rankPoints,
      highestTier: rankRecord.highestTier,
      highestPoints: rankRecord.highestPoints,
      winStreak: rankRecord.winStreak,
      rank,
      progress,
      nextTier: nextTier
        ? {
            tier: rankRecord.rankTier + 1,
            name: nextTier.name,
            pointsRequired: nextTier.minPoints,
          }
        : null,
    },
    stats: {
      gamesPlayed: rankRecord.gamesPlayed,
      wins: rankRecord.wins,
      losses: rankRecord.losses,
      winRate,
    },
    user: {
      nickname: user?.nickname,
      avatar: user?.avatar,
      level: user?.level,
    },
  });
});

router.get('/leaderboard', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { limit = 50, offset = 0, type = 'global' } = req.query;

  const leaderboardType = type as LeaderboardType;

  if (leaderboardType === LeaderboardType.WEEKLY && !dataStore.isFeatureEnabled(GameFeature.WEEKLY_RANK)) {
    return res.status(403).json({ error: '周榜功能暂未开启' });
  }

  let leaderboard;
  let total;
  let mine;

  if (leaderboardType === LeaderboardType.WEEKLY) {
    leaderboard = dataStore.getWeeklyLeaderboard(
      Math.min(100, parseInt(limit as string)),
      parseInt(offset as string)
    );
    total = leaderboard.length;
    const userId = req.userId!;
    const myRank = dataStore.getUserWeeklyRank(userId);
    const myRecord = dataStore.getRankRecord(userId);
    const weekPoints = dataStore.getWeeklyLeaderboard(1000, 0).find(e => e.userId === userId)?.weekPoints || 0;
    mine = myRank > 0
      ? {
          rank: myRank,
          points: weekPoints,
          tier: myRecord?.rankTier || RankTier.BRONZE,
        }
      : null;
  } else {
    leaderboard = dataStore.getLeaderboard(
      Math.min(100, parseInt(limit as string)),
      parseInt(offset as string)
    );
    total = leaderboard.length;
    const userId = req.userId!;
    const myRank = dataStore.getUserRank(userId);
    const myRecord = dataStore.getRankRecord(userId);
    mine = myRank > 0
      ? {
          rank: myRank,
          points: myRecord?.rankPoints || 0,
          tier: myRecord?.rankTier || RankTier.BRONZE,
        }
      : null;
  }

  res.json({
    leaderboard,
    total,
    type: leaderboardType,
    mine,
  });
});

router.get('/archives', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { periodType } = req.query;

  const archives = dataStore.getRankArchives(
    periodType as 'weekly' | 'monthly' | 'seasonal' | undefined
  );

  res.json({
    archives,
    total: archives.length,
  });
});

router.get('/archives/:archiveId', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { archiveId } = req.params;

  const archive = dataStore.getRankArchive(archiveId);

  if (!archive) {
    return res.status(404).json({ error: '归档不存在' });
  }

  res.json({
    archive,
  });
});

router.get('/history', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { limit = 20 } = req.query;

  const history = dataStore.getUserGameHistory(userId, parseInt(limit as string));

  res.json({
    history,
    total: history.length,
  });
});

export { router as rankRouter };
