import { httpClient } from './httpClient'

// ── CANONICAL TEAM DATA SOURCE ────────────────────────────────────────────────
// There is no /projects/{id}/team endpoint. Team data lives inside SubmissionView:
//   GET /portal/submissions  → SubmissionView[]  (each has .team: TeamView | null)
//   GET /portal/submissions/{id} → SubmissionView (has .team)
//
// TeamView shape: { teamId, name, members: ParticipantBrief[] }
// ParticipantBrief: { participantId, fullName, participantType }
//
// Team CREATION is done via POST /portal/submissions with { teamName, memberUserIds }.
// There are NO post-creation team mutation endpoints (add/remove member, role change)
// in the portal-service. Registry admin has team endpoints at /capability/admin/registry/teams
// but those are for capability registry teams, NOT submission project teams.
// ─────────────────────────────────────────────────────────────────────────────

export interface PortalTeamMember {
  participantId: string
  fullName: string
  participantType: string   // STUDENT, UNIVERSITY, INDUSTRY
}

export interface PortalTeam {
  teamId: string
  name: string
  members: PortalTeamMember[]
}

export const teamApi = {
  /**
   * Reads team data by finding the submission for this project (by problemId)
   * and returning its embedded TeamView.
   * Since there is no /projects/{id}/team endpoint, we scan /portal/submissions.
   */
  getTeamForSubmission: async (submissionId: string): Promise<PortalTeam | null> => {
    const response = await httpClient.get(`/portal/submissions/${submissionId}`)
    return response.data.team ?? null
  },

  getMySubmissions: async (): Promise<any[]> => {
    const response = await httpClient.get('/portal/submissions')
    return response.data || []
  },

  getSubmission: async (submissionId: string): Promise<any> => {
    const response = await httpClient.get(`/portal/submissions/${submissionId}`)
    return response.data
  },

  /**
   * Creates a team submission (the only way to create a portal team).
   * Body: { problemId, teamName, memberUserIds, title?, summary?, githubUrl?, commitSha? }
   */
  createTeamSubmission: async (data: {
    problemId: string
    teamName: string
    memberUserIds: string[]
    title?: string
    summary?: string
    githubUrl?: string
    commitSha?: string
  }): Promise<any> => {
    const response = await httpClient.post('/portal/submissions', data)
    return response.data
  },

  /**
   * Registry admin team endpoints — for CAPABILITY REGISTRY teams only, not portal submission teams.
   * Only callable by ADMIN role. Separated here to prevent misuse.
   */
  adminRegistry: {
    createTeam: async (data: { institutionId: string; name: string; description?: string }) => {
      const response = await httpClient.post('/capability/admin/registry/teams', data)
      return response.data
    },
    addMember: async (teamId: string, data: { facultyId?: string; studentId?: string; role: string }) => {
      const response = await httpClient.post(`/capability/admin/registry/teams/${teamId}/members`, data)
      return response.data
    },
  }
}
