import { httpClient } from './httpClient'
import { Problem } from '../types'

export const problemApi = {
  getProblems: async (): Promise<Problem[]> => {
    const response = await httpClient.get('/problems/api/v1/problems')
    return response.data
  },
  getProblemById: async (id: string): Promise<Problem> => {
    const response = await httpClient.get(`/problems/api/v1/problems/${id}`)
    return response.data
  }
}
