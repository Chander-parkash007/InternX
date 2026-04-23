import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function RateModal({ submission, taskId, onClose, onRated }) {
  const toast = useToast()
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/ratings', {
        toUserId: submission.studentId,
        taskId: Number(taskId),
        rating,
        feedback,
      })
      toast(`Rated ${submission.studentName} successfully!`, 'success')
      onRated()
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'Rating failed.', 'danger')
    } finally { setLoading(false) }
  }

  const displayRating = hovered || rating

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">⭐ Rate {submission.studentName}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>
                How would you rate this work?
              </label>
              <div className="star-rating" style={{ justifyContent: 'center', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`star-btn${displayRating >= n ? ' active' : ''}`}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                  >★</button>
                ))}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][displayRating]}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Feedback (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts on the work quality..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                style={{ minHeight: 80 }}
              />
            </div>
            <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? <><span className="spinner spinner-white spinner-sm" /> Submitting...</> : '⭐ Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function TaskSubmissions() {
  const { taskId } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rateTarget, setRateTarget] = useState(null)

  const fetchSubs = () => {
    setLoading(true)
    api.get(`/api/submissions/task/${taskId}`)
      .then(r => setSubs(r.data))
      .catch(() => toast('Failed to load submissions.', 'danger'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubs() }, [taskId])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/my-tasks')}>
        ← Back to My Tasks
      </button>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
            Submissions for Task #{taskId}
          </div>
          <span className="badge badge-primary">{subs.length} submission{subs.length !== 1 ? 's' : ''}</span>
        </div>

        {subs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <div className="empty-state-title">No submissions yet</div>
            <div className="empty-state-description">Accepted students haven't submitted their work yet.</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>GitHub</th>
                  <th>Description</th>
                  <th>Submitted</th>
                  <th className="col-actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0
                        }}>
                          {s.studentName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.studentName}</span>
                      </div>
                    </td>
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
                    <td className="col-actions">
                      <button className="btn btn-warning btn-sm" onClick={() => setRateTarget(s)}>
                        ⭐ Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rateTarget && (
        <RateModal
          submission={rateTarget}
          taskId={taskId}
          onClose={() => setRateTarget(null)}
          onRated={() => setRateTarget(null)}
        />
      )}
    </div>
  )
}
