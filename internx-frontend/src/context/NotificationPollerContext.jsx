/**
 * NotificationPollerContext
 *
 * Polls the backend every 15 seconds for:
 *  - New notifications  → shows a toast popup + updates the badge count
 *  - New unread messages → shows a toast popup + updates the badge count
 *
 * Exposes:
 *  - unreadNotifs  (number)
 *  - unreadMessages (number)
 *  - refreshCounts() — call after marking as read so counts update immediately
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import api from '../api/axios'

const NotificationPollerContext = createContext({
  unreadNotifs: 0,
  unreadMessages: 0,
  refreshCounts: () => {},
})

const POLL_INTERVAL = 15_000 // 15 seconds

export function NotificationPollerProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()

  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Track the IDs we've already shown toasts for so we don't repeat
  const seenNotifIds = useRef(new Set())
  const prevMsgCount = useRef(null)
  const isFirstPoll = useRef(true)

  const poll = useCallback(async () => {
    if (!user) return

    try {
      // ── Notifications ──────────────────────────────────────────────
      const { data: notifs } = await api.get('/api/notifications')
      const unread = notifs.filter(n => !n.read && !n.isRead)
      setUnreadNotifs(unread.length)

      if (!isFirstPoll.current) {
        // Find notifications we haven't shown yet
        const newOnes = unread.filter(n => !seenNotifIds.current.has(n.id))
        newOnes.forEach(n => {
          seenNotifIds.current.add(n.id)
          const msg = n.message || 'You have a new notification'
          // Pick a nice title based on content
          const lower = msg.toLowerCase()
          let title = '🔔 Notification'
          let type = 'info'
          if (lower.includes('connection request')) { title = '👤 Connection Request'; type = 'info' }
          else if (lower.includes('accepted') || lower.includes('accept')) { title = '✅ Connection Accepted'; type = 'success' }
          else if (lower.includes('liked')) { title = '👍 New Like'; type = 'info' }
          else if (lower.includes('comment')) { title = '💬 New Comment'; type = 'info' }
          else if (lower.includes('task')) { title = '📋 Task Update'; type = 'info' }
          else if (lower.includes('submit')) { title = '📤 New Submission'; type = 'info' }
          else if (lower.includes('rate') || lower.includes('rating')) { title = '⭐ New Rating'; type = 'success' }
          toast(msg, type, title)
        })
      } else {
        // On first poll just seed the seen set — don't show toasts for old notifs
        unread.forEach(n => seenNotifIds.current.add(n.id))
      }
    } catch {
      // Silently ignore — network may be down
    }

    try {
      // ── Messages ───────────────────────────────────────────────────
      const { data: count } = await api.get('/api/messages/unread-count')
      const msgCount = Number(count) || 0
      setUnreadMessages(msgCount)

      if (!isFirstPoll.current && prevMsgCount.current !== null && msgCount > prevMsgCount.current) {
        const diff = msgCount - prevMsgCount.current
        toast(
          `You have ${diff} new message${diff > 1 ? 's' : ''}`,
          'info',
          '💬 New Message'
        )
      }
      prevMsgCount.current = msgCount
    } catch {
      // Silently ignore
    }

    isFirstPoll.current = false
  }, [user, toast])

  // Run on mount and every POLL_INTERVAL
  useEffect(() => {
    if (!user) return
    // Reset state when user changes
    isFirstPoll.current = true
    seenNotifIds.current = new Set()
    prevMsgCount.current = null

    poll() // immediate first poll
    const timer = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [user?.id]) // re-run if user changes

  const refreshCounts = useCallback(() => {
    poll()
  }, [poll])

  return (
    <NotificationPollerContext.Provider value={{ unreadNotifs, unreadMessages, refreshCounts }}>
      {children}
    </NotificationPollerContext.Provider>
  )
}

export const useNotificationPoller = () => useContext(NotificationPollerContext)
