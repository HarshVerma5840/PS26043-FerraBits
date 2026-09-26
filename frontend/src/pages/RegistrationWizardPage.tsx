import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sourceApi, SourceTypesResponse, RegistrationCreateRequest } from '../api/sourceApi'
import { useAuth } from '../auth/AuthContext'
import { Save, Send } from 'lucide-react'

export default function RegistrationWizardPage() {
  const { id } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated } = useAuth()
  const [sourceTypes, setSourceTypes] = useState<SourceTypesResponse | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sourceData, setSourceData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      try {
        const res = await sourceApi.getSourceTypes()
        setSourceTypes(res)
        if (res.types && Object.keys(res.types).length > 0 && !id) {
          setSelectedType(Object.keys(res.types)[0])
        }
        
        if (id) {
          // Edit mode
          const reg = await sourceApi.getRegistration(id)
          setSelectedType(reg.sourceType)
          setSourceData(reg.source)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  const handleSave = async (e: React.FormEvent, submit: boolean) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let regId = id
      if (!regId) {
        // Create new
        const data: RegistrationCreateRequest = {
          sourceType: selectedType,
          account: { phone, email },
          source: sourceData
        }
        const reg = await sourceApi.createRegistration(data)
        regId = reg.registrationId
      } else {
        // Update existing draft
        await sourceApi.updateRegistration(regId, sourceData)
      }

      if (submit) {
        await sourceApi.submitRegistration(regId)
      }

      navigate(`/register/status/${regId}`)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
      <div className="page-header text-center">
        <h1 className="page-title">Source Registration</h1>
        <p style={{ color: 'var(--text-muted)' }}>Register your organization to participate</p>
      </div>

      <form className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && <div style={{ color: 'var(--accent)', background: 'rgba(244,63,94,0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Organization Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ width: '100%' }} disabled={!!id} required>
            {sourceTypes?.types && Object.entries(sourceTypes.types).map(([key, info]: [string, any]) => (
              <option key={key} value={key}>{info.displayName || key}</option>
            ))}
          </select>
        </div>

        {!id && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number (for login)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%' }} required pattern="^[0-9]{10}$" placeholder="10-digit number" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email (Optional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
            </div>
          </>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Organization Details (JSON temporarily)</label>
          <textarea 
            rows={5} 
            value={JSON.stringify(sourceData, null, 2)} 
            onChange={e => {
              try {
                setSourceData(JSON.parse(e.target.value))
              } catch(_e) {}
            }} 
            style={{ width: '100%', fontFamily: 'monospace' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" onClick={e => handleSave(e, false)} className="btn btn-secondary" disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={e => handleSave(e, true)} className="btn" disabled={loading}>
            <Send size={18} /> Submit
          </button>
        </div>
      </form>
    </div>
  )
}
