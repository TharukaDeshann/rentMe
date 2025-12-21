"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatbotDialog } from "./chatbot-dialog"

interface ChatbotFloatingIconProps {
  userId: string
  userRole: "renter" | "owner" | "admin"
  userName: string
}

export function ChatbotFloatingIcon({ userId, userRole, userName }: ChatbotFloatingIconProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <ChatbotDialog userId={userId} userRole={userRole} userName={userName} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
