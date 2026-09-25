import { httpClient } from './httpClient'
import { RecommendationReview } from '../types'

export const governanceApi = {
  getReviews: async (): Promise<RecommendationReview[]> => {
    const response = await httpClient.get('/capability/governance/reviews')
    return response.data
  },
  getReviewById: async (id: string): Promise<RecommendationReview> => {
    const response = await httpClient.get(`/capability/governance/reviews/${id}`)
    return response.data
  },
  approveReview: async (id: string) => {
    const response = await httpClient.post(`/capability/governance/reviews/${id}/approve`)
    return response.data
  },
  rejectReview: async (id: string, reason: string) => {
    const response = await httpClient.post(`/capability/governance/reviews/${id}/reject`, { reason })
    return response.data
  },
  overrideReview: async (id: string, targetInstitutionId: string, overrideReason: string) => {
    const response = await httpClient.post(`/capability/governance/reviews/${id}/override`, { targetInstitutionId, overrideReason })
    return response.data
  }
}
