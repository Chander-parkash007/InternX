import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import ImageCropModal from '../components/ImageCropModal'
import ReportModal from '../components/ReportModal'

/* ---- helpers ---- */
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m`
  if (s < 86400) return `${Math.floor(s/3600)}h`
  return `${Math.floor(s/86400)}d`
}
const LEVEL_COLORS = {
  Beginner:     { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
  Intermediate: { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe' },
  Advanced:     { bg:'#fdf4ff', color:'#7e22ce', border:'#e9d5ff' },
  Expert:       { bg:'#fff7ed', color:'#9a3412', border:'#fed7aa' },
}

/* ---- Edit Profile Modal ---- */
function EditModal({ profile, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: profile.name||'', headline: profile.headline||'',
    bio: profile.bio||'', location: profile.location||'', website: profile.website||'',
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const save = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.put('/api/profile/update', form)
      toast('Profile updated!', 'success')
      onSaved(data)
    } catch { toast('Update failed.', 'danger') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit intro</span>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Full name <span className="required">*</span></label>
              <input className="form-control" required value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Headline</label>
              <input className="form-control" placeholder="e.g. Full Stack Developer | Open to Internships" value={form.headline} onChange={set('headline')} />
              <span className="form-hint">Appears right below your name</span>
            </div>
            <div className="form-group">
              <label className="form-label">About</label>
              <textarea className="form-textarea" rows={5} placeholder="Tell companies about yourself..." value={form.bio} onChange={set('bio')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="City, Country" value={form.location} onChange={set('location')} />
              </div>
              <div className="form-group">
                <label className="form-label">Website / Portfolio</label>
                <input className="form-control" type="url" placeholder="https://" value={form.website} onChange={set('website')} />
              </div>
            </div>
            <div className="modal-footer" style={{margin:'0 -20px -20px',borderRadius:'0 0 var(--r-xl) var(--r-xl)'}}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? <><span className="spinner spinner-white spinner-sm"/>Saving...</> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ---- Add Skill Modal ---- */
function SkillModal({ onClose, onAdded }) {
  const toast = useToast()
  const [form, setForm] = useState({ skillName:'', level:'Intermediate' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const save = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/api/skills', form)
      toast('Skill added!', 'success'); onAdded()
    } catch { toast('Failed.', 'danger') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add skill</span>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Skill <span className="required">*</span></label>
              <input className="form-control" required placeholder="e.g. React, Python, Figma" value={form.skillName} onChange={set('skillName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={form.level} onChange={set('level')}>
                <option>Beginner</option><option>Intermediate</option>
                <option>Advanced</option><option>Expert</option>
              </select>
            </div>
            <div className="modal-footer" style={{margin:'0 -20px -20px',borderRadius:'0 0 var(--r-xl) var(--r-xl)'}}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? <span className="spinner spinner-white spinner-sm"/> : 'Add skill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ---- Post Composer ---- */
function PostComposer({ profile, onPosted }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const pickImage = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImage(f)
    setPreview(URL.createObjectURL(f))
  }

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

  const initials = profile?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  return (
    <div className="post-composer">
      <div className="post-composer-top">
        <div className="post-author-avatar" style={{width:44,height:44,fontSize:16}}>
          {profile?.profilePicture ? <img src={profile.profilePicture} alt=""/> : initials}
        </div>
        {!open
          ? <div className="post-composer-input" onClick={() => setOpen(true)}>
              Share an achievement, update, or thought...
            </div>
          : <div style={{flex:1}}>
              <textarea
                className="form-textarea"
                style={{minHeight:100,borderRadius:'var(--r-lg)',resize:'none'}}
                placeholder="What do you want to share?"
                value={content}
                onChange={e => setContent(e.target.value)}
                autoFocus
              />
              {preview && (
                <div style={{position:'relative',marginTop:8}}>
                  <img src={preview} alt="" style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:'var(--r-md)'}}/>
                  <button onClick={() => {setImage(null);setPreview(null)}} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.6)',color:'#fff',border:'none',borderRadius:'var(--r-full)',width:24,height:24,cursor:'pointer',fontSize:14}}>&#x2715;</button>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={pickImage}/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => {setOpen(false);setContent('');setImage(null);setPreview(null)}}>Cancel</button>
                  <button className="btn btn-primary btn-sm" disabled={!content.trim()||loading} onClick={submit}>
                    {loading ? <span className="spinner spinner-white spinner-sm"/> : 'Post'}
                  </button>
                </div>
              </div>
            </div>
        }
      </div>
      {!open && (
        <div className="post-composer-actions">
          <button className="post-action-btn" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Photo</span>
          </button>
          <button className="post-action-btn" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Write article</span>
          </button>
        </div>
      )}
    </div>
  )
}

/* ---- Post Card ---- */
function PostCard({ post, isOwn, onDelete }) {
  const navigate = useNavigate()
  const initials = post.authorName?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
  return (
    <div className="post-card">
      <div className="post-card-header">
        <div style={{display:'flex',alignItems:'flex-start',gap:10,flex:1}}>
          <div className="post-author-avatar" onClick={() => navigate(`/profile/${post.userId}`)}>
            {post.authorPicture ? <img src={post.authorPicture} alt=""/> : initials}
          </div>
          <div className="post-author-info">
            <div className="post-author-name" onClick={() => navigate(`/profile/${post.userId}`)}>{post.authorName}</div>
            {post.authorHeadline && <div className="post-author-headline">{post.authorHeadline}</div>}
            <div className="post-time">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        {isOwn && (
          <button className="btn btn-ghost btn-xs" onClick={() => onDelete(post.id)} style={{color:'var(--red)'}}>Delete</button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      {post.imageUrl && <img className="post-image" src={post.imageUrl} alt=""/>}
    </div>
  )
}

/* ---- Main Profile Page ---- */
export default function Profile() {
  const { userId } = useParams()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connStatus, setConnStatus] = useState('NONE')
  const [connLoading, setConnLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showSkill, setShowSkill] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [cropType, setCropType] = useState(null)
  const avatarRef = useRef()
  const coverRef = useRef()
  const isOwn = !userId

  const fetchProfile = () => {
    setLoading(true)
    const url = isOwn ? '/api/profile/myprofile' : `/api/profile/${userId}`
    api.get(url).then(r => setProfile(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  const fetchPosts = () => {
    const uid = userId || profile?.id
    if (!uid) return
    api.get(`/api/posts/user/${uid}`).then(r => setPosts(r.data)).catch(() => {})
  }

  const fetchConnStatus = () => {
    if (!userId) return
    api.get(`/api/connections/status/${userId}`).then(r => setConnStatus(r.data)).catch(() => {})
  }

  useEffect(() => { fetchProfile() }, [userId])
  useEffect(() => { if (profile) { fetchPosts(); fetchConnStatus() } }, [profile?.id])

  const handleConnect = async () => {
    setConnLoading(true)
    try {
      await api.post(`/api/connections/request/${userId}`)
      setConnStatus('PENDING')
      toast('Connection request sent!', 'success')
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'danger') }
    finally { setConnLoading(false) }
  }

  const handleDisconnect = async () => {
    setConnLoading(true)
    try {
      await api.delete(`/api/connections/${userId}`)
      setConnStatus('NONE')
      toast('Disconnected', 'success')
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'danger') }
    finally { setConnLoading(false) }
  }

  const handleMessage = () => navigate('/messages', { state: { openUserId: Number(userId) } })

  const handleSaved = (updated) => {
    setProfile(updated); setShowEdit(false)
    if (isOwn) login({ token: localStorage.getItem('token'), role: localStorage.getItem('role'), name: updated.name })
  }

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'danger'); return }
    if (file.size > 10 * 1024 * 1024) { toast('Image size must be less than 10MB', 'danger'); return }
    const reader = new FileReader()
    reader.onload = () => { setCropImage(reader.result); setCropType(type) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob) => {
    const fd = new FormData()
    fd.append('file', croppedBlob, 'profile-image.jpg')
    try {
      const endpoint = cropType === 'avatar' ? '/api/upload/avatar' : '/api/upload/cover'
      const { data } = await api.post(endpoint, fd)
      setProfile(data)
      toast(cropType === 'avatar' ? 'Profile photo updated!' : 'Cover photo updated!', 'success')
      if (isOwn && cropType === 'avatar') login({ token: localStorage.getItem('token'), role: localStorage.getItem('role'), name: data.name })
    } catch (err) { toast(err.response?.data?.message || 'Upload failed.', 'danger') }
    finally { setCropImage(null); setCropType(null) }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/api/posts/${id}`)
      setPosts(p => p.filter(x => x.id !== id))
      toast('Post deleted.', 'success')
    } catch { toast('Failed.', 'danger') }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner spinner-lg"/></div>
  if (!profile) return <div className="empty-state"><div className="empty-state-title">Profile not found</div></div>

  const initials = profile.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
  const stars = r => '★'.repeat(Math.round(r||0)) + '☆'.repeat(5-Math.round(r||0))
  const isCompany = profile.role === 'COMPANY'

  return (
    <div className="profile-page">
      <div className="profile-header-card">
        <div className="profile-cover" onClick={isOwn ? () => coverRef.current.click() : undefined}>
          {profile.coverPhoto ? <img src={profile.coverPhoto} alt="cover"/> : null}
          {isOwn && (
            <button className="profile-cover-edit" onClick={e => {e.stopPropagation(); coverRef.current.click()}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Edit cover
            </button>
          )}
          <input ref={coverRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => handleImageSelect(e,'cover')}/>
        </div>

        <div style={{position:'relative',display:'inline-block'}}>
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" onClick={isOwn ? () => avatarRef.current.click() : undefined}>
              {profile.profilePicture ? <img src={profile.profilePicture} alt={profile.name}/> : initials}
              {isOwn && <div className="profile-avatar-edit"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>}
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => handleImageSelect(e,'avatar')}/>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',padding:'12px 20px 0',gap:8,flexWrap:'wrap'}}>
          {isOwn ? (
            <button className="btn btn-outline btn-sm" onClick={() => setShowEdit(true)}>Edit profile</button>
          ) : (
            <>
              {connStatus === 'CONNECTED'
                ? <button className="btn btn-outline btn-sm" onClick={handleDisconnect} disabled={connLoading}>{connLoading ? <span className="spinner spinner-sm"/> : '✓ Connected'}</button>
                : connStatus === 'PENDING'
                ? <button className="btn btn-ghost btn-sm" disabled>⏳ Request Sent</button>
                : <button className="btn btn-primary btn-sm" onClick={handleConnect} disabled={connLoading}>{connLoading ? <span className="spinner spinner-white spinner-sm"/> : '+ Connect'}</button>
              }
              <button className="btn btn-outline btn-sm" onClick={handleMessage}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Message
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReport(true)} style={{color:'var(--red,#ef4444)'}}>🚩 Report</button>
            </>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name">{profile.name}</div>
          {profile.headline && <div className="profile-headline">{profile.headline}</div>}
          <div className="profile-meta-row">
            <span className={`badge badge-${profile.role?.toLowerCase()}`}>{profile.role}</span>
            {profile.location && <span className="profile-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="profile-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>{profile.website.replace(/^https?:\/\//,'')}</a>}
            <span className="profile-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{profile.email}</span>
          </div>
        </div>

        {profile.role === 'STUDENT' && (
          <div className="profile-stats-row">
            <div className="profile-stat"><div className="profile-stat-value">{profile.totalTaskCompleted ?? 0}</div><div className="profile-stat-label">Tasks done</div></div>
            <div className="profile-stat"><div className="profile-stat-value">{profile.ratings?.length ?? 0}</div><div className="profile-stat-label">Ratings</div></div>
            <div className="profile-stat"><div className="profile-stat-value" style={{color:'#f59e0b'}}>{profile.averageRating ? profile.averageRating.toFixed(1) : '--'}</div><div className="profile-stat-label">Avg rating</div></div>
          </div>
        )}
      </div>

      {isCompany && (
        <div className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title" style={{marginBottom:0}}>🏢 Company Details</div>
            {isOwn && <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>Edit</button>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginTop:8}}>
            {profile.location && <div style={{display:'flex',gap:10}}><span style={{fontSize:20}}>📍</span><div><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Location</div><div style={{fontSize:14,fontWeight:600}}>{profile.location}</div></div></div>}
            {profile.website && <div style={{display:'flex',gap:10}}><span style={{fontSize:20}}>🌐</span><div><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Website</div><a href={profile.website} target="_blank" rel="noreferrer" style={{fontSize:14,fontWeight:600,color:'var(--blue)'}}>{profile.website.replace(/^https?:\/\//,'')}</a></div></div>}
            <div style={{display:'flex',gap:10}}><span style={{fontSize:20}}>📧</span><div><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Contact</div><div style={{fontSize:14,fontWeight:600}}>{profile.email}</div></div></div>
            {profile.headline && <div style={{display:'flex',gap:10}}><span style={{fontSize:20}}>💼</span><div><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:2}}>Industry</div><div style={{fontSize:14,fontWeight:600}}>{profile.headline}</div></div></div>}
          </div>
        </div>
      )}

      {(profile.bio || isOwn) && (
        <div className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title" style={{marginBottom:0}}>About</div>
            {isOwn && <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>Edit</button>}
          </div>
          {profile.bio
            ? <p style={{fontSize:14,color:'var(--text)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{profile.bio}</p>
            : <p style={{fontSize:13,color:'var(--text-muted)'}}>{isCompany ? 'Add a company description.' : 'Add a summary.'}{isOwn && <button className="btn-link" onClick={() => setShowEdit(true)}> Add now</button>}</p>
          }
        </div>
      )}

      {profile.role === 'STUDENT' && (
        <div className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title" style={{marginBottom:0}}>Skills</div>
            {isOwn && <button className="btn btn-outline btn-sm" onClick={() => setShowSkill(true)}>+ Add skill</button>}
          </div>
          {profile.skills?.length > 0 ? (
            <div className="skills-list">
              {profile.skills.map(s => {
                const c = LEVEL_COLORS[s.level] || {bg:'var(--gray-50)',color:'var(--gray-700)',border:'var(--border)'}
                return <span key={s.id} className="skill-tag" style={{background:c.bg,color:c.color,borderColor:c.border}}>{s.skillName} <span style={{opacity:.65}}>· {s.level}</span></span>
              })}
            </div>
          ) : <p style={{fontSize:13,color:'var(--text-muted)'}}>{isOwn ? 'Add skills to stand out.' : 'No skills listed.'}</p>}
        </div>
      )}

      {profile.ratings?.length > 0 && (
        <div className="profile-section-card">
          <div className="profile-section-title">Ratings & feedback</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {profile.ratings.map(r => (
              <div key={r.id} style={{padding:'12px 14px',background:'var(--gray-50)',borderRadius:'var(--r-md)',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div style={{fontWeight:600,fontSize:13}}>{r.taskTitle}</div>
                  <div style={{color:'#f59e0b',fontWeight:700,fontSize:13,flexShrink:0}}>{stars(r.rating)} {r.rating?.toFixed(1)}</div>
                </div>
                {r.feedback && <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.5,marginBottom:4}}>"{r.feedback}"</p>}
                <div style={{fontSize:11,color:'var(--text-muted)'}}>-- {r.fromUser}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-section-card" style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
          <div className="profile-section-title" style={{marginBottom:0}}>Activity</div>
        </div>
        <div style={{padding:16}}>
          {isOwn && <PostComposer profile={profile} onPosted={fetchPosts}/>}
          {posts.length === 0
            ? <div className="empty-state" style={{padding:'32px 16px'}}><div className="empty-state-title" style={{fontSize:14}}>No posts yet</div><div className="empty-state-description">{isOwn ? 'Share your achievements and updates.' : 'Nothing posted yet.'}</div></div>
            : posts.map(p => <PostCard key={p.id} post={p} isOwn={isOwn} onDelete={deletePost}/>)
          }
        </div>
      </div>

      {showEdit && <EditModal profile={profile} onClose={() => setShowEdit(false)} onSaved={handleSaved}/>}
      {showSkill && <SkillModal onClose={() => setShowSkill(false)} onAdded={() => {setShowSkill(false); fetchProfile()}}/>}
      {showReport && <ReportModal onClose={() => setShowReport(false)} prefillUserId={profile.id} prefillUserName={profile.name} prefillType="USER"/>}
      {cropImage && <ImageCropModal image={cropImage} onClose={() => {setCropImage(null); setCropType(null)}} onCropComplete={handleCropComplete} aspectRatio={cropType === 'avatar' ? 1 : 16/9} title={cropType === 'avatar' ? 'Crop Profile Photo' : 'Crop Cover Photo'}/>}
    </div>
  )
}
