import { httpClient, isApiError } from './httpClient'
import { BackendRole } from '../auth/roles'

export interface OtpChallengeResponse {
  challengeId: string
  devOtp?: string
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
  user: {
    userId: string
    phone: string
    email: string | null
    role: BackendRole
    kycStatus: string
    linkedSourceId: string | null
    createdAt: string
  }
  expiresAt: string
}

export const authApi = {
  /**
   * Initiate OTP login. If the phone is not yet registered, automatically
   * falls back to /auth/register (self-service, creates a SUBMITTER account)
   * then re-issues the OTP challenge.
   *
   * Note: EVALUATOR accounts are admin-created and never use this path.
   */
  sendOtp: async (phone: string): Promise<OtpChallengeResponse> => {
    try {
      const response = await httpClient.post<OtpChallengeResponse>('/auth/login', { phone })
      return response.data
    } catch (err: unknown) {
      // After the httpClient interceptor, errors are normalized ApiError objects.
      // Check err.status, not err.response.
      if (isApiError(err) && (err.status === 404 || err.status === 409)) {
        const response = await httpClient.post<OtpChallengeResponse>('/auth/register', { phone })
        return response.data
      }
      throw err
    }
  },

  verifyOtp: async (challengeId: string, code: string): Promise<VerifyOtpResponse> => {
    const response = await httpClient.post<VerifyOtpResponse>('/auth/verify-otp', {
      challengeId,
      code,
    })
    return response.data
  },

  validateToken: async (): Promise<{ valid: boolean }> => {
    const response = await httpClient.get<{ valid: boolean }>('/auth/api/v1/validate')
    return response.data
  },
}
