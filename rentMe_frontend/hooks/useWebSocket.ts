import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ChatMessageResponseDTO, SendMessageRequestDTO, WebSocketMessageDTO } from "@/types/chat";
import { sendMessageRest } from "@/services/chat.service";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

export function useWebSocket(sessionId: number | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ChatMessageResponseDTO | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Only set up Stomp Client if we are on the client-side
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
          console.log("[STOMP Debug]", msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      if (sessionId) {
        client.subscribe(`/topic/session.${sessionId}`, (message) => {
          try {
            const wsMsg: WebSocketMessageDTO = JSON.parse(message.body);
            setLastMessage(wsMsg.message);
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        });
      }
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error frame:", frame);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [sessionId]);

  const sendMessage = useCallback(async (req: SendMessageRequestDTO) => {
    const client = stompClientRef.current;
    if (client && client.connected && sessionId) {
      client.publish({
        destination: `/app/chat.send.${sessionId}`,
        body: JSON.stringify(req),
      });
    } else if (sessionId) {
      // Fallback to REST API
      try {
        const response = await sendMessageRest(sessionId, req);
        setLastMessage(response);
      } catch (error) {
        console.error("Failed to send message via REST fallback:", error);
        throw error;
      }
    } else {
      console.warn("No active session ID to send message");
    }
  }, [sessionId]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
export default useWebSocket;
