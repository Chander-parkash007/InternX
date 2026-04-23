import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import ReportModal from '../components/ReportModal'

/* ─── Generic Modal ─────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ─── Create Task Modal ──────────────────────────────────────────────────── */
function CreateTaskModal({ onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', type: '', difficulty: 'EASY', deadline: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/api/tasks', form)
      toast('Task posted successfully!', 'success')
      onCreated()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create task.', 'danger')
    } finally { setLoading(false) }
  }

  return (
    <Modal title="📋 Post New Task" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title <span className="required">*</span></label>
          <input className="form-control" required placeholder="e.g. Build a REST API" value={form.title} onChange={set('title')} />
        </div>
        <div className="form-group">
          <label className="form-label">Description <span className="required">*</span></label>
          <textarea className="form-textarea" required placeholder="Describe the task in detail..." value={form.description} onChange={set('description')} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <input className="form-control" required placeholder="e.g. Frontend, Backend" value={form.type} onChange={set('type')} />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="form-select" value={form.difficulty} onChange={set('difficulty')}>
              <option value="EASY">🟢 Easy</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HARD">🔴 Hard</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deadline <span className="required">*</span></label>
          <input className="form-control" type="date" required value={form.deadline} onChange={set('deadline')} />
        </div>
        <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
          <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
            {loading ? <><span className="spinner spinner-white spinner-sm" /> Posting...</> : '📋 Post Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Apply Modal ────────────────────────────────────────────────────────── */
function ApplyModal({ task, onClose, onApplied }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    try {
      await api.post(`/api/applications/${task.id}`)
      toast('Application submitted!', 'success')
      onApplied()
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'Failed to apply.', 'danger')
    } finally { setLoading(false) }
  }

  const daysLeft = task.deadline
    ? Math.ceil((new Date(task.deadline) - new Date()) / 86400000)
    : null

  return (
    <Modal title="Apply for Task" onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 8 }}>{task.title}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
          {task.description}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>
          {task.type && <span className="badge badge-gray">{task.type}</span>}
          {daysLeft !== null && (
            <span className={`badge ${daysLeft < 3 ? 'badge-danger' : 'badge-info'}`}>
              {daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed'}
            </span>
          )}
        </div>
      </div>
      <div style={{
        background: 'var(--primary-bg)', border: '1px solid var(--primary-light)',
        borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 'var(--text-sm)',
        color: 'var(--primary-dark)', marginBottom: 20
      }}>
        ℹ️ By applying, you express interest in this task. The company will review your profile and accept or reject your application.
      </div>
      <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
        <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-md" onClick={handleApply} disabled={loading}>
          {loading ? <><span className="spinner spinner-white spinner-sm" /> Applying...</> : '✅ Confirm Apply'}
        </button>
      </div>
    </Modal>
  )
}

/* ─── Company Profile Panel ──────────────────────────────────────────────── */
function CompanyPanel({ companyId, onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [connStatus, setConnStatus] = useState('NONE') // NONE | PENDING | CONNECTED
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/profile/${companyId}`),
      api.get(`/api/posts/user/${companyId}`),
      api.get(`/api/connections/status/${companyId}`),
    ]).then(([p, po, cs]) => {
      setProfile(p.data)
      setPosts(po.data || [])
      setConnStatus(cs.data) // "CONNECTED" | "PENDING" | "NONE"
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [companyId])

  const handleFollow = async () => {
    setActionLoading(true)
    try {
      await api.post(`/api/connections/request/${companyId}`)
      setConnStatus('PENDING')
      toast('Follow request sent!', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send request', 'danger')
    } finally { setActionLoading(false) }
  }

  const handleUnfollow = async () => {
    setActionLoading(true)
    try {
      await api.delete(`/api/connections/${companyId}`)
      setConnStatus('NONE')
      toast('Unfollowed', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'danger')
    } finally { setActionLoading(false) }
  }

  const handleMessage = () => {
    navigate('/messages', { state: { openUserId: companyId } })
    onClose()
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          zIndex: 1000, backdropFilter: 'blur(2px)'
        }}
      />

      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--surface)', zIndex: 1001, overflowY: 'auto',
        boxShadow: '-4px 0 32px rgba(0,0,0,.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .22s ease'
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: 12, left: 12, zIndex: 2,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '12px 0 0 12px', flexShrink: 0,
            color: 'var(--text)', fontSize: 16
          }}
        >✕</button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : !profile ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Profile not found</div>
        ) : (
          <>
            {/* Cover + Avatar */}
            <div style={{ position: 'relative', marginTop: -44 }}>
              <div style={{
                height: 120, background: profile.coverPhoto
                  ? `url(${profile.coverPhoto}) center/cover`
                  : 'linear-gradient(135deg, var(--blue) 0%, #6366f1 100%)'
              }} />
              <div style={{
                position: 'absolute', bottom: -36, left: 20,
                width: 72, height: 72, borderRadius: '50%',
                border: '3px solid var(--surface)',
                background: 'var(--blue)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, overflow: 'hidden'
              }}>
                {profile.profilePicture
                  ? <img src={profile.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '8px 16px 0' }}>
              {user?.role === 'STUDENT' && (
                <>
                  {connStatus === 'CONNECTED' ? (
                    <button className="btn btn-outline btn-sm" onClick={handleUnfollow} disabled={actionLoading}>
                      {actionLoading ? <span className="spinner spinner-sm" /> : '✓ Following'}
                    </button>
                  ) : connStatus === 'PENDING' ? (
                    <button className="btn btn-ghost btn-sm" disabled>⏳ Pending</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={handleFollow} disabled={actionLoading}>
                      {actionLoading ? <span className="spinner spinner-white spinner-sm" /> : '+ Follow'}
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={handleMessage}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Message
                  </button>
                </>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => { navigate(`/profile/${companyId}`); onClose() }}>
                View Full Profile
              </button>
            </div>

            {/* Info */}
            <div style={{ padding: '44px 20px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{profile.name}</div>
              {profile.headline && (
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>{profile.headline}</div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <span className="badge badge-company">Company</span>
                {profile.location && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            {/* About */}
            {profile.bio && (
              <div style={{ padding: '0 20px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>About</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{profile.bio}</p>
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />

            {/* Posts */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
                Posts ({posts.length})
              </div>
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  No posts yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {posts.map(p => (
                    <div key={p.id} style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 14
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: p.imageUrl ? 10 : 0 }}>
                        {p.content}
                      </div>
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt="" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 200 }} />
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

/* ─── Task Card ──────────────────────────────────────────────────────────── */
function TaskCard({ task, onApply, onViewCompany, onReport, isStudent }) {
  const daysLeft = task.deadline
    ? Math.ceil((new Date(task.deadline) - new Date()) / 86400000)
    : null
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-card-title">{task.title}</div>
        <span className={`badge badge-${task.status?.toLowerCase()}`}>{task.status?.replace('_', ' ')}</span>
      </div>

      <div className="task-card-meta">
        <span className={`badge badge-${task.difficulty?.toLowerCase()}`}>
          {task.difficulty === 'EASY' ? '🟢' : task.difficulty === 'MEDIUM' ? '🟡' : '🔴'} {task.difficulty}
        </span>
        {task.type && <span className="badge badge-gray">{task.type}</span>}
      </div>

      <div className="task-card-description">{task.description}</div>

      <div className="task-card-footer">
        {/* Clickable company name */}
        <button
          onClick={() => task.postedById && onViewCompany(task.postedById)}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: task.postedById ? 'pointer' : 'default',
            fontSize: 'inherit', color: task.postedById ? 'var(--blue)' : 'var(--text-muted)',
            fontWeight: task.postedById ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          🏢 {task.postedBy}
          {task.postedById && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
        </button>
        <span className={`task-card-deadline${isUrgent ? ' urgent' : ''}`}>
          📅 {task.deadline}{isUrgent && ' ⚠️'}
        </span>
      </div>

      {isStudent && task.status === 'OPEN' && (
        <button className="btn btn-primary btn-md btn-full" style={{ marginTop: 10 }} onClick={() => onApply(task)}>
          Apply Now →
        </button>
      )}
      <button
        onClick={() => onReport(task)}
        style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        🚩 Report this task
      </button>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState({ difficulty: '', type: '', status: '', keyword: '' })
  const [showCreate, setShowCreate] = useState(false)
  const [applyTask, setApplyTask] = useState(null)
  const [companyPanelId, setCompanyPanelId] = useState(null)
  const [reportTask, setReportTask] = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, size: 12 })
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.keyword) params.append('keyword', filters.keyword)
      const { data } = await api.get(`/api/tasks?${params}`)
      setTasks(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setTasks([])
    } finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(0) }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
            {user?.role === 'STUDENT' ? 'Find your next internship task' : 'Browse Tasks'}
          </div>
          {!loading && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
              {totalElements} task{totalElements !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
        {user?.role === 'COMPANY' && (
          <button className="btn btn-primary btn-md" onClick={() => setShowCreate(true)}>+ Post Task</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input className="form-control" placeholder="Search tasks..." value={filters.keyword} onChange={e => setFilter('keyword', e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: 150 }} value={filters.difficulty} onChange={e => setFilter('difficulty', e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 150 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input className="form-control" style={{ width: 'auto', minWidth: 150 }} placeholder="Type (e.g. Frontend)" value={filters.type} onChange={e => setFilter('type', e.target.value)} />
        {(filters.keyword || filters.difficulty || filters.status || filters.type) && (
          <button className="btn btn-ghost btn-md" onClick={() => { setFilters({ difficulty: '', type: '', status: '', keyword: '' }); setPage(0) }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
          </div>
          <div className="empty-state-title">No tasks found</div>
          <div className="empty-state-description">Try adjusting your filters or check back later.</div>
          {user?.role === 'COMPANY' && (
            <button className="btn btn-primary btn-md" onClick={() => setShowCreate(true)}>Post the first task</button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isStudent={user?.role === 'STUDENT'}
              onApply={setApplyTask}
              onViewCompany={setCompanyPanelId}
              onReport={setReportTask}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = totalPages <= 7 ? i : (page < 4 ? i : page - 3 + i)
            if (p >= totalPages) return null
            return (
              <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p + 1}</button>
            )
          })}
          <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchTasks() }} />}
      {applyTask && <ApplyModal task={applyTask} onClose={() => setApplyTask(null)} onApplied={() => setApplyTask(null)} />}
      {companyPanelId && <CompanyPanel companyId={companyPanelId} onClose={() => setCompanyPanelId(null)} />}
      {reportTask && (
        <ReportModal
          onClose={() => setReportTask(null)}
          prefillTaskId={reportTask.id}
          prefillType="TASK"
        />
      )}
    </div>
  )
}
