import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { feedbackApi } from '../api/feedbackApi'
import { MessageSquarePlus, Star } from 'lucide-react'

export default function FeedbackPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  
  const [rating, setRating] = useState(5)
  const [category, setCategory] = useState('GENERAL')
  const [comments, setComments] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const { data: feedbackList, isLoading } = useQuery({
    queryKey: ['feedback', projectId],
    queryFn: () => feedbackApi.getProjectFeedback(projectId!)
  })

  const submitMutation = useMutation({
    mutationFn: () => feedbackApi.submitFeedback(projectId!, {
      rating, category, comments, isAnonymous
    } as any),
    onSuccess: () => {
      setComments('')
      setRating(5)
      queryClient.invalidateQueries({ queryKey: ['feedback', projectId] })
    }
  })

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <MessageSquarePlus size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Submit Feedback</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Share your experience</p>
          </div>
        </header>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px', outline: 'none' }}>
              <option value="GENERAL">General</option>
              <option value="TECHNICAL">Technical Issue</option>
              <option value="COLLABORATION">Collaboration</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating (1-5)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => setRating(r)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Star size={24} color={rating >= r ? 'var(--primary)' : 'var(--text-muted)'} fill={rating >= r ? 'var(--primary)' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Comments</label>
            <textarea 
              value={comments} 
              onChange={e => setComments(e.target.value)} 
              rows={5}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
            <label htmlFor="anon" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Submit anonymously</label>
          </div>

          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => submitMutation.mutate()} disabled={!comments || submitMutation.isPending}>
            Submit Feedback
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>Past Feedback</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : feedbackList?.map((f: any) => (
            <div key={f.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1,2,3,4,5].map(r => (
                    <Star key={r} size={14} color={f.rating >= r ? 'var(--primary)' : 'var(--text-muted)'} fill={f.rating >= r ? 'var(--primary)' : 'transparent'} />
                  ))}
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{f.category}</span>
              </div>
              <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>{f.comments}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {f.isAnonymous ? 'Anonymous' : f.submitterId} &bull; {new Date(f.submittedAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ))}
          {(!feedbackList || feedbackList.length === 0) && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
              No feedback submitted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
