import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  console.log('PublicRoute', { loading, hasSession: !!session })
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  return session ? <Navigate to="/" replace /> : children
}