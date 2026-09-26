import { httpClient } from './httpClient'
import { Problem } from '../types'

export const problemApi = {
  getProblems: async (lat: number = 23.3441, lng: number = 85.3096, radiusKm: number = 50.0): Promise<Problem[]> => {
    // The backend does not have a global /problems GET endpoint.
    // Nodal officers fetch their triage queue based on their jurisdiction (GIS-based).
    const response = await httpClient.get(`/problems/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`)
    return response.data
  },
  getProblemById: async (id: string): Promise<Problem> => {
    const response = await httpClient.get(`/problems/${id}`)
    return response.data
  },
  updateStatus: async (id: string, status: string, expectedVersion: number = 0): Promise<Problem> => {
    const response = await httpClient.patch(`/problems/${id}/status`, { status, expectedVersion })
    return response.data
  }
}
