import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi, NotificationResponse } from '../api/notificationApi'
import NotificationItem from './NotificationItem'
import NotificationEmptyState from './NotificationEmptyState'
import { Check, ExternalLink } from 'lucide-react'

interface NotificationDropdownProps {
  onClose: () => void
  onUnreadCountChange: (count: number) => void
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = () => {
    setLoading(true)
    notificationApi.getNotifications({ page: 0, size: 5 })
      .then(res => {
        setNotifications(res.content)
        onUnreadCountChange(res.content.filter(n => !n.read).length)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.eventId === id ? { ...n, read: true } : n))
      onUnreadCountChange(notifications.filter(n => !n.read && n.eventId !== id).length)
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      onUnreadCountChange(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleNavigate = (problemId: string | null) => {
    onClose()
    if (problemId) {
      // Basic heuristic: go to portal problem page. Evaluators might need to go to assignments, but portal works for now.
      navigate(`/portal/problems/${problemId}`)
    }
  }

  return (
    <div 
      ref={dropdownRef}
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '0.5rem',
        width: '350px',
        maxHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
          >
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          notifications.map(n => (
            <NotificationItem 
              key={n.eventId} 
              notification={n} 
              onMarkAsRead={handleMarkAsRead}
              onNavigate={() => handleNavigate(n.problemId)}
            />
          ))
        )}
      </div>

      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <button 
          onClick={() => { onClose(); navigate('/portal/notifications') }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', width: '100%', cursor: 'pointer' }}
        >
          View all notifications <ExternalLink size={14} />
        </button>
      </div>
    </div>
  )
}
