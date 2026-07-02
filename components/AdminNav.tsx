"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Briefcase, Users, Download, Settings, Package, UserPlus } from "lucide-react"

const navItems = [
  { href: "/admin", icon: BarChart3, label: "Dashboard", mobileLabel: "Dash", exact: true },
  { href: "/admin/jobs", icon: Briefcase, label: "All Jobs", mobileLabel: "Jobs" },
  { href: "/admin/customers", icon: Users, label: "Customers", mobileLabel: "Customers" },
  { href: "/admin/parts", icon: Package, label: "Parts", mobileLabel: "Parts" },
  { href: "/admin/users", icon: UserPlus, label: "Team", mobileLabel: "Team" },
  { href: "/admin/export", icon: Download, label: "Export", mobileLabel: "Export" },
  { href: "/admin/settings", icon: Settings, label: "Settings", mobileLabel: "Settings" },
]

export function AdminSideNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex flex-col w-48 border-r-2 border-[#e5e2e1] pt-6 px-4 gap-1 bg-white">
      {navItems.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              active
                ? "bg-[#eff3ff] text-[#003ec7]"
                : "text-[#434656] hover:bg-[#f0eded] hover:text-[#003ec7]"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#e5e2e1] flex">
      {navItems.map(({ href, icon: Icon, mobileLabel, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold h-16 transition-colors ${
              active ? "text-[#003ec7]" : "text-[#737688] hover:text-[#003ec7]"
            }`}
          >
            <Icon size={22} />
            {mobileLabel}
          </Link>
        )
      })}
    </nav>
  )
}
