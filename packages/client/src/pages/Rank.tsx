import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import { 
  Trophy, Crown, Medal, Star, TrendingUp, 
  Calendar, ChevronRight, Award
} from 'lucide-react'
import { RANK_CONFIG, RankTier } from '@nebula/shared'

interface LeaderboardEntry {
  rank: number
  userId: string
  nickname: string
  avatar: string
  rankTier: number
  rankPoints: number
  winRate: number
}

function Rank() {
  const user = useAuthStore((state) => state.user)
  const rankInfo = useAuthStore((state) => state.rankInfo)
  const [tab, setTab] = useState<'rank' | 'leaderboard' | 'season'>('rank')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const tierInfo = rankInfo?.tier 
    ? RANK_CONFIG[rankInfo.tier as keyof typeof RANK_CONFIG] 
    : null

  useEffect(() => {
    loadLeaderboard()
  }, [tab])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      // 模拟数据
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        userId: `player_${i + 1}`,
        nickname: ['星云战神', '幻影刺客', '光速战机', '星际猎手', '暗夜游侠', 
          '量子追击', '银河守护', '风暴之眼', '极光剑圣', '暗影刺客',
          '烈焰战士', '冰霜法师', '雷霆之怒', '深海蛟龙', '沙漠雄鹰',
          '森林精灵', '火山领主', '冰晶女王', '光明骑士', '黑暗领主'][i] || `玩家${i + 1}`,
        avatar: ['🚀', '⚔️', '🛡️', '💎', '🔥', '⚡', '🌙', '🌟', '🎯', '💀',
          '🏆', '👑', '🎖️', '⚜️', '🔱', '🎪', '🎭', '🎨', '🎪', '🤖'][i] || '🎮',
        rankTier: Math.max(1, 7 - Math.floor(i / 3)),
        rankPoints: 6000 - i * 250 + Math.floor(Math.random() * 100),
        winRate: 60 + Math.random() * 30,
      }))

      setLeaderboard(mockLeaderboard)
    } catch (error) {
      console.error('加载排行榜失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const ranks = [
    { tier: RankTier.BRONZE, name: '青铜', minPoints: 0, icon: '🥉', color: '#CD7F32' },
    { tier: RankTier.SILVER, name: '白银', minPoints: 1000, icon: '🥈', color: '#C0C0C0' },
    { tier: RankTier.GOLD, name: '黄金', minPoints: 2000, icon: '🥇', color: '#FFD700' },
    { tier: RankTier.PLATINUM, name: '铂金', minPoints: 3000, icon: '💎', color: '#E5E4E2' },
    { tier: RankTier.DIAMOND, name: '钻石', minPoints: 4000, icon: '💠', color: '#B9F2FF' },
    { tier: RankTier.MASTER, name: '大师', minPoints: 5000, icon: '👑', color: '#9966CC' },
    { tier: RankTier.CHALLENGER, name: '王者', minPoints: 6000, icon: '🏆', color: '#FF4500' },
  ]

  const seasonInfo = {
    name: '第一赛季：星云启航',
    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
    progress: 33,
  }

  const myRank = rankInfo?.rank || 156

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-2 mb-6">
        {[
          { key: 'rank', label: '我的排位', icon: Trophy },
          { key: 'leaderboard', label: '排行榜', icon: Medal },
          { key: 'season', label: '赛季奖励', icon: Calendar },
        ].map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all ${
                tab === item.key
                  ? 'bg-nebula-primary/20 text-nebula-primary border border-nebula-primary/50'
                  : 'text-nebula-text-secondary hover:text-nebula-text hover:bg-nebula-bg-lighter/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'rank' && (
        <div className="animate-fadeIn">
          <div className="glass-card p-8 mb-6 text-center">
            <div 
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl mb-4
                animate-float"
              style={{ 
                background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}, #1a1f3a)`,
                boxShadow: `0 0 40px ${tierInfo?.color || '#666'}40`
              }}
            >
              {user?.avatar || '🎮'}
            </div>
            
            <h2 className="font-orbitron text-3xl font-bold mb-2" style={{ color: tierInfo?.color }}>
              {tierInfo?.name || '青铜'}
            </h2>
            <p className="text-nebula-text-secondary font-rajdhani text-lg mb-6">
              {rankInfo?.points || 0} 积分
            </p>

            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between text-sm text-nebula-text-secondary mb-2 font-rajdhani">
                <span>{tierInfo?.name}</span>
                <span>下一段位</span>
              </div>
              <div className="neon-progress-bar h-4">
                <div 
                  className="neon-progress-fill"
                  style={{ width: `${rankInfo?.progress || 30}%` }}
                />
              </div>
              <div className="text-right text-sm text-nebula-text-secondary mt-1 font-rajdhani">
                还需 {1000 - ((rankInfo?.points || 0) % 1000)} 分晋级
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-2xl font-orbitron font-bold text-nebula-primary">
                  {rankInfo?.gamesPlayed || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">总场次</p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-2xl font-orbitron font-bold text-nebula-success">
                  {rankInfo?.wins || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">胜利</p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-2xl font-orbitron font-bold text-nebula-danger">
                  {rankInfo?.losses || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">失败</p>
              </div>
              <div className="bg-nebula-bg/50 rounded-lg p-3">
                <p className="text-2xl font-orbitron font-bold text-yellow-400">
                  {rankInfo?.winStreak || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">连胜</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-orbitron font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              全部段位
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ranks.map((rank) => {
                const isCurrent = rank.tier === rankInfo?.tier
                return (
                  <div
                    key={rank.tier}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-nebula-primary/50 bg-nebula-primary/10'
                        : 'border-nebula-bg-lighter/30 bg-nebula-bg/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{rank.icon}</span>
                      <div>
                        <p className="font-rajdhani font-bold" style={{ color: rank.color }}>
                          {rank.name}
                        </p>
                        <p className="text-xs text-nebula-text-secondary font-rajdhani">
                          {rank.minPoints}+ 积分
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="ml-auto text-xs bg-nebula-primary/20 text-nebula-primary 
                          px-2 py-1 rounded font-rajdhani font-semibold">
                          当前
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="glass-card p-6 animate-fadeIn">
          <h3 className="font-orbitron font-bold text-nebula-text mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            全服排行榜
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-nebula-primary/30 border-t-nebula-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => {
                const tierName = RANK_CONFIG[entry.rankTier as keyof typeof RANK_CONFIG]?.name || '青铜'
                const tierColor = RANK_CONFIG[entry.rankTier as keyof typeof RANK_CONFIG]?.color || '#666'
                
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      entry.userId === user?.id
                        ? 'bg-nebula-primary/20 border border-nebula-primary/50'
                        : 'bg-nebula-bg/30 hover:bg-nebula-bg/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-rajdhani font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-nebula-bg-lighter text-nebula-text-secondary'
                    }`}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                    </div>
                    
                    <div className="text-2xl">{entry.avatar}</div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-rajdhani font-semibold truncate ${
                        entry.userId === user?.id ? 'text-nebula-primary' : 'text-nebula-text'
                      }`}>
                        {entry.nickname}
                      </p>
                      <p className="text-xs font-rajdhani" style={{ color: tierColor }}>
                        {tierName}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-orbitron font-bold text-nebula-text">
                        {entry.rankPoints}
                      </p>
                      <p className="text-xs text-nebula-text-secondary font-rajdhani">
                        胜率 {entry.winRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-nebula-primary/20">
            <div className="flex items-center justify-between p-4 rounded-lg bg-nebula-primary/10 border border-nebula-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nebula-bg flex items-center justify-center text-xl">
                  {user?.avatar || '🎮'}
                </div>
                <div>
                  <p className="font-rajdhani font-semibold text-nebula-primary">
                    我的排名
                  </p>
                  <p className="text-xs text-nebula-text-secondary font-rajdhani">
                    {tierInfo?.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-orbitron font-bold text-xl text-nebula-primary">
                  #{myRank}
                </p>
                <p className="text-sm text-nebula-text-secondary font-rajdhani">
                  {rankInfo?.points || 0} 分
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'season' && (
        <div className="animate-fadeIn space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-nebula-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-nebula-primary" />
                {seasonInfo.name}
              </h3>
              <span className="px-3 py-1 rounded-full bg-nebula-success/20 text-nebula-success text-sm font-rajdhani font-semibold">
                进行中
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-nebula-text-secondary mb-2 font-rajdhani">
                <span>赛季进度</span>
                <span>{seasonInfo.progress}%</span>
              </div>
              <div className="neon-progress-bar h-3">
                <div 
                  className="neon-progress-fill"
                  style={{ width: `${seasonInfo.progress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-nebula-text-secondary font-rajdhani">
              距离赛季结束还有约 60 天
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-orbitron font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              赛季奖励
            </h3>
            <p className="text-sm text-nebula-text-secondary font-rajdhani mb-4">
              赛季结束时根据最高段位发放奖励
            </p>

            <div className="space-y-3">
              {ranks.slice(0, 5).map((rank) => {
                const isAchieved = (rankInfo?.tier || 1) >= rank.tier
                
                return (
                  <div
                    key={rank.tier}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isAchieved
                        ? 'bg-nebula-success/10 border border-nebula-success/30'
                        : 'bg-nebula-bg/30 border border-nebula-bg-lighter/30 opacity-60'
                    }`}
                  >
                    <span className="text-3xl">{rank.icon}</span>
                    <div className="flex-1">
                      <p className="font-rajdhani font-bold" style={{ color: rank.color }}>
                        {rank.name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-nebula-bg/50 px-2 py-0.5 rounded font-rajdhani">
                          🪙 {rank.tier * 100} 金币
                        </span>
                        {rank.tier >= 3 && (
                          <span className="text-xs bg-nebula-bg/50 px-2 py-0.5 rounded font-rajdhani">
                            💎 {rank.tier * 10} 钻石
                          </span>
                        )}
                      </div>
                    </div>
                    {isAchieved && (
                      <span className="text-nebula-success font-rajdhani font-semibold">
                        ✓ 已达成
                      </span>
                    )}
                    {!isAchieved && (
                      <ChevronRight className="w-5 h-5 text-nebula-text-secondary" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rank
