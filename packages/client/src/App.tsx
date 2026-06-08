import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import MatchMaking from './pages/MatchMaking'
import Room from './pages/Room'
import Game from './pages/Game'
import Result from './pages/Result'
import Rank from './pages/Rank'
import Shop from './pages/Shop'
import Profile from './pages/Profile'
import Layout from './components/Layout'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="relative min-h-screen">
      <div className="stars-bg" />
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          
          <Route path="/game/:roomId" element={isAuthenticated ? <Game /> : <Navigate to="/login" replace />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={isAuthenticated ? <Lobby /> : <Navigate to="/login" replace />} />
            <Route path="/match" element={isAuthenticated ? <MatchMaking /> : <Navigate to="/login" replace />} />
            <Route path="/room/:roomId" element={isAuthenticated ? <Room /> : <Navigate to="/login" replace />} />
            <Route path="/result/:gameId" element={isAuthenticated ? <Result /> : <Navigate to="/login" replace />} />
            <Route path="/rank" element={isAuthenticated ? <Rank /> : <Navigate to="/login" replace />} />
            <Route path="/shop" element={isAuthenticated ? <Shop /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
