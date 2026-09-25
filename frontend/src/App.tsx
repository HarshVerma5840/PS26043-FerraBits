import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import PortalLayout from './layouts/PortalLayout'
import ProjectLayout from './layouts/ProjectLayout'

import LoginPage from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'

import ReviewDeskPage from './pages/ReviewDeskPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import RegistryPage from './pages/RegistryPage'
import InstitutionDetailsPage from './pages/InstitutionDetailsPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'

import ProblemListPage from './pages/ProblemListPage'
import ProblemDetailsPage from './pages/ProblemDetailsPage'
import ProblemTimelinePage from './pages/ProblemTimelinePage'
import ParticipantProfilePage from './pages/ParticipantProfilePage'
import SubmissionListPage from './pages/SubmissionListPage'
import SubmissionDetailsPage from './pages/SubmissionDetailsPage'

import ProjectListPage from './pages/ProjectListPage'
import ProjectOverviewPage from './pages/ProjectOverviewPage'
import TeamBuilder from './pages/TeamBuilder'
import KanbanBoard from './pages/KanbanBoard'
import IndustryPage from './pages/IndustryPage'
import MessagingPage from './pages/MessagingPage'
import FeedbackPage from './pages/FeedbackPage'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const { isAuthenticated, user, isInitializing } = useAuth()

  if (isInitializing) {
    return <LoadingScreen message="Restoring session..." />
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="reviews" element={<ReviewDeskPage />} />
        <Route path="reviews/:id" element={<ReviewDetailPage />} />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="registry/:id" element={<InstitutionDetailsPage />} />
      </Route>

      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="problems" replace />} />
        <Route path="problems" element={<ProblemListPage />} />
        <Route path="problems/:problemId" element={<ProblemDetailsPage />} />
        <Route path="problems/:problemId/timeline" element={<ProblemTimelinePage />} />
        <Route path="profile" element={<ParticipantProfilePage />} />
        <Route path="submissions" element={<SubmissionListPage />} />
        <Route path="submissions/:submissionId" element={<SubmissionDetailsPage />} />
      </Route>

      <Route path="/projects">
        <Route index element={
          <PortalLayout>
            <ProjectListPage />
          </PortalLayout>
        } />
      </Route>

      <Route path="/projects/:projectId" element={<ProjectLayout />}>
        <Route index element={<ProjectOverviewPage />} />
        <Route path="team" element={<TeamBuilder />} />
        <Route path="kanban" element={<KanbanBoard />} />
        <Route path="industry" element={<IndustryPage />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>

      {/* Redirect root to a default page based on simple logic or login */}
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={user?.roles?.includes('ADMIN') ? '/admin/analytics' : '/portal/problems'} replace /> 
          : <Navigate to="/login" replace />
      } />
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
