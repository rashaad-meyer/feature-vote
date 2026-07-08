import { createContext } from 'react'
import type { AuthUser } from '../../lib/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
