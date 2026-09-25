import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

export default function Header({ title }: { title?: string }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem', 
      background: 'rgba(11, 15, 25, 0.6)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div>
        {title && <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{title}</h2>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {user?.roles?.join(', ') || 'User'}
            </span>
          </div>
        </div>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
        
        <button 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem' }}>Logout</span>
        </button>
      </div>
    </header>
  )
}
