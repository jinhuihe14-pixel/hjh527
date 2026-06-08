import { GameRoom } from './GameRoom';
import { GameMode, RoomStatus } from '@nebula/shared';

interface CreateRoomOptions {
  mode: GameMode;
  maxPlayers: number;
  name: string;
  hostId: string;
  hostSocket: any;
  hostInfo: any;
}

export class GameRoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(options: CreateRoomOptions): GameRoom {
    const room = new GameRoom(options);
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getActiveRooms(): GameRoom[] {
    return Array.from(this.rooms.values()).filter(
      (r) => r.getStatus() !== RoomStatus.ENDED
    );
  }

  findAvailableRoom(mode: GameMode, minPlayers: number = 4): GameRoom | null {
    const rooms = Array.from(this.rooms.values()).filter(
      (r) =>
        r.getMode() === mode &&
        r.getStatus() === RoomStatus.WAITING &&
        r.getPlayerCount() < r.getMaxPlayers() &&
        r.getPlayerCount() >= minPlayers - 1
    );

    if (rooms.length === 0) return null;
    return rooms[Math.floor(Math.random() * rooms.length)];
  }

  cleanupEmptyRooms(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      if (room.getPlayerCount() === 0 && now - room.getCreatedAt() > 60000) {
        room.destroy();
        this.rooms.delete(roomId);
      }
      if (room.getStatus() === RoomStatus.ENDED && now - room.getEndedAt() > 300000) {
        room.destroy();
        this.rooms.delete(roomId);
      }
    }
  }

  removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.destroy();
      this.rooms.delete(roomId);
    }
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }
}
