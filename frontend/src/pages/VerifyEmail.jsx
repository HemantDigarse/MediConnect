import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOtp, resendOtp } from '../store/slices/authSlice'
import { Heart, MailCheck, RotateCcw } from 'lucide-react'

export default function VerifyEmail() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useSelector(s => s.auth)
  const email = location.state?.email || user?.email || ''
  const [otp, setOtp] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const result = await dispatch(verifyOtp({ email, otp }))
    if (verifyOtp.fulfilled.match(result)) {
      if (user?.role === 'DOCTOR') navigate('/doctor/dashboard')
      else if (user?.role === 'ADMIN') navigate('/admin')
      else navigate('/dashboard')
    }
  }

  const resend = () => {
    if (email) dispatch(resendOtp(email))
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center shadow-level-1 bg-gradient-to-br from-[#004AC6] to-[#2563EB]">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#131B2E]">Medi<span className="text-[#004AC6]">Connect</span></span>
          </Link>
          <div className="mx-auto mt-6 mb-3 w-14 h-14 rounded-full bg-[#DBE1FF] flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-[#004AC6]" />
          </div>
          <h1 className="text-2xl font-bold text-[#131B2E]">Verify your email</h1>
          <p className="text-[#737686] text-sm mt-1">Enter the 6-digit OTP sent to {email || 'your email'}.</p>
        </div>

        <div className="card shadow-level-2">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">OTP Code</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="input text-center text-2xl tracking-[0.4em] font-semibold"
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6 || !email} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <button type="button" onClick={resend} disabled={!email} className="btn-secondary w-full mt-3 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}
