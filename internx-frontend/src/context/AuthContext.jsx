import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const name = localStorage.getItem('name')
    const id = localStorage.getItem('userId')
    return token ? { token, role, name, id: id ? Number(id) : null } : null
  })

  // Fetch user ID on mount if we have a token but no ID
  useEffect(() => {
    if (user?.token && !user?.id) {
      api.get('/api/profile/myprofile')
        .then(r => {
          localStorage.setItem('userId', r.data.id)
          setUser(prev => ({ ...prev, id: r.data.id }))
        })
        .catch(() => {})
    }
  }, [user?.token])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('name', data.name)
    setUser({ token: data.token, role: data.role, name: data.name, id: null })
    // Fetch ID after login
    setTimeout(() => {
      api.get('/api/profile/myprofile')
        .then(r => {
          localStorage.setItem('userId', r.data.id)
          setUser(prev => prev ? { ...prev, id: r.data.id } : prev)
        })
        .catch(() => {})
    }, 500)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
