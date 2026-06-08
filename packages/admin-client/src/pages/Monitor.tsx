import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import { 
  Activity, Server, Users, Gamepad2, 
  Cpu, HardDrive, Gauge, AlertTriangle,
  Eye, CheckCircle
} from 'lucide-react'

interface MetricData {
  name: string
  value: number
  unit?: string
  description?: string
  timestamp: number
}

interface LogEntry {
  id: string
  timestamp: number
  level: string
  source: string
  message: string
}

interface Alert {
  id: string
  type: string
  severity: string
  title: string
  message: string
  source: string
  status: string
  createdAt: number
}

function Monitor() {
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [logLevel, setLogLevel] = useState('')
  const [logSource, setLogSource] = useState('')
  const logContainerRef = useRef<HTMLDivElement>(null)
  const autoScroll = useRef(true)

  useEffect(() => {
    loadMetrics()
    loadLogs()
    loadAlerts()

    const metricsInterval = setInterval(loadMetrics, 5000)
    const logsInterval = setInterval(loadLogs, 3000)

    return () => {
      clearInterval(metricsInterval)
      clearInterval(logsInterval)
    }
  }, [logLevel, logSource])

  const loadMetrics = async () => {
    try {
      const response = await api.get('http://localhost:5000/api/metrics')
      if (response.data.success) {
        setMetrics(response.data.data)
      }
    } catch (error) {
      // Silently fail for demo
    }
  }

  const loadLogs = async () => {
    try {
      const response = await api.get('http://localhost:5000/api/logs', {
        params: { 
          pageSize: 50,
          level: logLevel,
          source: logSource,
        },
      })
      if (response.data.success) {
        setLogs(response.data.list)
        if (autoScroll.current && logContainerRef.current) {
          logContainerRef.current.scrollTop = 0
        }
      }
    } catch (error) {
      // Silently fail for demo
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await api.get('http://localhost:5000/api/alerts', {
        params: { status: 'active', pageSize: 10 },
      })
      if (response.data.success) {
        setAlerts(response.data.list)
      }
    } catch (error) {
      // Silently fail for demo
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.post(`http://localhost:5000/api/alerts/${alertId}/acknowledge`)
      loadAlerts()
    } catch (error) {
      console.error('确认告警失败:', error)
    }
  }

  const metricCards = [
    { key: 'online_users', label: '在线用户', icon: Users, color: '#22c55e' },
    { key: 'active_rooms', label: '活跃房间', icon: Gamepad2, color: '#8b5cf6' },
    { key: 'match_queue', label: '匹配队列', icon: Activity, color: '#f59e0b' },
    { key: 'game_servers', label: '游戏服务器', icon: Server, color: '#38bdf8' },
    { key: 'cpu_usage', label: 'CPU使用率', icon: Cpu, color: '#ef4444' },
    { key: 'memory_usage', label: '内存使用率', icon: HardDrive, color: '#ec4899' },
    { key: 'qps', label: 'QPS', icon: Gauge, color: '#06b6d4' },
    { key: 'network_latency', label: '平均延迟', icon: Activity, color: '#f97316' },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      default: return '#22c55e'
    }
  }

  const activeAlerts = alerts.filter(a => a.status === 'active')

  return (
    <div>
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          总览
        </div>
        <div 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          日志查询
        </div>
        <div 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          告警中心
          {activeAlerts.length > 0 && (
            <span style={{ 
              marginLeft: '8px', 
              padding: '0 6px', 
              background: '#ef4444', 
              borderRadius: '10px',
              fontSize: '11px',
              color: 'white'
            }}>
              {activeAlerts.length}
            </span>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {metricCards.map((card) => {
              const Icon = card.icon
              const metric = metrics[card.key]
              const value = metric?.value || 0
              
              return (
                <div key={card.key} className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">{card.label}</span>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: `${card.color}20`
                    }}>
                      <Icon size={18} style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="metric-value" style={{ color: card.color }}>
                    {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b' }}>
                      {metric?.unit || ''}
                    </span>
                  </div>
                  <div className="metric-chart">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bar"
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          background: card.color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">实时日志</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={logLevel} 
                    onChange={(e) => setLogLevel(e.target.value)}
                    style={{ width: '100px', fontSize: '12px' }}
                  >
                    <option value="">全部级别</option>
                    <option value="info">INFO</option>
                    <option value="warn">WARN</option>
                    <option value="error">ERROR</option>
                  </select>
                  <select 
                    value={logSource} 
                    onChange={(e) => setLogSource(e.target.value)}
                    style={{ width: '120px', fontSize: '12px' }}
                  >
                    <option value="">全部来源</option>
                    <option value="game-server">游戏服</option>
                    <option value="match-server">匹配服</option>
                    <option value="api-server">API服</option>
                  </select>
                </div>
              </div>
              <div 
                ref={logContainerRef}
                className="log-stream"
                style={{ maxHeight: '350px' }}
                onScroll={() => {
                  if (logContainerRef.current) {
                    autoScroll.current = logContainerRef.current.scrollTop < 50
                  }
                }}
              >
                {logs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`log-level ${log.level}`} style={{ marginRight: '8px' }}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="log-source">[{log.source}]</span>
                    <span style={{ color: '#e2e8f0' }}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">活动告警</h3>
                <span className="badge badge-danger">{activeAlerts.length} 个</span>
              </div>
              <div style={{ spaceY: '12px' }}>
                {activeAlerts.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 0', 
                    color: '#64748b' 
                  }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 12px', color: '#22c55e' }} />
                    暂无活动告警
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeAlerts.slice(0, 5).map((alert) => (
                      <div 
                        key={alert.id}
                        style={{ 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: `1px solid ${getSeverityColor(alert.severity)}40`,
                          background: `${getSeverityColor(alert.severity)}10`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <AlertTriangle size={16} style={{ color: getSeverityColor(alert.severity) }} />
                          <span style={{ fontWeight: 600, color: getSeverityColor(alert.severity) }}>
                            {alert.title}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                          {alert.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </span>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            确认
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card animate-fadeIn">
          <div className="card-header">
            <h3 className="card-title">日志查询</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={logLevel} 
                onChange={(e) => setLogLevel(e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="">全部级别</option>
                <option value="debug">DEBUG</option>
                <option value="info">INFO</option>
                <option value="warn">WARN</option>
                <option value="error">ERROR</option>
              </select>
              <select 
                value={logSource} 
                onChange={(e) => setLogSource(e.target.value)}
                style={{ width: '140px' }}
              >
                <option value="">全部来源</option>
                <option value="game-server">游戏服务器</option>
                <option value="match-server">匹配服务器</option>
                <option value="api-server">API服务器</option>
                <option value="admin-server">管理后台</option>
                <option value="client">客户端</option>
              </select>
            </div>
          </div>

          <div 
            ref={logContainerRef}
            className="log-stream"
            style={{ maxHeight: '500px' }}
          >
            {logs.map((log) => (
              <div key={log.id} className="log-entry">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className={`log-level ${log.level}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="log-source">[{log.source}]</span>
                <span style={{ color: '#e2e8f0' }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="card animate-fadeIn">
          <div className="card-header">
            <h3 className="card-title">告警中心</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>严重程度</th>
                <th>标题</th>
                <th>来源</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <span 
                      className="badge"
                      style={{ 
                        background: `${getSeverityColor(alert.severity)}20`,
                        color: getSeverityColor(alert.severity),
                      }}
                    >
                      {alert.severity === 'critical' ? '严重' : 
                       alert.severity === 'high' ? '高' : 
                       alert.severity === 'medium' ? '中' : '低'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{alert.title}</td>
                  <td>{alert.source}</td>
                  <td>
                    {alert.status === 'active' ? (
                      <span className="badge badge-danger">活动</span>
                    ) : alert.status === 'acknowledged' ? (
                      <span className="badge badge-warning">已确认</span>
                    ) : (
                      <span className="badge badge-success">已解决</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {alert.status === 'active' && (
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        确认
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Monitor
