import { Link } from 'react-router-dom'
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-gray-300 relative overflow-hidden">
      {/* Subtle mesh accent */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 100%, rgba(0,74,198,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(0,104,122,0.10) 0%, transparent 50%)'
        }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#004AC6] to-[#2563EB] rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Medi<span className="text-[#57DFFE]">Connect</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              India's trusted telemedicine platform connecting patients with top doctors for secure video consultations, anytime, anywhere.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 hover:bg-[#004AC6] rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-[#004AC6]">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Find Doctors','/doctors'],['Book Appointment','/doctors'],['Medical Records','/records'],['About Us','#'],['Contact','#']].map(([label,to]) => (
                <li key={label}><Link to={to} className="hover:text-[#57DFFE] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#57DFFE] shrink-0" /><span>1800-MEDICONNECT</span></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#57DFFE] shrink-0" /><span>support@mediconnect.in</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#57DFFE] shrink-0 mt-0.5" /><span>Bengaluru, Karnataka, India</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#57DFFE] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#57DFFE] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#57DFFE] transition-colors">HIPAA Compliant</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
