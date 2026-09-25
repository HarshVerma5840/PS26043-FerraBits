import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  roles: string[]
}

interface AuthContextType {
  token: string | null
  user: User | null
  login: (token: string, roles: string[]) => void
  logout: () => void
  isAuthenticated: boolean
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Simulate slight delay to ensure smooth loading or if we needed to validate token with backend
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1]
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64))
          // Basic expiry check
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            throw new Error('Token expired')
          }
          setUser({
            id: payload.sub || 'user',
            name: payload.sub || 'User',
            roles: payload.roles || []
          })
        }
      } catch (e) {
        console.error('Invalid or expired token', e)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setIsInitializing(false)
  }, [token])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('auth-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized)
  }, [])

  const login = (newToken: string, _roles: string[]) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
