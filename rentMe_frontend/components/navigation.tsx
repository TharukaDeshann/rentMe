"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Car, ChevronDown, MessageSquare, User } from "lucide-react"

type UserRole = "renter" | "owner" | "admin"

interface NavigationProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  onMessagesClick: () => void
  onProfileClick: () => void
  userName?: string
  userImage?: string
}

export function Navigation({
  currentRole,
  onRoleChange,
  onMessagesClick,
  onProfileClick,
  userName = "User",
  userImage,
}: NavigationProps) {
  const roleLabels = {
    renter: "Renter",
    owner: "Owner",
    admin: "Admin",
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMessagesClick}
              className="text-muted-foreground hover:text-foreground"
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
                <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
