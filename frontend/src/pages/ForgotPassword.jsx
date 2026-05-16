import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">Medi<span className="text-teal-700">Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Reset your password</h1>
          <p className="text-gray-500 text-sm">We'll send a reset link to your email</p>
        </div>

        <div className="card shadow-xl">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a password reset link to<br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <p className="text-gray-400 text-xs mb-4">Didn't get the email? Check your spam folder or try again.</p>
              <button onClick={() => setSent(false)} className="text-teal-600 font-semibold text-sm hover:text-teal-800">
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            <Link to="/login" className="text-teal-700 font-semibold text-sm hover:text-teal-800 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
