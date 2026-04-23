import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function TaskApplicants() {
  const { taskId } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  const fetchApps = () => {
    setLoading(true)
    api.get(`/api/applications/task/${taskId}`)
      .then(r => setApps(r.data))
      .catch(() => toast('Failed to load applicants.', 'danger'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchApps() }, [taskId])

  const updateStatus = async (id, action) => {
    setActing(id + action)
    try {
      await api.put(`/api/applications/${id}/${action}`)
      toast(`Application ${action}ed!`, 'success')
      fetchApps()
    } catch (err) {
      toast(err.response?.data || 'Action failed.', 'danger')
    } finally { setActing(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  const counts = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'PENDING').length,
    accepted: apps.filter(a => a.status === 'ACCEPTED').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/my-tasks')}>
        ← Back to My Tasks
      </button>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: counts.total, accent: 'accent-primary', emoji: '👥' },
          { label: 'Pending', value: counts.pending, accent: 'accent-warning', emoji: '⏳' },
          { label: 'Accepted', value: counts.accepted, accent: 'accent-success', emoji: '✅' },
          { label: 'Rejected', value: counts.rejected, accent: 'accent-danger', emoji: '❌' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.accent}`}>
            <div className="stat-icon">{s.emoji}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Applicants for Task #{taskId}</div>
        </div>
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No applicants yet</div>
            <div className="empty-state-description">Students haven't applied to this task yet.</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0
                        }}>
                          {a.studentName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{a.studentName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      {new Date(a.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="col-actions">
                      {a.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={acting === a.id + 'accept'}
                            onClick={() => updateStatus(a.id, 'accept')}
                          >
                            {acting === a.id + 'accept' ? <span className="spinner spinner-white spinner-sm" /> : '✅ Accept'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={acting === a.id + 'reject'}
                            onClick={() => updateStatus(a.id, 'reject')}
                          >
                            {acting === a.id + 'reject' ? <span className="spinner spinner-white spinner-sm" /> : '❌ Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
