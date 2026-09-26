import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { evaluationApi, AssignmentDetail, ScoreSubmission } from '../api/evaluationApi'
import { ArrowLeft, Send } from 'lucide-react'

export default function EvaluationSubmissionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [scores, setScores] = useState<Record<string, { score: number | '', comment: string }>>({})
  const [feedback, setFeedback] = useState('')
  const [recommendation, setRecommendation] = useState('')

  useEffect(() => {
    if (id) {
      evaluationApi.getAssignmentDetail(id)
        .then(res => {
          setDetail(res)
          // Pre-populate if already scored
          const initialScores: Record<string, any> = {}
          res.criteria.forEach((c: any) => {
            initialScores[c.criterionId] = {
              score: c.score !== undefined && c.score !== null ? c.score : '',
              comment: c.comment || ''
            }
          })
          setScores(initialScores)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !detail) return

    setSubmitting(true)
    setError(null)
    
    try {
      const submission: ScoreSubmission = {
        scores: Object.entries(scores).map(([criterionId, data]) => ({
          criterionId,
          score: Number(data.score),
          comment: data.comment
        })),
        feedback,
        recommendation
      }

      await evaluationApi.submitEvaluation(id, submission)
      navigate(`/evaluator/assignments/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit evaluation')
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error && !detail) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>
  if (!detail) return null

  const isReadonly = detail.assignment.status === 'SUBMITTED' || detail.assignment.status === 'EXPIRED'

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/evaluator/assignments/${id}`)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Details
      </button>

      <div className="page-header">
        <h1 className="page-title">Evaluate Problem</h1>
        <p style={{ color: 'var(--text-muted)' }}>ID: {detail.assignment.problemId}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        {error && <div style={{ color: 'var(--accent)', background: 'rgba(244,63,94,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Scoring Criteria</h3>
        
        <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
          {detail.criteria.map((c: any) => (
            <div key={c.criterionId} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{c.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.description}</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score (Max {c.maxScore})</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={c.maxScore} 
                    required 
                    disabled={isReadonly}
                    value={scores[c.criterionId]?.score}
                    onChange={e => setScores(prev => ({ ...prev, [c.criterionId]: { ...prev[c.criterionId], score: e.target.value } }))}
                    style={{ width: '80px', fontSize: '1.2rem', padding: '0.5rem' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Comment (Optional)</label>
                <textarea 
                  rows={2}
                  disabled={isReadonly}
                  value={scores[c.criterionId]?.comment}
                  onChange={e => setScores(prev => ({ ...prev, [c.criterionId]: { ...prev[c.criterionId], comment: e.target.value } }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Overall Feedback (Optional)</label>
          <textarea 
            rows={4}
            disabled={isReadonly}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Recommendation (Optional)</label>
          <input 
            type="text"
            disabled={isReadonly}
            value={recommendation}
            onChange={e => setRecommendation(e.target.value)}
            placeholder="e.g. Prioritize for pilot"
            style={{ width: '100%' }}
          />
        </div>

        {!isReadonly && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <button type="submit" disabled={submitting} className="btn" style={{ background: 'var(--secondary)' }}>
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
