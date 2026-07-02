"use client"

import { useState } from "react"
import { Download } from "lucide-react"

export default function ExportPage() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [status, setStatus] = useState("all")

  function buildUrl() {
    const params = new URLSearchParams({ status })
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    return `/api/export?${params.toString()}`
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-[24px] font-bold text-[#1c1b1b]">Export Data</h1>
      <p className="text-sm text-[#434656]">Download a CSV of job and customer data for import into PDI or your accounting system.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">From Date</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base focus:outline-none focus:border-[#003ec7]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">To Date</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base focus:outline-none focus:border-[#003ec7]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base focus:outline-none focus:border-[#003ec7]">
            <option value="all">All</option>
            <option value="paid">Paid only</option>
            <option value="pending">Pending only</option>
          </select>
        </div>
      </div>

      <a href={buildUrl()} download
        className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base">
        <Download size={20} /> Download CSV
      </a>

      <div className="bg-[#f6f3f2] border border-[#e5e2e1] rounded-xl p-4 text-xs text-[#434656] space-y-1">
        <p className="font-semibold text-[#1c1b1b]">Columns included:</p>
        <p>Customer Name, Service Address, Phone, Email, Job Title, Tech Name, Created Date, Sent Date, Paid Date, Subtotal, Discount %, Discount Amount, Total, Payment Type, Status</p>
      </div>
    </div>
  )
}
