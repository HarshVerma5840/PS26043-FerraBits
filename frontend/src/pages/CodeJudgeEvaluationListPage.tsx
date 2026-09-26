import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { codejudgeApi, CodeJudgeEvaluation } from '../api/codejudgeApi'
import { Code, ExternalLink } from 'lucide-react'

export default function CodeJudgeEvaluationListPage() {
  const [evaluations, setEvaluations] = useState<CodeJudgeEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    codejudgeApi.listEvaluations(status || undefined)
      .then(res => setEvaluations(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Code size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">CodeJudge Evaluations</h1>
            <p style={{ color: 'var(--text-muted)' }}>Deterministic codebase scoring</p>
          </div>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="QUEUED">Queued</option>
          <option value="CLONING">Cloning</option>
          <option value="SCANNING">Scanning</option>
          <option value="SCORING">Scoring</option>
          <option value="REPORT_GENERATION">Report Generation</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Evaluation ID</th>
              <th style={{ padding: '1rem' }}>Repository</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Started</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : evaluations.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No evaluations found.</td></tr>
            ) : evaluations.map(ev => (
              <tr key={ev.evaluationId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{ev.evaluationId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>{ev.repositoryUrl}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>commit: {ev.commitSha.substring(0,8)}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: ev.status === 'FAILED' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: ev.status === 'FAILED' ? 'var(--accent)' : 'inherit'
                  }}>
                    {ev.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{new Date(ev.startedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/portal/codejudge/${ev.evaluationId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
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
