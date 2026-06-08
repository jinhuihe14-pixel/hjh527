import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { gameSocket } from '../services/gameSocket'
import { GameRenderer } from '../game/GameRenderer'
import { useGameInput } from '../hooks/useGameInput'
import { 
  Heart, Zap, Clock, Target, Skull, Trophy, 
  Sword, Shield, Flame, Wind, X
} from 'lucide-react'
import { 
  GameStateData, 
  PlayerInput, 
  MessageType, 
  formatTime,
  GAME_CONFIG 
} from '@nebula/shared'

interface KillFeedItem {
  killer: string
  victim: string
  timestamp: number
}

function Game() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const user = useAuthStore((state) => state.user)
  const { gameState, sendInput, sendSkill, isInGame } = useGameStore()
  
  const [showHUD, setShowHUD] = useState(true)
  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([])
  const [countdown, setCountdown] = useState(3)
  const [isCountingDown, setIsCountingDown] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const handleInput = useCallback((input: PlayerInput) => {
    sendInput(input)
  }, [sendInput])

  const { setPlayerPosition } = useGameInput(
    canvasRef as any,
    handleInput,
    isInGame && !isCountingDown
  )

  useEffect(() => {
    if (!canvasRef.current || !user || !roomId) return

    const renderer = new GameRenderer(canvasRef.current)
    rendererRef.current = renderer
    renderer.start()

    gameSocket.connect(roomId, user.id, user.nickname, user.avatar)

    gameSocket.on(MessageType.GAME_STATE, (state: GameStateData) => {
      renderer.setGameState(state)
      
      const player = state.players[user.id]
      if (player) {
        setPlayerPosition(player.position)
      }
    })

    gameSocket.on(MessageType.GAME_START, () => {
      setIsCountingDown(true)
      setCountdown(3)
      
      let count = 3
      const timer = setInterval(() => {
        count--
        setCountdown(count)
        if (count <= 0) {
          clearInterval(timer)
          setIsCountingDown(false)
        }
      }, 1000)
    })

    gameSocket.on(MessageType.KILL_EVENT, (data: any) => {
      setKillFeed((prev) => [
        {
          killer: data.killerId || 'Unknown',
          victim: data.victimId || 'Unknown',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 4),
      ])

      if (rendererRef.current && data.position) {
        rendererRef.current.spawnExplosion(
          data.position.x,
          data.position.y,
          '#ff3366',
          30
        )
      }
    })

    gameSocket.on(MessageType.GAME_END, () => {
      setGameOver(true)
      setTimeout(() => {
        navigate(`/result/${roomId}`)
      }, 3000)
    })

    return () => {
      gameSocket.off(MessageType.GAME_STATE)
      gameSocket.off(MessageType.GAME_START)
      gameSocket.off(MessageType.KILL_EVENT)
      gameSocket.off(MessageType.GAME_END)
      renderer.destroy()
      rendererRef.current = null
    }
  }, [roomId, user, navigate, setPlayerPosition])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExitConfirm((prev) => !prev)
      }
      if (e.key === '1') {
        sendSkill('dash')
      }
      if (e.key === '2') {
        sendSkill('shield')
      }
      if (e.key === '3') {
        sendSkill('missile')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sendSkill])

  const playerState = gameState?.players[user?.id || '']

  const skills = [
    { id: 'dash', name: '冲刺', icon: Wind, key: '1', cooldown: playerState?.skills?.dash?.cooldown || 0, maxCooldown: 5000, color: 'text-cyan-400' },
    { id: 'shield', name: '护盾', icon: Shield, key: '2', cooldown: playerState?.skills?.shield?.cooldown || 0, maxCooldown: 8000, color: 'text-green-400' },
    { id: 'missile', name: '导弹', icon: Flame, key: '3', cooldown: playerState?.skills?.missile?.cooldown || 0, maxCooldown: 10000, color: 'text-orange-400' },
  ]

  const handleSkillClick = (skillId: string) => {
    if (!isCountingDown && !gameOver) {
      sendSkill(skillId)
    }
  }

  const handleExit = () => {
    gameSocket.disconnect()
    navigate('/')
  }

  const sortedPlayers = gameState 
    ? Object.values(gameState.players).sort((a, b) => b.score - a.score)
    : []

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-nebula-bg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {showHUD && (
        <>
          <div className="absolute top-4 left-4 space-y-3">
            <div className="glass-card p-3 w-64">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-sm font-rajdhani text-nebula-text-secondary">生命值</span>
              </div>
              <div className="h-4 bg-nebula-bg/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                  style={{ 
                    width: `${playerState ? (playerState.health / playerState.maxHealth) * 100 : 100}%`,
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                  }}
                />
              </div>
              <div className="text-right text-xs text-nebula-text-secondary mt-1 font-rajdhani">
                {playerState?.health || 0} / {playerState?.maxHealth || 100}
              </div>
            </div>

            <div className="glass-card p-3 w-64">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-rajdhani text-nebula-text-secondary">能量值</span>
              </div>
              <div className="h-4 bg-nebula-bg/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-200"
                  style={{ 
                    width: `${playerState ? (playerState.energy / playerState.maxEnergy) * 100 : 100}%`,
                    boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)'
                  }}
                />
              </div>
              <div className="text-right text-xs text-nebula-text-secondary mt-1 font-rajdhani">
                {Math.floor(playerState?.energy || 0)} / {playerState?.maxEnergy || 100}
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="glass-card px-8 py-3 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-nebula-primary" />
                <span className="font-orbitron text-2xl font-bold text-nebula-primary">
                  {formatTime(gameState?.timeLeft || 0)}
                </span>
              </div>
              <div className="w-px h-8 bg-nebula-primary/30" />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-rajdhani text-nebula-text">
                  <span className="font-orbitron font-bold text-xl text-yellow-400">
                    {playerState?.score || 0}
                  </span>
                  <span className="text-sm text-nebula-text-secondary ml-1">分</span>
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <div className="glass-card p-3 w-48">
              <h3 className="font-orbitron font-bold text-nebula-text text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-nebula-secondary" />
                排行榜
              </h3>
              <div className="space-y-1">
                {sortedPlayers.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between text-sm py-1 px-2 rounded ${
                      player.id === user?.id ? 'bg-nebula-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 text-center font-rajdhani font-bold ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' : 'text-nebula-text-secondary'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`font-rajdhani truncate max-w-20 ${
                        player.id === user?.id ? 'text-nebula-primary' : 'text-nebula-text'
                      }`}>
                        {player.id.slice(0, 6)}
                      </span>
                    </div>
                    <span className="font-orbitron font-bold text-nebula-text">
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-24 right-4 w-64">
            <div className="space-y-2">
              {killFeed.map((kill, index) => (
                <div
                  key={kill.timestamp + index}
                  className="glass-card px-3 py-2 text-sm animate-fadeIn"
                  style={{ opacity: 1 - index * 0.15 }}
                >
                  <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-nebula-danger" />
                    <span className="text-nebula-danger font-rajdhani font-semibold">
                      {kill.killer.slice(0, 8)}
                    </span>
                    <span className="text-nebula-text-secondary">击杀了</span>
                    <span className="text-nebula-text font-rajdhani">
                      {kill.victim.slice(0, 8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="glass-card p-4 flex gap-4">
              {skills.map((skill) => {
                const Icon = skill.icon
                const cooldownPercent = (skill.cooldown / skill.maxCooldown) * 100
                const isOnCooldown = skill.cooldown > 0

                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillClick(skill.id)}
                    disabled={isOnCooldown || isCountingDown}
                    className={`relative w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
                      transition-all ${
                        isOnCooldown || isCountingDown
                          ? 'border-nebula-bg-lighter bg-nebula-bg/50 opacity-50 cursor-not-allowed'
                          : `border-current/50 bg-current/10 hover:bg-current/20 cursor-pointer ${skill.color}`
                      }`}
                    style={{ boxShadow: isOnCooldown ? 'none' : `0 0 15px currentColor` }}
                  >
                    {isOnCooldown && (
                      <div 
                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"
                        style={{ 
                          clipPath: `inset(${100 - cooldownPercent}% 0 0 0)` 
                        }}
                      />
                    )}
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-rajdhani mt-1">{skill.name}</span>
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-nebula-bg rounded-full 
                      text-xs font-rajdhani flex items-center justify-center border border-current/30">
                      {skill.key}
                    </span>
                    {isOnCooldown && (
                      <span className="absolute inset-0 flex items-center justify-center font-orbitron font-bold text-sm">
                        {(skill.cooldown / 1000).toFixed(1)}s
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="absolute bottom-4 left-4">
            <div className="glass-card px-3 py-2 text-xs text-nebula-text-secondary font-rajdhani">
              <p>WASD - 移动 | 鼠标 - 瞄准/射击</p>
              <p>1/2/3 - 技能 | ESC - 菜单</p>
            </div>
          </div>
        </>
      )}

      {isCountingDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center animate-scaleIn">
            <p className="font-orbitron text-nebula-primary text-2xl mb-4">准备战斗</p>
            <div 
              className="font-orbitron text-9xl font-bold text-nebula-primary neon-text animate-pulse"
            >
              {countdown}
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center animate-scaleIn">
            <h2 className="font-orbitron text-6xl font-bold text-nebula-primary neon-text mb-4">
              游戏结束
            </h2>
            <p className="text-nebula-text-secondary font-rajdhani text-xl">
              正在进入结算页面...
            </p>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="glass-card p-6 w-80 animate-scaleIn">
            <h3 className="font-orbitron text-xl font-bold text-nebula-text mb-4 text-center">
              确认退出？
            </h3>
            <p className="text-nebula-text-secondary text-center font-rajdhani mb-6">
              退出当前游戏将不会获得任何奖励
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="neon-btn flex-1"
              >
                继续游戏
              </button>
              <button
                onClick={handleExit}
                className="neon-btn neon-btn-danger flex-1"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
