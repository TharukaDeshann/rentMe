"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Car, FileCheck, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function OwnerSidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: "/owner",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/owner/vehicles",
      label: "My Vehicles",
      icon: Car,
    },
    {
      href: "/owner/bookings",
      label: "Booking Requests",
      icon: FileCheck,
    },
    {
      href: "/owner/verification",
      label: "Verification Status",
      icon: CheckCircle,
    },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:block">
      <nav className="space-y-2 p-4">
        <div className="px-2 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
        </div>

        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
