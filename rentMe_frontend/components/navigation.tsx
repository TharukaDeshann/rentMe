"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Car, ChevronDown, MessageSquare } from "lucide-react"

type UserRole = "renter" | "owner" | "admin"

interface NavigationProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  onMessagesClick: () => void
}

export function Navigation({ currentRole, onRoleChange, onMessagesClick }: NavigationProps) {
  const roleLabels = {
    renter: "Renter",
    owner: "Owner",
    admin: "Admin",
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">rentMe</span>
          </div>

          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                {roleLabels[currentRole]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRoleChange("renter")}>View as Renter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("owner")}>View as Owner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("admin")}>View as Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onMessagesClick}>
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
