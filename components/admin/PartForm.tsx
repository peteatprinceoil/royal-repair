"use client"

import { useState, useTransition, useRef } from "react"
import { SkuScanner } from "@/components/parts/SkuScanner"
import { ScanBarcode } from "lucide-react"
import type { Part } from "@/lib/types"

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Part>
}

export function PartForm({ action, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [sku, setSku] = useState(defaultValues?.sku ?? "")

  function handleScan(scannedSku: string) {
    setScannerOpen(false)
    setSku(scannedSku.trim().toUpperCase())
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await action(fd)
      } catch (err: any) {
        setError(err?.message ?? "Failed to save part. Please try again.")
      }
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          SKU <span className="text-[#ba1a1a]">*</span>
        </label>
        <p className="text-xs text-[#737688] mb-2">Scan the barcode or type the product code manually.</p>
        <div className="flex gap-2">
          <input
            name="sku"
            required
            placeholder="e.g. FILT-20X25"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            className="flex-1 h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] font-mono placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
          />
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-[#434656] hover:border-[#003ec7] hover:text-[#003ec7] transition-colors flex items-center gap-2 font-semibold text-sm"
          >
            <ScanBarcode size={18} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Part Name <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="e.g. 20x25 Air Filter"
          defaultValue={defaultValues?.name}
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Unit Price ($) <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="unit_price"
          type="number"
          required
          min={0}
          step={0.01}
          placeholder="0.00"
          defaultValue={defaultValues?.unit_price}
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60 transition-colors hover:bg-[#0033a8]"
      >
        {isPending ? "Saving…" : "Save Part"}
      </button>
    </form>

    {scannerOpen && (
      <SkuScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
    )}
    </>
  )
}
