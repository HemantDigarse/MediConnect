import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { Bell, Menu, X, Heart, ChevronDown, User, LogOut, LayoutDashboard, FileText } from 'lucide-react'

export default function Navbar() {
  const { user } = useSelector(s => s.auth)
  const { unreadCount } = useSelector(s => s.notifications)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setDropdownOpen(false)
  }

  const dashboardLink = user?.role === 'DOCTOR' ? '/doctor/dashboard'
    : user?.role === 'ADMIN' ? '/admin' : '/dashboard'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] shadow-level-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#004AC6] to-[#2563EB] rounded-xl flex items-center justify-center shadow-level-1 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#131B2E]">Medi<span className="text-[#004AC6]">Connect</span></span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>Home</Link>
            <Link to="/doctors" className={`nav-link ${isActive('/doctors') ? 'nav-link-active' : ''}`}>Find Doctors</Link>
            {user && (
              <Link to={dashboardLink} className={`nav-link ${location.pathname.includes('dashboard') || location.pathname === '/admin' ? 'nav-link-active' : ''}`}>Dashboard</Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <Link to={dashboardLink} className="relative p-2 rounded-btn hover:bg-[#F2F3FF] text-[#737686] hover:text-[#004AC6] transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#BA1A1A] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-btn hover:bg-[#F2F3FF] transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#004AC6] to-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#131B2E] max-w-[120px] truncate">{user.fullName}</span>
                    <ChevronDown className={`w-4 h-4 text-[#737686] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-card shadow-level-3 border border-[#E2E8F0] py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-[#F2F3FF]">
                        <p className="text-xs text-[#737686] font-medium uppercase tracking-wide">{user.role}</p>
                        <p className="text-sm font-semibold text-[#131B2E] truncate">{user.email}</p>
                      </div>
                      <Link to={dashboardLink} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#434655] hover:bg-[#F2F3FF] hover:text-[#004AC6] transition-colors text-sm">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {user.role === 'PATIENT' && (
                        <Link to="/records" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[#434655] hover:bg-[#F2F3FF] hover:text-[#004AC6] transition-colors text-sm">
                          <FileText className="w-4 h-4" /> Medical Records
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#BA1A1A] hover:bg-red-50 transition-colors text-sm w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-btn hover:bg-[#F2F3FF]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-4 py-4 space-y-2 animate-fade-in">
          <Link to="/"        className="block nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/doctors" className="block nav-link" onClick={() => setMobileOpen(false)}>Find Doctors</Link>
          {user ? (
            <>
              <Link to={dashboardLink} className="block nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left nav-link text-[#BA1A1A]">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block btn-secondary text-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block btn-primary text-center"   onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
