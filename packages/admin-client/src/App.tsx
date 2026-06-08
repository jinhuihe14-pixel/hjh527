import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Tasks from './pages/Tasks'
import Achievements from './pages/Achievements'
import Shop from './pages/Shop'
import Gameplay from './pages/Gameplay'
import Configs from './pages/Configs'
import Games from './pages/Games'
import Anticheat from './pages/Anticheat'
import AuditLogs from './pages/AuditLogs'
import Monitor from './pages/Monitor'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" replace />} />
        <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/login" replace />} />
        <Route path="/achievements" element={isAuthenticated ? <Achievements /> : <Navigate to="/login" replace />} />
        <Route path="/shop" element={isAuthenticated ? <Shop /> : <Navigate to="/login" replace />} />
        <Route path="/gameplay" element={isAuthenticated ? <Gameplay /> : <Navigate to="/login" replace />} />
        <Route path="/configs" element={isAuthenticated ? <Configs /> : <Navigate to="/login" replace />} />
        <Route path="/games" element={isAuthenticated ? <Games /> : <Navigate to="/login" replace />} />
        <Route path="/anticheat" element={isAuthenticated ? <Anticheat /> : <Navigate to="/login" replace />} />
        <Route path="/audit-logs" element={isAuthenticated ? <AuditLogs /> : <Navigate to="/login" replace />} />
        <Route path="/monitor" element={isAuthenticated ? <Monitor /> : <Navigate to="/login" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
