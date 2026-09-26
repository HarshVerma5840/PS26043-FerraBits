import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (data: { scheduledAt: string; durationMinutes: number }) => void
  loading?: boolean
}

export default function MentorshipSessionDialog({ onClose, onSave, loading }: Props) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('60')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) return
    const scheduledAt = new Date(`${date}T${time}`).toISOString()
    onSave({ scheduledAt, durationMinutes: parseInt(duration) })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" /> Schedule Session
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="input-field" required value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="input-field" required value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Duration (Minutes)</label>
            <input type="number" min="15" step="15" className="input-field" required value={duration} onChange={e => setDuration(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn" style={{ background: 'var(--primary)' }} disabled={loading || !date || !time || parseInt(duration) <= 0}>
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
