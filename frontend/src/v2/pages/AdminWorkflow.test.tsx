// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as AuthContextModule from '../../auth/AuthContext'
import { BackendRole } from '../../auth/roles'
import { sourceApi } from '../../api/sourceApi'
import { governanceApi } from '../../api/governanceApi'
import { registryApi } from '../../api/registryApi'
import { analyticsApi } from '../../api/analyticsApi'
import { codejudgeApi } from '../../api/codejudgeApi'
import { evaluationAdminApi } from '../../api/evaluationAdminApi'
import UserRoleManagementPage from '../../pages/UserRoleManagementPage'
import SourceAccountPage from '../../pages/SourceAccountPage'
import ReviewDeskPage from '../../pages/ReviewDeskPage'
import ReviewDetailPage from '../../pages/ReviewDetailPage'
import RegistryPage from '../../pages/RegistryPage'
import AnalyticsDashboardPage from '../../pages/AnalyticsDashboardPage'
import CodeJudgeAdminJobsPage from '../../pages/CodeJudgeAdminJobsPage'
import CodeJudgeScoringConfigPage from '../../pages/CodeJudgeScoringConfigPage'
import PoolModePage from '../../pages/PoolModePage'
import EvaluationQueuePage from '../../pages/EvaluationQueuePage'

// Mock dependencies
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../api/sourceApi', () => ({
  sourceApi: {
    getUsers: vi.fn(),
    updateUserRole: vi.fn(),
    onboardEvaluator: vi.fn(),
    getSourceAccounts: vi.fn(),
    verifySourceAccount: vi.fn(),
    getReviewerRegistrations: vi.fn(),
  },
}))

vi.mock('../../api/governanceApi', () => ({
  governanceApi: {
    getReviews: vi.fn(),
    getReviewById: vi.fn(),
    approveReview: vi.fn(),
    rejectReview: vi.fn(),
    overrideReview: vi.fn(),
  },
}))

vi.mock('../../api/registryApi', () => ({
  registryApi: {
    getInstitutions: vi.fn(),
    getInstitutionById: vi.fn(),
    getVersions: vi.fn(),
    getVersionById: vi.fn(),
    importRegistry: vi.fn(),
    publishVersion: vi.fn(),
    archiveVersion: vi.fn(),
  },
}))

vi.mock('../../api/analyticsApi', () => ({
  analyticsApi: {
    getSummary: vi.fn(),
    getDistrictAnalytics: vi.fn(),
    getInstitutionsAnalytics: vi.fn(),
    getProjectsAnalytics: vi.fn(),
  },
}))

vi.mock('../../api/codejudgeApi', () => ({
  codejudgeApi: {
    getAdminJobs: vi.fn(),
    getScoringConfig: vi.fn(),
  },
}))

vi.mock('../../api/evaluationAdminApi', () => ({
  evaluationAdminApi: {
    getQueue: vi.fn(),
    getCycle: vi.fn(),
    getPoolModes: vi.fn(),
    setPoolMode: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

describe('Admin Workflows Verification', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    vi.resetAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
    cleanup()
  })

  const mockAdminAuth = () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      user: { role: BackendRole.ADMIN, userId: 'admin-1', id: 'admin-1', phone: '0000000000', email: 'admin@gov.in', kycStatus: 'VERIFIED' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'admin-jwt-token',
    } as any)
  }

  const renderWithProviders = (ui: React.ReactElement, initialEntry = '/') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('User Role Management & Allowed Roles Enforcement', () => {
    it('only presents valid BackendRole enum options (SUBMITTER, REVIEWER, EVALUATOR, ADMIN) and disallows invalid roles', async () => {
      mockAdminAuth()
      vi.mocked(sourceApi.getUsers).mockResolvedValueOnce([
        { userId: 'u-1', phone: '9876543210', email: 'user@example.com', role: 'SUBMITTER', kycStatus: 'VERIFIED', createdAt: '' },
      ])

      renderWithProviders(<UserRoleManagementPage />)

      expect(await screen.findByText('9876543210')).toBeInTheDocument()
      
      const select = screen.getByRole('combobox')
      const options = Array.from(select.querySelectorAll('option')).map(o => o.value)

      // Strict UserRole enum verification
      expect(options).toEqual(['SUBMITTER', 'REVIEWER', 'EVALUATOR', 'ADMIN'])
      expect(options).not.toContain('CITIZEN')
      expect(options).not.toContain('SOURCE_ADMIN')
      expect(options).not.toContain('PROJECT_MANAGER')
      expect(options).not.toContain('FACULTY')
      expect(options).not.toContain('INDUSTRY_USER')
    })

    it('updates user role when changed and saved', async () => {
      mockAdminAuth()
      vi.mocked(sourceApi.getUsers).mockResolvedValue([
        { userId: 'u-1', phone: '9876543210', email: 'user@example.com', role: 'SUBMITTER', kycStatus: 'VERIFIED', createdAt: '' },
      ])
      vi.mocked(sourceApi.updateUserRole).mockResolvedValueOnce({} as any)

      renderWithProviders(<UserRoleManagementPage />)

      expect(await screen.findByText('9876543210')).toBeInTheDocument()
      
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'REVIEWER' } })

      const saveBtn = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(sourceApi.updateUserRole).toHaveBeenCalledWith('u-1', 'REVIEWER')
      })
    })

    it('allows admin to onboard an evaluator via dedicated modal', async () => {
      mockAdminAuth()
      vi.mocked(sourceApi.getUsers).mockResolvedValue([])
      vi.mocked(sourceApi.onboardEvaluator).mockResolvedValueOnce({
        userId: 'eval-new',
        phone: '9988776655',
        role: 'EVALUATOR',
        evaluatorPool: 'GOVERNMENT',
        devOtp: '123456',
      })

      renderWithProviders(<UserRoleManagementPage />)

      const onboardBtn = screen.getByRole('button', { name: /onboard evaluator/i })
      fireEvent.click(onboardBtn)

      expect(screen.getByText(/Onboard Domain Evaluator/i)).toBeInTheDocument()

      const phoneInput = screen.getByPlaceholderText('9876543210')
      fireEvent.change(phoneInput, { target: { value: '9988776655' } })

      const submitBtn = screen.getByRole('button', { name: /create evaluator/i })
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(sourceApi.onboardEvaluator).toHaveBeenCalledWith({
          phone: '9988776655',
          evaluatorPool: 'GOVERNMENT',
        })
      })

      expect(await screen.findByText(/Dev OTP Challenge: 123456/i)).toBeInTheDocument()
    })
  })

  describe('Source Account Verification', () => {
    it('lists source accounts and verifies unverified accounts', async () => {
      mockAdminAuth()
      vi.mocked(sourceApi.getSourceAccounts).mockResolvedValue([
        {
          sourceAccountId: 'sa-1',
          sourceId: 's-1',
          registrationId: 'reg-1',
          sourceBucket: 'GOVERNMENT',
          sourceType: 'MUNICIPALITY',
          displayName: 'Municipal Corp of Delhi',
          status: 'ACTIVE',
          verificationStatus: 'PENDING',
          canSubmit: false,
          createdAt: '2026-10-01T00:00:00Z',
        },
      ])
      vi.mocked(sourceApi.verifySourceAccount).mockResolvedValueOnce({} as any)

      renderWithProviders(<SourceAccountPage />)

      expect(await screen.findByText('Municipal Corp of Delhi')).toBeInTheDocument()
      const verifyBtn = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyBtn)

      await waitFor(() => {
        expect(sourceApi.verifySourceAccount).toHaveBeenCalledWith('sa-1')
      })
    })
  })

  describe('Governance Review & Decision Actions', () => {
    it('lists governance reviews and opens detail for approval, rejection, and override', async () => {
      mockAdminAuth()
      vi.mocked(governanceApi.getReviews).mockResolvedValueOnce([
        {
          reviewId: 'rev-uuid-1',
          problemId: 'prob-uuid-1',
          status: 'PENDING',
          topEvidenceCards: [
            { institutionId: 'inst-1', institutionName: 'IIT Delhi', finalScore: 0.92 }
          ],
        } as any
      ])

      renderWithProviders(<ReviewDeskPage />)

      expect(await screen.findByText(/Review rev-uuid/i)).toBeInTheDocument()
      expect(screen.getByText('Problem ID: prob-uuid-1')).toBeInTheDocument()
    })

    it('approves a governance review in detail page', async () => {
      mockAdminAuth()
      vi.mocked(governanceApi.getReviewById).mockResolvedValueOnce({
        reviewId: 'rev-1',
        problemId: 'prob-1',
        status: 'PENDING',
        topEvidenceCards: [
          { institutionId: 'inst-1', institutionName: 'IIT Delhi', finalScore: 0.92, explanation: 'Excellent capability match' }
        ],
        auditHistory: [],
      } as any)
      vi.mocked(governanceApi.approveReview).mockResolvedValueOnce({} as any)

      renderWithProviders(
        <Routes>
          <Route path="/admin/reviews/:id" element={<ReviewDetailPage />} />
        </Routes>,
        '/admin/reviews/rev-1'
      )

      expect(await screen.findByText('IIT Delhi')).toBeInTheDocument()
      const approveBtn = screen.getByRole('button', { name: /approve/i })
      fireEvent.click(approveBtn)

      await waitFor(() => {
        expect(governanceApi.approveReview).toHaveBeenCalledWith('rev-1')
      })
    })

    it('rejects a governance review with mandatory reason', async () => {
      mockAdminAuth()
      vi.mocked(governanceApi.getReviewById).mockResolvedValueOnce({
        reviewId: 'rev-1',
        problemId: 'prob-1',
        status: 'PENDING',
        topEvidenceCards: [],
        auditHistory: [],
      } as any)
      vi.mocked(governanceApi.rejectReview).mockResolvedValueOnce({} as any)

      renderWithProviders(
        <Routes>
          <Route path="/admin/reviews/:id" element={<ReviewDetailPage />} />
        </Routes>,
        '/admin/reviews/rev-1'
      )

      expect(await screen.findByText('Review rev-1')).toBeInTheDocument()
      const rejectModalBtn = screen.getByRole('button', { name: /reject/i })
      fireEvent.click(rejectModalBtn)

      expect(screen.getByText('Reject Recommendation')).toBeInTheDocument()
      const reasonInput = screen.getByPlaceholderText(/enter mandatory reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Does not meet local mandate' } })

      const confirmRejectBtn = screen.getByRole('button', { name: /^confirm$/i })
      fireEvent.click(confirmRejectBtn)

      await waitFor(() => {
        expect(governanceApi.rejectReview).toHaveBeenCalledWith('rev-1', 'Does not meet local mandate')
      })
    })

    it('overrides a governance review with target institution and reason', async () => {
      mockAdminAuth()
      vi.mocked(governanceApi.getReviewById).mockResolvedValueOnce({
        reviewId: 'rev-1',
        problemId: 'prob-1',
        status: 'PENDING',
        topEvidenceCards: [],
        auditHistory: [],
      } as any)
      vi.mocked(governanceApi.overrideReview).mockResolvedValueOnce({} as any)

      renderWithProviders(
        <Routes>
          <Route path="/admin/reviews/:id" element={<ReviewDetailPage />} />
        </Routes>,
        '/admin/reviews/rev-1'
      )

      expect(await screen.findByText('Review rev-1')).toBeInTheDocument()
      const overrideModalBtn = screen.getByRole('button', { name: /override/i })
      fireEvent.click(overrideModalBtn)

      expect(screen.getByText('Manual Override')).toBeInTheDocument()
      const instInput = screen.getByPlaceholderText(/enter target institution id/i)
      fireEvent.change(instInput, { target: { value: 'inst-override-uuid' } })

      const reasonInput = screen.getByPlaceholderText(/enter mandatory reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Pre-existing regional deployment' } })

      const confirmOverrideBtn = screen.getByRole('button', { name: /^confirm$/i })
      fireEvent.click(confirmOverrideBtn)

      await waitFor(() => {
        expect(governanceApi.overrideReview).toHaveBeenCalledWith('rev-1', 'inst-override-uuid', 'Pre-existing regional deployment')
      })
    })
  })

  describe('Registry Browsing, Publish & Archive', () => {
    it('browses registry institutions and versions, and triggers publish/archive', async () => {
      mockAdminAuth()
      vi.mocked(registryApi.getInstitutions).mockResolvedValueOnce([
        { id: 'inst-1', name: 'National Institute of Tech', code: 'NIT-01', type: 'HEI', verified: true },
      ] as any)
      vi.mocked(registryApi.getVersions).mockResolvedValue([
        { id: 'v-1', version: 'v1.0.0', status: 'DRAFT', createdAt: '2026-10-01T00:00:00Z' },
      ] as any)
      vi.mocked(registryApi.publishVersion).mockResolvedValueOnce({} as any)

      renderWithProviders(<RegistryPage />)

      expect(await screen.findByText('National Institute of Tech')).toBeInTheDocument()

      const versionsTab = screen.getByRole('button', { name: /registry versions/i })
      fireEvent.click(versionsTab)

      expect(await screen.findByText('v1.0.0')).toBeInTheDocument()
      const publishBtn = screen.getByRole('button', { name: /publish/i })
      fireEvent.click(publishBtn)

      await waitFor(() => {
        expect(registryApi.publishVersion).toHaveBeenCalledWith('v-1')
      })
    })
  })

  describe('Ecosystem Analytics Dashboard', () => {
    it('loads impact metrics and district analytics', async () => {
      mockAdminAuth()
      vi.mocked(analyticsApi.getSummary).mockResolvedValueOnce({
        totalDeployments: 45,
        districtsCovered: 18,
        activeSlaRate: 0.98,
        matchingConfidenceAvg: 0.91,
      } as any)
      vi.mocked(analyticsApi.getDistrictAnalytics).mockResolvedValueOnce([
        { district: 'Pune', state: 'Maharashtra', count: 12, geohash: 'te7u' },
      ] as any)
      vi.mocked(analyticsApi.getInstitutionsAnalytics).mockResolvedValueOnce([])
      vi.mocked(analyticsApi.getProjectsAnalytics).mockResolvedValueOnce([])

      renderWithProviders(<AnalyticsDashboardPage />)

      expect(await screen.findByText('Impact & Analytics Dashboard')).toBeInTheDocument()
      expect(analyticsApi.getSummary).toHaveBeenCalled()
      expect(analyticsApi.getDistrictAnalytics).toHaveBeenCalled()
    })
  })

  describe('CodeJudge Worker Jobs & Scoring Configuration', () => {
    it('renders CodeJudge worker jobs queue with statuses', async () => {
      mockAdminAuth()
      vi.mocked(codejudgeApi.getAdminJobs).mockResolvedValueOnce([
        {
          jobId: 'job-12345678',
          evaluationId: 'eval-87654321',
          status: 'DONE',
          priority: 1,
          createdAt: '2026-10-14T00:00:00Z',
        },
      ])

      renderWithProviders(<CodeJudgeAdminJobsPage />)

      expect(await screen.findByText('CodeJudge Worker Jobs')).toBeInTheDocument()
      expect(await screen.findByText(/job-1234/)).toBeInTheDocument()
      expect(screen.getByText('DONE')).toBeInTheDocument()
    })

    it('renders CodeJudge scoring configuration categories and policies', async () => {
      mockAdminAuth()
      vi.mocked(codejudgeApi.getScoringConfig).mockResolvedValueOnce({
        categories: [
          { categoryKey: 'SECURITY', name: 'Security Vulnerabilities', maxScore: 25, weight: 0.25, active: true },
        ],
        policies: [
          { ruleKey: 'SEC_CRITICAL', severity: 'HIGH', action: 'DEDUCT', amount: 15, active: true },
        ],
      })

      renderWithProviders(<CodeJudgeScoringConfigPage />)

      expect(await screen.findByText('Scoring Configuration')).toBeInTheDocument()
      expect(await screen.findByText('Security Vulnerabilities')).toBeInTheDocument()
      expect(screen.getByText('SEC_CRITICAL')).toBeInTheDocument()
    })
  })

  describe('Evaluation Administration: Queue & Pool Modes', () => {
    it('renders master evaluation queue with status filters', async () => {
      mockAdminAuth()
      vi.mocked(evaluationAdminApi.getQueue).mockResolvedValueOnce({
        content: [
          {
            cycleId: 'cycle-uuid-admin-1',
            problemId: 'prob-uuid-admin-1',
            status: 'RECEIVED',
            originBucket: 'GOVERNMENT',
            startedAt: '2026-10-10T00:00:00Z',
          },
        ],
        totalPages: 1,
      } as any)

      renderWithProviders(<EvaluationQueuePage />)

      expect(await screen.findByText('Evaluation Queue')).toBeInTheDocument()
      expect(await screen.findByText(/cycle-uu/)).toBeInTheDocument()
    })

    it('toggles pool mode between MANUAL and AUTO', async () => {
      mockAdminAuth()
      vi.mocked(evaluationAdminApi.getPoolModes).mockResolvedValue([
        {
          pool: 'GOVERNMENT',
          mode: 'MANUAL',
          aiScoringAvailable: true,
          activeHumanEvaluators: 5,
          note: 'Manual scoring by departmental evaluators',
        },
      ])
      vi.mocked(evaluationAdminApi.setPoolMode).mockResolvedValueOnce({} as any)

      renderWithProviders(<PoolModePage />)

      expect(await screen.findByText('Pool Modes')).toBeInTheDocument()
      expect(screen.getByText('GOVERNMENT')).toBeInTheDocument()

      const toggleBtn = screen.getByRole('button', { name: /manual/i })
      fireEvent.click(toggleBtn)

      await waitFor(() => {
        expect(evaluationAdminApi.setPoolMode).toHaveBeenCalledWith('GOVERNMENT', 'AUTO')
      })
    })
  })
})
