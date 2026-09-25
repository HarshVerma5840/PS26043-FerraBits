import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { Briefcase, ArrowRight } from 'lucide-react'

export default function ProjectListPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects()
  })

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Briefcase size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Active Projects</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage approved capability matching implementations</p>
        </div>
      </header>

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {projects?.map((proj) => (
            <div key={proj.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{proj.problemId} Project</h3>
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--ok)' }}>
                  {proj.status}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                Institution: {proj.institutionId} <br/>
                Created: {new Date(proj.createdAt).toLocaleDateString()}
              </div>
              <Link to={`/projects/${proj.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Enter Workspace <ArrowRight size={16} />
              </Link>
            </div>
          ))}
          
          {(!projects || projects.length === 0) && (
            <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              No active projects found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
