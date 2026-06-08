import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { gameSocket } from '../services/gameSocket'
import { 
  Users, MessageSquare, Send, Play, LogOut, Crown, 
  Settings, Copy, Check, Volume2 
} from 'lucide-react'
import { RoomStatus, MessageType, RANK_CONFIG, GameMode } from '@nebula/shared'

interface ChatMessage {
  playerId: string
  nickname: string
  message: string
  timestamp: number
}

function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { roomInfo, isConnected, isInGame, setReady, startGame, leaveRoom } = useGameStore()
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isReady, setIsReadyState] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !roomId) return

    gameSocket.connect(roomId, user.id, user.nickname, user.avatar)

    gameSocket.on(MessageType.PLAYER_CHAT, (data: any) => {
      setChatMessages((prev) => [...prev, data])
    })

    gameSocket.on(MessageType.GAME_START, () => {
      navigate(`/game/${roomId}`)
    })

    return () => {
      gameSocket.off(MessageType.PLAYER_CHAT)
      gameSocket.off(MessageType.GAME_START)
    }
  }, [roomId, user, navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    gameSocket.send(MessageType.PLAYER_CHAT, { message: chatInput })
    setChatInput('')
  }

  const handleReady = () => {
    const newReady = !isReady
    setIsReadyState(newReady)
    setReady(newReady)
  }

  const handleStartGame = () => {
    startGame()
    navigate(`/game/${roomId}`)
  }

  const handleLeave = () => {
    leaveRoom()
    navigate('/')
  }

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = roomInfo?.hostId === user?.id
  const allReady = roomInfo?.players.every((p) => p.isReady)
  const canStart = isHost && allReady && (roomInfo?.players.length || 0) >= 4

  const modeName = {
    [GameMode.QUICK]: '快速对战',
    [GameMode.RANKED]: '排位赛',
    [GameMode.CUSTOM]: '自定义房间',
    [GameMode.TEAM]: '组队模式',
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-orbitron text-xl font-bold text-nebula-text">
                    {roomInfo?.name || '游戏房间'}
                  </h2>
                  <span 
                    className={`px-2 py-1 rounded text-xs font-rajdhani font-semibold ${
                      roomInfo?.status === RoomStatus.WAITING
                        ? 'bg-nebula-warning/20 text-nebula-warning'
                        : roomInfo?.status === RoomStatus.PLAYING
                        ? 'bg-nebula-success/20 text-nebula-success'
                        : 'bg-nebula-primary/20 text-nebula-primary'
                    }`}
                  >
                    {roomInfo?.status === RoomStatus.WAITING && '等待中'}
                    {roomInfo?.status === RoomStatus.READY && '准备就绪'}
                    {roomInfo?.status === RoomStatus.PLAYING && '游戏中'}
                    {roomInfo?.status === RoomStatus.ENDED && '已结束'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-nebula-text-secondary font-rajdhani">
                    房间号: {roomId}
                  </span>
                  <button
                    onClick={handleCopyRoomId}
                    className="text-nebula-primary hover:text-nebula-primary/80 transition-colors"
                    title="复制房间号"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-nebula-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-nebula-text-secondary font-rajdhani">
                  {modeName[roomInfo?.mode as GameMode] || '自定义'}
                </span>
                <span className="text-sm font-rajdhani text-nebula-text">
                  <Users className="w-4 h-4 inline mr-1" />
                  {roomInfo?.players.length || 0}/{roomInfo?.maxPlayers || 6}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {roomInfo?.players.map((player, index) => {
                const tierInfo = RANK_CONFIG[player.rankTier as keyof typeof RANK_CONFIG]
                return (
                  <div
                    key={player.id}
                    className={`glass-card p-4 transition-all ${
                      player.isReady ? 'border-nebula-success/50' : ''
                    } ${player.id === user?.id ? 'ring-2 ring-nebula-primary/50' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ 
                            background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}, #1a1f3a)`,
                          }}
                        >
                          {player.avatar || '👤'}
                        </div>
                        {player.isHost && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-rajdhani font-semibold text-nebula-text truncate">
                          {player.nickname}
                          {player.id === user?.id && (
                            <span className="text-nebula-primary text-xs ml-1">(我)</span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: tierInfo?.color }}>
                          {tierInfo?.name || '青铜'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-rajdhani">
                        {player.team !== undefined ? `队伍 ${player.team + 1}` : ''}
                      </span>
                      {player.isReady ? (
                        <span className="text-xs text-nebula-success font-rajdhani font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          已准备
                        </span>
                      ) : (
                        <span className="text-xs text-nebula-text-secondary font-rajdhani">
                          未准备
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {Array.from({ length: Math.max(0, (roomInfo?.maxPlayers || 6) - (roomInfo?.players.length || 0)) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="glass-card p-4 border-dashed border-nebula-text-secondary/20 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-nebula-bg/50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-nebula-text-secondary" />
                    </div>
                    <div>
                      <p className="font-rajdhani text-nebula-text-secondary">等待加入...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={!canStart || roomInfo?.status === RoomStatus.PLAYING}
                  className={`neon-btn neon-btn-primary flex-1 flex items-center justify-center gap-2 ${
                    !canStart ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Play className="w-5 h-5" />
                  开始游戏
                </button>
              ) : (
                <button
                  onClick={handleReady}
                  className={`neon-btn flex-1 flex items-center justify-center gap-2 ${
                    isReady ? 'neon-btn-success' : ''
                  }`}
                >
                  {isReady ? (
                    <>
                      <Check className="w-5 h-5" />
                      取消准备
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      准备
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleLeave}
                className="neon-btn neon-btn-danger flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                离开
              </button>
            </div>
          </div>

          <div className="glass-card p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <h3 className="font-orbitron font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-nebula-primary" />
              房间设置
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-xs text-nebula-text-secondary font-rajdhani">游戏模式</p>
                <p className="font-rajdhani font-semibold text-nebula-text">
                  {modeName[roomInfo?.mode as GameMode] || '自定义'}
                </p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-xs text-nebula-text-secondary font-rajdhani">玩家数量</p>
                <p className="font-rajdhani font-semibold text-nebula-text">
                  {roomInfo?.maxPlayers || 6}人
                </p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-xs text-nebula-text-secondary font-rajdhani">地图</p>
                <p className="font-rajdhani font-semibold text-nebula-text">
                  星云战场
                </p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-xs text-nebula-text-secondary font-rajdhani">游戏时长</p>
                <p className="font-rajdhani font-semibold text-nebula-text">
                  {Math.floor((roomInfo?.gameDuration || 300) / 60)}分钟
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-4 h-[500px] flex flex-col animate-slideInRight">
            <h3 className="font-orbitron font-bold text-nebula-text mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-nebula-secondary" />
              房间聊天
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-nebula-text-secondary text-sm font-rajdhani">
                  暂无聊天消息
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span 
                      className={`font-rajdhani font-semibold ${
                        msg.playerId === user?.id ? 'text-nebula-primary' : 'text-nebula-secondary'
                      }`}
                    >
                      {msg.nickname}:
                    </span>
                    <span className="text-nebula-text ml-2 font-rajdhani">
                      {msg.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="发送消息..."
                className="neon-input flex-1 text-sm"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-nebula-primary/20 text-nebula-primary
                  hover:bg-nebula-primary/30 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
