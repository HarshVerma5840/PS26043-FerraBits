import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { BookOpen, FileText } from 'lucide-react'

export default function PortalLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const navItems = [
    { to: '/portal/problems', icon: BookOpen, label: 'Problem Statements' },
    { to: '/portal/submissions', icon: FileText, label: 'My Submissions' },
  ]

  return (
    <div className="app-container">
      <Sidebar items={navItems} title="Student Portal" titleIcon={BookOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header title="SAAMYUKT Portal" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
