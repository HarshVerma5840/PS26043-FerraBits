import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { registryApi } from '../api/registryApi'
import { ArrowLeft, MapPin, Database } from 'lucide-react'

export default function InstitutionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: inst, isLoading } = useQuery({
    queryKey: ['institution', id],
    queryFn: () => registryApi.getInstitutionById(id!)
  })

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading institution details...</div>
  if (!inst) return <div style={{ padding: '2rem' }}>Institution not found.</div>

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/admin/registry')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Registry
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', marginBottom: '0.5rem' }}>{inst.name}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} /> {inst.district}, {inst.state}
              </span>
              <span>Code: {inst.code}</span>
              <span>Type: {inst.type}</span>
            </div>
          </div>
          <span className="badge" style={{ background: inst.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inst.verified ? 'var(--ok)' : 'var(--warn)', fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {inst.verified ? 'Verified Partner' : 'Pending Verification'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Departments & Labs</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Information about departments and labs will be populated here.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Equipment & Assets</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Information about available equipment will be populated here.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Faculty & Students</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Information about faculty counts and student enrollment.</p>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Registered Capabilities (Skills)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {inst.capabilities?.map(cap => (
          <div key={cap.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{cap.skill}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level: {cap.level}</div>
          </div>
        ))}
        {(!inst.capabilities || inst.capabilities.length === 0) && (
          <div style={{ color: 'var(--text-muted)' }}>No explicit capabilities registered.</div>
        )}
      </div>
    </div>
  )
}
