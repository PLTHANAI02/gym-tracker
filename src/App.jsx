import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'
import Routines from './pages/Routines'
import RoutineEdit from './pages/RoutineEdit'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
      <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
      <Route path="/routines/:day" element={<ProtectedRoute><RoutineEdit /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}