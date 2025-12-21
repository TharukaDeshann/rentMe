"use client"

import { X, MessageSquare, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { dummyChats } from "@/lib/dummy-data"

interface ChatsListProps {
  currentUserId: string
  onSelectChat: (chatId: string) => void
  onClose: () => void
}

export function ChatsList({ currentUserId, onSelectChat, onClose }: ChatsListProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <CardContent className="p-4 space-y-2">
            {dummyChats.length > 0 ? (
              dummyChats.map((chat) => {
                const otherUser =
                  chat.participant_one.id === currentUserId ? chat.participant_two : chat.participant_one
                return (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-muted"
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={otherUser.profile_picture || "/placeholder.svg"}
                          onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                        />
                        <AvatarFallback>{otherUser.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-sm truncate">{otherUser.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{chat.vehicle.daily_price}/day</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}
