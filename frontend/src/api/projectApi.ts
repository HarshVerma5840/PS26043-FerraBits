import { httpClient, isApiError } from './httpClient'
import { Project, Milestone, Task, FieldTest, Deployment } from '../types'

// NOTE: The backend has no standalone project list/create controller.
// Projects are created implicitly when a governance review is APPROVED or OVERRIDDEN.
// The /capability/api/v1/projects endpoints are served by ProjectExecutionController
// and only handle sub-resources (milestones, tasks, field-tests, deployments).
// We expose the governance approval flow as the canonical project creation path.

export const projectApi = {
  // --- READ (no dedicated backend list endpoint; data comes from governance-approved runs) ---
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await httpClient.get('/capability/api/v1/projects')
      const raw: any[] = response.data || []
      return raw.map(normalizeProject)
    } catch (err: unknown) {
      // Endpoint may not exist; return empty array with clear empty state in UI.
      // After normalization, errors are ApiError — check err.status, not err.response.
      if (isApiError(err) && (err.status === 404 || err.status === 405)) return []
      throw err
    }
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}`)
    return normalizeProject(response.data)
  },

  // --- EXECUTION SUB-RESOURCES (all backed by ProjectExecutionController) ---
  getProjectMilestones: async (id: string): Promise<Milestone[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/milestones`)
    return (response.data || []).map((m: any) => ({ ...m, id: m.milestoneId || m.id }))
  },
  createMilestone: async (id: string, data: Partial<Milestone>): Promise<Milestone> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/milestones`, data)
    return { ...response.data, id: response.data.milestoneId || response.data.id }
  },
  updateMilestone: async (milestoneId: string, data: Partial<Milestone>): Promise<Milestone> => {
    const response = await httpClient.patch(`/capability/api/v1/milestones/${milestoneId}`, data)
    return { ...response.data, id: response.data.milestoneId || response.data.id }
  },
  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await httpClient.delete(`/capability/api/v1/milestones/${milestoneId}`)
  },

  getProjectTasks: async (id: string): Promise<Task[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/tasks`)
    return (response.data || []).map((t: any) => ({ ...t, id: t.taskId || t.id }))
  },
  createTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/tasks`, data)
    return { ...response.data, id: response.data.taskId || response.data.id }
  },
  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}`, data)
    return { ...response.data, id: response.data.taskId || response.data.id }
  },
  updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}/status`, { status })
    return response.data
  },
  updateTaskPosition: async (taskId: string, positionIndex: number): Promise<Task> => {
    const response = await httpClient.patch(`/capability/api/v1/tasks/${taskId}/position`, { positionIndex })
    return response.data
  },
  deleteTask: async (taskId: string): Promise<void> => {
    await httpClient.delete(`/capability/api/v1/tasks/${taskId}`)
  },

  getFieldTests: async (id: string): Promise<FieldTest[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/field-tests`)
    return (response.data || []).map((t: any) => ({ ...t, id: t.testId || t.id }))
  },
  createFieldTest: async (id: string, data: Partial<FieldTest>): Promise<FieldTest> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/field-tests`, data)
    return { ...response.data, id: response.data.testId || response.data.id }
  },

  getDeployments: async (id: string): Promise<Deployment[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/deployments`)
    return (response.data || []).map((d: any) => ({ ...d, id: d.deploymentId || d.id }))
  },
  createDeployment: async (id: string, data: Partial<Deployment>): Promise<Deployment> => {
    const response = await httpClient.post(`/capability/api/v1/projects/${id}/deployments`, data)
    return { ...response.data, id: response.data.deploymentId || response.data.id }
  },

  // --- INDUSTRY / FUNDING (ProjectExecutionController sub-resources) ---
  getIndustryParticipants: async (id: string): Promise<any[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/industry-participants`)
    return response.data || []
  },
  getFunding: async (id: string): Promise<any[]> => {
    const response = await httpClient.get(`/capability/api/v1/projects/${id}/funding`)
    return response.data || []
  },
}

function normalizeProject(raw: any): Project {
  return {
    ...raw,
    id: raw.projectId || raw.id,
    projectId: raw.projectId || raw.id,
    problemId: raw.problemId,
    institutionId: raw.institutionId,
    name: raw.name || `Project ${(raw.projectId || raw.id || '').substring(0, 8)}`,
    description: raw.description,
    status: raw.status || 'ACTIVE',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}
