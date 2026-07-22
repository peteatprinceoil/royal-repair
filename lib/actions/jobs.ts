"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { Resend } from "resend"
import twilio from "twilio"
import type { LineItem, PaymentType } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

export async function createJob(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const customerId = formData.get("customer_id") as string
  const title = (formData.get("title") as string).trim()
  const paymentType = formData.get("payment_type") as PaymentType
  const lineItemsRaw = formData.get("line_items") as string
  const lineItems: LineItem[] = JSON.parse(lineItemsRaw)

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  let discountPct = 0
  if (paymentType === "onsite") {
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "onsite_discount_pct")
      .single()
    discountPct = parseFloat(setting?.value ?? "0")
  }

  const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100
  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: customerId,
      created_by: user.id,
      title,
      line_items: lineItems,
      subtotal,
      discount_pct: discountPct,
      discount_amount: discountAmount,
      total,
      payment_type: paymentType,
      status: "draft",
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/jobs")
  redirect(`/jobs/${data.id}`)
}

export async function generateCheckoutSession(jobId: string): Promise<{ url: string | null; error?: string }> {
  "use server"
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(name, email)")
    .eq("id", jobId)
    .single()

  if (!job) return { url: null, error: "Job not found" }
  if (job.status === "paid") return { url: null, error: "Already paid" }

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
    success_url: `${appUrl}/jobs/${jobId}?payment=success`,
    cancel_url: `${appUrl}/jobs/${jobId}`,
    metadata: { job_id: jobId, payment_type: job.payment_type },
  }

  // Apply discount coupon for onsite payments
  if (job.payment_type === "onsite" && job.discount_pct > 0) {
    const { data: couponSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stripe_onsite_coupon_id")
      .single()

    if (couponSetting?.value) {
      sessionParams.discounts = [{ coupon: couponSetting.value }]
    }
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  await supabase
    .from("jobs")
    .update({
      stripe_checkout_session_id: session.id,
      status: job.status === "draft" ? "pending" : job.status,
    })
    .eq("id", jobId)

  revalidatePath(`/jobs/${jobId}`)
  return { url: session.url }
}

export async function sendPaymentEmail(jobId: string): Promise<{ success: boolean; error?: string }> {
  "use server"
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(name, email)")
    .eq("id", jobId)
    .single()

  if (!job) return { success: false, error: "Job not found" }

  const sessionResult = await generateCheckoutSession(jobId)
  if (!sessionResult.url) return { success: false, error: sessionResult.error }

  const customer = job.customers as { name: string; email: string }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const payUrl = `${appUrl}/pay/${job.payment_token}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: customer.email,
    subject: `Your invoice from Royal Repair — $${job.total.toFixed(2)}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #003ec7; margin-bottom: 8px;">Invoice from Royal Repair</h2>
        <p style="color: #1c1b1b; font-size: 16px;">Hi ${customer.name},</p>
        <p style="color: #434656; font-size: 16px;">
          Your service has been completed. Please click below to pay your invoice.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr style="border-bottom: 1px solid #e5e2e1;">
            <td style="padding: 8px 0; color: #434656;">Job</td>
            <td style="padding: 8px 0; text-align: right; color: #1c1b1b; font-weight: 600;">${job.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1c1b1b; font-weight: 700; font-size: 18px;">Total Due</td>
            <td style="padding: 8px 0; text-align: right; color: #003ec7; font-weight: 700; font-size: 18px;">$${job.total.toFixed(2)}</td>
          </tr>
        </table>
        <a href="${payUrl}" style="display: block; background: #003ec7; color: #fff; text-align: center; padding: 16px 24px; border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none;">
          Pay Now — $${job.total.toFixed(2)}
        </a>
        <p style="color: #737688; font-size: 12px; margin-top: 24px; text-align: center;">
          Royal Repair · techteam@princeoil.com
        </p>
      </div>
    `,
  })

  await supabase
    .from("jobs")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", jobId)

  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}

export async function sendPaymentText(jobId: string): Promise<{ success: boolean; error?: string }> {
  "use server"
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(name, phone)")
    .eq("id", jobId)
    .single()

  if (!job) return { success: false, error: "Job not found" }

  const customer = job.customers as { name: string; phone: string }
  if (!customer.phone) return { success: false, error: "Customer has no phone number on file" }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const payUrl = `${appUrl}/pay/${job.payment_token}`
  const firstName = customer.name.split(" ")[0]

  const client = twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  })
  await client.messages.create({
    body: `Hi ${firstName}, your Royal Repair invoice is ready — $${job.total.toFixed(2)}. Pay here: ${payUrl}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toE164(customer.phone),
  })

  await supabase
    .from("jobs")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", jobId)

  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}

export async function switchPaymentType(jobId: string, newType: PaymentType) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: job } = await supabase
    .from("jobs")
    .select("subtotal, status")
    .eq("id", jobId)
    .single()

  if (!job) throw new Error("Job not found")

  let discountPct = 0
  let discountAmount = 0
  let total = job.subtotal

  if (newType === "onsite") {
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "onsite_discount_pct")
      .single()
    discountPct = parseFloat(setting?.value ?? "0")
    discountAmount = Math.round(job.subtotal * (discountPct / 100) * 100) / 100
    total = Math.round((job.subtotal - discountAmount) * 100) / 100
  }

  await supabase
    .from("jobs")
    .update({
      payment_type: newType,
      discount_pct: discountPct,
      discount_amount: discountAmount,
      total,
      stripe_checkout_session_id: null,
    })
    .eq("id", jobId)

  revalidatePath(`/jobs/${jobId}`)
}

export async function cancelJob(jobId: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("jobs").update({ status: "cancelled" }).eq("id", jobId)
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath("/jobs")
  redirect("/jobs")
}

export async function createJobAsAdmin(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")

  const customerId = formData.get("customer_id") as string
  const title = (formData.get("title") as string).trim()
  const paymentType = formData.get("payment_type") as PaymentType
  const lineItemsRaw = formData.get("line_items") as string
  const lineItems: LineItem[] = JSON.parse(lineItemsRaw)
  const assignedToRaw = formData.get("assigned_to") as string
  const assignedTo = assignedToRaw?.trim() || null

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  let discountPct = 0
  if (paymentType === "onsite") {
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "onsite_discount_pct")
      .single()
    discountPct = parseFloat(setting?.value ?? "0")
  }

  const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100
  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const { error } = await supabase.from("jobs").insert({
    customer_id: customerId,
    created_by: user.id,
    assigned_to: assignedTo,
    title,
    line_items: lineItems,
    subtotal,
    discount_pct: discountPct,
    discount_amount: discountAmount,
    total,
    payment_type: paymentType,
    status: "draft",
  })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/jobs")
  redirect("/admin/jobs")
}
