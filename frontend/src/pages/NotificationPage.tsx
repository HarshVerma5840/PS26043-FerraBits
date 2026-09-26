import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi, NotificationResponse } from '../api/notificationApi'
import NotificationItem from '../components/NotificationItem'
import NotificationEmptyState from '../components/NotificationEmptyState'
import { Bell, Check } from 'lucide-react'

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = () => {
    setLoading(true)
    notificationApi.getNotifications({ page: 0, size: 50 })
      .then(res => setNotifications(res.content))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.eventId === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleNavigate = (problemId: string | null) => {
    if (problemId) {
      navigate(`/portal/problems/${problemId}`)
    }
  }

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">Notifications</h1>
            <p style={{ color: 'var(--text-muted)' }}>Stay updated on your ecosystem activity</p>
          </div>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map(n => (
              <NotificationItem 
                key={n.eventId} 
                notification={n} 
                onMarkAsRead={handleMarkAsRead}
                onNavigate={() => handleNavigate(n.problemId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
