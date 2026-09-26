import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ApiError } from '../api/httpClient'

export const GlobalFeedbackHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleNetworkError = (e: Event) => {
      const error = (e as CustomEvent<ApiError>).detail
      toast.error(error.message || 'Network error. Please check your connection.', { id: 'network-error' })
    }

    const handleForbidden = () => {
      toast.error('You do not have permission to perform this action.', { id: 'auth-forbidden' })
      navigate('/unauthorized')
    }

    const handleValidation = (e: Event) => {
      const error = (e as CustomEvent<ApiError>).detail
      toast.error(error.message || 'Validation failed. Please check your input.', { id: 'validation-error' })
    }

    const handleApiError = (e: Event) => {
      const error = (e as CustomEvent<ApiError>).detail
      toast.error(error.message || 'An unexpected error occurred.', { id: 'api-error' })
    }
    
    const handleUnauthorized = () => {
      toast.error('Your session has expired. Please log in again.', { id: 'auth-unauthorized' })
      navigate('/login')
    }

    window.addEventListener('api-network-error', handleNetworkError)
    window.addEventListener('auth-forbidden', handleForbidden)
    window.addEventListener('api-validation-error', handleValidation)
    window.addEventListener('api-error', handleApiError)
    window.addEventListener('auth-unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('api-network-error', handleNetworkError)
      window.removeEventListener('auth-forbidden', handleForbidden)
      window.removeEventListener('api-validation-error', handleValidation)
      window.removeEventListener('api-error', handleApiError)
      window.removeEventListener('auth-unauthorized', handleUnauthorized)
    }
  }, [navigate])

  return null
}
