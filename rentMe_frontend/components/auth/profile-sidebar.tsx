"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserCircle, LogOut, X, Settings, Shield } from "lucide-react"
import { useUserProfile } from "@/contexts"
import { useAuth } from "@/contexts"

interface ProfileSidebarProps {
  onManageProfile: () => void
  onClose: () => void
}

export function ProfileSidebar({
  onManageProfile,
  onClose,
}: ProfileSidebarProps) {
  const { profile } = useUserProfile()
  const { logout } = useAuth()

  // Default values if profile is not loaded yet
  const userName = profile?.fullName || "User"
  const userEmail = profile?.email || ""
  const userImage = profile?.profilePicture || undefined
  const userRole = profile?.role || "RENTER"

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <>
      {/* Overlay with smooth fade */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Sidebar with slide-in animation */}
      <div className="fixed right-0 top-0 z-50 h-screen w-80 bg-card shadow-2xl transform transition-all duration-300 ease-out flex flex-col overflow-hidden">
        {/* Gradient Header Background */}
        <div className="relative h-32 bg-gradient-to-r from-primary/90 to-primary/70 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -left-16 -bottom-8 h-24 w-24 rounded-full bg-secondary/10 blur-2xl" />

          {/* Close Button */}
          <div className="relative z-10 flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-primary-foreground">Account</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Info Card - Overlapping Header */}
        <div className="relative -mt-12 mx-4 z-10">
          <div className="flex items-center gap-4 rounded-xl bg-card border border-border shadow-md p-4 backdrop-blur-sm">
            <Avatar className="h-16 w-16 border-4 border-primary/20 ring-2 ring-primary/10">
              <AvatarImage src={userImage || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-base truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate mb-2">{userEmail}</p>
              <div className="inline-block px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/30">
                <p className="text-xs font-semibold text-secondary">
                  {userRole === 'RENTER' ? 'Renter' : userRole === 'VEHICLE_OWNER' ? 'Vehicle Owner' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-6 px-4">
          {/* Menu Section */}
          <div className="space-y-2">
            {/* Manage Profile Button */}
            <button
              onClick={() => {
                onManageProfile()
                onClose()
              }}
              className="group w-full flex items-center gap-4 rounded-lg px-4 py-3 text-foreground hover:bg-primary/5 transition-all duration-200 text-left font-medium border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Manage Profile</p>
                <p className="text-xs text-muted-foreground">Edit your information</p>
              </div>
            </button>

            {/* Security Settings (Placeholder) */}
            <button
              onClick={onClose}
              className="group w-full flex items-center gap-4 rounded-lg px-4 py-3 text-foreground hover:bg-secondary/5 transition-all duration-200 text-left font-medium border border-transparent hover:border-secondary/20"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-200">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Security</p>
                <p className="text-xs text-muted-foreground">Change password</p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-border" />

          {/* Additional Info */}
          <div className="space-y-3 mb-6">
            <div className="rounded-lg bg-muted/40 p-3 border border-border">
              <p className="text-xs font-semibold text-foreground mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-xs text-muted-foreground">Active & Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Log Out Button */}
        <div className="border-t border-border p-4 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 font-semibold text-sm border border-destructive/20 hover:border-destructive/40"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>

          {/* Copyright */}
          <div className="text-center space-y-1 pt-2">
            <p className="text-xs text-muted-foreground">© 2025 rentMe</p>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
