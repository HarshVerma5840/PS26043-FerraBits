import React from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminLayout from './layouts/AdminLayout'
import EvaluatorLayout from './layouts/EvaluatorLayout'
import PortalLayout from './layouts/PortalLayout'
import { NodalOfficerLayout, FacultyDemoLayout, CommonLayout } from './v2/layouts/Layouts'
import { PrivateRoute, RoleLandingRedirect, RoleRoute, FacultyRoute } from './v2/components/AuthGuards'
import { BackendRole } from './auth/roles'
import { GlobalFeedbackHandler } from './components/GlobalFeedbackHandler'

const lazy = (path: string) => React.lazy(() => import(path))
const LoginPage = lazy('./pages/LoginPage')
const UnauthorizedPage = lazy('./pages/UnauthorizedPage')
const NotFoundPage = lazy('./pages/NotFoundPage')
const NodalDashboard = lazy('./v2/pages/NodalDashboard')
const AdminGovernancePage = lazy('./v2/pages/AdminGovernancePage')
const EvaluatorDossierPage = lazy('./v2/pages/EvaluatorDashboardPage')
const CitizenDashboardPage = lazy('./v2/pages/CitizenDashboardPage')
const StudentDashboardPage = lazy('./v2/pages/StudentDashboardPage')
const FacultyWorkspace = React.lazy(() => import('./v2/pages/Pages').then(m => ({ default: m.FacultyWorkspace })))
const MessagingPage = lazy('./pages/MessagingPage')
const NotificationPage = lazy('./pages/NotificationPage')
const ProblemListPage = lazy('./pages/ProblemListPage')
const ProblemDetailsPage = lazy('./pages/ProblemDetailsPage')
const ProblemTimelinePage = lazy('./pages/ProblemTimelinePage')
const SubmissionListPage = lazy('./pages/SubmissionListPage')
const SubmissionDetailsPage = lazy('./pages/SubmissionDetailsPage')
const ParticipantProfilePage = lazy('./pages/ParticipantProfilePage')
const RegistrationWizardPage = lazy('./pages/RegistrationWizardPage')
const RegistrationStatusPage = lazy('./pages/RegistrationStatusPage')
const RegistrationHistoryPage = lazy('./pages/RegistrationHistoryPage')
const ReviewerRegistrationQueuePage = lazy('./pages/ReviewerRegistrationQueuePage')
const RegistrationReviewPage = lazy('./pages/RegistrationReviewPage')
const SourceAccountPage = lazy('./pages/SourceAccountPage')
const UserRoleManagementPage = lazy('./pages/UserRoleManagementPage')
const ReviewDeskPage = lazy('./pages/ReviewDeskPage')
const ReviewDetailPage = lazy('./pages/ReviewDetailPage')
const AnalyticsDashboardPage = lazy('./pages/AnalyticsDashboardPage')
const RegistryPage = lazy('./pages/RegistryPage')
const RegistryVersionDetailsPage = lazy('./pages/RegistryVersionDetailsPage')
const RegistryAdminWorkspace = lazy('./pages/RegistryAdminWorkspace')
const EvaluationAdminDashboard = lazy('./pages/EvaluationAdminDashboard')
const EvaluationQueuePage = lazy('./pages/EvaluationQueuePage')
const EvaluationCyclePage = lazy('./pages/EvaluationCyclePage')
const EvaluationCycleOverview = lazy('./pages/EvaluationCycleOverview')
const AggregationPage = lazy('./pages/AggregationPage')
const PrioritizationPage = lazy('./pages/PrioritizationPage')
const PoolRoutingPage = lazy('./pages/PoolRoutingPage')
const PoolModePage = lazy('./pages/PoolModePage')
const PublicationPage = lazy('./pages/PublicationPage')
const EvaluatorDashboardPage = lazy('./pages/EvaluatorDashboardPage')
const EvaluatorProfilePage = lazy('./pages/EvaluatorProfilePage')
const EvaluationCriteriaPage = lazy('./pages/EvaluationCriteriaPage')
const AssignmentQueuePage = lazy('./pages/AssignmentQueuePage')
const AssignmentDetailsPage = lazy('./pages/AssignmentDetailsPage')
const EvaluationSubmissionPage = lazy('./pages/EvaluationSubmissionPage')
const EvaluationHistoryPage = lazy('./pages/EvaluationHistoryPage')
const CodeJudgeEvaluationListPage = lazy('./pages/CodeJudgeEvaluationListPage')
const CodeJudgeEvaluationDetailsPage = lazy('./pages/CodeJudgeEvaluationDetailsPage')
const CodeJudgeEvaluationOverview = lazy('./pages/CodeJudgeEvaluationOverview')
const CodeJudgeScorePage = lazy('./pages/CodeJudgeScorePage')
const CodeJudgeFindingsPage = lazy('./pages/CodeJudgeFindingsPage')
const CodeJudgeReportPage = lazy('./pages/CodeJudgeReportPage')
const CodeJudgeAdminJobsPage = lazy('./pages/CodeJudgeAdminJobsPage')
const CodeJudgeScoringConfigPage = lazy('./pages/CodeJudgeScoringConfigPage')
const InstitutionDetailsPage = lazy('./pages/InstitutionDetailsPage')
const ProjectListPage = lazy('./pages/ProjectListPage')
const ProjectOverviewPage = lazy('./pages/ProjectOverviewPage')
const CreateProjectPage = lazy('./pages/CreateProjectPage')
const KanbanBoard = lazy('./pages/KanbanBoard')
const TeamBuilder = lazy('./pages/TeamBuilder')
const ProjectReviewPage = lazy('./pages/ProjectReviewPage')
const IndustryPage = lazy('./pages/IndustryPage')
const FeedbackPage = lazy('./pages/FeedbackPage')
const SkillGapDetailsPage = lazy('./pages/SkillGapDetailsPage')

const PageLoader = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
const staffRoles = [BackendRole.ADMIN, BackendRole.REVIEWER]

function RegisterStatusRedirect() {
  const { id } = useParams()
  return <Navigate to={`/registration/${id}/status`} replace />
}

function PortalRegRedirect() {
  const { id } = useParams()
  return <Navigate to={`/portal/registrations/${id}`} replace />
}

function PortalRegStatusRedirect() {
  const { id } = useParams()
  return <Navigate to={`/portal/registrations/${id}/status`} replace />
}

function ProjectRedirect() {
  const { id } = useParams()
  return <Navigate to={`/portal/projects/${id}`} replace />
}

function App() {
  return <>
    <Toaster position="top-right" />
    <GlobalFeedbackHandler />
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public & Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Registration Flow */}
        <Route path="/registration/new" element={<RegistrationWizardPage />} />
        <Route path="/registration/:id/status" element={<RegistrationStatusPage />} />
        <Route path="/register" element={<Navigate to="/registration/new" replace />} />
        <Route path="/register/status/:id" element={<RegisterStatusRedirect />} />

        {/* Protected Portals */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<RoleLandingRedirect />} />
          <Route path="/projects/:id" element={<ProjectRedirect />} />

          {/* Submitter Portal */}
          <Route path="/portal" element={<RoleRoute allowedRoles={[BackendRole.SUBMITTER, BackendRole.ADMIN]} />}>
            <Route element={<PortalLayout />}>
              <Route index element={<Navigate to="problems" replace />} />
              <Route path="problems" element={<ProblemListPage />} />
              <Route path="problems/:problemId" element={<ProblemDetailsPage />} />
              <Route path="problems/:problemId/timeline" element={<ProblemTimelinePage />} />
              <Route path="submissions" element={<SubmissionListPage />} />
              <Route path="submissions/:submissionId" element={<SubmissionDetailsPage />} />
              <Route path="profile" element={<ParticipantProfilePage />} />
              <Route path="registrations" element={<RegistrationHistoryPage />} />
              <Route path="registrations/new" element={<RegistrationWizardPage />} />
              <Route path="registrations/:id" element={<RegistrationWizardPage />} />
              <Route path="registrations/:id/status" element={<RegistrationStatusPage />} />
              <Route path="registration/:id" element={<PortalRegRedirect />} />
              <Route path="registration/:id/status" element={<PortalRegStatusRedirect />} />
              <Route path="projects" element={<ProjectListPage />} />
              <Route path="projects/:id" element={<ProjectOverviewPage />} />
              <Route path="projects/:id/team" element={<TeamBuilder />} />
              <Route path="projects/:id/kanban" element={<KanbanBoard />} />
              <Route path="projects/:id/review" element={<ProjectReviewPage />} />
              <Route path="projects/:id/industry" element={<IndustryPage />} />
              <Route path="projects/:id/feedback" element={<FeedbackPage />} />
              <Route path="projects/:id/skill-gaps" element={<SkillGapDetailsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="codejudge" element={<CodeJudgeEvaluationListPage />} />
              <Route path="codejudge/:id" element={<CodeJudgeEvaluationDetailsPage />}>
                <Route index element={<CodeJudgeEvaluationOverview />} />
                <Route path="score" element={<CodeJudgeScorePage />} />
                <Route path="findings" element={<CodeJudgeFindingsPage />} />
                <Route path="report" element={<CodeJudgeReportPage />} />
              </Route>
              <Route path="notifications" element={<Navigate to="/notifications" replace />} />
              <Route path="messages" element={<Navigate to="/messages" replace />} />
            </Route>
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="analytics" replace />} />
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
              <Route path="governance" element={<AdminGovernancePage />} />
              <Route path="governance/:id" element={<ReviewDetailPage />} />
              <Route path="reviews" element={<ReviewDeskPage />} />
              <Route path="reviews/:id" element={<ReviewDetailPage />} />
              <Route path="projects" element={<ProjectListPage />} />
              <Route path="projects/create" element={<CreateProjectPage />} />
              <Route path="projects/:id" element={<ProjectOverviewPage />} />
              <Route path="projects/:id/team" element={<TeamBuilder />} />
              <Route path="projects/:id/kanban" element={<KanbanBoard />} />
              <Route path="projects/:id/review" element={<ProjectReviewPage />} />
              <Route path="projects/:id/industry" element={<IndustryPage />} />
              <Route path="projects/:id/feedback" element={<FeedbackPage />} />
              <Route path="projects/:id/skill-gaps" element={<SkillGapDetailsPage />} />
              <Route path="industry" element={<IndustryPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="skill-gap/:id" element={<SkillGapDetailsPage />} />
              <Route path="evaluation" element={<EvaluationAdminDashboard />} />
              <Route path="evaluation/queue" element={<EvaluationQueuePage />} />
              <Route path="evaluation/cycles/:id" element={<EvaluationCyclePage />}>
                <Route index element={<EvaluationCycleOverview />} />
                <Route path="routing" element={<PoolRoutingPage />} />
                <Route path="pool-routing" element={<PoolRoutingPage />} />
                <Route path="aggregation" element={<AggregationPage />} />
                <Route path="prioritization" element={<PrioritizationPage />} />
                <Route path="publication" element={<PublicationPage />} />
              </Route>
              <Route path="evaluation/pool-modes" element={<PoolModePage />} />
              <Route path="registry" element={<RegistryPage />} />
              <Route path="registry/:id" element={<InstitutionDetailsPage />} />
              <Route path="registry/versions/:id" element={<RegistryVersionDetailsPage />} />
              <Route path="registry/workspace" element={<RegistryAdminWorkspace />} />
              <Route path="sources" element={<SourceAccountPage />} />
              <Route path="users" element={<UserRoleManagementPage />} />
              <Route path="codejudge/jobs" element={<CodeJudgeAdminJobsPage />} />
              <Route path="codejudge/config" element={<CodeJudgeScoringConfigPage />} />
            </Route>
          </Route>

          {/* Reviewer / Nodal Officer Registration Queue */}
          <Route path="/admin/reviewer-queue" element={<RoleRoute allowedRoles={staffRoles} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<ReviewerRegistrationQueuePage />} />
              <Route path=":id" element={<RegistrationReviewPage />} />
            </Route>
          </Route>

          {/* Evaluator Portal */}
          <Route path="/evaluator" element={<RoleRoute allowedRoles={[BackendRole.EVALUATOR, BackendRole.ADMIN]} />}>
            <Route element={<EvaluatorLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EvaluatorDashboardPage />} />
              <Route path="dossier" element={<EvaluatorDossierPage />} />
              <Route path="profile" element={<EvaluatorProfilePage />} />
              <Route path="criteria" element={<EvaluationCriteriaPage />} />
              <Route path="assignments" element={<AssignmentQueuePage />} />
              <Route path="assignments/:id" element={<AssignmentDetailsPage />} />
              <Route path="assignments/:id/score" element={<EvaluationSubmissionPage />} />
              <Route path="project-reviews" element={<ProjectReviewPage />} />
              <Route path="history" element={<EvaluationHistoryPage />} />
            </Route>
          </Route>

          {/* Nodal Officer Portal */}
          <Route path="/nodal" element={<RoleRoute allowedRoles={staffRoles} />}>
            <Route element={<NodalOfficerLayout />}>
              <Route index element={<Navigate to="triage" replace />} />
              <Route path="triage" element={<NodalDashboard />} />
              <Route path="registrations" element={<ReviewerRegistrationQueuePage />} />
              <Route path="registrations/:id" element={<RegistrationReviewPage />} />
              <Route path="sources" element={<SourceAccountPage />} />
            </Route>
          </Route>


          {/* Faculty Demo - Accessible only to ADMIN preview */}
          <Route path="/faculty" element={<FacultyRoute />}>
            <Route element={<FacultyDemoLayout />}><Route path="projects" element={<FacultyWorkspace />} /></Route>
          </Route>

          {/* Preview-only Route Group for unissued roles - Accessible only to ADMIN */}
          <Route path="/preview" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
            <Route element={<CommonLayout />}>
              <Route path="citizen" element={<CitizenDashboardPage />} />
              <Route path="student" element={<StudentDashboardPage />} />
            </Route>
          </Route>

          {/* General Authenticated Features */}
          <Route element={<CommonLayout />}>
            <Route path="messages" element={<MessagingPage />} />
            <Route path="notifications" element={<NotificationPage />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  </>
}

export default App
