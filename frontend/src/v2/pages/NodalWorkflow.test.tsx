// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleRoute, PrivateRoute } from '../components/AuthGuards'
import * as AuthContextModule from '../../auth/AuthContext'
import { BackendRole } from '../../auth/roles'

// Mock the AuthContext
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('Reviewer / Nodal Workflow Permissions & Guard Enforcement', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const staffRoles = [BackendRole.ADMIN, BackendRole.REVIEWER]

  const mockAuth = (
    isAuthenticated: boolean,
    role: BackendRole | null = null,
    isInitializing = false
  ) => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated,
      isInitializing,
      user: role ? { role, id: 'user-1', phone: '9876543210', email: 'test@gov.in', kycStatus: 'VERIFIED' } : null,
      login: vi.fn(),
      logout: vi.fn(),
      token: isAuthenticated ? 'jwt-test-token' : null,
    })
  }

  const renderAppRoutes = (initialEntry: string) => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          {/* Public & Error destinations */}
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/unauthorized" element={<div data-testid="unauthorized-page">Access Denied / Unauthorized</div>} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            {/* Nodal Officer Portal (REVIEWER & ADMIN) */}
            <Route path="/nodal" element={<RoleRoute allowedRoles={staffRoles} />}>
              <Route path="triage" element={<div data-testid="nodal-triage-page">Nodal Triage Console</div>} />
              <Route path="registrations" element={<div data-testid="nodal-registrations-page">Source Registration Queue</div>} />
            </Route>

            {/* Admin-only user role management */}
            <Route path="/admin" element={<RoleRoute allowedRoles={[BackendRole.ADMIN]} />}>
              <Route path="users" element={<div data-testid="admin-users-page">Admin User Role Management</div>} />
            </Route>

            {/* Submitter Portal */}
            <Route path="/portal" element={<RoleRoute allowedRoles={[BackendRole.SUBMITTER, BackendRole.ADMIN]} />}>
              <Route path="problems" element={<div data-testid="submitter-portal-page">Submitter Portal</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  describe('SUBMITTER role constraints', () => {
    it('SUBMITTER cannot access reviewer triage page and is redirected to /unauthorized', async () => {
      mockAuth(true, BackendRole.SUBMITTER)
      renderAppRoutes('/nodal/triage')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('nodal-triage-page')).not.toBeInTheDocument()
    })

    it('SUBMITTER cannot access reviewer registrations queue and is redirected to /unauthorized', async () => {
      mockAuth(true, BackendRole.SUBMITTER)
      renderAppRoutes('/nodal/registrations')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('nodal-registrations-page')).not.toBeInTheDocument()
    })
  })

  describe('REVIEWER role capabilities', () => {
    it('REVIEWER can access reviewer triage console', async () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderAppRoutes('/nodal/triage')

      await waitFor(() => {
        expect(screen.getByTestId('nodal-triage-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument()
    })

    it('REVIEWER can access reviewer registrations queue', async () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderAppRoutes('/nodal/registrations')

      await waitFor(() => {
        expect(screen.getByTestId('nodal-registrations-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('unauthorized-page')).not.toBeInTheDocument()
    })

    it('REVIEWER cannot access admin-only user-role management (/admin/users)', async () => {
      mockAuth(true, BackendRole.REVIEWER)
      renderAppRoutes('/admin/users')

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('admin-users-page')).not.toBeInTheDocument()
    })
  })

  describe('ADMIN role capabilities over reviewer workflows', () => {
    it('ADMIN can access reviewer triage console', async () => {
      mockAuth(true, BackendRole.ADMIN)
      renderAppRoutes('/nodal/triage')

      await waitFor(() => {
        expect(screen.getByTestId('nodal-triage-page')).toBeInTheDocument()
      })
    })

    it('ADMIN can access reviewer registrations queue', async () => {
      mockAuth(true, BackendRole.ADMIN)
      renderAppRoutes('/nodal/registrations')

      await waitFor(() => {
        expect(screen.getByTestId('nodal-registrations-page')).toBeInTheDocument()
      })
    })

    it('ADMIN can access user-role management', async () => {
      mockAuth(true, BackendRole.ADMIN)
      renderAppRoutes('/admin/users')

      await waitFor(() => {
        expect(screen.getByTestId('admin-users-page')).toBeInTheDocument()
      })
    })
  })

  describe('Unauthorized / unauthenticated redirects', () => {
    it('unauthenticated users trying to access reviewer pages are redirected to /login', async () => {
      mockAuth(false, null)
      renderAppRoutes('/nodal/triage')

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('nodal-triage-page')).not.toBeInTheDocument()
    })

    it('unauthenticated users trying to access reviewer registrations are redirected to /login', async () => {
      mockAuth(false, null)
      renderAppRoutes('/nodal/registrations')

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('nodal-registrations-page')).not.toBeInTheDocument()
    })
  })
})
