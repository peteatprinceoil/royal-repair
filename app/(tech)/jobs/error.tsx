"use client"

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <p className="text-lg font-bold text-[#1c1b1b] mb-2">Something went wrong</p>
      <p className="text-sm text-[#737688] mb-6">{error.message || "Failed to load jobs."}</p>
      <button
        onClick={reset}
        className="h-12 px-6 rounded-xl bg-[#003ec7] text-white font-semibold text-sm"
      >
        Try again
      </button>
    </div>
  )
}
