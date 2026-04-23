import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function UserCard({ user, onConnect, connectionStatus, loading }) {
  const navigate = useNavigate()
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, transition: 'all .15s'
    }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: '99px', background: 'var(--blue)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, flexShrink: 0, overflow: 'hidden', cursor: 'pointer'
        }}
        onClick={() => navigate(`/profile/${user.id}`)}
      >
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', marginBottom: 3 }}
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          {user.name}
        </div>
        {user.headline && (
          <div style={{
            fontSize: 13, color: 'var(--text-2)', marginBottom: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {user.headline}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className={`badge badge-${user.role?.toLowerCase()}`} style={{ fontSize: 10 }}>
            {user.role}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {connectionStatus === 'connected' ? (
          <button className="btn btn-ghost btn-sm" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Connected
          </button>
        ) : connectionStatus === 'pending' ? (
          <button className="btn btn-ghost btn-sm" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Pending
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onConnect(user.id)}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner spinner-white spinner-sm" />
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Connect
              </>
            )}
          </button>
        )}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          View Profile
        </button>
      </div>
    </div>
  )
}

export default function People() {
  const { user } = useAuth()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [connectingId, setConnectingId] = useState(null)
  const [connectionStatuses, setConnectionStatuses] = useState({})

  useEffect(() => {
    fetchSuggestions()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch()
      }, 500) // Debounce search
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/users/suggestions')
      setSuggestions(data)
      // Fetch connection statuses for suggestions
      await fetchConnectionStatuses(data)
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const { data } = await api.get(`/api/users/search?query=${encodeURIComponent(searchQuery)}`)
      setSearchResults(data)
      // Fetch connection statuses for search results
      await fetchConnectionStatuses(data)
    } catch (err) {
      console.error('Search failed:', err)
      toast('Search failed', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchConnectionStatuses = async (users) => {
    const statuses = {}
    for (const u of users) {
      try {
        const { data } = await api.get(`/api/connections/status/${u.id}`)
        // data is now a string: "CONNECTED", "PENDING", or "NONE"
        statuses[u.id] = data === 'CONNECTED' ? 'connected' : data === 'PENDING' ? 'pending' : 'none'
      } catch {
        statuses[u.id] = 'none'
      }
    }
    setConnectionStatuses(statuses)
  }

  const handleConnect = async (userId) => {
    setConnectingId(userId)
    try {
      await api.post(`/api/connections/request/${userId}`)
      toast('Connection request sent!', 'success')
      setConnectionStatuses(prev => ({ ...prev, [userId]: 'pending' }))
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send request', 'danger')
    } finally {
      setConnectingId(null)
    }
  }

  const displayUsers = searchQuery.trim() ? searchResults : suggestions

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>
          Find People
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Search and connect with students and companies
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div className="search-wrapper" style={{ maxWidth: 600 }}>
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="form-control"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: 15, padding: '12px 12px 12px 40px' }}
          />
        </div>
      </div>

      {/* Section Title */}
      <div style={{
        fontSize: 14, fontWeight: 600, color: 'var(--text-2)',
        marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        {searchQuery.trim() ? `Search Results (${displayUsers.length})` : 'People You May Know'}
      </div>

      {/* Results */}
      {loading && displayUsers.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : displayUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="empty-state-title">
            {searchQuery.trim() ? 'No users found' : 'No suggestions available'}
          </div>
          <div className="empty-state-description">
            {searchQuery.trim()
              ? 'Try searching with a different name or email'
              : 'Check back later for people you may know'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayUsers.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onConnect={handleConnect}
              connectionStatus={connectionStatuses[u.id] || 'none'}
              loading={connectingId === u.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
