import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function SubmitModal({ onClose, onSubmitted }) {
  const toast = useToast()
  const [form, setForm] = useState({ taskId: '', githubLink: '', fileUrl: '', description: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/submissions/submit', { ...form, taskId: Number(form.taskId) })
      toast('Work submitted successfully!', 'success')
      onSubmitted()
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'Submission failed.', 'danger')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📤 Submit Work</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Task ID <span className="required">*</span></label>
              <input className="form-control" type="number" required placeholder="Enter the task ID"
                value={form.taskId} onChange={set('taskId')} />
              <span className="form-hint">You can find the Task ID in your accepted applications.</span>
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Repository Link</label>
              <input className="form-control" type="url" placeholder="https://github.com/username/repo"
                value={form.githubLink} onChange={set('githubLink')} />
            </div>
            <div className="form-group">
              <label className="form-label">File URL (optional)</label>
              <input className="form-control" type="url" placeholder="https://drive.google.com/..."
                value={form.fileUrl} onChange={set('fileUrl')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description / Notes</label>
              <textarea className="form-textarea" placeholder="Describe what you built, any notes for the reviewer..."
                value={form.description} onChange={set('description')} />
            </div>
            <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? <><span className="spinner spinner-white spinner-sm" /> Submitting...</> : '📤 Submit Work'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function MySubmissions() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchSubs = () => {
    setLoading(true)
    api.get('/api/submissions/my')
      .then(r => setSubs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubs() }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary btn-md" onClick={() => setShowModal(true)}>
          + Submit Work
        </button>
      </div>

      {subs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📤</div>
          <div className="empty-state-title">No submissions yet</div>
          <div className="empty-state-description">
            Once your application is accepted, submit your work here.
          </div>
          <button className="btn btn-primary btn-md" onClick={() => setShowModal(true)}>
            Submit Work
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>GitHub</th>
                  <th>Description</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td><div style={{ fontWeight: 600 }}>{s.taskTitle}</div></td>
                    <td>
                      {s.githubLink
                        ? <a href={s.githubLink} target="_blank" rel="noreferrer"
                            className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                            🔗 View Repo
                          </a>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.description || '—'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <SubmitModal onClose={() => setShowModal(false)} onSubmitted={() => { setShowModal(false); fetchSubs() }} />
      )}
    </div>
  )
}
