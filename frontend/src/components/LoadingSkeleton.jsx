export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 skeleton rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1,2,3].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 skeleton rounded-xl" />
        <div className="flex-1 h-10 skeleton rounded-xl" />
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 skeleton rounded w-2/3" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
            <div className="h-6 w-20 skeleton rounded-full" />
          </div>
          <div className="h-12 skeleton rounded-xl mb-3" />
          <div className="h-10 skeleton rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 skeleton rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 skeleton rounded w-2/3" />
              <div className="h-6 skeleton rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  )
}
