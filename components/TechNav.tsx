"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Users, Package } from "lucide-react"

export function TechNav() {
  const pathname = usePathname()

  return (
    <>
      <NavItem href="/jobs" icon={<Briefcase size={24} />} label="Jobs" active={pathname.startsWith("/jobs")} />
      <NavItem href="/customers" icon={<Users size={24} />} label="Customers" active={pathname.startsWith("/customers")} />
      <NavItem href="/parts" icon={<Package size={24} />} label="Parts" active={pathname.startsWith("/parts")} />
    </>
  )
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center justify-center gap-1 text-[12px] font-semibold tracking-wide transition-colors ${
        active ? "text-[#003ec7]" : "text-[#737688] hover:text-[#003ec7]"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
