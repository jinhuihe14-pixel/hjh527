import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Loader2, X, Users, Clock, Zap, Trophy } from 'lucide-react'
import { GameMode } from '@nebula/shared'
import api from '../services/api'

function MatchMaking() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  
  const [waitTime, setWaitTime] = useState(0)
  const [matchedPlayers, setMatchedPlayers] = useState(0)
  const [isMatching, setIsMatching] = useState(false)
  const [error, setError] = useState('')
  
  const mode = (searchParams.get('mode') as GameMode) || GameMode.QUICK
  const targetPlayers = 6

  const modeInfo = {
    [GameMode.QUICK]: { name: '快速对战', icon: Zap, color: 'text-cyan-400' },
    [GameMode.RANKED]: { name: '排位赛', icon: Trophy, color: 'text-purple-400' },
    [GameMode.TEAM]: { name: '组队匹配', icon: Users, color: 'text-green-400' },
    [GameMode.CUSTOM]: { name: '自定义', icon: Users, color: 'text-orange-400' },
  }

  const currentMode = modeInfo[mode] || modeInfo[GameMode.QUICK]
  const Icon = currentMode.icon

  useEffect(() => {
    startMatchmaking()

    return () => {
      cancelMatchmaking()
    }
  }, [mode])

  useEffect(() => {
    if (!isMatching) return

    const timer = setInterval(() => {
      setWaitTime((prev) => prev + 1)
      setMatchedPlayers((prev) => {
        const target = Math.min(targetPlayers, 2 + Math.floor(waitTime / 5))
        return Math.min(target, prev + (Math.random() > 0.7 ? 1 : 0))
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isMatching, waitTime])

  const startMatchmaking = async () => {
    try {
      setIsMatching(true)
      setError('')
      
      await api.post('/match/start', {
        playerId: user?.id,
        mode,
        rankPoints: 1000,
      })

      // 实际项目中应该轮询或WebSocket通知匹配结果
      // 这里模拟匹配过程，5秒后跳转到房间
      setTimeout(() => {
        if (isMatching) {
          navigate('/room/demo-room-123')
        }
      }, 5000)
    } catch (err: any) {
      setError(err.response?.data?.error || '匹配失败')
      setIsMatching(false)
    }
  }

  const cancelMatchmaking = async () => {
    try {
      await api.post('/match/cancel', {
        playerId: user?.id,
      })
    } catch (err) {
      console.error('取消匹配失败:', err)
    }
    setIsMatching(false)
  }

  const handleCancel = () => {
    cancelMatchmaking()
    navigate('/')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md text-center animate-scaleIn">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-nebula-primary/30" />
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-nebula-primary
              animate-spin"
            style={{ animationDuration: '3s' }}
          />
          <div 
            className="absolute inset-4 rounded-full border-4 border-transparent border-t-nebula-secondary
              animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`w-10 h-10 ${currentMode.color} animate-pulse`} />
          </div>
        </div>

        <h2 className="font-orbitron text-2xl font-bold text-nebula-text mb-2">
          正在匹配
        </h2>
        <p className={`text-lg font-rajdhani font-semibold ${currentMode.color}`}>
          {currentMode.name}
        </p>

        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="bg-nebula-bg/50 rounded-lg p-4">
            <Clock className="w-6 h-6 text-nebula-primary mx-auto mb-2" />
            <p className="text-2xl font-orbitron font-bold text-nebula-text">
              {formatTime(waitTime)}
            </p>
            <p className="text-xs text-nebula-text-secondary font-rajdhani">等待时间</p>
          </div>
          <div className="bg-nebula-bg/50 rounded-lg p-4">
            <Users className="w-6 h-6 text-nebula-secondary mx-auto mb-2" />
            <p className="text-2xl font-orbitron font-bold text-nebula-text">
              {matchedPlayers}/{targetPlayers}
            </p>
            <p className="text-xs text-nebula-text-secondary font-rajdhani">已匹配</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-nebula-text-secondary mb-2 font-rajdhani">
            <span>匹配进度</span>
            <span>{Math.round((matchedPlayers / targetPlayers) * 100)}%</span>
          </div>
          <div className="neon-progress-bar h-3">
            <div 
              className="neon-progress-fill transition-all duration-500"
              style={{ width: `${(matchedPlayers / targetPlayers) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="text-nebula-danger text-sm mb-4 font-rajdhani">
            {error}
          </div>
        )}

        <button
          onClick={handleCancel}
          className="neon-btn neon-btn-danger w-full flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          取消匹配
        </button>

        <p className="text-xs text-nebula-text-secondary/60 mt-4 font-rajdhani">
          正在为您寻找实力相当的对手...
        </p>
      </div>
    </div>
  )
}

export default MatchMaking
