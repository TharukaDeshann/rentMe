"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChatSessionList } from "@/components/chat/chat-session-list";
import { ChatInterface } from "@/components/chat/chat-interface";
import { MessageSquare, Loader2 } from "lucide-react";

function RenterChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sessionParam = searchParams.get("session");
  const selectedSessionId = sessionParam ? parseInt(sessionParam) : null;

  const handleSelectSession = (sessionId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("session", sessionId.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseSession = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("session");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-112px)] border rounded-xl overflow-hidden bg-card border-border shadow-sm">
      {/* Sessions Navigation List Pane */}
      <div
        className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${
          selectedSessionId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatSessionList
            selectedSessionId={selectedSessionId}
            onSelectSession={handleSelectSession}
          />
        </div>
      </div>

      {/* Messages Viewer / Interface Pane */}
      <div
        className={`flex-1 flex flex-col bg-muted/5 ${
          !selectedSessionId ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedSessionId ? (
          <ChatInterface sessionId={selectedSessionId} onClose={handleCloseSession} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Select a conversation</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Choose a message thread from the sidebar to start discussing bookings or vehicles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RenterChatPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[300px] w-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RenterChatContent />
      </Suspense>
    </div>
  );
}
