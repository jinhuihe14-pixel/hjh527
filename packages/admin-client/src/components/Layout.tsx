import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  LayoutDashboard, Users, ShoppingBag, Settings, 
  Gamepad2, Shield, FileText, LogOut, Crown, Activity
} from 'lucide-react'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const admin = useAuthStore((state) => state.admin)
  const logout = useAuthStore((state) => state.logout)

  const menuItems = [
    { path: '/', label: '数据总览', icon: LayoutDashboard },
    { path: '/monitor', label: '日志监控', icon: Activity },
    { path: '/users', label: '用户管理', icon: Users },
    { path: '/shop', label: '商城管理', icon: ShoppingBag },
    { path: '/configs', label: '游戏配置', icon: Settings },
    { path: '/games', label: '对局记录', icon: Gamepad2 },
    { path: '/anticheat', label: '反作弊中心', icon: Shield },
    { path: '/audit-logs', label: '操作审计', icon: FileText },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    const item = menuItems.find(m => m.path === location.pathname)
    return item?.label || '管理后台'
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🎮 Nebula Arena</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            运营管理后台
          </p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="nav-item w-full"
            style={{ background: 'transparent', border: 'none', textAlign: 'left' }}
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <h2>{getPageTitle()}</h2>
          <div className="topbar-right">
            <div className="admin-info">
              <div className="admin-avatar">
                <Crown size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {admin?.nickname || '管理员'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {admin?.role === 'super_admin' ? '超级管理员' : '运营'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
