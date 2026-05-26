import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import api from '../api/axiosInstance'
import { register as registerUser } from '../store/slices/authSlice'
import { Heart, Eye, EyeOff, User, Mail, Lock, Phone, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [role, setRole] = useState('PATIENT')
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'PATIENT' } })
  const [showPwd, setShowPwd] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)

  const checkEmail = async (email) => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailStatus(null)
      return
    }
    setEmailStatus({ loading: true, message: 'Checking email...' })
    try {
      const res = await api.get(`/auth/validate-email?email=${encodeURIComponent(email)}`)
      setEmailStatus(res.data.data)
    } catch {
      setEmailStatus({ validFormat: false, available: false, domainReachable: false, message: 'Could not check email right now.' })
    }
  }

  const onSubmit = async (data) => {
    const payload = Object.fromEntries(
      Object.entries({ ...data, role }).filter(([, value]) => value !== '' && value !== null && value !== undefined && !Number.isNaN(value))
    )
    const result = await dispatch(registerUser(payload))
    if (registerUser.fulfilled.match(result)) {
      navigate('/verify-email', { state: { email: result.payload.email } })
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center shadow-level-1"
              style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#131B2E]">Medi<span className="text-[#004AC6]">Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-[#131B2E] mt-6 mb-1">Create your account</h1>
          <p className="text-[#737686] text-sm">Join 50,000+ people on MediConnect</p>
        </div>

        <div className="card shadow-level-2">
          {/* Role Toggle */}
          <div className="flex bg-[#F2F3FF] rounded-btn p-1 mb-6">
            {['PATIENT','DOCTOR'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn text-sm font-semibold transition-all ${role===r ? 'bg-white text-[#004AC6] shadow-level-1' : 'text-[#737686] hover:text-[#434655]'}`}>
                {r === 'PATIENT' ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                {r === 'PATIENT' ? 'Patient' : 'Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                  <input id="fullName" placeholder="Dr. John Smith" className={`input pl-10 ${errors.fullName ? 'input-error':''}`}
                    {...register('fullName',{required:'Name is required',minLength:{value:2,message:'Min 2 characters'}})} />
                </div>
                {errors.fullName && <p className="text-[#BA1A1A] text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                  <input id="email" type="email" placeholder="you@email.com" className={`input pl-10 ${errors.email?'input-error':''}`}
                    {...register('email',{
                      required:'Email required',
                      pattern:{value:/^\S+@\S+\.\S+$/,message:'Invalid email'},
                      onBlur: e => checkEmail(e.target.value),
                    })} />
                </div>
                {errors.email && <p className="text-[#BA1A1A] text-xs mt-1">{errors.email.message}</p>}
                {emailStatus?.message && !errors.email && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${emailStatus.validFormat && emailStatus.domainReachable && emailStatus.available ? 'text-emerald-700' : 'text-[#BA1A1A]'}`}>
                    {emailStatus.validFormat && emailStatus.domainReachable && emailStatus.available
                      ? <CheckCircle className="w-3 h-3" />
                      : <AlertCircle className="w-3 h-3" />}
                    {emailStatus.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                  <input id="phone" type="tel" placeholder="+919876543210" className="input pl-10"
                    {...register('phone')} />
                </div>
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686]" />
                  <input id="password" type={showPwd?'text':'password'} placeholder="Min 8 characters" className={`input pl-10 pr-10 ${errors.password?'input-error':''}`}
                    {...register('password',{required:'Password required',minLength:{value:8,message:'Min 8 characters'}})} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686]">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[#BA1A1A] text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            {/* Doctor-specific fields */}
            {role === 'DOCTOR' && (
              <div className="space-y-4 pt-2 border-t border-[#E2E8F0]">
                <p className="text-sm font-semibold text-[#434655] pt-1">Doctor Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Specialty</label>
                    <input id="specialty" placeholder="e.g. Cardiologist" className={`input ${errors.specialty?'input-error':''}`}
                      {...register('specialty',{required: role==='DOCTOR' ? 'Specialty required' : false})} />
                    {errors.specialty && <p className="text-[#BA1A1A] text-xs mt-1">{errors.specialty.message}</p>}
                  </div>
                  <div>
                    <label className="label">Experience (years)</label>
                    <input id="experienceYears" type="number" min="0" className="input"
                      {...register('experienceYears',{valueAsNumber:true})} />
                  </div>
                  <div>
                    <label className="label">License Number</label>
                    <input id="licenseNumber" placeholder="MCI-123456" className={`input ${errors.licenseNumber?'input-error':''}`}
                      {...register('licenseNumber',{required: role==='DOCTOR' ? 'License required' : false})} />
                    {errors.licenseNumber && <p className="text-[#BA1A1A] text-xs mt-1">{errors.licenseNumber.message}</p>}
                  </div>
                  <div>
                    <label className="label">Consultation Fee (₹)</label>
                    <input id="consultationFee" type="number" min="0" step="50" className="input"
                      {...register('consultationFee',{valueAsNumber:true})} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">City</label>
                    <input id="city" placeholder="e.g. Mumbai" className="input" {...register('city')} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Bio</label>
                    <textarea id="bio" rows={3} placeholder="Brief professional bio..." className="input resize-none"
                      {...register('bio')} />
                  </div>
                </div>
              </div>
            )}

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</span>
                : `Create ${role === 'DOCTOR' ? 'Doctor' : 'Patient'} Account`
              }
            </button>
          </form>

          <p className="text-center text-[#737686] text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#004AC6] font-semibold hover:text-[#003EA8]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
