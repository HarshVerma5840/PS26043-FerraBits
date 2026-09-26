import { httpClient, pageParams } from './httpClient'

export interface CodeJudgeEvaluation {
  evaluationId: string
  repositoryUrl: string
  commitSha: string
  status: string
  startedAt: string
  completedAt?: string
  history?: any[]
  evaluationSummary?: string
}

export interface CodeJudgeScore {
  evaluationId: string
  totalScore: number
  categoryBreakdown: {
    categoryKey: string
    name: string
    maxScore: number
    awardedScore: number
    status: string
    reason?: string
  }[]
}

export interface CodeJudgeFinding {
  findingId: string
  severity: string
  categoryKey: string
  ruleKey: string
  description: string
  evidenceRef: string
}

export interface CodeJudgeReport {
  evaluationId: string
  reportJson?: any
  reportMarkdown?: string
  generatedAt: string
}

export interface CodeJudgeJob {
  jobId: string
  evaluationId: string
  status: string
  priority: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
}

export const codejudgeApi = {
  listEvaluations: async (status?: string): Promise<CodeJudgeEvaluation[]> => {
    const response = await httpClient.get('/codejudge/evaluations', {
      params: pageParams({ status }),
    })
    return response.data
  },

  getEvaluation: async (id: string): Promise<CodeJudgeEvaluation> => {
    const response = await httpClient.get(`/codejudge/evaluations/${id}`)
    return response.data
  },

  getScore: async (id: string): Promise<CodeJudgeScore> => {
    const response = await httpClient.get(`/codejudge/evaluations/${id}/score`)
    return response.data
  },

  getFindings: async (id: string): Promise<CodeJudgeFinding[]> => {
    const response = await httpClient.get(`/codejudge/evaluations/${id}/findings`)
    return response.data
  },

  getReportMarkdown: async (id: string): Promise<string> => {
    const response = await httpClient.get(`/codejudge/evaluations/${id}/report?format=markdown`, {
      headers: { 'Accept': 'text/markdown' },
      responseType: 'text'
    })
    return response.data
  },

  // Admin routes
  retryEvaluation: async (id: string): Promise<any> => {
    const response = await httpClient.post(`/codejudge/admin/evaluations/${id}/retry`)
    return response.data
  },

  reevaluate: async (id: string): Promise<any> => {
    const response = await httpClient.post(`/codejudge/admin/evaluations/${id}/reevaluate`)
    return response.data
  },

  getAdminJobs: async (status?: string): Promise<CodeJudgeJob[]> => {
    const response = await httpClient.get('/codejudge/admin/jobs', {
      params: pageParams({ status }),
    })
    return response.data
  },

  getScoringConfig: async (): Promise<{ categories: any[], policies: any[] }> => {
    const response = await httpClient.get('/codejudge/admin/scoring-config')
    return response.data
  }
}
