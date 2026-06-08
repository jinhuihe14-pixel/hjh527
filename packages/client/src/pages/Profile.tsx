import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  User, Settings, Award, History, Package, 
  ChevronRight, LogOut, Edit, Moon, Bell, Shield
} from 'lucide-react'
import { RANK_CONFIG } from '@nebula/shared'

function Profile() {
  const user = useAuthStore((state) => state.user)
  const rankInfo = useAuthStore((state) => state.rankInfo)
  const logout = useAuthStore((state) => state.logout)
  const [activeTab, setActiveTab] = useState('info')

  const tierInfo = rankInfo?.tier 
    ? RANK_CONFIG[rankInfo.tier as keyof typeof RANK_CONFIG] 
    : null

  const menuItems = [
    { key: 'info', label: '个人资料', icon: User },
    { key: 'history', label: '战绩记录', icon: History },
    { key: 'inventory', label: '我的背包', icon: Package },
    { key: 'achievements', label: '成就系统', icon: Award },
    { key: 'settings', label: '设置', icon: Settings },
  ]

  const achievements = [
    { id: 1, name: '初出茅庐', description: '完成第一场比赛', icon: '🎮', unlocked: true },
    { id: 2, name: '首胜', description: '赢得第一场比赛', icon: '🏆', unlocked: true },
    { id: 3, name: '十连胜', description: '连续赢得10场比赛', icon: '🔥', unlocked: false },
    { id: 4, name: '百场达人', description: '累计进行100场比赛', icon: '💯', unlocked: false },
    { id: 5, name: '神枪手', description: '单局击杀20人', icon: '🎯', unlocked: false },
    { id: 6, name: '不死战神', description: '单局0死亡获胜', icon: '🛡️', unlocked: false },
  ]

  const inventory = [
    { id: 1, name: '生命药剂', icon: '❤️', count: 5, type: '消耗品' },
    { id: 2, name: '能量药剂', icon: '⚡', count: 3, type: '消耗品' },
    { id: 3, name: '加速卷轴', icon: '💨', count: 2, type: '消耗品' },
    { id: 4, name: '霓虹蓝战机', icon: '🔵', count: 1, type: '皮肤' },
    { id: 5, name: '彩虹拖尾', icon: '🌈', count: 1, type: '拖尾' },
  ]

  const matchHistory = [
    { id: 1, result: 'win', mode: '排位赛', score: 1250, kills: 15, deaths: 3, time: '10分钟前' },
    { id: 2, result: 'win', mode: '快速匹配', score: 980, kills: 10, deaths: 5, time: '30分钟前' },
    { id: 3, result: 'lose', mode: '排位赛', score: 520, kills: 5, deaths: 12, time: '1小时前' },
    { id: 4, result: 'win', mode: '快速匹配', score: 1100, kills: 12, deaths: 4, time: '2小时前' },
    { id: 5, result: 'lose', mode: '排位赛', score: 480, kills: 3, deaths: 15, time: '3小时前' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
            style={{ 
              background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}, #1a1f3a)`,
              boxShadow: `0 0 30px ${tierInfo?.color || '#666'}40`
            }}
          >
            {user?.avatar || '🎮'}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-orbitron text-2xl font-bold text-nebula-text">
                {user?.nickname || '玩家'}
              </h2>
              <span 
                className="text-xs px-2 py-1 rounded font-rajdhani font-semibold"
                style={{ 
                  backgroundColor: `${tierInfo?.color}20`,
                  color: tierInfo?.color 
                }}
              >
                {tierInfo?.name || '青铜'}
              </span>
              <button className="p-1.5 rounded-lg bg-nebula-bg-lighter/50 hover:bg-nebula-bg-lighter transition-colors">
                <Edit className="w-4 h-4 text-nebula-text-secondary" />
              </button>
            </div>
            <p className="text-nebula-text-secondary font-rajdhani mb-3">
              ID: {user?.id || 'player_001'}
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-orbitron font-bold text-nebula-primary text-lg">
                  {rankInfo?.points || 0}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">积分</p>
              </div>
              <div className="w-px h-10 bg-nebula-bg-lighter" />
              <div className="text-center">
                <p className="font-orbitron font-bold text-yellow-400 text-lg">
                  {rankInfo?.wins || 0}胜
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">
                  胜率 {rankInfo ? ((rankInfo.wins / (rankInfo.wins + rankInfo.losses)) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-px h-10 bg-nebula-bg-lighter" />
              <div className="text-center">
                <p className="font-orbitron font-bold text-nebula-text text-lg">
                  Lv.{user?.level || 1}
                </p>
                <p className="text-xs text-nebula-text-secondary font-rajdhani">等级</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-nebula-bg-lighter grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-nebula-bg/50">
            <p className="text-2xl font-orbitron font-bold text-yellow-400">
              {user?.coins?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-nebula-text-secondary font-rajdhani">金币</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-nebula-bg/50">
            <p className="text-2xl font-orbitron font-bold text-cyan-400">
              {user?.diamonds?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-nebula-text-secondary font-rajdhani">钻石</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-nebula-bg/50">
            <p className="text-2xl font-orbitron font-bold text-purple-400">
              0
            </p>
            <p className="text-xs text-nebula-text-secondary font-rajdhani">勋章</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <div className="glass-card p-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.key
                      ? 'bg-nebula-primary/20 text-nebula-primary'
                      : 'text-nebula-text-secondary hover:text-nebula-text hover:bg-nebula-bg-lighter/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-rajdhani font-semibold">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                </button>
              )
            })}
            
            <div className="border-t border-nebula-bg-lighter my-2" />
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-nebula-danger hover:bg-nebula-danger/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-rajdhani font-semibold">退出登录</span>
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'info' && (
            <div className="glass-card p-6 animate-fadeIn">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">个人资料</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-nebula-text-secondary font-rajdhani block mb-1">
                    昵称
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.nickname || ''}
                    className="w-full px-4 py-2 bg-nebula-bg/50 border border-nebula-bg-lighter rounded-lg 
                      text-nebula-text font-rajdhani focus:border-nebula-primary focus:outline-none
                      transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-nebula-text-secondary font-rajdhani block mb-1">
                    个性签名
                  </label>
                  <textarea
                    defaultValue="星际征战，永不言弃！"
                    rows={3}
                    className="w-full px-4 py-2 bg-nebula-bg/50 border border-nebula-bg-lighter rounded-lg 
                      text-nebula-text font-rajdhani focus:border-nebula-primary focus:outline-none
                      transition-colors resize-none"
                  />
                </div>

                <button className="neon-btn neon-btn-primary w-full">
                  保存修改
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-card p-6 animate-fadeIn">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">战绩记录</h3>
              
              <div className="space-y-3">
                {matchHistory.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-nebula-bg/30 
                      border border-nebula-bg-lighter/50 hover:border-nebula-primary/30 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      match.result === 'win' 
                        ? 'bg-nebula-success/20 text-nebula-success' 
                        : 'bg-nebula-danger/20 text-nebula-danger'
                    }`}>
                      {match.result === 'win' ? '🏆' : '💀'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-rajdhani font-semibold ${
                          match.result === 'win' ? 'text-nebula-success' : 'text-nebula-danger'
                        }`}>
                          {match.result === 'win' ? '胜利' : '失败'}
                        </span>
                        <span className="text-xs text-nebula-text-secondary font-rajdhani">
                          {match.mode}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-nebula-text-secondary font-rajdhani">
                        <span>击杀: {match.kills}</span>
                        <span>死亡: {match.deaths}</span>
                        <span>得分: {match.score}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-orbitron font-bold text-yellow-400">
                        {match.score}
                      </p>
                      <p className="text-xs text-nebula-text-secondary font-rajdhani">
                        {match.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="glass-card p-6 animate-fadeIn">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">我的背包</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-nebula-bg/30 border border-nebula-bg-lighter/50
                      hover:border-nebula-primary/30 transition-all text-center"
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="font-rajdhani font-semibold text-nebula-text text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-nebula-text-secondary font-rajdhani">
                      {item.type} x{item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="glass-card p-6 animate-fadeIn">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">成就系统</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-nebula-text-secondary font-rajdhani">
                  已解锁: {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-nebula-bg/30 border-nebula-bg-lighter/50 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <p className="font-rajdhani font-semibold text-nebula-text text-sm">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-nebula-text-secondary font-rajdhani mt-1">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card p-6 animate-fadeIn">
              <h3 className="font-orbitron font-bold text-nebula-text mb-4">设置</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-nebula-bg/30">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-nebula-text-secondary" />
                    <span className="font-rajdhani text-nebula-text">消息通知</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-nebula-primary relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-nebula-bg/30">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-nebula-text-secondary" />
                    <span className="font-rajdhani text-nebula-text">深色模式</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-nebula-primary relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-nebula-bg/30">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-nebula-text-secondary" />
                    <span className="font-rajdhani text-nebula-text">账号安全</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-nebula-text-secondary" />
                </div>

                <div className="pt-4">
                  <button className="neon-btn neon-btn-danger w-full">
                    注销账号
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
