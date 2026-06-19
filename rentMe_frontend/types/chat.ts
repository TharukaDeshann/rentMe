export type SessionType = "RENTER_OWNER" | "ADMIN_USER";
export type MessageType = "TEXT" | "IMAGE" | "LOCATION";

export interface ChatSessionResponseDTO {
  sessionId: number;
  sessionType: SessionType;
  activeVehicleId: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  otherUserId: number;
  otherUserFullName: string;
  otherUserEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessageResponseDTO {
  messageId: number;
  sessionId: number;
  senderUserId: number;
  senderFullName: string;
  messageType: MessageType;
  textContent: string | null;
  fileUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface WebSocketMessageDTO {
  sessionId: number;
  message: ChatMessageResponseDTO;
}

export interface SendMessageRequestDTO {
  messageType: MessageType;
  textContent?: string;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateSessionRequestDTO {
  targetUserId: number;
  vehicleId?: number | null;
}


// Paginated API response wrapper — re-exported from shared type
export type { PageResponse, PageMeta } from "./pagination";

