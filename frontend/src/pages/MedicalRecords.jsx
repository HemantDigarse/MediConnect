import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { FileText, Upload, Heart, AlertCircle, Pill, Activity, Download, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MedicalRecords() {
  const { user } = useSelector(s => s.auth)
  const [record, setRecord]         = useState(null)
  const [labReports, setLabReports] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [editing, setEditing]       = useState(false)
  const [form, setForm]             = useState({})
  const [uploading, setUploading]   = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { loadAll() }, [user?.id])

  const loadAll = async () => {
    try {
      const [recRes] = await Promise.all([api.get(`/records/patient/${user.id}`)])
      const rec = recRes.data.data
      setRecord(rec)
      setForm(rec || {})
      if (rec?.id) {
        const labRes = await api.get(`/records/lab-reports/${rec.id}`)
        setLabReports(labRes.data.data || [])
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      await api.put(`/records/patient/${user.id}`, form)
      toast.success('Health profile updated!')
      setEditing(false)
      loadAll()
    } catch { toast.error('Update failed') }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('patientId', user.id)
    fd.append('reportName', file.name.replace(/\.[^.]+$/, ''))
    fd.append('reportType', 'General')
    try {
      await api.post('/records/lab-report', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Lab report uploaded!')
      loadAll()
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const fields = [
    { key: 'bloodGroup',          label: 'Blood Group',           placeholder: 'e.g. O+', type: 'text', icon: Heart, color: 'text-red-500' },
    { key: 'allergies',           label: 'Known Allergies',       placeholder: 'e.g. Penicillin, Pollen', type: 'text', icon: AlertCircle, color: 'text-amber-500' },
    { key: 'chronicConditions',   label: 'Chronic Conditions',    placeholder: 'e.g. Diabetes, Hypertension', type: 'text', icon: Activity, color: 'text-purple-500' },
    { key: 'currentMedications',  label: 'Current Medications',   placeholder: 'e.g. Metformin 500mg', type: 'text', icon: Pill, color: 'text-[#004AC6]' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-surface"><Navbar />
      <div className="pt-28 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#DBE1FF] border-t-[#004AC6] rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#131B2E]">Medical Records</h1>
            <p className="text-[#737686] mt-1">Your complete health profile and documents</p>
          </div>
          <button onClick={() => editing ? handleSave() : setEditing(true)}
            className={editing ? 'btn-primary' : 'btn-secondary'}>
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-lg font-bold text-[#131B2E] mb-5 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" /> Health Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {fields.map(({ key, label, placeholder, icon: Icon, color }) => (
                  <div key={key}>
                    <label className="label flex items-center gap-1.5"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</label>
                    {editing
                      ? <input className="input" placeholder={placeholder} value={form[key] || ''}
                          onChange={e => setForm({ ...form, [key]: e.target.value })} />
                      : <p className={`text-sm py-2 ${record?.[key] ? 'text-[#131B2E] font-medium' : 'text-[#C3C6D7] italic'}`}>
                          {record?.[key] || 'Not specified'}
                        </p>
                    }
                  </div>
                ))}

                {/* Height & Weight */}
                <div>
                  <label className="label">Height (cm)</label>
                  {editing
                    ? <input type="number" className="input" placeholder="170" value={form.heightCm || ''}
                        onChange={e => setForm({ ...form, heightCm: e.target.value })} />
                    : <p className={`text-sm py-2 ${record?.heightCm ? 'text-[#131B2E] font-medium' : 'text-[#C3C6D7] italic'}`}>
                        {record?.heightCm ? `${record.heightCm} cm` : 'Not specified'}
                      </p>
                  }
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  {editing
                    ? <input type="number" className="input" placeholder="70" value={form.weightKg || ''}
                        onChange={e => setForm({ ...form, weightKg: e.target.value })} />
                    : <p className={`text-sm py-2 ${record?.weightKg ? 'text-[#131B2E] font-medium' : 'text-[#C3C6D7] italic'}`}>
                        {record?.weightKg ? `${record.weightKg} kg` : 'Not specified'}
                      </p>
                  }
                </div>
              </div>
              {editing && (
                <div className="flex gap-3 mt-5 pt-4 border-t border-[#E2E8F0]">
                  <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSave} className="btn-primary flex-1">Save Changes</button>
                </div>
              )}
            </div>

            {/* Lab Reports */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#131B2E] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#004AC6]" /> Lab Reports
                </h2>
                <label className={`btn-secondary text-sm flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  {uploading ? <><span className="w-4 h-4 border-2 border-[#B4C5FF] border-t-[#004AC6] rounded-full animate-spin" /> Uploading...</>
                    : <><Upload className="w-4 h-4" /> Upload Report</>}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
              {labReports.length === 0
                ? <div className="text-center py-8 text-[#C3C6D7]">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No lab reports uploaded yet.</p>
                  </div>
                : <div className="space-y-3">
                    {labReports.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-[#F2F3FF] rounded-btn hover:bg-[#EAEdFF] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#DBE1FF] rounded-btn flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#004AC6]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#131B2E]">{r.reportName}</p>
                            <p className="text-xs text-[#C3C6D7]">{format(new Date(r.uploadedAt), 'dd MMM yyyy')}</p>
                          </div>
                        </div>
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#004AC6] text-sm font-medium hover:text-[#003EA8] transition-colors">
                          <Download className="w-4 h-4" /> View
                        </a>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* Summary card */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-[#131B2E] mb-4">Health Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Blood Group',  value: record?.bloodGroup, badge: 'badge-red' },
                  { label: 'Height',       value: record?.heightCm ? `${record.heightCm} cm` : null },
                  { label: 'Weight',       value: record?.weightKg ? `${record.weightKg} kg` : null },
                  { label: 'BMI',          value: record?.heightCm && record?.weightKg ? (record.weightKg / ((record.heightCm / 100) ** 2)).toFixed(1) : null },
                ].map(({ label, value, badge }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#F2F3FF] last:border-0">
                    <span className="text-sm text-[#737686]">{label}</span>
                    {value
                      ? badge ? <span className={`badge ${badge}`}>{value}</span> : <span className="text-sm font-semibold text-[#131B2E]">{value}</span>
                      : <span className="text-xs text-[#C3C6D7]">—</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-[#131B2E] mb-3">Documents</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#737686]">Lab Reports</span>
                <span className="font-bold text-[#004AC6]">{labReports.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
