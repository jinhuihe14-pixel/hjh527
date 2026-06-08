import { create } from 'zustand'
import api from '../services/api'

interface AdminInfo {
  id: string
  username: string
  nickname: string
  role: string
  permissions: string[]
}

interface AuthState {
  token: string | null
  admin: AdminInfo | null
  isAuthenticated: boolean
  
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  admin: null,
  isAuthenticated: !!localStorage.getItem('admin_token'),

  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/api/admin/login', { username, password })
      
      if (response.data.success) {
        const { token, admin } = response.data
        localStorage.setItem('admin_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        set({
          token,
          admin,
          isAuthenticated: true,
        })
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common['Authorization']
    
    set({
      token: null,
      admin: null,
      isAuthenticated: false,
    })
  },
}))
