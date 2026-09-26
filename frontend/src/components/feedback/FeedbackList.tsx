import React from 'react'
import { Star, ShieldAlert } from 'lucide-react'
import { CitizenFeedback } from '../../types'

interface Props {
  feedback: CitizenFeedback[]
  loading?: boolean
  adminView?: boolean
  onModerate?: (item: CitizenFeedback) => void
}

export default function FeedbackList({ feedback, loading, adminView, onModerate }: Props) {
  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading feedback...</div>
  }

  if (!feedback || feedback.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
        No feedback submitted yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {feedback.map(f => (
        <div key={f.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', border: f.moderationStatus === 'REJECTED' ? '1px solid #f43f5e' : '1px solid var(--glass-border)' }}>
          
          {adminView && f.moderationStatus === 'PENDING' && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
               <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#f59e0b', border: '1px solid #f59e0b' }} onClick={() => onModerate && onModerate(f)}>
                 Moderate
               </button>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {[1,2,3,4,5].map(r => (
                <Star key={r} size={16} color={f.rating >= r ? 'var(--primary)' : 'var(--glass-border)'} fill={f.rating >= r ? 'var(--primary)' : 'transparent'} />
              ))}
            </div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{f.category}</span>
            {adminView && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '999px', background: f.moderationStatus === 'APPROVED' ? 'rgba(16,185,129,0.1)' : f.moderationStatus === 'REJECTED' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)', color: f.moderationStatus === 'APPROVED' ? '#10b981' : f.moderationStatus === 'REJECTED' ? '#f43f5e' : '#f59e0b' }}>
                {f.moderationStatus}
              </span>
            )}
          </div>
          
          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', lineHeight: 1.5, color: f.moderationStatus === 'REJECTED' ? 'var(--text-muted)' : 'var(--text)' }}>
            {f.comment}
          </p>

          {f.completionUsefulness && (
             <div style={{ marginBottom: '1rem', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Usefulness:</strong>
                {f.completionUsefulness}
             </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              {f.isAnonymous ? 'Anonymous Citizen' : (adminView ? `User: ${f.userId}` : 'Authenticated User')}
            </div>
            <div>
              {new Date(f.createdAt || Date.now()).toLocaleString()}
            </div>
          </div>
          
          {f.moderationStatus === 'REJECTED' && !adminView && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', fontSize: '0.85rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(244,63,94,0.2)' }}>
               <ShieldAlert size={14} /> This feedback has been removed by moderation.
             </div>
          )}
        </div>
      ))}
    </div>
  )
}
