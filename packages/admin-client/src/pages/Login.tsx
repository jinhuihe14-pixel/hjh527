import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Lock, User } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const success = await login(username, password)
      if (success) {
        navigate('/')
      } else {
        setError('用户名或密码错误')
      }
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Nebula Arena</h1>
        <p className="login-subtitle">运营管理后台</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>密码</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '10px 12px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              borderRadius: '6px',
              fontSize: '13px' 
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#64748b', 
          marginTop: '20px' 
        }}>
          默认账号: admin / admin123
        </p>
      </div>
    </div>
  )
}

export default Login
