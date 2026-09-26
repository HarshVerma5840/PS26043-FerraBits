import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { NodalOfficerLayout, EvaluatorDemoLayout, AdminDemoLayout, CommonLayout, FacultyDemoLayout } from './v2/layouts/Layouts'
import { DemoRoleSwitcher } from './v2/components/DemoRoleSwitcher'
import { PrivateRoute, RoleRoute, RoleLandingRedirect, FacultyRoute } from './v2/components/AuthGuards'
import { useAuth } from './auth/AuthContext'
import { BackendRole } from './auth/roles'

import { GlobalFeedbackHandler } from './components/GlobalFeedbackHandler'

// Lazy loaded pages for code splitting
const NodalDashboard = React.lazy(() => import('./v2/pages/NodalDashboard'))
const EvaluatorDashboardPage = React.lazy(() => import('./v2/pages/EvaluatorDashboardPage'))
const AdminGovernancePage = React.lazy(() => import('./v2/pages/AdminGovernancePage'))
const AdminAnalyticsPage = React.lazy(() => import('./v2/pages/AdminAnalyticsPage'))
const FacultyWorkspace = React.lazy(() => import('./v2/pages/Pages').then(module => ({ default: module.FacultyWorkspace })))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage'))
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'))
const NotificationPage = React.lazy(() => import('./pages/NotificationPage'))
const IndustryPage = React.lazy(() => import('./pages/IndustryPage'))
const FeedbackPage = React.lazy(() => import('./pages/FeedbackPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center font-label-lg text-on-surface">
    Loading...
  </div>
)

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Toaster position="top-right" />
      <GlobalFeedbackHandler />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route element={<PrivateRoute />}>          <Route path="/nodal" element={<RoleRoute allowedRoles={[BackendRole.REVIEWER, BackendRole.ADMIN]} />}>
            <Route element={<NodalOfficerLayout />}>
              <Route index element={<Navigate to="triage" replace />} />
              <Route path="triage" element={<NodalDashboard />} />
            </Route>
          </Route>

          <Route path="/evaluator" element={<RoleRoute allowedRoles={[BackendRole.EVALUATOR, BackendRole.ADMIN]} />}>
            <Route element={<EvaluatorDemoLayout />}>
              <Route index element={<Navigate to="dossier" replace />} />
              <Route path="dossier" element={<EvaluatorDashboardPage />} />
            </Route>
          </Route>

          <Route path="/admin" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
            <Route element={<AdminDemoLayout />}>
              <Route index element={<Navigate to="governance" replace />} />
              <Route path="governance" element={<AdminGovernancePage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>

          {/* Faculty workspace - strictly protected since backend lacks role support */}
          <Route path="/faculty" element={<FacultyRoute />}>
            <Route element={<FacultyDemoLayout />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<FacultyWorkspace />} />
              <Route path="projects/:projectId" element={<FacultyWorkspace />} />
            </Route>
          </Route>

          {/* Secondary Features */}
          <Route element={<CommonLayout />}>
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/projects/:projectId/industry" element={<IndustryPage />} />
            <Route path="/projects/:projectId/feedback" element={<FeedbackPage />} />
          </Route>
          
          {/* Landing redirect based on authenticated user's role */}
          <Route path="/" element={<RoleLandingRedirect />} />
        </Route>
        
        {/* Legacy demo routes for development - redirect to real routes */}
        <Route path="/demo/*" element={<Navigate to="/" replace />} />
      </Routes>
      </React.Suspense>
      {!isAuthenticated && import.meta.env.DEV && <DemoRoleSwitcher />}
    </>
  )
}

export default App
