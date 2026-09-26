import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { evaluationApi, AssignmentDetail } from '../api/evaluationApi'
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react'

export default function AssignmentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)

  useEffect(() => {
    if (id) {
      evaluationApi.getAssignmentDetail(id)
        .then(res => setDetail(res))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleAccept = async () => {
    if (!id) return
    try {
      await evaluationApi.acceptAssignment(id)
      const fresh = await evaluationApi.getAssignmentDetail(id)
      setDetail(fresh)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDecline = async () => {
    if (!id) return
    try {
      await evaluationApi.declineAssignment(id, declineReason)
      navigate('/evaluator/assignments')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error || !detail) return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Not found'}</div>

  const { assignment, problem, advisoryProfile } = detail

  return (
    <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/evaluator/assignments')} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {problem ? problem.title : 'Problem details unavailable'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
              <span>Problem ID: <span style={{ fontFamily: 'monospace' }}>{assignment.problemId.substring(0,8)}</span></span>
              <span>Assignment ID: <span style={{ fontFamily: 'monospace' }}>{assignment.assignmentId.substring(0,8)}</span></span>
            </div>
            {assignment.isStale && (
              <div style={{ marginTop: '0.5rem', color: 'orange', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={16} /> Problem was updated after this assignment was created
              </div>
            )}
          </div>
          <div>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '0.9rem' }}>
              {assignment.status}
            </span>
          </div>
        </div>

        {problem && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{problem.description}</p>
          </div>
        )}

        {advisoryProfile && (
          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Advisory AI Profile</h3>
            <p style={{ fontSize: '0.9rem' }}>{JSON.stringify(advisoryProfile)}</p>
            <em style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Context only — must never influence the score.</em>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {assignment.status === 'ASSIGNED' && (
            <>
              <button onClick={handleAccept} className="btn" style={{ background: 'var(--secondary)' }}>
                <Check size={18} /> Accept Assignment
              </button>
              <button onClick={() => setShowDecline(!showDecline)} className="btn btn-secondary">
                <X size={18} /> Decline
              </button>
            </>
          )}

          {assignment.status === 'IN_PROGRESS' && (
            <>
              <Link to={`/evaluator/assignments/${assignment.assignmentId}/score`} className="btn">
                Score Assignment
              </Link>
              <button onClick={() => setShowDecline(!showDecline)} className="btn btn-secondary">
                <X size={18} /> Decline
              </button>
            </>
          )}

          {assignment.status === 'SUBMITTED' && (
            <Link to={`/evaluator/assignments/${assignment.assignmentId}/score`} className="btn btn-secondary">
              View Submitted Scorecard
            </Link>
          )}
        </div>

        {showDecline && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>Decline Assignment</h4>
            <textarea 
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional, e.g. conflict of interest)..."
              rows={3}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDecline(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDecline} className="btn" style={{ background: 'var(--accent)' }}>Confirm Decline</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
