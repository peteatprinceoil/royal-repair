"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import * as z from "zod"

const CustomerSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }).trim(),
  phone: z.string().min(7, { error: "Enter a valid phone number." }).trim(),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  service_address: z.string().min(5, { error: "Enter a full service address." }).trim(),
})

export type CustomerState =
  | { errors?: { name?: string[]; phone?: string[]; email?: string[]; service_address?: string[] }; message?: string }
  | undefined

export async function createCustomer(state: CustomerState, formData: FormData): Promise<CustomerState> {
  const result = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    service_address: formData.get("service_address"),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as NonNullable<CustomerState>["errors"] }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data, error } = await supabase
    .from("customers")
    .insert({ ...result.data, created_by: user.id })
    .select("id")
    .single()

  if (error) {
    return { message: "Failed to create customer. Please try again." }
  }

  revalidatePath("/customers")
  redirect(`/customers/${data.id}`)
}

export async function updateCustomer(
  id: string,
  state: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const result = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    service_address: formData.get("service_address"),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as NonNullable<CustomerState>["errors"] }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .update(result.data)
    .eq("id", id)

  if (error) {
    return { message: "Failed to update customer." }
  }

  revalidatePath(`/customers/${id}`)
  revalidatePath("/customers")
  redirect(`/customers/${id}`)
}
