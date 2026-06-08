import { Router, Request, Response } from 'express';
import { DataStore } from '../../data/DataStore';
import { TaskType, GameFeature } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.get('/list', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { type } = req.query;

  if (!dataStore.isFeatureEnabled(GameFeature.TASKS)) {
    return res.status(403).json({ error: '任务功能暂未开启' });
  }

  const taskType = type === 'weekly' ? TaskType.WEEKLY : TaskType.DAILY;
  const tasks = dataStore.getPlayerTasks(userId, taskType);

  res.json({
    tasks,
    total: tasks.length,
  });
});

router.get('/daily', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  if (!dataStore.isFeatureEnabled(GameFeature.TASKS)) {
    return res.status(403).json({ error: '任务功能暂未开启' });
  }

  const tasks = dataStore.getPlayerTasks(userId, TaskType.DAILY);

  res.json({
    tasks,
    total: tasks.length,
  });
});

router.get('/weekly', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  if (!dataStore.isFeatureEnabled(GameFeature.TASKS)) {
    return res.status(403).json({ error: '任务功能暂未开启' });
  }

  const tasks = dataStore.getPlayerTasks(userId, TaskType.WEEKLY);

  res.json({
    tasks,
    total: tasks.length,
  });
});

router.post('/claim/:taskId', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { taskId } = req.params;

  if (!dataStore.isFeatureEnabled(GameFeature.TASKS)) {
    return res.status(403).json({ error: '任务功能暂未开启' });
  }

  const result = dataStore.claimTaskReward(userId, taskId);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    success: true,
    rewards: result.rewards,
  });
});

router.post('/claim-all', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { type } = req.body;

  if (!dataStore.isFeatureEnabled(GameFeature.TASKS)) {
    return res.status(403).json({ error: '任务功能暂未开启' });
  }

  const taskType = type === 'weekly' ? TaskType.WEEKLY : TaskType.DAILY;
  const tasks = dataStore.getPlayerTasks(userId, taskType);
  const completedTasks = tasks.filter((t) => t.progress.status === 'completed');

  const claimedRewards: any[] = [];
  let successCount = 0;

  for (const task of completedTasks) {
    const result = dataStore.claimTaskReward(userId, task.config.id);
    if (result.success && result.rewards) {
      claimedRewards.push(...result.rewards);
      successCount++;
    }
  }

  res.json({
    success: true,
    claimedCount: successCount,
    totalCount: completedTasks.length,
    rewards: claimedRewards,
  });
});

export { router as taskRouter };
