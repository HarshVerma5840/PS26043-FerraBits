import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { Project } from '../types'
import ProjectOriginPanel from '../components/project/ProjectOriginPanel'
import ProjectStatusPanel from '../components/project/ProjectStatusPanel'
import ProjectActivityPanel from '../components/project/ProjectActivityPanel'
import MilestoneList from '../components/MilestoneList'
import FieldTestPanel from '../components/FieldTestPanel'
import DeploymentPanel from '../components/DeploymentPanel'
import { Briefcase } from 'lucide-react'

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      projectApi.getProjectById(projectId)
        .then(setProject)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [projectId])

  if (loading) return <div style={{ padding: '2rem' }}>Loading workspace...</div>
  if (error || !project) return (
    <div style={{ padding: '2rem' }}>
      <div style={{ color: '#f43f5e' }}>{error || 'Project not found.'}</div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Briefcase size={28} color="var(--primary)" style={{ marginTop: '2px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{project.name}</h1>
            {project.description && (
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>{project.description}</p>
            )}
          </div>
        </div>
        <span style={{ 
          padding: '0.35rem 1rem', 
          borderRadius: '999px', 
          fontWeight: 600, 
          fontSize: '0.9rem',
          background: project.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.08)',
          color: project.status === 'ACTIVE' ? '#10b981' : 'var(--text-muted)'
        }}>
          {project.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <MilestoneList projectId={projectId!} />
          <FieldTestPanel projectId={projectId!} />
          <DeploymentPanel projectId={projectId!} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ProjectStatusPanel project={project} />
          <ProjectOriginPanel project={project} />
          <ProjectActivityPanel projectId={projectId!} />
        </div>
      </div>
    </div>
  )
}
