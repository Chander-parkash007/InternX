import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getIcon(message) {
  const m = (message || '').toLowerCase()
  if (m.includes('accept')) return { icon: '✅', type: 'success' }
  if (m.includes('reject')) return { icon: '❌', type: 'danger' }
  if (m.includes('submit')) return { icon: '📤', type: 'info' }
  if (m.includes('rate') || m.includes('rating')) return { icon: '⭐', type: 'warning' }
  if (m.includes('task')) return { icon: '📋', type: 'info' }
  return { icon: '🔔', type: 'info' }
}

// backend sends isRead (Java boolean field name)
const isRead = (n) => n.read === true || n.isRead === true

export default function Notifications() {
  const toast = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/api/notifications')
      .then(r => setNotifs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    setMarking(true)
    try {
      await api.put('/api/notifications')
      // force all to read locally
      setNotifs(n => n.map(x => ({ ...x, read: true, isRead: true })))
      toast('All notifications marked as read.', 'success')
    } catch {
      toast('Failed.', 'danger')
    } finally { setMarking(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>

  const unread = notifs.filter(n => !isRead(n)).length

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {unread > 0
            ? <><strong style={{ color: 'var(--primary)' }}>{unread}</strong> unread</>
            : 'All caught up!'}
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead} disabled={marking}>
            {marking ? <span className="spinner spinner-sm" /> : 'Mark all as read'}
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
          <div className="empty-state-title">No notifications</div>
          <div className="empty-state-description">You're all caught up!</div>
        </div>
      ) : (
        <div className="notifications-list">
          {notifs.map(n => {
            const { icon, type } = getIcon(n.message)
            const read = isRead(n)
            return (
              <div key={n.id} className={`notification-item${!read ? ' unread' : ''}`}>
                <div className={`notification-icon type-${type}`}>{icon}</div>
                <div className="notification-content">
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-time">{timeAgo(n.createdAt)}</div>
                </div>
                {!read && <div className="notification-unread-dot" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
