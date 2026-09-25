import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { projectApi } from '../api/projectApi'
import { Flag, Plus, Check } from 'lucide-react'

export default function MilestoneList({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => projectApi.getProjectMilestones(projectId)
  })

  const createMutation = useMutation({
    mutationFn: () => projectApi.createMilestone(projectId, { title: newTitle, description: '', status: 'PENDING', dueDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      setIsAdding(false)
      setNewTitle('')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => projectApi.updateMilestone(data.id, { status: data.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
  })

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Flag size={18} /> Milestones</h3>
        <button className="btn btn-secondary" onClick={() => setIsAdding(!isAdding)} style={{ padding: '0.25rem 0.5rem' }}>
          <Plus size={16} /> Add
        </button>
      </div>

      {isAdding && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            placeholder="Milestone title..."
            style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px' }}
          />
          <button className="btn" onClick={() => createMutation.mutate()} disabled={!newTitle || createMutation.isPending}>Save</button>
        </div>
      )}

      {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {milestones?.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{m.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {new Date(m.dueDate).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => updateMutation.mutate({ id: m.id, status: m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: m.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)' }}
              >
                <Check size={16} color={m.status === 'COMPLETED' ? 'var(--ok)' : 'var(--text-muted)'} />
              </button>
            </div>
          ))}
          {(!milestones || milestones.length === 0) && !isAdding && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No milestones defined yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
