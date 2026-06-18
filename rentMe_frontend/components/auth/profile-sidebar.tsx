"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle, LogOut, X, Settings } from "lucide-react";
import { useUserProfile } from "@/contexts";
import { useAuth } from "@/contexts";

interface ProfileSidebarProps {
  onManageProfile: () => void;
  onClose: () => void;
}

export function ProfileSidebar({ onManageProfile, onClose }: ProfileSidebarProps) {
  const { profile } = useUserProfile();
  const { logout } = useAuth();

  const userName  = profile?.fullName || "User";
  const userEmail = profile?.email || "";
  const userImage = profile?.profilePicture || undefined;
  const userRole  = profile?.role || "RENTER";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const roleLabel: Record<string, string> = {
    RENTER:        "Renter",
    VEHICLE_OWNER: "Vehicle Owner",
    ADMIN:         "Administrator",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-72 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <span className="font-semibold text-foreground">My Account</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User card */}
        <div className="flex items-center gap-4 px-5 py-5 border-b border-border">
          <Avatar className="h-14 w-14 ring-2 ring-primary/20">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{userEmail}</p>
            <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {roleLabel[userRole] ?? userRole}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <button
            onClick={onManageProfile}
            className="nav-link w-full text-left"
          >
            <UserCircle className="h-4 w-4 shrink-0" />
            Manage Profile
          </button>
          <button className="nav-link w-full text-left">
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </button>
        </nav>

        {/* Logout */}
        <div className="border-t border-border px-3 py-4 shrink-0">
          <button
            onClick={handleLogout}
            className="nav-link w-full text-left hover:!text-destructive hover:!bg-destructive/8"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}