import express, { Request, Response } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { LogCollector } from './log/LogCollector'
import { MetricsCollector } from './metrics/MetricsCollector'
import { AlertManager } from './alert/AlertManager'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

const PORT = process.env.LOG_PORT || 5000

app.use(cors())
app.use(express.json())

const logCollector = new LogCollector()
const metricsCollector = new MetricsCollector()
const alertManager = new AlertManager()

app.post('/api/logs/ingest', (req: Request, res: Response) => {
  try {
    const logs = Array.isArray(req.body) ? req.body : [req.body]
    
    for (const log of logs) {
      logCollector.addLog(log)
      
      if (log.level === 'error' || log.level === 'fatal') {
        alertManager.checkAlert(log)
      }
    }

    io.emit('new_logs', logs)
    
    res.json({ success: true, received: logs.length })
  } catch (error) {
    console.error('日志接收错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.get('/api/logs', (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 50, 
      level = '', 
      source = '', 
      keyword = '',
      startTime,
      endTime,
    } = req.query as any

    const result = logCollector.queryLogs({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      level,
      source,
      keyword,
      startTime: startTime ? parseInt(startTime) : undefined,
      endTime: endTime ? parseInt(endTime) : undefined,
    })

    res.json({ success: true, ...result })
  } catch (error) {
    console.error('查询日志错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.get('/api/metrics', (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getAllMetrics()
    res.json({ success: true, data: metrics })
  } catch (error) {
    console.error('获取指标错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.get('/api/metrics/history', (req: Request, res: Response) => {
  try {
    const { metric, range = '1h' } = req.query as any
    const history = metricsCollector.getMetricHistory(metric as string, range as string)
    res.json({ success: true, data: history })
  } catch (error) {
    console.error('获取指标历史错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.get('/api/alerts', (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, status = '' } = req.query as any
    const result = alertManager.getAlerts({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status: status as string,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取告警错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.post('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = alertManager.acknowledgeAlert(id)
    res.json({ success: result.success, message: result.message })
  } catch (error) {
    console.error('确认告警错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

app.get('/api/status', (req: Request, res: Response) => {
  try {
    const status = {
      logServer: 'online',
      totalLogs: logCollector.getTotalCount(),
      activeConnections: io.engine.clientsCount,
      metrics: metricsCollector.getAllMetrics(),
      alertCount: alertManager.getActiveAlertCount(),
    }
    res.json({ success: true, data: status })
  } catch (error) {
    console.error('获取状态错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

io.on('connection', (socket) => {
  console.log('[LogServer] 监控客户端连接:', socket.id)

  socket.on('subscribe', (channel: string) => {
    socket.join(channel)
    console.log(`[LogServer] 客户端 ${socket.id} 订阅: ${channel}`)
  })

  socket.on('unsubscribe', (channel: string) => {
    socket.leave(channel)
    console.log(`[LogServer] 客户端 ${socket.id} 取消订阅: ${channel}`)
  })

  socket.on('disconnect', () => {
    console.log('[LogServer] 监控客户端断开:', socket.id)
  })
})

setInterval(() => {
  const metrics = metricsCollector.getAllMetrics()
  io.emit('metrics_update', metrics)
}, 5000)

setInterval(() => {
  metricsCollector.recordMetric('online_users', Math.floor(Math.random() * 500) + 800)
  metricsCollector.recordMetric('active_rooms', Math.floor(Math.random() * 50) + 20)
  metricsCollector.recordMetric('game_servers', 3)
  metricsCollector.recordMetric('match_queue', Math.floor(Math.random() * 100))
  metricsCollector.recordMetric('cpu_usage', Math.floor(Math.random() * 30) + 20)
  metricsCollector.recordMetric('memory_usage', Math.floor(Math.random() * 20) + 40)
  metricsCollector.recordMetric('qps', Math.floor(Math.random() * 500) + 200)
}, 3000)

httpServer.listen(PORT, () => {
  console.log(`[LogServer] 日志监控服务运行在端口 ${PORT}`)
})

export { app, httpServer, io, logCollector, metricsCollector, alertManager }
