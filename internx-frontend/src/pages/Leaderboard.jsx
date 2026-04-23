import { useState, useEffect } from 'react'
import api from '../api/axios'

const MEDAL = ['gold', 'silver', 'bronze']
const MEDAL_EMOJI = ['🥇', '🥈', '🥉']

function StarDisplay({ rating }) {
  const full = Math.round(rating || 0)
  return (
    <div className="star-display">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star${n <= full ? ' filled' : ''}`}>★</span>
      ))}
    </div>
  )
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(r => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 24,
        color: 'white', display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 4px 14px rgba(245,158,11,.35)'
      }}>
        <span style={{ fontSize: 48 }}>🏆</span>
        <div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Top Students</div>
          <div style={{ opacity: .85, fontSize: 'var(--text-sm)' }}>
            Ranked by average rating and tasks completed
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No rankings yet</div>
          <div className="empty-state-description">Complete tasks and get rated to appear on the leaderboard.</div>
        </div>
      ) : (
        <div className="leaderboard-list">
          {entries.map((e, i) => (
            <div key={i} className={`leaderboard-item${i < 3 ? ` rank-${i + 1}` : ''}`}>
              <div className={`rank-medal ${i < 3 ? MEDAL[i] : 'other'}`}>
                {i < 3 ? MEDAL_EMOJI[i] : i + 1}
              </div>
              <div className="leaderboard-avatar">
                {e.studentname?.[0]?.toUpperCase()}
              </div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">{e.studentname}</div>
                <div className="leaderboard-meta">
                  {e.totalTaskCompleted} task{e.totalTaskCompleted !== 1 ? 's' : ''} completed
                  {e.totalRatings > 0 && ` · ${e.totalRatings} rating${e.totalRatings !== 1 ? 's' : ''}`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <StarDisplay rating={e.averageRating} />
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--secondary)', marginTop: 2 }}>
                  {e.averageRating ? e.averageRating.toFixed(1) : '—'} / 5
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
