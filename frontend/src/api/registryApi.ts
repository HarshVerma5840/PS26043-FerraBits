import { httpClient } from './httpClient'
import { Institution, RegistryVersion } from '../types'

export const registryApi = {
  getInstitutions: async (search?: string): Promise<Institution[]> => {
    const response = await httpClient.get(`/capability/api/v1/registry/institutions${search ? `?skill=${search}` : ''}`)
    return response.data
  },
  getInstitutionById: async (id: string): Promise<Institution> => {
    const response = await httpClient.get(`/capability/api/v1/registry/institutions/${id}`)
    return response.data
  },
  getVersions: async (): Promise<RegistryVersion[]> => {
    const response = await httpClient.get('/capability/api/v1/registry/versions')
    return response.data
  },
  importRegistry: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await httpClient.post('/capability/api/v1/registry/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  publishVersion: async (versionId: string) => {
    const response = await httpClient.post(`/capability/api/v1/registry/versions/${versionId}/publish`)
    return response.data
  }
}
