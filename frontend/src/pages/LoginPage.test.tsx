// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
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

  afterEach(() => {
    cleanup()
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

  it('handles full login flow for ADMIN', async () => {
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({ challengeId: 'chal-123' } as any)
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { userId: '1', phone: '1234567890', role: BackendRole.ADMIN, email: null, kycStatus: 'VERIFIED', linkedSourceId: null, createdAt: '' },
      expiresAt: ''
    })

    renderPage()

    // 1. Enter phone number
    const phoneInput = screen.getByLabelText(/Registered Mobile Number/i)
    fireEvent.change(phoneInput, { target: { value: '1234567890' } })

    const sendOtpBtn = screen.getByRole('button', { name: /Get OTP/i })
    fireEvent.click(sendOtpBtn)

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith('1234567890')
    })

    // 2. Enter OTP
    const otpInput = await screen.findByLabelText(/Enter 6-digit OTP/i)
    fireEvent.change(otpInput, { target: { value: '123456' } })

    const verifyBtn = screen.getByRole('button', { name: /Verify & Enter Portal/i })
    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(authApi.verifyOtp).toHaveBeenCalledWith('chal-123', '123456')
    })

    // 3. Verify context login is called and navigation happens
    expect(mockLogin).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/admin/governance', { replace: true })
  })

  it('redirects REVIEWER to /nodal/triage upon successful verification', async () => {
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({ challengeId: 'chal-reviewer' } as any)
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'reviewer-token',
      refreshToken: 'reviewer-refresh',
      user: { userId: '2', phone: '8888888888', role: BackendRole.REVIEWER, email: null, kycStatus: 'VERIFIED', linkedSourceId: null, createdAt: '' },
      expiresAt: ''
    })

    renderPage()

    const phoneInput = screen.getByLabelText(/Registered Mobile Number/i)
    fireEvent.change(phoneInput, { target: { value: '8888888888' } })
    fireEvent.click(screen.getByRole('button', { name: /Get OTP/i }))

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith('8888888888')
    })

    const otpInput = await screen.findByLabelText(/Enter 6-digit OTP/i)
    fireEvent.change(otpInput, { target: { value: '654321' } })
    fireEvent.click(screen.getByRole('button', { name: /Verify & Enter Portal/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/nodal/triage', { replace: true })
    })
  })

  it('redirects SUBMITTER to /portal/problems upon successful verification', async () => {
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({ challengeId: 'chal-submitter' } as any)
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'submitter-token',
      refreshToken: 'submitter-refresh',
      user: { userId: '3', phone: '7777777777', role: BackendRole.SUBMITTER, email: null, kycStatus: 'VERIFIED', linkedSourceId: null, createdAt: '' },
      expiresAt: ''
    })

    renderPage()

    const phoneInput = screen.getByLabelText(/Registered Mobile Number/i)
    fireEvent.change(phoneInput, { target: { value: '7777777777' } })
    fireEvent.click(screen.getByRole('button', { name: /Get OTP/i }))

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith('7777777777')
    })

    const otpInput = await screen.findByLabelText(/Enter 6-digit OTP/i)
    fireEvent.change(otpInput, { target: { value: '112233' } })
    fireEvent.click(screen.getByRole('button', { name: /Verify & Enter Portal/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/portal/problems', { replace: true })
    })
  })

  it('redirects EVALUATOR to /evaluator/dashboard upon successful verification', async () => {
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({ challengeId: 'chal-eval' } as any)
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'eval-token',
      refreshToken: 'eval-refresh',
      user: { userId: '4', phone: '6666666666', role: BackendRole.EVALUATOR, email: null, kycStatus: 'VERIFIED', linkedSourceId: null, createdAt: '' },
      expiresAt: ''
    })

    renderPage()

    const phoneInput = screen.getByLabelText(/Registered Mobile Number/i)
    fireEvent.change(phoneInput, { target: { value: '6666666666' } })
    fireEvent.click(screen.getByRole('button', { name: /Get OTP/i }))

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith('6666666666')
    })

    const otpInput = await screen.findByLabelText(/Enter 6-digit OTP/i)
    fireEvent.change(otpInput, { target: { value: '334455' } })
    fireEvent.click(screen.getByRole('button', { name: /Verify & Enter Portal/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/evaluator/dashboard', { replace: true })
    })
  })
})
