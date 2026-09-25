import { httpClient } from './httpClient'
import { Feedback } from '../types'

export const feedbackApi = {
  getProjectFeedback: async (projectId: string): Promise<Feedback[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/feedback`)
    return response.data
  },
  submitFeedback: async (projectId: string, feedback: Partial<Feedback>): Promise<Feedback> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${projectId}/feedback`, feedback)
    return response.data
  },
  getFeedbackSummary: async () => {
    const response = await httpClient.get('/capability/api/v1/feedback/summary')
    return response.data
  }
}
