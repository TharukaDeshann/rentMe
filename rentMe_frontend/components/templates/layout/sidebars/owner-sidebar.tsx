"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, FileCheck, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const LINKS = [
  { href: "/owner",              label: "Dashboard",        icon: LayoutDashboard },
  { href: "/owner/vehicles",     label: "My Vehicles",      icon: Car },
  { href: "/owner/bookings",     label: "Booking Requests", icon: FileCheck },
  { href: "/owner/chat",         label: "Messages",         icon: MessageSquare },
  { href: "/owner/verification", label: "Verification",     icon: CheckCircle },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();

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
            <span className="flex-1">{label}</span>
            {label === "Messages" && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}