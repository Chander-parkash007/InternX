import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const EyeIcon = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMsg('')

    if (!token.trim()) {
      setError('Please enter the reset token from your email.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/reset-password', { token: token.trim(), newPassword })
      setMsg(typeof data === 'string' ? data : data?.message || 'Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Reset failed. The token may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">IX</div>
          <span className="auth-logo-text">Intern<span>X</span></span>
        </div>
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Enter the token from your email and choose a new password</p>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}
        {msg && (
          <div style={{ background: 'var(--success-bg)', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            ✅ {msg} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reset Token</label>
            <input
              className="form-control"
              type="text"
              placeholder="Paste the token from your email"
              required
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <span className="form-hint">Check your inbox for the token we sent you</span>
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <EyeIcon show={showPw} />
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your new password"
                required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <EyeIcon show={showConfirm} />
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading || !!msg}>
            {loading ? <><span className="spinner spinner-white spinner-sm" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer"><Link to="/login">← Back to Sign In</Link></div>
      </div>
    </div>
  )
}
