import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sourceApi, RegistrationStatusResponse } from '../api/sourceApi'
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function RegistrationStatusPage() {
  const { id } = useParams()
  const [statusData, setStatusData] = useState<RegistrationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      sourceApi.getRegistrationStatus(id)
        .then(res => setStatusData(res))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!statusData) return <div>Not found</div>

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'DRAFT':
      case 'SUBMITTED':
      case 'UNDER_REVIEW': return <Clock color="var(--primary)" size={48} />
      case 'APPROVED': return <CheckCircle color="var(--secondary)" size={48} />
      case 'REJECTED': return <XCircle color="var(--accent)" size={48} />
      case 'ACTION_REQUIRED': return <AlertTriangle color="orange" size={48} />
      default: return <Clock size={48} />
    }
  }

  return (
    <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          {getStatusIcon(statusData.status)}
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Registration {statusData.status}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Registration ID: {statusData.registrationId}
        </p>

        {statusData.actionRequiredComment && (
          <div style={{ background: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <strong>Action Required:</strong> {statusData.actionRequiredComment}
          </div>
        )}

        {statusData.rejectionReason && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
            <strong>Rejection Reason:</strong> {statusData.rejectionReason}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-secondary">
            <ArrowLeft size={18} /> Go to Login
          </Link>
          {statusData.status === 'DRAFT' || statusData.status === 'ACTION_REQUIRED' ? (
            <Link to={`/portal/registration/${statusData.registrationId}`} className="btn">
              Continue Editing
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
