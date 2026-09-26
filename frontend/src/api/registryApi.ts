import { httpClient } from './httpClient'
import { Institution, RegistryVersion } from '../types'

export const registryApi = {
  getInstitutions: async (search?: string): Promise<Institution[]> => {
    const response = await httpClient.get(`/capability/registry/institutions${search ? `?search=${search}` : ''}`)
    return response.data.content || response.data || []
  },
  getInstitutionById: async (id: string): Promise<Institution> => {
    const response = await httpClient.get(`/capability/registry/institutions/${id}`)
    return response.data
  },
  getInstitutionCapabilities: async (id: string): Promise<any[]> => {
    const response = await httpClient.get(`/capability/registry/institutions/${id}/capabilities`)
    return response.data.content || response.data || []
  },
  getVersions: async (): Promise<RegistryVersion[]> => {
    const response = await httpClient.get('/capability/registry/versions')
    return response.data.content || response.data || []
  },
  getVersionById: async (id: string): Promise<RegistryVersion> => {
    const response = await httpClient.get(`/capability/registry/versions/${id}`)
    return response.data
  },
  importRegistry: async (data: any) => {
    const response = await httpClient.post('/capability/registry/import', data)
    return response.data
  },
  publishVersion: async (versionId: string) => {
    const response = await httpClient.post(`/capability/registry/versions/${versionId}/publish`)
    return response.data
  },
  archiveVersion: async (versionId: string) => {
    const response = await httpClient.post(`/capability/registry/versions/${versionId}/archive`)
    return response.data
  }
}

export const registryAdminApi = {
  createInstitution: async (data: any) => {
    const response = await httpClient.post('/capability/admin/registry/institutions', data)
    return response.data
  },
  updateInstitution: async (id: string, data: any) => {
    const response = await httpClient.put(`/capability/admin/registry/institutions/${id}`, data)
    return response.data
  },
  createDepartment: async (data: any) => {
    const response = await httpClient.post('/capability/admin/registry/departments', data)
    return response.data
  },
  createLab: async (data: any) => {
    const response = await httpClient.post('/capability/admin/registry/labs', data)
    return response.data
  },
  createEquipment: async (labId: string, data: any) => {
    const response = await httpClient.post(`/capability/admin/registry/labs/${labId}/equipment`, data)
    return response.data
  },
  addFacultySkill: async (facultyId: string, data: any) => {
    const response = await httpClient.post(`/capability/admin/registry/faculty/${facultyId}/skills`, data)
    return response.data
  },
  addStudentSkill: async (studentId: string, data: any) => {
    const response = await httpClient.post(`/capability/admin/registry/students/${studentId}/skills`, data)
    return response.data
  },
  createTeam: async (data: any) => {
    const response = await httpClient.post('/capability/admin/registry/teams', data)
    return response.data
  },
  addTeamMember: async (teamId: string, data: any) => {
    const response = await httpClient.post(`/capability/admin/registry/teams/${teamId}/members`, data)
    return response.data
  }
}
