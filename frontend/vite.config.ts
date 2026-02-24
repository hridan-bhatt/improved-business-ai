import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/expense': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/fraud': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/inventory': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/green-grid': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/recommendations': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/carbon': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/report': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/chat': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ai': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
