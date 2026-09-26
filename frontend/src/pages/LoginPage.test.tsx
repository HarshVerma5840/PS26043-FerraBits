// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './LoginPage'
import { authApi } from '../api/authApi'
import * as AuthContextModule from '../auth/AuthContext'
import { BackendRole } from '../auth/roles'

vi.mock('../api/authApi', () => ({
  authApi: {
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
  }
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  let queryClient: QueryClient
  const mockLogin = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.resetAllMocks()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      token: null,
    })
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  it('handles full login flow', async () => {
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({ challengeId: 'chal-123' } as any)
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { userId: '1', phone: '1234567890', role: BackendRole.ADMIN, email: null, kycStatus: 'VERIFIED', linkedSourceId: null, createdAt: '' },
      expiresAt: ''
    })

    renderPage()

    // 1. Enter phone number
    const phoneInput = screen.getByPlaceholderText(/Phone Number/i)
    fireEvent.change(phoneInput, { target: { value: '1234567890' } })

    const sendOtpBtn = screen.getByRole('button', { name: /Send OTP/i })
    fireEvent.click(sendOtpBtn)

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith('1234567890')
    })

    // 2. Enter OTP (assuming the UI switches to OTP view)
    const otpInput = await screen.findByPlaceholderText('6-Digit OTP')
    fireEvent.change(otpInput, { target: { value: '123456' } })

    const verifyBtn = screen.getByRole('button', { name: /Verify OTP/i })
    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(authApi.verifyOtp).toHaveBeenCalledWith('chal-123', '123456')
    })

    // 3. Verify context login is called and navigation happens
    expect(mockLogin).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/admin/governance', { replace: true })
  })
})
