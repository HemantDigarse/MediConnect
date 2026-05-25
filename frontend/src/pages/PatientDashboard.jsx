import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPatientAppointments, cancelAppointment } from '../store/slices/appointmentsSlice'
import { fetchNotifications, fetchUnreadCount, markAsRead } from '../store/slices/notificationsSlice'
import Navbar from '../components/Navbar'
import AppointmentCard from '../components/AppointmentCard'
import { ListSkeleton, StatSkeleton } from '../components/LoadingSkeleton'
import { Calendar, FileText, Video, Bell, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { patientAppointments, loading } = useSelector(s => s.appointments)
  const { notifications, unreadCount } = useSelector(s => s.notifications)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPatientAppointments({ patientId: user.id }))
      dispatch(fetchNotifications(user.id))
      dispatch(fetchUnreadCount())
    }
  }, [dispatch, user?.id])

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await dispatch(cancelAppointment(id))
      dispatch(fetchPatientAppointments({ patientId: user.id }))
    }
  }

  const appointments = patientAppointments || []
  const upcoming  = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status))
  const completed = appointments.filter(a => a.status === 'COMPLETED')
  const stats = [
    { icon: Calendar,     label: 'Total Booked',  value: appointments.length, gradient: 'from-[#004AC6] to-[#2563EB]' },
    { icon: Clock,        label: 'Upcoming',       value: upcoming.length,    gradient: 'from-[#00687A] to-[#4CD7F6]' },
    { icon: CheckCircle,  label: 'Completed',      value: completed.length,   gradient: 'from-[#006056] to-[#26DEC9]' },
    { icon: Bell,         label: 'Notifications',  value: unreadCount,        gradient: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#131B2E]">Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-[#737686] mt-1">Here's your health summary for today.</p>
          </div>
          <Link to="/doctors" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, gradient }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-card flex items-center justify-center shadow-level-1 shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#131B2E]">{value}</p>
                <p className="text-sm text-[#737686]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#131B2E]">Upcoming Appointments</h2>
              <Link to="/doctors" className="text-[#004AC6] text-sm font-medium hover:text-[#003EA8]">+ New</Link>
            </div>
            {loading ? <ListSkeleton rows={3} /> :
              upcoming.length === 0
                ? <EmptyState icon={Calendar} title="No upcoming appointments" desc="Book a consultation with a top specialist" action={{ label: 'Find Doctors', to: '/doctors' }} />
                : upcoming.map(a => <AppointmentCard key={a.id} appointment={a} onCancel={handleCancel} />)
            }

            {completed.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-[#131B2E] pt-4">Past Appointments</h2>
                {completed.slice(0,3).map(a => <AppointmentCard key={a.id} appointment={a} />)}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="font-bold text-[#131B2E] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Video,      label: 'Find Doctor & Book',   to: '/doctors',  color: 'bg-[#DBE1FF] text-[#004AC6]' },
                  { icon: FileText,   label: 'My Medical Records',   to: '/records',  color: 'bg-[#ACEDFF] text-[#00687A]' },
                  { icon: TrendingUp, label: 'Health Summary',       to: '/records',  color: 'bg-purple-50 text-purple-700' },
                ].map(({ icon: Icon, label, to, color }) => (
                  <Link key={label} to={to} className={`flex items-center gap-3 p-3 rounded-btn ${color} hover:opacity-80 transition-opacity font-medium text-sm`}>
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#131B2E]">Notifications</h3>
                {unreadCount > 0 && <span className="badge badge-blue">{unreadCount} new</span>}
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.length === 0
                  ? <p className="text-[#C3C6D7] text-sm text-center py-4">No notifications</p>
                  : notifications.slice(0,8).map(n => (
                    <div key={n.id} onClick={() => !n.isRead && dispatch(markAsRead(n.id))}
                      className={`p-3 rounded-btn cursor-pointer transition-colors ${n.isRead ? 'bg-[#F2F3FF]' : 'bg-[#DBE1FF] border border-[#B4C5FF]'}`}>
                      <p className={`text-sm font-medium ${n.isRead ? 'text-[#434655]' : 'text-[#004AC6]'}`}>{n.title}</p>
                      <p className="text-xs text-[#737686] mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-[#C3C6D7] mt-1">{format(new Date(n.createdAt), 'dd MMM, hh:mm a')}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="card text-center py-10">
      <div className="w-14 h-14 bg-[#F2F3FF] rounded-card flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#737686]" />
      </div>
      <h4 className="font-semibold text-[#434655] mb-1">{title}</h4>
      <p className="text-[#C3C6D7] text-sm mb-4">{desc}</p>
      {action && <Link to={action.to} className="btn-primary inline-flex">{action.label}</Link>}
    </div>
  )
}
