"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Part } from "@/lib/types"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")
  return supabase
}

export async function createPart(formData: FormData) {
  const supabase = await requireAdmin()

  const sku = (formData.get("sku") as string).trim().toUpperCase()
  const name = (formData.get("name") as string).trim()
  const unit_price = parseFloat(formData.get("unit_price") as string)

  if (!sku || !name || isNaN(unit_price)) throw new Error("Invalid input")

  const { error } = await supabase.from("parts").insert({ sku, name, unit_price })
  if (error) throw new Error(error.message)

  revalidatePath("/admin/parts")
  redirect("/admin/parts")
}

export async function updatePart(id: string, formData: FormData) {
  const supabase = await requireAdmin()

  const sku = (formData.get("sku") as string).trim().toUpperCase()
  const name = (formData.get("name") as string).trim()
  const unit_price = parseFloat(formData.get("unit_price") as string)

  if (!sku || !name || isNaN(unit_price)) throw new Error("Invalid input")

  const { error } = await supabase.from("parts").update({ sku, name, unit_price }).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin/parts")
  redirect("/admin/parts")
}

export async function deletePart(id: string) {
  const supabase = await requireAdmin()
  await supabase.from("parts").delete().eq("id", id)
  revalidatePath("/admin/parts")
}

export async function getPartBySku(sku: string): Promise<Part | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("parts")
    .select("*")
    .eq("sku", sku.trim().toUpperCase())
    .single()
  return data ?? null
}
