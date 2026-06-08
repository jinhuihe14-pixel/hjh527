import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

interface AchievementConfig {
  id: string
  name: string
  description: string
  category: string
  conditionType: string
  targetValue: number
  rewards: { type: string; itemId?: string; amount?: number; title?: string }[]
  badge?: string
  sortOrder: number
  isActive: boolean
  createdAt: number
}

const categoryLabels: Record<string, string> = {
  progression: '闯关成长',
  collection: '收集成就',
  combat: '战斗成就',
  social: '社交成就',
  activity: '活跃成就',
}

const conditionLabels: Record<string, string> = {
  play_games: '完成对局',
  win_games: '获得胜利',
  get_kills: '击败敌人',
  get_damage: '造成伤害',
  rank_tier: '达到段位',
  collect_skins: '收集皮肤',
  consecutive_login: '连续登录',
  total_login: '累计登录',
  add_friends: '添加好友',
  win_streak: '连胜记录',
}

const rewardTypeLabels: Record<string, string> = {
  coins: '金币',
  diamonds: '钻石',
  exp: '经验',
  item: '道具',
  title: '称号',
}

function Achievements() {
  const [achievements, setAchievements] = useState<AchievementConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAch, setEditingAch] = useState<AchievementConfig | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'progression',
    conditionType: 'play_games',
    targetValue: 1,
    badge: '',
    sortOrder: 0,
    isActive: true,
    rewards: [{ type: 'coins', amount: 100 }] as { type: string; itemId?: string; amount?: number; title?: string }[],
  })

  useEffect(() => {
    loadAchievements()
  }, [filterCategory])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/achievements', {
        params: { category: filterCategory || undefined },
      })
      if (response.data.success) {
        setAchievements(response.data.list)
      }
    } catch (error) {
      console.error('加载成就列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingAch(null)
    setFormData({
      name: '',
      description: '',
      category: 'progression',
      conditionType: 'play_games',
      targetValue: 1,
      badge: '🏆',
      sortOrder: achievements.length,
      isActive: true,
      rewards: [{ type: 'coins', amount: 100 }],
    })
    setShowModal(true)
  }

  const handleEdit = (ach: AchievementConfig) => {
    setEditingAch(ach)
    setFormData({
      name: ach.name,
      description: ach.description,
      category: ach.category,
      conditionType: ach.conditionType,
      targetValue: ach.targetValue,
      badge: ach.badge || '',
      sortOrder: ach.sortOrder,
      isActive: ach.isActive,
      rewards: [...ach.rewards],
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingAch) {
        await api.put(`/api/admin/achievements/${editingAch.id}`, formData)
      } else {
        await api.post('/api/admin/achievements', formData)
      }
      setShowModal(false)
      loadAchievements()
    } catch (error) {
      console.error('保存成就失败:', error)
    }
  }

  const handleDelete = async (achId: string) => {
    if (!confirm('确定要删除这个成就吗？')) return
    try {
      await api.delete(`/api/admin/achievements/${achId}`)
      loadAchievements()
    } catch (error) {
      console.error('删除成就失败:', error)
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

  const filteredAchievements = achievements.filter((ach) =>
    ach.name.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryBadgeClass = (category: string) => {
    const classes: Record<string, string> = {
      progression: 'badge-info',
      collection: 'badge-success',
      combat: 'badge-danger',
      social: 'badge-warning',
      activity: 'badge-secondary',
    }
    return classes[category] || 'badge-secondary'
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">成就配置管理</h3>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            新增成就
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
              placeholder="搜索成就..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">全部分类</option>
            <option value="progression">闯关成长</option>
            <option value="collection">收集成就</option>
            <option value="combat">战斗成就</option>
            <option value="social">社交成就</option>
            <option value="activity">活跃成就</option>
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
                <th>徽章</th>
                <th>成就名称</th>
                <th>分类</th>
                <th>完成条件</th>
                <th>目标值</th>
                <th>奖励</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAchievements.map((ach) => (
                <tr key={ach.id}>
                  <td>
                    <span style={{ fontSize: '24px' }}>{ach.badge || '🏆'}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{ach.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{ach.description}</div>
                  </td>
                  <td>
                    <span className={`badge ${getCategoryBadgeClass(ach.category)}`}>
                      {categoryLabels[ach.category] || ach.category}
                    </span>
                  </td>
                  <td>{conditionLabels[ach.conditionType] || ach.conditionType}</td>
                  <td>{ach.targetValue}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {ach.rewards.map((reward, i) => (
                        <span key={i} style={{ fontSize: '12px' }}>
                          {rewardTypeLabels[reward.type]}
                          {reward.amount ? ` x${reward.amount}` : ''}
                          {reward.title ? `: ${reward.title}` : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{ach.sortOrder}</td>
                  <td>
                    {ach.isActive ? (
                      <span className="badge badge-success">启用</span>
                    ) : (
                      <span className="badge badge-secondary">禁用</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(ach)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ach.id)}>
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
              <h3 className="modal-title">{editingAch ? '编辑成就' : '新增成就'}</h3>
            </div>

            <div className="form-group">
              <label>成就名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入成就名称"
              />
            </div>

            <div className="form-group">
              <label>成就描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入成就描述"
                rows={2}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>成就分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="progression">闯关成长</option>
                  <option value="collection">收集成就</option>
                  <option value="combat">战斗成就</option>
                  <option value="social">社交成就</option>
                  <option value="activity">活跃成就</option>
                </select>
              </div>
              <div className="form-group">
                <label>徽章图标</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="🏆"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <option value="rank_tier">达到段位</option>
                  <option value="collect_skins">收集皮肤</option>
                  <option value="consecutive_login">连续登录</option>
                  <option value="total_login">累计登录</option>
                  <option value="add_friends">添加好友</option>
                  <option value="win_streak">连胜记录</option>
                </select>
              </div>
              <div className="form-group">
                <label>目标值</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>排序</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              />
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
                      <option value="title">称号</option>
                    </select>
                    {reward.type === 'title' ? (
                      <input
                        type="text"
                        value={reward.title || ''}
                        onChange={(e) => updateReward(index, 'title', e.target.value)}
                        placeholder="称号名称"
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <input
                        type="number"
                        value={reward.amount || 0}
                        onChange={(e) => updateReward(index, 'amount', Number(e.target.value))}
                        placeholder="数量"
                        style={{ width: '100px' }}
                      />
                    )}
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
                启用成就
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

export default Achievements
