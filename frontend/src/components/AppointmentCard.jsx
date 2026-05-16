import { Link } from 'react-router-dom'
import { Calendar, Clock, Video, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   badge: 'badge-yellow', icon: AlertCircle },
  CONFIRMED: { label: 'Confirmed', badge: 'badge-green',  icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', badge: 'badge-red',    icon: XCircle },
  COMPLETED: { label: 'Completed', badge: 'badge-teal',   icon: CheckCircle },
}

const PAY_CONFIG = {
  PENDING:  { label: 'Payment Pending', cls: 'text-yellow-600 bg-yellow-50' },
  PAID:     { label: 'Paid',           cls: 'text-green-600 bg-green-50' },
  REFUNDED: { label: 'Refunded',       cls: 'text-gray-500 bg-gray-50' },
}

export default function AppointmentCard({ appointment, onCancel }) {
  const { id, doctorName, patientName, specialty, slotDate, slotStartTime, slotEndTime, status, paymentStatus, consultationFee } = appointment
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const payCfg = PAY_CONFIG[paymentStatus] || PAY_CONFIG.PENDING
  const StatusIcon = cfg.icon
  const isUpcoming = status === 'CONFIRMED' && new Date(`${slotDate}T${slotStartTime}`) > new Date()

  return (
    <div className="card flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{specialty}</p>
          <h4 className="font-bold text-gray-900">{doctorName ? `Dr. ${doctorName}` : patientName}</h4>
        </div>
        <span className={`badge ${cfg.badge} flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />{cfg.label}
        </span>
      </div>

      {/* Date/Time */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-medium">{slotDate ? format(new Date(slotDate), 'dd MMM yyyy') : '-'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{slotStartTime} – {slotEndTime}</span>
        </div>
      </div>

      {/* Payment + Fee */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${payCfg.cls}`}>{payCfg.label}</span>
        <span className="font-bold text-gray-800">₹{consultationFee}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        {isUpcoming && (
          <Link to={`/video-consult/${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors">
            <Video className="w-4 h-4" /> Join Call
          </Link>
        )}
        {(status === 'PENDING' || status === 'CONFIRMED') && onCancel && (
          <button onClick={() => onCancel(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}
