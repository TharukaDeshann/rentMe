"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Car, MessageSquare, ChevronDown, Home, Map, Calendar, BarChart3, Users, Shield } from "lucide-react"
import { useState } from "react"

type UserRole = "renter" | "owner" | "admin"

interface AppNavbarProps {
  currentRole: UserRole
  userName: string
  userImage?: string
  onMessagesClick: () => void
  onProfileClick: () => void
}

export function AppNavbar({
  currentRole,
  userName,
  userImage,
  onMessagesClick,
  onProfileClick,
}: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  const getNavLinks = () => {
    switch (currentRole) {
      case "renter":
        return [
          { label: "Dashboard", icon: Home, href: "#" },
          { label: "Browse Vehicles", icon: Map, href: "#" },
          { label: "My Bookings", icon: Calendar, href: "#" },
        ]
      case "owner":
        return [
          { label: "Dashboard", icon: Home, href: "#" },
          { label: "My Vehicles", icon: Car, href: "#" },
          { label: "Bookings", icon: Calendar, href: "#" },
        ]
      case "admin":
        return [
          { label: "Dashboard", icon: Home, href: "#" },
          { label: "Users", icon: Users, href: "#" },
          { label: "Verification", icon: Shield, href: "#" },
          { label: "Analytics", icon: BarChart3, href: "#" },
        ]
      default:
        return []
    }
  }

  const navLinks = getNavLinks()

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-lg bg-primary p-2">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-lg font-bold text-foreground">rentMe</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <link.icon className="h-4 w-4" />
                <span className="text-sm">{link.label}</span>
              </Button>
            ))}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Messages Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMessagesClick}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              title="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage || "/placeholder.svg"} alt={userName} />
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              >
                <link.icon className="h-4 w-4" />
                <span className="text-sm">{link.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
