import React, { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { IndustryOrganization } from '../../types'

interface Props {
  org?: IndustryOrganization | null
  onClose: () => void
  onSave: (data: Partial<IndustryOrganization>) => void
  loading?: boolean
}

export default function OrganizationDialog({ org, onClose, onSave, loading }: Props) {
  const [name, setName] = useState(org?.name ?? '')
  const [contactEmail, setContactEmail] = useState(org?.contactEmail ?? org?.contactPersonEmail ?? '')
  const [domain, setDomain] = useState(org?.domain ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, contactEmail, domain })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="var(--primary)" /> {org ? 'Edit Organization' : 'Register Organization'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Organization Name</label>
            <input className="input-field" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input type="email" className="input-field" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="e.g. contact@acme.com" />
          </div>
          <div className="form-group">
            <label>Domain / Industry</label>
            <input className="input-field" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. Software, Healthcare" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !name.trim() || !contactEmail.trim()}>
              {loading ? 'Saving...' : 'Save Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
