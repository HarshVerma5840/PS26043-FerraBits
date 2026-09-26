import { httpClient } from './httpClient'
import { IndustryOrganization, Funding, Mentorship, MentorshipSession, IndustryParticipant } from '../types'

// Helpers for normalized IDs
function normalizeOrg(org: any): IndustryOrganization {
  return { 
    ...org, 
    id: org.orgId || org.id,
    organizationId: org.orgId || org.organizationId
  }
}
function normalizeFunding(f: any): Funding {
  return { 
    ...f, 
    id: f.fundingId || f.id,
    organizationId: f.orgId || f.organizationId,
    status: f.approvalState || f.status 
  }
}
function normalizeMentorship(m: any): Mentorship {
  return { 
    ...m, 
    id: m.mentorshipId || m.id, 
    mentorId: m.mentorUserId || m.mentorId,
    organizationId: m.orgId || m.organizationId
  }
}
function normalizeParticipant(p: any): IndustryParticipant {
  return {
    ...p,
    id: p.participantId || p.id,
    organizationId: p.orgId || p.organizationId,
    participationType: p.contributionType || p.participationType
  }
}

export const industryApi = {
  // ── Organizations ──────────────────────────────────────────────────────────
  getOrganizations: async (): Promise<IndustryOrganization[]> => {
    const response = await httpClient.get('/capability/api/v1/industry/organizations')
    return response.data.map(normalizeOrg)
  },
  getOrganizationById: async (id: string): Promise<IndustryOrganization> => {
    const response = await httpClient.get(`/capability/api/v1/industry/organizations/${id}`)
    return normalizeOrg(response.data)
  },
  createOrganization: async (data: Partial<IndustryOrganization>): Promise<IndustryOrganization> => {
    const response = await httpClient.post('/capability/api/v1/industry/organizations', data)
    return normalizeOrg(response.data)
  },
  updateOrganization: async (id: string, data: Partial<IndustryOrganization>): Promise<IndustryOrganization> => {
    const response = await httpClient.patch(`/capability/api/v1/industry/organizations/${id}`, data)
    return normalizeOrg(response.data)
  },

  // ── Project Participants ───────────────────────────────────────────────────
  getProjectParticipants: async (projectId: string): Promise<IndustryParticipant[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/industry-participants`)
    return response.data.map(normalizeParticipant)
  },
  addProjectParticipant: async (projectId: string, data: { organizationId: string; participationType: string }): Promise<IndustryParticipant> => {
    const payload = {
      orgId: data.organizationId,
      contributionType: data.participationType
    }
    const response = await httpClient.post(`/capability/api/v1/projects/${projectId}/industry-participants`, payload)
    return normalizeParticipant(response.data)
  },
  removeProjectParticipant: async (projectId: string, participantId: string): Promise<void> => {
    await httpClient.delete(`/capability/api/v1/projects/${projectId}/industry-participants/${participantId}`)
  },

  // ── Funding ────────────────────────────────────────────────────────────────
  getProjectFunding: async (projectId: string): Promise<Funding[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/funding`)
    return response.data.map(normalizeFunding)
  },
  createFunding: async (projectId: string, data: Partial<Funding>): Promise<Funding> => {
    const payload = {
      ...data,
      orgId: data.organizationId
    }
    const response = await httpClient.post(`/capability/api/v1/projects/${projectId}/funding`, payload)
    return normalizeFunding(response.data)
  },
  updateFunding: async (fundingId: string, data: Partial<Funding>): Promise<Funding> => {
    const response = await httpClient.patch(`/capability/api/v1/funding/${fundingId}`, data)
    return normalizeFunding(response.data)
  },
  approveFunding: async (fundingId: string): Promise<Funding> => {
    const response = await httpClient.post(`/capability/api/v1/funding/${fundingId}/approve`, {})
    return normalizeFunding(response.data)
  },

  // ── Mentorships ────────────────────────────────────────────────────────────
  getProjectMentorships: async (projectId: string): Promise<Mentorship[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/mentorships`)
    return response.data.map(normalizeMentorship)
  },
  assignMentor: async (projectId: string, data: { mentorUserId: string; scope: string }): Promise<Mentorship> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${projectId}/mentorships`, data)
    return normalizeMentorship(response.data)
  },
  
  // ── Sessions ───────────────────────────────────────────────────────────────
  createMentorshipSession: async (mentorshipId: string, data: { scheduledAt: string; durationMinutes: number }): Promise<MentorshipSession> => {
    const payload = {
      sessionDate: data.scheduledAt,
      // Pass durationMinutes if backend supports it, otherwise map to notes or drop it.
      // Actually backend sessionDto doesn't have durationMinutes. But let's pass notes as placeholder.
      notes: `Duration: ${data.durationMinutes} mins`
    }
    const response = await httpClient.post(`/capability/api/v1/mentorships/${mentorshipId}/sessions`, payload)
    return { 
      ...response.data, 
      id: response.data.sessionId || response.data.id,
      scheduledAt: response.data.sessionDate || response.data.scheduledAt 
    }
  }
}
