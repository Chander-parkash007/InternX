import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

export default defineConfig(({ mode }) => {
  const localIP = getLocalIP()
  const backendUrl = mode === 'production'
    ? process.env.VITE_API_URL || 'http://localhost:8081'
    : `http://${localIP}:8081`

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api':    { target: `http://${localIP}:8081`, changeOrigin: true },
        '/admin':  { target: `http://${localIP}:8081`, changeOrigin: true },
        '/uploads':{ target: `http://${localIP}:8081`, changeOrigin: true },
        '/ws':     { target: `http://${localIP}:8081`, changeOrigin: true, ws: true },
      },
    },
    define: {
      __API_URL__: JSON.stringify(backendUrl),
    },
  }
})
