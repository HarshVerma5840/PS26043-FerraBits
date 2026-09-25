import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
})

// Request Interceptor
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Inject Correlation ID
  if (config.headers) {
    config.headers['X-Correlation-ID'] = uuidv4()
  }
  
  return config
})

// Response Interceptor
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.error('Network Error:', error.message)
      // Custom event for generic network errors
      window.dispatchEvent(new CustomEvent('api-network-error', { detail: error.message }))
      return Promise.reject(error)
    }

    const { status, data } = error.response

    switch (status) {
      case 401:
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('auth-unauthorized'))
        break
      case 403:
        window.dispatchEvent(new CustomEvent('auth-forbidden', { detail: data }))
        break
      case 404:
        window.dispatchEvent(new CustomEvent('api-not-found', { detail: data }))
        break
      case 400:
      case 422:
        // Validation Error Handling
        window.dispatchEvent(new CustomEvent('api-validation-error', { detail: data }))
        break
      default:
        console.error('API Error:', status, data)
        window.dispatchEvent(new CustomEvent('api-error', { detail: { status, data } }))
        break
    }

    return Promise.reject(error)
  }
)
