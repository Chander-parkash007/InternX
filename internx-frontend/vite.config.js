import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:8081'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api':     { target: 'http://localhost:8081', changeOrigin: true },
        '/admin':   { target: 'http://localhost:8081', changeOrigin: true },
        '/uploads': { target: 'http://localhost:8081', changeOrigin: true },
        '/ws':      { target: 'http://localhost:8081', changeOrigin: true, ws: true },
      },
    },
    define: {
      __API_URL__: JSON.stringify(backendUrl),
    },
  }
})
