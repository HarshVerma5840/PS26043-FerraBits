import React from 'react'
import { BellOff } from 'lucide-react'

export default function NotificationEmptyState() {
  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <BellOff size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>No notifications yet</h3>
      <p style={{ fontSize: '0.9rem' }}>We'll let you know when there's an update on your problems or assignments.</p>
    </div>
  )
}
