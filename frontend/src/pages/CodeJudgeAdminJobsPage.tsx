import React, { useEffect, useState } from 'react'
import { codejudgeApi, CodeJudgeJob } from '../api/codejudgeApi'
import { Server, Play, Clock, AlertTriangle } from 'lucide-react'

export default function CodeJudgeAdminJobsPage() {
  const [jobs, setJobs] = useState<CodeJudgeJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    codejudgeApi.getAdminJobs(status || undefined)
      .then(res => setJobs(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Server size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">CodeJudge Worker Jobs</h1>
            <p style={{ color: 'var(--text-muted)' }}>Background pipeline execution queue</p>
          </div>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Jobs</option>
          <option value="QUEUED">Queued</option>
          <option value="CLAIMED">Claimed</option>
          <option value="DONE">Done</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Job ID</th>
              <th style={{ padding: '1rem' }}>Evaluation ID</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Priority</th>
              <th style={{ padding: '1rem' }}>Created</th>
              <th style={{ padding: '1rem' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No jobs found.</td></tr>
            ) : jobs.map(job => (
              <tr key={job.jobId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{job.jobId.substring(0,8)}...</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{job.evaluationId.substring(0,8)}...</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem',
                    background: job.status === 'FAILED' ? 'rgba(244, 63, 94, 0.1)' : 
                               job.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 
                               job.status === 'CLAIMED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: job.status === 'FAILED' ? '#f43f5e' : 
                           job.status === 'DONE' ? '#10b981' : 
                           job.status === 'CLAIMED' ? '#3b82f6' : 'inherit'
                  }}>
                    {job.status === 'CLAIMED' && <Play size={10} style={{ marginRight: '4px', display: 'inline' }} />}
                    {job.status === 'QUEUED' && <Clock size={10} style={{ marginRight: '4px', display: 'inline' }} />}
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{job.priority}</td>
                <td style={{ padding: '1rem' }}>{new Date(job.createdAt).toLocaleString()}</td>
                <td style={{ padding: '1rem', color: 'var(--accent)', fontSize: '0.85rem' }}>
                  {job.error ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ wordBreak: 'break-all' }}>{job.error}</span>
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
