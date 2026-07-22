"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { generateCheckoutSession, sendPaymentEmail, sendPaymentText, cancelJob, switchPaymentType } from "@/lib/actions/jobs"
import { QrCode, Mail, MessageSquare, XCircle, RefreshCw } from "lucide-react"
import type { JobStatus, PaymentType } from "@/lib/types"

interface Props {
  job: {
    id: string
    status: JobStatus
    payment_type: PaymentType
    payment_token: string
    total: number
    sent_at: string | null
    paid_at: string | null
  }
}

export function JobActions({ job }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingText, setLoadingText] = useState(false)
  const [loadingSwitch, setLoadingSwitch] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const router = useRouter()

  async function handleGenerateQR() {
    setLoadingQr(true)
    try {
      const result = await generateCheckoutSession(job.id)
      if (result.error) { toast.error(result.error); return }

      const QRCode = (await import("qrcode")).default
      const payUrl = `${appUrl}/pay/${job.payment_token}`
      const dataUrl = await QRCode.toDataURL(payUrl, { width: 280, margin: 2 })
      setQrDataUrl(dataUrl)
    } catch {
      toast.error("Failed to generate QR code.")
    } finally {
      setLoadingQr(false)
    }
  }

  async function handleSendText() {
    setLoadingText(true)
    try {
      const result = await sendPaymentText(job.id)
      if (result.success) {
        toast.success("Payment text sent!")
      } else {
        toast.error(result.error ?? "Failed to send text.")
      }
    } finally {
      setLoadingText(false)
    }
  }

  async function handleSendEmail() {
    setLoadingEmail(true)
    try {
      const result = await sendPaymentEmail(job.id)
      if (result.success) {
        toast.success("Payment email sent!")
      } else {
        toast.error(result.error ?? "Failed to send email.")
      }
    } finally {
      setLoadingEmail(false)
    }
  }

  async function handleSwitch() {
    const newType: PaymentType = job.payment_type === "onsite" ? "remote" : "onsite"
    setLoadingSwitch(true)
    try {
      await switchPaymentType(job.id, newType)
      setQrDataUrl(null)
      router.refresh()
    } catch {
      toast.error("Failed to switch payment type.")
    } finally {
      setLoadingSwitch(false)
    }
  }

  if (job.status === "paid") {
    return (
      <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-xl p-5 text-center">
        <p className="text-lg font-bold text-[#006e2a]">Payment Received</p>
        {job.paid_at && (
          <p className="text-sm text-[#006e2a] mt-1">
            {new Date(job.paid_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        )}
      </div>
    )
  }

  if (job.status === "cancelled") {
    return (
      <div className="bg-[#fef2f2] border-2 border-[#fecaca] rounded-xl p-5 text-center">
        <p className="text-base font-semibold text-[#ba1a1a]">Job Cancelled</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {job.payment_type === "onsite" ? (
        <>
          {qrDataUrl ? (
            <div className="bg-white border-2 border-[#003ec7] rounded-xl p-6 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-[#434656]">Customer scans to pay</p>
              <img src={qrDataUrl} alt="Payment QR code" className="rounded-lg" width={240} height={240} />
              <p className="text-[28px] font-bold text-[#003ec7]">${job.total.toFixed(2)}</p>
            </div>
          ) : (
            <button
              onClick={handleGenerateQR}
              disabled={loadingQr}
              className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60"
            >
              <QrCode size={20} />
              {loadingQr ? "Generating…" : "Generate QR Code"}
            </button>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleSendText}
            disabled={loadingText}
            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60"
          >
            <MessageSquare size={20} />
            {loadingText ? "Sending…" : job.sent_at ? "Resend Payment Text" : "Send Payment Text"}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={loadingEmail}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#e5e2e1] text-[#434656] font-semibold text-sm hover:border-[#003ec7] hover:text-[#003ec7] transition-colors disabled:opacity-60"
          >
            <Mail size={16} />
            {loadingEmail ? "Sending…" : "Send via Email Instead"}
          </button>
        </div>
      )}

      {job.sent_at && (
        <p className="text-xs text-center text-[#737688]">
          Last sent {new Date(job.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      )}

      <button
        onClick={handleSwitch}
        disabled={loadingSwitch}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#e5e2e1] text-[#434656] font-semibold text-sm hover:border-[#003ec7] hover:text-[#003ec7] transition-colors disabled:opacity-60"
      >
        <RefreshCw size={16} />
        {loadingSwitch
          ? "Switching…"
          : job.payment_type === "onsite"
            ? "Switch to Email Payment"
            : "Switch to On-Site Payment"}
      </button>

      {job.status === "draft" && (
        <form
          action={cancelJob.bind(null, job.id)}
          onSubmit={(e) => {
            if (!window.confirm("Cancel this job? This cannot be undone.")) e.preventDefault()
          }}
        >
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#e5e2e1] text-[#ba1a1a] font-semibold text-sm"
          >
            <XCircle size={16} /> Cancel Job
          </button>
        </form>
      )}
    </div>
  )
}
