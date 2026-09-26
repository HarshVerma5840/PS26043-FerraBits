import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { httpClient } from '../api/httpClient'
import { BackendRole, hasWebPortal } from './roles'

// ── Types ─────────────────────────────────────────────────────────────────────

/** Matches the backend UserResponse DTO exactly. */
export interface BackendUser {
  userId: string
  phone: string
  email: string | null
  role: BackendRole
  kycStatus: string
  linkedSourceId: string | null
  createdAt: string
}

/** Frontend user shape stored in context. */
export interface AuthUser {
  id: string
  phone: string
  email: string | null
  role: BackendRole
  kycStatus: string
}

/** VerifyOtpResponse from the backend (camelCase after JSON parse). */
interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
  user: BackendUser
  expiresAt: string
}

/** Decoded JWT payload (only the claims we care about). */
interface JwtPayload {
  sub: string
  role: BackendRole
  phone: string
  kyc?: string
  exp?: number
  iat?: number
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextType {
  token: string | null
  user: AuthUser | null
  login: (resp: VerifyOtpResponse) => void
  logout: () => void
  isAuthenticated: boolean
  /** True while session is being restored from localStorage on first render. */
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false
  return payload.exp * 1000 < Date.now()
}

function userFromBackend(u: BackendUser): AuthUser {
  return {
    id: u.userId,
    phone: u.phone,
    email: u.email,
    role: u.role,
    kycStatus: u.kycStatus,
  }
}

function userFromJwt(payload: JwtPayload): AuthUser {
  return {
    id: payload.sub,
    phone: payload.phone,
    email: null,
    role: payload.role as BackendRole,
    kycStatus: payload.kyc ?? 'UNVERIFIED',
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Guard against calling logout during an in-flight refresh (avoids infinite loop).
  const isRefreshing = useRef(false)

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken')

    // Clear local state first (optimistic) so UI reacts immediately.
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)

    // Invalidate all private React Query caches so stale data is not shown
    // to the next user who logs in.
    queryClient.clear()

    // Server-side revocation (best-effort; don't block on failure).
    if (currentRefreshToken) {
      try {
        await httpClient.post('/auth/logout', { refreshToken: currentRefreshToken })
      } catch {
        // Ignore — local state is already cleared.
      }
    }
  }, [queryClient])

  // ── Session restoration on mount ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (!storedToken) {
        // No token at all — unauthenticated.
        if (!cancelled) setIsInitializing(false)
        return
      }

      const payload = parseJwt(storedToken)
      if (!payload) {
        // Corrupt token — clear everything.
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        if (!cancelled) setIsInitializing(false)
        return
      }

      if (!isTokenExpired(payload)) {
        // Token still valid — trust JWT claims (no DB round-trip on every refresh).
        // Only roles with a web portal are valid web sessions.
        if (!cancelled) {
          if (hasWebPortal(payload.role)) {
            setToken(storedToken)
            setUser(userFromJwt(payload))
          }
          setIsInitializing(false)
        }
        return
      }

      // Access token expired — try refresh.
      if (!storedRefreshToken || isRefreshing.current) {
        if (!cancelled) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setIsInitializing(false)
        }
        return
      }

      isRefreshing.current = true
      try {
        const res = await httpClient.post<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken: storedRefreshToken }
        )
        const { accessToken, refreshToken: newRefreshToken } = res.data

        const newPayload = parseJwt(accessToken)
        if (!newPayload || isTokenExpired(newPayload)) {
          throw new Error('Refreshed token is already expired')
        }

        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        if (!cancelled) {
          if (hasWebPortal(newPayload.role)) {
            setToken(accessToken)
            setUser(userFromJwt(newPayload))
          }
          setIsInitializing(false)
        }
      } catch {
        // Refresh failed — clear session and force re-login.
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        queryClient.clear()
        if (!cancelled) setIsInitializing(false)
      } finally {
        isRefreshing.current = false
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [queryClient])

  // ── Global 401 handler ────────────────────────────────────────────────────

  useEffect(() => {
    const handleUnauthorized = () => {
      // httpClient already cleared the token from localStorage before firing this.
      // Clear React state to match.
      setToken(null)
      setUser(null)
      queryClient.clear()
    }
    window.addEventListener('auth-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized)
  }, [queryClient])

  // ── Login (called from LoginPage after successful OTP verify) ─────────────

  const login = useCallback((resp: VerifyOtpResponse) => {
    const { accessToken, refreshToken, user: backendUser } = resp

    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    // Cache full user for display (phone/email/kyc not in JWT for display).
    localStorage.setItem('user', JSON.stringify(backendUser))

    setToken(accessToken)
    setUser(userFromBackend(backendUser))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isInitializing,
      }}
    >
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
