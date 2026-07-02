"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-sm font-semibold text-[#434656] hover:text-[#003ec7] transition-colors -ml-1 mb-4"
    >
      <ChevronLeft size={18} />
      Back
    </button>
  )
}
