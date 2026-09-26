import React, { useState } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import { IndustryOrganization } from '../../types'

interface Props {
  orgs: IndustryOrganization[]
  onClose: () => void
  onSave: (orgId: string, participationType: string) => void
  loading?: boolean
}

export default function ParticipantDialog({ orgs, onClose, onSave, loading }: Props) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [type, setType] = useState('TECHNICAL_SUPPORT')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(orgId, type)
  }

  if (orgs.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 1rem' }}>No Organizations Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>You must register an industry organization before adding a participant.</p>
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
            <LinkIcon size={20} color="var(--primary)" /> Add Participant
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Organization</label>
            <select className="input-field" value={orgId} onChange={e => setOrgId(e.target.value)}>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Participation Type</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="TECHNICAL_SUPPORT">Technical Support</option>
              <option value="SPONSOR">Sponsor</option>
              <option value="DATA_PROVIDER">Data Provider</option>
              <option value="MENTORSHIP">Mentorship Partner</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !orgId}>
              {loading ? 'Adding...' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
