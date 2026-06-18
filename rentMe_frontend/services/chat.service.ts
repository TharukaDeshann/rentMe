/**
 * Chat Service
 * All API calls for in-app messaging.
 */

import apiClient, { getErrorMessage } from "@/lib/api/axios";
import {
  ChatSessionResponseDTO,
  ChatMessageResponseDTO,
  CreateSessionRequestDTO,
  SendMessageRequestDTO,
  PageResponse,
} from "@/types/chat";

/**
 * POST /chat/sessions — create or get a session
 */
export const createOrGetSession = async (
  data: CreateSessionRequestDTO
): Promise<ChatSessionResponseDTO> => {
  try {
    const response = await apiClient.post<ChatSessionResponseDTO>("/chat/sessions", data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /chat/sessions — renter/owner own chat sessions (paginated)
 */
export const getMySessions = async (
  page = 0,
  size = 20
): Promise<PageResponse<ChatSessionResponseDTO>> => {
  try {
    const response = await apiClient.get<PageResponse<ChatSessionResponseDTO>>(
      `/chat/sessions?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /chat/sessions/:sessionId — get metadata for a single session
 */
export const getSessionById = async (
  sessionId: number | string
): Promise<ChatSessionResponseDTO> => {
  try {
    const response = await apiClient.get<ChatSessionResponseDTO>(`/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /chat/sessions/:sessionId/messages — message history (paginated, oldest first)
 */
export const getMessages = async (
  sessionId: number | string,
  page = 0,
  size = 50
): Promise<PageResponse<ChatMessageResponseDTO>> => {
  try {
    const response = await apiClient.get<PageResponse<ChatMessageResponseDTO>>(
      `/chat/sessions/${sessionId}/messages?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * POST /chat/sessions/:sessionId/messages — REST fallback to send a message
 */
export const sendMessageRest = async (
  sessionId: number | string,
  data: SendMessageRequestDTO
): Promise<ChatMessageResponseDTO> => {
  try {
    const response = await apiClient.post<ChatMessageResponseDTO>(
      `/chat/sessions/${sessionId}/messages`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PATCH /chat/sessions/:sessionId/read — mark all messages in session as read
 */
export const markAsRead = async (
  sessionId: number | string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      `/chat/sessions/${sessionId}/read`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * DELETE /chat/messages/:messageId — soft-delete a message
 */
export const deleteMessage = async (
  messageId: number | string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/chat/messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /chat/unread-count — get total unread messages count across all sessions
 */
export const getTotalUnreadCount = async (): Promise<{
  success: boolean;
  unreadCount: number;
}> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      unreadCount: number;
    }>("/chat/unread-count");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ─── Admin APIs ─────────────────────────────────────────────────────────────

/**
 * GET /admin/chat/sessions — admin get all sessions system-wide (paginated)
 */
export const getAllSessionsSystemWide = async (
  page = 0,
  size = 20
): Promise<PageResponse<ChatSessionResponseDTO>> => {
  try {
    const response = await apiClient.get<PageResponse<ChatSessionResponseDTO>>(
      `/admin/chat/sessions?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /admin/chat/sessions/:sessionId/messages — admin view of messages in any session (paginated)
 */
export const getAnySessionMessages = async (
  sessionId: number | string,
  page = 0,
  size = 50
): Promise<PageResponse<ChatMessageResponseDTO>> => {
  try {
    const response = await apiClient.get<PageResponse<ChatMessageResponseDTO>>(
      `/admin/chat/sessions/${sessionId}/messages?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const chatService = {
  createOrGetSession,
  getMySessions,
  getSessionById,
  getMessages,
  sendMessageRest,
  markAsRead,
  deleteMessage,
  getTotalUnreadCount,
  getAllSessionsSystemWide,
  getAnySessionMessages,
};

export default chatService;
