import { redirect, notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import type { LineItem } from "@/lib/types"

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { token } = await params
  const { success } = await searchParams
  const supabase = createAdminClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(email, name)")
    .eq("payment_token", token)
    .single()

  if (!job) notFound()

  if (success === "1" || job.status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8] px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border-2 border-[#bbf7d0] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006e2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-[#006e2a]">Payment Received</p>
          <p className="text-[#434656] mt-2">Thank you! Your payment has been processed successfully.</p>
          {job.total && (
            <p className="text-3xl font-bold text-[#1c1b1b] mt-4">${job.total.toFixed(2)}</p>
          )}
        </div>
      </div>
    )
  }

  // Reuse existing session or create a new one
  let checkoutUrl: string | null = null
  if (job.stripe_checkout_session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(job.stripe_checkout_session_id)
      checkoutUrl = session.url
    } catch {
      // Session expired or invalid — fall through to create a new one
    }
  }

  if (!checkoutUrl) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const lineItems = (job.line_items as LineItem[]).map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.description },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }))

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: (job.customers as { email: string })?.email,
      success_url: `${appUrl}/pay/${token}?success=1`,
      cancel_url: `${appUrl}/pay/${token}`,
      metadata: { job_id: job.id, payment_type: job.payment_type },
    }

    if (job.payment_type === "onsite" && job.discount_pct > 0) {
      const { data: coupon } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "stripe_onsite_coupon_id")
        .single()
      if (coupon?.value) sessionParams.discounts = [{ coupon: coupon.value }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    checkoutUrl = session.url

    await supabase
      .from("jobs")
      .update({ stripe_checkout_session_id: session.id, status: "pending" })
      .eq("id", job.id)
  }

  if (checkoutUrl) redirect(checkoutUrl)
  return notFound()
}
