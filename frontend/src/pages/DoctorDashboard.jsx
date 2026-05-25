import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDoctorAppointments } from '../store/slices/appointmentsSlice'
import Navbar from '../components/Navbar'
import AppointmentCard from '../components/AppointmentCard'
import { ListSkeleton } from '../components/LoadingSkeleton'
import api from '../api/axiosInstance'
import { Calendar, CheckCircle, Clock, DollarSign, Star, Plus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { doctorAppointments, loading } = useSelector(s => s.appointments)
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [slotForm, setSlotForm] = useState({ slotDate: '', startTime: '', endTime: '' })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/doctors/me')
        setDoctorProfile(res.data.data || null)
      } catch (e) { console.error(e) }
    }
    if (user?.id) loadProfile()
  }, [user?.id])

  useEffect(() => {
    if (doctorProfile?.id) dispatch(fetchDoctorAppointments({ doctorId: doctorProfile.id }))
  }, [doctorProfile?.id, dispatch])

  const today     = format(new Date(), 'yyyy-MM-dd')
  const todayApts = doctorAppointments.filter(a => a.slotDate === today)
  const pending   = doctorAppointments.filter(a => a.status === 'PENDING')
  const completed = doctorAppointments.filter(a => a.status === 'COMPLETED')
  const revenue   = completed.reduce((sum, a) => sum + (a.consultationFee || 0), 0)

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/appointments/${id}/confirm`)
      toast.success('Appointment confirmed!')
      if (doctorProfile?.id) dispatch(fetchDoctorAppointments({ doctorId: doctorProfile.id }))
    } catch { toast.error('Failed to confirm') }
  }

  const handleAddSlot = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/doctors/${doctorProfile?.id}/slots`, slotForm)
      toast.success('Slot added!')
      setShowSlotModal(false)
      setSlotForm({ slotDate: '', startTime: '', endTime: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const stats = [
    { icon: Calendar,    label: "Today",     value: todayApts.length, gradient: 'from-[#004AC6] to-[#2563EB]' },
    { icon: Clock,       label: 'Pending',   value: pending.length,   gradient: 'from-amber-400 to-amber-600' },
    { icon: CheckCircle, label: 'Completed', value: completed.length, gradient: 'from-emerald-500 to-emerald-600' },
    { icon: DollarSign,  label: 'Earnings',  value: `₹${revenue}`,   gradient: 'from-[#00687A] to-[#4CD7F6]' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#131B2E]">Doctor Dashboard</h1>
            <p className="text-[#737686] mt-1">Welcome back, Dr. {user?.fullName?.split(' ')[0]}</p>
          </div>
          <button onClick={() => setShowSlotModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, gradient }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-card flex items-center justify-center shrink-0`}>
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
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#131B2E]">Today's Schedule</h2>
            {loading ? <ListSkeleton rows={3} /> :
              todayApts.length === 0
                ? <div className="card text-center py-10 text-[#C3C6D7]">No appointments today.</div>
                : todayApts.map(a => (
                  <div key={a.id} className="card">
                    <AppointmentCard appointment={a} />
                    {a.status === 'PENDING' && (
                      <button onClick={() => handleConfirm(a.id)} className="btn-primary w-full mt-3 text-sm">
                        ✓ Confirm Appointment
                      </button>
                    )}
                  </div>
                ))
            }
            {pending.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-[#131B2E] pt-2">Pending Requests</h2>
                {pending.map(a => (
                  <div key={a.id} className="card">
                    <AppointmentCard appointment={a} />
                    <button onClick={() => handleConfirm(a.id)} className="btn-primary w-full mt-3 text-sm">
                      ✓ Confirm
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="card h-fit">
            <h3 className="font-bold text-[#131B2E] mb-4">Profile</h3>
            {doctorProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#004AC6] to-[#2563EB] rounded-card flex items-center justify-center text-white font-bold text-lg">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#131B2E]">Dr. {user?.fullName}</p>
                    <p className="text-[#004AC6] text-sm">{doctorProfile.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F2F3FF] rounded-btn p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{doctorProfile.rating?.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-[#737686]">{doctorProfile.reviewCount} reviews</p>
                  </div>
                  <div className="bg-[#F2F3FF] rounded-btn p-3 text-center">
                    <p className="font-bold">₹{doctorProfile.consultationFee}</p>
                    <p className="text-xs text-[#737686]">Per consult</p>
                  </div>
                </div>
              </div>
            ) : <p className="text-[#C3C6D7] text-sm">Loading profile...</p>}
          </div>
        </div>
      </div>

      {showSlotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass bg-white rounded-card p-6 w-full max-w-md shadow-level-3">
            <h3 className="text-lg font-bold mb-4 text-[#131B2E]">Add Availability Slot</h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="label">Date</label>
                <input type="date" min={today} className="input" value={slotForm.slotDate}
                  onChange={e => setSlotForm({...slotForm, slotDate: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={slotForm.startTime}
                    onChange={e => setSlotForm({...slotForm, startTime: e.target.value})} required />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={slotForm.endTime}
                    onChange={e => setSlotForm({...slotForm, endTime: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSlotModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
