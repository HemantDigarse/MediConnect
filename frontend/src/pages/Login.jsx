import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { login } from '../store/slices/authSlice'
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function Login() {
  const dispatch = useDispatch()
  const navigate  = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPwd, setShowPwd] = useState(false)

  const onSubmit = async (data) => {
    const result = await dispatch(login(data))
    if (login.fulfilled.match(result)) {
      const role = result.payload.role
      if (role === 'DOCTOR') navigate('/doctor/dashboard')
      else if (role === 'ADMIN') navigate('/admin')
      else navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center shadow-level-1"
              style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#131B2E]">Medi<span className="text-[#004AC6]">Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-[#131B2E] mt-6 mb-1">Welcome back</h1>
          <p className="text-[#737686] text-sm">Sign in to your account</p>
        </div>

        <div className="card shadow-level-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                <input id="email" type="email" placeholder="you@email.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-[#BA1A1A] text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#004AC6] hover:text-[#003EA8] font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                <input id="password" type={showPwd ? 'text' : 'password'} placeholder="Enter password"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#434655]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[#BA1A1A] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[#737686] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#004AC6] font-semibold hover:text-[#003EA8]">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
