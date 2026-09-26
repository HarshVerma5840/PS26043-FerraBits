import React, { useState } from 'react'
import { X, UserPlus } from 'lucide-react'

interface Props {
  onClose: () => void
  onAdd: (userId: string) => void
  loading?: boolean
}

export default function AddParticipantDialog({ onClose, onAdd, loading }: Props) {
  const [userId, setUserId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(userId.trim())
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--primary)" /> Add Participant
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>User ID</label>
            <input className="input-field" required value={userId} onChange={e => setUserId(e.target.value)} placeholder="UUID of the user" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !userId.trim()}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
