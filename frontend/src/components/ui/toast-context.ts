import { createContext } from 'react'

export interface ToastContextValue {
  showToast: (message: string, tone?: 'error' | 'success') => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
