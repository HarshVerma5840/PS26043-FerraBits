import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { CheckCircle2, Clock, MapPin, Package } from 'lucide-react'
import MilestoneList from '../components/MilestoneList'
import FieldTestPanel from '../components/FieldTestPanel'
import DeploymentPanel from '../components/DeploymentPanel'

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId!)
  })

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading workspace...</div>
  if (!project) return <div style={{ padding: '2rem' }}>Project not found.</div>

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>Project Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Target Institution</div>
                <div style={{ fontWeight: 600 }}>{project.institutionId}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Problem Statement</div>
                <div style={{ fontWeight: 600 }}>{project.problemId}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              This workspace coordinates the delivery of the approved capability matching solution. Ensure milestones are tracked and team skill gaps are mitigated.
            </p>
          </div>

          <MilestoneList projectId={projectId!} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FieldTestPanel projectId={projectId!} />
          <DeploymentPanel projectId={projectId!} />
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Activity Timeline</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Clock size={16} style={{ color: 'var(--primary)' }} /> <span>Workspace initialized</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--ok)' }} /> <span>Review approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
