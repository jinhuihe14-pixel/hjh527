import { useEffect, useState } from 'react'
import api from '../services/api'
import { Save, RefreshCw } from 'lucide-react'

function Configs() {
  const [configs, setConfigs] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('game')

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/configs')
      if (response.data.success) {
        setConfigs(response.data.data)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put(`/api/admin/configs/${activeTab}`, configs[activeTab])
      alert('配置保存成功')
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleValueChange = (key: string, value: any) => {
    setConfigs((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value,
      },
    }))
  }

  const tabs = [
    { key: 'game', label: '游戏参数' },
    { key: 'rank', label: '排位规则' },
    { key: 'match', label: '匹配配置' },
    { key: 'anticheat', label: '反作弊配置' },
  ]

  const fieldLabels: Record<string, Record<string, string>> = {
    game: {
      tickRate: '服务器帧率 (tick/s)',
      gameDuration: '游戏时长 (秒)',
      respawnTime: '复活时间 (毫秒)',
      playerMaxHealth: '玩家最大生命值',
      playerMaxEnergy: '玩家最大能量值',
      playerSpeed: '玩家移动速度',
      bulletDamage: '子弹伤害',
      bulletSpeed: '子弹速度',
    },
    rank: {
      baseWinPoints: '胜利基础积分',
      baseLosePoints: '失败基础积分',
      minWinPoints: '最低胜利积分',
      maxWinPoints: '最高胜利积分',
      minLosePoints: '最低失败积分',
      maxLosePoints: '最高失败积分',
      winStreakBonus: '连胜奖励 (数组)',
    },
    match: {
      initialRange: '初始匹配范围',
      maxRange: '最大匹配范围',
      rangeIncreaseRate: '范围增加速率',
      rangeIncreaseInterval: '范围增加间隔 (毫秒)',
      maxWaitTime: '最大等待时间 (毫秒)',
      defaultPlayers: '默认房间人数',
    },
    anticheat: {
      maxMoveSpeed: '最大移动速度',
      maxDamagePerHit: '单次最大伤害',
      maxInputsPerSecond: '每秒最大输入次数',
      minTeleportDistance: '最小瞬移判定距离',
      godModeHealthThreshold: '锁血血量阈值 (%)',
      godModeDuration: '锁血判定时长 (毫秒)',
      warningThreshold: '警告阈值 (次)',
      tempBanThreshold: '临时封禁阈值 (次)',
      permBanThreshold: '永久封禁阈值 (次)',
    },
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

  if (!configs) return null

  const currentConfig = configs[activeTab] || {}

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">游戏配置管理</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={loadConfigs}>
              <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
              刷新
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="config-grid">
          {Object.entries(currentConfig).map(([key, value]) => {
            const label = fieldLabels[activeTab]?.[key] || key
            
            return (
              <div key={key} className="config-item">
                <label>{label}</label>
                {Array.isArray(value) ? (
                  <input
                    type="text"
                    value={value.join(', ')}
                    onChange={(e) => handleValueChange(key, e.target.value.split(',').map(s => Number(s.trim())))}
                  />
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleValueChange(key, Number(e.target.value))}
                  />
                ) : (
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 500 }}>
            ⚠️ 注意事项
          </p>
          <ul style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', paddingLeft: '20px' }}>
            <li>修改配置后点击"保存配置"按钮生效</li>
            <li>配置热更新，无需重启服务</li>
            <li>请谨慎修改核心游戏参数，避免影响游戏平衡</li>
            <li>所有配置修改操作都会记录到操作审计日志中</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Configs
