import React from 'react'
import { Project } from '../../types'
import { Activity, CheckCircle2, PauseCircle } from 'lucide-react'

interface Props {
  project: Project
}

function StatusRow({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: highlight }}>{value}</span>
    </div>
  )
}

export default function ProjectStatusPanel({ project }: Props) {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    ACTIVE:    { icon: <CheckCircle2 size={20} />, color: '#10b981', label: 'Active' },
    COMPLETED: { icon: <CheckCircle2 size={20} />, color: '#3b82f6', label: 'Completed' },
    SUSPENDED: { icon: <PauseCircle size={20} />, color: '#f59e0b', label: 'Suspended' },
  }
  const s = statusConfig[project.status] ?? { icon: <Activity size={20} />, color: 'var(--text-muted)', label: project.status }

  const duration = project.createdAt
    ? Math.floor((Date.now() - new Date(project.createdAt).getTime()) / 86400000)
    : null

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={18} color="var(--primary)" /> Project Status
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <span style={{ color: s.color }}>{s.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{s.label}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current status</div>
        </div>
      </div>

      <div>
        <StatusRow label="Project ID" value={(project.projectId || project.id).substring(0, 8) + '...'} />
        <StatusRow label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
        {project.updatedAt && (
          <StatusRow label="Last Updated" value={new Date(project.updatedAt).toLocaleDateString()} />
        )}
        {duration !== null && (
          <StatusRow label="Duration" value={`${duration} day${duration !== 1 ? 's' : ''}`} highlight={duration > 90 ? '#f59e0b' : undefined} />
        )}
      </div>
    </div>
  )
}
