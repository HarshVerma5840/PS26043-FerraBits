// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './AuthContext'
import { httpClient } from '../api/httpClient'
import { BackendRole } from './roles'

vi.mock('../api/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
  },
}))

const TestComponent = () => {
  const { isAuthenticated, isInitializing, user, logout } = useAuth()
  if (isInitializing) return <div>Initializing...</div>
  if (!isAuthenticated) return <div>Not Authenticated</div>
  return (
    <div>
      <div>Authenticated as {user?.role}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext - Token Refresh and Logout', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.resetAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    cleanup()
  })

  const renderWithProvider = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  // Create a helper to generate mock JWTs
  const createMockToken = (expOffsetSeconds: number, role: BackendRole = BackendRole.ADMIN) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      sub: 'user123',
      role,
      phone: '1234567890',
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
    }))
    return `${header}.${payload}.signature`
  }

  it('restores session from valid token', async () => {
    localStorage.setItem('token', createMockToken(3600)) // Valid for 1 hour
    localStorage.setItem('refreshToken', 'mock-refresh')

    renderWithProvider()

    // Wait for async effect
    expect(await screen.findByText('Authenticated as ADMIN')).toBeInTheDocument()
  })

  it('attempts refresh if token is expired', async () => {
    localStorage.setItem('token', createMockToken(-3600)) // Expired 1 hour ago
    localStorage.setItem('refreshToken', 'mock-refresh')

    const newAccessToken = createMockToken(3600)
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { accessToken: newAccessToken, refreshToken: 'new-refresh' }
    } as any)

    renderWithProvider()

    expect(await screen.findByText('Authenticated as ADMIN')).toBeInTheDocument()
    expect(httpClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'mock-refresh' })
    expect(localStorage.getItem('token')).toBe(newAccessToken)
  })

  it('clears session if refresh fails', async () => {
    localStorage.setItem('token', createMockToken(-3600))
    localStorage.setItem('refreshToken', 'mock-refresh')

    vi.mocked(httpClient.post).mockRejectedValueOnce(new Error('Refresh failed'))

    renderWithProvider()

    expect(await screen.findByText('Not Authenticated')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logout clears local storage and calls backend', async () => {
    localStorage.setItem('token', createMockToken(3600))
    localStorage.setItem('refreshToken', 'mock-refresh')
    localStorage.setItem('user', JSON.stringify({ userId: 'user123', role: 'ADMIN' }))

    vi.mocked(httpClient.post).mockResolvedValueOnce({} as any)

    renderWithProvider()
    
    expect(await screen.findByText('Authenticated as ADMIN')).toBeInTheDocument()

    act(() => {
      screen.getByText('Logout').click()
    })

    expect(httpClient.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'mock-refresh' })
    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument()
  })
})
