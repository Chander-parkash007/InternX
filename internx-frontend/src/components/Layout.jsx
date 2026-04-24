import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotificationPoller } from '../context/NotificationPollerContext'
import api from '../api/axios'

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
)

const ICONS = {
  home:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  feed:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  people:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  tasks:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>,
  network: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  messages:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  apps:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  subs:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  mytasks: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  board:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  notif:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  admin:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dash:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  logout:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { unreadNotifs, unreadMessages } = useNotificationPoller()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)

  // Keep unreadCount and unreadMessages from the poller
  const unreadCount = unreadNotifs

  useEffect(() => {
    api.get('/api/profile/myprofile')
      .then(r => setProfilePicture(r.data.profilePicture))
      .catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const close = () => setSidebarOpen(false)

  const studentNav = [
    { to: '/feed',            icon: ICONS.feed,     label: 'Feed' },
    { to: '/people',          icon: ICONS.people,   label: 'Find People' },
    { to: '/tasks',           icon: ICONS.tasks,    label: 'Find Tasks' },
    { to: '/connections',     icon: ICONS.network,  label: 'My Network' },
    { to: '/messages',        icon: ICONS.messages, label: 'Messages', badgeCount: unreadMessages },
    { to: '/dashboard',       icon: ICONS.dash,     label: 'Dashboard' },
    { to: '/my-applications', icon: ICONS.apps,     label: 'My Applications' },
    { to: '/my-submissions',  icon: ICONS.subs,     label: 'My Submissions' },
    { to: '/leaderboard',     icon: ICONS.board,    label: 'Leaderboard' },
    { to: '/notifications',   icon: ICONS.notif,    label: 'Notifications', badgeCount: unreadCount },
  ]

  const companyNav = [
    { to: '/feed',       icon: ICONS.feed,     label: 'Feed' },
    { to: '/people',     icon: ICONS.people,   label: 'Find People' },
    { to: '/tasks',      icon: ICONS.tasks,    label: 'Browse Tasks' },
    { to: '/connections',icon: ICONS.network,  label: 'My Network' },
    { to: '/messages',   icon: ICONS.messages, label: 'Messages', badgeCount: unreadMessages },
    { to: '/dashboard',  icon: ICONS.dash,     label: 'Dashboard' },
    { to: '/my-tasks',   icon: ICONS.mytasks,  label: 'My Tasks' },
    { to: '/leaderboard',icon: ICONS.board,    label: 'Leaderboard' },
    { to: '/notifications', icon: ICONS.notif, label: 'Notifications', badgeCount: unreadCount },
  ]

  const adminNav = [
    { to: '/feed',     icon: ICONS.feed,  label: 'Feed' },
    { to: '/people',   icon: ICONS.people, label: 'Find People' },
    { to: '/tasks',    icon: ICONS.tasks, label: 'Browse Tasks' },
    { to: '/messages', icon: ICONS.messages, label: 'Messages', badgeCount: unreadMessages },
    { to: '/dashboard',icon: ICONS.dash,  label: 'Dashboard' },
    { to: '/admin',    icon: ICONS.admin, label: 'Admin Panel' },
    { to: '/notifications', icon: ICONS.notif, label: 'Notifications', badgeCount: unreadCount },
  ]

  const navItems = user?.role === 'STUDENT' ? studentNav
    : user?.role === 'COMPANY' ? companyNav : adminNav

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={close} style={{display:'block'}}/>}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo" onClick={() => { navigate('/feed'); close() }}>
          <div className="sidebar-logo-icon">IX</div>
          <span className="sidebar-logo-text">Intern<span>X</span></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={close}
            >
              <span className="nav-icon">{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badgeCount > 0 && (
                <span className="nav-badge">{item.badgeCount > 9 ? '9+' : item.badgeCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card" onClick={() => { navigate('/profile'); close() }}>
            <div className="sidebar-user-avatar">
              {profilePicture
                ? <img src={profilePicture} alt={user?.name}/>
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">View profile</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,color:'var(--text-muted)'}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            {ICONS.logout} Sign out
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
        </div>
        <div className="topbar-right">
          <button className="theme-btn" onClick={toggle} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <NavLink to="/notifications" style={{position:'relative',textDecoration:'none'}}>
            <button className="btn-icon" title="Notifications">
              {ICONS.notif}
              {unreadCount > 0 && (
                <span className="topbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          </NavLink>
          <div className="topbar-avatar" onClick={() => navigate('/profile')} title="My Profile">
            {profilePicture
              ? <img src={profilePicture} alt={user?.name}/>
              : user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-content">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
