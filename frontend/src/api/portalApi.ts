import { httpClient, multipartConfig } from './httpClient'
import { Problem, Participant, Submission, PortalFile } from '../types'

export const portalApi = {
  getProblems: async (): Promise<Problem[]> => {
    const response = await httpClient.get('/portal/problems')
    return response.data
  },
  getProblemById: async (id: string): Promise<Problem> => {
    const response = await httpClient.get(`/portal/problems/${id}`)
    return response.data
  },
  getMe: async (): Promise<Participant> => {
    const response = await httpClient.get('/portal/me')
    return response.data
  },
  registerParticipant: async (data: { fullName: string; email?: string; phone?: string }): Promise<Participant> => {
    const response = await httpClient.post('/portal/participants', data)
    return response.data
  },
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await httpClient.get('/portal/submissions')
    return response.data
  },
  createSubmission: async (data: {
    problemId: string
    title?: string
    summary?: string
    githubUrl?: string
    commitSha?: string
    branch?: string
    links?: Array<Record<string, string>>
    teamName?: string
    memberUserIds?: string[]
  }): Promise<Submission> => {
    const response = await httpClient.post('/portal/submissions', data)
    return response.data
  },
  getSubmissionById: async (id: string): Promise<Submission> => {
    const response = await httpClient.get(`/portal/submissions/${id}`)
    return response.data
  },
  updateSubmission: async (id: string, data: {
    title?: string
    summary?: string
    githubUrl?: string
    commitSha?: string
    branch?: string
    links?: Array<Record<string, string>>
  }): Promise<Submission> => {
    const response = await httpClient.patch(`/portal/submissions/${id}`, data)
    return response.data
  },
  submitSubmission: async (id: string): Promise<Submission> => {
    const response = await httpClient.post(`/portal/submissions/${id}/submit`)
    return response.data
  },
  getFiles: async (submissionId: string): Promise<PortalFile[]> => {
    const response = await httpClient.get(`/portal/submissions/${submissionId}/files`)
    return response.data
  },
  deleteFile: async (submissionId: string, fileId: string): Promise<void> => {
    await httpClient.delete(`/portal/submissions/${submissionId}/files/${fileId}`)
  },
  /**
   * Upload a file for a submission. Supports progress tracking and
   * cancellation via AbortController.
   *
   * @throws ApiError with isCancelled=true if aborted
   */
  uploadFile: async (
    submissionId: string,
    file: File,
    signal?: AbortSignal,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<PortalFile> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await httpClient.post(
      `/portal/submissions/${submissionId}/files`,
      formData,
      multipartConfig(signal, onUploadProgress)
    )
    return response.data
  },
  /**
   * Securely download a submission file with JWT authorization header.
   */
  downloadFile: async (fileId: string, originalName?: string): Promise<void> => {
    const response = await httpClient.get(`/portal/files/${fileId}/download`, {
      responseType: 'blob'
    })
    const contentType = response.headers['content-type']
    const mimeType = typeof contentType === 'string' ? contentType : 'application/octet-stream'
    const blob = new Blob([response.data], {
      type: mimeType
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = originalName || `file-${fileId}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },
  /**
   * Returns the full download URL for a portal file.
   * In production this is absolute (VITE_API_BASE_URL + path).
   * In dev the Vite proxy intercepts the relative /portal path.
   */
  getDownloadUrl: (fileId: string): string => {
    const base = (import.meta.env.VITE_API_BASE_URL as string) ?? ''
    return `${base}/portal/files/${fileId}/download`
  },
}

