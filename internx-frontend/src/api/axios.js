import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/'

const api = axios.create({
  baseURL,
  headers: {
    // Bypass Cloudflare browser check for API calls
    'bypass-tunnel-reminder': 'true',
  }
})

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