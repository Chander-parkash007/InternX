import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function MyTasks() {
  const toast = useToast()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)

  const fetchTasks = () => {
    setLoading(true)
    api.get('/api/tasks/my')
      .then(r => setTasks(r.data))
      .catch(() => toast('Failed to load tasks.', 'danger'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const completeTask = async (id) => {
    if (!confirm('Mark this task as completed?')) return
    setCompleting(id)
    try {
      await api.put(`/api/tasks/${id}/complete`)
      toast('Task marked as completed!', 'success')
      fetchTasks()
    } catch (err) {
      toast(err.response?.data || 'Failed to complete task.', 'danger')
    } finally { setCompleting(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  const counts = {
    open: tasks.filter(t => t.status === 'OPEN').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Posted', value: tasks.length, accent: 'accent-primary', emoji: '📋' },
          { label: 'Open', value: counts.open, accent: 'accent-info', emoji: '🟢' },
          { label: 'In Progress', value: counts.inProgress, accent: 'accent-warning', emoji: '🔄' },
          { label: 'Completed', value: counts.completed, accent: 'accent-success', emoji: '✅' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.accent}`}>
            <div className="stat-icon">{s.emoji}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No tasks posted yet</div>
          <div className="empty-state-description">Go to Browse Tasks to post your first task and find talented interns.</div>
          <button className="btn btn-primary btn-md" onClick={() => navigate('/tasks')}>
            Post a Task
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td><div style={{ fontWeight: 600 }}>{t.title}</div></td>
                    <td><span className="badge badge-gray">{t.type}</span></td>
                    <td>
                      <span className={`badge badge-${t.difficulty?.toLowerCase()}`}>
                        {t.difficulty === 'EASY' ? '🟢' : t.difficulty === 'MEDIUM' ? '🟡' : '🔴'} {t.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status?.toLowerCase()}`}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {t.deadline}
                    </td>
                    <td className="col-actions">
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tasks/${t.id}/applicants`)}>
                          👥 Applicants
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tasks/${t.id}/submissions`)}>
                          📤 Submissions
                        </button>
                        {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={completing === t.id}
                            onClick={() => completeTask(t.id)}
                          >
                            {completing === t.id ? <span className="spinner spinner-white spinner-sm" /> : '✅ Complete'}
                          </button>
                        )}
                      </div>
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
