import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameRoomManager } from './game/GameRoomManager';
import { AnticheatSystem } from './anticheat/AnticheatSystem';
import { GameLogger } from './utils/GameLogger';
import { MessageType, RoomStatus } from '@nebula/shared';
import { RECONNECT_CONFIG } from '@nebula/shared';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingInterval: 10000,
  pingTimeout: 5000,
});

app.use(cors());
app.use(express.json());

const roomManager = new GameRoomManager();
const anticheatSystem = new AnticheatSystem();
const logger = new GameLogger();

interface PlayerConnection {
  socket: Socket;
  playerId: string;
  roomId: string | null;
  lastHeartbeat: number;
}

const connections = new Map<string, PlayerConnection>();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: roomManager.getRoomCount(),
    players: connections.size,
  });
});

app.get('/rooms/:roomId', (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room.getRoomInfo());
});

io.on('connection', (socket: Socket) => {
  const playerId = socket.handshake.query.playerId as string;
  const roomId = socket.handshake.query.roomId as string;
  const nickname = socket.handshake.query.nickname as string || 'Player';
  const avatar = socket.handshake.query.avatar as string || '';

  if (!playerId) {
    socket.disconnect();
    return;
  }

  connections.set(socket.id, {
    socket,
    playerId,
    roomId: null,
    lastHeartbeat: Date.now(),
  });

  logger.log('connection', `Player connected: ${playerId}`, { socketId: socket.id });

  socket.on(MessageType.HEARTBEAT, (data) => {
    const conn = connections.get(socket.id);
    if (conn) {
      conn.lastHeartbeat = Date.now();
      socket.emit(MessageType.HEARTBEAT, { timestamp: Date.now(), clientTimestamp: data?.timestamp });
    }
  });

  socket.on(MessageType.PLAYER_CHAT, (data) => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room) {
        room.broadcast(MessageType.PLAYER_CHAT, {
          playerId,
          nickname,
          message: data.message,
          timestamp: Date.now(),
        });
        logger.log('chat', `${nickname}: ${data.message}`, { roomId: conn.roomId, playerId });
      }
    }
  });

  socket.on(MessageType.PLAYER_READY, (data) => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room) {
        room.setPlayerReady(playerId, data?.isReady ?? true);
      }
    }
  });

  socket.on('join_room', (data: { roomId: string }) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.getStatus() !== RoomStatus.WAITING && room.getStatus() !== RoomStatus.READY) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const playerInfo = {
      id: playerId,
      nickname,
      avatar,
      isReady: false,
      isHost: false,
    };

    if (room.addPlayer(socket, playerInfo)) {
      conn.roomId = data.roomId;
      socket.join(data.roomId);
      socket.emit(MessageType.ROOM_INFO, room.getRoomInfo());
      logger.log('room_join', `Player ${nickname} joined room ${data.roomId}`, { roomId: data.roomId, playerId });
    } else {
      socket.emit('error', { message: 'Room is full' });
    }
  });

  socket.on('create_room', (data: { mode: string; maxPlayers?: number; name?: string }) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const room = roomManager.createRoom({
      mode: data.mode as any,
      maxPlayers: data.maxPlayers || 6,
      name: data.name || `${nickname}的房间`,
      hostId: playerId,
      hostSocket: socket,
      hostInfo: {
        id: playerId,
        nickname,
        avatar,
        isReady: true,
        isHost: true,
      },
    });

    conn.roomId = room.id;
    socket.join(room.id);
    socket.emit(MessageType.ROOM_INFO, room.getRoomInfo());
    logger.log('room_create', `Room created: ${room.id} by ${nickname}`, { roomId: room.id, playerId });
  });

  socket.on('start_game', () => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room && room.isHost(playerId)) {
        if (room.canStart()) {
          room.startGame();
          logger.log('game_start', `Game started in room ${conn.roomId}`, { roomId: conn.roomId });
        } else {
          socket.emit('error', { message: 'Not enough ready players' });
        }
      }
    }
  });

  socket.on(MessageType.PLAYER_INPUT, (data) => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room && room.isPlaying()) {
        const detection = anticheatSystem.checkInput(playerId, data);
        if (detection.violation) {
          logger.log('anticheat', `Cheat detected: ${detection.type}`, { playerId, roomId: conn.roomId });
          anticheatSystem.handleViolation(playerId, detection);
          return;
        }
        room.handlePlayerInput(playerId, data);
      }
    }
  });

  socket.on(MessageType.PLAYER_SKILL, (data) => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room && room.isPlaying()) {
        room.handlePlayerSkill(playerId, data);
      }
    }
  });

  socket.on(MessageType.RECONNECT_REQUEST, (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const oldRoomId = data.roomId;
    const room = roomManager.getRoom(oldRoomId);

    if (room && room.isPlaying()) {
      if (room.reconnectPlayer(socket, playerId, nickname, avatar)) {
        conn.roomId = oldRoomId;
        socket.join(oldRoomId);
        const reconnectState = room.getReconnectState(playerId);
        socket.emit(MessageType.RECONNECT_STATE, reconnectState);
        logger.log('reconnect', `Player ${nickname} reconnected`, { roomId: oldRoomId, playerId });
      } else {
        socket.emit('error', { message: 'Reconnect failed' });
      }
    } else {
      socket.emit('error', { message: 'Room not available' });
    }
  });

  socket.on('leave_room', () => {
    const conn = connections.get(socket.id);
    if (conn && conn.roomId) {
      const room = roomManager.getRoom(conn.roomId);
      if (room) {
        room.removePlayer(playerId);
        socket.leave(conn.roomId);
      }
      conn.roomId = null;
    }
  });

  socket.on('disconnect', () => {
    const conn = connections.get(socket.id);
    if (conn) {
      if (conn.roomId) {
        const room = roomManager.getRoom(conn.roomId);
        if (room) {
          if (room.isPlaying()) {
            room.handleDisconnect(playerId);
            setTimeout(() => {
              if (!room.isPlayerConnected(playerId)) {
                room.removePlayer(playerId);
              }
            }, RECONNECT_CONFIG.RECONNECT_WINDOW);
          } else {
            room.removePlayer(playerId);
          }
        }
      }
      connections.delete(socket.id);
      logger.log('disconnect', `Player disconnected: ${playerId}`, { socketId: socket.id });
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [socketId, conn] of connections) {
    if (now - conn.lastHeartbeat > RECONNECT_CONFIG.DISCONNECT_TIMEOUT) {
      conn.socket.disconnect();
      connections.delete(socketId);
    }
  }
}, 5000);

setInterval(() => {
  roomManager.cleanupEmptyRooms();
}, 30000);

const PORT = process.env.GAME_SERVER_PORT || 9527;
const HOST = process.env.GAME_SERVER_HOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`🎮 Game Server running on ${HOST}:${PORT}`);
  console.log(`   WebSocket: ws://${HOST}:${PORT}`);
  console.log(`   Health: http://${HOST}:${PORT}/health`);
});

export { io, roomManager, anticheatSystem, logger };
