import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { getAuthToken, setAuthToken } from '../../lib/apiClient'
import { TOKEN_STORAGE_KEY } from '../../lib/config'
import type { AuthUser } from '../../lib/types'
import { login } from './auth.api'
import { AuthContext, type AuthContextValue } from './auth-context'

const USER_STORAGE_KEY = 'feature-vote:username'

function readInitialUser(): AuthUser | null {
  if (typeof localStorage === 'undefined') return null
  // Only trust a stored user if we also still hold a token.
  if (!getAuthToken()) return null
  const username = localStorage.getItem(USER_STORAGE_KEY)
  return username ? { username } : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readInitialUser)

  const signIn = useCallback(async (username: string, password: string) => {
    const token = await login(username, password)
    setAuthToken(token)
    localStorage.setItem(USER_STORAGE_KEY, username)
    setUser({ username })
  }, [])

  const signOut = useCallback(() => {
    setAuthToken(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
