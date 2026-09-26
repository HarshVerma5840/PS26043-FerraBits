import { describe, it, expect } from 'vitest'
import { BackendRole, roleDefaultRoute, hasWebPortal } from './roles'

describe('Role and Routing Logic', () => {
  describe('roleDefaultRoute', () => {
    it('routes ADMIN to governance', () => {
      expect(roleDefaultRoute(BackendRole.ADMIN)).toBe('/admin/governance')
    })

    it('routes REVIEWER to triage', () => {
      expect(roleDefaultRoute(BackendRole.REVIEWER)).toBe('/nodal/triage')
    })

    it('routes EVALUATOR to dossier', () => {
      expect(roleDefaultRoute(BackendRole.EVALUATOR)).toBe('/evaluator/dossier')
    })

    it('routes SUBMITTER to unauthorized (no web portal)', () => {
      expect(roleDefaultRoute(BackendRole.SUBMITTER)).toBe('/unauthorized')
    })

    it('routes unknown/null/undefined roles to unauthorized', () => {
      expect(roleDefaultRoute('PROJECT_MANAGER')).toBe('/unauthorized')
      expect(roleDefaultRoute('FACULTY')).toBe('/unauthorized')
      expect(roleDefaultRoute(null)).toBe('/unauthorized')
      expect(roleDefaultRoute(undefined)).toBe('/unauthorized')
    })
  })

  describe('hasWebPortal', () => {
    it('returns true for roles with web portals', () => {
      expect(hasWebPortal(BackendRole.ADMIN)).toBe(true)
      expect(hasWebPortal(BackendRole.REVIEWER)).toBe(true)
      expect(hasWebPortal(BackendRole.EVALUATOR)).toBe(true)
    })

    it('returns false for roles without web portals', () => {
      expect(hasWebPortal(BackendRole.SUBMITTER)).toBe(false)
      expect(hasWebPortal('PROJECT_MANAGER')).toBe(false)
      expect(hasWebPortal(null)).toBe(false)
    })
  })
})
