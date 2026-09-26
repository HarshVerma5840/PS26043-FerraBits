// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EvaluatorDashboardPage from './EvaluatorDashboardPage'
import { evaluationApi } from '../../api/evaluationApi'

vi.mock('../../api/evaluationApi', () => ({
  evaluationApi: {
    getAssignments: vi.fn(),
    getAssignmentDetail: vi.fn(),
    submitEvaluation: vi.fn(),
  }
}))

vi.mock('../../api/analyticsApi', () => ({
  analyticsApi: {
    getSummary: vi.fn().mockResolvedValue({ projectsCompleted: 15 }),
  }
}))

describe('EvaluatorDashboardPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.resetAllMocks()
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EvaluatorDashboardPage />
      </QueryClientProvider>
    )
  }

  it('renders empty state when no assignments exist', async () => {
    vi.mocked(evaluationApi.getAssignments).mockResolvedValueOnce([])
    renderPage()
    expect(await screen.findByText('No Pending Evaluations')).toBeInTheDocument()
  })

  it('submits evaluation and invalidates queries', async () => {
    vi.mocked(evaluationApi.getAssignments).mockResolvedValueOnce([
      { assignmentId: 'assign-1', cycleId: 'cycle-1', problemId: 'prob-1', evaluatorProfileId: 'eval-1', assignedAt: new Date().toISOString(), status: 'IN_PROGRESS', isStale: false }
    ])
    vi.mocked(evaluationApi.getAssignmentDetail).mockResolvedValueOnce({
      assignment: { assignmentId: 'assign-1', cycleId: 'cycle-1', problemId: 'prob-1', evaluatorProfileId: 'eval-1', assignedAt: new Date().toISOString(), status: 'IN_PROGRESS', isStale: false },
      criteria: [
        { criterionId: 'crit-1', name: 'Innovation Score', maxScore: 10 }
      ]
    })
    vi.mocked(evaluationApi.submitEvaluation).mockResolvedValueOnce({} as any)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderPage()

    // Wait for the assignment detail to load
    expect(await screen.findByText('Problem ID: prob-1')).toBeInTheDocument()

    // Find the comment input by placeholder
    const commentInput = screen.getByPlaceholderText(/Enter formal technical observations/i)
    fireEvent.change(commentInput, { target: { value: 'Good solution' } })

    // Find the score slider (label is "1. Innovation Score")
    const innovationSlider = screen.getByLabelText(/1. Innovation Score/i)
    fireEvent.change(innovationSlider, { target: { value: '8' } })

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Submit Official Evaluation/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(evaluationApi.submitEvaluation).toHaveBeenCalledWith('assign-1', {
        scores: [
          { criterionId: 'crit-1', score: 8, comment: 'Score for Innovation Score' }
        ],
        feedback: 'Good solution',
        recommendation: 'APPROVE'
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['evaluator-assignments'] })
  })
})
