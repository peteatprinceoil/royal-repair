export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-[#e5e2e1] rounded animate-pulse" />

      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 animate-pulse">
            <div className="h-3 w-24 bg-[#e5e2e1] rounded mb-2" />
            <div className="h-7 w-20 bg-[#e5e2e1] rounded" />
          </div>
        ))}
      </div>

      {/* Status breakdown skeleton */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5 animate-pulse">
        <div className="h-3 w-20 bg-[#e5e2e1] rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-16 bg-[#e5e2e1] rounded" />
              <div className="h-4 w-8 bg-[#e5e2e1] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5 animate-pulse">
        <div className="h-3 w-32 bg-[#e5e2e1] rounded mb-4" />
        <div className="h-44 bg-[#e5e2e1] rounded" />
      </div>
    </div>
  )
}
