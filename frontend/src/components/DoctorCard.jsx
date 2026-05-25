import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign, Award } from 'lucide-react'

export default function DoctorCard({ doctor }) {
  const { id, fullName, specialty, city, rating, reviewCount, consultationFee, experienceYears, profileImageUrl, isAvailable } = doctor
  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  return (
    <div className="card hover:shadow-level-2 hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={fullName} className="w-16 h-16 rounded-card object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-card bg-gradient-to-br from-[#004AC6] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isAvailable ? 'bg-emerald-400' : 'bg-gray-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#131B2E] truncate group-hover:text-[#004AC6] transition-colors">Dr. {fullName}</h3>
          <p className="text-[#004AC6] font-medium text-sm">{specialty}</p>
          {city && (
            <div className="flex items-center gap-1 text-[#737686] text-xs mt-0.5">
              <MapPin className="w-3 h-3" /><span>{city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-[#F2F3FF] rounded-btn">
          <div className="flex items-center justify-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-[#131B2E] text-sm">{rating?.toFixed(1) || '0.0'}</span>
          </div>
          <p className="text-xs text-[#737686]">{reviewCount} reviews</p>
        </div>
        <div className="text-center p-2 bg-[#F2F3FF] rounded-btn">
          <div className="flex items-center justify-center gap-0.5">
            <Award className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-bold text-[#131B2E] text-sm">{experienceYears}y</span>
          </div>
          <p className="text-xs text-[#737686]">Experience</p>
        </div>
        <div className="text-center p-2 bg-[#F2F3FF] rounded-btn">
          <div className="flex items-center justify-center gap-0.5">
            <span className="font-bold text-[#131B2E] text-sm">₹{consultationFee}</span>
          </div>
          <p className="text-xs text-[#737686]">Fee</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/doctors/${id}`} className="flex-1 text-center py-2.5 rounded-btn border border-[#004AC6] text-[#004AC6] font-semibold text-sm hover:bg-[#F2F3FF] transition-colors">
          View Profile
        </Link>
        <Link to={`/book/${id}`} className="flex-1 text-center py-2.5 rounded-btn text-white font-semibold text-sm hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg, #004AC6 0%, #00687A 100%)' }}>
          Book Now
        </Link>
      </div>
    </div>
  )
}
