import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

import { setupMockApi } from './api/mockApi'
import { MutationCache } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Initialize mock API if VITE_MOCK_API is enabled
if (import.meta.env.DEV) {
  setupMockApi()
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onMutate: () => {
      return { toastId: toast.loading('Processing request...') }
    },
    onSuccess: (_data, _variables, context: any) => {
      if (context?.toastId) toast.dismiss(context.toastId)
    },
    onError: (_error, _variables, context: any) => {
      if (context?.toastId) toast.dismiss(context.toastId)
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
