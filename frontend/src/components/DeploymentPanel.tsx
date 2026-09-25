import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { projectApi } from '../api/projectApi'
import { Package, Plus } from 'lucide-react'

export default function DeploymentPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [target, setTarget] = useState('')

  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployments', projectId],
    queryFn: () => projectApi.getDeployments(projectId)
  })

  const createMutation = useMutation({
    mutationFn: () => projectApi.createDeployment(projectId, { target, status: 'PLANNED', deploymentDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', projectId] })
      setIsAdding(false)
      setTarget('')
    }
  })

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} /> Deployments</h3>
        <button onClick={() => setIsAdding(!isAdding)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={16} /></button>
      </div>

      {isAdding && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder="Target Environment..." style={{ flex: 1, padding: '0.4rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px' }} />
          <button className="btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => createMutation.mutate()} disabled={!target}>Add</button>
        </div>
      )}

      {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {deployments?.map(d => (
            <div key={d.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <span>{d.target}</span>
              <span style={{ color: d.status === 'COMPLETED' ? 'var(--ok)' : 'var(--text-muted)' }}>{d.status}</span>
            </div>
          ))}
          {(!deployments || deployments.length === 0) && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No deployments active.</div>}
        </div>
      )}
    </div>
  )
}
