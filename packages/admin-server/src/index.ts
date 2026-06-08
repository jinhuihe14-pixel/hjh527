import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware, AdminRequest } from './middleware/auth'
import { adminDataStore } from './data/AdminDataStore'

dotenv.config()

const app = express()
const PORT = process.env.ADMIN_PORT || 4000

app.use(cors())
app.use(express.json())

app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }

    const result = await adminDataStore.adminLogin(username, password)
    
    if (!result.success) {
      return res.status(401).json({ success: false, message: result.message })
    }

    res.json({
      success: true,
      token: result.token,
      admin: result.admin,
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/stats', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const stats = adminDataStore.getStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/users', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, search = '', status = '' } = req.query as any
    const result = adminDataStore.getUsers({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      search,
      status,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取用户列表错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/users/:userId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params
    const user = adminDataStore.getUserDetail(userId)
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('获取用户详情错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/users/:userId/ban', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { reason, duration, permanent } = req.body
    
    const result = adminDataStore.banUser(
      userId,
      reason,
      permanent ? -1 : duration,
      req.admin!.id
    )

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'user_ban', 'user', userId, {
      reason,
      duration,
      permanent,
    })

    res.json({ success: true, message: '封禁成功' })
  } catch (error) {
    console.error('封禁用户错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/users/:userId/unban', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params
    
    const result = adminDataStore.unbanUser(userId, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'user_unban', 'user', userId, {})

    res.json({ success: true, message: '解封成功' })
  } catch (error) {
    console.error('解封用户错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/users/:userId/mute', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { reason, duration } = req.body
    
    const result = adminDataStore.muteUser(userId, reason, duration, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'user_mute', 'user', userId, {
      reason,
      duration,
    })

    res.json({ success: true, message: '禁言成功' })
  } catch (error) {
    console.error('禁言用户错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/users/:userId/reward', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { type, amount, reason } = req.body
    
    const result = adminDataStore.rewardUser(userId, type, amount, reason, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'user_reward', 'user', userId, {
      type,
      amount,
      reason,
    })

    res.json({ success: true, message: '补发成功' })
  } catch (error) {
    console.error('补发道具错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/configs', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const configs = adminDataStore.getConfigs()
    res.json({ success: true, data: configs })
  } catch (error) {
    console.error('获取配置错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.put('/api/admin/configs/:configKey', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { configKey } = req.params
    const { value } = req.body
    
    const result = adminDataStore.updateConfig(configKey, value, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'config_update', 'config', configKey, {
      value,
    })

    res.json({ success: true, message: '配置更新成功' })
  } catch (error) {
    console.error('更新配置错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/shop', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const items = adminDataStore.getShopItems()
    res.json({ success: true, data: items })
  } catch (error) {
    console.error('获取商城商品错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/shop', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const item = req.body
    const result = adminDataStore.addShopItem(item, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'shop_item_add', 'shop_item', result.itemId!, item)

    res.json({ success: true, message: '商品添加成功', itemId: result.itemId })
  } catch (error) {
    console.error('添加商品错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.put('/api/admin/shop/:itemId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { itemId } = req.params
    const item = req.body
    
    const result = adminDataStore.updateShopItem(itemId, item, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'shop_item_update', 'shop_item', itemId, item)

    res.json({ success: true, message: '商品更新成功' })
  } catch (error) {
    console.error('更新商品错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.delete('/api/admin/shop/:itemId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { itemId } = req.params
    
    const result = adminDataStore.deleteShopItem(itemId, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'shop_item_delete', 'shop_item', itemId, {})

    res.json({ success: true, message: '商品删除成功' })
  } catch (error) {
    console.error('删除商品错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/seasons', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const seasons = adminDataStore.getSeasons()
    res.json({ success: true, data: seasons })
  } catch (error) {
    console.error('获取赛季列表错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/seasons', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const season = req.body
    const result = adminDataStore.addSeason(season, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    adminDataStore.addAuditLog(req.admin!.id, 'season_add', 'season', result.seasonId!!, season)

    res.json({ success: true, message: '赛季创建成功', seasonId: result.seasonId! })
  } catch (error) {
    console.error('创建赛季错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/games', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, mode = '' } = req.query as any
    const result = adminDataStore.getGameRecords({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      mode,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取对局记录错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/games/:gameId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { gameId } = req.params
    const game = adminDataStore.getGameDetail(gameId)
    
    if (!game) {
      return res.status(404).json({ success: false, message: '对局不存在' })
    }

    res.json({ success: true, data: game })
  } catch (error) {
    console.error('获取对局详情错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/anticheat', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, type = '' } = req.query as any
    const result = adminDataStore.getAnticheatRecords({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      type,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取反作弊记录错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/audit-logs', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, action = '', adminId = '' } = req.query as any
    const result = adminDataStore.getAuditLogs({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      action,
      adminId,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取审计日志错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/tasks', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, type = '', isActive = '' } = req.query as any
    const result = adminDataStore.getTasks({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      type: type || undefined,
      isActive: isActive !== '' ? isActive === 'true' : undefined,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取任务列表错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/tasks/:taskId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { taskId } = req.params
    const task = adminDataStore.getTaskDetail(taskId)
    
    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    console.error('获取任务详情错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/tasks', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const task = req.body
    const result = adminDataStore.addTask(task, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '任务创建成功', taskId: result.itemId })
  } catch (error) {
    console.error('创建任务错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.put('/api/admin/tasks/:taskId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { taskId } = req.params
    const updates = req.body
    
    const result = adminDataStore.updateTask(taskId, updates, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '任务更新成功' })
  } catch (error) {
    console.error('更新任务错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.delete('/api/admin/tasks/:taskId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { taskId } = req.params
    
    const result = adminDataStore.deleteTask(taskId, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '任务删除成功' })
  } catch (error) {
    console.error('删除任务错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/achievements', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 20, category = '', isActive = '' } = req.query as any
    const result = adminDataStore.getAchievements({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      category: category || undefined,
      isActive: isActive !== '' ? isActive === 'true' : undefined,
    })
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('获取成就列表错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/achievements/:achievementId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { achievementId } = req.params
    const achievement = adminDataStore.getAchievementDetail(achievementId)
    
    if (!achievement) {
      return res.status(404).json({ success: false, message: '成就不存在' })
    }

    res.json({ success: true, data: achievement })
  } catch (error) {
    console.error('获取成就详情错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/achievements', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const achievement = req.body
    const result = adminDataStore.addAchievement(achievement, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '成就创建成功', achievementId: result.itemId })
  } catch (error) {
    console.error('创建成就错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.put('/api/admin/achievements/:achievementId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { achievementId } = req.params
    const updates = req.body
    
    const result = adminDataStore.updateAchievement(achievementId, updates, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '成就更新成功' })
  } catch (error) {
    console.error('更新成就错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.delete('/api/admin/achievements/:achievementId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { achievementId } = req.params
    
    const result = adminDataStore.deleteAchievement(achievementId, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '成就删除成功' })
  } catch (error) {
    console.error('删除成就错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/features', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const features = adminDataStore.getFeatureConfig()
    res.json({ success: true, data: features })
  } catch (error) {
    console.error('获取玩法开关错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.put('/api/admin/features', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const config = req.body
    const result = adminDataStore.updateFeatureConfig(config, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, message: '玩法开关更新成功' })
  } catch (error) {
    console.error('更新玩法开关错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/gameplay-stats', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const stats = adminDataStore.getGameplayStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取玩法统计错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/configs/:configKey/backup', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { configKey } = req.params
    const { data, note } = req.body
    
    const backup = adminDataStore.backupConfig(configKey, data, req.admin!.id, note)
    
    res.json({ success: true, data: backup, message: '配置备份成功' })
  } catch (error) {
    console.error('配置备份错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/configs/:configKey/backups', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { configKey } = req.params
    const backups = adminDataStore.getConfigBackups(configKey)
    
    res.json({ success: true, data: backups })
  } catch (error) {
    console.error('获取配置备份错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.get('/api/admin/configs/backups/:backupId', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { backupId } = req.params
    const backup = adminDataStore.getConfigBackupDetail(backupId)
    
    if (!backup) {
      return res.status(404).json({ success: false, message: '备份不存在' })
    }

    res.json({ success: true, data: backup })
  } catch (error) {
    console.error('获取备份详情错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.post('/api/admin/configs/backups/:backupId/restore', authMiddleware, async (req: AdminRequest, res: Response) => {
  try {
    const { backupId } = req.params
    
    const result = adminDataStore.restoreConfigBackup(backupId, req.admin!.id)
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message })
    }

    res.json({ success: true, data: (result as any).data, message: '配置恢复成功' })
  } catch (error) {
    console.error('配置恢复错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

app.listen(PORT, () => {
  console.log(`[Admin Server] 运营管理后台服务运行在端口 ${PORT}`)
})

export default app
