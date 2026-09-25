import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { projectApi } from '../api/projectApi'
import { Kanban, Plus, GripVertical } from 'lucide-react'

// Simple Task Card Component
function TaskCard({ task, onDragStart }: { task: any, onDragStart: (e: React.DragEvent, taskId: string) => void }) {
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        padding: '1rem', 
        borderRadius: '8px', 
        border: '1px solid var(--glass-border)',
        marginBottom: '0.75rem',
        cursor: 'grab'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{task.title}</h4>
        <GripVertical size={14} color="var(--text-muted)" />
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {task.description?.substring(0, 50)}{task.description?.length > 50 ? '...' : ''}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['kanban', projectId],
    queryFn: () => projectApi.getProjectTasks(projectId!)
  })

  const createMutation = useMutation({
    mutationFn: (status: string) => projectApi.createTask(projectId!, { title: newTaskTitle, description: '', status, position: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
      setIsAdding(null)
      setNewTaskTitle('')
    }
  })

  const statusMutation = useMutation({
    mutationFn: (data: { taskId: string, status: string }) => projectApi.updateTaskStatus(data.taskId, data.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      statusMutation.mutate({ taskId, status })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Required to allow drop
  }

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'rgba(255,255,255,0.05)' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'rgba(79, 70, 229, 0.1)' },
    { id: 'DONE', title: 'Done', color: 'rgba(34, 197, 94, 0.1)' }
  ]

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading board...</div>

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Kanban size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Task Board</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage sprint progress</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {columns.map(col => (
          <div 
            key={col.id} 
            className="glass-panel" 
            style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color, border: '1px solid rgba(255,255,255,0.1)' }} />
                {col.title} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({tasks?.filter(t => t.status === col.id).length || 0})</span>
              </h3>
              <button 
                onClick={() => setIsAdding(col.id)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <Plus size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {isAdding === col.id && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                  <input 
                    type="text" 
                    value={newTaskTitle} 
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..." 
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTaskTitle) createMutation.mutate(col.id)
                      if (e.key === 'Escape') setIsAdding(null)
                    }}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', marginBottom: '0.5rem' }} 
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => createMutation.mutate(col.id)} disabled={!newTaskTitle || createMutation.isPending}>Add</button>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setIsAdding(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {tasks?.filter(t => t.status === col.id).sort((a,b) => a.position - b.position).map(task => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
