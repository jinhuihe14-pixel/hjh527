import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search, Eye, Ban, CheckCircle, AlertTriangle } from 'lucide-react'

interface AnticheatRecord {
  id: string
  playerId: string
  playerName: string
  cheatType: string
  cheatTypeName: string
  severity: number
  evidence: Record<string, any>
  gameId?: string
  timestamp: number
  handled: boolean
  handledBy?: string
  handledAt?: number
  punishment?: string
}

const cheatTypeLabels: Record<string, string> = {
  speed_hack: '加速作弊',
  damage_hack: '伤害篡改',
  frequency_hack: '高频攻击',
  teleport_hack: '瞬移作弊',
  god_mode: '锁血不死',
  data_tampering: '数据篡改',
}

function Anticheat() {
  const [records, setRecords] = useState<AnticheatRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [selectedRecord, setSelectedRecord] = useState<AnticheatRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState(604800000)

  useEffect(() => {
    loadRecords()
  }, [page, type, status])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/anticheat', {
        params: { page, pageSize, type },
      })
      if (response.data.success) {
        setRecords(response.data.list)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('加载反作弊记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (record: AnticheatRecord) => {
    setSelectedRecord(record)
    setShowDetail(true)
  }

  const handleBan = () => {
    setShowDetail(false)
    setShowBanModal(true)
  }

  const confirmBan = async () => {
    if (!selectedRecord) return
    try {
      await api.post(`/api/admin/users/${selectedRecord.playerId}/ban`, {
        reason: banReason || '作弊行为',
        duration: banDuration,
        permanent: false,
      })
      setShowBanModal(false)
      loadRecords()
    } catch (error) {
      console.error('封禁失败:', error)
    }
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#ef4444'
    if (severity >= 5) return '#f59e0b'
    return '#22c55e'
  }

  const totalPages = Math.ceil(total / pageSize)
  const filteredRecords = records.filter(r => 
    r.playerName.toLowerCase().includes(search.toLowerCase()) ||
    r.playerId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">反作弊检测记录</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              style={{ width: '120px' }}
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="handled">已处理</option>
            </select>
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              style={{ width: '130px' }}
            >
              <option value="">全部类型</option>
              <option value="speed_hack">加速作弊</option>
              <option value="damage_hack">伤害篡改</option>
              <option value="frequency_hack">高频攻击</option>
              <option value="teleport_hack">瞬移作弊</option>
              <option value="god_mode">锁血不死</option>
            </select>
          </div>
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
              placeholder="搜索玩家..."
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
                  <th>玩家</th>
                  <th>作弊类型</th>
                  <th>严重程度</th>
                  <th>关联对局</th>
                  <th>检测时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{record.playerName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{record.playerId}</div>
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {cheatTypeLabels[record.cheatType] || record.cheatType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: getSeverityColor(record.severity),
                          boxShadow: `0 0 10px ${getSeverityColor(record.severity)}`
                        }} />
                        <span style={{ color: getSeverityColor(record.severity), fontWeight: 600 }}>
                          {record.severity}/10
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                      {record.gameId || '-'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td>
                      {record.handled ? (
                        <span className="badge badge-success">已处理</span>
                      ) : (
                        <span className="badge badge-warning">待处理</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleViewDetail(record)}
                        >
                          <Eye size={14} />
                        </button>
                        {!record.handled && (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setSelectedRecord(record)
                              setBanReason(`检测到${cheatTypeLabels[record.cheatType]}`)
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

      {showDetail && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">检测详情</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>玩家</div>
                  <div style={{ fontWeight: 500 }}>{selectedRecord.playerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>作弊类型</div>
                  <span className="badge badge-danger">
                    {cheatTypeLabels[selectedRecord.cheatType]}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>严重程度</div>
                  <div style={{ color: getSeverityColor(selectedRecord.severity), fontWeight: 600 }}>
                    {selectedRecord.severity}/10
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>检测时间</div>
                  <div>{new Date(selectedRecord.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>证据数据</div>
              <div style={{ 
                background: '#0f172a', 
                padding: '12px', 
                borderRadius: '8px', 
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <pre style={{ margin: 0, color: '#94a3b8' }}>
                  {JSON.stringify(selectedRecord.evidence, null, 2)}
                </pre>
              </div>
            </div>

            {selectedRecord.handled && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontWeight: 500 }}>已处理</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  处理人: {selectedRecord.handledBy} | 处罚: {selectedRecord.punishment}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>
                关闭
              </button>
              {!selectedRecord.handled && (
                <button className="btn btn-danger" onClick={handleBan}>
                  <Ban size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  封禁账号
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showBanModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">封禁账号</h3>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
              <div>
                <div style={{ fontWeight: 500 }}>{selectedRecord.playerName}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedRecord.playerId}</div>
              </div>
            </div>

            <div className="form-group">
              <label>封禁原因</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>封禁时长</label>
              <select value={banDuration} onChange={(e) => setBanDuration(Number(e.target.value))}>
                <option value={86400000}>1天</option>
                <option value={604800000}>7天</option>
                <option value={2592000000}>30天</option>
                <option value={-1}>永久</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBanModal(false)}>
                取消
              </button>
              <button className="btn btn-danger" onClick={confirmBan}>
                确认封禁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Anticheat
