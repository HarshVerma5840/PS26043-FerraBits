import { httpClient } from './httpClient'
import { IndustryOrganization, Funding, Mentorship } from '../types'

export const industryApi = {
  getOrganizations: async (): Promise<IndustryOrganization[]> => {
    const response = await httpClient.get('/capability/api/v1/industry/organizations')
    return response.data
  },
  getOrganizationById: async (id: string): Promise<IndustryOrganization> => {
    const response = await httpClient.get(`/capability/api/v1/industry/organizations/${id}`)
    return response.data
  },
  getProjectFunding: async (projectId: string): Promise<Funding[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/funding`)
    return response.data
  },
  getProjectMentorship: async (projectId: string): Promise<Mentorship[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/mentorship`)
    return response.data
  },
  getProjectParticipants: async (projectId: string) => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/industry-participants`)
    return response.data
  }
}
