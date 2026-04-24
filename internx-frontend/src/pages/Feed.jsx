import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🎉', label: 'Celebrate' },
]

// Map emoji → display label for the button
const REACTION_LABELS = {
  '👍': 'Like', '❤️': 'Love', '😂': 'Haha',
  '😮': 'Wow', '😢': 'Sad', '🎉': 'Celebrate',
}

/* ── Post Composer ─────────────────────────────────────────────────────── */
function PostComposer({ onPosted, profile }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('content', content)
      if (image) fd.append('image', image)
      await api.post('/api/posts', fd)
      toast('Post shared!', 'success')
      setContent(''); setImage(null); setPreview(null); setOpen(false)
      onPosted()
    } catch { toast('Failed to post.', 'danger') }
    finally { setLoading(false) }
  }

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
          {profile?.profilePicture ? <img src={profile.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
        {!open ? (
          <div onClick={() => setOpen(true)} style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 24, padding: '10px 16px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, background: 'var(--bg)', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Share an update, achievement, or thought...
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <textarea
              className="form-textarea"
              style={{ minHeight: 100, borderRadius: 12, resize: 'none', fontSize: 15 }}
              placeholder="What do you want to share?"
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
            {preview && (
              <div style={{ position: 'relative', marginTop: 8 }}>
                <img src={preview} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 10 }} />
                <button onClick={() => { setImage(null); setPreview(null) }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)) } }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setContent(''); setImage(null); setPreview(null) }}>Cancel</button>
                <button className="btn btn-primary btn-sm" disabled={!content.trim() || loading} onClick={submit}>
                  {loading ? <span className="spinner spinner-white spinner-sm" /> : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Post Card ─────────────────────────────────────────────────────────── */
function PostCard({ post, onLike, onComment, onDelete, isOwn, isHighlighted }) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [chosenReaction, setChosenReaction] = useState(null) // emoji string or null
  const reactionRef = useRef()
  const hoverTimer = useRef(null)

  const initials = post.authorName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const isLiked = post.isLikedByCurrentUser || false
  const likeCount = post.likeCount || 0
  const commentCount = post.commentCount || 0

  // The emoji shown on the button: chosen reaction, or 👍 if liked, or nothing
  const activeEmoji = chosenReaction || (isLiked ? '👍' : null)
  const activeLabel = activeEmoji ? (REACTION_LABELS[activeEmoji] || 'Like') : 'Like'

  // Close reaction picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target)) {
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLikeButtonClick = () => {
    // If picker is open, close it
    setShowReactions(false)
    clearTimeout(hoverTimer.current)
    // Toggle like with current reaction (or default 👍)
    onLike(post.id, isLiked, chosenReaction || '👍')
    if (isLiked) setChosenReaction(null)
  }

  const handleReactionPick = (emoji) => {
    setShowReactions(false)
    clearTimeout(hoverTimer.current)
    setChosenReaction(emoji)
    // If not yet liked, like it; if already liked with same emoji, unlike
    if (!isLiked || chosenReaction !== emoji) {
      onLike(post.id, false, emoji)
    }
  }

  const handleMouseEnterBtn = () => {
    hoverTimer.current = setTimeout(() => setShowReactions(true), 400)
  }
  const handleMouseLeaveBtn = () => {
    clearTimeout(hoverTimer.current)
  }

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return }
    if (comments.length > 0) { setShowComments(true); return }
    setLoadingComments(true)
    try {
      const { data } = await api.get(`/api/posts/${post.id}/comments`)
      setComments(data)
      setShowComments(true)
    } catch {} finally { setLoadingComments(false) }
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/api/posts/${post.id}/comments`, { content: commentText })
      setComments(prev => [...prev, data])
      setCommentText('')
      onComment(post.id)
    } catch {} finally { setSubmitting(false) }
  }

  const addEmoji = (emoji) => setCommentText(prev => prev + emoji)

  return (
    <div 
      id={`post-${post.id}`} 
      style={{ 
        background: 'var(--surface)', 
        border: isHighlighted ? '2px solid var(--blue)' : '1px solid var(--border)', 
        borderRadius: 12, 
        marginBottom: 16, 
        overflow: 'hidden',
        boxShadow: isHighlighted ? '0 4px 20px rgba(59, 130, 246, 0.2)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 16px 12px' }}>
        <div onClick={() => navigate(`/profile/${post.userId}`)} style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
          {post.authorPicture ? <img src={post.authorPicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={() => navigate(`/profile/${post.userId}`)} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', cursor: 'pointer', lineHeight: 1.3 }}>{post.authorName}</div>
          {post.authorHeadline && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.authorHeadline}</div>}
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{timeAgo(post.createdAt)}</div>
        </div>
        {isOwn && (
          <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4, borderRadius: 6, fontSize: 18, lineHeight: 1 }} title="Delete post">⋯</button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 12px', fontSize: 15, color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{post.content}</div>
      {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: '100%', maxHeight: 480, objectFit: 'cover' }} />}

      {/* Stats row */}
      {(likeCount > 0 || commentCount > 0) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', borderTop: '1px solid var(--border)' }}>
          <span>{likeCount > 0 && `${activeEmoji || '👍'} ${likeCount}`}</span>
          <span style={{ cursor: 'pointer' }} onClick={loadComments}>{commentCount > 0 && `${commentCount} comment${commentCount > 1 ? 's' : ''}`}</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '2px 8px' }}>
        {/* Like with reaction picker */}
        <div ref={reactionRef} style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={handleLikeButtonClick}
            onMouseEnter={handleMouseEnterBtn}
            onMouseLeave={handleMouseLeaveBtn}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 8, fontSize: 14, transition: 'background .15s',
              color: isLiked ? 'var(--blue)' : 'var(--text-2)',
              fontWeight: isLiked ? 600 : 400,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            {activeEmoji
              ? <span style={{ fontSize: 18, lineHeight: 1 }}>{activeEmoji}</span>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                </svg>
            }
            <span style={{ color: isLiked ? 'var(--blue)' : 'var(--text-2)' }}>{activeLabel}</span>
          </button>

          {/* Reaction picker — appears on hover hold */}
          {showReactions && (
            <div
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
              onMouseLeave={() => setShowReactions(false)}
              style={{
                position: 'absolute', bottom: '110%', left: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 32, padding: '8px 12px', display: 'flex', gap: 6,
                boxShadow: '0 4px 24px rgba(0,0,0,.15)', zIndex: 20, whiteSpace: 'nowrap',
                animation: 'reactionPop .15s ease'
              }}
            >
              {REACTIONS.map(r => (
                <button
                  key={r.label}
                  title={r.label}
                  onClick={() => handleReactionPick(r.emoji)}
                  style={{
                    background: chosenReaction === r.emoji ? 'var(--blue-bg)' : 'none',
                    border: 'none', cursor: 'pointer', fontSize: 24, padding: '4px 6px',
                    borderRadius: 10, transition: 'transform .12s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.35) translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
                >
                  {r.emoji}
                  <span style={{ fontSize: 9, color: 'var(--text-2)', fontWeight: 600 }}>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button
          onClick={loadComments}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: 'var(--text-2)', fontSize: 14, transition: 'background .15s' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Comment
        </button>
      </div>

      {/* Comments section */}
      {(showComments || loadingComments) && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: '12px 16px' }}>
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 16 }}><span className="spinner spinner-sm" /></div>
          ) : (
            <>
              {comments.map(c => {
                const ci = c.authorName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                const commentUserId = c.userId || c.authorId
                return (
                  <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div
                      onClick={() => commentUserId && navigate(`/profile/${commentUserId}`)}
                      style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {c.authorPicture ? <img src={c.authorPicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ci}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: 'var(--surface)', borderRadius: '0 12px 12px 12px', padding: '8px 12px', display: 'inline-block', maxWidth: '100%' }}>
                        <div
                          onClick={() => commentUserId && navigate(`/profile/${commentUserId}`)}
                          style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, cursor: 'pointer', color: 'var(--blue)' }}
                        >
                          {c.authorName}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{c.content}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3, marginLeft: 4 }}>{timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                )
              })}
              <CommentInput value={commentText} onChange={setCommentText} onSubmit={submitComment} onEmoji={addEmoji} submitting={submitting} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Comment Input with Emoji Picker ───────────────────────────────────── */
const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','😢','😡','👍','👎','❤️','🔥','🎉','✅','💯','🙏','👏','💪','🚀','⭐']

function CommentInput({ value, onChange, onSubmit, onEmoji, submitting }) {
  const [showEmoji, setShowEmoji] = useState(false)
  const emojiRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 24, padding: '6px 12px', gap: 6 }}>
        <input
          style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, color: 'var(--text)' }}
          placeholder="Write a comment..."
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit()}
        />
        {/* Emoji button */}
        <div ref={emojiRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowEmoji(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1, color: 'var(--text-muted)' }}>😊</button>
          {showEmoji && (
            <div style={{ position: 'absolute', bottom: '130%', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, boxShadow: '0 4px 20px rgba(0,0,0,.12)', zIndex: 20, width: 180 }}>
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={() => { onEmoji(e); setShowEmoji(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4, borderRadius: 6, transition: 'background .1s' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'none'}
                >{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onSubmit} disabled={!value.trim() || submitting} style={{ borderRadius: 24, padding: '8px 16px' }}>
        {submitting ? <span className="spinner spinner-white spinner-sm" /> : 'Post'}
      </button>
    </div>
  )
}

/* ── Main Feed ─────────────────────────────────────────────────────────── */
const PAGE_SIZE = 10

export default function Feed() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [posts, setPosts] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('all')
  const [highlightedPostId, setHighlightedPostId] = useState(null)
  const observerRef = useRef()
  const sentinelRef = useRef()

  useEffect(() => {
    api.get('/api/profile/myprofile').then(r => setProfile(r.data)).catch(() => {})
  }, [])

  // Handle post highlighting from notification deep-link
  useEffect(() => {
    const postId = location.state?.highlightPostId
    if (postId) {
      setHighlightedPostId(postId)
      // Clear the state to avoid re-highlighting on refresh
      navigate(location.pathname, { replace: true, state: {} })
      
      // Scroll to post after a short delay to ensure it's rendered
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Remove highlight after 3 seconds
          setTimeout(() => setHighlightedPostId(null), 3000)
        }
      }, 500)
    }
  }, [location.state, navigate, location.pathname])

  // Reset and reload when filter changes
  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(true)
    loadPage(0, true)
  }, [filter])

  const loadPage = useCallback(async (pageNum, reset = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true)
    try {
      let data
      if (filter === 'mine') {
        const res = await api.get(`/api/posts/user/${user?.id}`)
        const all = Array.isArray(res.data) ? res.data : []
        const from = pageNum * PAGE_SIZE
        const slice = all.slice(from, from + PAGE_SIZE)
        data = { content: slice, hasMore: from + PAGE_SIZE < all.length }
      } else {
        const endpoint = filter === 'connections' ? '/api/feed/paged' : '/api/feed/all/paged'
        const res = await api.get(`${endpoint}?page=${pageNum}&size=${PAGE_SIZE}`)
        data = res.data
      }
      const newPosts = data.content || []
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
      setHasMore(data.hasMore ?? newPosts.length === PAGE_SIZE)
      setPage(pageNum)
    } catch {
      setPosts(prev => reset ? [] : prev)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter, user?.id])

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        loadPage(page + 1)
      }
    }, { threshold: 0.1 })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loadingMore, loading, page, loadPage])

  const handleLike = async (postId, isLiked, emoji = '👍') => {
    // Optimistic update immediately
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLikedByCurrentUser: !isLiked, likeCount: (p.likeCount || 0) + (isLiked ? -1 : 1) }
        : p
    ))
    try {
      if (isLiked) {
        await api.delete(`/api/posts/${postId}/like`)
      } else {
        await api.post(`/api/posts/${postId}/like`)
      }
    } catch (err) {
      // Revert optimistic update on failure
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLikedByCurrentUser: isLiked, likeCount: (p.likeCount || 0) + (isLiked ? 1 : -1) }
          : p
      ))
      const msg = err.response?.data?.message || err.response?.data || ''
      // Ignore "already liked" errors — they're harmless
      if (!String(msg).toLowerCase().includes('already')) {
        toast('Failed to update like', 'danger')
      }
    }
  }

  const handleComment = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/api/posts/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast('Post deleted', 'success')
    } catch { toast('Failed to delete', 'danger') }
  }

  const FILTERS = [
    { key: 'all', label: 'All Posts' },
    { key: 'connections', label: 'My Network' },
    { key: 'mine', label: 'My Posts' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 10 }}>Feed</h1>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 4, width: 'fit-content' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filter === f.key ? 600 : 400, background: filter === f.key ? 'var(--blue)' : 'none', color: filter === f.key ? '#fff' : 'var(--text-muted)', transition: 'all .15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <PostComposer onPosted={() => { setPosts([]); setPage(0); setHasMore(true); loadPage(0, true) }} profile={profile} />

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
          <div className="empty-state-title">No posts yet</div>
          <div className="empty-state-description">{filter === 'connections' ? 'Connect with others to see their posts here' : 'Be the first to share something!'}</div>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike} 
              onComment={handleComment} 
              onDelete={handleDelete} 
              isOwn={post.userId === user?.id}
              isHighlighted={post.id === highlightedPostId}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 20 }} />

          {loadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div className="spinner" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0 32px', fontSize: 13, color: 'var(--text-muted)' }}>
              You're all caught up ✓
            </div>
          )}
        </>
      )}
    </div>
  )
}
