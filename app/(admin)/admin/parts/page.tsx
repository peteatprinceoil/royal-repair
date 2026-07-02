import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { deletePart } from "@/lib/actions/parts"
import { Plus } from "lucide-react"

export default async function PartsPage() {
  const supabase = await createClient()

  const { data: parts } = await supabase
    .from("parts")
    .select("*")
    .order("sku")

  const all = parts ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">Parts Catalog</h1>
        <Link
          href="/admin/parts/new"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#003ec7] text-white font-semibold text-sm"
        >
          <Plus size={16} /> Add Part
        </Link>
      </div>

      {all.length === 0 && (
        <div className="text-center py-16 text-[#737688]">
          <p className="text-lg font-semibold">No parts yet</p>
          <p className="text-sm mt-1">Add parts to quickly populate job line items by scanning their SKU.</p>
        </div>
      )}

      <div className="space-y-2">
        {all.map((part) => (
          <div key={part.id} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-[#003ec7] bg-[#eff3ff] px-2 py-0.5 rounded">
                  {part.sku}
                </span>
              </div>
              <p className="font-semibold text-[#1c1b1b] mt-1 truncate">{part.name}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="font-bold text-[#1c1b1b]">${Number(part.unit_price).toFixed(2)}</p>
              <form
                action={async () => {
                  "use server"
                  await deletePart(part.id)
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-[#ba1a1a] hover:underline font-semibold"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
