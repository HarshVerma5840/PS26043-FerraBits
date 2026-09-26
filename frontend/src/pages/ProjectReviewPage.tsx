import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { evaluationApi, ProjectReview, ProjectReviewDetail } from '../api/evaluationApi'
import { FileText, Download, Check, X, ArrowLeft } from 'lucide-react'

export default function ProjectReviewPage() {
  const [reviews, setReviews] = useState<ProjectReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ProjectReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [decision, setDecision] = useState<'ACCEPTED' | 'RETURNED'>('ACCEPTED')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = () => {
    setLoading(true)
    evaluationApi.getProjectReviews()
      .then(res => setReviews(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (selectedId) {
      setDetailLoading(true)
      evaluationApi.getProjectReviewDetail(selectedId)
        .then(res => setDetail(res))
        .catch(err => toast.error(err.message))
        .finally(() => setDetailLoading(false))
    } else {
      setDetail(null)
    }
  }, [selectedId])

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    try {
      await evaluationApi.decideProjectReview(selectedId, decision, comment)
      setSelectedId(null)
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedId) {
    return (
      <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Reviews
        </button>

        {detailLoading ? (
          <div>Loading details...</div>
        ) : detail ? (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Project Submission Review
            </h1>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div><strong>Problem ID:</strong> <span style={{ fontFamily: 'monospace' }}>{detail.review.problemId}</span></div>
              <div><strong>Submission ID:</strong> <span style={{ fontFamily: 'monospace' }}>{detail.review.submissionId}</span></div>
              <div><strong>Status:</strong> {detail.review.status}</div>
            </div>

            {detail.problem && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Problem Summary</h3>
                <p style={{ color: 'var(--text-muted)' }}>{detail.problem.summary || detail.problem.title}</p>
              </div>
            )}

            {detail.submission && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Submission Details</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{detail.submission.content}</p>
              </div>
            )}

            {detail.files && detail.files.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Attached Files</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {detail.files.map((f: any) => (
                    <li key={f.fileId} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{f.filename}</span>
                      <a href={`/portal/files/${f.fileId}/download`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>
                        <Download size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail.review.status === 'ASSIGNED' ? (
              <form onSubmit={handleSubmitDecision} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Decision</h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="decision" checked={decision === 'ACCEPTED'} onChange={() => setDecision('ACCEPTED')} />
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={16}/> ACCEPT</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="decision" checked={decision === 'RETURNED'} onChange={() => setDecision('RETURNED')} />
                    <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={16}/> RETURN for Edits</span>
                  </label>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Comment {decision === 'RETURNED' && '*'}</label>
                  <textarea 
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required={decision === 'RETURNED'}
                    placeholder={decision === 'RETURNED' ? 'Explain what needs to be fixed...' : 'Optional comment...'}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={submitting} className="btn" style={{ background: decision === 'ACCEPTED' ? 'var(--secondary)' : 'var(--accent)' }}>
                    {submitting ? 'Saving...' : `Confirm ${decision}`}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <strong>Decision:</strong> {detail.review.decision} <br/>
                <strong>Comment:</strong> {detail.review.decisionComment}
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FileText size={32} color="#8b5cf6" />
        <div>
          <h1 className="page-title">Project Reviews</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review submitted solutions for your scored problems</p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Review ID</th>
              <th style={{ padding: '1rem' }}>Problem ID</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Assigned</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No project reviews found.</td></tr>
            ) : reviews.map(r => (
              <tr key={r.projectReviewId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{r.projectReviewId.substring(0,8)}...</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{r.problemId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: r.status === 'ASSIGNED' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: r.status === 'ASSIGNED' ? '#a5b4fc' : '#fff'
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(r.assignedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setSelectedId(r.projectReviewId)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
