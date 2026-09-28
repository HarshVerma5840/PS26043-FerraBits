import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { roleDefaultRoute } from '../../auth/roles'

export function PrivateRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center font-label-lg text-on-surface">Loading Session...</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center font-label-lg text-on-surface">Loading Session...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasRole = allowedRoles.includes(user.role)

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

/**
 * Redirects the user to their canonical home page based on their role.
 * Useful for the root ('/') route.
 */
export function RoleLandingRedirect() {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center font-label-lg text-on-surface">Loading Session...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // The roleDefaultRoute function handles ADMIN, REVIEWER, EVALUATOR, and SUBMITTER correctly,
  // mapping them to their respective web portals.
  const target = roleDefaultRoute(user.role)
  return <Navigate to={target} replace />
}

export function FacultyRoute() {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center font-label-lg text-on-surface">Loading Session...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Currently, the backend does not issue a specific FACULTY role.
  // We allow ADMIN to preview the workspace. Everyone else sees an unsupported state.
  if (user.role === 'ADMIN') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined text-[64px] text-error mb-4">gpp_bad</span>
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">Access Denied</h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
        Faculty access is not provisioned for this account. If you believe this is an error, please contact your Nodal Officer or the support team.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary-hover transition-colors"
      >
        Go Back
      </button>
    </div>
  )
}

