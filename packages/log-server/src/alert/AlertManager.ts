import { v4 as uuidv4 } from 'uuid'
import { LogEntry } from '../log/LogCollector'

export interface Alert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string
  acknowledgedAt?: number
  resolvedAt?: number
  createdAt: number
  metadata?: Record<string, any>
}

interface AlertQueryParams {
  page: number
  pageSize: number
  status?: string
  severity?: string
}

export class AlertManager {
  private alerts: Alert[] = []
  private maxAlerts: number = 1000

  constructor() {
    this.initSampleAlerts()
  }

  private initSampleAlerts() {
    const sampleAlerts = [
      { type: 'error_log', severity: 'high' as const, title: '游戏服务器错误', message: '检测到大量错误日志', source: 'game-server' },
      { type: 'high_latency', severity: 'medium' as const, title: '网络延迟过高', message: '平均延迟超过200ms', source: 'monitor' },
      { type: 'high_cpu', severity: 'medium' as const, title: 'CPU使用率过高', message: 'CPU使用率超过80%', source: 'monitor' },
      { type: 'anticheat', severity: 'high' as const, title: '作弊行为检测', message: '检测到疑似加速作弊', source: 'anticheat' },
    ]

    sampleAlerts.forEach((alert, index) => {
      this.alerts.push({
        id: uuidv4(),
        ...alert,
        status: index < 2 ? 'active' : 'acknowledged',
        acknowledgedBy: index >= 2 ? 'admin' : undefined,
        acknowledgedAt: index >= 2 ? Date.now() - 3600000 * index : undefined,
        createdAt: Date.now() - 3600000 * (index + 1),
      })
    })
  }

  checkAlert(log: LogEntry): void {
    if (log.level === 'error' || log.level === 'fatal') {
      this.createAlert({
        type: 'error_log',
        severity: log.level === 'fatal' ? 'critical' : 'high',
        title: `${log.source} 错误日志`,
        message: log.message,
        source: log.source,
        metadata: {
          logId: log.id,
          level: log.level,
          ...log.metadata,
        },
      })
    }
  }

  createAlert(alert: Omit<Alert, 'id' | 'status' | 'createdAt'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: uuidv4(),
      status: 'active',
      createdAt: Date.now(),
    }

    this.alerts.unshift(newAlert)

    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    return newAlert
  }

  acknowledgeAlert(id: string, adminId?: string): { success: boolean; message: string } {
    const alert = this.alerts.find(a => a.id === id)
    
    if (!alert) {
      return { success: false, message: '告警不存在' }
    }

    if (alert.status !== 'active') {
      return { success: false, message: '告警已处理' }
    }

    alert.status = 'acknowledged'
    alert.acknowledgedBy = adminId || 'system'
    alert.acknowledgedAt = Date.now()

    return { success: true, message: '告警已确认' }
  }

  resolveAlert(id: string, adminId?: string): { success: boolean; message: string } {
    const alert = this.alerts.find(a => a.id === id)
    
    if (!alert) {
      return { success: false, message: '告警不存在' }
    }

    alert.status = 'resolved'
    alert.resolvedAt = Date.now()

    return { success: true, message: '告警已解决' }
  }

  getAlerts(params: AlertQueryParams) {
    let filtered = [...this.alerts]

    if (params.status) {
      filtered = filtered.filter(alert => alert.status === params.status)
    }

    if (params.severity) {
      filtered = filtered.filter(alert => alert.severity === params.severity)
    }

    const total = filtered.length
    const start = (params.page - 1) * params.pageSize
    const list = filtered.slice(start, start + params.pageSize)

    return {
      list,
      total,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  getActiveAlertCount(): number {
    return this.alerts.filter(a => a.status === 'active').length
  }

  getAlertStats() {
    const stats = {
      total: this.alerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    }

    for (const alert of this.alerts) {
      stats[alert.status]++
      stats.bySeverity[alert.severity]++
    }

    return stats
  }
}
