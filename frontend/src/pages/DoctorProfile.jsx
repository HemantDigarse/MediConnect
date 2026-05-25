import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDoctorById } from '../store/slices/doctorsSlice'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PageLoader } from '../components/LoadingSkeleton'
import api from '../api/axiosInstance'
import { Star, MapPin, Award, Calendar } from 'lucide-react'
import { format, addDays } from 'date-fns'

export default function DoctorProfile() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { selectedDoctor: doctor, loading } = useSelector(s => s.doctors)
  const { user } = useSelector(s => s.auth)
  const [slots, setSlots]           = useState([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reviews, setReviews]       = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'))

  useEffect(() => { dispatch(fetchDoctorById(id)) }, [id, dispatch])

  useEffect(() => {
    if (doctor) {
      loadSlots(selectedDate)
      loadReviews()
    }
  }, [doctor, selectedDate])

  const loadSlots = async (date) => {
    setSlotsLoading(true)
    try {
      const res = await api.get(`/doctors/${id}/slots?date=${date}`)
      setSlots(res.data.data || [])
    } catch { setSlots([]) } finally { setSlotsLoading(false) }
  }

  const loadReviews = async () => {
    try {
      const res = await api.get(`/doctors/${id}/reviews?size=5`)
      setReviews(res.data.data?.content || [])
    } catch {}
  }

  if (loading) return <PageLoader />
  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center text-[#737686]">Doctor not found.</div>
  )

  const initials = doctor.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="py-12 px-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #004AC6 0%, #00687A 100%)' }}>
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-28 h-28 rounded-card bg-white/20 border-4 border-white/30 flex items-center justify-center text-white font-extrabold text-4xl shadow-level-3 shrink-0 backdrop-blur-sm">
              {doctor.profileImageUrl
                ? <img src={doctor.profileImageUrl} alt={doctor.fullName} className="w-full h-full object-cover rounded-card" />
                : initials
              }
            </div>
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-3xl font-extrabold mb-1">Dr. {doctor.fullName}</h1>
              <p className="text-[#B4C5FF] text-lg mb-3">{doctor.specialty}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                {doctor.city && (
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-badge backdrop-blur-sm">
                    <MapPin className="w-4 h-4" />{doctor.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-badge backdrop-blur-sm">
                  <Award className="w-4 h-4" />{doctor.experienceYears} yrs exp
                </span>
                <span className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-badge">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  {doctor.rating?.toFixed(1)} ({doctor.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="text-center glass-dark rounded-card px-6 py-4 text-white shrink-0">
              <p className="text-3xl font-extrabold">₹{doctor.consultationFee}</p>
              <p className="text-[#B4C5FF] text-sm mb-3">per consultation</p>
              {user?.role === 'PATIENT'
                ? <Link to={`/book/${doctor.id}`} className="block bg-white text-[#004AC6] font-bold py-2.5 px-6 rounded-btn hover:bg-[#F2F3FF] transition-colors text-sm">Book Now</Link>
                : !user
                  ? <Link to="/login" className="block bg-white text-[#004AC6] font-bold py-2.5 px-6 rounded-btn hover:bg-[#F2F3FF] transition-colors text-sm">Sign in to Book</Link>
                  : null
              }
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {doctor.bio && (
                <div className="card">
                  <h2 className="text-lg font-bold text-[#131B2E] mb-3">About Dr. {doctor.fullName}</h2>
                  <p className="text-[#434655] leading-relaxed">{doctor.bio}</p>
                </div>
              )}

              {/* Reviews */}
              <div className="card">
                <h2 className="text-lg font-bold text-[#131B2E] mb-4">Patient Reviews</h2>
                {reviews.length === 0
                  ? <p className="text-center text-[#C3C6D7] text-sm py-6">No reviews yet.</p>
                  : reviews.map(r => (
                    <div key={r.id} className="py-4 border-b border-[#F2F3FF] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-[#E2E7FF]'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-[#C3C6D7] ml-1">{format(new Date(r.createdAt), 'dd MMM yyyy')}</span>
                      </div>
                      {r.comment && <p className="text-[#434655] text-sm mt-1">{r.comment}</p>}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Slot picker */}
            <div className="card h-fit">
              <h2 className="text-lg font-bold text-[#131B2E] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#004AC6]" /> Available Slots
              </h2>
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
                {dates.map(d => (
                  <button key={d} onClick={() => setSelectedDate(d)}
                    className={`shrink-0 px-3 py-2 rounded-btn text-xs font-semibold transition-all ${
                      d === selectedDate ? 'text-white' : 'bg-[#F2F3FF] text-[#434655] hover:bg-[#EAEdFF] hover:text-[#004AC6]'
                    }`}
                    style={d === selectedDate ? { background: 'linear-gradient(135deg, #004AC6, #00687A)' } : {}}>
                    <span className="block">{format(new Date(d), 'EEE')}</span>
                    <span className="block">{format(new Date(d), 'dd')}</span>
                  </button>
                ))}
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 skeleton rounded-btn" />)}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-[#C3C6D7] text-sm py-6">No available slots on this date.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {slots.map(s => (
                    <Link key={s.id}
                      to={user ? `/book/${doctor.id}?slotId=${s.id}&date=${selectedDate}` : '/login'}
                      className="text-center py-2.5 rounded-btn bg-[#F2F3FF] text-[#004AC6] text-sm font-semibold hover:bg-[#DBE1FF] transition-colors border border-[#E2E7FF]">
                      {s.startTime}
                    </Link>
                  ))}
                </div>
              )}

              {user?.role === 'PATIENT' && (
                <Link to={`/book/${doctor.id}`} className="btn-primary w-full text-sm text-center block">
                  Book Appointment →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
