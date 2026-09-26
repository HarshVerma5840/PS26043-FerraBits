import React from 'react'
import { Project } from '../../types'
import { GitCommit, Building2, BookOpen } from 'lucide-react'

interface Props {
  project: Project
}

export default function ProjectOriginPanel({ project }: Props) {
  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <GitCommit size={18} color="var(--secondary)" /> Decision Origin
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Origin</span>
          <span style={{ 
            padding: '0.15rem 0.6rem', 
            borderRadius: '999px', 
            fontSize: '0.8rem',
            fontWeight: 600,
            background: project.decisionOrigin === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            color: project.decisionOrigin === 'APPROVED' ? '#10b981' : '#f59e0b'
          }}>
            {project.decisionOrigin ?? 'APPROVED'}
          </span>
        </div>

        {project.matchingRunId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)' }}>Matching Run</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: '180px', wordBreak: 'break-all', textAlign: 'right' }}>
              {project.matchingRunId}
            </span>
          </div>
        )}

        {project.registryVersionId && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Registry Version</span>
            <span style={{ fontWeight: 600 }}>v{project.registryVersionId}</span>
          </div>
        )}

        {project.selectedByActorRole && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Decided By</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{project.selectedByActorRole.toLowerCase()}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <BookOpen size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Problem Statement</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{project.problemId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Building2 size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Assigned Institution</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{project.institutionId}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
