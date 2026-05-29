"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3x3, ShoppingCart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/renter",          label: "Browse Vehicles", icon: Grid3x3 },
  { href: "/renter/bookings", label: "My Bookings",     icon: ShoppingCart },
  { href: "/renter/chat",     label: "Messages",        icon: MessageSquare },
];

export function RenterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3">
          Navigation
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn("nav-link", pathname === href && "active")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}