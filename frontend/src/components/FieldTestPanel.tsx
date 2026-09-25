import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { projectApi } from '../api/projectApi'
import { MapPin, Plus } from 'lucide-react'

export default function FieldTestPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [location, setLocation] = useState('')

  const { data: tests, isLoading } = useQuery({
    queryKey: ['field-tests', projectId],
    queryFn: () => projectApi.getFieldTests(projectId)
  })

  const createMutation = useMutation({
    mutationFn: () => projectApi.createFieldTest(projectId, { location, status: 'SCHEDULED', testDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-tests', projectId] })
      setIsAdding(false)
      setLocation('')
    }
  })

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Field Tests</h3>
        <button onClick={() => setIsAdding(!isAdding)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={16} /></button>
      </div>

      {isAdding && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..." style={{ flex: 1, padding: '0.4rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px' }} />
          <button className="btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => createMutation.mutate()} disabled={!location}>Add</button>
        </div>
      )}

      {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tests?.map(t => (
            <div key={t.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <span>{t.location}</span>
              <span style={{ color: t.status === 'COMPLETED' ? 'var(--ok)' : 'var(--warn)' }}>{t.status}</span>
            </div>
          ))}
          {(!tests || tests.length === 0) && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No field tests scheduled.</div>}
        </div>
      )}
    </div>
  )
}
