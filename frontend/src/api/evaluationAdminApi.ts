import { httpClient, pageParams } from './httpClient'

export interface EvaluationCycle {
  cycleId: string
  problemId: string
  status: string
  originBucket: string
  startedAt: string
  completedAt?: string
  finalScore?: number
  impactLevel?: string
  priorityBand?: string
}

export interface ProblemAnalysis {
  analysisId: string
  cycleId: string
  heuristicApplied: boolean
  domainTags: string[]
  recommendedPools: string[]
  aiSummary: string
  createdAt: string
}

export interface PoolMode {
  pool: string
  mode: 'MANUAL' | 'AUTO'
  aiScoringAvailable: boolean
  activeHumanEvaluators: number
  note: string
}

export interface AggregationResponse {
  aggregationId: string
  cycleId: string
  finalScore: number
  impactLevel: string
  reviewRequired: boolean
  reviewReason?: string
  pools: {
    pool: string
    present: boolean
    reason?: string
    rawScore?: number
    normalizedScore?: number
    effectiveWeight?: number
  }[]
  createdAt: string
}

export const evaluationAdminApi = {
  getQueue: async (params?: {
    status?: string
    page?: number
    size?: number
  }): Promise<{ content: EvaluationCycle[]; totalPages: number }> => {
    const response = await httpClient.get('/evaluation/queue', {
      params: pageParams({ status: params?.status, page: params?.page, size: params?.size }),
    })
    return response.data
  },

  
  startCycle: async (problemId: string): Promise<EvaluationCycle> => {
    const response = await httpClient.post(`/evaluation/problems/${problemId}/start`)
    return response.data
  },

  getCycle: async (cycleId: string): Promise<EvaluationCycle> => {
    const response = await httpClient.get(`/evaluation/cycles/${cycleId}`)
    return response.data
  },

  getHistory: async (cycleId: string): Promise<any[]> => {
    const response = await httpClient.get(`/evaluation/cycles/${cycleId}/history`)
    return response.data
  },

  analyzeCycle: async (cycleId: string): Promise<ProblemAnalysis> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/analyze`)
    return response.data
  },

  routeCycle: async (cycleId: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/route`)
    return response.data
  },

  routeAllPools: async (cycleId: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/route-pools`)
    return response.data
  },

  aggregateScores: async (cycleId: string): Promise<AggregationResponse> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/aggregate`)
    return response.data
  },

  prioritizeCycle: async (cycleId: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/prioritize`)
    return response.data
  },

  getAggregation: async (cycleId: string): Promise<AggregationResponse> => {
    const response = await httpClient.get(`/evaluation/cycles/${cycleId}/aggregation`)
    return response.data
  },

  publishToPortal: async (cycleId: string): Promise<any> => {
    const response = await httpClient.post(`/evaluation/cycles/${cycleId}/publish-to-portal`)
    return response.data
  },

  getPoolModes: async (): Promise<PoolMode[]> => {
    const response = await httpClient.get('/evaluation/pool-modes')
    return response.data
  },

  setPoolMode: async (pool: string, mode: 'MANUAL' | 'AUTO'): Promise<PoolMode> => {
    const response = await httpClient.put(`/evaluation/pool-modes/${pool}`, { mode })
    return response.data
  }
}
