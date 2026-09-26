import { httpClient } from './httpClient'

export interface Registration {
  registrationId: string
  sourceBucket: string
  sourceType: string
  status: string
  source: Record<string, any>
  submittedByUserId: string
  sourceId: string
  assignedReviewerId?: string
  rejectionReason?: string
  actionRequiredComment?: string
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface RegistrationStatusResponse {
  registrationId: string
  status: string
  rejectionReason?: string
  actionRequiredComment?: string
}

export interface RegistrationHistoryResponse {
  historyId: string
  registrationId: string
  status: string
  comment?: string
  createdAt: string
  actorId: string
}

export interface SourceTypesResponse {
  types: Record<string, any>
}

export interface RegistrationCreateRequest {
  sourceType: string
  account: {
    phone: string
    email?: string
  }
  source: Record<string, any>
  documents?: {
    documentType: string
    documentId: string
  }[]
}

export interface SourceAccount {
  sourceAccountId: string
  sourceId: string
  registrationId: string
  sourceBucket: string
  sourceType: string
  displayName: string
  status: string
  verificationStatus: string
  canSubmit: boolean
  activatedAt?: string
  createdAt: string
}

export interface User {
  userId: string
  phone: string
  email?: string
  role: string
  kycStatus: string
  linkedSourceId?: string
  createdAt: string
}

export const sourceApi = {
  // Registration
  createRegistration: async (data: RegistrationCreateRequest): Promise<Registration> => {
    const response = await httpClient.post('/registration', data)
    return response.data
  },
  getSourceTypes: async (): Promise<SourceTypesResponse> => {
    const response = await httpClient.get('/registration/source-types')
    return response.data
  },
  getRegistrationStatus: async (registrationId: string): Promise<RegistrationStatusResponse> => {
    const response = await httpClient.get(`/registration/${registrationId}/status`)
    return response.data
  },
  getMyRegistrations: async (): Promise<Registration[]> => {
    const response = await httpClient.get('/registration/mine')
    return response.data
  },
  getRegistration: async (registrationId: string): Promise<Registration> => {
    const response = await httpClient.get(`/registration/${registrationId}`)
    return response.data
  },
  updateRegistration: async (registrationId: string, source: Record<string, any>): Promise<Registration> => {
    const response = await httpClient.patch(`/registration/${registrationId}`, { source })
    return response.data
  },
  submitRegistration: async (registrationId: string): Promise<Registration> => {
    const response = await httpClient.post(`/registration/${registrationId}/submit`)
    return response.data
  },
  getRegistrationHistory: async (registrationId: string): Promise<RegistrationHistoryResponse[]> => {
    const response = await httpClient.get(`/registration/${registrationId}/history`)
    return response.data
  },
  
  // Reviewer Queue
  getReviewerRegistrations: async (status?: string): Promise<Registration[]> => {
    const response = await httpClient.get(`/reviewer/registrations${status ? `?status=${status}` : ''}`)
    return response.data
  },
  assignReviewer: async (registrationId: string): Promise<Registration> => {
    const response = await httpClient.post(`/reviewer/registrations/${registrationId}/assign`)
    return response.data
  },
  approveRegistration: async (registrationId: string, comment?: string): Promise<Registration> => {
    const response = await httpClient.post(`/reviewer/registrations/${registrationId}/approve`, { comment })
    return response.data
  },
  rejectRegistration: async (registrationId: string, comment: string): Promise<Registration> => {
    const response = await httpClient.post(`/reviewer/registrations/${registrationId}/reject`, { comment })
    return response.data
  },
  requestAction: async (registrationId: string, comment: string): Promise<Registration> => {
    const response = await httpClient.post(`/reviewer/registrations/${registrationId}/request-action`, { comment })
    return response.data
  },

  // Source Accounts
  getSourceAccounts: async (): Promise<SourceAccount[]> => {
    const response = await httpClient.get('/source/accounts')
    return response.data
  },
  verifySourceAccount: async (sourceAccountId: string): Promise<SourceAccount> => {
    const response = await httpClient.post(`/sources/${sourceAccountId}/verify`)
    return response.data
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const response = await httpClient.get('/users')
    return response.data
  },
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await httpClient.patch(`/users/${userId}/role`, { role })
    return response.data
  }
}
