import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Shield, Database, LayoutDashboard } from 'lucide-react'

export default function AdminLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Note: We don't block access on the frontend based on roles.
  // The backend will return 401/403 which is caught by Axios interceptors.
  
  const navItems = [
    { to: '/admin/analytics', icon: LayoutDashboard, label: 'Ecosystem Analytics' },
    { to: '/admin/reviews', icon: Shield, label: 'Governance Reviews' },
    { to: '/admin/registry', icon: Database, label: 'Capability Registry' },
  ]

  return (
    <div className="app-container">
      <Sidebar items={navItems} title="Admin Console" titleIcon={Shield} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header title="Administration" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
