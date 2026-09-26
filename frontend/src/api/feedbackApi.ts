import { httpClient } from './httpClient'
import { CitizenFeedback, CreateFeedback, FeedbackSummary, ImpactMetrics } from '../types'

export const feedbackApi = {
  getProjectFeedback: async (projectId: string): Promise<CitizenFeedback[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${projectId}/feedback`)
    return (response.data || []).map((f: any) => ({
      ...f,
      id: f.feedbackId || f.id
    }))
  },
  submitFeedback: async (projectId: string, feedback: CreateFeedback): Promise<CitizenFeedback> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${projectId}/feedback`, feedback)
    const f = response.data
    return { ...f, id: f.feedbackId || f.id }
  },
  getFeedbackSummary: async (): Promise<FeedbackSummary> => {
    const response = await httpClient.get('/capability/api/v1/feedback/summary')
    return response.data
  },
  moderateFeedback: async (feedbackId: string, status: string): Promise<CitizenFeedback> => {
    const response = await httpClient.patch(`/capability/api/v1/feedback/${feedbackId}/moderation`, null, {
      params: { status }
    })
    const f = response.data
    return { ...f, id: f.feedbackId || f.id }
  },
  getImpactMetrics: async (): Promise<ImpactMetrics> => {
    const response = await httpClient.get('/capability/api/v1/analytics/impact')
    return response.data
  }
}
