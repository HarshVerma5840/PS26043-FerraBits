import React from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { TeamMember } from '../../types'

interface Props {
  member: TeamMember
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function RemoveMemberDialog({ member, onClose, onConfirm, loading }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '440px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={20} /> Remove Member
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{member.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Role: {member.role} {member.participantType ? `· Type: ${member.participantType}` : ''}
          </div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#f59e0b', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>The portal-service has no remove-member endpoint. Removal requests must be processed by an admin who can update the submission team record directly.</span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
          Do you want to log a removal request for <strong>{member.name}</strong>?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" style={{ background: '#f43f5e' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Log Removal Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
