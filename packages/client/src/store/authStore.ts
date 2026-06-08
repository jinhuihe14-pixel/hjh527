import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: string
  nickname: string
  avatar: string
  level: number
  exp: number
  coins: number
  diamonds: number
  vipLevel: number
  status?: string
}

interface RankInfo {
  tier: number
  tierName?: string
  tierColor?: string
  points: number
  highestTier: number
  highestPoints: number
  winStreak: number
  gamesPlayed: number
  wins: number
  losses: number
  rank?: number
  progress?: number
  nextTier?: any
}

interface AuthState {
  token: string | null
  user: User | null
  rankInfo: RankInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (username: string, password: string) => Promise<void>
  guestLogin: () => Promise<void>
  register: (username: string, password: string, nickname: string) => Promise<void>
  logout: () => void
  fetchUserInfo: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      rankInfo: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/user/login', { username, password })
          const { token, user, rank } = response.data
          set({
            token,
            user,
            rankInfo: rank,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.error || '登录失败')
        }
      },

      guestLogin: async () => {
        set({ isLoading: true })
        try {
          const response = await api.post('/user/guest-login')
          const { token, user, rank } = response.data
          set({
            token,
            user,
            rankInfo: rank,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.error || '登录失败')
        }
      },

      register: async (username: string, password: string, nickname: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/user/register', { username, password, nickname })
          const { token, user } = response.data
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.error || '注册失败')
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          rankInfo: null,
          isAuthenticated: false,
        })
      },

      fetchUserInfo: async () => {
        try {
          const response = await api.get('/user/info')
          const { user, rank } = response.data
          set({ user, rankInfo: rank })
        } catch (error) {
          console.error('Failed to fetch user info:', error)
        }
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    {
      name: 'nebula-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
