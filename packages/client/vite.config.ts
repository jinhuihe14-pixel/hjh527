import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@nebula/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3527,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://localhost:9527',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
