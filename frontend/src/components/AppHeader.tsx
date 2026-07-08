import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { Button } from './ui/Button'
import { ThemeToggle } from './ui/ThemeToggle'
import './app-header.css'

export function AppHeader() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <header className="app-header">
      <div className="app-header__inner container">
        <Link to="/" className="app-header__brand">
          <span className="app-header__mark" aria-hidden="true">
            ▲
          </span>
          Feature&nbsp;Vote
        </Link>

        <nav className="app-header__nav" aria-label="Account">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="app-header__user">
                Signed in as <strong>{user?.username}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/login" className="app-header__signin">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
