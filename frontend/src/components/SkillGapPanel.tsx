import { useQuery } from '@tanstack/react-query'
import { teamApi } from '../api/teamApi'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function SkillGapPanel({ projectId }: { projectId: string }) {
  const { data: skillGaps, isLoading } = useQuery({
    queryKey: ['skill-gaps', projectId],
    queryFn: () => teamApi.getSkillGaps(projectId)
  })

  if (isLoading) return <div style={{ color: 'var(--text-muted)' }}>Analyzing skills...</div>
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ok)', fontWeight: 600 }}>
          <ShieldCheck size={18} /> No Skill Gaps Detected
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>The team currently has all the required capabilities.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warn)' }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warn)' }}>
        <AlertTriangle size={18} /> Skill Gaps Detected
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {skillGaps.map((gap, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500 }}>{gap.skill}</span>
            <span style={{ color: 'var(--text-muted)' }}>Required: {gap.requiredLevel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
