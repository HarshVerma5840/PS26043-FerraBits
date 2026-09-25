import { Link } from 'react-router-dom'
import { AlertOctagon } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%' }}>
        <AlertOctagon size={64} color="var(--err)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
        <h1 style={{ marginBottom: '1rem', color: '#fff' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You don't have the necessary permissions to access this page. 
          Security checks are enforced on the backend.
        </p>
        <Link to="/" className="btn">Return to Dashboard</Link>
      </div>
    </div>
  )
}
