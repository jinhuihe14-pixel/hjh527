import { useEffect, useState } from 'react'
import api from '../services/api'
import { Save, RotateCcw, Download, Upload, Clock } from 'lucide-react'

interface ConfigBackup {
  id: string
  configKey: string
  version: number
  data: any
  note: string
  createdAt: number
  createdBy: string
}

const featureLabels: Record<string, string> = {
  tasks: '任务系统',
  achievements: '成就系统',
  weekly_rank: '周榜功能',
  shop: '商城系统',
  ranked: '排位赛',
}

function Gameplay() {
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backups, setBackups] = useState<ConfigBackup[]>([])
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [backupRemark, setBackupRemark] = useState('')

  useEffect(() => {
    loadFeatures()
    loadBackups()
  }, [])

  const loadFeatures = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/features')
      if (response.data.success) {
        setFeatures(response.data.data)
      }
    } catch (error) {
      console.error('加载玩法配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBackups = async () => {
    try {
      const response = await api.get('/api/admin/configs/features/backups')
      if (response.data.success) {
        setBackups(response.data.data)
      }
    } catch (error) {
      console.error('加载备份列表失败:', error)
    }
  }

  const handleToggle = (key: string) => {
    setFeatures({ ...features, [key]: !features[key] })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put('/api/admin/features', features)
      alert('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleBackup = async () => {
    try {
      await api.post('/api/admin/configs/features/backup', {
        data: features,
        note: backupRemark,
      })
      setShowBackupModal(false)
      setBackupRemark('')
      loadBackups()
      alert('备份成功')
    } catch (error) {
      console.error('备份失败:', error)
      alert('备份失败')
    }
  }

  const handleRestore = async (backupId: string) => {
    if (!confirm('确定要恢复这个备份版本吗？当前配置将被覆盖。')) return
    try {
      await api.post(`/api/admin/configs/backups/${backupId}/restore`)
      loadFeatures()
      loadBackups()
      alert('恢复成功')
    } catch (error) {
      console.error('恢复失败:', error)
      alert('恢复失败')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">玩法开关配置</h3>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
            保存配置
          </button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {Object.entries(featureLabels).map(([key, label]) => (
              <div
                key={key}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {features[key] ? '已启用' : '已禁用'}
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={features[key] ?? false}
                    onChange={() => handleToggle(key)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: features[key] ? '#38bdf8' : '#334155',
                      borderRadius: '24px',
                      transition: '.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '.3s',
                        transform: features[key] ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">配置版本备份</h3>
          <button className="btn btn-secondary" onClick={() => setShowBackupModal(true)}>
            <Download size={16} style={{ display: 'inline', marginRight: '6px' }} />
            创建备份
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>版本号</th>
              <th>配置项</th>
              <th>备注</th>
              <th>创建人</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.id}>
                <td>
                  <span className="badge badge-info">v{backup.version}</span>
                </td>
                <td>{backup.configKey}</td>
                <td>{backup.note || '-'}</td>
                <td>{backup.createdBy || '系统'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: '#64748b' }} />
                    {formatDate(backup.createdAt)}
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleRestore(backup.id)}
                  >
                    <RotateCcw size={14} />
                    恢复
                  </button>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                  暂无备份记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBackupModal && (
        <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">创建配置备份</h3>
            </div>

            <div className="form-group">
              <label>备份备注</label>
              <textarea
                value={backupRemark}
                onChange={(e) => setBackupRemark(e.target.value)}
                placeholder="请输入备份备注，便于后期识别"
                rows={3}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBackupModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleBackup}>
                <Upload size={16} style={{ display: 'inline', marginRight: '6px' }} />
                创建备份
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gameplay
