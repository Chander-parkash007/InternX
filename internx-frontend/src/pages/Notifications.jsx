import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useNotificationPoller } from '../context/NotificationPollerContext'
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
  if (m.includes('accept')) return { icon: '✅', color: '#16a34a' }
  if (m.includes('reject') || m.includes('declined')) return { icon: '❌', color: '#dc2626' }
  if (m.includes('connection request') || m.includes('sent you a connection')) return { icon: '👤', color: '#2563eb' }
  if (m.includes('liked') || m.includes('reacted')) return { icon: '👍', color: '#2563eb' }
  if (m.includes('comment')) return { icon: '💬', color: '#7c3aed' }
  if (m.includes('submit')) return { icon: '📤', color: '#0891b2' }
  if (m.includes('rate') || m.includes('rating')) return { icon: '⭐', color: '#d97706' }
  if (m.includes('task')) return { icon: '📋', color: '#0891b2' }
  if (m.includes('report')) return { icon: '🚩', color: '#dc2626' }
  return { icon: '🔔', color: '#6b7280' }
}

// Extract post ID from notification message if present
function getPostId(message) {
  const m = message || ''
  // Backend sends: "X liked your post." or "X commented on your post: ..."
  // We store postId in relatedEntityId if available — otherwise we navigate to feed
  return null
}

// Determine where clicking a notification should go
function getNotifAction(notif, navigate) {
  const m = (notif.message || '').toLowerCase()

  // If backend provides a relatedEntityId (post id), use it
  if (notif.relatedEntityId) {
    if (m.includes('liked') || m.includes('comment') || m.includes('reacted')) {
      return () => navigate('/feed', { state: { highlightPostId: notif.relatedEntityId } })
    }
    if (m.includes('task') || m.includes('submit')) {
      return () => navigate('/tasks')
    }
  }

  // Fallback by message content
  if (m.includes('liked') || m.includes('comment') || m.includes('reacted')) {
    return () => navigate('/feed')
  }
  if (m.includes('connection request') || m.includes('sent you a connection')) return null // handled by buttons
  if (m.includes('accept') || m.includes('connected')) return () => navigate('/connections')
  if (m.includes('task') || m.includes('submit')) return () => navigate('/tasks')
  if (m.includes('rate') || m.includes('rating')) return () => navigate('/profile')
  return null
}

const isRead = (n) => n.read === true || n.isRead === true
const isConnectionRequest = (n) => (n.message || '').toLowerCase().includes('sent you a connection request')

export default function Notifications() {
  const toast = useToast()
  const navigate = useNavigate()
  const { refreshCounts } = useNotificationPoller()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/api/notifications')
      .then(r => {
        setNotifs(r.data)
        // Auto mark all as read immediately when viewing
        api.put('/api/notifications').then(() => {
          refreshCounts() // Update badge counts immediately
        }).catch(() => {})
        setNotifs(prev => prev.map(x => ({ ...x, read: true, isRead: true })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Extract sender ID from connection request notification
  const getSenderId = (notif) => {
    // Try to get from relatedUserId field first
    if (notif.relatedUserId) return notif.relatedUserId
    
    // Fallback: extract name and search
    const match = notif.message?.match(/^(.+?) sent you a connection request/)
    return match ? match[1] : null
  }

  const handleConnectionAction = async (notif, action) => {
    const senderIdOrName = getSenderId(notif)
    if (!senderIdOrName) return

    setActingOn(notif.id)
    try {
      let senderId = senderIdOrName
      
      // If it's a name (string), search for the user
      if (typeof senderIdOrName === 'string' && isNaN(senderIdOrName)) {
        const { data: users } = await api.get(`/api/users/search?query=${encodeURIComponent(senderIdOrName)}`)
        const sender = users.find(u => u.name === senderIdOrName) || users[0]
        if (!sender) { 
          toast('Could not find user', 'danger')
          setActingOn(null)
          return 
        }
        senderId = sender.id
      }

      if (action === 'accept') {
        await api.post(`/api/connections/accept/${senderId}`)
        toast('Connection accepted!', 'success')
      } else {
        await api.post(`/api/connections/reject/${senderId}`)
        toast('Request declined', 'info')
      }
      
      // Remove this notification from list
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed', 'danger')
    } finally {
      setActingOn(null)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  const unread = notifs.filter(n => !isRead(n)).length

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Notifications</h1>
        {unread > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--blue)' }}>{unread}</strong> new
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div className="empty-state-title">No notifications</div>
          <div className="empty-state-description">You're all caught up!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map(n => {
            const { icon, color } = getIcon(n.message)
            const read = isRead(n)
            const isConnReq = isConnectionRequest(n)
            const senderIdOrName = isConnReq ? getSenderId(n) : null
            const clickAction = getNotifAction(n, navigate)

            return (
              <div
                key={n.id}
                onClick={clickAction}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                  background: read ? 'var(--surface)' : 'var(--blue-bg, #eff6ff)',
                  border: `1px solid ${read ? 'var(--border)' : '#bfdbfe'}`,
                  borderRadius: 12, transition: 'all .15s',
                  cursor: clickAction ? 'pointer' : 'default',
                }}
                onMouseEnter={e => { if (clickAction) e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{timeAgo(n.createdAt)}</div>

                  {/* Accept/Reject for connection requests */}
                  {isConnReq && senderIdOrName && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actingOn === n.id}
                        onClick={() => handleConnectionAction(n, 'accept')}
                      >
                        {actingOn === n.id ? <span className="spinner spinner-white spinner-sm" /> : '✓ Accept'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={actingOn === n.id}
                        onClick={() => handleConnectionAction(n, 'reject')}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {!read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
