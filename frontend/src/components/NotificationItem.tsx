import React from 'react'
import { NotificationResponse } from '../api/notificationApi'
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface NotificationItemProps {
  notification: NotificationResponse
  onMarkAsRead: (id: string) => void
  onNavigate: () => void
}

export default function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
  const getIcon = () => {
    if (notification.eventType.includes('STATUS')) return <CheckCircle size={18} color="var(--primary)" />
    if (notification.eventType.includes('ASSIGN')) return <Info size={18} color="var(--secondary)" />
    if (notification.eventType.includes('EVALUATION')) return <AlertTriangle size={18} color="orange" />
    return <Bell size={18} color="var(--text-muted)" />
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        gap: '1rem', 
        padding: '1rem', 
        borderBottom: '1px solid var(--glass-border)',
        background: notification.read ? 'transparent' : 'rgba(255,255,255,0.03)',
        transition: 'background 0.2s',
        position: 'relative'
      }}
    >
      {!notification.read && (
        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '3px', background: 'var(--primary)' }} />
      )}
      
      <div style={{ marginTop: '0.25rem' }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
          <h4 
            style={{ margin: 0, fontSize: '0.95rem', fontWeight: notification.read ? 400 : 600, color: '#fff', cursor: 'pointer' }}
            onClick={onNavigate}
          >
            {notification.title}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {notification.body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {notification.problemId ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
              Problem: {notification.problemId.substring(0,8)}...
            </span>
          ) : <span />}

          {!notification.read && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.eventId) }}
              style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
