"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Part } from "@/lib/types"

export default function TechPartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("parts")
      .select("*")
      .order("sku")
      .then(({ data }) => {
        setParts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = parts.filter(
    (p) =>
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-5 pt-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b] mb-5">Parts Catalog</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by SKU or name…"
        className="w-full h-12 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-sm text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors mb-5"
      />

      {loading && (
        <p className="text-sm text-[#737688] text-center py-8">Loading…</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-[#737688]">
          <p className="text-lg font-semibold">{query ? "No parts match" : "No parts yet"}</p>
          {query && (
            <button onClick={() => setQuery("")} className="text-sm text-[#003ec7] mt-1">
              Clear search
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((part) => (
          <div key={part.id} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold font-mono text-[#003ec7] bg-[#eff3ff] px-2 py-0.5 rounded">
                {part.sku}
              </span>
              <p className="font-semibold text-[#1c1b1b] mt-1 truncate">{part.name}</p>
            </div>
            <p className="font-bold text-[#1c1b1b] shrink-0">${Number(part.unit_price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
