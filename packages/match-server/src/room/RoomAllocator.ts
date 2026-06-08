import axios from 'axios';

interface GameServer {
  id: string;
  url: string;
  wsUrl: string;
  capacity: number;
  currentLoad: number;
}

export class RoomAllocator {
  private gameServers: GameServer[] = [];

  constructor() {}

  addServer(server: GameServer): void {
    this.gameServers.push(server);
  }

  removeServer(serverId: string): void {
    const index = this.gameServers.findIndex((s) => s.id === serverId);
    if (index >= 0) {
      this.gameServers.splice(index, 1);
    }
  }

  async allocateRoom(playerCount: number, mode: string): Promise<{ serverId: string; roomId: string; wsUrl: string } | null> {
    const server = this.selectBestServer();
    if (!server) return null;

    try {
      const response = await axios.post(`${server.url}/rooms/create`, {
        mode,
        maxPlayers: playerCount,
      });

      server.currentLoad++;

      return {
        serverId: server.id,
        roomId: response.data.roomId,
        wsUrl: server.wsUrl,
      };
    } catch (error) {
      console.error('[RoomAllocator] Failed to create room:', error);
      return null;
    }
  }

  private selectBestServer(): GameServer | null {
    if (this.gameServers.length === 0) return null;

    let bestServer = this.gameServers[0];
    let lowestLoad = Infinity;

    for (const server of this.gameServers) {
      const load = server.currentLoad / server.capacity;
      if (load < lowestLoad && server.currentLoad < server.capacity) {
        lowestLoad = load;
        bestServer = server;
      }
    }

    return bestServer;
  }

  updateServerLoad(serverId: string, load: number): void {
    const server = this.gameServers.find((s) => s.id === serverId);
    if (server) {
      server.currentLoad = load;
    }
  }

  getServerList(): GameServer[] {
    return [...this.gameServers];
  }

  async checkServerHealth(): Promise<void> {
    for (const server of this.gameServers) {
      try {
        const response = await axios.get(`${server.url}/health`, { timeout: 3000 });
        server.currentLoad = response.data.rooms || 0;
      } catch (error) {
        console.warn(`[RoomAllocator] Server ${server.id} is unhealthy`);
      }
    }
  }
}
