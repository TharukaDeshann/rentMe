"use client"

import React from "react"
import { AppNavbar } from "./app-navbar"
import { AppFooter } from "./app-footer"
import { ChatbotFloatingIcon } from "@/components/chatbot/chatbot-floating-icon"

type UserRole = "renter" | "owner" | "admin"

interface AppLayoutProps {
  children: React.ReactNode
  currentRole: UserRole
  userName: string
  userEmail: string
  userImage?: string
  userId: string
  onMessagesClick: () => void
  onProfileClick: () => void
}

export function AppLayout({
  children,
  currentRole,
  userName,
  userEmail,
  userImage,
  userId,
  onMessagesClick,
  onProfileClick,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <AppNavbar
        currentRole={currentRole}
        userName={userName}
        userImage={userImage}
        onMessagesClick={onMessagesClick}
        onProfileClick={onProfileClick}
      />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <AppFooter />

      {/* Chatbot Floating Icon */}
      <ChatbotFloatingIcon userId={userId} userRole={currentRole} userName={userName} />
    </div>
  )
}
