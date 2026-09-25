import { httpClient } from './httpClient'
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
  uploadFile: async (submissionId: string, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<PortalFile> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await httpClient.post(`/portal/submissions/${submissionId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    })
    return response.data
  },
  getDownloadUrl: (fileId: string) => {
    // In a real app, you might fetch a pre-signed URL or directly use the proxy path.
    // For now we'll just construct the URL and the component can use it in an <a href> or fetch.
    return `/portal/files/${fileId}/download`
  }
}
