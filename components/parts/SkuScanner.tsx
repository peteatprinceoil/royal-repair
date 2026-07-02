"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, X } from "lucide-react"

interface Props {
  onScan: (sku: string) => void
  onClose: () => void
}

export function SkuScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<any>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualSku, setManualSku] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      try {
        scannerRef.current?.stop()
      } catch {}
    }
  }, [])

  async function startCamera() {
    setCameraError(null)
    setLoading(true)

    try {
      const mod = await import("html5-qrcode").catch(() => null)
      if (!mod) {
        setCameraError("Scanner failed to load. Enter SKU manually.")
        setLoading(false)
        return
      }

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = mod

      const el = document.getElementById("sku-scanner-region")
      if (!el) {
        setCameraError("Scanner region not found. Enter SKU manually.")
        setLoading(false)
        return
      }

      const scanner = new Html5Qrcode("sku-scanner-region", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      })

      scannerRef.current = scanner
      setLoading(false)
      setScanning(true)

      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 280, height: 120 } },
        (decodedText: string) => {
          try { scanner.stop() } catch {}
          setScanning(false)
          onScan(decodedText)
        },
        () => {}
      )
    } catch (err: any) {
      setLoading(false)
      setScanning(false)
      try { scannerRef.current?.stop() } catch {}
      scannerRef.current = null

      const msg = String(err?.message ?? err ?? "")
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setCameraError("Camera permission denied. Allow camera access in your browser settings, or enter the SKU manually.")
      } else if (msg.toLowerCase().includes("https") || msg.toLowerCase().includes("secure")) {
        setCameraError("Camera requires a secure (HTTPS) connection. Enter SKU manually.")
      } else {
        setCameraError("Camera unavailable. Enter SKU manually below.")
      }
    }
  }

  function stopCamera() {
    try { scannerRef.current?.stop() } catch {}
    scannerRef.current = null
    setScanning(false)
  }

  function handleClose() {
    stopCamera()
    onClose()
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (manualSku.trim()) onScan(manualSku.trim())
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={handleClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1c1b1b]">Add Part by SKU</h2>
          <button onClick={handleClose} className="text-[#737688] p-1">
            <X size={20} />
          </button>
        </div>

        {/* Camera preview area */}
        <div id="sku-scanner-region" className="w-full overflow-hidden rounded-xl" />

        {scanning && (
          <p className="text-xs text-center text-[#737688]">
            Hold the barcode steady inside the box — supports UPC, EAN, QR, Code 128 and more
          </p>
        )}

        {cameraError && (
          <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
            {cameraError}
          </p>
        )}

        {loading ? (
          <div className="w-full h-12 rounded-xl border-2 border-[#e5e2e1] flex items-center justify-center text-sm text-[#737688]">
            Starting camera…
          </div>
        ) : !scanning ? (
          <button
            type="button"
            onClick={startCamera}
            className="w-full h-12 rounded-xl border-2 border-[#003ec7] text-[#003ec7] font-semibold flex items-center justify-center gap-2"
          >
            <Camera size={18} /> Scan Barcode
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="w-full h-12 rounded-xl border-2 border-[#737688] text-[#737688] font-semibold"
          >
            Cancel Scan
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e5e2e1]" />
          <span className="text-xs text-[#737688]">or enter manually</span>
          <div className="flex-1 h-px bg-[#e5e2e1]" />
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={manualSku}
            onChange={(e) => setManualSku(e.target.value)}
            placeholder="Type SKU…"
            autoCapitalize="characters"
            className="flex-1 h-12 px-3 rounded-lg border-2 border-[#e5e2e1] text-sm focus:outline-none focus:border-[#003ec7] transition-colors"
          />
          <button
            type="submit"
            disabled={!manualSku.trim()}
            className="h-12 px-5 rounded-lg bg-[#003ec7] text-white font-semibold text-sm disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  )
}
