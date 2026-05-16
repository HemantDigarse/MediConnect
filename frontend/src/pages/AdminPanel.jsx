import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosInstance'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, Stethoscope, Calendar, DollarSign, Shield, ShieldOff, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(0)
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats(); loadUsers() }, [page])

  const loadStats = async () => {
    try { const r = await api.get('/admin/stats'); setStats(r.data.data) } catch {}
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/users?page=${page}&size=15`)
      setUsers(r.data.data?.content || [])
      setTotal(r.data.data?.totalElements || 0)
    } catch {} finally { setLoading(false) }
  }

  const toggleStatus = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}/status?isActive=${!isActive}`)
      toast.success(`User ${isActive ? 'disabled' : 'enabled'}`)
      loadUsers()
    } catch { toast.error('Failed') }
  }

  const chartData = stats ? [
    { name: 'Patients',   value: stats.totalPatients },
    { name: 'Doctors',    value: stats.totalDoctors },
    { name: 'Appts',      value: stats.totalAppointments },
    { name: 'Completed',  value: stats.completedAppointments },
    { name: 'Pending',    value: stats.pendingAppointments },
  ] : []

  const statCards = [
    { icon: Users,      label: 'Total Users',    value: stats?.totalUsers || 0,       color: 'from-blue-500 to-blue-700' },
    { icon: Stethoscope,label: 'Doctors',         value: stats?.totalDoctors || 0,     color: 'from-teal-500 to-teal-700' },
    { icon: Calendar,   label: 'Appointments',   value: stats?.totalAppointments || 0, color: 'from-purple-500 to-purple-700' },
    { icon: DollarSign, label: 'Revenue (₹)',    value: `₹${stats?.totalRevenue || 0}`, color: 'from-green-500 to-green-700' },
  ]

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0F766E" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">User Management ({total})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..." className="input pl-9 text-sm w-60" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name','Email','Role','Status','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length:6}).map((_,i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {[1,2,3,4,5].map(j => <td key={j} className="py-3 px-4"><div className="h-4 skeleton rounded w-24" /></td>)}
                      </tr>
                    ))
                  : filtered.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${u.role === 'DOCTOR' ? 'badge-teal' : u.role === 'ADMIN' ? 'badge-blue' : 'badge-green'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => toggleStatus(u.id, u.isActive)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              u.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-700 bg-green-50 hover:bg-green-100'
                            }`}>
                            {u.isActive ? <><ShieldOff className="w-3.5 h-3.5" /> Disable</> : <><Shield className="w-3.5 h-3.5" /> Enable</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {filtered.length} of {total} users</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={(page+1)*15 >= total}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
