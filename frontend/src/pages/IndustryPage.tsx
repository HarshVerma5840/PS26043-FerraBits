import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { industryApi } from '../api/industryApi'
import { Building2, IndianRupee, Lightbulb, Link as LinkIcon } from 'lucide-react'

export default function IndustryPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: orgs, isLoading: loadingOrgs } = useQuery({
    queryKey: ['industry-orgs'],
    queryFn: () => industryApi.getOrganizations()
  })

  const { data: participants, isLoading: loadingParts } = useQuery({
    queryKey: ['industry-participants', projectId],
    queryFn: () => industryApi.getProjectParticipants(projectId!)
  })

  const { data: funding, isLoading: loadingFund } = useQuery({
    queryKey: ['industry-funding', projectId],
    queryFn: () => industryApi.getProjectFunding(projectId!)
  })

  const { data: mentorship, isLoading: loadingMentors } = useQuery({
    queryKey: ['industry-mentorship', projectId],
    queryFn: () => industryApi.getProjectMentorship(projectId!)
  })

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Building2 size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Industry Integration</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sponsorships, funding, and mentorship tracking</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={18} /> Active Participants
          </h3>
          {loadingParts ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {participants?.map((p: any) => (
                <div key={p.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 500 }}>{p.name || p.organizationName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role: {p.role}</div>
                </div>
              ))}
              {(!participants || participants.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No participants mapped.</div>}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={18} /> Funding Grants
          </h3>
          {loadingFund ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {funding?.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ok)' }}>{f.currency} {f.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: {f.status}</div>
                  </div>
                </div>
              ))}
              {(!funding || funding.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No funding records.</div>}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={18} /> Mentorship
          </h3>
          {loadingMentors ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mentorship?.map(m => (
                <div key={m.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 500 }}>Mentor ID: {m.mentorId}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scope: {m.scope}</div>
                </div>
              ))}
              {(!mentorship || mentorship.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No active mentorships.</div>}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Registered Organizations</h3>
          {loadingOrgs ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {orgs?.map(o => (
                <span key={o.id} className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{o.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
