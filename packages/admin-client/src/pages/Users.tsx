import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search, Ban, MessageCircle, Gift, Eye } from 'lucide-react'

interface User {
  id: string
  nickname: string
  avatar: string
  level: number
  coins: number
  diamonds: number
  rankPoints: number
  rankTier: number
  wins: number
  losses: number
  isBanned: boolean
  banReason?: string
  banEndTime?: number
  isMuted: boolean
  status: string
  lastLoginAt: number
}

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState(86400000)
  const [banPermanent, setBanPermanent] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page, search, status])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users', {
        params: { page, pageSize, search, status },
      })
      if (response.data.success) {
        setUsers(response.data.list)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async () => {
    if (!selectedUser) return
    try {
      await api.post(`/api/admin/users/${selectedUser.id}/ban`, {
        reason: banReason,
        duration: banDuration,
        permanent: banPermanent,
      })
      setShowBanModal(false)
      loadUsers()
    } catch (error) {
      console.error('封禁失败:', error)
    }
  }

  const handleUnban = async (userId: string) => {
    try {
      await api.post(`/api/admin/users/${userId}/unban`)
      loadUsers()
    } catch (error) {
      console.error('解封失败:', error)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">用户列表</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              style={{ width: '120px' }}
            >
              <option value="">全部状态</option>
              <option value="online">在线</option>
              <option value="banned">已封禁</option>
            </select>
          </div>
        </div>

        <div className="search-box">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="搜索用户ID、昵称、邮箱..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={loadUsers}>
            搜索
          </button>
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
          <>
            <table>
              <thead>
                <tr>
                  <th>用户</th>
                  <th>等级</th>
                  <th>段位</th>
                  <th>金币</th>
                  <th>状态</th>
                  <th>最后登录</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          background: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.nickname}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>Lv.{user.level}</td>
                    <td>
                      <span className="badge badge-info">
                        {['', '青铜', '白银', '黄金', '铂金', '钻石', '大师', '王者'][user.rankTier]}
                      </span>
                    </td>
                    <td>{user.coins.toLocaleString()}</td>
                    <td>
                      {user.isBanned ? (
                        <span className="badge badge-danger">已封禁</span>
                      ) : user.status === 'online' ? (
                        <span className="badge badge-success">在线</span>
                      ) : (
                        <span className="badge badge-secondary">离线</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={14} />
                        </button>
                        {user.isBanned ? (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleUnban(user.id)}
                          >
                            解封
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBanModal(true)
                            }}
                          >
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    className={page === pageNum ? 'active' : ''}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </button>
              <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>
                共 {total} 条
              </span>
            </div>
          </>
        )}
      </div>

      {showBanModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">封禁用户</h3>
            </div>
            
            <p style={{ marginBottom: '16px' }}>
              确定要封禁用户 <strong>{selectedUser.nickname}</strong> 吗？
            </p>

            <div className="form-group">
              <label>封禁原因</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="请输入封禁原因"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={banPermanent}
                  onChange={(e) => setBanPermanent(e.target.checked)}
                  style={{ width: 'auto', marginRight: '8px' }}
                />
                永久封禁
              </label>
            </div>

            {!banPermanent && (
              <div className="form-group">
                <label>封禁时长</label>
                <select value={banDuration} onChange={(e) => setBanDuration(Number(e.target.value))}>
                  <option value={3600000}>1小时</option>
                  <option value={86400000}>1天</option>
                  <option value={604800000}>7天</option>
                  <option value={2592000000}>30天</option>
                </select>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBanModal(false)}>
                取消
              </button>
              <button className="btn btn-danger" onClick={handleBan}>
                确认封禁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
