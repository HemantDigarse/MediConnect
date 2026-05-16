import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorSearch from './pages/DoctorSearch'
import DoctorProfile from './pages/DoctorProfile'
import AppointmentBooking from './pages/AppointmentBooking'
import VideoConsult from './pages/VideoConsult'
import MedicalRecords from './pages/MedicalRecords'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useSelector(state => state.auth)

  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register"  element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      <Route path="/doctors"   element={<DoctorSearch />} />
      <Route path="/doctors/:id" element={<DoctorProfile />} />

      {/* Patient */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/book/:doctorId" element={
        <ProtectedRoute roles={['PATIENT']}><AppointmentBooking /></ProtectedRoute>
      } />
      <Route path="/records" element={
        <ProtectedRoute roles={['PATIENT']}><MedicalRecords /></ProtectedRoute>
      } />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>
      } />

      {/* Shared */}
      <Route path="/video-consult/:appointmentId" element={
        <ProtectedRoute roles={['PATIENT','DOCTOR']}><VideoConsult /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
