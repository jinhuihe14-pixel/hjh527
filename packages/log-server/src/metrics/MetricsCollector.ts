export interface MetricData {
  name: string
  value: number
  unit?: string
  description?: string
  timestamp: number
}

export interface MetricHistoryPoint {
  timestamp: number
  value: number
}

export class MetricsCollector {
  private metrics: Map<string, MetricData> = new Map()
  private history: Map<string, MetricHistoryPoint[]> = new Map()
  private maxHistoryPoints: number = 288

  constructor() {
    this.initDefaultMetrics()
  }

  private initDefaultMetrics() {
    const defaultMetrics = [
      { name: 'online_users', value: 0, unit: '人', description: '在线用户数' },
      { name: 'active_rooms', value: 0, unit: '个', description: '活跃房间数' },
      { name: 'match_queue', value: 0, unit: '人', description: '匹配队列人数' },
      { name: 'game_servers', value: 0, unit: '台', description: '游戏服务器数' },
      { name: 'cpu_usage', value: 0, unit: '%', description: 'CPU使用率' },
      { name: 'memory_usage', value: 0, unit: '%', description: '内存使用率' },
      { name: 'network_latency', value: 0, unit: 'ms', description: '平均网络延迟' },
      { name: 'qps', value: 0, unit: '/s', description: '每秒请求数' },
      { name: 'total_logins', value: 0, unit: '次', description: '总登录次数' },
      { name: 'total_games', value: 0, unit: '场', description: '总对局数' },
    ]

    defaultMetrics.forEach(m => {
      this.metrics.set(m.name, {
        ...m,
        timestamp: Date.now(),
      })
      this.history.set(m.name, [])
    })
  }

  recordMetric(name: string, value: number): void {
    const existing = this.metrics.get(name)
    
    this.metrics.set(name, {
      name,
      value,
      unit: existing?.unit,
      description: existing?.description,
      timestamp: Date.now(),
    })

    let history = this.history.get(name) || []
    history.push({
      timestamp: Date.now(),
      value,
    })

    if (history.length > this.maxHistoryPoints) {
      history = history.slice(-this.maxHistoryPoints)
    }
    
    this.history.set(name, history)
  }

  getMetric(name: string): MetricData | undefined {
    return this.metrics.get(name)
  }

  getAllMetrics(): Record<string, MetricData> {
    const result: Record<string, MetricData> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  getMetricHistory(name: string, range: string = '1h'): MetricHistoryPoint[] {
    const history = this.history.get(name) || []
    const now = Date.now()
    
    let rangeMs: number
    switch (range) {
      case '5m': rangeMs = 5 * 60 * 1000; break
      case '15m': rangeMs = 15 * 60 * 1000; break
      case '1h': rangeMs = 60 * 60 * 1000; break
      case '6h': rangeMs = 6 * 60 * 60 * 1000; break
      case '24h': rangeMs = 24 * 60 * 60 * 1000; break
      default: rangeMs = 60 * 60 * 1000; break
    }

    return history.filter(h => now - h.timestamp <= rangeMs)
  }

  incrementMetric(name: string, amount: number = 1): void {
    const current = this.metrics.get(name)
    const newValue = (current?.value || 0) + amount
    this.recordMetric(name, newValue)
  }

  decrementMetric(name: string, amount: number = 1): void {
    const current = this.metrics.get(name)
    const newValue = Math.max(0, (current?.value || 0) - amount)
    this.recordMetric(name, newValue)
  }

  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  resetMetric(name: string): void {
    const existing = this.metrics.get(name)
    if (existing) {
      this.recordMetric(name, 0)
    }
  }
}
