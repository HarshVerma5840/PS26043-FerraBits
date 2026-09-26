// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { FacultyRoute, PrivateRoute, RoleRoute, RoleLandingRedirect } from './AuthGuards'
import * as AuthContextModule from '../../auth/AuthContext'
import { BackendRole } from '../../auth/roles'

// Mock the AuthContext
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('AuthGuards and Redirects', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const mockAuth = (isAuthenticated: boolean, role: BackendRole | null = null, isInitializing = false) => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated,
      isInitializing,
      user: role ? { role, id: '1', phone: '123', email: '', kycStatus: '' } : null,
      login: vi.fn(),
      logout: vi.fn(),
      token: isAuthenticated ? 'fake-token' : null,
    })
  }

  describe('FacultyRoute', () => {
    const renderFacultyRoute = () => render(
      <MemoryRouter initialEntries={['/faculty']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/faculty" element={<FacultyRoute />}>
            <Route index element={<div>Faculty Workspace</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    it('allows ADMIN to preview the workspace', () => {
      mockAuth(true, BackendRole.ADMIN)
      renderFacultyRoute()
      expect(screen.getByText('Faculty Workspace')).toBeInTheDocument()
    })

    it('denies access to SUBMITTER', () => {
      mockAuth(true, BackendRole.SUBMITTER)
      renderFacultyRoute()
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
  })

  describe('PrivateRoute', () => {
    const renderPrivateRoute = () => render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/private" element={<PrivateRoute />}>
            <Route index element={<div>Private Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    it('redirects to login if not authenticated', () => {
      mockAuth(false)
      renderPrivateRoute()
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('renders children if authenticated', () => {
      mockAuth(true, BackendRole.ADMIN)
      renderPrivateRoute()
      expect(screen.getByText('Private Content')).toBeInTheDocument()
    })
  })

  describe('RoleRoute', () => {
    const renderRoleRoute = () => render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route path="/admin-only" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    it('redirects to unauthorized if role does not match', () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderRoleRoute()
      expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
    })

    it('renders children if role matches', () => {
      mockAuth(true, BackendRole.ADMIN)
      renderRoleRoute()
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
  })

  describe('RoleLandingRedirect', () => {
    const renderRedirect = () => render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RoleLandingRedirect />} />
          <Route path="/admin/governance" element={<div>Admin Dashboard</div>} />
          <Route path="/nodal/triage" element={<div>Nodal Dashboard</div>} />
          <Route path="/evaluator/dossier" element={<div>Evaluator Dashboard</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    )

    it('redirects ADMIN to /admin/governance', () => {
      mockAuth(true, BackendRole.ADMIN)
      renderRedirect()
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })

    it('redirects REVIEWER to /nodal/triage', () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderRedirect()
      expect(screen.getByText('Nodal Dashboard')).toBeInTheDocument()
    })

    it('redirects EVALUATOR to /evaluator/dossier', () => {
      mockAuth(true, BackendRole.EVALUATOR)
      renderRedirect()
      expect(screen.getByText('Evaluator Dashboard')).toBeInTheDocument()
    })

    it('redirects unknown roles to /unauthorized', () => {
      mockAuth(true, 'UNKNOWN_ROLE' as BackendRole)
      renderRedirect()
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    })
  })
})
