import { Router, Request, Response } from 'express';
import { DataStore } from '../../data/DataStore';
import { AchievementCategory, GameFeature } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.get('/list', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { category } = req.query;

  if (!dataStore.isFeatureEnabled(GameFeature.ACHIEVEMENTS)) {
    return res.status(403).json({ error: '成就功能暂未开启' });
  }

  const cat = category ? (category as AchievementCategory) : undefined;
  const achievements = dataStore.getPlayerAchievements(userId, cat);

  const unlockedCount = achievements.filter(
    (a) => a.progress.status === 'unlocked' || a.progress.status === 'claimed'
  ).length;

  res.json({
    achievements,
    total: achievements.length,
    unlockedCount,
  });
});

router.get('/category/:category', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { category } = req.params;

  if (!dataStore.isFeatureEnabled(GameFeature.ACHIEVEMENTS)) {
    return res.status(403).json({ error: '成就功能暂未开启' });
  }

  const achievements = dataStore.getPlayerAchievements(userId, category as AchievementCategory);

  res.json({
    achievements,
    total: achievements.length,
  });
});

router.get('/stats', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  if (!dataStore.isFeatureEnabled(GameFeature.ACHIEVEMENTS)) {
    return res.status(403).json({ error: '成就功能暂未开启' });
  }

  const achievements = dataStore.getPlayerAchievements(userId);
  const total = achievements.length;
  const unlocked = achievements.filter(
    (a) => a.progress.status === 'unlocked' || a.progress.status === 'claimed'
  ).length;
  const claimed = achievements.filter((a) => a.progress.status === 'claimed').length;

  const categories: Record<string, { total: number; unlocked: number }> = {};
  for (const ach of achievements) {
    const cat = ach.config.category;
    if (!categories[cat]) {
      categories[cat] = { total: 0, unlocked: 0 };
    }
    categories[cat].total++;
    if (ach.progress.status === 'unlocked' || ach.progress.status === 'claimed') {
      categories[cat].unlocked++;
    }
  }

  res.json({
    total,
    unlocked,
    claimed,
    progress: total > 0 ? Math.round((unlocked / total) * 100) / 100 : 0,
    categories,
  });
});

router.post('/claim/:achievementId', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { achievementId } = req.params;

  if (!dataStore.isFeatureEnabled(GameFeature.ACHIEVEMENTS)) {
    return res.status(403).json({ error: '成就功能暂未开启' });
  }

  const result = dataStore.claimAchievementReward(userId, achievementId);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    success: true,
    rewards: result.rewards,
  });
});

export { router as achievementRouter };
