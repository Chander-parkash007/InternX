import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const TYPES = [
  { value: 'USER',                   label: '👤 Report a User' },
  { value: 'TASK',                   label: '📋 Report a Task' },
  { value: 'MESSAGE',                label: '💬 Report a Message' },
  { value: 'SPAM',                   label: '🚫 Spam' },
  { value: 'HARASSMENT',             label: '😡 Harassment' },
  { value: 'INAPPROPRIATE_CONTENT',  label: '⚠️ Inappropriate Content' },
  { value: 'FRAUD',                  label: '🔴 Fraud / Scam' },
  { value: 'OTHER',                  label: '📝 Other' },
]

export default function ReportModal({ onClose, prefillUserId, prefillUserName, prefillTaskId, prefillType }) {
  const toast = useToast()
  const [form, setForm] = useState({
    type: prefillType || '',
    subject: '',
    description: '',
    reportedUserId: prefillUserId || '',
    taskId: prefillTaskId || '',
    messageId: '',
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type) { toast('Please select a report type', 'danger'); return }
    setLoading(true)
    try {
      await api.post('/api/reports', {
        type: form.type,
        subject: form.subject,
        description: form.description,
        reportedUserId: form.reportedUserId ? Number(form.reportedUserId) : null,
        taskId: form.taskId ? Number(form.taskId) : null,
        messageId: form.messageId ? Number(form.messageId) : null,
      })
      toast('Report submitted. Our team will review it shortly.', 'success')
      onClose()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit report', 'danger')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🚩 Submit a Report</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Reports are reviewed by our admin team. Please provide as much detail as possible.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Report Type <span className="required">*</span></label>
              <select className="form-select" required value={form.type} onChange={set('type')}>
                <option value="">Select a type...</option>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject <span className="required">*</span></label>
              <input className="form-control" required placeholder="Brief summary of the issue"
                value={form.subject} onChange={set('subject')} maxLength={120} />
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <textarea className="form-textarea" required rows={5}
                placeholder="Describe the issue in detail. Include any relevant context, dates, or evidence..."
                value={form.description} onChange={set('description')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Reported User ID</label>
                <input className="form-control" type="number" placeholder="Optional"
                  value={form.reportedUserId} onChange={set('reportedUserId')}
                  readOnly={!!prefillUserId} />
                {prefillUserName && (
                  <span className="form-hint">Reporting: {prefillUserName}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Task ID</label>
                <input className="form-control" type="number" placeholder="Optional"
                  value={form.taskId} onChange={set('taskId')}
                  readOnly={!!prefillTaskId} />
              </div>
            </div>

            <div style={{
              background: 'var(--warning-bg, #fffbeb)', border: '1px solid #fde68a',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 16
            }}>
              ⚠️ False reports may result in action against your account. Please only report genuine violations.
            </div>

            <div className="modal-footer" style={{ margin: '0 -24px -24px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-danger btn-md" disabled={loading}>
                {loading ? <><span className="spinner spinner-white spinner-sm" /> Submitting...</> : '🚩 Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
