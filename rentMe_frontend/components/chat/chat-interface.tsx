"use client"

import { useState } from "react"
import { X, Send, Car, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dummyChats, dummyVehicles } from "@/lib/dummy-data"

interface ChatInterfaceProps {
  vehicleId: string
  onClose: () => void
  currentUserId: string
}

export function ChatInterface({ vehicleId, onClose, currentUserId }: ChatInterfaceProps) {
  const vehicle = dummyVehicles.find((v) => v.id === vehicleId)
  const chat = dummyChats[0]
  const [messages, setMessages] = useState(chat.messages)
  const [newMessage, setNewMessage] = useState("")

  if (!vehicle || !chat) return null

  const otherUser = chat.participant_one.id === currentUserId ? chat.participant_two : chat.participant_one

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: `msg-${messages.length + 1}`,
          sender_id: currentUserId,
          content: newMessage,
          timestamp: new Date(),
        },
      ])
      setNewMessage("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex h-[90vh] w-full max-w-2xl flex-col">
        {/* Header */}
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={otherUser.profile_picture || "/placeholder.svg"}
                    onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  />
                  <AvatarFallback>{otherUser.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{otherUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Regarding: {vehicle.make} {vehicle.model}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        {/* Vehicle Context Banner */}
        <div className="border-b border-border bg-muted/50 p-3">
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {vehicle.make} {vehicle.model}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {vehicle.location.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">${vehicle.daily_price}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
