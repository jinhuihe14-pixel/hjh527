import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, Swords, ShoppingBag, Trophy, User, Settings, Coins, Gem } from 'lucide-react'
import { RANK_CONFIG, getRankTier } from '@nebula/shared'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const rankInfo = useAuthStore((state) => state.rankInfo)
  const logout = useAuthStore((state) => state.logout)

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/rank', icon: Trophy, label: '排位' },
    { path: '/shop', icon: ShoppingBag, label: '商城' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const rankTier = rankInfo?.tier || 1
  const tierInfo = RANK_CONFIG[rankTier as keyof typeof RANK_CONFIG]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-card border-b border-nebula-primary/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 
              className="font-orbitron text-2xl font-bold text-nebula-primary neon-text-sm cursor-pointer"
              onClick={() => navigate('/')}
            >
              NEBULA
            </h1>
            <span className="text-nebula-text-secondary text-sm">竞技场</span>
          </div>

          {user && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-rajdhani font-semibold text-yellow-400">
                    {user.coins?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-cyan-400" />
                  <span className="font-rajdhani font-semibold text-cyan-400">
                    {user.diamonds?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/profile')}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${tierInfo?.color}, #1a1f3a)`,
                    boxShadow: `0 0 10px ${tierInfo?.color}40`
                  }}
                >
                  {user.avatar}
                </div>
                <div className="text-right">
                  <div className="font-rajdhani font-semibold text-nebula-text">
                    {user.nickname}
                  </div>
                  <div className="text-xs" style={{ color: tierInfo?.color }}>
                    {tierInfo?.name}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-nebula-bg-lighter/50 transition-colors"
                title="设置"
              >
                <Settings className="w-5 h-5 text-nebula-text-secondary" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <nav className="glass-card border-t border-nebula-primary/20 px-6 py-2">
        <div className="max-w-7xl mx-auto flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname.startsWith('/match')) ||
              (item.path === '/' && location.pathname.startsWith('/room')) ||
              (item.path === '/' && location.pathname.startsWith('/game'))

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-nebula-primary'
                    : 'text-nebula-text-secondary hover:text-nebula-text'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} 
                />
                <span className="text-xs font-rajdhani font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Layout
