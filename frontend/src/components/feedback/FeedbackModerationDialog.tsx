import React, { useState } from 'react'
import { X, ShieldAlert } from 'lucide-react'
import { CitizenFeedback } from '../../types'

interface Props {
  feedback: CitizenFeedback
  onClose: () => void
  onModerate: (feedbackId: string, status: string) => void
  loading?: boolean
}

export default function FeedbackModerationDialog({ feedback, onClose, onModerate, loading }: Props) {
  const [status, setStatus] = useState(feedback.moderationStatus || 'PENDING')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onModerate(feedback.id, status)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#f59e0b" /> Moderate Feedback
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <div style={{ marginBottom: '0.5rem' }}><strong>Category:</strong> {feedback.category}</div>
          <div style={{ marginBottom: '0.5rem' }}><strong>Rating:</strong> {feedback.rating} / 5</div>
          <div><strong>Comment:</strong><br />{feedback.comment}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Moderation Status</label>
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="PENDING">Pending (Hidden)</option>
              <option value="APPROVED">Approved (Visible)</option>
              <option value="REJECTED">Rejected (Hidden, flagged)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: status === 'APPROVED' ? '#10b981' : status === 'REJECTED' ? '#f43f5e' : '#f59e0b' }} disabled={loading || status === feedback.moderationStatus}>
              {loading ? 'Saving...' : 'Apply Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
