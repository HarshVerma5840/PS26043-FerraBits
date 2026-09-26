// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NodalDashboard from './NodalDashboard'
import { problemApi } from '../../api/problemApi'

vi.mock('../../api/problemApi', () => ({
  problemApi: {
    getProblems: vi.fn(),
    updateStatus: vi.fn(),
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

  it('handles triage action (Convert to Challenge) and invalidates queries', async () => {
    vi.mocked(problemApi.getProblems).mockResolvedValue([
      { problemId: 'p-1', title: 'Water issue', description: 'Water issue description', status: 'SUBMITTED', version: 1 }
    ])
    vi.mocked(problemApi.updateStatus).mockResolvedValue({} as any)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderPage()

    // Wait for the ticket to load. It appears in the list and the dossier, so there are multiple.
    const titles = await screen.findAllByText('Water issue')
    expect(titles.length).toBeGreaterThan(0)

    // It automatically selects the first one if not selected
    expect(screen.getByText('Scoping Dossier & Action Hub')).toBeInTheDocument()

    // Click "Convert to Challenge" -> action is 'REGISTERED'
    const routeBtn = screen.getByRole('button', { name: /Convert to Challenge/i })
    fireEvent.click(routeBtn)

    await waitFor(() => {
      expect(problemApi.updateStatus).toHaveBeenCalledWith('p-1', 'REGISTERED', 1)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['nodal-problems'] })
  })
})
