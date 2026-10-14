import { describe, it, expect } from 'vitest'
import { BackendRole, roleDefaultRoute, hasWebPortal } from './roles'

describe('Role and Routing Logic', () => {
  const unsupportedRoles = [
    'FACULTY',
    'PROJECT_MANAGER',
    'INDUSTRY_USER',
    'STUDENT',
    'REGISTRY_MANAGER',
    'INTERNAL',
    'CITIZEN',
    'SOURCE_ADMIN',
    'NODAL_OFFICER',
  ]

  describe('BackendRole constants', () => {
    it('defines strictly the four canonical JWT roles', () => {
      expect(Object.values(BackendRole)).toEqual(['SUBMITTER', 'REVIEWER', 'EVALUATOR', 'ADMIN'])
    })
  })

  describe('roleDefaultRoute', () => {
    it('routes ADMIN to governance', () => {
      expect(roleDefaultRoute(BackendRole.ADMIN)).toBe('/admin/governance')
    })

    it('routes REVIEWER to triage', () => {
      expect(roleDefaultRoute(BackendRole.REVIEWER)).toBe('/nodal/triage')
    })

    it('routes EVALUATOR to evaluator dashboard', () => {
      expect(roleDefaultRoute(BackendRole.EVALUATOR)).toBe('/evaluator/dashboard')
    })

    it('routes SUBMITTER to the authenticated portal problems', () => {
      expect(roleDefaultRoute(BackendRole.SUBMITTER)).toBe('/portal/problems')
    })

    it('routes all unsupported roles to /unauthorized', () => {
      unsupportedRoles.forEach((role) => {
        expect(roleDefaultRoute(role)).toBe('/unauthorized')
      })
      expect(roleDefaultRoute(null)).toBe('/unauthorized')
      expect(roleDefaultRoute(undefined)).toBe('/unauthorized')
      expect(roleDefaultRoute('')).toBe('/unauthorized')
    })
  })

  describe('hasWebPortal', () => {
    it('returns true for the four canonical backend roles', () => {
      expect(hasWebPortal(BackendRole.ADMIN)).toBe(true)
      expect(hasWebPortal(BackendRole.REVIEWER)).toBe(true)
      expect(hasWebPortal(BackendRole.EVALUATOR)).toBe(true)
      expect(hasWebPortal(BackendRole.SUBMITTER)).toBe(true)
    })

    it('returns false for all unsupported non-JWT roles', () => {
      unsupportedRoles.forEach((role) => {
        expect(hasWebPortal(role)).toBe(false)
      })
      expect(hasWebPortal(null)).toBe(false)
      expect(hasWebPortal(undefined)).toBe(false)
    })
  })
})
