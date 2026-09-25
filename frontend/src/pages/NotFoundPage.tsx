import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%' }}>
        <FileQuestion size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
        <h1 style={{ marginBottom: '1rem', color: '#fff' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn">Return to Safety</Link>
      </div>
    </div>
  )
}
