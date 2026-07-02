import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature")

  if (!sig) return new Response("Missing signature", { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const jobId = session.metadata?.job_id
    if (!jobId) return new Response("No job_id in metadata", { status: 400 })

    const supabase = createAdminClient()
    await supabase
      .from("jobs")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", jobId)
  }

  return new Response("ok", { status: 200 })
}
