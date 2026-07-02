import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { LogOut } from "lucide-react"
import { TechNav } from "@/components/TechNav"

export default async function TechLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single()

  const name = profile?.full_name || user?.email || "Tech"

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f8]">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-[#e5e2e1]">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/jobs" className="text-base font-bold text-[#003ec7]">
            Royal Repair
          </Link>
          <span className="text-sm text-[#434656] font-medium truncate max-w-[140px]">{name}</span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#e5e2e1]">
        <div className="flex items-stretch h-16">
          <TechNav />
          <form action={logout} className="flex-1">
            <button
              type="submit"
              className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#737688] text-[12px] font-semibold tracking-wide hover:text-[#003ec7] transition-colors"
            >
              <LogOut size={24} />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}
