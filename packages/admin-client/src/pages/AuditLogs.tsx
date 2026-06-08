import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search, FileText, User, Clock } from 'lucide-react'

interface AuditLogEntry {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: string
  targetId: string
  details: Record<string, any>
  timestamp: number
}

const actionLabels: Record<string, string> = {
  user_ban: '封禁用户',
  user_unban: '解封用户',
  user_mute: '禁言用户',
  user_reward: '补发奖励',
  config_update: '更新配置',
  shop_item_add: '添加商品',
  shop_item_update: '更新商品',
  shop_item_delete: '删除商品',
  season_add: '新增赛季',
  season_update: '更新赛季',
}

const targetTypeLabels: Record<string, string> = {
  user: '用户',
  config: '配置',
  shop_item: '商品',
  season: '赛季',
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [page, action])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/audit-logs', {
        params: { page, pageSize, action },
      })
      if (response.data.success) {
        setLogs(response.data.list)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('加载审计日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setShowDetail(true)
  }

  const totalPages = Math.ceil(total / pageSize)
  const filteredLogs = logs.filter(log => 
    log.adminName.toLowerCase().includes(search.toLowerCase()) ||
    log.targetId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">操作审计日志</h3>
          <select 
            value={action} 
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
            style={{ width: '150px' }}
          >
            <option value="">全部操作</option>
            <option value="user_ban">封禁用户</option>
            <option value="user_unban">解封用户</option>
            <option value="config_update">更新配置</option>
            <option value="shop_item_add">添加商品</option>
            <option value="shop_item_update">更新商品</option>
            <option value="shop_item_delete">删除商品</option>
          </select>
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
              placeholder="搜索管理员、目标ID..."
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
          <>
            <table>
              <thead>
                <tr>
                  <th>操作时间</th>
                  <th>管理员</th>
                  <th>操作类型</th>
                  <th>目标类型</th>
                  <th>目标ID</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          background: '#38bdf820',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={14} style={{ color: '#38bdf8' }} />
                        </div>
                        <span>{log.adminName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td>
                      {targetTypeLabels[log.targetType] || log.targetType}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                      {log.targetId}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewDetail(log)}
                      >
                        <FileText size={14} />
                      </button>
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

      {showDetail && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">操作详情</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>管理员</div>
                  <div style={{ fontWeight: 500 }}>{selectedLog.adminName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>操作类型</div>
                  <span className="badge badge-info">
                    {actionLabels[selectedLog.action]}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>目标类型</div>
                  <div>{targetTypeLabels[selectedLog.targetType]}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    操作时间
                  </div>
                  <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>操作详情</div>
              <div style={{ 
                background: '#0f172a', 
                padding: '12px', 
                borderRadius: '8px', 
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <pre style={{ margin: 0, color: '#94a3b8' }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
