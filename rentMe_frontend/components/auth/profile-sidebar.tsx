"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserCircle, LogOut, X } from "lucide-react"

interface ProfileSidebarProps {
  userName: string
  userEmail: string
  userImage?: string
  onManageProfile: () => void
  onLogout: () => void
  onClose: () => void
}

export function ProfileSidebar({
  userName,
  userEmail,
  userImage,
  onManageProfile,
  onLogout,
  onClose,
}: ProfileSidebarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 h-screen w-80 bg-card border-l border-border shadow-lg transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info Section */}
        <div className="flex-1 space-y-6 p-6">
          {/* User Profile Card */}
          <div className="flex items-center gap-4 rounded-lg bg-primary/5 p-4 border border-primary/10">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={userImage || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{userName}</p>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
              <p className="mt-1 text-xs font-medium text-primary">Renter</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Menu Items */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onManageProfile()
                onClose()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-muted transition-colors duration-200 text-left font-medium"
            >
              <UserCircle className="h-5 w-5 text-primary" />
              Manage Profile
            </button>

            <button
              onClick={() => {
                onLogout()
                onClose()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-destructive hover:bg-destructive/5 transition-colors duration-200 text-left font-medium"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-border p-4 space-y-2 text-xs text-muted-foreground">
          <p>© 2025 rentMe</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </>
  )
}
