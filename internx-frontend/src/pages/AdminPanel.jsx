import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const STATUS_COLORS = {
  PENDING:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  REVIEWED:  { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  RESOLVED:  { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  DISMISSED: { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
}

const STATUS_ICONS = { PENDING: '🕐', REVIEWED: '👁️', RESOLVED: '✅', DISMISSED: '❌' }

/* ── Report Detail Modal ─────────────────────────────────────────────────── */
function ReportDetailModal({ report, onClose, onUpdated }) {
  const toast = useToast()
  const [status, setStatus] = useState(report.status)
  const [adminNote, setAdminNote] = useState(report.adminNote || '')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status })
      if (adminNote.trim()) params.append('adminNote', adminNote.trim())
      const { data } = await api.put(`/api/reports/${report.id}/status?${params}`)
      toast('Report updated', 'success')
      onUpdated(data)
      onClose()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update', 'danger')
    } finally { setLoading(false) }
  }

  const sc = STATUS_COLORS[report.status] || STATUS_COLORS.PENDING

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🚩 Report #{report.id}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Status badge */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
              {STATUS_ICONS[report.status]} {report.status}
            </span>
            <span className="badge badge-gray">{report.type}</span>
          </div>

          {/* Subject & description */}
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{report.subject}</div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
            {report.description}
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Reported By</div>
              <div style={{ fontWeight: 600 }}>{report.reporterName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.reporterEmail}</div>
            </div>
            {report.reportedUserName && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Reported User</div>
                <div style={{ fontWeight: 600 }}>{report.reportedUserName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.reportedUserEmail}</div>
              </div>
            )}
            {report.taskId && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Task ID</div>
                <div style={{ fontWeight: 600 }}>#{report.taskId}</div>
              </div>
            )}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Submitted</div>
              <div style={{ fontWeight: 600 }}>{new Date(report.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Admin actions */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Admin Action</div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="PENDING">🕐 Pending</option>
                <option value="REVIEWED">👁️ Reviewed</option>
                <option value="RESOLVED">✅ Resolved</option>
                <option value="DISMISSED">❌ Dismissed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Note (sent to reporter)</label>
              <textarea className="form-textarea" rows={3}
                placeholder="Optional note to the reporter about the outcome..."
                value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
            <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-md" onClick={save} disabled={loading}>
              {loading ? <><span className="spinner spinner-white spinner-sm" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Admin Panel ────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const toast = useToast()
  const [tab, setTab] = useState('users')

  // Users state
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTaskId, setDeleteTaskId] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Reports state
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportStats, setReportStats] = useState({})
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

  const fetchUsers = () => {
    setUsersLoading(true)
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => toast('Failed to load users.', 'danger'))
      .finally(() => setUsersLoading(false))
  }

  const fetchReports = () => {
    setReportsLoading(true)
    const url = statusFilter ? `/api/reports?status=${statusFilter}` : '/api/reports'
    Promise.all([api.get(url), api.get('/api/reports/stats')])
      .then(([r, s]) => { setReports(r.data); setReportStats(s.data) })
      .catch(() => toast('Failed to load reports.', 'danger'))
      .finally(() => setReportsLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { if (tab === 'reports') fetchReports() }, [tab, statusFilter])

  const banUser = async (id, ban) => {
    const name = users.find(u => u.id === id)?.name
    if (!confirm(`${ban ? 'Ban' : 'Unban'} ${name}?`)) return
    setActing(id)
    try {
      await api.put(ban ? `/admin/banuser/${id}` : `/admin/Unbanuser/${id}`)
      toast(`${name} has been ${ban ? 'banned' : 'unbanned'}.`, ban ? 'warning' : 'success')
      fetchUsers()
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed.', 'danger')
    } finally { setActing(null) }
  }

  const deleteUser = async (id) => {
    const name = users.find(u => u.id === id)?.name
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return
    setActing(id)
    try {
      await api.delete(`/admin/users/${id}`)
      toast(`${name} has been deleted.`, 'success')
      fetchUsers()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete user.', 'danger')
    } finally { setActing(null) }
  }

  const deleteTask = async () => {
    if (!deleteTaskId) return
    if (!confirm(`Delete task #${deleteTaskId}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/admin/delete/${deleteTaskId}`)
      toast(`Task #${deleteTaskId} deleted.`, 'success')
      setDeleteTaskId('')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete task.', 'danger')
    } finally { setDeleting(false) }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const counts = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    companies: users.filter(u => u.role === 'COMPANY').length,
    banned: users.filter(u => !u.active).length,
  }

  const TABS = [
    { id: 'users',   label: '👥 Users' },
    { id: 'reports', label: `🚩 Reports${reportStats.pending > 0 ? ` (${reportStats.pending})` : ''}` },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === t.id ? 700 : 400, fontSize: 14,
            color: tab === t.id ? 'var(--blue)' : 'var(--text-muted)',
            borderBottom: tab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
            marginBottom: -2
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Users', value: counts.total,    accent: 'accent-primary',   emoji: '👥' },
              { label: 'Students',    value: counts.students,  accent: 'accent-info',      emoji: '🎓' },
              { label: 'Companies',   value: counts.companies, accent: 'accent-secondary', emoji: '🏢' },
              { label: 'Banned',      value: counts.banned,    accent: 'accent-danger',    emoji: '🚫' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.accent}`}>
                <div className="stat-icon">{s.emoji}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><span className="card-title">🗑️ Delete Task by ID</span></div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '0 0 200px' }}>
                <label className="form-label">Task ID</label>
                <input className="form-control" type="number" placeholder="Enter task ID"
                  value={deleteTaskId} onChange={e => setDeleteTaskId(e.target.value)} />
              </div>
              <button className="btn btn-danger btn-md" onClick={deleteTask} disabled={deleting || !deleteTaskId}>
                {deleting ? <><span className="spinner spinner-white spinner-sm" /> Deleting...</> : '🗑️ Delete Task'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginRight: 'auto' }}>All Users</div>
              <div className="search-wrapper" style={{ minWidth: 200 }}>
                <span className="search-icon">🔍</span>
                <input className="form-control" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="COMPANY">Company</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {usersLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{u.email}</td>
                        <td><span className={`badge badge-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                        <td><span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>{u.active ? '✅ Active' : '🚫 Banned'}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="col-actions">
                          {u.role !== 'ADMIN' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              {u.active
                                ? <button className="btn btn-warning btn-sm" disabled={acting === u.id} onClick={() => banUser(u.id, true)}>
                                    {acting === u.id ? <span className="spinner spinner-white spinner-sm" /> : '🚫 Ban'}
                                  </button>
                                : <button className="btn btn-success btn-sm" disabled={acting === u.id} onClick={() => banUser(u.id, false)}>
                                    {acting === u.id ? <span className="spinner spinner-white spinner-sm" /> : '✅ Unban'}
                                  </button>
                              }
                              <button className="btn btn-danger btn-sm" disabled={acting === u.id} onClick={() => deleteUser(u.id)}>
                                🗑️
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── REPORTS TAB ── */}
      {tab === 'reports' && (
        <>
          {/* Report stats */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total',     value: reportStats.total     || 0, accent: 'accent-primary',   emoji: '📋' },
              { label: 'Pending',   value: reportStats.pending   || 0, accent: 'accent-danger',    emoji: '🕐' },
              { label: 'Reviewed',  value: reportStats.reviewed  || 0, accent: 'accent-info',      emoji: '👁️' },
              { label: 'Resolved',  value: reportStats.resolved  || 0, accent: 'accent-secondary', emoji: '✅' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.accent}`}>
                <div className="stat-icon">{s.emoji}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}>
                {s ? `${STATUS_ICONS[s]} ${s}` : 'All'}
              </button>
            ))}
          </div>

          {reportsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚩</div>
              <div className="empty-state-title">No reports found</div>
              <div className="empty-state-description">No reports match the current filter.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.map(r => {
                const sc = STATUS_COLORS[r.status] || STATUS_COLORS.PENDING
                return (
                  <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'box-shadow .15s' }}
                    onClick={() => setSelectedReport(r)}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {STATUS_ICONS[r.status]} {r.status}
                          </span>
                          <span className="badge badge-gray" style={{ fontSize: 11 }}>{r.type}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{r.subject}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{r.id}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>by {r.reporterName}</div>
                      </div>
                    </div>
                    {r.reportedUserName && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                        Reported user: <strong>{r.reportedUserName}</strong>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={(updated) => {
            setReports(prev => prev.map(r => r.id === updated.id ? updated : r))
            fetchReports()
          }}
        />
      )}
    </div>
  )
}
