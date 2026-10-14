import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sourceApi, Registration } from '../api/sourceApi'
import { Eye, Edit3, AlertCircle, RefreshCw, FileText } from 'lucide-react'

export default function RegistrationHistoryPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRegistrations = () => {
    setLoading(true)
    setError(null)
    sourceApi.getMyRegistrations()
      .then(res => setRegistrations(res))
      .catch(err => setError(err.message || 'Failed to load registration history.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div className="page-header flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileText size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>My Registrations</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>History of your organization onboarding requests</p>
          </div>
        </div>
        <Link to="/registration/new" className="btn">
          New Registration
        </Link>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--err)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary" onClick={fetchRegistrations}>
            <RefreshCw size={14} style={{ marginRight: '0.4rem' }} /> Retry
          </button>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Registration ID</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Created</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading onboarding history...</td></tr>
            ) : registrations.length === 0 && !error ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 1rem 0' }}>No onboarding registrations found for your account.</p>
                  <Link to="/registration/new" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    Start New Registration
                  </Link>
                </td>
              </tr>
            ) : registrations.map(reg => (
              <tr key={reg.registrationId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{reg.registrationId.substring(0, 8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    {reg.sourceType}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge" style={{
                    background: reg.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' :
                                reg.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.1)' :
                                reg.status === 'ACTION_REQUIRED' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: reg.status === 'APPROVED' ? 'var(--ok)' :
                           reg.status === 'REJECTED' ? 'var(--accent)' :
                           reg.status === 'ACTION_REQUIRED' ? 'var(--warn)' : '#cbd5e1'
                  }}>
                    {reg.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link to={`/registration/${reg.registrationId}/status`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    <Eye size={16} /> Status
                  </Link>
                  {(reg.status === 'DRAFT' || reg.status === 'ACTION_REQUIRED') && (
                    <Link to={`/portal/registrations/${reg.registrationId}`} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
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
