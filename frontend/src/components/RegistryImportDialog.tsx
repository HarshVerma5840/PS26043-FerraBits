import React, { useState } from 'react'
import { registryApi } from '../api/registryApi'
import { X, Upload } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function RegistryImportDialog({ onClose, onSuccess }: Props) {
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [versionDesc, setVersionDesc] = useState('')

  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonText)
      
      setLoading(true)
      setError(null)
      
      const payload = {
        institutions: Array.isArray(data) ? data : data.institutions || [],
        description: versionDesc
      }

      await registryApi.importRegistry(payload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format or import failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '600px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--primary)" /> Import Registry Data
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

        <div className="form-group">
          <label>Version Description</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. Initial AICTE import Q3" 
            value={versionDesc}
            onChange={e => setVersionDesc(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>JSON Data</label>
          <textarea 
            className="input-field" 
            style={{ height: '250px', fontFamily: 'monospace', resize: 'vertical' }}
            placeholder='[ { "name": "...", "aisheIdentifier": "...", ... } ]'
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" style={{ background: 'var(--primary)' }} onClick={handleImport} disabled={loading || !jsonText.trim()}>
            {loading ? 'Importing...' : 'Run Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
