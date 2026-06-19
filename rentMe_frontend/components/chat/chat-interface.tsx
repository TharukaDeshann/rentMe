"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionById, getMessages, markAsRead, deleteMessage } from "@/services/chat.service";
import { ChatMessageResponseDTO, ChatSessionResponseDTO } from "@/types/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatMessageInput } from "./chat-message-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Car, Info, Wifi, WifiOff, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";
import { UserProfileViewModal } from "@/components/modals/UserProfileViewModal";

interface ChatInterfaceProps {
  sessionId: number;
  onClose?: () => void;
  readOnly?: boolean;
}

export function ChatInterface({ sessionId, onClose, readOnly = false }: ChatInterfaceProps) {
  const { user } = useAuth();
  const currentUserId = user?.userId ? Number(user.userId) : 0;

  const [session, setSession] = useState<ChatSessionResponseDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponseDTO[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket Hook
  const { isConnected, lastMessage, sendMessage } = useWebSocket(sessionId);

  // 1. Fetch Session Details
  const fetchSessionDetails = useCallback(async () => {
    try {
      setLoadingSession(true);
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (err) {
      console.error("Failed to load session details:", err);
    } finally {
      setLoadingSession(false);
    }
  }, [sessionId]);

  // 2. Fetch Messages (paginated)
  const fetchMessages = useCallback(async (pageToLoad: number, append = false) => {
    try {
      setLoadingMessages(true);
      const data = await getMessages(sessionId, pageToLoad, 30);
      
      const newMessages = data.data || [];
      
      setMessages((prev) => {
        if (append) {
          // Prepends older history at the top
          // Filter duplicates just in case
          const existingIds = new Set(prev.map((m) => m.messageId));
          const filtered = newMessages.filter((m) => !existingIds.has(m.messageId));
          return [...filtered, ...prev];
        } else {
          return newMessages;
        }
      });

      setHasMore(!data.meta.last);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [sessionId]);

  // 3. Mark read
  const handleMarkAsRead = useCallback(async () => {
    if (readOnly) return;
    try {
      await markAsRead(sessionId);
    } catch (err) {
      console.error("Failed to mark session as read:", err);
    }
  }, [sessionId, readOnly]);

  // Trigger initial loads
  useEffect(() => {
    fetchSessionDetails();
    setPage(0);
    fetchMessages(0, false);
    handleMarkAsRead();
  }, [sessionId, fetchSessionDetails, fetchMessages, handleMarkAsRead]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    if (lastMessage && lastMessage.sessionId === sessionId) {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.messageId === lastMessage.messageId)) {
          return prev;
        }
        return [...prev, lastMessage];
      });
      
      // Auto mark read if we are viewing the chat
      if (lastMessage.senderUserId !== currentUserId) {
        handleMarkAsRead();
      }

      // Smooth scroll to bottom for new messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [lastMessage, sessionId, currentUserId, handleMarkAsRead]);

  // Auto-scroll to bottom on first load
  useEffect(() => {
    if (!loadingSession && !loadingMessages && page === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loadingSession, loadingMessages, page]);

  const loadEarlierMessages = () => {
    if (loadingMessages || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, true);
  };

  const handleSendMessage = async (req: any) => {
    if (readOnly) return;
    await sendMessage(req);
    // Smooth scroll down immediately on sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
      // Soft delete local state
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, isDeleted: true } : m
        )
      );
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card p-6 text-center">
        <Info className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-semibold">Conversation not found</p>
        <p className="text-xs text-muted-foreground mt-1">
          This chat session does not exist or you do not have permission to view it.
        </p>
      </div>
    );
  }

  const otherName = session.otherUserFullName || "User";

  return (
    <Card className="flex flex-col h-full border-none rounded-none bg-card shadow-none">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
          )}

          <Avatar
            className="h-10 w-10 border shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all duration-200"
            onClick={() => setProfileModalOpen(true)}
            title={`View ${otherName}'s profile`}
          >
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(otherName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0">
            <button
              className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors text-left"
              onClick={() => setProfileModalOpen(true)}
              title={`View ${otherName}'s profile`}
            >
              {otherName}
            </button>
            {/* Connection Indicator */}
            <div className="flex items-center gap-1 mt-0.5">
              {isConnected ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <Wifi className="h-3 w-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium animate-pulse">
                  <WifiOff className="h-3 w-3" />
                  Connecting...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close Button on Desktop */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 rounded-full hover:bg-muted"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Vehicle Context Banner */}
      {session.activeVehicleId && (
        <div className="border-b border-border bg-muted/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
              <Car className="h-4 w-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                Discussing: {session.vehicleMake} {session.vehicleModel}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Vehicle Card Context
              </p>
            </div>
          </div>
          
          <Link
            href={`/renter?vehicleId=${session.activeVehicleId}`}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            View Vehicle Profile
          </Link>
        </div>
      )}

      {/* Message Feed Scroll Area */}
      <ScrollArea ref={scrollRef} className="flex-1 bg-muted/5">
        <div className="flex flex-col p-2 space-y-1">
          {/* History Load More Button */}
          {hasMore && (
            <div className="flex justify-center py-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadEarlierMessages}
                disabled={loadingMessages}
                className="text-xs text-primary hover:bg-primary/5 rounded-full"
              >
                {loadingMessages ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                ) : null}
                Load earlier messages
              </Button>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessageBubble
              key={message.messageId}
              message={message}
              currentUserId={currentUserId}
              onDelete={handleDeleteMessage}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      {!readOnly && (
        <ChatMessageInput onSend={handleSendMessage} disabled={loadingSession} />
      )}

      {/* Other user's profile modal */}
      {session && (
        <UserProfileViewModal
          userId={session.otherUserId}
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </Card>
  );
}
export default ChatInterface;
