import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Shield, Database, LayoutDashboard, ClipboardList, Users, Building, TerminalSquare, Sliders } from 'lucide-react'

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isAdmin = user?.role === 'ADMIN'
  const isReviewer = user?.role === 'REVIEWER'

  if (!isAdmin && !isReviewer) {
    return <Navigate to="/unauthorized" replace />
  }
  
  const navItems = []
  if (isAdmin) {
    navItems.push({ to: '/admin/analytics', icon: LayoutDashboard, label: 'Ecosystem Analytics' })
    navItems.push({ to: '/admin/evaluation', icon: Shield, label: 'Evaluation Center' })
    navItems.push({ to: '/admin/registry', icon: Database, label: 'Capability Registry' })
    navItems.push({ to: '/admin/registry/workspace', icon: Database, label: 'Registry Workspace' })
    navItems.push({ to: '/admin/sources', icon: Building, label: 'Source Accounts' })
    navItems.push({ to: '/admin/users', icon: Users, label: 'User Roles' })
    navItems.push({ to: '/admin/codejudge/jobs', icon: TerminalSquare, label: 'CodeJudge Jobs' })
    navItems.push({ to: '/admin/codejudge/config', icon: Sliders, label: 'CodeJudge Config' })
  }
  if (isAdmin || isReviewer) {
    navItems.push({ to: '/admin/reviewer-queue', icon: ClipboardList, label: 'Registration Queue' })
  }

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
