import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign, Award } from 'lucide-react'

export default function DoctorCard({ doctor }) {
  const { id, fullName, specialty, city, rating, reviewCount, consultationFee, experienceYears, profileImageUrl, isAvailable } = doctor
  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  return (
    <div className="card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={fullName} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isAvailable ? 'bg-green-400' : 'bg-gray-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-teal-700 transition-colors">Dr. {fullName}</h3>
          <p className="text-teal-600 font-medium text-sm">{specialty}</p>
          {city && (
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <MapPin className="w-3 h-3" /><span>{city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-800 text-sm">{rating?.toFixed(1) || '0.0'}</span>
          </div>
          <p className="text-xs text-gray-400">{reviewCount} reviews</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-0.5">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-gray-800 text-sm">{experienceYears}y</span>
          </div>
          <p className="text-xs text-gray-400">Experience</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-0.5">
            <span className="font-bold text-gray-800 text-sm">₹{consultationFee}</span>
          </div>
          <p className="text-xs text-gray-400">Fee</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/doctors/${id}`} className="flex-1 text-center py-2.5 rounded-xl border-2 border-teal-700 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors">
          View Profile
        </Link>
        <Link to={`/book/${id}`} className="flex-1 text-center py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors">
          Book Now
        </Link>
      </div>
    </div>
  )
}
