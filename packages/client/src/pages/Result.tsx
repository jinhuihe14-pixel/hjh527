import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  Trophy, Target, Skull, Sword, Shield, Clock, 
  Crown, ChevronUp, ChevronDown, RotateCcw, Home
} from 'lucide-react'
import { RANK_CONFIG } from '@nebula/shared'

interface PlayerStat {
  playerId: string
  nickname: string
  team: number
  kills: number
  deaths: number
  assists: number
  damage: number
  score: number
  rankChange: number
  result: 'win' | 'lose' | 'draw'
  isMVP?: boolean
  isPlayer?: boolean
}

function Result() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const rankInfo = useAuthStore((state) => state.rankInfo)
  const [loading, setLoading] = useState(true)
  const [isWin, setIsWin] = useState(false)
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [rankChange, setRankChange] = useState(0)
  const [rewards, setRewards] = useState({ coins: 0, exp: 0 })
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const mockStats: PlayerStat[] = [
        { playerId: 'player1', nickname: '星际猎手', team: 0, kills: 15, deaths: 5, assists: 3, damage: 2500, score: 1500, rankChange: 25, result: 'win', isMVP: true, isPlayer: true },
        { playerId: 'player2', nickname: '幻影刺客', team: 1, kills: 12, deaths: 7, assists: 5, damage: 1800, score: 1200, rankChange: -15, result: 'lose' },
        { playerId: 'player3', nickname: '星云战士', team: 0, kills: 10, deaths: 6, assists: 8, damage: 1500, score: 1000, rankChange: 20, result: 'win' },
        { playerId: 'player4', nickname: '光速战机', team: 1, kills: 8, deaths: 10, assists: 4, damage: 1200, score: 800, rankChange: -18, result: 'lose' },
        { playerId: 'player5', nickname: '暗夜游侠', team: 0, kills: 6, deaths: 8, assists: 10, damage: 900, score: 600, rankChange: 15, result: 'win' },
        { playerId: 'player6', nickname: '量子追击', team: 1, kills: 5, deaths: 12, assists: 2, damage: 700, score: 500, rankChange: -20, result: 'lose' },
      ]

      setPlayerStats(mockStats)
      setIsWin(true)
      setRankChange(25)
      setRewards({ coins: 200, exp: 150 })
      setLoading(false)
      
      setTimeout(() => {
        setShowAnimation(true)
      }, 300)
    }, 1000)
  }, [gameId])

  const handlePlayAgain = () => {
    navigate('/match?mode=quick')
  }

  const handleBackToLobby = () => {
    navigate('/')
  }

  const myStat = playerStats.find(s => s.isPlayer)

  const tierInfo = rankInfo?.tier 
    ? RANK_CONFIG[rankInfo.tier as keyof typeof RANK_CONFIG] 
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nebula-primary/30 border-t-nebula-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-nebula-text-secondary font-rajdhani">正在结算...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="animate-scaleIn">
          <div className="text-center mb-8">
            <div className={`inline-block mb-4 ${showAnimation ? 'animate-bounce' : ''}`}>
              {isWin ? (
                <Trophy 
                  className="w-24 h-24 text-yellow-400 mx-auto" 
                  style={{ filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.6))' }}
                />
              ) : (
                <Target className="w-24 h-24 text-nebula-secondary mx-auto" />
              )}
            </div>
            <h1 
              className={`font-orbitron text-5xl font-bold mb-2 neon-text ${
                isWin ? 'text-yellow-400' : 'text-nebula-secondary'
              }`}
            >
              {isWin ? '胜利！' : '失败'}
            </h1>
            <p className="text-nebula-text-secondary font-rajdhani text-lg">
              {isWin ? '恭喜你赢得了这场比赛！' : '再接再厉，下次一定行！'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-orbitron font-bold text-yellow-400">
                {myStat?.score || 0}
              </p>
              <p className="text-sm text-nebula-text-secondary font-rajdhani">总得分</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Skull className="w-8 h-8 text-nebula-danger mx-auto mb-2" />
              <p className="text-3xl font-orbitron font-bold text-nebula-danger">
                {myStat?.kills || 0}
              </p>
              <p className="text-sm text-nebula-text-secondary font-rajdhani">击杀数</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Clock className="w-8 h-8 text-nebula-primary mx-auto mb-2" />
              <p className="text-3xl font-orbitron font-bold text-nebula-primary">
                5:00
              </p>
              <p className="text-sm text-nebula-text-secondary font-rajdhani">游戏时长</p>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron font-bold text-nebula-text">
                <Crown className="w-5 h-5 inline mr-2 text-yellow-400" />
                战绩排名
              </h2>
              <span className="text-sm text-nebula-text-secondary font-rajdhani">
                共 {playerStats.length} 名玩家
              </span>
            </div>
            
            <div className="space-y-2">
              {playerStats.map((stat, index) => (
                <div
                  key={stat.playerId}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    stat.isPlayer 
                      ? 'bg-nebula-primary/20 border border-nebula-primary/50' 
                      : 'bg-nebula-bg/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-rajdhani font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-nebula-bg-lighter text-nebula-text-secondary'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {stat.isMVP && (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`font-rajdhani font-semibold ${
                      stat.isPlayer ? 'text-nebula-primary' : 'text-nebula-text'
                    }`}>
                      {stat.nickname}
                      {stat.isPlayer && <span className="text-xs ml-2">(我)</span>}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-orbitron font-bold text-nebula-text">{stat.kills}</p>
                      <p className="text-xs text-nebula-text-secondary">击杀</p>
                    </div>
                    <div className="text-center">
                      <p className="font-orbitron font-bold text-nebula-text">{stat.deaths}</p>
                      <p className="text-xs text-nebula-text-secondary">死亡</p>
                    </div>
                    <div className="text-center">
                      <p className="font-orbitron font-bold text-nebula-text">{stat.assists}</p>
                      <p className="text-xs text-nebula-text-secondary">助攻</p>
                    </div>
                    <div className="text-center w-20">
                      <p className="font-orbitron font-bold text-yellow-400">{stat.score}</p>
                      <p className="text-xs text-nebula-text-secondary">得分</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">
                段位变化
              </h3>
              
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}, #1a1f3a)`,
                      boxShadow: `0 0 15px ${tierInfo?.color || '#666'}40`
                    }}
                  >
                    {user?.avatar || '🎮'}
                  </div>
                  <p className="text-sm mt-2" style={{ color: tierInfo?.color }}>
                    {tierInfo?.name || '青铜'}
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  {rankChange >= 0 ? (
                    <ChevronUp className="w-8 h-8 text-nebula-success" />
                  ) : (
                    <ChevronDown className="w-8 h-8 text-nebula-danger" />
                  )}
                  <span className={`font-orbitron font-bold text-xl ${
                    rankChange >= 0 ? 'text-nebula-success' : 'text-nebula-danger'
                  }`}>
                    {rankChange >= 0 ? '+' : ''}{rankChange}
                  </span>
                  <span className="text-xs text-nebula-text-secondary">积分</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">
                获得奖励
              </h3>
              
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">🪙</span>
                  </div>
                  <p className="font-orbitron font-bold text-yellow-400 text-xl">
                    +{rewards.coins}
                  </p>
                  <p className="text-xs text-nebula-text-secondary font-rajdhani">金币</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <p className="font-orbitron font-bold text-cyan-400 text-xl">
                    +{rewards.exp}
                  </p>
                  <p className="text-xs text-nebula-text-secondary font-rajdhani">经验</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="neon-btn neon-btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              再来一局
            </button>
            <button
              onClick={handleBackToLobby}
              className="neon-btn flex-1 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              返回大厅
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Result
