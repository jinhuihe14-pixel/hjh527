import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MatchQueue } from './match/MatchQueue';
import { Matcher } from './match/Matcher';
import { RoomAllocator } from './room/RoomAllocator';
import { GameMode, MatchRequest, MatchResult, RoomPlayer } from '@nebula/shared';
import { MATCH_CONFIG } from '@nebula/shared';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const matchQueue = new MatchQueue();
const matcher = new Matcher();
const roomAllocator = new RoomAllocator();

const gameServers = [
  { id: 'gs-1', url: process.env.GAME_SERVER_URL || 'http://localhost:3001', wsUrl: process.env.GAME_SERVER_WS || 'ws://localhost:3001', capacity: 200 },
];

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    queueSize: matchQueue.size(),
    activeMatches: 0,
  });
});

app.get('/status', (req, res) => {
  res.json({
    queueSizes: {
      quick: matchQueue.getQueueSize(GameMode.QUICK),
      ranked: matchQueue.getQueueSize(GameMode.RANKED),
    },
    waitTimes: {
      quick: matchQueue.getAverageWaitTime(GameMode.QUICK),
      ranked: matchQueue.getAverageWaitTime(GameMode.RANKED),
    },
  });
});

app.post('/match/start', (req, res) => {
  const { playerId, mode, rankPoints, nickname, avatar, rankTier } = req.body;

  if (!playerId || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const request: MatchRequest = {
    playerId,
    mode: mode as GameMode,
    rankPoints: rankPoints || 1000,
    timestamp: Date.now(),
  };

  const existingRequest = matchQueue.find(playerId);
  if (existingRequest) {
    return res.json({
      success: true,
      message: 'Already in queue',
      inQueue: true,
      waitTime: Date.now() - existingRequest.timestamp,
    });
  }

  matchQueue.add(request, { nickname, avatar, rankTier });

  res.json({
    success: true,
    inQueue: true,
    waitTime: 0,
    queueSize: matchQueue.getQueueSize(mode as GameMode),
  });
});

app.post('/match/cancel', (req, res) => {
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'Missing playerId' });
  }

  const removed = matchQueue.remove(playerId);

  res.json({
    success: removed,
    inQueue: false,
  });
});

app.get('/match/status/:playerId', (req, res) => {
  const { playerId } = req.params;

  const request = matchQueue.find(playerId);
  if (request) {
    res.json({
      inQueue: true,
      mode: request.mode,
      waitTime: Date.now() - request.timestamp,
      queueSize: matchQueue.getQueueSize(request.mode),
    });
  } else {
    res.json({
      inQueue: false,
    });
  }
});

app.get('/match/found/:playerId', (req, res) => {
  const { playerId } = req.params;
  // 实际项目中可以用轮询或WebSocket推送匹配结果
  res.json({ found: false });
});

setInterval(() => {
  runMatchmaking();
}, MATCH_CONFIG.SCAN_INTERVAL);

function runMatchmaking(): void {
  const modes = [GameMode.QUICK, GameMode.RANKED];

  for (const mode of modes) {
    const queue = matchQueue.getQueue(mode);
    if (queue.length < GAME_CONFIG.MIN_PLAYERS_PER_GAME) continue;

    const matches = matcher.findMatches(queue, mode);

    for (const match of matches) {
      if (match.length >= GAME_CONFIG.MIN_PLAYERS_PER_GAME) {
        createMatch(match, mode);
      }
    }
  }
}

async function createMatch(players: MatchRequest[], mode: GameMode): Promise<void> {
  try {
    const gameServer = gameServers[0];

    const roomName = mode === GameMode.RANKED ? '排位赛对局' : '快速对战';
    const maxPlayers = 6;

    const roomPlayers: RoomPlayer[] = players.map((p, idx) => ({
      id: p.playerId,
      nickname: matchQueue.getPlayerInfo(p.playerId)?.nickname || 'Player',
      avatar: matchQueue.getPlayerInfo(p.playerId)?.avatar || '',
      rankTier: matchQueue.getPlayerInfo(p.playerId)?.rankTier || 1,
      isReady: false,
      isHost: idx === 0,
      team: idx % 2,
    }));

    for (const player of players) {
      matchQueue.remove(player.playerId);

      // 可以通过WebSocket通知玩家匹配成功
      console.log(`[MATCH] Match found for ${player.playerId} in mode ${mode}`);
    }

    console.log(`[MATCH] Created match with ${players.length} players, mode: ${mode}`);
    console.log(`[MATCH] Room will be on server: ${gameServer.url}`);
  } catch (error) {
    console.error('[MATCH] Failed to create match:', error);
    for (const player of players) {
      matchQueue.add(player, matchQueue.getPlayerInfo(player.playerId) || {});
    }
  }
}

const PORT = process.env.MATCH_SERVER_PORT || 3002;

app.listen(PORT, () => {
  console.log(`🎯 Match Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

import { GAME_CONFIG } from '@nebula/shared';

export { matchQueue, matcher, roomAllocator };
