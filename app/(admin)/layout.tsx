import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { LogOut } from "lucide-react"
import { AdminSideNav, AdminBottomNav } from "@/components/AdminNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/jobs")

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f8]">
      <header className="sticky top-0 z-40 bg-white border-b-2 border-[#e5e2e1]">
        <div className="flex items-center justify-between px-5 h-14 max-w-5xl mx-auto w-full">
          <Link href="/admin" className="text-base font-bold text-[#003ec7]">
            Royal Repair — Admin
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-[#737688] font-semibold flex items-center gap-1">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        <AdminSideNav />
        <main className="flex-1 px-5 pt-6 pb-10">{children}</main>
      </div>
      <AdminBottomNav />
      <div className="md:hidden h-16" />
    </div>
  )
}
