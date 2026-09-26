import React, { useState } from 'react'
import { X, UserCog, AlertTriangle } from 'lucide-react'
import { TeamMember } from '../../types'

interface Props {
  member: TeamMember
  onClose: () => void
  onSave: (role: string) => void
  loading?: boolean
}

const ROLES = [
  { value: 'LEAD', label: 'Team Lead', desc: 'Primary owner; accountable for delivery and coordination' },
  { value: 'STUDENT_MEMBER', label: 'Student Member', desc: 'Core team member working on the solution' },
  { value: 'FACULTY_MENTOR', label: 'Faculty Mentor', desc: 'Academic guide from the affiliated institution' },
  { value: 'INDUSTRY_MENTOR', label: 'Industry Mentor', desc: 'Domain expert from industry partnership' },
]

export default function RoleAssignmentDialog({ member, onClose, onSave, loading }: Props) {
  const [role, setRole] = useState(member.role)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCog size={20} color="var(--primary)" /> Assign Role
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600 }}>{member.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current role: {member.role}</div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#f59e0b', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>Role assignments are local — the portal-service has no role-change endpoint. Roles set here are stored locally for display only until a backend endpoint is added.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {ROLES.map(r => (
            <label key={r.value} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', padding: '0.85rem', borderRadius: '8px', border: `1px solid ${role === r.value ? 'var(--primary)' : 'var(--glass-border)'}`, background: role === r.value ? 'rgba(79,70,229,0.08)' : 'transparent' }}>
              <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" style={{ background: 'var(--primary)' }} onClick={() => onSave(role)} disabled={loading || role === member.role}>
            {loading ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  )
}
