import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { sourceApi, Registration, RegistrationHistoryResponse } from '../api/sourceApi'
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react'

export default function RegistrationReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reg, setReg] = useState<Registration | null>(null)
  const [history, setHistory] = useState<RegistrationHistoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      sourceApi.getRegistration(id),
      sourceApi.getRegistrationHistory(id).catch(() => []) // might fail if not owner/admin, but we are admin/reviewer
    ]).then(([regData, histData]) => {
      setReg(regData)
      setHistory(histData)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action: 'approve' | 'reject' | 'request-action') => {
    if ((action === 'reject' || action === 'request-action') && !comment.trim()) {
      toast.error('A comment/reason is required for this action.')
      return
    }
    setActionLoading(true)
    try {
      if (action === 'approve') await sourceApi.approveRegistration(id!, comment || undefined)
      else if (action === 'reject') await sourceApi.rejectRegistration(id!, comment)
      else if (action === 'request-action') await sourceApi.requestAction(id!, comment)
      
      navigate('/admin/reviewer-queue')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!reg) return <div>Not found</div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin/reviewer-queue')} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Review Registration</h2>
            <p style={{ color: 'var(--text-muted)' }}>ID: {reg.registrationId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '0.9rem' }}>
              {reg.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Source Info</h3>
            <p><strong>Type:</strong> {reg.sourceType}</p>
            <p><strong>Bucket:</strong> {reg.sourceBucket}</p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.9rem' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(reg.source, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Timeline</h3>
            <ul style={{ listStyle: 'none' }}>
              {history.map((h, _i) => (
                <li key={h.historyId} style={{ marginBottom: '1rem', borderLeft: '2px solid var(--glass-border)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleString()}</div>
                  <div><strong>{h.status}</strong></div>
                  {h.comment && <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>"{h.comment}"</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {['SUBMITTED', 'UNDER_REVIEW'].includes(reg.status) && (
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Make Decision</h3>
            <textarea 
              placeholder="Add comment (required for reject/request action)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleAction('approve')} disabled={actionLoading} className="btn" style={{ background: 'var(--secondary)' }}>
                <Check size={18} /> Approve
              </button>
              <button onClick={() => handleAction('request-action')} disabled={actionLoading} className="btn btn-secondary" style={{ color: 'orange', borderColor: 'orange' }}>
                <AlertCircle size={18} /> Request Action
              </button>
              <button onClick={() => handleAction('reject')} disabled={actionLoading} className="btn btn-secondary" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                <X size={18} /> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
