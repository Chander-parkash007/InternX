import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Something went wrong. Try again.')
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
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset token</p>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {sent ? (
          <div>
            <div style={{ background: 'var(--success-bg)', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: 'var(--text-sm)', marginBottom: 20, lineHeight: 1.6 }}>
              ✅ Email sent! Check your inbox for the reset token. It expires in 15 minutes.
            </div>
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={() => navigate('/reset-password')}
            >
              Enter Reset Token →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
              {loading ? <><span className="spinner spinner-white spinner-sm" /> Sending...</> : 'Send Reset Token'}
            </button>
          </form>
        )}

        <div className="auth-footer"><Link to="/login">← Back to Sign In</Link></div>
      </div>
    </div>
  )
}
