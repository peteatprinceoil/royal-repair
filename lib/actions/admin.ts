"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")

  const discountPct = parseFloat(formData.get("onsite_discount_pct") as string)
  if (isNaN(discountPct) || discountPct < 0 || discountPct > 100) {
    throw new Error("Invalid discount percentage")
  }

  // Update DB setting
  await supabase
    .from("settings")
    .upsert({ key: "onsite_discount_pct", value: discountPct.toString() })

  // Recreate Stripe coupon for new percentage
  if (discountPct > 0) {
    const coupon = await stripe.coupons.create({
      percent_off: discountPct,
      duration: "once",
      name: `Royal Repair On-Site ${discountPct}%`,
    })
    await supabase
      .from("settings")
      .upsert({ key: "stripe_onsite_coupon_id", value: coupon.id })
  } else {
    await supabase
      .from("settings")
      .upsert({ key: "stripe_onsite_coupon_id", value: "" })
  }

  revalidatePath("/admin/settings")
  revalidatePath("/jobs/new")
}

export async function createUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")

  const email = (formData.get("email") as string).trim()
  const password = formData.get("password") as string
  const full_name = (formData.get("full_name") as string).trim()
  const role = formData.get("role") as string

  if (!email || !password || !full_name || !["admin", "tech"].includes(role)) {
    throw new Error("Invalid input")
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/users")
  redirect("/admin/users")
}
