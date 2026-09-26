import React from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { FeedbackSummary as SummaryType } from '../../types'

interface Props {
  summary?: SummaryType
  loading?: boolean
}

export default function FeedbackSummary({ summary, loading }: Props) {
  if (loading) {
    return <div className="glass-panel" style={{ padding: '1.5rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading summary...</div>
  }

  if (!summary) return null

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--glass-border)', paddingRight: '2rem' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
          {summary.averageRating.toFixed(1)}
        </div>
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          {[1,2,3,4,5].map(r => (
            <Star key={r} size={16} color={summary.averageRating >= r ? 'var(--primary)' : 'var(--glass-border)'} fill={summary.averageRating >= r ? 'var(--primary)' : 'transparent'} />
          ))}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Average Rating</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <MessageSquare size={16} /> <strong>{summary.totalFeedback}</strong> Total Reviews
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          All feedback is subject to moderation before appearing publicly.
        </div>
      </div>
    </div>
  )
}
