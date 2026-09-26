// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminGovernancePage from './AdminGovernancePage'
import { governanceApi } from '../../api/governanceApi'

vi.mock('../../api/governanceApi', () => ({
  governanceApi: {
    getReviews: vi.fn(),
    approveReview: vi.fn(),
    rejectReview: vi.fn(),
    overrideReview: vi.fn(),
  }
}))

describe('AdminGovernancePage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.resetAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
    cleanup()
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminGovernancePage />
      </QueryClientProvider>
    )
  }

  it('renders empty state when no reviews exist', async () => {
    vi.mocked(governanceApi.getReviews).mockResolvedValueOnce([])
    renderPage()

    expect(await screen.findByText('No Pending Actions')).toBeInTheDocument()
  })

  it('handles approve mutation and invalidates queries', async () => {
    vi.mocked(governanceApi.getReviews).mockResolvedValueOnce([
      { reviewId: 'rev-1', problemId: 'prob-1', status: 'PENDING', topEvidenceCards: [], auditHistory: [] }
    ])
    vi.mocked(governanceApi.approveReview).mockResolvedValueOnce({} as any)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderPage()

    expect(await screen.findByText('Problem ID: prob-1')).toBeInTheDocument()

    const reasonInput = screen.getByPlaceholderText(/Mandatory reasoning/i)
    fireEvent.change(reasonInput, { target: { value: 'Looks good' } })

    const approveBtn = screen.getByRole('button', { name: /Approve Allocation/i })
    fireEvent.click(approveBtn)

    await waitFor(() => {
      expect(governanceApi.approveReview).toHaveBeenCalledWith('rev-1')
    })
    
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['governance-reviews'] })
  })

  it('handles reject mutation', async () => {
    vi.mocked(governanceApi.getReviews).mockResolvedValueOnce([
      { reviewId: 'rev-2', problemId: 'prob-2', status: 'PENDING' }
    ])
    vi.mocked(governanceApi.rejectReview).mockResolvedValueOnce({} as any)

    renderPage()

    expect(await screen.findByText('Problem ID: prob-2')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Mandatory reasoning/i), { target: { value: 'Incomplete' } })
    fireEvent.click(screen.getByRole('button', { name: /Reject/i }))

    await waitFor(() => {
      expect(governanceApi.rejectReview).toHaveBeenCalledWith('rev-2', 'Incomplete')
    })
  })
  
  it('handles override mutation', async () => {
    vi.mocked(governanceApi.getReviews).mockResolvedValueOnce([
      { reviewId: 'rev-3', problemId: 'prob-3', status: 'PENDING' }
    ])
    vi.mocked(governanceApi.overrideReview).mockResolvedValueOnce({} as any)

    renderPage()

    expect(await screen.findByText('Problem ID: prob-3')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Mandatory reasoning/i), { target: { value: 'Manual override' } })
    fireEvent.click(screen.getByRole('button', { name: /Override Review/i }))

    await waitFor(() => {
      expect(governanceApi.overrideReview).toHaveBeenCalledWith('rev-3', 'manual-target-inst-id', 'Manual override')
    })
  })
})
