import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { sourceApi, RegistrationStatusResponse } from '../api/sourceApi'
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function RegistrationStatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [statusData, setStatusData] = useState<RegistrationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = () => {
    if (id) {
      setLoading(true)
      setError(null)
      sourceApi.getRegistrationStatus(id)
        .then(res => setStatusData(res))
        .catch(err => setError(err.message || 'Failed to fetch registration status.'))
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [id])

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading registration status...
      </div>
    )
  }

  if (error || !statusData) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--err)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Registration Record Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error || 'No matching onboarding registration was found for the provided identifier.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/login')} className="btn btn-secondary">
              <ArrowLeft size={16} /> Return to Login
            </button>
            <button onClick={fetchStatus} className="btn">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'DRAFT':
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Clock color="var(--primary)" size={48} />
      case 'APPROVED':
        return <CheckCircle color="var(--ok)" size={48} />
      case 'REJECTED':
        return <XCircle color="var(--accent)" size={48} />
      case 'ACTION_REQUIRED':
        return <AlertTriangle color="var(--warn)" size={48} />
      default:
        return <Clock color="var(--text-muted)" size={48} />
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          {getStatusIcon(statusData.status)}
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Registration {statusData.status}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', fontFamily: 'monospace' }}>
          Registration ID: {statusData.registrationId}
        </p>

        {statusData.actionRequiredComment && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warn)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <strong style={{ color: 'var(--warn)', display: 'block', marginBottom: '0.25rem' }}>Action Required:</strong>
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>{statusData.actionRequiredComment}</span>
          </div>
        )}

        {statusData.rejectionReason && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>Rejection Reason:</strong>
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>{statusData.rejectionReason}</span>
          </div>
        )}

        {statusData.status === 'APPROVED' && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--ok)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <strong style={{ color: 'var(--ok)', display: 'block', marginBottom: '0.25rem' }}>Approval Confirmed:</strong>
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>Your organization source account has been approved. You can now log in with your verified credentials.</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" className="btn btn-secondary">
            <ArrowLeft size={18} /> Go to Login
          </Link>
          {(statusData.status === 'DRAFT' || statusData.status === 'ACTION_REQUIRED') && (
            <Link to={`/portal/registrations/${statusData.registrationId}`} className="btn">
              Continue Editing
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
