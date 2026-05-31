import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getTotalUnreadCount } from "@/services/chat.service";
import { WebSocketMessageDTO } from "@/types/chat";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const stompClientRef = useRef<Client | null>(null);

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getTotalUnreadCount();
      if (response && typeof response.unreadCount === "number") {
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch initial unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // Subscribe to real-time message events to increment count
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("jwt_token");
    const connectHeaders: Record<string, string> = {};
    if (token) {
      connectHeaders["Authorization"] = `Bearer ${token}`;
      connectHeaders["Cookie"] = `jwt_token=${token}`;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL, null, { withCredentials: true } as any),
      connectHeaders,
      debug: (msg) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Unread Debug]", msg);
        }
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe("/user/queue/messages", (message) => {
        try {
          // A new message has arrived for the current user in some session
          setUnreadCount((prev) => prev + 1);
        } catch (e) {
          console.error("Failed to parse real-time unread message:", e);
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    resetUnread,
    refreshUnread: fetchUnreadCount,
  };
}
export default useUnreadCount;
