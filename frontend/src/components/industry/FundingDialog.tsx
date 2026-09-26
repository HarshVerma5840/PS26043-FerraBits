import React, { useState } from 'react'
import { X, IndianRupee } from 'lucide-react'
import { IndustryOrganization, Funding } from '../../types'

interface Props {
  orgs: IndustryOrganization[]
  funding?: Funding | null
  onClose: () => void
  onSave: (data: Partial<Funding>) => void
  loading?: boolean
}

export default function FundingDialog({ orgs, funding, onClose, onSave, loading }: Props) {
  const [orgId, setOrgId] = useState(funding?.organizationId ?? (orgs[0]?.id ?? ''))
  const [amount, setAmount] = useState(funding?.amount?.toString() ?? '')
  const [currency, setCurrency] = useState(funding?.currency ?? 'INR')
  const [purpose, setPurpose] = useState(funding?.purpose ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      organizationId: orgId,
      amount: parseFloat(amount),
      currency,
      purpose,
    })
  }

  if (orgs.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 1rem' }}>No Organizations Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>You must register an industry organization before logging funding.</p>
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
            <IndianRupee size={20} color="var(--ok)" /> {funding ? 'Edit Funding' : 'Log Funding'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!funding && (
            <div className="form-group">
              <label>Granting Organization</label>
              <select className="input-field" value={orgId} onChange={e => setOrgId(e.target.value)}>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" min="0" className="input-field" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Purpose</label>
            <input className="input-field" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Hardware purchase" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !amount || parseFloat(amount) <= 0}>
              {loading ? 'Saving...' : 'Save Funding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
