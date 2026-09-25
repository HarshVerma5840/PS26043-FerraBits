import { Outlet, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Briefcase, ListTodo, Building2, MessageSquare, Star, Users } from 'lucide-react'

export default function ProjectLayout() {
  const { isAuthenticated } = useAuth()
  const { projectId } = useParams<{ projectId: string }>()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!projectId) return <Navigate to="/" replace />

  const navItems = [
    { to: `/projects/${projectId}`, icon: Briefcase, label: 'Overview' },
    { to: `/projects/${projectId}/team`, icon: Users, label: 'Team & Skills' },
    { to: `/projects/${projectId}/kanban`, icon: ListTodo, label: 'Kanban Board' },
    { to: `/projects/${projectId}/industry`, icon: Building2, label: 'Industry Partners' },
    { to: `/projects/${projectId}/messages`, icon: MessageSquare, label: 'Messages' },
    { to: `/projects/${projectId}/feedback`, icon: Star, label: 'Feedback' },
  ]

  return (
    <div className="app-container">
      <Sidebar items={navItems} title="Project Workspace" titleIcon={Briefcase} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header title={`Project: ${projectId}`} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
