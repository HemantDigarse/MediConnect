import { Link } from 'react-router-dom'
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Medi<span className="text-teal-400">Connect</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              India's trusted telemedicine platform connecting patients with top doctors for secure video consultations, anytime, anywhere.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
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
                <li key={label}><Link to={to} className="hover:text-teal-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400 shrink-0" /><span>1800-MEDICONNECT</span></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-teal-400 shrink-0" /><span>support@mediconnect.in</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" /><span>Bengaluru, Karnataka, India</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MediConnect. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-teal-400 transition-colors">HIPAA Compliant</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
