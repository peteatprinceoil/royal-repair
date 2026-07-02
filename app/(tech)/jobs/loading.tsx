export default function JobsLoading() {
  return (
    <div className="px-5 pt-6">
      {/* AR summary skeleton */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5 mb-6 animate-pulse">
        <div className="h-3 w-24 bg-[#e5e2e1] rounded mb-3" />
        <div className="h-10 w-36 bg-[#e5e2e1] rounded" />
      </div>

      {/* CTA skeleton */}
      <div className="h-14 rounded-xl bg-[#e5e2e1] animate-pulse mb-6" />

      {/* Job list skeletons */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#e5e2e1] rounded" />
                <div className="h-3 w-48 bg-[#e5e2e1] rounded" />
                <div className="h-3 w-40 bg-[#e5e2e1] rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 w-16 bg-[#e5e2e1] rounded" />
                <div className="h-5 w-16 bg-[#e5e2e1] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
