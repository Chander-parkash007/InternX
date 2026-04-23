import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', title = '') => {
    const tid = ++id
    setToasts(t => [...t, { id: tid, message, type, title }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== tid)), 4000)
  }, [])

  const remove = (tid) => setToasts(t => t.filter(x => x.id !== tid))

  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' }
  const titles = { success: 'Success', danger: 'Error', warning: 'Warning', info: 'Info' }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title || titles[t.type]}</div>
              <div className="toast-message">{t.message}</div>
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
