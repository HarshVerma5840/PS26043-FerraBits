import { httpClient } from './httpClient'
import { Project, Milestone, Task, FieldTest, Deployment } from '../types'

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await httpClient.get('/capability/api/v1/projects')
    return response.data
  },
  getProjectById: async (id: string): Promise<Project> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}`)
    return response.data
  },
  getProjectMilestones: async (id: string): Promise<Milestone[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/milestones`)
    return response.data
  },
  createMilestone: async (id: string, data: Partial<Milestone>): Promise<Milestone> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/milestones`, data)
    return response.data
  },
  updateMilestone: async (milestoneId: string, data: Partial<Milestone>): Promise<Milestone> => {
    const response = await httpClient.patch(`/capability/api/v1/milestones/${milestoneId}`, data)
    return response.data
  },
  getProjectTasks: async (id: string): Promise<Task[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/tasks`)
    return response.data
  },
  createTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/tasks`, data)
    return response.data
  },
  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}`, data)
    return response.data
  },
  updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}/status`, { status })
    return response.data
  },
  updateTaskPosition: async (taskId: string, position: number): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}/position`, { position })
    return response.data
  },
  getFieldTests: async (id: string): Promise<FieldTest[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/field-tests`)
    return response.data
  },
  createFieldTest: async (id: string, data: Partial<FieldTest>): Promise<FieldTest> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/field-tests`, data)
    return response.data
  },
  getDeployments: async (id: string): Promise<Deployment[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/deployments`)
    return response.data
  },
  createDeployment: async (id: string, data: Partial<Deployment>): Promise<Deployment> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/deployments`, data)
    return response.data
  }
}
