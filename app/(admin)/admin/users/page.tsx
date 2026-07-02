import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { UserPlus } from "lucide-react"

const roleColors: Record<string, string> = {
  admin: "bg-[#eff3ff] text-[#003ec7]",
  tech: "bg-[#f0fdf4] text-[#006e2a]",
}

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })

  const users = profiles ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">Team</h1>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#003ec7] text-white font-semibold text-sm"
        >
          <UserPlus size={16} /> Add User
        </Link>
      </div>

      <div className="space-y-3">
        {users.length === 0 && (
          <div className="text-center py-16 text-[#737688]">
            <p className="text-lg font-semibold">No team members yet</p>
            <p className="text-sm mt-1">Add your first user above</p>
          </div>
        )}
        {users.map((u) => (
          <div key={u.id} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1c1b1b]">{u.full_name || "(no name)"}</p>
              <p className="text-xs text-[#737688] mt-0.5">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${roleColors[u.role] ?? "bg-[#f0eded] text-[#434656]"}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
