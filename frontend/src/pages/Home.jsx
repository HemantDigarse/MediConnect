import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { searchDoctors } from '../store/slices/doctorsSlice'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DoctorCard from '../components/DoctorCard'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Video, Shield, Clock, Star, ChevronRight, ArrowRight, HeartPulse, Stethoscope, FileText, Bell } from 'lucide-react'

const features = [
  { icon: Video,       title: 'HD Video Consultations',  desc: 'Crystal-clear, end-to-end encrypted video calls with top specialists.' },
  { icon: Shield,      title: 'Secure & HIPAA Compliant', desc: 'Your health data is protected with military-grade security protocols.' },
  { icon: Clock,       title: '24/7 Availability',        desc: 'Access doctors round the clock — even on weekends and holidays.' },
  { icon: FileText,    title: 'Digital Prescriptions',    desc: 'Receive and download prescriptions instantly after your consultation.' },
  { icon: HeartPulse,  title: 'Health Records',           desc: 'Store and manage your complete medical history in one secure place.' },
  { icon: Bell,        title: 'Smart Reminders',          desc: 'Automated SMS & email reminders so you never miss an appointment.' },
]

const steps = [
  { step: '01', title: 'Create Account',    desc: 'Sign up in under 2 minutes — no credit card required.' },
  { step: '02', title: 'Find Your Doctor',  desc: 'Browse specialists by specialty, rating, city, and availability.' },
  { step: '03', title: 'Book & Pay',        desc: 'Select a slot, pay securely via Razorpay, and get instant confirmation.' },
  { step: '04', title: 'Start Consultation',desc: 'Join your video call and receive a digital prescription instantly.' },
]

const specialties = ['Cardiologist','Dermatologist','Neurologist','Pediatrician','Orthopedic','Psychiatrist','Gynecologist','General Physician']

export default function Home() {
  const dispatch = useDispatch()
  const { doctors, loading } = useSelector(s => s.doctors)
  const [activeSpecialty, setActiveSpecialty] = useState('')

  useEffect(() => { dispatch(searchDoctors({ size: 8 })) }, [dispatch])

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_,i) => (
            <div key={i} className="absolute rounded-full animate-float"
              style={{
                width: 150+i*100, height: 150+i*100,
                top: `${5+i*18}%`, left: `${-5+i*20}%`,
                background: `radial-gradient(circle, rgba(255,255,255,${0.03+i*0.02}) 0%, transparent 70%)`,
                animationDelay: `${i*1.2}s`
              }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-white/10 text-[#B4C5FF] text-sm font-semibold px-4 py-2 rounded-badge border border-white/20 mb-6 backdrop-blur-sm">
              <Stethoscope className="w-4 h-4" /> India's #1 Telemedicine Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              Consult Top Doctors<br />
              <span className="text-[#57DFFE]">From Your Home</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Book instant video consultations with verified specialists. Get prescriptions, lab reports, and expert care — all in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors" className="inline-flex items-center justify-center gap-2 bg-white text-[#004AC6] font-bold px-8 py-3.5 rounded-btn hover:bg-[#F2F3FF] transition-all shadow-level-2 text-base">
                Find a Doctor <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-btn hover:bg-white/10 transition-all text-base backdrop-blur-sm">
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-10">
            {[['50,000+','Patients Served'],['2,000+','Verified Doctors'],['4.9★','Average Rating']].map(([val,label]) => (
              <div key={label} className="text-center glass-dark rounded-card p-4">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-[#B4C5FF] text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-12 px-4 bg-[#F2F3FF]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-[#131B2E] mb-6">Browse by Specialty</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map(s => (
              <button key={s} onClick={() => setActiveSpecialty(activeSpecialty === s ? '' : s)}
                className={`px-5 py-2.5 rounded-badge font-medium text-sm transition-all duration-200 border ${
                  activeSpecialty === s ? 'text-white border-[#004AC6]' : 'bg-white text-[#434655] border-[#E2E8F0] hover:border-[#004AC6] hover:text-[#004AC6]'
                }`}
                style={activeSpecialty === s ? { background: 'linear-gradient(135deg, #004AC6, #00687A)', borderColor: '#004AC6' } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-16 px-4 mesh-bg relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Top Doctors</h2>
              <p className="section-subtitle">Verified specialists ready to consult you</p>
            </div>
            <Link to="/doctors" className="flex items-center gap-2 text-[#004AC6] font-semibold hover:gap-3 transition-all">
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({length:8}).map((_,i) => <CardSkeleton key={i} />)
              : doctors.slice(0,8).map(d => <DoctorCard key={d.id} doctor={d} />)
            }
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#F2F3FF] to-[#EAEDFF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get expert medical care in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-card flex items-center justify-center mx-auto mb-4 shadow-level-2"
                  style={{ background: 'linear-gradient(135deg, #004AC6 0%, #00687A 100%)' }}>
                  <span className="text-white font-extrabold text-lg">{s.step}</span>
                </div>
                <h3 className="font-bold text-[#131B2E] mb-2">{s.title}</h3>
                <p className="text-[#737686] text-sm">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-[#DBE1FF] -z-10" style={{width:'calc(100% - 4rem)', left:'calc(50% + 2rem)'}} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 mesh-bg relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose MediConnect?</h2>
            <p className="section-subtitle">Everything you need for world-class healthcare at home</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300">
                <div className="w-12 h-12 rounded-card flex items-center justify-center mb-4 shadow-level-1"
                  style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#131B2E] mb-2">{title}</h3>
                <p className="text-[#737686] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,74,198,0.2) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to consult a doctor?</h2>
          <p className="text-[#737686] mb-8">Join 50,000+ patients who trust MediConnect for their healthcare needs.</p>
          <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
