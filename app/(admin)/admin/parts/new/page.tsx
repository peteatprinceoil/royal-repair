import { PartForm } from "@/components/admin/PartForm"
import { createPart } from "@/lib/actions/parts"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NewPartPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/parts" className="text-[#737688] hover:text-[#1c1b1b]">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">Add Part</h1>
      </div>
      <PartForm action={createPart} />
    </div>
  )
}
