import React, { useEffect, useState } from 'react'
import { projectApi } from '../../api/projectApi'
import { Clock, CheckSquare, Rocket, FlaskConical } from 'lucide-react'

interface Props {
  projectId: string
}

interface ActivityItem {
  id: string
  type: 'MILESTONE' | 'TASK' | 'FIELD_TEST' | 'DEPLOYMENT'
  label: string
  sub?: string
  timestamp?: string
  icon: React.ReactNode
}

export default function ProjectActivityPanel({ projectId }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetches = [
      projectApi.getProjectMilestones(projectId)
        .then(ms => ms.map((m: any): ActivityItem => ({
          id: m.id || m.milestoneId,
          type: 'MILESTONE',
          label: m.title || m.name || 'Milestone',
          sub: m.status,
          timestamp: m.dueDate || m.createdAt,
          icon: <CheckSquare size={14} color="#3b82f6" />
        }))).catch(() => [] as ActivityItem[]),
      projectApi.getFieldTests(projectId)
        .then(ts => ts.map((t: any): ActivityItem => ({
          id: t.id || t.testId,
          type: 'FIELD_TEST',
          label: t.name || t.testType || 'Field Test',
          sub: t.result || t.status,
          timestamp: t.conductedAt || t.createdAt,
          icon: <FlaskConical size={14} color="#f59e0b" />
        }))).catch(() => [] as ActivityItem[]),
      projectApi.getDeployments(projectId)
        .then(ds => ds.map((d: any): ActivityItem => ({
          id: d.id || d.deploymentId,
          type: 'DEPLOYMENT',
          label: d.environment || 'Deployment',
          sub: d.status,
          timestamp: d.deployedAt || d.createdAt,
          icon: <Rocket size={14} color="#10b981" />
        }))).catch(() => [] as ActivityItem[]),
    ]

    Promise.all(fetches).then(results => {
      const all = results.flat().sort((a, b) => {
        if (!a.timestamp) return 1
        if (!b.timestamp) return -1
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
      setItems(all)
    }).finally(() => setLoading(false))
  }, [projectId])

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} color="var(--primary)" /> Activity Timeline
      </h3>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
          No activity recorded yet. Create milestones or run field tests to see activity here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Timeline line */}
              {i < items.length - 1 && (
                <div style={{ position: 'absolute', left: '6px', top: '20px', bottom: 0, width: '2px', background: 'var(--glass-border)' }} />
              )}
              {/* Dot */}
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--glass-border)', border: '2px solid var(--panel-bg)', flexShrink: 0, marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                {item.icon}
              </div>
              <div style={{ paddingBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
                {item.sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sub}</div>}
                {item.timestamp && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
