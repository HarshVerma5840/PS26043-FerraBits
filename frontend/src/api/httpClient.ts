/**
 * httpClient.ts — Single Axios instance for all SAAMYUKT API calls.
 *
 * Design:
 *  • ONE Axios instance created at module load time. Vite ESM ensures this
 *    module is evaluated exactly once per page; interceptors register once.
 *  • In dev, Vite proxy routes every backend prefix to localhost:8080, so
 *    baseURL is '' (relative) and the Vite dev proxy intercepts all calls.
 *  • In production, VITE_API_BASE_URL is the API Gateway URL and is prepended
 *    to every path by Axios.
 *  • 401 → fire 'auth-unauthorized' DOM event; AuthContext calls logout().
 *  • 403 → fire 'auth-forbidden' DOM event; navigate to /unauthorized.
 *  • Network errors → fire 'api-network-error'.
 *  • Cancelled (AbortController) → pass through without side-effects.
 *  • All errors are normalized to ApiError before rejection.
 *  • JSON and multipart work automatically: do NOT set a default Content-Type
 *    header here or Axios cannot set the multipart boundary for FormData.
 *  • crypto.randomUUID() is used for X-Correlation-ID — no uuid package needed.
 */

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  CanceledError,
} from 'axios'

// ── Exported error type ──────────────────────────────────────────────────────

export interface ApiError {
  /** HTTP status code, or 0 for network/cancelled errors */
  status: number
  /** Human-readable message extracted from backend body, or generic fallback */
  message: string
  /** Machine-readable code (HTTP_xxx, NETWORK_ERROR, CANCELLED) */
  code: string
  /** Raw backend response body when available */
  details?: unknown
  /** True when the request was intentionally aborted by an AbortSignal */
  isCancelled?: boolean
}

// ── Instance ─────────────────────────────────────────────────────────────────

/**
 * In dev: baseURL must be '' so the Vite proxy (vite.config.ts server.proxy)
 * can intercept all relative paths and forward them to localhost:8080.
 *
 * In production: VITE_API_BASE_URL is the API Gateway root URL
 * (e.g. https://api.saamyukt.gov.in). Axios prepends it to every path.
 *
 * No trailing slash — each API client owns its own path prefix.
 */
const BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) ?? ''

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    // Content-Type is intentionally NOT set here.
    // Axios sets it automatically: 'application/json' for plain objects,
    // 'multipart/form-data; boundary=...' for FormData instances.
  },
})

// ── Error normalisation ──────────────────────────────────────────────────────

function normalizeError(error: AxiosError): ApiError {
  // Request intentionally aborted by an AbortController signal
  if (error instanceof CanceledError || axios.isCancel(error)) {
    return {
      status: 0,
      message: 'Request cancelled',
      code: 'CANCELLED',
      isCancelled: true,
    }
  }

  // No response received — network failure (DNS, timeout, CORS preflight, etc.)
  if (!error.response) {
    return {
      status: 0,
      message: error.message || 'Network error — please check your connection',
      code: 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response as { status: number; data: unknown }
  const d = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : null
  const message = d
    ? String(d.message ?? d.error ?? d.title ?? error.message)
    : error.message

  return {
    status,
    message,
    code: (d?.code && typeof d.code === 'string') ? d.code : `HTTP_${status}`,
    details: data,
  }
}

// ── Request interceptor ──────────────────────────────────────────────────────

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Attach the current JWT bearer token if one is stored
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Per-request correlation ID for distributed tracing across microservices.
  // crypto.randomUUID() is available in all modern browsers and Vite dev server.
  // This removes the runtime dependency on the 'uuid' npm package.
  config.headers['X-Correlation-ID'] = crypto.randomUUID()

  return config
})

// ── Response interceptor ─────────────────────────────────────────────────────

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (rawError: AxiosError) => {
    const error = normalizeError(rawError)

    // Cancelled requests pass through immediately without any global side-effect
    if (error.isCancelled) {
      return Promise.reject(error)
    }

    if (error.status === 0) {
      window.dispatchEvent(new CustomEvent('api-network-error', { detail: error }))
    } else {
      switch (error.status) {
        case 401:
          // Expired or invalid token — clear it and trigger logout
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('auth-unauthorized'))
          break
        case 403:
          // Authenticated but not authorised — redirect to /unauthorized
          window.dispatchEvent(new CustomEvent('auth-forbidden', { detail: error }))
          break
        case 404:
          window.dispatchEvent(new CustomEvent('api-not-found', { detail: error }))
          break
        case 400:
        case 422:
          window.dispatchEvent(new CustomEvent('api-validation-error', { detail: error }))
          break
        default:
          console.error('[httpClient] API error:', error)
          window.dispatchEvent(new CustomEvent('api-error', { detail: error }))
          break
      }
    }

    return Promise.reject(error)
  }
)

// ── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Returns an Axios request config for multipart/form-data uploads.
 * Supports upload progress callbacks and AbortSignal cancellation.
 *
 * Usage:
 *   const ctrl = new AbortController()
 *   await httpClient.post(url, formData, multipartConfig(ctrl.signal, e => setProgress(e)))
 */
export function multipartConfig(
  signal?: AbortSignal,
  onUploadProgress?: (event: ProgressEvent) => void
): object {
  return {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...(signal ? { signal } : {}),
    ...(onUploadProgress ? { onUploadProgress } : {}),
  }
}

/**
 * Build a Spring Data-compatible pagination params object for Axios.
 * Omitted/undefined values are not sent to the server.
 *
 * Usage:
 *   httpClient.get('/evaluation/queue', { params: pageParams({ page: 0, size: 20, status: 'PENDING' }) })
 */
export function pageParams(opts: {
  page?: number
  size?: number
  sort?: string
  [key: string]: string | number | boolean | undefined
}): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(opts).filter(([, v]) => v !== undefined && v !== null)
  ) as Record<string, string | number | boolean>
}

/**
 * Type-guard: returns true if err is an ApiError (normalized by this client).
 * Use this in catch blocks to differentiate between API errors and programming
 * errors thrown inside query functions.
 */
export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err &&
    'code' in err
  )
}
