import { httpClient, pageParams } from './httpClient'

export interface EvaluatorProfile {
  profileId: string
  userId: string
  evaluatorType?: string
  evaluatorPool?: string
  fullName?: string
  organization?: string
  designation?: string
  experienceYears?: number
  regionStates?: string[]
  affiliatedSourceId?: string
  maxWorkload?: number
  maxConcurrentAssignments?: number
  active?: boolean
  isActive?: boolean
  totalAssigned?: number
  totalCompleted?: number
  createdAt: string
  updatedAt?: string
}

export interface CriterionScore {
  criterionId: string
  criterionKey?: string
  name?: string
  criterionLabel?: string
  description?: string
  maxScore: number
  displayOrder?: number
  sortOrder?: number
  score?: number
  myScore?: number
  comment?: string
  myComment?: string
}

export interface Assignment {
  assignmentId: string
  cycleId: string
  problemId: string
  problemTitle?: string
  evaluatorProfileId?: string
  status: string
  assignedAt: string
  deadline?: string
  deadlineAt?: string
  submittedAt?: string
  completedAt?: string
  expiresAt?: string
  declineReason?: string
  totalScore?: number
  isStale?: boolean
  overdue?: boolean
  criteriaTotal?: number
  criteriaScored?: number
  cycleStatus?: string
}

export interface AssignmentDetail {
  assignment: Assignment
  problem?: any
  analysis?: any
  advisoryProfile?: any
  feedback?: string
  recommendation?: string
  criteria: CriterionScore[]
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

export interface ProjectReviewFile {
  fileId: string
  fileName?: string
  filename?: string
  originalName?: string
  sizeBytes?: number
  contentType?: string
  contentUrl?: string
}

export interface ProjectReview {
  projectReviewId: string
  cycleId?: string
  problemId: string
  problemTitle?: string
  submissionId?: string
  submissionTitle?: string
  round?: number
  evaluatorProfileId?: string
  status: string
  decision?: string
  decisionComment?: string
  assignedAt?: string
  createdAt?: string
  decidedAt?: string
}

export interface ProjectReviewDetail {
  projectReviewId?: string
  submissionId?: string
  problemId?: string
  cycleId?: string
  problemTitle?: string
  submissionTitle?: string
  summary?: string
  githubUrl?: string
  links?: { label?: string; url?: string; [key: string]: any }[]
  round?: number
  status?: string
  decisionComment?: string
  files?: ProjectReviewFile[]
  createdAt?: string
  decidedAt?: string
  // backward-compat nested properties
  review?: ProjectReview
  problem?: any
  submission?: any
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
