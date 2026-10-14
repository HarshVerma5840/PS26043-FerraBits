// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NodalDashboard from './NodalDashboard'
import { problemApi } from '../../api/problemApi'

vi.mock('../../api/problemApi', () => ({
  problemApi: {
    getProblems: vi.fn(),
    updateStatus: vi.fn(),
    getAuditHistory: vi.fn().mockResolvedValue([
      {
        logId: 'log-1',
        problemId: 'p-1',
        actionType: 'CREATED',
        performedAt: '2026-10-14T10:00:00Z',
        ipAddress: '127.0.0.1'
      }
    ]),
  }
}))

vi.mock('../../api/analyticsApi', () => ({
  analyticsApi: {
    getSummary: vi.fn().mockResolvedValue({ studentsInvolved: 10, projectsCompleted: 5 }),
  }
}))

describe('NodalDashboard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NodalDashboard />
      </QueryClientProvider>
    )
  }

  it('renders empty state when no problems in queue', async () => {
    vi.mocked(problemApi.getProblems).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('No problems found')).toBeInTheDocument()
  })

  it('handles triage action (Convert to Challenge) from SOURCE_VERIFIED and invalidates queries', async () => {
    vi.mocked(problemApi.getProblems).mockResolvedValue([
      { problemId: 'p-1', title: 'Water issue', description: 'Water issue description', status: 'SOURCE_VERIFIED', version: 1 }
    ])
    vi.mocked(problemApi.updateStatus).mockResolvedValue({} as any)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderPage()

    // Wait for the ticket to load
    const titles = await screen.findAllByText('Water issue')
    expect(titles.length).toBeGreaterThan(0)

    // Automatically selects first ticket
    expect(screen.getByText('Scoping Dossier & Action Hub')).toBeInTheDocument()

    // Audit trail should be loaded
    expect(await screen.findByText('CREATED')).toBeInTheDocument()

    // Click "Convert to Challenge" -> action is 'REGISTERED'
    const routeBtn = screen.getByRole('button', { name: /Convert to Challenge/i })
    fireEvent.click(routeBtn)

    await waitFor(() => {
      expect(problemApi.updateStatus).toHaveBeenCalledWith('p-1', 'REGISTERED', 1)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['nodal-problems'] })
  })

  it('offers Verify Source action for SUBMITTED tickets according to backend transition rules', async () => {
    vi.mocked(problemApi.getProblems).mockResolvedValue([
      { problemId: 'p-2', title: 'Road repair', description: 'Road pothole issue', status: 'SUBMITTED', version: 2 }
    ])
    vi.mocked(problemApi.updateStatus).mockResolvedValue({} as any)

    renderPage()

    const titles = await screen.findAllByText('Road repair')
    expect(titles.length).toBeGreaterThan(0)

    // For SUBMITTED, Verify Source is permitted, while Convert to Challenge is NOT
    const verifyBtn = screen.getByRole('button', { name: /Verify Source/i })
    expect(verifyBtn).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Convert to Challenge/i })).not.toBeInTheDocument()

    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(problemApi.updateStatus).toHaveBeenCalledWith('p-2', 'SOURCE_VERIFYING', 2)
    })
  })
})
