import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Try again.')
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join InternX and start your journey</p>

        {error && (
          <div style={{
            background: 'var(--danger-bg)', color: '#991b1b', border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)',
            marginBottom: 16
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: 'var(--success-bg)', color: '#065f46', border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)',
            marginBottom: 16
          }}>✅ {success}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" type="text" placeholder="John Doe" required
              value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" placeholder="you@example.com" required
              value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" required minLength={6}
                value={form.password} onChange={set('password')} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <EyeIcon show={showPw} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              {[
                { value: 'STUDENT', emoji: '🎓', label: 'Student / Intern' },
                { value: 'COMPANY', emoji: '🏢', label: 'Company / Recruiter' },
              ].map(r => (
                <div
                  key={r.value}
                  className={`role-option${form.role === r.value ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                >
                  <div className="role-option-icon">{r.emoji}</div>
                  <div className="role-option-label">{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner spinner-white spinner-sm" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
