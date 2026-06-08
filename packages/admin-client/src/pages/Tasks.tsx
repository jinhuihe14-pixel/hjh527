import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

interface TaskConfig {
  id: string
  name: string
  description: string
  type: string
  conditionType: string
  targetValue: number
  rewards: { type: string; itemId?: string; amount: number }[]
  sortOrder: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

const typeLabels: Record<string, string> = {
  daily: '日常任务',
  weekly: '周常任务',
}

const conditionLabels: Record<string, string> = {
  play_games: '完成对局',
  win_games: '获得胜利',
  get_kills: '击败敌人',
  get_damage: '造成伤害',
  login: '登录游戏',
  rank_up: '段位提升',
  collect_items: '收集物品',
  play_with_friends: '组队游戏',
}

const rewardTypeLabels: Record<string, string> = {
  coins: '金币',
  diamonds: '钻石',
  exp: '经验',
  item: '道具',
}

function Tasks() {
  const [tasks, setTasks] = useState<TaskConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false
  )
  const [editingTask, setEditingTask] = useState<TaskConfig | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'daily',
    conditionType: 'play_games',
    targetValue: 1,
    sortOrder: 0,
    isActive: true,
    rewards: [{ type: 'coins', amount: 100 }] as { type: string; itemId?: string; amount: number }[],
  })

  useEffect(() => {
    loadTasks()
  }, [filterType])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/tasks', {
        params: { type: filterType || undefined },
      })
      if (response.data.success) {
        setTasks(response.data.list)
      }
    } catch (error) {
      console.error('加载任务列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingTask(null)
    setFormData({
      name: '',
      description: '',
      type: 'daily',
      conditionType: 'play_games',
      targetValue: 1,
      sortOrder: tasks.length,
      isActive: true,
      rewards: [{ type: 'coins', amount: 100 }],
    })
    setShowModal(true)
  }

  const handleEdit = (task: TaskConfig) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      description: task.description,
      type: task.type,
      conditionType: task.conditionType,
      targetValue: task.targetValue,
      sortOrder: task.sortOrder,
      isActive: task.isActive,
      rewards: [...task.rewards],
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingTask) {
        await api.put(`/api/admin/tasks/${editingTask.id}`, formData)
      } else {
        await api.post('/api/admin/tasks', formData)
      }
      setShowModal(false)
      loadTasks()
    } catch (error) {
      console.error('保存任务失败:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    try {
      await api.delete(`/api/admin/tasks/${taskId}`)
      loadTasks()
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  const addReward = () => {
    setFormData({
      ...formData,
      rewards: [...formData.rewards, { type: 'coins', amount: 100 }],
    })
  }

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index)
    setFormData({ ...formData, rewards: newRewards })
  }

  const updateReward = (index: number, key: string, value: any) => {
    const newRewards = [...formData.rewards]
    ;(newRewards[index] as any)[key] = value
    setFormData({ ...formData, rewards: newRewards })
  }

  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">任务配置管理</h3>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            新增任务
          </button>
        </div>

        <div className="search-box">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              placeholder="搜索任务..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">全部类型</option>
            <option value="daily">日常任务</option>
            <option value="weekly">周常任务</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #334155',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>类型</th>
                <th>完成条件</th>
                <th>目标值</th>
                <th>奖励</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{task.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{task.description}</div>
                  </td>
                  <td>
                    <span className={`badge ${task.type === 'weekly' ? 'badge-warning' : 'badge-info'}`}>
                      {typeLabels[task.type] || task.type}
                    </span>
                  </td>
                  <td>{conditionLabels[task.conditionType] || task.conditionType}</td>
                  <td>{task.targetValue}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {task.rewards.map((reward, i) => (
                        <span key={i} style={{ fontSize: '12px' }}>
                          {rewardTypeLabels[reward.type]} x{reward.amount}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{task.sortOrder}</td>
                  <td>
                    {task.isActive ? (
                      <span className="badge badge-success">启用</span>
                    ) : (
                      <span className="badge badge-secondary">禁用</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(task)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? '编辑任务' : '新增任务'}</h3>
            </div>

            <div className="form-group">
              <label>任务名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入任务名称"
              />
            </div>

            <div className="form-group">
              <label>任务描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入任务描述"
                rows={2}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>任务类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="daily">日常任务</option>
                  <option value="weekly">周常任务</option>
                </select>
              </div>
              <div className="form-group">
                <label>完成条件</label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
                >
                  <option value="play_games">完成对局</option>
                  <option value="win_games">获得胜利</option>
                  <option value="get_kills">击败敌人</option>
                  <option value="get_damage">造成伤害</option>
                  <option value="login">登录游戏</option>
                  <option value="rank_up">段位提升</option>
                  <option value="collect_items">收集物品</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>目标值</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>排序</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>奖励配置</span>
                <button className="btn btn-sm btn-secondary" onClick={addReward}>
                  + 添加奖励
                </button>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.rewards.map((reward, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={reward.type}
                      onChange={(e) => updateReward(index, 'type', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="coins">金币</option>
                      <option value="diamonds">钻石</option>
                      <option value="exp">经验</option>
                      <option value="item">道具</option>
                    </select>
                    <input
                      type="number"
                      value={reward.amount}
                      onChange={(e) => updateReward(index, 'amount', Number(e.target.value))}
                      placeholder="数量"
                      style={{ width: '100px' }}
                    />
                    <button className="btn btn-sm btn-danger" onClick={() => removeReward(index)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                启用任务
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
