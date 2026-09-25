import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { teamApi } from '../api/teamApi'
import { Users, User, Shield } from 'lucide-react'
import SkillGapPanel from '../components/SkillGapPanel'

export default function TeamBuilder() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', projectId],
    queryFn: () => teamApi.getTeamMembers(projectId!)
  })

  // We can sort them here or assume backend ordered them.
  const sortedTeam = team ? [...team].sort((a, b) => {
    if (a.role === 'LEAD') return -1;
    if (b.role === 'LEAD') return 1;
    return 0;
  }) : []

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Users size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Team Assembly</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage project members and evaluate capabilities</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {isLoading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading team...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedTeam.map((member) => (
                <div key={member.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} color={member.role === 'LEAD' ? 'var(--primary)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0' }}>{member.name}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{member.skills?.join(', ')}</div>
                    </div>
                  </div>
                  <span className="badge" style={{ 
                    background: member.role === 'LEAD' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: member.role === 'LEAD' ? 'var(--primary)' : '#fff',
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}>
                    {member.role === 'LEAD' && <Shield size={12} />} {member.role}
                  </span>
                </div>
              ))}
              
              {sortedTeam.length === 0 && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                  No team members assigned yet.
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <SkillGapPanel projectId={projectId!} />
        </div>
      </div>
    </div>
  )
}
