import React, { useState } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { TeamMember } from '../../types'

interface Props {
  team: TeamMember[]
  onClose: () => void
  onSave: (mentorUserId: string, scope: string) => void
  loading?: boolean
}

export default function MentorshipDialog({ team, onClose, onSave, loading }: Props) {
  // Only INDUSTRY_MENTOR or FACULTY_MENTOR can be assigned mentorship
  const mentors = team.filter(m => m.role === 'INDUSTRY_MENTOR' || m.role === 'FACULTY_MENTOR')

  const [mentorId, setMentorId] = useState(mentors[0]?.id ?? '')
  const [scope, setScope] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(mentorId, scope)
  }

  if (mentors.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 1rem' }}>No Mentors Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>The project team must have at least one member with the role INDUSTRY_MENTOR or FACULTY_MENTOR to assign a mentorship.</p>
          <button className="btn" onClick={onClose} style={{ margin: '1rem auto 0', background: 'var(--primary)' }}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={20} color="#f59e0b" /> Assign Mentor
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Mentor</label>
            <select className="input-field" value={mentorId} onChange={e => setMentorId(e.target.value)}>
              {mentors.map(m => <option key={m.id} value={m.userId || m.id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Scope of Guidance</label>
            <input className="input-field" required value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. Architecture review, domain expertise" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !scope.trim()}>
              {loading ? 'Assigning...' : 'Assign Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
