"use client";

import { useState } from "react";
import { ChatMessageResponseDTO } from "@/types/chat";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Check, CheckCheck, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDTO;
  currentUserId: number;
  onDelete: (messageId: number) => Promise<void> | void;
}

export function ChatMessageBubble({
  message,
  currentUserId,
  onDelete,
}: ChatMessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCurrentUser = message.senderUserId === currentUserId;
  const isDeleted = message.isDeleted;

  const formatMessageTime = (timeStr: string) => {
    try {
      const date = parseISO(timeStr);
      return format(date, "h:mm a");
    } catch (e) {
      return "";
    }
  };

  const getFullDateTime = (timeStr: string) => {
    try {
      const date = parseISO(timeStr);
      return format(date, "PPPP h:mm:ss a");
    } catch (e) {
      return "";
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(message.messageId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-1 py-1.5 px-4",
        isCurrentUser ? "items-end" : "items-start"
      )}
    >
      {/* Sender Name (only for other users) */}
      {!isCurrentUser && !isDeleted && (
        <span className="text-[10px] font-semibold text-muted-foreground pl-1">
          {message.senderFullName}
        </span>
      )}

      {/* Bubble Container */}
      <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[70%]">
        {/* Hover Action Menu: Delete button (Current user, not deleted, and not deleting) */}
        {isCurrentUser && !isDeleted && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* The Message Content Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm relative break-words shadow-sm",
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted text-foreground rounded-tl-none",
            isDeleted && "bg-muted/40 text-muted-foreground italic border border-border"
          )}
        >
          {isDeleted ? (
            <span className="text-xs">This message was deleted</span>
          ) : (
            <>
              {/* Message content based on type */}
              {message.messageType === "TEXT" && (
                <p className="whitespace-pre-wrap">{message.textContent}</p>
              )}

              {message.messageType === "IMAGE" && message.fileUrl && (
                <div className="space-y-1 my-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.fileUrl}
                    alt="Attached Image"
                    onClick={() => setLightboxOpen(true)}
                    className="max-w-[200px] max-h-[150px] rounded-lg object-cover cursor-pointer hover:opacity-90 border border-black/10 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  
                  <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                    <DialogContent className="max-w-2xl bg-black/90 p-1 border-none flex items-center justify-center rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={message.fileUrl}
                        alt="Expanded image preview"
                        className="max-w-full max-h-[80vh] rounded object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {message.messageType === "LOCATION" &&
                message.latitude !== null &&
                message.longitude !== null && (
                  <div className="my-1 rounded-lg overflow-hidden border border-black/10 bg-white">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-90 relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${message.latitude},${message.longitude}&zoom=14&size=200x120&markers=${message.latitude},${message.longitude},red`}
                        alt="Location pin"
                        className="w-[200px] h-[120px] object-cover"
                        onError={(e) => {
                          // Simple fallback text if the static map tile provider is blocked or down
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="p-2 bg-card border-t border-border flex items-center gap-1.5 text-xs text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                        <span className="truncate">View on Google Maps</span>
                      </div>
                    </a>
                  </div>
                )}
            </>
          )}

          {/* Time & Read Receipts */}
          <div
            className={cn(
              "flex justify-end items-center gap-1 mt-1 text-[9px]",
              isCurrentUser
                ? "text-primary-foreground/75"
                : "text-muted-foreground"
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help font-medium">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] bg-popover text-popover-foreground border">
                  {getFullDateTime(message.createdAt)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isCurrentUser && !isDeleted && (
              <span className="shrink-0 pl-0.5">
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Check className="h-3 w-3 text-primary-foreground/60" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatMessageBubble;
