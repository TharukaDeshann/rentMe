package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.*;
import com.example.springrentMe.services.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Value("${app.chat.sessions-per-page:20}")
    private int defaultSessionsPerPage;

    @Value("${app.chat.messages-per-page:50}")
    private int defaultMessagesPerPage;

    /**
     * POST /api/v1/chat/sessions
     * Create or retrieve a chat session.
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/chat/sessions")
    public ResponseEntity<ChatSessionResponseDTO> createOrGetSession(@Valid @RequestBody CreateSessionRequestDTO request) {
        ChatSessionResponseDTO session = chatService.createOrGetSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * GET /api/v1/chat/sessions
     * Get all sessions for current user (paginated, sorted by last message time).
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/sessions")
    public ResponseEntity<Page<ChatSessionResponseDTO>> getMySessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int pageSize = size != null ? size : defaultSessionsPerPage;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("lastMessageAt").descending());
        return ResponseEntity.ok(chatService.getMySessions(pageable));
    }

    /**
     * GET /api/v1/chat/sessions/{sessionId}
     * Get single session metadata.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/sessions/{sessionId}")
    public ResponseEntity<ChatSessionResponseDTO> getSessionById(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatService.getSessionById(sessionId));
    }

    /**
     * GET /api/v1/chat/sessions/{sessionId}/messages
     * Get messages in session (paginated, oldest first).
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<Page<ChatMessageResponseDTO>> getMessages(
            @PathVariable Long sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int pageSize = size != null ? size : defaultMessagesPerPage;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(chatService.getMessages(sessionId, pageable));
    }

    /**
     * POST /api/v1/chat/sessions/{sessionId}/messages
     * REST fallback endpoint to send a message.
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody SendMessageRequestDTO request) {
        ChatMessageResponseDTO message = chatService.sendMessage(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * PATCH /api/v1/chat/sessions/{sessionId}/read
     * Mark all unread messages in session as read.
     */
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/chat/sessions/{sessionId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long sessionId) {
        chatService.markAsRead(sessionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Messages marked as read successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/chat/messages/{messageId}
     * Soft delete a message.
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/chat/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Message deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/chat/unread-count
     * Get total unread messages count for current user.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/unread-count")
    public ResponseEntity<Map<String, Object>> getTotalUnreadCount() {
        long count = chatService.getTotalUnreadCount();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/admin/chat/sessions
     * Admin view of all sessions system-wide.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/chat/sessions")
    public ResponseEntity<Page<ChatSessionResponseDTO>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int pageSize = size != null ? size : defaultSessionsPerPage;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("lastMessageAt").descending());
        return ResponseEntity.ok(chatService.getAllSessionsSystemWide(pageable));
    }

    /**
     * GET /api/v1/admin/chat/sessions/{sessionId}/messages
     * Admin view of messages in any session system-wide.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/chat/sessions/{sessionId}/messages")
    public ResponseEntity<Page<ChatMessageResponseDTO>> getAnySessionMessages(
            @PathVariable Long sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int pageSize = size != null ? size : defaultMessagesPerPage;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").ascending());
        return ResponseEntity.ok(chatService.getAnySessionMessages(sessionId, pageable));
    }
}
