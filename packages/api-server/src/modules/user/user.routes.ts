import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../middleware/auth';
import { DataStore } from '../../data/DataStore';
import { RankTier, getRankTier } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.post('/guest-login', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { user, token: guestToken } = dataStore.createGuestUser();
  const jwtToken = generateToken(user.id);

  const rankRecord = dataStore.getRankRecord(user.id);

  res.json({
    success: true,
    token: jwtToken,
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      diamonds: user.diamonds,
      vipLevel: user.vipLevel,
      isGuest: true,
    },
    rank: rankRecord
      ? {
          tier: rankRecord.rankTier,
          points: rankRecord.rankPoints,
          highestTier: rankRecord.highestTier,
          winStreak: rankRecord.winStreak,
        }
      : null,
  });
});

router.post('/register', (req: AuthRequest, res: Response) => {
  const { username, password, nickname } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少6位' });
  }

  const dataStore = req.dataStore!;

  if (dataStore.getUserByUsername(username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = dataStore.createUser(username, passwordHash, nickname);
  const token = generateToken(user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
    },
  });
});

router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  const dataStore = req.dataStore!;
  const user = dataStore.getUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (user.status === 'banned') {
    if (user.banEndTime && user.banEndTime > Date.now()) {
      const banDays = Math.ceil((user.banEndTime - Date.now()) / (24 * 60 * 60 * 1000));
      return res.status(403).json({ error: `账号已封禁，剩余${banDays}天` });
    } else {
      dataStore.unbanUser(user.id);
    }
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  dataStore.updateUser(user.id, { lastLogin: Date.now() });
  const token = generateToken(user.id);
  const rankRecord = dataStore.getRankRecord(user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      diamonds: user.diamonds,
      vipLevel: user.vipLevel,
    },
    rank: rankRecord
      ? {
          tier: rankRecord.rankTier,
          points: rankRecord.rankPoints,
          highestTier: rankRecord.highestTier,
          winStreak: rankRecord.winStreak,
          gamesPlayed: rankRecord.gamesPlayed,
          wins: rankRecord.wins,
          losses: rankRecord.losses,
        }
      : null,
  });
});

router.get('/info', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  const user = dataStore.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const rankRecord = dataStore.getRankRecord(userId);
  const rank = dataStore.getUserRank(userId);

  res.json({
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      diamonds: user.diamonds,
      vipLevel: user.vipLevel,
      status: user.status,
    },
    rank: rankRecord
      ? {
          tier: rankRecord.rankTier,
          tierName: getRankTier(rankRecord.rankPoints),
          points: rankRecord.rankPoints,
          highestTier: rankRecord.highestTier,
          highestPoints: rankRecord.highestPoints,
          winStreak: rankRecord.winStreak,
          gamesPlayed: rankRecord.gamesPlayed,
          wins: rankRecord.wins,
          losses: rankRecord.losses,
          rank,
        }
      : null,
  });
});

router.post('/update', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { nickname, avatar } = req.body;

  const updates: any = {};
  if (nickname) updates.nickname = nickname;
  if (avatar) updates.avatar = avatar;

  const user = dataStore.updateUser(userId, updates);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
    },
  });
});

export { router as userRouter };
