"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMySessions, getAllSessionsSystemWide, markAsRead } from "@/services/chat.service";
import { ChatSessionResponseDTO } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MessageSquare, Car, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSessionListProps {
  selectedSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
  isAdmin?: boolean;
}

export function ChatSessionList({
  selectedSessionId,
  onSelectSession,
  isAdmin = false,
}: ChatSessionListProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isAdmin
        ? await getAllSessionsSystemWide(0, 50)
        : await getMySessions(0, 50);
      setSessions(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load chat sessions");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSessionClick = async (session: ChatSessionResponseDTO) => {
    // If not admin, mark as read first
    if (!isAdmin && session.unreadCount > 0) {
      try {
        await markAsRead(session.sessionId);
        // Optimistically update count
        setSessions((prev) =>
          prev.map((s) =>
            s.sessionId === session.sessionId ? { ...s, unreadCount: 0 } : s
          )
        );
      } catch (err) {
        console.error("Failed to mark session as read:", err);
      }
    }
    onSelectSession(session.sessionId);
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

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    try {
      const date = parseISO(timeStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          {isAdmin
            ? "No chat sessions are active system-wide."
            : "Renters can start a chat from any vehicle's detail profile page."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border h-full overflow-y-auto">
      {sessions.map((session) => {
        const isSelected = selectedSessionId === session.sessionId;
        const otherName = session.otherUserFullName || "User";
        const isUnread = !isAdmin && session.unreadCount > 0;

        return (
          <div
            key={session.sessionId}
            onClick={() => handleSessionClick(session)}
            className={cn(
              "p-4 cursor-pointer transition-colors flex flex-col gap-2 hover:bg-muted/40",
              isSelected && "bg-muted hover:bg-muted"
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0 border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {getInitials(otherName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {otherName}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatTime(session.lastMessageAt || session.createdAt)}
                  </span>
                </div>
                
                <p
                  className={cn(
                    "text-xs text-muted-foreground truncate",
                    isUnread && "text-foreground font-semibold"
                  )}
                >
                  {session.lastMessagePreview || "No messages yet"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-1 pl-13">
              {session.vehicleMake && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                  <Car className="h-3 w-3" />
                  {session.vehicleMake} {session.vehicleModel}
                </span>
              )}
              
              <div className="flex items-center gap-1.5 ml-auto">
                {session.sessionType === "ADMIN_USER" && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary text-primary">
                    Admin Session
                  </Badge>
                )}
                {isUnread && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                    {session.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ChatSessionList;
