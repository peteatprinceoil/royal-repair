export default function CustomersLoading() {
  return (
    <div className="px-5 pt-6">
      {/* Search skeleton */}
      <div className="h-14 rounded-xl bg-[#e5e2e1] animate-pulse mb-5" />

      {/* CTA skeleton */}
      <div className="h-14 rounded-xl bg-[#e5e2e1] animate-pulse mb-6" />

      {/* Customer list skeletons */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 animate-pulse flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-[#e5e2e1] rounded" />
              <div className="h-3 w-52 bg-[#e5e2e1] rounded" />
              <div className="h-3 w-28 bg-[#e5e2e1] rounded" />
            </div>
            <div className="h-5 w-5 bg-[#e5e2e1] rounded ml-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
