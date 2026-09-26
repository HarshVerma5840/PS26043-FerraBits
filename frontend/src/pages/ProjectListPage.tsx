import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { Project } from '../types'
import { Briefcase, ArrowRight, Info } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    ACTIVE:     { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    COMPLETED:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    SUSPENDED:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  }
  const s = map[status] ?? { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' }
  return (
    <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: s.color, background: s.bg }}>
      {status}
    </span>
  )
}

function EmptyState() {
  return (
    <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
      <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
      <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No active projects yet</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
        Projects are created automatically when an admin approves or overrides a capability-matching recommendation.
        Visit the <Link to="/admin/reviews" style={{ color: 'var(--primary)' }}>Governance Review Desk</Link> to approve a recommendation.
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Info size={16} /> Projects appear here once a matching run is approved
      </div>
    </div>
  )
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    projectApi.getProjects()
      .then(setProjects)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter ? projects.filter(p => p.status === statusFilter) : projects

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Briefcase size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">Active Projects</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Approved capability matching implementations
            </p>
          </div>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: '160px' }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(proj => (
            <div key={proj.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{proj.name}</h3>
                <StatusBadge status={proj.status} />
              </div>

              {proj.description && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {proj.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Problem</div>
                <div style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {proj.problemId ? proj.problemId.substring(0, 8) + '...' : '—'}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>Institution</div>
                <div style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {proj.institutionId ? proj.institutionId.substring(0, 8) + '...' : '—'}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>Created</div>
                <div>{new Date(proj.createdAt).toLocaleDateString()}</div>
              </div>

              <Link to={`/projects/${proj.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Enter Workspace <ArrowRight size={16} />
              </Link>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState />}
        </div>
      )}
    </div>
  )
}
