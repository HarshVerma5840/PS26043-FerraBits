import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function PublicLayout() {
  const { isAuthenticated } = useAuth()

  // If already logged in, redirect away from public pages (like login)
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-color)' }}>
      <Outlet />
    </div>
  )
}
