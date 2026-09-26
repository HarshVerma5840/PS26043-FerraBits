import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { notificationApi } from '../api/notificationApi'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    
    // Simple polling every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = () => {
    notificationApi.getUnreadCount()
      .then(count => setUnreadCount(count))
      .catch(console.error)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid var(--glass-border)', 
          padding: '0.5rem', 
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)'
        }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 0 2px var(--bg-dark)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          onClose={() => setIsOpen(false)} 
          onUnreadCountChange={setUnreadCount} 
        />
      )}
    </div>
  )
}
