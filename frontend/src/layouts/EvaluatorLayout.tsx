import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { LayoutDashboard, User, CheckSquare, ClipboardList, FileText, History } from 'lucide-react'

export default function EvaluatorLayout() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isEvaluator = user?.role === 'EVALUATOR'
  const isAdmin = user?.role === 'ADMIN'

  if (!isEvaluator && !isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  const navItems = [
    { to: '/evaluator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/evaluator/profile', icon: User, label: 'My Profile' },
    { to: '/evaluator/criteria', icon: CheckSquare, label: 'Scoring Criteria' },
    { to: '/evaluator/assignments', icon: ClipboardList, label: 'Assignment Queue' },
    { to: '/evaluator/project-reviews', icon: FileText, label: 'Project Reviews' },
    { to: '/evaluator/history', icon: History, label: 'Evaluation History' }
  ]

  return (
    <div className="app-container">
      <Sidebar items={navItems} title="Evaluator" titleIcon={CheckSquare} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header title="Evaluation Portal" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
