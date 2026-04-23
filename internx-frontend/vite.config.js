import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// Get local network IP automatically
function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // expose on network
    proxy: {
      '/api': `http://${localIP}:8081`,
      '/admin': `http://${localIP}:8081`,
      '/uploads': `http://${localIP}:8081`,
    },
  },
})
