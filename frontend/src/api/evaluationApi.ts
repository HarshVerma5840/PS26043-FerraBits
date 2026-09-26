import { httpClient, pageParams } from './httpClient'

export interface EvaluatorProfile {
  profileId: string
  userId: string
  evaluatorPool: string
  isActive: boolean
  maxConcurrentAssignments: number
  totalAssigned: number
  totalCompleted: number
  createdAt: string
}

export interface CriterionScore {
  criterionId: string
  criterionKey: string
  name: string
  description?: string
  maxScore: number
  displayOrder: number
}

export interface Assignment {
  assignmentId: string
  cycleId: string
  problemId: string
  evaluatorProfileId: string
  status: string
  assignedAt: string
  deadlineAt?: string
  completedAt?: string
  expiresAt?: string
  declineReason?: string
  totalScore?: number
  isStale: boolean
}

export interface AssignmentDetail {
  assignment: Assignment
  problem?: any
  advisoryProfile?: any
  criteria: any[]
}

export interface ScoreSubmission {
  scores: {
    criterionId?: string
    criterionKey?: string
    score: number
    comment?: string
  }[]
  feedback?: string
  recommendation?: string
}

export interface ProjectReview {
  projectReviewId: string
  cycleId: string
  problemId: string
  submissionId: string
  evaluatorProfileId: string
  status: string
  decision?: string
  decisionComment?: string
  assignedAt: string
  decidedAt?: string
}

export interface ProjectReviewDetail {
  review: ProjectReview
  problem?: any
  submission?: any
  files?: any[]
}

export const evaluationApi = {
  // Evaluator Profile
  getProfile: async (): Promise<EvaluatorProfile> => {
    const response = await httpClient.get('/evaluation/me/profile')
    return response.data
  },
  
  getCriteria: async (): Promise<CriterionScore[]> => {
    const response = await httpClient.get('/evaluation/me/criteria')
    return response.data
  },

  // Assignments
  getAssignments: async (status?: string): Promise<Assignment[]> => {
    const response = await httpClient.get('/evaluation/me/assignments', {
      params: pageParams({ status }),
    })
    return response.data
  },
  
  getAssignmentDetail: async (assignmentId: string): Promise<AssignmentDetail> => {
    const response = await httpClient.get(`/evaluation/me/assignments/${assignmentId}`)
    return response.data
  },

  acceptAssignment: async (assignmentId: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/me/assignments/${assignmentId}/accept`)
    return response.data
  },

  declineAssignment: async (assignmentId: string, reason?: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/me/assignments/${assignmentId}/decline`, { reason })
    return response.data
  },

  submitEvaluation: async (assignmentId: string, data: ScoreSubmission): Promise<any> => {
    const response = await httpClient.post(`/evaluation/me/assignments/${assignmentId}/submit`, data)
    return response.data
  },

  // Project Reviews
  getProjectReviews: async (status?: string): Promise<ProjectReview[]> => {
    const response = await httpClient.get('/evaluation/me/project-reviews', {
      params: pageParams({ status }),
    })
    return response.data
  },
  
  getProjectReviewDetail: async (reviewId: string): Promise<ProjectReviewDetail> => {
    const response = await httpClient.get(`/evaluation/me/project-reviews/${reviewId}`)
    return response.data
  },

  decideProjectReview: async (reviewId: string, decision: string, comment: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/me/project-reviews/${reviewId}/decision`, { decision, comment })
    return response.data
  }
}
