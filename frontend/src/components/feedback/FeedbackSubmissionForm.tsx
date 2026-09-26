import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { CreateFeedback } from '../../types'

interface Props {
  onSubmit: (data: CreateFeedback) => void
  loading?: boolean
}

export default function FeedbackSubmissionForm({ onSubmit, loading }: Props) {
  const [rating, setRating] = useState(5)
  const [category, setCategory] = useState('GENERAL')
  const [comment, setComment] = useState('')
  const [completionUsefulness, setCompletionUsefulness] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    onSubmit({
      rating,
      category,
      comment,
      completionUsefulness: completionUsefulness.trim() || undefined,
      isAnonymous
    })
    
    // Clear form
    setRating(5)
    setCategory('GENERAL')
    setComment('')
    setCompletionUsefulness('')
    setIsAnonymous(false)
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px', outline: 'none' }}>
            <option value="GENERAL">General</option>
            <option value="TECHNICAL">Technical Issue</option>
            <option value="COLLABORATION">Collaboration</option>
            <option value="IMPACT">Real-World Impact</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating (1-5)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1,2,3,4,5].map(r => (
              <button key={r} type="button" onClick={() => setRating(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Star size={28} color={rating >= r ? 'var(--primary)' : 'var(--text-muted)'} fill={rating >= r ? 'var(--primary)' : 'transparent'} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Comments</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            rows={4}
            required
            placeholder="Share your experience..."
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Completion Usefulness (Optional)</label>
          <input 
            type="text"
            value={completionUsefulness} 
            onChange={e => setCompletionUsefulness(e.target.value)} 
            placeholder="How useful was the final project result?"
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
          <label htmlFor="anon" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>Submit anonymously</label>
        </div>

        <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--primary)', padding: '0.8rem' }} disabled={!comment.trim() || loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}
