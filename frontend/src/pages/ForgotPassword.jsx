import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    setLoading(true)
    try {
      const res = await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`)
      const resetToken = res.data?.data
      if (resetToken) {
        // Dev mode: auto-redirect to reset page with token
        toast.success('Dev mode: Auto-redirecting to reset page...')
        navigate(`/reset-password?token=${resetToken}`)
      } else {
        setSent(true)
        toast.success('Reset link sent! Check your inbox.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center shadow-level-1"
              style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#131B2E]">Medi<span className="text-[#004AC6]">Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-[#131B2E] mt-6 mb-1">Reset your password</h1>
          <p className="text-[#737686] text-sm">We'll send a reset link to your email</p>
        </div>

        <div className="card shadow-level-2">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-[#131B2E] mb-2">Check your email</h2>
              <p className="text-[#737686] text-sm mb-6">
                We sent a password reset link to<br />
                <span className="font-semibold text-[#131B2E]">{email}</span>
              </p>
              <p className="text-[#C3C6D7] text-xs mb-4">Didn't get the email? Check your spam folder or try again.</p>
              <button onClick={() => setSent(false)} className="text-[#004AC6] font-semibold text-sm hover:text-[#003EA8]">
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  : 'Send Reset Link'
                }
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-[#004AC6] font-semibold text-sm hover:text-[#003EA8] inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
