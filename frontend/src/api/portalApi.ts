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
  registerParticipant: async (data: Partial<Participant>): Promise<Participant> => {
    const response = await httpClient.post('/portal/participants', data)
    return response.data
  },
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await httpClient.get('/portal/submissions')
    return response.data
  },
  createSubmission: async (data: Partial<Submission>): Promise<Submission> => {
    const response = await httpClient.post('/portal/submissions', data)
    return response.data
  },
  getSubmissionById: async (id: string): Promise<Submission> => {
    const response = await httpClient.get(`/portal/submissions/${id}`)
    return response.data
  },
  updateSubmission: async (id: string, data: Partial<Submission>): Promise<Submission> => {
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
   * Returns the full download URL for a portal file.
   * In production this is absolute (VITE_API_BASE_URL + path).
   * In dev the Vite proxy intercepts the relative /portal path.
   */
  getDownloadUrl: (fileId: string): string => {
    const base = (import.meta.env.VITE_API_BASE_URL as string) ?? ''
    return `${base}/portal/files/${fileId}/download`
  },
}

