import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { sourceApi, Registration } from '../api/sourceApi'
import { Eye, UserPlus } from 'lucide-react'

export default function ReviewerRegistrationQueuePage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchRegistrations(filter)
  }, [filter])

  const fetchRegistrations = (status: string) => {
    setLoading(true)
    sourceApi.getReviewerRegistrations(status || undefined)
      .then(res => setRegistrations(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleAssign = async (id: string) => {
    try {
      await sourceApi.assignReviewer(id)
      fetchRegistrations(filter)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="page-header flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Registration Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review incoming source onboarding requests</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '200px' }}>
          <option value="">All Active</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACTION_REQUIRED">Action Required</option>
        </select>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Bucket</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Submitted At</th>
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
                <td style={{ padding: '1rem' }}>{reg.sourceType}</td>
                <td style={{ padding: '1rem' }}>{reg.sourceBucket}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: reg.status === 'SUBMITTED' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: reg.status === 'SUBMITTED' ? '#a5b4fc' : '#fff'
                  }}>
                    {reg.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(reg.submittedAt || reg.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {!reg.assignedReviewerId && reg.status === 'SUBMITTED' && (
                    <button onClick={() => handleAssign(reg.registrationId)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                      <UserPlus size={16} /> Assign to me
                    </button>
                  )}
                  <Link to={`/admin/reviewer-queue/${reg.registrationId}`} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
                    <Eye size={16} /> Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
