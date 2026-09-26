import React, { useState } from 'react'
import { X, MessageSquarePlus } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (type: string, contextId?: string) => void
  loading?: boolean
}

export default function CreateConversationDialog({ onClose, onSave, loading }: Props) {
  const [type, setType] = useState('PROJECT_TEAM')
  const [contextId, setContextId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(type, contextId.trim() || undefined)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquarePlus size={20} color="var(--primary)" /> New Conversation
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Conversation Type</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="PROJECT_TEAM">Project Team</option>
              <option value="MENTORSHIP">Mentorship</option>
              <option value="INDUSTRY_SUPPORT">Industry Support</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div className="form-group">
            <label>Context ID (Optional)</label>
            <input className="input-field" value={contextId} onChange={e => setContextId(e.target.value)} placeholder="e.g. Project ID or Mentorship ID" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
