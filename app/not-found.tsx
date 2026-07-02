import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8] px-5">
      <div className="text-center">
        <p className="text-5xl font-bold text-[#003ec7] mb-3">404</p>
        <p className="text-lg font-semibold text-[#1c1b1b] mb-2">Page not found</p>
        <p className="text-sm text-[#737688] mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[#003ec7] text-white font-semibold text-sm"
        >
          Back to Jobs
        </Link>
      </div>
    </div>
  )
}
