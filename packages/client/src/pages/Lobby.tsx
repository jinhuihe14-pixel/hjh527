import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Swords, Trophy, Users, Zap, Play, Crown, Target, Shield } from 'lucide-react'
import { RANK_CONFIG } from '@nebula/shared'

function Lobby() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const rankInfo = useAuthStore((state) => state.rankInfo)

  const tierInfo = rankInfo?.tier ? RANK_CONFIG[rankInfo.tier as keyof typeof RANK_CONFIG] : null

  const gameModes = [
    {
      id: 'quick',
      name: '快速对战',
      description: '随机匹配，轻松娱乐',
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      players: '在线',
      action: '/match?mode=quick',
    },
    {
      id: 'ranked',
      name: '排位赛',
      description: '段位竞技，冲击王者',
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      players: '激烈',
      action: '/match?mode=ranked',
      highlight: true,
    },
    {
      id: 'custom',
      name: '自定义房间',
      description: '创建房间，好友开黑',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      players: '自由',
      action: '/room/create',
    },
    {
      id: 'team',
      name: '组队匹配',
      description: '邀请队友，并肩作战',
      icon: Swords,
      color: 'from-orange-500 to-red-500',
      players: '开黑',
      action: '/match?mode=team',
    },
  ]

  const handleQuickMatch = (mode: string) => {
    navigate(`/match?mode=${mode}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 animate-fadeIn">
            <h2 className="font-orbitron text-xl font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-nebula-primary" />
              选择模式
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameModes.map((mode, index) => {
                const Icon = mode.icon
                return (
                  <div
                    key={mode.id}
                    className={`glass-card glass-card-hover p-5 cursor-pointer animate-fadeIn`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleQuickMatch(mode.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${mode.color} 
                          flex items-center justify-center`}
                        style={{ boxShadow: `0 0 20px ${mode.highlight ? 'rgba(168, 85, 247, 0.4)' : 'rgba(0, 240, 255, 0.3)'}` }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-rajdhani text-nebula-text-secondary bg-nebula-bg/50 px-2 py-1 rounded">
                        {mode.players}
                      </span>
                    </div>
                    
                    <h3 className="font-orbitron font-bold text-nebula-text text-lg mb-1">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-nebula-text-secondary font-rajdhani mb-4">
                      {mode.description}
                    </p>
                    
                    <button className="neon-btn w-full py-2 text-sm">
                      <Play className="w-4 h-4 inline mr-2" />
                      开始
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <h2 className="font-orbitron text-xl font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-nebula-secondary" />
              活动公告
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-nebula-primary/5 border border-nebula-primary/20">
                <div className="w-2 h-2 rounded-full bg-nebula-primary animate-pulse" />
                <div className="flex-1">
                  <p className="font-rajdhani font-semibold text-nebula-text">
                    第一赛季火热进行中
                  </p>
                  <p className="text-sm text-nebula-text-secondary">
                    参与排位赛，冲段赢取专属奖励
                  </p>
                </div>
                <span className="text-xs text-nebula-primary font-rajdhani font-semibold">
                  NEW
                </span>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-nebula-bg/50 hover:bg-nebula-bg-lighter/30 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-nebula-secondary" />
                <div className="flex-1">
                  <p className="font-rajdhani text-nebula-text">
                    新皮肤上线：传奇黄金战机
                  </p>
                  <p className="text-sm text-nebula-text-secondary">
                    限时优惠，立即抢购
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-nebula-bg/50 hover:bg-nebula-bg-lighter/30 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-nebula-success" />
                <div className="flex-1">
                  <p className="font-rajdhani text-nebula-text">
                    周末双倍金币活动
                  </p>
                  <p className="text-sm text-nebula-text-secondary">
                    每周六日全天有效
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 animate-slideInRight">
            <h2 className="font-orbitron text-lg font-bold text-nebula-text mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              我的段位
            </h2>
            
            <div className="text-center py-4">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-3
                  animate-float"
                style={{ 
                  background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}, #1a1f3a)`,
                  boxShadow: `0 0 30px ${tierInfo?.color || '#666'}40`
                }}
              >
                {user?.avatar || '🎮'}
              </div>
              
              <h3 className="font-orbitron font-bold text-xl" style={{ color: tierInfo?.color }}>
                {tierInfo?.name || '青铜'}
              </h3>
              <p className="text-nebula-text-secondary font-rajdhani text-sm">
                {rankInfo?.points || 0} 积分
              </p>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs text-nebula-text-secondary mb-1 font-rajdhani">
                  <span>{tierInfo?.name || '青铜'}</span>
                  <span>下一段位</span>
                </div>
                <div className="neon-progress-bar">
                  <div 
                    className="neon-progress-fill"
                    style={{ width: `${rankInfo?.progress || 30}%` }}
                  />
                </div>
              </div>
              
              <button
                onClick={() => navigate('/rank')}
                className="mt-4 text-nebula-primary text-sm font-rajdhani hover:underline"
              >
                查看详情 →
              </button>
            </div>
          </div>

          <div className="glass-card p-6 animate-slideInRight" style={{ animationDelay: '100ms' }}>
            <h2 className="font-orbitron text-lg font-bold text-nebula-text mb-4">
              战绩统计
            </h2>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-orbitron font-bold text-nebula-primary">
                  {rankInfo?.gamesPlayed || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">总场次</p>
              </div>
              <div>
                <p className="text-2xl font-orbitron font-bold text-nebula-success">
                  {rankInfo?.wins || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">胜利</p>
              </div>
              <div>
                <p className="text-2xl font-orbitron font-bold text-nebula-danger">
                  {rankInfo?.losses || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">失败</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-nebula-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-nebula-text-secondary font-rajdhani">胜率</span>
                <span className="font-orbitron font-bold text-nebula-secondary">
                  {rankInfo?.gamesPlayed 
                    ? Math.round((rankInfo.wins / rankInfo.gamesPlayed) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="neon-progress-bar mt-2">
                <div 
                  className="neon-progress-fill"
                  style={{ 
                    width: `${rankInfo?.gamesPlayed 
                      ? (rankInfo.wins / rankInfo.gamesPlayed) * 100 
                      : 0}%`,
                    background: 'linear-gradient(90deg, #ff00ff, #8b5cf6)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby
