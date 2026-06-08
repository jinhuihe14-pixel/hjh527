import { io, Socket } from 'socket.io-client'
import { GAME_CONFIG, RECONNECT_CONFIG, MessageType } from '@nebula/shared'

class GameSocket {
  private socket: Socket | null = null
  private roomId: string = ''
  private playerId: string = ''
  private nickname: string = ''
  private avatar: string = ''
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map()
  private lastHeartbeat: number = 0
  private heartbeatInterval: NodeJS.Timeout | null = null

  connect(roomId: string, playerId: string, nickname: string, avatar: string): void {
    if (this.socket?.connected && this.roomId === roomId && this.playerId === playerId) {
      return
    }

    if (this.socket) {
      this.socket.disconnect()
      this.stopHeartbeat()
    }

    this.roomId = roomId
    this.playerId = playerId
    this.nickname = nickname
    this.avatar = avatar

    this.socket = io({
      query: {
        playerId,
        roomId,
        nickname,
        avatar,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: RECONNECT_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('[GameSocket] Connected')
      this.startHeartbeat()
      this.emit('join_room', { roomId })
    })

    this.socket.on('disconnect', () => {
      console.log('[GameSocket] Disconnected')
      this.stopHeartbeat()
    })

    this.socket.on('connect_error', (error) => {
      console.error('[GameSocket] Connection error:', error)
    })

    this.socket.onAny((event, ...args) => {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(args[0]?.data || args[0])
          } catch (e) {
            console.error('[GameSocket] Handler error:', e)
          }
        }
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.stopHeartbeat()
    this.eventHandlers.clear()
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (!handler) {
      this.eventHandlers.delete(event)
      return
    }
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, {
        type: event,
        timestamp: Date.now(),
        data,
      })
    }
  }

  send(type: string, data: any): void {
    this.emit(type, data)
  }

  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.emit(MessageType.HEARTBEAT, { timestamp: Date.now() })
      }
    }, RECONNECT_CONFIG.HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const gameSocket = new GameSocket()
export default gameSocket
