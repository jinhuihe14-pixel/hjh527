import { useEffect, useState } from 'react'
import api from '../services/api'
import { 
  Users, Gamepad2, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react'

interface StatsData {
  totalUsers: number
  onlineUsers: number
  playingUsers: number
  totalGames: number
  todayGames: number
  todayNewUsers: number
  peakOnline: number
  totalBanned: number
  pendingAnticheat: number
  revenue: {
    today: number
    week: number
    month: number
  }
}

function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #334155', 
          borderTopColor: '#38bdf8', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    { label: '总用户数', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#38bdf8', change: '+12%' },
    { label: '在线用户', value: stats.onlineUsers.toLocaleString(), icon: Activity, color: '#22c55e', change: '+5%' },
    { label: '游戏中', value: stats.playingUsers.toLocaleString(), icon: Gamepad2, color: '#8b5cf6', change: '+8%' },
    { label: '今日对局', value: stats.todayGames.toLocaleString(), icon: Gamepad2, color: '#f59e0b', change: '+15%' },
    { label: '今日新增', value: stats.todayNewUsers.toLocaleString(), icon: Users, color: '#ec4899', change: '+3%' },
    { label: '封禁账号', value: stats.totalBanned.toLocaleString(), icon: AlertTriangle, color: '#ef4444', change: '-2%' },
    { label: '待处理作弊', value: stats.pendingAnticheat.toLocaleString(), icon: AlertTriangle, color: '#f97316', change: '+1' },
    { label: '今日营收', value: '¥' + stats.revenue.today.toLocaleString(), icon: DollarSign, color: '#10b981', change: '+20%' },
  ]

  return (
    <div>
      <div className="stat-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const isPositive = card.change.startsWith('+')
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">{card.label}</span>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: `${card.color}20`
                }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <TrendingUp size={12} style={{ display: 'inline' }} /> : <TrendingDown size={12} style={{ display: 'inline' }} />}
                {card.change} 较昨日
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">营收趋势</h3>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            图表区域（待接入ECharts）
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">实时在线</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', fontWeight: 700, color: '#22c55e' }}>
              {stats.onlineUsers}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              当前在线玩家
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
              峰值在线: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{stats.peakOnline}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">快速操作</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">用户管理</button>
          <button className="btn btn-secondary">商城配置</button>
          <button className="btn btn-secondary">游戏参数</button>
          <button className="btn btn-warning">反作弊处理</button>
          <button className="btn btn-secondary">赛季管理</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
