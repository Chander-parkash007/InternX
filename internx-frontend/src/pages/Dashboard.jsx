import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard')
      .then(r => {
        console.log('Dashboard API Response:', r.data)
        setData(r.data)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard:', err)
        console.error('Error response:', err.response?.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>

  if (user?.role === 'STUDENT') {
    const stats = [
      { label: 'Total Applied', value: data?.totalApplications ?? 0, color: 'var(--primary)', filter: 'all' },
      { label: 'Accepted', value: data?.acceptedApplications ?? 0, color: 'var(--success)', filter: 'ACCEPTED' },
      { label: 'Pending', value: data?.pendingApplications ?? 0, color: 'var(--warning)', filter: 'PENDING' },
      { label: 'Rejected', value: data?.rejectedApplications ?? 0, color: 'var(--danger)', filter: 'REJECTED' },
      { label: 'Submissions', value: data?.totalSubmissions ?? 0, color: '#8b5cf6', filter: 'submissions' },
      { label: 'Avg Rating', value: data?.averageRating ? data.averageRating.toFixed(1) : '—', color: 'var(--secondary)', filter: 'rating' },
    ]
    return (
      <div>
        <div className="dash-welcome">
          <div>
            <div className="dash-welcome-title">Hey, {user.name?.split(' ')[0]} 👋</div>
            <div className="dash-welcome-sub">Here's a snapshot of your activity</div>
          </div>
          <button className="btn btn-primary btn-md" onClick={() => navigate('/tasks')}>
            Browse Tasks
          </button>
        </div>
        <div className="stats-grid">
          {stats.map(s => (
            <div
              key={s.label}
              className="stat-card stat-clickable"
              style={{ borderLeftColor: s.color, cursor: s.filter !== 'rating' ? 'pointer' : 'default' }}
              onClick={() => {
                if (s.filter === 'submissions') navigate('/my-submissions')
                else if (s.filter !== 'rating') navigate(`/my-applications?status=${s.filter}`)
              }}
              title={s.filter !== 'rating' ? `View ${s.label}` : ''}
            >
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              {s.filter !== 'rating' && s.filter !== 'submissions' && (
                <div className="stat-hint">Click to view &rarr;</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (user?.role === 'COMPANY') {
    const stats = [
      { label: 'Tasks Posted', value: data?.totalTaskPosted ?? 0, color: 'var(--primary)', nav: '/my-tasks' },
      { label: 'Applications', value: data?.totalApplicationsReceived ?? 0, color: '#8b5cf6', nav: '/my-tasks' },
      { label: 'Completed', value: data?.totalTaskCompleted ?? 0, color: 'var(--success)', nav: '/my-tasks' },
      { label: 'Open', value: data?.totalTaskOpened ?? 0, color: 'var(--info)', nav: '/my-tasks' },
      { label: 'In Progress', value: data?.totalTaskInProgress ?? 0, color: 'var(--warning)', nav: '/my-tasks' },
      { label: 'Cancelled', value: data?.totalTaskCancelled ?? 0, color: 'var(--danger)', nav: '/my-tasks' },
    ]
    return (
      <div>
        <div className="dash-welcome">
          <div>
            <div className="dash-welcome-title">Welcome back, {user.name?.split(' ')[0]} 👋</div>
            <div className="dash-welcome-sub">Manage your tasks and find great talent</div>
          </div>
          <button className="btn btn-primary btn-md" onClick={() => navigate('/tasks')}>
            Post a Task
          </button>
        </div>
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card stat-clickable" style={{ borderLeftColor: s.color, cursor: 'pointer' }}
              onClick={() => navigate(s.nav)}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-hint">View &rarr;</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Admin
  return (
    <div>
      <div className="dash-welcome">
        <div>
          <div className="dash-welcome-title">Admin Dashboard</div>
          <div className="dash-welcome-sub">Manage users and platform content</div>
        </div>
        <button className="btn btn-primary btn-md" onClick={() => navigate('/admin')}>Open Admin Panel</button>
      </div>
    </div>
  )
}
