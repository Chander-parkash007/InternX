import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationPollerProvider } from './context/NotificationPollerContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Feed from './pages/Feed'
import People from './pages/People'
import Connections from './pages/Connections'
import Messages from './pages/Messages'
import MyApplications from './pages/MyApplications'
import MySubmissions from './pages/MySubmissions'
import MyTasks from './pages/MyTasks'
import TaskApplicants from './pages/TaskApplicants'
import TaskSubmissions from './pages/TaskSubmissions'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import AdminPanel from './pages/AdminPanel'
import Layout from './components/Layout'
import './App.css'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <NotificationPollerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/feed" replace />} />
                  <Route path="feed" element={<Feed />} />
                  <Route path="people" element={<People />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="connections" element={<Connections />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile/:userId" element={<Profile />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="my-applications" element={<ProtectedRoute roles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
                  <Route path="my-submissions" element={<ProtectedRoute roles={['STUDENT']}><MySubmissions /></ProtectedRoute>} />
                  <Route path="my-tasks" element={<ProtectedRoute roles={['COMPANY']}><MyTasks /></ProtectedRoute>} />
                  <Route path="tasks/:taskId/applicants" element={<ProtectedRoute roles={['COMPANY']}><TaskApplicants /></ProtectedRoute>} />
                  <Route path="tasks/:taskId/submissions" element={<ProtectedRoute roles={['COMPANY']}><TaskSubmissions /></ProtectedRoute>} />
                  <Route path="admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/feed" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationPollerProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
