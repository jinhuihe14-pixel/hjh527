import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

interface ShopItem {
  id: string
  name: string
  description: string
  type: string
  price: number
  currency: string
  rarity: string
  isActive: boolean
  isHot: boolean
  isNew: boolean
  stock: number
  createdAt: number
}

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传奇',
}

const typeLabels: Record<string, string> = {
  consumable: '消耗品',
  skin: '皮肤',
  emote: '表情',
  trail: '拖尾',
}

function Shop() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'consumable',
    price: 0,
    currency: 'coins',
    rarity: 'common',
    isActive: true,
    isHot: false,
    isNew: false,
    stock: -1,
    attributes: {},
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/shop')
      if (response.data.success) {
        setItems(response.data.data)
      }
    } catch (error) {
      console.error('加载商品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      type: 'consumable',
      price: 0,
      currency: 'coins',
      rarity: 'common',
      isActive: true,
      isHot: false,
      isNew: false,
      stock: -1,
      attributes: {},
    })
    setShowModal(true)
  }

  const handleEdit = (item: ShopItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price,
      currency: item.currency,
      rarity: item.rarity,
      isActive: item.isActive,
      isHot: item.isHot,
      isNew: item.isNew,
      stock: item.stock,
      attributes: {},
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        await api.put(`/api/admin/shop/${editingItem.id}`, formData)
      } else {
        await api.post('/api/admin/shop', formData)
      }
      setShowModal(false)
      loadItems()
    } catch (error) {
      console.error('保存商品失败:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return
    try {
      await api.delete(`/api/admin/shop/${itemId}`)
      loadItems()
    } catch (error) {
      console.error('删除商品失败:', error)
    }
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">商城商品管理</h3>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            新增商品
          </button>
        </div>

        <div className="search-box">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="搜索商品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid #334155', 
              borderTopColor: '#38bdf8', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>商品名称</th>
                <th>类型</th>
                <th>品质</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>标签</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.id}</div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{typeLabels[item.type] || item.type}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${item.rarity === 'legendary' ? 'warning' : item.rarity === 'epic' ? 'info' : item.rarity === 'rare' ? 'info' : 'secondary'}`}>
                      {rarityLabels[item.rarity] || item.rarity}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: item.currency === 'diamonds' ? '#38bdf8' : '#f59e0b' }}>
                      {item.price} {item.currency === 'diamonds' ? '💎' : '🪙'}
                    </span>
                  </td>
                  <td>{item.stock === -1 ? '无限' : item.stock}</td>
                  <td>
                    {item.isActive ? (
                      <span className="badge badge-success">上架中</span>
                    ) : (
                      <span className="badge badge-secondary">已下架</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {item.isHot && <span className="badge badge-danger">热销</span>}
                      {item.isNew && <span className="badge badge-success">新品</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(item)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? '编辑商品' : '新增商品'}</h3>
            </div>

            <div className="form-group">
              <label>商品名称</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入商品名称"
              />
            </div>

            <div className="form-group">
              <label>商品描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入商品描述"
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>商品类型</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="consumable">消耗品</option>
                  <option value="skin">皮肤</option>
                  <option value="emote">表情</option>
                  <option value="trail">拖尾</option>
                </select>
              </div>
              <div className="form-group">
                <label>品质</label>
                <select 
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                >
                  <option value="common">普通</option>
                  <option value="rare">稀有</option>
                  <option value="epic">史诗</option>
                  <option value="legendary">传奇</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>价格</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>货币</label>
                <select 
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="coins">金币</option>
                  <option value="diamonds">钻石</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>库存 (-1 表示无限)</label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                上架
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isHot}
                  onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                热销
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                新品
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

export default Shop
