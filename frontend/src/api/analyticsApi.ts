import { httpClient } from './httpClient'
import { ImpactMetrics, DistrictAnalytics, InstitutionAnalytics, ProjectAnalytics } from '../types'

export const analyticsApi = {
  getSummary: async (): Promise<ImpactMetrics> => {
    const response = await httpClient.get('/capability/api/v1/analytics/impact')
    return response.data
  },
  getDistrictAnalytics: async (): Promise<DistrictAnalytics[]> => {
    const response = await httpClient.get('/capability/api/v1/analytics/districts')
    return Array.isArray(response.data) ? response.data : []
  },
  getInstitutionsAnalytics: async (): Promise<InstitutionAnalytics[]> => {
    const response = await httpClient.get('/capability/api/v1/analytics/institutions')
    return Array.isArray(response.data) ? response.data : []
  },
  getProjectsAnalytics: async (): Promise<ProjectAnalytics[]> => {
    const response = await httpClient.get('/capability/api/v1/analytics/projects')
    return Array.isArray(response.data) ? response.data : []
  }
}
