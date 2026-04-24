import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNotificationPoller } from '../context/NotificationPollerContext'
import api from '../api/axios'

/* ── User Profile Panel ─────────────────────────────────────────────────── */
function UserProfilePanel({ user: otherUser, onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [connStatus, setConnStatus] = useState('NONE')
  const [loading, setLoading] = useState(true)
  const [connLoading, setConnLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/profile/${otherUser.id}`),
      api.get(`/api/posts/user/${otherUser.id}`),
      api.get(`/api/connections/status/${otherUser.id}`),
    ]).then(([p, po, cs]) => {
      setProfile(p.data)
      setPosts(po.data || [])
      setConnStatus(cs.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [otherUser.id])

  const handleConnect = async () => {
    setConnLoading(true)
    try {
      await api.post(`/api/connections/request/${otherUser.id}`)
      setConnStatus('PENDING')
      toast('Connection request sent!', 'success')
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'danger') }
    finally { setConnLoading(false) }
  }

  const handleDisconnect = async () => {
    setConnLoading(true)
    try {
      await api.delete(`/api/connections/${otherUser.id}`)
      setConnStatus('NONE')
      toast('Disconnected', 'success')
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'danger') }
    finally { setConnLoading(false) }
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.4)' }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(340px, 100vw)',
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        zIndex: 201, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 20, padding: 6, borderRadius: 6 }}>✕</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
        ) : !profile ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>Profile not found</div>
        ) : (
          <>
            <div style={{ height: 90, background: profile.coverPhoto ? `url(${profile.coverPhoto}) center/cover` : 'linear-gradient(135deg, var(--blue) 0%, #6366f1 100%)' }} />
            <div style={{ padding: '0 16px', marginTop: -32, marginBottom: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--surface)', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, overflow: 'hidden' }}>
                {profile.profilePicture ? <img src={profile.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
            </div>
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{profile.name}</div>
              {profile.headline && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>{profile.headline}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                <span className={`badge badge-${profile.role?.toLowerCase()}`}>{profile.role}</span>
                {profile.location && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>📍 {profile.location}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {connStatus === 'CONNECTED'
                  ? <button className="btn btn-outline btn-sm" onClick={handleDisconnect} disabled={connLoading}>{connLoading ? <span className="spinner spinner-sm" /> : '✓ Connected'}</button>
                  : connStatus === 'PENDING'
                  ? <button className="btn btn-ghost btn-sm" disabled>⏳ Pending</button>
                  : <button className="btn btn-primary btn-sm" onClick={handleConnect} disabled={connLoading}>{connLoading ? <span className="spinner spinner-white spinner-sm" /> : '+ Connect'}</button>
                }
                <button className="btn btn-ghost btn-sm" onClick={() => { navigate(`/profile/${profile.id}`); onClose() }}>Full Profile ↗</button>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            {profile.bio && (
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>About</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
              </div>
            )}
            {profile.role === 'STUDENT' && profile.skills?.length > 0 && (
              <div style={{ padding: '0 16px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.skills.slice(0, 6).map(s => (
                    <span key={s.id} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20 }}>{s.skillName}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Recent Posts ({posts.length})</div>
              {posts.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center', padding: '16px 0' }}>No posts yet</div>
              ) : posts.slice(0, 3).map(p => (
                <div key={p.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{p.content}</div>
                  {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '100%', borderRadius: 6, marginTop: 6, objectFit: 'cover', maxHeight: 120 }} />}
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

/* ── Conversation List Item ─────────────────────────────────────────────── */
function ConversationItem({ conversation, isActive, onClick }) {
  const initials = conversation.otherUser?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const isUnread = conversation.unreadCount > 0

  return (
    <div
      className={`conv-item${isActive ? ' conv-item-active' : ''}`}
      onClick={onClick}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="conv-avatar">
          {conversation.otherUser?.profilePicture
            ? <img src={conversation.otherUser.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        {conversation.otherUser?.isOnline && (
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, background: 'var(--green)', border: '2px solid var(--surface)', borderRadius: '50%' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>
            {conversation.otherUser?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', flexShrink: 0 }}>
            {timeAgo(conversation.lastMessage?.createdAt)}
          </div>
        </div>
        <div style={{
          fontSize: 13, color: isUnread ? 'var(--text)' : 'var(--text-2)',
          fontWeight: isUnread ? 600 : 400,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {conversation.lastMessage?.content || 'No messages yet'}
        </div>
      </div>
      {isUnread && (
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </div>
      )}
    </div>
  )
}

/* ── Chat Window ────────────────────────────────────────────────────────── */
function ChatWindow({ conversation, messages, onSend, loading, onViewProfile, onBack }) {
  const { user } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim()) return
    setSending(true)
    try { await onSend(messageText); setMessageText('') }
    finally { setSending(false) }
  }

  if (!conversation) {
    return (
      <div className="chat-empty-state">
        <div style={{ fontSize: 52, marginBottom: 12 }}>💬</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Your Messages</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Select a conversation to start chatting</div>
      </div>
    )
  }

  const other = conversation.otherUser
  const initials = other?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // Group consecutive messages by sender (new group if >5min gap)
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1]
    const isOwn = msg.senderId === user?.id
    const sameSender = prev && prev.senderId === msg.senderId
    const timeDiff = prev ? new Date(msg.createdAt) - new Date(prev.createdAt) : Infinity
    const newGroup = !sameSender || timeDiff > 5 * 60 * 1000
    if (newGroup) acc.push({ isOwn, msgs: [msg] })
    else acc[acc.length - 1].msgs.push(msg)
    return acc
  }, [])

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        {/* Back button — mobile only */}
        <button className="chat-back-btn" onClick={onBack} aria-label="Back to conversations">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div
          onClick={() => onViewProfile(other)}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
        >
          {other?.profilePicture ? <img src={other.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>

        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onViewProfile(other)}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{other?.headline || 'Tap to view profile'}</div>
        </div>

        <button onClick={() => onViewProfile(other)} className="btn btn-ghost btn-sm" title="View profile" style={{ flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', padding: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto 12px', overflow: 'hidden' }}>
              {other?.profilePicture ? <img src={other.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{other?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Start the conversation!</div>
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={gi} className={`msg-group ${group.isOwn ? 'msg-group-own' : 'msg-group-other'}`}>
              {/* Sender label */}
              {!group.isOwn && (
                <div className="msg-sender-label">
                  <div className="msg-sender-avatar">
                    {other?.profilePicture ? <img src={other.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  </div>
                  <span>{other?.name}</span>
                </div>
              )}
              {group.isOwn && (
                <div className="msg-you-label">You</div>
              )}

              {/* Bubbles */}
              <div className={`msg-bubbles ${group.isOwn ? 'msg-bubbles-own' : 'msg-bubbles-other'}`}>
                {group.msgs.map((msg, mi) => {
                  const isFirst = mi === 0
                  const isLast = mi === group.msgs.length - 1
                  const r = group.isOwn
                    ? `${isFirst ? 18 : 6}px ${isFirst ? 18 : 18}px ${isLast ? 4 : 6}px ${isLast ? 18 : 6}px`
                    : `${isFirst ? 18 : 18}px ${isFirst ? 18 : 6}px ${isLast ? 18 : 6}px ${isLast ? 4 : 6}px`
                  return (
                    <div key={msg.id} className={`msg-bubble ${group.isOwn ? 'msg-bubble-own' : 'msg-bubble-other'}`} style={{ borderRadius: r }}>
                      {msg.content}
                    </div>
                  )
                })}
              </div>

              {/* Timestamp */}
              <div className={`msg-time ${group.isOwn ? 'msg-time-own' : 'msg-time-other'}`}>
                {timeAgo(group.msgs[group.msgs.length - 1].createdAt)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Type a message..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className={`chat-send-btn ${messageText.trim() ? 'chat-send-btn-active' : ''}`}
          >
            {sending ? <span className="spinner spinner-white spinner-sm" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Messages Page ─────────────────────────────────────────────────── */
export default function Messages() {
  const toast = useToast()
  const location = useLocation()
  const { refreshCounts } = useNotificationPoller()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [profilePanel, setProfilePanel] = useState(null)
  // Mobile: 'list' | 'chat'
  const [mobileView, setMobileView] = useState('list')

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    const openUserId = location.state?.openUserId
    if (!openUserId || loading) return
    const existing = conversations.find(c => c.otherUser?.id === openUserId)
    if (existing) {
      handleSelectConversation(existing)
    } else {
      api.get(`/api/users/${openUserId}`).then(r => {
        const synthetic = { otherUser: r.data, lastMessage: null, unreadCount: 0 }
        setConversations(prev => {
          if (prev.find(c => c.otherUser?.id === openUserId)) return prev
          return [synthetic, ...prev]
        })
        setActiveConversation(synthetic)
        setMessages([])
        setMobileView('chat')
      }).catch(() => {})
    }
  }, [location.state, loading])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/messages/conversations')
      setConversations(data)
    } catch { setConversations([]) }
    finally { setLoading(false) }
  }

  const fetchMessages = async (userId) => {
    setMessagesLoading(true)
    try {
      const { data } = await api.get(`/api/messages/${userId}`)
      setMessages(data)
      await api.put(`/api/messages/${userId}/read`)
      refreshCounts() // Update message badge immediately
    } catch { setMessages([]) }
    finally { setMessagesLoading(false) }
  }

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    fetchMessages(conversation.otherUser.id)
    setMobileView('chat')
  }

  const handleSendMessage = async (content) => {
    try {
      const { data } = await api.post('/api/messages/send', {
        receiverId: activeConversation.otherUser.id,
        content
      })
      setMessages(prev => [...prev, data])
      fetchConversations()
    } catch { toast('Failed to send message', 'danger') }
  }

  const handleBack = () => {
    setMobileView('list')
    setActiveConversation(null)
  }

  return (
    <div className="messages-shell">
      {/* Conversation list */}
      <div className={`conv-list-panel ${mobileView === 'chat' ? 'conv-list-hidden' : ''}`}>
        <div className="conv-list-header">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Messages</h2>
          <div className="search-wrapper">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="form-control" placeholder="Search messages..." style={{ fontSize: 14 }} />
          </div>
        </div>
        <div className="conv-list-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.otherUser.id}
                conversation={conv}
                isActive={activeConversation?.otherUser.id === conv.otherUser.id}
                onClick={() => handleSelectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`chat-panel ${mobileView === 'list' ? 'chat-panel-hidden' : ''}`}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSend={handleSendMessage}
          loading={messagesLoading}
          onViewProfile={setProfilePanel}
          onBack={handleBack}
        />
      </div>

      {/* Profile panel */}
      {profilePanel && (
        <UserProfilePanel user={profilePanel} onClose={() => setProfilePanel(null)} />
      )}
    </div>
  )
}
