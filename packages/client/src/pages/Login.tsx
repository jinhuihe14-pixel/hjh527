import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Zap, User, Lock, UserPlus } from 'lucide-react'

function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login, register, guestLogin } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(username, password)
      } else if (mode === 'register') {
        await register(username, password, nickname)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await guestLogin()
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nebula-primary/10 mb-4">
            <Zap className="w-10 h-10 text-nebula-primary" />
          </div>
          <h1 className="font-orbitron text-4xl font-bold text-nebula-primary neon-text mb-2">
            NEBULA ARENA
          </h1>
          <p className="text-nebula-text-secondary font-rajdhani">
            星云竞技场 · 多人实时对战
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="flex mb-6 bg-nebula-bg/50 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md font-rajdhani font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-nebula-primary/20 text-nebula-primary'
                  : 'text-nebula-text-secondary hover:text-nebula-text'
              }`}
              onClick={() => setMode('login')}
            >
              登录
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-rajdhani font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-nebula-primary/20 text-nebula-primary'
                  : 'text-nebula-text-secondary hover:text-nebula-text'
              }`}
              onClick={() => setMode('register')}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-rajdhani text-nebula-text-secondary mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nebula-text-secondary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="neon-input w-full pl-10"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-rajdhani text-nebula-text-secondary mb-2">
                  昵称
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nebula-text-secondary" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="neon-input w-full pl-10"
                    placeholder="请输入昵称"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-rajdhani text-nebula-text-secondary mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nebula-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neon-input w-full pl-10"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {error && (
              <div className="text-nebula-danger text-sm font-rajdhani text-center py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full neon-btn-primary"
            >
              {loading ? '加载中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-nebula-primary/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-nebula-text-secondary font-rajdhani">
                  或
                </span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-lg border border-nebula-secondary/30 
                text-nebula-secondary font-rajdhani font-semibold
                hover:bg-nebula-secondary/10 hover:border-nebula-secondary/50
                transition-all flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              游客快速体验
            </button>
          </div>
        </div>

        <p className="text-center text-nebula-text-secondary/60 text-sm mt-6 font-rajdhani">
          进入游戏即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  )
}

export default Login
