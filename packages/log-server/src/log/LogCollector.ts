import { v4 as uuidv4 } from 'uuid'

export interface LogEntry {
  id: string
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  source: string
  message: string
  tags?: string[]
  metadata?: Record<string, any>
  serverId?: string
}

interface LogQueryParams {
  page: number
  pageSize: number
  level?: string
  source?: string
  keyword?: string
  startTime?: number
  endTime?: number
}

export class LogCollector {
  private logs: LogEntry[] = []
  private maxLogs: number = 10000

  constructor() {
    this.initSampleLogs()
  }

  private initSampleLogs() {
    const sources = ['game-server', 'match-server', 'api-server', 'admin-server', 'client']
    const levels: LogEntry['level'][] = ['info', 'info', 'info', 'info', 'warn', 'error', 'debug']
    const messages = {
      info: [
        '玩家连接成功',
        '玩家断开连接',
        '游戏房间创建成功',
        '匹配请求已加入队列',
        '玩家登录成功',
        '道具购买成功',
        '积分更新完成',
        '服务器心跳正常',
        '数据同步完成',
      ],
      warn: [
        '玩家网络延迟较高',
        '服务器负载偏高',
        '匹配等待时间过长',
        '内存使用率偏高',
        '连接数接近阈值',
      ],
      error: [
        '游戏房间创建失败',
        '数据库连接超时',
        '玩家认证失败',
        '数据写入错误',
        '服务调用异常',
      ],
      debug: [
        '玩家位置同步',
        '技能释放验证',
        '碰撞检测通过',
        '状态同步完成',
      ],
    }

    for (let i = 0; i < 200; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)]
      const source = sources[Math.floor(Math.random() * sources.length)]
      const msgList = messages[level as keyof typeof messages]
      const message = msgList[Math.floor(Math.random() * msgList.length)]

      this.logs.push({
        id: uuidv4(),
        timestamp: Date.now() - i * 30000 - Math.random() * 10000,
        level,
        source,
        message,
        tags: [source, level],
        metadata: {
          playerId: Math.random() > 0.5 ? `player_${Math.floor(Math.random() * 100)}` : undefined,
          roomId: Math.random() > 0.6 ? `room_${Math.floor(Math.random() * 50)}` : undefined,
        },
        serverId: `server_${Math.floor(Math.random() * 5) + 1}`,
      })
    }

    this.logs.sort((a, b) => b.timestamp - a.timestamp)
  }

  addLog(log: Partial<LogEntry>): LogEntry {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: log.timestamp || Date.now(),
      level: log.level || 'info',
      source: log.source || 'unknown',
      message: log.message || '',
      tags: log.tags,
      metadata: log.metadata,
      serverId: log.serverId,
    }

    this.logs.unshift(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    return entry
  }

  queryLogs(params: LogQueryParams) {
    let filtered = [...this.logs]

    if (params.level) {
      filtered = filtered.filter(log => log.level === params.level)
    }

    if (params.source) {
      filtered = filtered.filter(log => log.source === params.source)
    }

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(keyword) ||
        log.source.toLowerCase().includes(keyword)
      )
    }

    if (params.startTime) {
      filtered = filtered.filter(log => log.timestamp >= params.startTime!)
    }

    if (params.endTime) {
      filtered = filtered.filter(log => log.timestamp <= params.endTime!)
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

  getTotalCount(): number {
    return this.logs.length
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0,
      },
      bySource: {} as Record<string, number>,
    }

    for (const log of this.logs) {
      stats.byLevel[log.level]++
      stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1
    }

    return stats
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(0, count)
  }
}
