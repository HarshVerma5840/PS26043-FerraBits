import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LayoutDashboard, Users, Database, Briefcase, Building2, MessageSquare, LogOut, BookOpen } from 'lucide-react'

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/analytics', icon: LayoutDashboard, label: 'Analytics & Impact' },
    { to: '/portal', icon: BookOpen, label: 'Student Portal' },
    { to: '/admin', icon: Users, label: 'Admin Desk' },
    { to: '/registry', icon: Database, label: 'Capability Registry' },
    { to: '/workspace', icon: Briefcase, label: 'Project Workspace' },
    { to: '/industry', icon: Building2, label: 'Industry & Funding' },
    { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
  ]

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              S
            </div>
            SAAMYUKT
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s',
              })}
            >
              <item.icon size={18} color={/* isActive handled by color inherit */ undefined} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as</div>
              <div style={{ fontWeight: 500 }}>{user?.phone}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '0.5rem' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
