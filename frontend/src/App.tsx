import { Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { LoginPage } from './features/auth/LoginPage'
import { useAuth } from './features/auth/useAuth'
import { IdeasPage } from './features/ideas/IdeasPage'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={<IdeasPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
