import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, Assignment } from '../api/evaluationApi'
import { useAuth } from '../auth/AuthContext'
import { ExternalLink, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react'

export default function AssignmentQueuePage() {
  const { user } = useAuth()
  const isEvaluator = user?.role === 'EVALUATOR'

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(isEvaluator)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    if (!isEvaluator) return
    setLoading(true)
    evaluationApi.getAssignments(filter || undefined)
      .then(res => setAssignments(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [filter, isEvaluator])

  if (!isEvaluator) {
    return (
      <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="page-header">
          <h1 className="page-title">Assignment Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Problems assigned to you for scoring</p>
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
                Personal assignment queues are reserved for domain evaluators assigned to specific problems. As an administrator, you manage and monitor all evaluation cycles via the master evaluation queue.
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Assignment Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Problems assigned to you for scoring</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Assignments</option>
          <option value="ASSIGNED">Assigned (New)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="EXPIRED">Expired</option>
          <option value="DECLINED">Declined</option>
        </select>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Assignment ID</th>
              <th style={{ padding: '1rem' }}>Problem ID</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Assigned</th>
              <th style={{ padding: '1rem' }}>Deadline</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No assignments found.</td></tr>
            ) : assignments.map(a => (
              <tr key={a.assignmentId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{a.assignmentId.substring(0,8)}...</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{a.problemId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: a.status === 'ASSIGNED' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: a.status === 'ASSIGNED' ? '#a5b4fc' : '#fff'
                  }}>
                    {a.status}
                  </span>
                  {a.isStale && <span title="Problem has been updated since assignment"><AlertTriangle size={14} color="orange" style={{ marginLeft: '0.5rem', display: 'inline' }} /></span>}
                </td>
                <td style={{ padding: '1rem' }}>{new Date(a.assignedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  {(() => {
                    const dl = a.deadline || a.deadlineAt
                    if (!dl) return '-'
                    const isOverdue = a.overdue || new Date(dl) < new Date()
                    return (
                      <span style={{ color: isOverdue ? 'var(--accent)' : 'inherit', fontWeight: isOverdue ? 600 : 'normal' }}>
                        {new Date(dl).toLocaleDateString()}
                      </span>
                    )
                  })()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/evaluator/assignments/${a.assignmentId}`} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
                    View &amp; Score <ExternalLink size={14} />
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
