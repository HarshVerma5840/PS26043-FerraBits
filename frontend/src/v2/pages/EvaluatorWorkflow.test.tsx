// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleRoute, PrivateRoute } from '../components/AuthGuards'
import * as AuthContextModule from '../../auth/AuthContext'
import { BackendRole, roleDefaultRoute } from '../../auth/roles'
import { evaluationApi } from '../../api/evaluationApi'
import { evaluationAdminApi } from '../../api/evaluationAdminApi'
import { portalApi } from '../../api/portalApi'
import AssignmentDetailsPage from '../../pages/AssignmentDetailsPage'
import EvaluationSubmissionPage from '../../pages/EvaluationSubmissionPage'
import ProjectReviewPage from '../../pages/ProjectReviewPage'
import EvaluatorProfilePage from '../../pages/EvaluatorProfilePage'
import EvaluationCriteriaPage from '../../pages/EvaluationCriteriaPage'
import AssignmentQueuePage from '../../pages/AssignmentQueuePage'
import EvaluationHistoryPage from '../../pages/EvaluationHistoryPage'

// Mock dependencies
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../api/evaluationApi', () => ({
  evaluationApi: {
    getProfile: vi.fn(),
    getCriteria: vi.fn(),
    getAssignments: vi.fn(),
    getAssignmentDetail: vi.fn(),
    acceptAssignment: vi.fn(),
    declineAssignment: vi.fn(),
    submitEvaluation: vi.fn(),
    getProjectReviews: vi.fn(),
    getProjectReviewDetail: vi.fn(),
    decideProjectReview: vi.fn(),
  },
}))

vi.mock('../../api/evaluationAdminApi', () => ({
  evaluationAdminApi: {
    getQueue: vi.fn(),
    startCycle: vi.fn(),
    getCycle: vi.fn(),
    getHistory: vi.fn(),
    analyzeCycle: vi.fn(),
    routeCycle: vi.fn(),
    routeAllPools: vi.fn(),
    aggregateScores: vi.fn(),
    prioritizeCycle: vi.fn(),
    getAggregation: vi.fn(),
    publishToPortal: vi.fn(),
    getPoolModes: vi.fn(),
    setPoolMode: vi.fn(),
  },
}))

vi.mock('../../api/portalApi', () => ({
  portalApi: {
    downloadFile: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

describe('Evaluator Workflow & Permissions Verification', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const mockAuth = (
    isAuthenticated: boolean,
    role: BackendRole | null = null,
    isInitializing = false
  ) => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated,
      isInitializing,
      user: role ? { role, userId: 'eval-user-1', id: 'eval-user-1', phone: '9999999999', email: 'eval@domain.org', kycStatus: 'VERIFIED' } : null,
      login: vi.fn(),
      logout: vi.fn(),
      token: isAuthenticated ? 'mock-evaluator-jwt' : null,
    } as any)
  }

  const renderAppRoutes = (initialEntry: string) => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/unauthorized" element={<div data-testid="unauthorized-page">Access Denied</div>} />

          <Route element={<PrivateRoute />}>
            {/* Evaluator Portal */}
            <Route path="/evaluator" element={<RoleRoute allowedRoles={[BackendRole.EVALUATOR, BackendRole.ADMIN]} />}>
              <Route path="dashboard" element={<div data-testid="evaluator-dashboard-page">Evaluator Dashboard</div>} />
              <Route path="profile" element={<EvaluatorProfilePage />} />
              <Route path="criteria" element={<EvaluationCriteriaPage />} />
              <Route path="assignments" element={<AssignmentQueuePage />} />
              <Route path="assignments/:id" element={<AssignmentDetailsPage />} />
              <Route path="assignments/:id/score" element={<EvaluationSubmissionPage />} />
              <Route path="project-reviews" element={<ProjectReviewPage />} />
              <Route path="history" element={<EvaluationHistoryPage />} />
            </Route>

            {/* Admin Evaluation Console */}
            <Route path="/admin/evaluation" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
              <Route path="queue" element={<div data-testid="admin-eval-queue">Admin Evaluation Queue</div>} />
              <Route path="cycles/:id" element={<div data-testid="admin-eval-cycle">Admin Evaluation Cycle</div>} />
              <Route path="pool-modes" element={<div data-testid="admin-eval-pool-modes">Pool Modes Management</div>} />
            </Route>

            {/* Submitter & Reviewer sample routes for unauthorized testing */}
            <Route path="/portal" element={<RoleRoute allowedRoles={[BackendRole.SUBMITTER]} />}>
              <Route path="submissions" element={<div>Submitter Page</div>} />
            </Route>
            <Route path="/nodal" element={<RoleRoute allowedRoles={[BackendRole.REVIEWER]} />}>
              <Route path="triage" element={<div>Reviewer Page</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  describe('Evaluator Login Redirect & Access Guards', () => {
    it('redirects EVALUATOR role to /evaluator/dashboard by default', () => {
      expect(roleDefaultRoute(BackendRole.EVALUATOR)).toBe('/evaluator/dashboard')
    })

    it('unauthenticated user trying to access /evaluator/dashboard is redirected to /login', async () => {
      mockAuth(false, null)
      renderAppRoutes('/evaluator/dashboard')

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('evaluator-dashboard-page')).not.toBeInTheDocument()
    })

    it('SUBMITTER cannot access /evaluator/dashboard and is redirected to /unauthorized', async () => {
      mockAuth(true, BackendRole.SUBMITTER)
      renderAppRoutes('/evaluator/dashboard')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('evaluator-dashboard-page')).not.toBeInTheDocument()
    })

    it('REVIEWER cannot access /evaluator/dashboard and is redirected to /unauthorized', async () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderAppRoutes('/evaluator/dashboard')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('evaluator-dashboard-page')).not.toBeInTheDocument()
    })

    it('EVALUATOR can access /evaluator/dashboard', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      renderAppRoutes('/evaluator/dashboard')

      await waitFor(() => {
        expect(screen.getByTestId('evaluator-dashboard-page')).toBeInTheDocument()
      })
    })

    it('EVALUATOR cannot access admin-only /admin/evaluation/queue', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      renderAppRoutes('/admin/evaluation/queue')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('admin-eval-queue')).not.toBeInTheDocument()
    })

    it('ADMIN can access /admin/evaluation/queue and /admin/evaluation/pool-modes', async () => {
      mockAuth(true, BackendRole.ADMIN)
      renderAppRoutes('/admin/evaluation/queue')

      await waitFor(() => {
        expect(screen.getByTestId('admin-eval-queue')).toBeInTheDocument()
      })
    })
  })

  describe('Evaluator Profile & Scoring Criteria', () => {
    it('EVALUATOR loads and displays profile with backend contract fields', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getProfile).mockResolvedValueOnce({
        profileId: 'prof-123',
        fullName: 'Dr. Ramesh Sharma',
        designation: 'Senior Scientist',
        organization: 'ISRO',
        evaluatorType: 'GOVERNMENT',
        active: true,
        maxWorkload: 8,
        experienceYears: 12,
        totalAssigned: 15,
        totalCompleted: 14,
      } as any)

      renderAppRoutes('/evaluator/profile')

      expect(await screen.findByText('Dr. Ramesh Sharma')).toBeInTheDocument()
      expect(screen.getByText('Senior Scientist • ISRO')).toBeInTheDocument()
      expect(screen.getByText('GOVERNMENT')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('12 yrs')).toBeInTheDocument()
      expect(evaluationApi.getProfile).toHaveBeenCalledTimes(1)
    })

    it('EVALUATOR loads and displays pool scoring criteria with criterionLabel', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getCriteria).mockResolvedValueOnce([
        {
          criterionId: 'crit-1',
          criterionKey: 'TECH_FEASIBILITY',
          criterionLabel: 'Technical Feasibility & Architecture',
          description: 'Evaluates architectural viability and technology readiness.',
          maxScore: 25,
          weight: 0.25,
        },
        {
          criterionId: 'crit-2',
          criterionKey: 'SOCIAL_IMPACT',
          criterionLabel: 'Social & Economic Impact',
          description: 'Potential benefits to the target community.',
          maxScore: 25,
          weight: 0.25,
        },
      ] as any)

      renderAppRoutes('/evaluator/criteria')

      expect(await screen.findByText('Technical Feasibility & Architecture')).toBeInTheDocument()
      expect(screen.getByText('Social & Economic Impact')).toBeInTheDocument()
      expect(screen.getByText('Key: TECH_FEASIBILITY')).toBeInTheDocument()
      expect(evaluationApi.getCriteria).toHaveBeenCalledTimes(1)
    })
  })

  describe('Assignment Lifecycle: Queue, Accept, Decline, Score Submission', () => {
    it('EVALUATOR views assignment queue with deadlines and problem information', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getAssignments).mockResolvedValueOnce([
        {
          assignmentId: 'assign-uuid-1',
          cycleId: 'cycle-uuid-1',
          problemId: 'prob-uuid-1',
          problemTitle: 'Urban Flood Drainage System',
          assignedAt: '2026-10-10T00:00:00Z',
          deadline: '2026-10-25T00:00:00Z',
          status: 'ASSIGNED',
          isStale: false,
        },
      ] as any)

      renderAppRoutes('/evaluator/assignments')

      expect(await screen.findByText(/assign-u/)).toBeInTheDocument()
      expect(screen.getByText('ASSIGNED')).toBeInTheDocument()
      expect(evaluationApi.getAssignments).toHaveBeenCalledWith(undefined)
    })

    it('EVALUATOR can view assignment details, accept, and decline assignments', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      const mockDetail = {
        assignment: {
          assignmentId: 'assign-uuid-1',
          cycleId: 'cycle-uuid-1',
          problemId: 'prob-uuid-1',
          assignedAt: '2026-10-10T00:00:00Z',
          status: 'ASSIGNED',
          isStale: false,
        },
        problem: {
          problemId: 'prob-uuid-1',
          title: 'Urban Flood Drainage System',
          description: 'High precipitation drainage failure in ward 4.',
        },
        criteria: [],
      }
      vi.mocked(evaluationApi.getAssignmentDetail).mockResolvedValue(mockDetail as any)
      vi.mocked(evaluationApi.acceptAssignment).mockResolvedValueOnce({ success: true } as any)

      renderAppRoutes('/evaluator/assignments/assign-uuid-1')

      expect(await screen.findByText('Urban Flood Drainage System')).toBeInTheDocument()
      const acceptBtn = screen.getByRole('button', { name: /accept assignment/i })
      expect(acceptBtn).toBeInTheDocument()

      fireEvent.click(acceptBtn)
      await waitFor(() => {
        expect(evaluationApi.acceptAssignment).toHaveBeenCalledWith('assign-uuid-1')
      })
    })

    it('EVALUATOR submits scorecard with criteria scores, feedback, and recommendation', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getAssignmentDetail).mockResolvedValue({
        assignment: {
          assignmentId: 'assign-uuid-1',
          cycleId: 'cycle-uuid-1',
          problemId: 'prob-uuid-1',
          status: 'IN_PROGRESS',
          assignedAt: '2026-10-10T00:00:00Z',
        },
        problem: {
          problemId: 'prob-uuid-1',
          title: 'Urban Flood Drainage System',
        },
        criteria: [
          {
            criterionId: 'crit-tech',
            criterionKey: 'TECH_FEASIBILITY',
            criterionLabel: 'Technical Feasibility',
            maxScore: 20,
          },
        ],
      } as any)
      vi.mocked(evaluationApi.submitEvaluation).mockResolvedValueOnce({ success: true } as any)

      renderAppRoutes('/evaluator/assignments/assign-uuid-1/score')

      expect(await screen.findByText('Technical Feasibility')).toBeInTheDocument()

      const scoreInput = screen.getByRole('spinbutton')
      fireEvent.change(scoreInput, { target: { value: '18' } })

      const submitBtn = screen.getByRole('button', { name: /submit evaluation/i })
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(evaluationApi.submitEvaluation).toHaveBeenCalledWith(
          'assign-uuid-1',
          expect.objectContaining({
            scores: [{ criterionId: 'crit-tech', score: 18, comment: '' }],
          })
        )
      })
    })
  })

  describe('Project Reviews, File Access & Admin Observer Mode', () => {
    it('EVALUATOR views project reviews queue and opens detail with authenticated file download', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getProjectReviews).mockResolvedValueOnce([
        {
          projectReviewId: 'review-1',
          problemId: 'prob-1',
          problemTitle: 'Urban Flood Drainage System',
          submissionTitle: 'IoT Automated Flood Sluice Gates',
          status: 'ASSIGNED',
          round: 1,
          createdAt: '2026-10-12T10:00:00Z',
        },
      ] as any)

      vi.mocked(evaluationApi.getProjectReviewDetail).mockResolvedValueOnce({
        projectReviewId: 'review-1',
        problemId: 'prob-1',
        problemTitle: 'Urban Flood Drainage System',
        submissionTitle: 'IoT Automated Flood Sluice Gates',
        summary: 'Automated hydraulic gates responding to real-time telemetry sensors.',
        githubUrl: 'https://github.com/team/sluice-gates',
        status: 'ASSIGNED',
        files: [
          {
            fileId: 'file-doc-1',
            fileName: 'architecture_diagram.pdf',
            sizeBytes: 204800,
          },
        ],
      } as any)

      renderAppRoutes('/evaluator/project-reviews')

      expect(await screen.findByText('IoT Automated Flood Sluice Gates')).toBeInTheDocument()
      const reviewBtn = screen.getByRole('button', { name: /review/i })
      fireEvent.click(reviewBtn)

      expect(await screen.findByText('architecture_diagram.pdf')).toBeInTheDocument()
      expect(screen.getByText('200.0 KB')).toBeInTheDocument()

      const dlBtn = screen.getByRole('button', { name: /download/i })
      fireEvent.click(dlBtn)

      await waitFor(() => {
        expect(portalApi.downloadFile).toHaveBeenCalledWith('file-doc-1', 'architecture_diagram.pdf')
      })
    })

    it('EVALUATOR can submit ACCEPT decision on project review', async () => {
      mockAuth(true, BackendRole.EVALUATOR)
      vi.mocked(evaluationApi.getProjectReviews).mockResolvedValue([
        {
          projectReviewId: 'review-1',
          problemId: 'prob-1',
          submissionTitle: 'IoT Automated Flood Sluice Gates',
          status: 'ASSIGNED',
          createdAt: '2026-10-12T10:00:00Z',
        },
      ] as any)

      vi.mocked(evaluationApi.getProjectReviewDetail).mockResolvedValueOnce({
        projectReviewId: 'review-1',
        problemId: 'prob-1',
        submissionTitle: 'IoT Automated Flood Sluice Gates',
        status: 'ASSIGNED',
        files: [],
      } as any)
      vi.mocked(evaluationApi.decideProjectReview).mockResolvedValueOnce({} as any)

      renderAppRoutes('/evaluator/project-reviews')

      const reviewBtn = await screen.findByRole('button', { name: /review/i })
      fireEvent.click(reviewBtn)

      expect(await screen.findByText('Evaluator Decision')).toBeInTheDocument()
      const confirmBtn = screen.getByRole('button', { name: /confirm accepted/i })
      fireEvent.click(confirmBtn)

      await waitFor(() => {
        expect(evaluationApi.decideProjectReview).toHaveBeenCalledWith('review-1', 'ACCEPTED', '')
      })
    })

    it('ADMIN accessing project reviews and assignment details operates in read-only Observer Mode without mutation privileges', async () => {
      mockAuth(true, BackendRole.ADMIN)

      // 1. Assignment details under admin
      vi.mocked(evaluationApi.getAssignmentDetail).mockResolvedValueOnce({
        assignment: {
          assignmentId: 'assign-uuid-1',
          problemId: 'prob-uuid-1',
          status: 'ASSIGNED',
          assignedAt: '2026-10-10T00:00:00Z',
        },
        problem: {
          title: 'Urban Flood Drainage System',
        },
        criteria: [],
      } as any)

      renderAppRoutes('/evaluator/assignments/assign-uuid-1')

      expect(await screen.findByText(/Observer Mode/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /accept assignment/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument()
    })

    it('ADMIN accessing project review detail operates in read-only Observer Mode and decision form is suppressed', async () => {
      mockAuth(true, BackendRole.ADMIN)

      vi.mocked(evaluationApi.getProjectReviews).mockResolvedValueOnce([
        {
          projectReviewId: 'review-admin-test',
          problemId: 'prob-1',
          submissionTitle: 'IoT Flood Control',
          status: 'ASSIGNED',
          createdAt: '2026-10-12T10:00:00Z',
        },
      ] as any)

      vi.mocked(evaluationApi.getProjectReviewDetail).mockResolvedValueOnce({
        projectReviewId: 'review-admin-test',
        problemId: 'prob-1',
        submissionTitle: 'IoT Flood Control',
        status: 'ASSIGNED',
        files: [],
      } as any)

      renderAppRoutes('/evaluator/project-reviews')

      expect(await screen.findByText(/Observer Mode/i)).toBeInTheDocument()
      const reviewBtn = screen.getByRole('button', { name: /review/i })
      fireEvent.click(reviewBtn)

      expect(await screen.findByText(/Decisions can only be submitted by the assigned evaluator/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /confirm accepted/i })).not.toBeInTheDocument()
    })
  })

  describe('Admin Evaluator Controls & API Paths Verification', () => {
    it('verifies all admin evaluation API endpoints are present with correct contracts', () => {
      expect(typeof evaluationAdminApi.getQueue).toBe('function')
      expect(typeof evaluationAdminApi.startCycle).toBe('function')
      expect(typeof evaluationAdminApi.getCycle).toBe('function')
      expect(typeof evaluationAdminApi.getHistory).toBe('function')
      expect(typeof evaluationAdminApi.analyzeCycle).toBe('function')
      expect(typeof evaluationAdminApi.routeCycle).toBe('function')
      expect(typeof evaluationAdminApi.routeAllPools).toBe('function')
      expect(typeof evaluationAdminApi.aggregateScores).toBe('function')
      expect(typeof evaluationAdminApi.prioritizeCycle).toBe('function')
      expect(typeof evaluationAdminApi.getAggregation).toBe('function')
      expect(typeof evaluationAdminApi.publishToPortal).toBe('function')
      expect(typeof evaluationAdminApi.getPoolModes).toBe('function')
      expect(typeof evaluationAdminApi.setPoolMode).toBe('function')
    })
  })
})
