"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Grid3x3, ShoppingCart, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function RenterSidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: "/renter",
      label: "Browse Vehicles",
      icon: Grid3x3,
    },
    {
      href: "/renter/bookings",
      label: "My Bookings",
      icon: ShoppingCart,
    },
    {
      href: "/renter/chat",
      label: "Chat",
      icon: MessageSquare,
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
