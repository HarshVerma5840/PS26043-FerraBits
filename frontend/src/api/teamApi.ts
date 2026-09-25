import { httpClient } from './httpClient'
import { TeamMember, SkillGap } from '../types'

export const teamApi = {
  getTeamMembers: async (projectId: string): Promise<TeamMember[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/team`)
    return response.data
  },
  getSkillGaps: async (projectId: string): Promise<SkillGap[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/skill-gaps`)
    return response.data
  }
}
