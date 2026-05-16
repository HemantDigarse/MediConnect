import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bookAppointment } from '../store/slices/appointmentsSlice'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { format, addDays } from 'date-fns'
import { Calendar, Clock, CheckCircle, CreditCard, Smartphone, Building2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = ['Select Slot', 'Symptoms', 'Payment', 'Confirmation']

export default function AppointmentBooking() {
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { currentAppointment, loading } = useSelector(s => s.appointments)

  const [step, setStep] = useState(0)
  const [doctor, setDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(searchParams.get('slotId') || null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [complaint, setComplaint] = useState('')
  const [appointment, setAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [payProcessing, setPayProcessing] = useState(false)

  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'))

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(r => setDoctor(r.data.data)).catch(() => {})
  }, [doctorId])

  useEffect(() => {
    if (doctorId && selectedDate) {
      api.get(`/doctors/${doctorId}/slots?date=${selectedDate}`)
        .then(r => setSlots(r.data.data || []))
        .catch(() => setSlots([]))
    }
  }, [doctorId, selectedDate])

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot')
    const result = await dispatch(bookAppointment({ doctorId, slotId: selectedSlot, chiefComplaint: complaint }))
    if (bookAppointment.fulfilled.match(result)) {
      setAppointment(result.payload)
      setStep(2)
      // For real Razorpay orders, auto-open the checkout
      if (!result.payload.razorpayOrderId?.startsWith('dev_order_')) {
        initiatePayment(result.payload)
      }
    }
  }

  const handleDevPayment = async () => {
    if (!appointment) return
    setPayProcessing(true)
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500))
    try {
      await api.post(`/appointments/${appointment.id}/payment/verify`, {
        razorpayOrderId: appointment.razorpayOrderId,
        razorpayPaymentId: 'dev_pay_' + Date.now(),
        razorpaySignature: 'dev_signature',
      })
      toast.success('Payment successful!')
      setStep(3)
    } catch {
      toast.error('Payment verification failed')
    } finally {
      setPayProcessing(false)
    }
  }

  const initiatePayment = (appt) => {
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => openRazorpay(appt)
      document.body.appendChild(script)
    } else {
      openRazorpay(appt)
    }
  }

  const openRazorpay = (appt) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: (doctor?.consultationFee || 0) * 100,
      currency: 'INR',
      name: 'MediConnect',
      description: `Consultation with Dr. ${doctor?.fullName}`,
      order_id: appt.razorpayOrderId,
      handler: async (response) => {
        try {
          await api.post(`/appointments/${appt.id}/payment/verify`, {
            razorpayOrderId:  response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          toast.success('Payment successful!')
          setStep(3)
        } catch { toast.error('Payment verification failed') }
      },
      prefill: { name: user?.fullName, email: user?.email },
      theme: { color: '#0F766E' },
      modal: { ondismiss: () => toast.error('Payment cancelled') },
    }
    new window.Razorpay(options).open()
  }

  const isDevPayment = appointment?.razorpayOrderId?.startsWith('dev_order_')

  if (!doctor) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="pt-28 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-gray-500 mb-8">with Dr. {doctor.fullName} — {doctor.specialty}</p>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 transition-colors ${
                i < step ? 'bg-teal-700 text-white' : i === step ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <p className={`text-xs font-medium ml-2 hidden sm:block ${i <= step ? 'text-teal-700' : 'text-gray-400'}`}>{s}</p>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Slot selection */}
        {step === 0 && (
          <div className="card space-y-5">
            <h2 className="font-bold text-gray-900">Select Date & Time</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map(d => (
                <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                  className={`shrink-0 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${d === selectedDate ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'}`}>
                  <span className="block text-xs">{format(new Date(d), 'EEE')}</span>
                  {format(new Date(d), 'dd MMM')}
                </button>
              ))}
            </div>
            {slots.length === 0
              ? <p className="text-center text-gray-400 py-6">No slots available on this date.</p>
              : <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map(s => (
                    <button key={s.id} onClick={() => setSelectedSlot(s.id)}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedSlot === s.id ? 'bg-teal-700 text-white border-teal-700' : 'border-gray-200 text-gray-700 hover:border-teal-400'
                      }`}>
                      <Clock className="w-3.5 h-3.5 mx-auto mb-0.5" />
                      {s.startTime}
                    </button>
                  ))}
                </div>
            }
            <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between">
              <div><p className="font-semibold text-teal-800">Consultation Fee</p><p className="text-sm text-teal-600">Dr. {doctor.fullName}</p></div>
              <p className="text-2xl font-extrabold text-teal-700">₹{doctor.consultationFee}</p>
            </div>
            <button onClick={() => { if (!selectedSlot) { toast.error('Select a slot'); return; } setStep(1) }}
              className="btn-primary w-full">Continue →</button>
          </div>
        )}

        {/* Step 1 — Symptoms */}
        {step === 1 && (
          <div className="card space-y-5">
            <h2 className="font-bold text-gray-900">Describe Your Symptoms</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{format(new Date(selectedDate), 'dd MMMM yyyy')}</p>
                  <p className="text-gray-500 text-sm">{slots.find(s => s.id === selectedSlot)?.startTime} — Dr. {doctor.fullName}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Chief Complaint (optional)</label>
              <textarea rows={4} value={complaint} onChange={e => setComplaint(e.target.value)}
                placeholder="Describe your symptoms, concerns, or reason for this consultation..."
                className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleBook} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Booking...' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Payment (Dev UPI/Card UI) */}
        {step === 2 && isDevPayment && (
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Payment</h2>
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" /> Secure
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl p-5">
              <p className="text-sm opacity-80">Total Amount</p>
              <p className="text-3xl font-extrabold mt-1">₹{doctor.consultationFee}</p>
              <p className="text-sm opacity-80 mt-2">Consultation with Dr. {doctor.fullName}</p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
              <div className="space-y-2">
                {[
                  { id: 'upi', icon: Smartphone, label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', color: 'text-purple-600 bg-purple-50' },
                  { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', color: 'text-blue-600 bg-blue-50' },
                  { id: 'netbanking', icon: Building2, label: 'Net Banking', desc: 'All major banks', color: 'text-teal-600 bg-teal-50' },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === m.id
                        ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === m.id ? 'border-teal-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === m.id && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Input (when UPI selected) */}
            {paymentMethod === 'upi' && (
              <div>
                <label className="label">UPI ID</label>
                <input type="text" placeholder="yourname@upi" className="input" defaultValue={user?.email?.split('@')[0] + '@upi'} />
              </div>
            )}

            {/* Card Input (when card selected) */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="label">Card Number</label>
                  <input type="text" placeholder="4111 1111 1111 1111" className="input" maxLength={19} defaultValue="4111 1111 1111 1111" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="input" defaultValue="12/28" />
                  </div>
                  <div>
                    <label className="label">CVV</label>
                    <input type="password" placeholder="•••" className="input" maxLength={4} defaultValue="123" />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking (when selected) */}
            {paymentMethod === 'netbanking' && (
              <div>
                <label className="label">Select Bank</label>
                <select className="input" defaultValue="sbi">
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <button onClick={handleDevPayment} disabled={payProcessing} className="btn-primary w-full flex items-center justify-center gap-2">
              {payProcessing
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                : <>Pay ₹{doctor.consultationFee} →</>
              }
            </button>
            <p className="text-center text-xs text-gray-400">Secured by MediConnect Payment Gateway</p>
          </div>
        )}

        {/* Step 2 — Payment (Razorpay - Production) */}
        {step === 2 && !isDevPayment && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-500">Please complete payment in the Razorpay window...</p>
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mt-6" />
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-500 mb-6">Your appointment with Dr. {doctor.fullName} is confirmed.<br />You'll receive a reminder 1 hour before.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left max-w-xs mx-auto mb-6">
              <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">Doctor:</span> Dr. {doctor.fullName}</p>
              <p className="text-sm text-gray-500 mt-1"><span className="font-semibold text-gray-700">Date:</span> {format(new Date(selectedDate), 'dd MMM yyyy')}</p>
              <p className="text-sm text-gray-500 mt-1"><span className="font-semibold text-gray-700">Specialty:</span> {doctor.specialty}</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}
