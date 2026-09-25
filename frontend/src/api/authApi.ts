import { httpClient } from './httpClient'

export const authApi = {
  login: async (credentials: any) => {
    const response = await httpClient.post('/auth/api/v1/login', credentials)
    return response.data
  },
  validateToken: async () => {
    // Optional endpoint if the backend supports explicit token validation
    const response = await httpClient.get('/auth/api/v1/validate')
    return response.data
  }
}
