import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { evaluationApi, ProjectReview, ProjectReviewDetail } from '../api/evaluationApi'
import { portalApi } from '../api/portalApi'
import { useAuth } from '../auth/AuthContext'
import { FileText, Download, Check, X, ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react'

export default function ProjectReviewPage() {
  const { user } = useAuth()
  const isEvaluator = user?.role === 'EVALUATOR'

  const [reviews, setReviews] = useState<ProjectReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ProjectReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [decision, setDecision] = useState<'ACCEPTED' | 'RETURNED'>('ACCEPTED')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

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

  const handleDownloadFile = async (fileId: string, fileName?: string) => {
    try {
      setDownloadingId(fileId)
      const name = fileName || `submission-file-${fileId}`
      await portalApi.downloadFile(fileId, name)
      toast.success(`Downloaded ${name}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to download file')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    if (!isEvaluator) {
      toast.error('Evaluator decisions can only be submitted by an evaluator account.')
      return
    }
    setSubmitting(true)
    try {
      await evaluationApi.decideProjectReview(selectedId, decision, comment)
      toast.success(`Project review ${decision.toLowerCase()} successfully`)
      setSelectedId(null)
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit decision')
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedId) {
    const status = detail?.status || detail?.review?.status
    const problemId = detail?.problemId || detail?.review?.problemId
    const submissionId = detail?.submissionId || detail?.review?.submissionId
    const problemTitle = detail?.problemTitle || detail?.problem?.title
    const submissionTitle = detail?.submissionTitle || detail?.submission?.title
    const summary = detail?.summary || detail?.submission?.content || detail?.problem?.summary
    const githubUrl = detail?.githubUrl
    const files = detail?.files || []

    return (
      <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Reviews
        </button>

        {!isEvaluator && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#93c5fd'
          }}>
            <ShieldAlert size={20} />
            <div>
              <strong>Observer Mode:</strong> You are viewing this review as an administrative user. Backend evaluation decisions are strictly reserved for the assigned EVALUATOR.
            </div>
          </div>
        )}

        {detailLoading ? (
          <div>Loading details...</div>
        ) : detail ? (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {submissionTitle || 'Project Submission Review'}
                </h1>
                {problemTitle && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Problem: <strong>{problemTitle}</strong>
                  </p>
                )}
              </div>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: status === 'ASSIGNED' ? 'rgba(79, 70, 229, 0.2)' : status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: status === 'ASSIGNED' ? '#a5b4fc' : status === 'ACCEPTED' ? '#34d399' : '#f87171'
              }}>
                {status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div><strong>Problem ID:</strong> <span style={{ fontFamily: 'monospace', display: 'block' }}>{problemId || '-'}</span></div>
              <div><strong>Submission ID:</strong> <span style={{ fontFamily: 'monospace', display: 'block' }}>{submissionId || '-'}</span></div>
              <div><strong>Round:</strong> <span style={{ display: 'block' }}>Round {detail.round ?? 1}</span></div>
            </div>

            {summary && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Solution Summary</h3>
                <div style={{ whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', color: 'var(--text-light, #e2e8f0)' }}>
                  {summary}
                </div>
              </div>
            )}

            {githubUrl && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Repository</h3>
                <a href={githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ExternalLink size={16} /> Open GitHub Repository
                </a>
              </div>
            )}

            {detail.links && detail.links.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>External Demo & Links</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {detail.links.map((link, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary, #38bdf8)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ExternalLink size={14} /> {link.label || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Attached Files</h3>
              {files.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No files attached to this submission.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {files.map(f => {
                    const fName = f.fileName || f.filename || `file-${f.fileId}`
                    const isDl = downloadingId === f.fileId
                    return (
                      <li key={f.fileId} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{fName}</div>
                          {f.sizeBytes && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {(f.sizeBytes / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(f.fileId, fName)}
                          disabled={isDl}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Download size={14} /> {isDl ? 'Downloading...' : 'Download'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {status === 'ASSIGNED' ? (
              isEvaluator ? (
                <form onSubmit={handleSubmitDecision} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Evaluator Decision</h3>

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input type="radio" name="decision" checked={decision === 'ACCEPTED'} onChange={() => setDecision('ACCEPTED')} />
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={16}/> ACCEPT</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input type="radio" name="decision" checked={decision === 'RETURNED'} onChange={() => setDecision('RETURNED')} />
                      <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={16}/> RETURN for Edits</span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Evaluation Feedback {decision === 'RETURNED' ? <span style={{ color: '#f43f5e' }}>* (Required for returned submissions)</span> : '(Optional)'}
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      required={decision === 'RETURNED'}
                      placeholder={decision === 'RETURNED' ? 'Explain what needs to be fixed before the submission can be accepted...' : 'Optional comment for the submitter...'}
                      style={{ width: '100%', borderRadius: '6px', padding: '0.75rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={submitting} className="btn" style={{ background: decision === 'ACCEPTED' ? 'var(--secondary, #10b981)' : 'var(--accent, #f43f5e)', color: '#fff' }}>
                      {submitting ? 'Saving Decision...' : `Confirm ${decision}`}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', color: 'var(--text-muted)' }}>
                  <em>Decisions can only be submitted by the assigned evaluator. Administrative users are in read-only observation mode.</em>
                </div>
              )
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                <strong>Decision Recorded:</strong> {status} <br/>
                {detail.decisionComment && (
                  <p style={{ marginTop: '0.5rem', marginBottom: 0 }}><strong>Comment:</strong> {detail.decisionComment}</p>
                )}
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

      {!isEvaluator && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#93c5fd'
        }}>
          <ShieldAlert size={18} />
          <span>
            <strong>Observer Mode:</strong> Viewing project reviews queue with administrative privileges. Decision mutations are restricted to EVALUATOR accounts.
          </span>
        </div>
      )}

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Review ID</th>
              <th style={{ padding: '1rem' }}>Problem / Submission</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Received</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No project reviews found.</td></tr>
            ) : reviews.map(r => {
              const displayDate = r.createdAt || r.assignedAt
              return (
                <tr key={r.projectReviewId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{r.projectReviewId.substring(0,8)}...</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{r.submissionTitle || r.problemTitle || 'Solution Submission'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Problem: {r.problemTitle ? `${r.problemTitle} (${r.problemId.substring(0,8)}...)` : r.problemId.substring(0,8) + '...'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      background: r.status === 'ASSIGNED' ? 'rgba(79, 70, 229, 0.2)' : r.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      color: r.status === 'ASSIGNED' ? '#a5b4fc' : r.status === 'ACCEPTED' ? '#34d399' : '#f87171'
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{displayDate ? new Date(displayDate).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setSelectedId(r.projectReviewId)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                      Review
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
