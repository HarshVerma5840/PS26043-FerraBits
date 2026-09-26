import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, Assignment } from '../api/evaluationApi'
import { History, ExternalLink } from 'lucide-react'

export default function EvaluationHistoryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    evaluationApi.getAssignments('SUBMITTED')
      .then(res => setAssignments(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
              <th style={{ padding: '1rem' }}>Problem ID</th>
              <th style={{ padding: '1rem' }}>Assigned</th>
              <th style={{ padding: '1rem' }}>Completed</th>
              <th style={{ padding: '1rem' }}>Total Score</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No history found.</td></tr>
            ) : assignments.map(a => (
              <tr key={a.assignmentId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{a.assignmentId.substring(0,8)}...</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{a.problemId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>{new Date(a.assignedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{a.completedAt ? new Date(a.completedAt).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{a.totalScore !== undefined ? a.totalScore : '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/evaluator/assignments/${a.assignmentId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    View <ExternalLink size={14} />
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
