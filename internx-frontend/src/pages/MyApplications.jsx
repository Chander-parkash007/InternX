import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function MyApplications() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)
  const statusFilter = searchParams.get('status') || 'all'

  const fetchApps = () => {
    setLoading(true)
    api.get('/api/applications/my')
      .then(r => setApps(r.data))
      .catch(() => toast('Failed to load applications.', 'danger'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchApps() }, [])

  const withdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    setWithdrawing(id)
    try {
      await api.delete(`/api/applications/${id}/withdraw`)
      toast('Application withdrawn.', 'success')
      setApps(apps.filter(a => a.id !== id))
    } catch (err) {
      toast(err.response?.data || 'Failed to withdraw.', 'danger')
    } finally { setWithdrawing(null) }
  }

  const filtered = statusFilter === 'all' ? apps : apps.filter(a => a.status === statusFilter)

  const counts = {
    all: apps.length,
    ACCEPTED: apps.filter(a => a.status === 'ACCEPTED').length,
    PENDING: apps.filter(a => a.status === 'PENDING').length,
    REJECTED: apps.filter(a => a.status === 'REJECTED').length,
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>

  return (
    <div>
      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'ACCEPTED', label: `Accepted (${counts.ACCEPTED})` },
          { key: 'PENDING', label: `Pending (${counts.PENDING})` },
          { key: 'REJECTED', label: `Rejected (${counts.REJECTED})` },
        ].map(t => (
          <button
            key={t.key}
            className={`filter-tab${statusFilter === t.key ? ' active' : ''}`}
            onClick={() => setSearchParams(t.key === 'all' ? {} : { status: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="empty-state-title">No {statusFilter === 'all' ? '' : statusFilter.toLowerCase()} applications</div>
          <div className="empty-state-description">
            {statusFilter === 'all' ? 'Browse tasks and apply to get started.' : `You have no ${statusFilter.toLowerCase()} applications yet.`}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr><th>Task</th><th>Status</th><th>Applied</th><th className="col-actions">Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td><div style={{ fontWeight: 600 }}>{app.taskTitle}</div></td>
                    <td><span className={`badge badge-${app.status?.toLowerCase()}`}>{app.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="col-actions">
                      {app.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm" disabled={withdrawing === app.id} onClick={() => withdraw(app.id)}>
                          {withdrawing === app.id ? <span className="spinner spinner-white spinner-sm" /> : 'Withdraw'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
