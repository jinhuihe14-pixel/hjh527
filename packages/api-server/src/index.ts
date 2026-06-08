import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './modules/user/user.routes';
import { shopRouter } from './modules/shop/shop.routes';
import { rankRouter } from './modules/rank/rank.routes';
import { seasonRouter } from './modules/season/season.routes';
import { taskRouter } from './modules/task/task.routes';
import { achievementRouter } from './modules/achievement/achievement.routes';
import { authMiddleware } from './middleware/auth';
import { DataStore } from './data/DataStore';

dotenv.config();

const app = express();
const dataStore = new DataStore();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  (req as any).dataStore = dataStore;
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    users: dataStore.getUserCount(),
  });
});

app.use('/api/user', userRouter);
app.use('/api/shop', authMiddleware, shopRouter);
app.use('/api/rank', authMiddleware, rankRouter);
app.use('/api/season', authMiddleware, seasonRouter);
app.use('/api/task', authMiddleware, taskRouter);
app.use('/api/achievement', authMiddleware, achievementRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
  });
});

const PORT = Number(process.env.API_SERVER_PORT) || 3003;
const HOST = process.env.API_SERVER_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`📡 API Server running on ${HOST}:${PORT}`);
  console.log(`   API: http://${HOST}:${PORT}/api`);
  console.log(`   Health: http://${HOST}:${PORT}/health`);
});

export { app, dataStore };
