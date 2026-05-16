import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useSelector(state => state.auth)
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'DOCTOR')   return <Navigate to="/doctor/dashboard" replace />
    if (user.role === 'ADMIN')    return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}
