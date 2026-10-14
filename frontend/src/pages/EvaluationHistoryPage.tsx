import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, Assignment } from '../api/evaluationApi'
import { useAuth } from '../auth/AuthContext'
import { History, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react'

export default function EvaluationHistoryPage() {
  const { user } = useAuth()
  const isEvaluator = user?.role === 'EVALUATOR'

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(isEvaluator)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEvaluator) return
    setLoading(true)
    evaluationApi.getAssignments('SUBMITTED')
      .then(res => setAssignments(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isEvaluator])

  if (!isEvaluator) {
    return (
      <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <History size={32} color="var(--accent)" />
          <div>
            <h1 className="page-title">Evaluation History</h1>
            <p style={{ color: 'var(--text-muted)' }}>Completed and submitted scorecards</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            color: '#93c5fd'
          }}>
            <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Administrative Observer Mode</div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Personal evaluation history tracks completed scorecards for individual evaluators. To review completed cycles, aggregation reports, and audit history across the entire system, access the Admin Evaluation Dashboard.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/admin/evaluation/queue" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Open Master Evaluation Queue <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <History size={32} color="var(--accent)" />
        <div>
          <h1 className="page-title">Evaluation History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Your completed and submitted scorecards</p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Assignment ID</th>
              <th style={{ padding: '1rem' }}>Problem</th>
              <th style={{ padding: '1rem' }}>Assigned</th>
              <th style={{ padding: '1rem' }}>Completed</th>
              <th style={{ padding: '1rem' }}>Total Score</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No history found.</td></tr>
            ) : assignments.map(a => {
              const completedDate = a.submittedAt || a.completedAt
              return (
                <tr key={a.assignmentId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{a.assignmentId.substring(0,8)}...</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{a.problemTitle || `${a.problemId.substring(0,8)}...`}</div>
                    {a.problemTitle && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {a.problemId.substring(0,8)}...
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{completedDate ? new Date(completedDate).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{a.totalScore !== undefined ? a.totalScore : '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link to={`/evaluator/assignments/${a.assignmentId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                      View <ExternalLink size={14} />
                    </Link>
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
