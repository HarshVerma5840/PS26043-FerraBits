import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sourceApi, Registration } from '../api/sourceApi'
import { Eye, Edit3 } from 'lucide-react'

export default function RegistrationHistoryPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sourceApi.getMyRegistrations()
      .then(res => setRegistrations(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '4rem' }}>
      <div className="page-header flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Registrations</h1>
          <p style={{ color: 'var(--text-muted)' }}>History of your onboarding requests</p>
        </div>
        <Link to="/register" className="btn">
          New Registration
        </Link>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : registrations.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No registrations found.</td></tr>
            ) : registrations.map(reg => (
              <tr key={reg.registrationId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{reg.registrationId.substring(0, 8)}...</td>
                <td style={{ padding: '1rem' }}>{reg.sourceType}</td>
                <td style={{ padding: '1rem' }}>{reg.status}</td>
                <td style={{ padding: '1rem' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link to={`/register/status/${reg.registrationId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    <Eye size={16} /> Status
                  </Link>
                  {(reg.status === 'DRAFT' || reg.status === 'ACTION_REQUIRED') && (
                    <Link to={`/portal/registration/${reg.registrationId}`} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
                      <Edit3 size={16} /> Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
