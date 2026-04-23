import axios from 'axios'

// In production (Vercel), use the VITE_API_URL env variable pointing to Railway
// In development, use '/' so Vite proxy handles it
const baseURL = import.meta.env.VITE_API_URL || '/'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
