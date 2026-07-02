"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import * as z from "zod"

const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
})

export type LoginState = { error?: string } | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const result = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    return { error: "Invalid email or password." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  const role = profile?.role ?? "tech"
  revalidatePath("/", "layout")
  redirect(role === "admin" ? "/admin" : "/jobs")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
