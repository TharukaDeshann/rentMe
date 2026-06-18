"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Car,
  MessageSquare,
  ChevronDown,
  Home,
  Map,
  Calendar,
  BarChart3,
  Users,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "renter" | "owner" | "admin";

interface AppNavbarProps {
  currentRole: UserRole;
  userName: string;
  userImage?: string;
  onMessagesClick: () => void;
  onProfileClick: () => void;
}

const NAV_BY_ROLE: Record<UserRole, { label: string; icon: React.ElementType }[]> = {
  renter: [
    { label: "Dashboard",       icon: Home },
    { label: "Browse Vehicles", icon: Map },
    { label: "My Bookings",     icon: Calendar },
  ],
  owner: [
    { label: "Dashboard",  icon: Home },
    { label: "My Vehicles",icon: Car },
    { label: "Bookings",   icon: Calendar },
  ],
  admin: [
    { label: "Dashboard",    icon: Home },
    { label: "Users",        icon: Users },
    { label: "Verification", icon: Shield },
    { label: "Analytics",    icon: BarChart3 },
  ],
};

export function AppNavbar({
  currentRole,
  userName,
  userImage,
  onMessagesClick,
  onProfileClick,
}: AppNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navLinks = NAV_BY_ROLE[currentRole] ?? [];

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-[17px] font-bold tracking-tight text-foreground">
              rentMe
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 ml-2">
            {navLinks.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="topnav-link"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMessagesClick}
              className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
              title="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted h-9 px-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-[11px] font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {navLinks.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="topnav-link w-full justify-start"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}