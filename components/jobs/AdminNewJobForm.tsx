"use client"

import { useState, useTransition } from "react"
import { createJobAsAdmin } from "@/lib/actions/jobs"
import { getPartBySku } from "@/lib/actions/parts"
import { SkuScanner } from "@/components/parts/SkuScanner"
import { Plus, Trash2, ScanBarcode } from "lucide-react"
import type { LineItem } from "@/lib/types"

interface Props {
  customers: { id: string; name: string; service_address: string }[]
  techs: { id: string; full_name: string }[]
  discountPct: number
}

export function AdminNewJobForm({ customers, techs, discountPct }: Props) {
  const [isPending, startTransition] = useTransition()
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ])
  const [paymentType, setPaymentType] = useState<"onsite" | "remote">("onsite")
  const [error, setError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [partError, setPartError] = useState<string | null>(null)

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const discount = paymentType === "onsite" ? (subtotal * discountPct) / 100 : 0
  const total = subtotal - discount

  function addLine() {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }])
  }

  function removeLine(i: number) {
    setLineItems(lineItems.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    setLineItems(lineItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  async function handlePartScan(sku: string) {
    setScannerOpen(false)
    setPartError(null)
    const part = await getPartBySku(sku)
    if (part) {
      setLineItems((prev) => [...prev, { description: part.name, quantity: 1, unit_price: part.unit_price }])
    } else {
      setPartError(`SKU "${sku}" not found in parts catalog. A blank line item was added.`)
      setLineItems((prev) => [...prev, { description: `SKU: ${sku}`, quantity: 1, unit_price: 0 }])
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("line_items", JSON.stringify(lineItems))
    fd.set("payment_type", paymentType)

    startTransition(async () => {
      try {
        await createJobAsAdmin(fd)
      } catch (err) {
        setError("Failed to create job. Please try again.")
      }
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Customer <span className="text-[#ba1a1a]">*</span>
        </label>
        {customers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#e5e2e1] p-6 text-center">
            <p className="text-sm text-[#737688]">No customers yet.</p>
            <a href="/admin/customers" className="text-sm font-semibold text-[#003ec7] mt-1 inline-block">
              View customers →
            </a>
          </div>
        ) : (
          <select
            name="customer_id"
            required
            defaultValue=""
            className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] focus:outline-none focus:border-[#003ec7] transition-colors"
          >
            <option value="" disabled>Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.service_address}</option>
            ))}
          </select>
        )}
      </div>

      {/* Assign to tech */}
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Assign to Tech
          <span className="ml-1 text-xs font-normal text-[#737688]">(optional)</span>
        </label>
        <select
          name="assigned_to"
          defaultValue=""
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] focus:outline-none focus:border-[#003ec7] transition-colors"
        >
          <option value="">Unassigned (visible to all techs)</option>
          {techs.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>
      </div>

      {/* Job title */}
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Job Title <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="title"
          required
          placeholder="e.g. AC Unit Repair"
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      {/* Payment type */}
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-2">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentType("onsite")}
            className={`h-16 rounded-xl border-2 font-semibold text-sm transition-colors ${
              paymentType === "onsite"
                ? "border-[#003ec7] bg-[#003ec7] text-white"
                : "border-[#e5e2e1] bg-white text-[#434656]"
            }`}
          >
            On-Site QR
            {discountPct > 0 && <span className="block text-xs opacity-80">{discountPct}% discount</span>}
          </button>
          <button
            type="button"
            onClick={() => setPaymentType("remote")}
            className={`h-16 rounded-xl border-2 font-semibold text-sm transition-colors ${
              paymentType === "remote"
                ? "border-[#003ec7] bg-[#003ec7] text-white"
                : "border-[#e5e2e1] bg-white text-[#434656]"
            }`}
          >
            Send by Email
            <span className="block text-xs opacity-80">Full price</span>
          </button>
        </div>
      </div>

      {/* Line items */}
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-2">Line Items</label>
        <div className="space-y-3">
          {lineItems.map((item, i) => (
            <div key={i} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#737688] uppercase tracking-widest">Item {i + 1}</span>
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLine(i)} className="text-[#ba1a1a]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLine(i, "description", e.target.value)}
                required
                className="w-full h-12 px-3 rounded-lg border-2 border-[#e5e2e1] bg-[#f6f3f2] text-sm text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#737688] block mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)}
                    className="w-full h-12 px-3 rounded-lg border-2 border-[#e5e2e1] bg-[#f6f3f2] text-sm text-center font-bold text-[#1c1b1b] focus:outline-none focus:border-[#003ec7] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#737688] block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(e) => updateLine(i, "unit_price", parseFloat(e.target.value) || 0)}
                    className="w-full h-12 px-3 rounded-lg border-2 border-[#e5e2e1] bg-[#f6f3f2] text-sm text-center font-bold text-[#1c1b1b] focus:outline-none focus:border-[#003ec7] transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-4">
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 text-sm font-semibold text-[#003ec7]"
          >
            <Plus size={16} /> Add Line Item
          </button>
          <button
            type="button"
            onClick={() => { setPartError(null); setScannerOpen(true) }}
            className="flex items-center gap-2 text-sm font-semibold text-[#434656]"
          >
            <ScanBarcode size={16} /> Add Part
          </button>
        </div>

        {partError && (
          <p className="mt-2 text-sm text-[#6c4600] bg-[#fff7e6] border border-[#ffd699] rounded-lg px-4 py-2">
            {partError}
          </p>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5 space-y-2">
        <div className="flex justify-between text-sm text-[#434656]">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-[#006e2a]">
            <span>On-Site Discount ({discountPct}%)</span>
            <span>−${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-[#1c1b1b] pt-2 border-t border-[#e5e2e1]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || customers.length === 0}
        className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60 transition-colors hover:bg-[#0033a8]"
      >
        {isPending ? "Creating…" : "Create Job"}
      </button>
    </form>

    {scannerOpen && (
      <SkuScanner onScan={handlePartScan} onClose={() => setScannerOpen(false)} />
    )}
    </>
  )
}
