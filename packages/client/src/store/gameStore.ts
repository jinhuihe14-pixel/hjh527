import { create } from 'zustand'
import { GameStateData, RoomInfo, MessageType, PlayerInput } from '@nebula/shared'
import { GAME_CONFIG } from '@nebula/shared'
import { gameSocket } from '../services/gameSocket'

interface GameState {
  isConnected: boolean
  isInRoom: boolean
  isInGame: boolean
  roomInfo: RoomInfo | null
  gameState: GameStateData | null
  lastTick: number
  ping: number
  
  connect: (roomId: string, playerId: string, nickname: string, avatar: string) => void
  disconnect: () => void
  sendInput: (input: PlayerInput) => void
  sendSkill: (skillType: string) => void
  sendChat: (message: string) => void
  setReady: (isReady: boolean) => void
  startGame: () => void
  leaveRoom: () => void
  createRoom: (mode: string, maxPlayers: number, name: string) => void
  joinRoom: (roomId: string) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  isConnected: false,
  isInRoom: false,
  isInGame: false,
  roomInfo: null,
  gameState: null,
  lastTick: 0,
  ping: 0,

  connect: (roomId: string, playerId: string, nickname: string, avatar: string) => {
    gameSocket.connect(roomId, playerId, nickname, avatar)
    
    gameSocket.on('connect', () => {
      set({ isConnected: true })
    })

    gameSocket.on('disconnect', () => {
      set({ isConnected: false, isInRoom: false, isInGame: false })
    })

    gameSocket.on(MessageType.ROOM_INFO, (data: any) => {
      set({ roomInfo: data, isInRoom: true })
    })

    gameSocket.on(MessageType.GAME_START, () => {
      set({ isInGame: true })
    })

    gameSocket.on(MessageType.GAME_STATE, (state: GameStateData) => {
      set({ gameState: state, lastTick: state.tick })
    })

    gameSocket.on(MessageType.GAME_END, () => {
      set({ isInGame: false })
    })

    gameSocket.on(MessageType.PLAYER_LEFT, () => {
      // 更新房间信息
    })
  },

  disconnect: () => {
    gameSocket.disconnect()
    set({ isConnected: false, isInRoom: false, isInGame: false, roomInfo: null, gameState: null })
  },

  sendInput: (input: PlayerInput) => {
    gameSocket.send(MessageType.PLAYER_INPUT, input)
  },

  sendSkill: (skillType: string) => {
    gameSocket.send(MessageType.PLAYER_SKILL, { skillType })
  },

  sendChat: (message: string) => {
    gameSocket.send(MessageType.PLAYER_CHAT, { message })
  },

  setReady: (isReady: boolean) => {
    gameSocket.send(MessageType.PLAYER_READY, { isReady })
  },

  startGame: () => {
    gameSocket.emit('start_game')
  },

  leaveRoom: () => {
    gameSocket.emit('leave_room')
    set({ isInRoom: false, roomInfo: null, isInGame: false, gameState: null })
  },

  createRoom: (mode: string, maxPlayers: number, name: string) => {
    gameSocket.emit('create_room', { mode, maxPlayers, name })
  },

  joinRoom: (roomId: string) => {
    gameSocket.emit('join_room', { roomId })
  },
}))
