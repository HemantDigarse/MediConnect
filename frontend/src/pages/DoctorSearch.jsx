import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchDoctors } from '../store/slices/doctorsSlice'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DoctorCard from '../components/DoctorCard'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'

const SPECIALTIES = ['Cardiologist','Dermatologist','Neurologist','Pediatrician','Orthopedic','Psychiatrist','Gynecologist','General Physician','Ophthalmologist','ENT Specialist','Dentist','Radiologist']

export default function DoctorSearch() {
  const dispatch = useDispatch()
  const { doctors, loading, totalPages, totalElements } = useSelector(s => s.doctors)
  const [filters, setFilters] = useState({ specialty: '', city: '', minFee: '', maxFee: '', minRating: '' })
  const [page, setPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    dispatch(searchDoctors({ ...buildQuery(), page, size: 12 }))
  }, [page, filters, dispatch])

  const buildQuery = () => {
    const q = {}
    if (filters.specialty) q.specialty = filters.specialty
    if (filters.city)      q.city      = filters.city
    if (filters.minFee)    q.minFee    = Number(filters.minFee)
    if (filters.maxFee)    q.maxFee    = Number(filters.maxFee)
    if (filters.minRating) q.minRating = Number(filters.minRating)
    return q
  }

  const handleSearch = (e) => { e.preventDefault(); setPage(0); dispatch(searchDoctors({ ...buildQuery(), page: 0, size: 12 })) }
  const clearFilters = () => { setFilters({ specialty: '', city: '', minFee: '', maxFee: '', minRating: '' }); setPage(0) }
  const hasFilters   = Object.values(filters).some(v => v !== '')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        {/* Hero bar */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 py-10 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Find the Right Doctor</h1>
            <p className="text-teal-200 mb-6">Browse {totalElements || '2,000+'} verified specialists</p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={searchText} onChange={e => setSearchText(e.target.value)}
                  placeholder="Search specialty or doctor name..."
                  className="input pl-10 w-full" />
              </div>
              <button type="submit" className="btn-primary !px-6">Search</button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Filters sidebar */}
            <aside className={`lg:w-64 shrink-0 space-y-4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                  {hasFilters && <button onClick={clearFilters} className="text-xs text-teal-600 flex items-center gap-1 hover:text-teal-800"><X className="w-3 h-3" /> Clear</button>}
                </div>

                <div className="space-y-4">
                  {/* Specialty */}
                  <div>
                    <label className="label">Specialty</label>
                    <select className="input text-sm" value={filters.specialty} onChange={e => { setFilters({...filters, specialty: e.target.value}); setPage(0) }}>
                      <option value="">All Specialties</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="label">City</label>
                    <input placeholder="e.g. Mumbai" className="input text-sm" value={filters.city}
                      onChange={e => { setFilters({...filters, city: e.target.value}); setPage(0) }} />
                  </div>

                  {/* Fee Range */}
                  <div>
                    <label className="label">Consultation Fee (₹)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" className="input text-sm" value={filters.minFee}
                        onChange={e => { setFilters({...filters, minFee: e.target.value}); setPage(0) }} />
                      <input type="number" placeholder="Max" className="input text-sm" value={filters.maxFee}
                        onChange={e => { setFilters({...filters, maxFee: e.target.value}); setPage(0) }} />
                    </div>
                  </div>

                  {/* Min Rating */}
                  <div>
                    <label className="label">Minimum Rating</label>
                    <select className="input text-sm" value={filters.minRating} onChange={e => { setFilters({...filters, minRating: e.target.value}); setPage(0) }}>
                      <option value="">Any Rating</option>
                      {[3,3.5,4,4.5].map(r => <option key={r} value={r}>{r}+ ⭐</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm font-medium">
                  {loading ? 'Searching...' : `${totalElements || doctors.length} doctors found`}
                </p>
                <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-2 text-teal-700 font-medium text-sm">
                  <SlidersHorizontal className="w-4 h-4" /> {filtersOpen ? 'Hide' : 'Filters'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {loading
                  ? Array.from({length:9}).map((_,i) => <CardSkeleton key={i} />)
                  : doctors.length === 0
                    ? <div className="col-span-3 text-center py-16 text-gray-400">No doctors found. Try different filters.</div>
                    : doctors.map(d => <DoctorCard key={d.id} doctor={d} />)
                }
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                    className="p-2 rounded-xl border-2 border-gray-200 hover:border-teal-400 disabled:opacity-40 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-gray-600 font-medium">Page {page+1} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                    className="p-2 rounded-xl border-2 border-gray-200 hover:border-teal-400 disabled:opacity-40 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
