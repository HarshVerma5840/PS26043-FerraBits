import React, { useState } from 'react'
import { X, UserPlus, AlertTriangle } from 'lucide-react'

interface Props {
  onClose: () => void
  onAdd: (data: { userId: string; role: string }) => void
  loading?: boolean
}

const ROLES = [
  { value: 'STUDENT_MEMBER', label: 'Student Member' },
  { value: 'LEAD', label: 'Team Lead' },
  { value: 'FACULTY_MENTOR', label: 'Faculty Mentor' },
  { value: 'INDUSTRY_MENTOR', label: 'Industry Mentor' },
]

export default function AddMemberDialog({ onClose, onAdd, loading }: Props) {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('STUDENT_MEMBER')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) { setError('User ID is required'); return }
    onAdd({ userId: userId.trim(), role })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--primary)" /> Add Team Member
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#f59e0b', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>Team membership is set at submission creation. This dialog records an intended change for admin action — the backend does not expose a post-creation member-add endpoint.</span>
        </div>

        {error && <div style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID (UUID)</label>
            <input className="input-field" placeholder="e.g. 123e4567-e89b-..." value={userId} onChange={e => setUserId(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Role</label>
            <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !userId.trim()}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
