import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'
import './toast.css'

interface Toast {
  id: number
  message: string
  tone: 'error' | 'success'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const showToast = useCallback(
    (message: string, tone: 'error' | 'success' = 'error') => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 4000)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
