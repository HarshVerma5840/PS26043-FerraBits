import { httpClient } from './httpClient'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * A basic API Mock Adapter for development and testing.
 * Automatically disabled in production.
 * Enable by setting VITE_MOCK_API=true in .env
 */
export function setupMockApi() {
  if (!import.meta.env.DEV || import.meta.env.VITE_MOCK_API !== 'true') {
    return
  }

  console.warn('[Mock API] Intercepting HTTP requests with mock adapter')

  // Save the original adapter
  const originalAdapter = httpClient.defaults.adapter

  httpClient.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method } = config

    // Example mock: intercepting /auth/verify-otp
    if (url?.includes('/auth/verify-otp') && method === 'post') {
      return {
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            userId: '123',
            phone: '9999999999',
            email: null,
            role: 'ADMIN',
            kycStatus: 'VERIFIED',
            linkedSourceId: null,
            createdAt: new Date().toISOString()
          },
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      } as any
    }

    // Fall back to actual network request for unmocked routes
    if (originalAdapter) {
      // Axios adapters can be an array of adapters or a single adapter function
      if (typeof originalAdapter === 'function') {
        return originalAdapter(config as any) as unknown as Promise<AxiosResponse>
      }
    }
    
    // Default mock response for unhandled routes to prevent hanging
    return {
      data: { message: 'Mock response not configured for this route' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    } as any
  }
}
