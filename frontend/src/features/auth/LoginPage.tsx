import { useNavigate } from 'react-router-dom'
import { LoginForm } from './LoginForm'
import './login.css'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="login container">
      <section className="login__card" aria-labelledby="login-heading">
        <p className="login__eyebrow">Feature Vote</p>
        <h1 id="login-heading" className="login__heading">
          Sign in to shape the roadmap
        </h1>
        <p className="login__lede">
          Vote on ideas and submit your own. Reading is open to everyone —
          voting needs an account.
        </p>
        <LoginForm onSuccess={() => navigate('/', { replace: true })} />
        <p className="login__demo">
          Demo account — <code>demo</code> / <code>demo12345</code>
        </p>
      </section>
    </main>
  )
}
