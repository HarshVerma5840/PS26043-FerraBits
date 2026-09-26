import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { List, ExternalLink } from 'lucide-react'

export default function EvaluationQueuePage() {
  const [cycles, setCycles] = useState<EvaluationCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    evaluationAdminApi.getQueue({ status: status || undefined, size: 50 })
      .then(res => setCycles(res.content))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <List size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">Evaluation Queue</h1>
            <p style={{ color: 'var(--text-muted)' }}>All problems undergoing evaluation</p>
          </div>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="ROUTING">Routing</option>
          <option value="EVALUATION_IN_PROGRESS">In Progress</option>
          <option value="EVALUATION_COMPLETED">Evaluation Completed</option>
          <option value="SCORES_AGGREGATED">Scores Aggregated</option>
          <option value="PRIORITIZED">Prioritized</option>
          <option value="PHASE_3_READY">Phase 3 Ready</option>
        </select>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Cycle ID</th>
              <th style={{ padding: '1rem' }}>Problem ID</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Started</th>
              <th style={{ padding: '1rem' }}>Final Score</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : cycles.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No cycles found.</td></tr>
            ) : cycles.map(c => (
              <tr key={c.cycleId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{c.cycleId.substring(0,8)}...</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{c.problemId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(c.startedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  {c.finalScore !== undefined && c.finalScore !== null ? (
                    <strong>{c.finalScore.toFixed(2)}</strong>
                  ) : '-'}
                  {c.priorityBand && <span style={{ marginLeft: '0.5rem', color: 'var(--secondary)' }}>({c.priorityBand})</span>}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/admin/evaluation/cycles/${c.cycleId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    Pipeline <ExternalLink size={14} />
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
