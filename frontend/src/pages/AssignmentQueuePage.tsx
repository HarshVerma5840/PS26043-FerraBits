import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, Assignment } from '../api/evaluationApi'
import { ExternalLink, AlertTriangle } from 'lucide-react'

export default function AssignmentQueuePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    evaluationApi.getAssignments(filter || undefined)
      .then(res => setAssignments(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [filter])

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
                  {a.deadlineAt ? (
                    <span style={{ color: new Date(a.deadlineAt) < new Date() ? 'var(--accent)' : 'inherit' }}>
                      {new Date(a.deadlineAt).toLocaleDateString()}
                    </span>
                  ) : '-'}
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
