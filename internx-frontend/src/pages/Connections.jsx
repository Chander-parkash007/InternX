import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function UserCard({ user, type, onAction }) {
  const navigate = useNavigate()
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, transition: 'all .15s'
    }}>
      <div
        style={{
          width: 56, height: 56, borderRadius: '99px', background: 'var(--blue)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, flexShrink: 0, overflow: 'hidden', cursor: 'pointer'
        }}
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        {user.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', marginBottom: 2 }}
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          {user.name}
        </div>
        {user.headline && (
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.headline}
          </div>
        )}
        <span className={`badge badge-${user.role?.toLowerCase()}`} style={{ fontSize: 10 }}>
          {user.role}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {type === 'pending' && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onAction(user.id, 'accept')}>
              Accept
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAction(user.id, 'reject')}>
              Reject
            </button>
          </>
        )}
        {type === 'following' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onAction(user.id, 'unfollow')}>
            Unfollow
          </button>
        )}
        {type === 'followers' && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/profile/${user.id}`)}>
            View Profile
          </button>
        )}
      </div>
    </div>
  )
}

export default function Connections() {
  const toast = useToast()
  const [tab, setTab] = useState('followers') // followers, following, pending
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ followers: 0, following: 0, pending: 0 })

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [tab])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/connections/stats')
      setStats(data)
    } catch {
      // Handle error
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/connections/${tab}`)
      setUsers(data)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    try {
      if (action === 'accept') {
        await api.post(`/api/connections/accept/${userId}`)
        toast('Connection accepted!', 'success')
      } else if (action === 'reject') {
        await api.post(`/api/connections/reject/${userId}`)
        toast('Connection rejected', 'info')
      } else if (action === 'unfollow') {
        if (!confirm('Unfollow this user?')) return
        await api.delete(`/api/connections/${userId}`)
        toast('Unfollowed', 'info')
      }
      fetchStats()
      fetchUsers()
    } catch {
      toast('Action failed', 'danger')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 4 }}>My Network</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Manage your connections and grow your network
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer',
            borderLeft: tab === 'followers' ? '3px solid var(--blue)' : '1px solid var(--border)'
          }}
          onClick={() => setTab('followers')}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.followers}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Followers</div>
        </div>
        <div
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer',
            borderLeft: tab === 'following' ? '3px solid var(--blue)' : '1px solid var(--border)'
          }}
          onClick={() => setTab('following')}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.following}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Following</div>
        </div>
        <div
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer',
            borderLeft: tab === 'pending' ? '3px solid var(--orange)' : '1px solid var(--border)'
          }}
          onClick={() => setTab('pending')}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--orange)' }}>{stats.pending}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Pending</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`filter-tab${tab === 'followers' ? ' active' : ''}`}
          onClick={() => setTab('followers')}
        >
          Followers {stats.followers > 0 && `(${stats.followers})`}
        </button>
        <button
          className={`filter-tab${tab === 'following' ? ' active' : ''}`}
          onClick={() => setTab('following')}
        >
          Following {stats.following > 0 && `(${stats.following})`}
        </button>
        <button
          className={`filter-tab${tab === 'pending' ? ' active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending {stats.pending > 0 && `(${stats.pending})`}
        </button>
      </div>

      {/* Users list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="empty-state-title">
            {tab === 'followers' && 'No followers yet'}
            {tab === 'following' && 'Not following anyone'}
            {tab === 'pending' && 'No pending requests'}
          </div>
          <div className="empty-state-description">
            {tab === 'followers' && 'When people follow you, they\'ll appear here'}
            {tab === 'following' && 'Start connecting with others to grow your network'}
            {tab === 'pending' && 'Connection requests will appear here'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(user => (
            <UserCard key={user.id} user={user} type={tab} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
