/**
 * roles.ts — Single source of truth for backend-supported JWT roles.
 *
 * The backend (source-service) defines UserRole enum as:
 *   SUBMITTER  — citizen / student / organisation submitting a problem.
 *                Authenticates via Android app; has NO web portal.
 *   REVIEWER   — Nodal Officer. Reviews source registrations.
 *                Web portal: /nodal/triage
 *   EVALUATOR  — Domain expert. Scores problems in evaluation pipeline.
 *                Web portal: /evaluator/dossier
 *   ADMIN      — Super-user. Full access to all portals.
 *                Web portal: /admin/governance
 *
 * FACULTY / PROJECT_MANAGER do NOT exist as JWT roles in the backend.
 * The /faculty route is protected by ADMIN only until a backend faculty
 * identity mechanism is implemented.
 *
 * JWT payload claim: ole (string, one of the values above).
 */

export const BackendRole = {
  SUBMITTER: 'SUBMITTER',
  REVIEWER: 'REVIEWER',
  EVALUATOR: 'EVALUATOR',
  ADMIN: 'ADMIN',
} as const

export type BackendRole = (typeof BackendRole)[keyof typeof BackendRole]

/** Returns the canonical home route for a given role. */
export function roleDefaultRoute(role: string | null | undefined): string {
  switch (role) {
    case BackendRole.ADMIN:
      return '/admin/governance'
    case BackendRole.REVIEWER:
      return '/nodal/triage'
    case BackendRole.EVALUATOR:
      return '/evaluator/dossier'
    case BackendRole.SUBMITTER:
      return '/citizen/dashboard'
    default:
      return '/unauthorized'
  }
}

/** Returns true if the role has any valid web portal. */
export function hasWebPortal(role: string | null | undefined): boolean {
  return (
    role === BackendRole.ADMIN ||
    role === BackendRole.REVIEWER ||
    role === BackendRole.EVALUATOR ||
    role === BackendRole.SUBMITTER
  )
}
