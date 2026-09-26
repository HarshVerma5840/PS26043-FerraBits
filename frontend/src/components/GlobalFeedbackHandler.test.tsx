// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { GlobalFeedbackHandler } from './GlobalFeedbackHandler'

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
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

describe('GlobalFeedbackHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  const renderHandler = () => {
    return render(
      <MemoryRouter>
        <GlobalFeedbackHandler />
      </MemoryRouter>
    )
  }

  const dispatchCustomEvent = (name: string, detail?: any) => {
    const event = new CustomEvent(name, { detail: detail || { message: 'Custom error' } })
    window.dispatchEvent(event)
  }

  it('handles api-network-error', () => {
    renderHandler()
    dispatchCustomEvent('api-network-error', { message: 'Network failed' })
    expect(toast.error).toHaveBeenCalledWith('Network failed', { id: 'network-error' })
  })

  it('handles auth-forbidden (403)', () => {
    renderHandler()
    dispatchCustomEvent('auth-forbidden')
    expect(toast.error).toHaveBeenCalledWith('You do not have permission to perform this action.', { id: 'auth-forbidden' })
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized')
  })

  it('handles api-validation-error', () => {
    renderHandler()
    dispatchCustomEvent('api-validation-error', { message: 'Invalid payload' })
    expect(toast.error).toHaveBeenCalledWith('Invalid payload', { id: 'validation-error' })
  })

  it('handles auth-unauthorized (401)', () => {
    renderHandler()
    window.dispatchEvent(new Event('auth-unauthorized'))
    expect(toast.error).toHaveBeenCalledWith('Your session has expired. Please log in again.', { id: 'auth-unauthorized' })
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('handles generic api-error', () => {
    renderHandler()
    dispatchCustomEvent('api-error', { message: 'Internal Server Error' })
    expect(toast.error).toHaveBeenCalledWith('Internal Server Error', { id: 'api-error' })
  })
})
