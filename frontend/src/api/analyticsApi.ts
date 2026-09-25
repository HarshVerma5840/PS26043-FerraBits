import { httpClient } from './httpClient'
import { AnalyticsSummary, DistrictAnalytics } from '../types'

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await httpClient.get('/capability/api/v1/analytics/impact')
    return response.data
  },
  getDistrictAnalytics: async (): Promise<DistrictAnalytics[]> => {
    const response = await httpClient.get('/capability/api/v1/analytics/districts')
    return response.data
  },
  getInstitutionsAnalytics: async () => {
    const response = await httpClient.get('/capability/api/v1/analytics/institutions')
    return response.data
  },
  getProjectsAnalytics: async () => {
    const response = await httpClient.get('/capability/api/v1/analytics/projects')
    return response.data
  }
}
