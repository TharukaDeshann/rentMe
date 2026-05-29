"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, FileCheck, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/owner",              label: "Dashboard",        icon: LayoutDashboard },
  { href: "/owner/vehicles",     label: "My Vehicles",      icon: Car },
  { href: "/owner/bookings",     label: "Booking Requests", icon: FileCheck },
  { href: "/owner/verification", label: "Verification",     icon: CheckCircle },
];

export function OwnerSidebar() {
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