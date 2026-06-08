import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search, Eye, Trophy, Skull } from 'lucide-react'

interface GameRecord {
  id: string
  mode: string
  map: string
  duration: number
  startTime: number
  endTime: number
  winnerTeam?: number
  players: GamePlayerStat[]
}

interface GamePlayerStat {
  playerId: string
  nickname: string
  team: number
  kills: number
  deaths: number
  assists: number
  damage: number
  score: number
  rankChange: number
  result: string
}

const modeLabels: Record<string, string> = {
  quick: '快速匹配',
  ranked: '排位赛',
  custom: '自定义房间',
  team: '组队竞技',
}

function Games() {
  const [games, setGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    loadGames()
  }, [page, mode])

  const loadGames = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/games', {
        params: { page, pageSize, mode },
      })
      if (response.data.success) {
        setGames(response.data.list)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('加载对局记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleViewDetail = async (gameId: string) => {
    try {
      const response = await api.get(`/api/admin/games/${gameId}`)
      if (response.data.success) {
        setSelectedGame(response.data.data)
        setShowDetail(true)
      }
    } catch (error) {
      console.error('加载对局详情失败:', error)
    }
  }

  const totalPages = Math.ceil(total / pageSize)
  const filteredGames = games.filter(g => 
    g.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">对局记录</h3>
          <select 
            value={mode} 
            onChange={(e) => { setMode(e.target.value); setPage(1) }}
            style={{ width: '150px' }}
          >
            <option value="">全部模式</option>
            <option value="quick">快速匹配</option>
            <option value="ranked">排位赛</option>
            <option value="custom">自定义</option>
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
              placeholder="搜索对局ID..."
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
                  <th>对局ID</th>
                  <th>模式</th>
                  <th>地图</th>
                  <th>时长</th>
                  <th>获胜方</th>
                  <th>开始时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr key={game.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {game.id}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {modeLabels[game.mode] || game.mode}
                      </span>
                    </td>
                    <td>{game.map}</td>
                    <td>{formatDuration(game.duration)}</td>
                    <td>
                      {game.winnerTeam !== undefined ? (
                        <span className="badge badge-success">
                          {game.winnerTeam === 0 ? '红队' : '蓝队'}
                        </span>
                      ) : (
                        <span className="badge badge-secondary">平局</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(game.startTime).toLocaleString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewDetail(game.id)}
                      >
                        <Eye size={14} />
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

      {showDetail && selectedGame && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">对局详情</h3>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>对局ID:</span>
                  <div style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{selectedGame.id}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>模式:</span>
                  <div style={{ color: '#e2e8f0' }}>{modeLabels[selectedGame.mode]}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>地图:</span>
                  <div style={{ color: '#e2e8f0' }}>{selectedGame.map}</div>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              玩家战绩
            </h4>

            <table>
              <thead>
                <tr>
                  <th>玩家</th>
                  <th>队伍</th>
                  <th>击杀</th>
                  <th>死亡</th>
                  <th>助攻</th>
                  <th>伤害</th>
                  <th>得分</th>
                  <th>积分</th>
                </tr>
              </thead>
              <tbody>
                {selectedGame.players.map((player) => (
                  <tr key={player.playerId}>
                    <td>{player.nickname}</td>
                    <td>
                      <span className={`badge ${player.team === 0 ? 'badge-danger' : 'badge-info'}`}>
                        {player.team === 0 ? '红队' : '蓝队'}
                      </span>
                    </td>
                    <td style={{ color: '#22c55e' }}>{player.kills}</td>
                    <td style={{ color: '#ef4444' }}>{player.deaths}</td>
                    <td>{player.assists}</td>
                    <td>{player.damage}</td>
                    <td style={{ fontWeight: 600 }}>{player.score}</td>
                    <td>
                      <span className={player.rankChange >= 0 ? 'text-success' : 'text-danger'}>
                        {player.rankChange >= 0 ? '+' : ''}{player.rankChange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

export default Games
