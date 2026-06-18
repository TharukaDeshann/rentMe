package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.*;
import com.example.springrentMe.models.*;
import com.example.springrentMe.models.chat.*;
import com.example.springrentMe.repositories.*;
import com.example.springrentMe.exceptions.*;
import com.example.springrentMe.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RenterRepository renterRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Create or retrieve a chat session between two users
     */
    @Transactional
    public ChatSessionResponseDTO createOrGetSession(CreateSessionRequestDTO req) {
        Long callerId = getCurrentUserId();
        if (callerId.equals(req.getTargetUserId())) {
            throw new ChatSessionException("Cannot initiate a chat session with yourself");
        }

        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new ChatSessionException("Caller not found"));
        
        User target = userRepository.findById(req.getTargetUserId()).orElse(null);
        if (target == null) {
            Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findById(req.getTargetUserId());
            if (ownerOpt.isPresent()) {
                target = ownerOpt.get().getUser();
            }
        }
        
        if (target == null) {
            throw new ChatSessionException("Target user not found");
        }

        if (Boolean.FALSE.equals(target.getIsActive())) {
            throw new ChatSessionException("Target user is not active");
        }

        boolean callerIsAdmin = hasRole("ROLE_ADMIN");
        SessionType sessionType;

        if (callerIsAdmin) {
            sessionType = SessionType.ADMIN_USER;
        } else {
            // Caller must be a renter to initiate
            boolean callerIsRenter = renterRepository.existsByUser_UserId(callerId);
            if (!callerIsRenter) {
                throw new AccessDeniedException("Only renters or admins can initiate a chat session");
            }

            // Target must be a vehicle owner
            VehicleOwner targetOwner = vehicleOwnerRepository.findByUser_UserId(target.getUserId())
                    .orElseThrow(() -> new ChatSessionException("Target user is not a vehicle owner"));

            // Verified owner gate
            if (targetOwner.getVerificationStatus() != VerificationStatus.APPROVED) {
                throw new ChatSessionException("Target vehicle owner is not approved. Communication is disabled.");
            }

            sessionType = SessionType.RENTER_OWNER;
        }

        // Normalise participant order: p1 = min(callerId, targetId), p2 = max(callerId, targetId)
        Long p1 = Math.min(callerId, target.getUserId());
        Long p2 = Math.max(callerId, target.getUserId());
        User participantOne = p1.equals(callerId) ? caller : target;
        User participantTwo = p2.equals(callerId) ? caller : target;

        // Check if session already exists
        Optional<ChatSession> existingOpt = chatSessionRepository.findByParticipantOneUserIdAndParticipantTwoUserId(p1, p2);
        if (existingOpt.isPresent()) {
            ChatSession existing = existingOpt.get();
            if (req.getVehicleId() != null) {
                Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                        .orElseThrow(() -> new ChatSessionException("Vehicle not found with id: " + req.getVehicleId()));
                
                // Optional context validation
                if (sessionType == SessionType.RENTER_OWNER && 
                    !vehicle.getVehicleOwner().getUser().getUserId().equals(target.getUserId()) &&
                    !vehicle.getVehicleOwner().getUser().getUserId().equals(callerId)) {
                    throw new ChatSessionException("Vehicle does not belong to the vehicle owner participant");
                }
                existing.setVehicle(vehicle);
            }
            existing = chatSessionRepository.save(existing);
            return convertToSessionDTO(existing, callerId);
        }

        // Create new session
        ChatSession session = new ChatSession();
        session.setSessionType(sessionType);
        session.setInitiator(caller);
        session.setParticipantOne(participantOne);
        session.setParticipantTwo(participantTwo);

        if (req.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                    .orElseThrow(() -> new ChatSessionException("Vehicle not found with id: " + req.getVehicleId()));
            
            if (sessionType == SessionType.RENTER_OWNER && 
                !vehicle.getVehicleOwner().getUser().getUserId().equals(target.getUserId())) {
                throw new ChatSessionException("Vehicle does not belong to the target vehicle owner");
            }
            session.setVehicle(vehicle);
        }

        ChatSession saved = chatSessionRepository.save(session);
        return convertToSessionDTO(saved, callerId);
    }

    /**
     * Get all sessions for the current user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<ChatSessionResponseDTO> getMySessions(Pageable pageable) {
        Long callerId = getCurrentUserId();
        Page<ChatSession> sessions = chatSessionRepository.findAllByParticipantOneUserIdOrParticipantTwoUserId(callerId, callerId, pageable);
        return sessions.map(session -> convertToSessionDTO(session, callerId));
    }

    /**
     * Get a single session by ID (with access check)
     */
    @Transactional(readOnly = true)
    public ChatSessionResponseDTO getSessionById(Long sessionId) {
        Long callerId = getCurrentUserId();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionException("Chat session not found with id: " + sessionId));

        boolean isParticipant = session.getParticipantOne().getUserId().equals(callerId) ||
                                session.getParticipantTwo().getUserId().equals(callerId);
        boolean isAdmin = hasRole("ROLE_ADMIN");

        if (!isParticipant && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to access this chat session");
        }

        return convertToSessionDTO(session, callerId);
    }

    /**
     * Get message history for a session (paginated, oldest first)
     */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponseDTO> getMessages(Long sessionId, Pageable pageable) {
        Long callerId = getCurrentUserId();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionException("Chat session not found with id: " + sessionId));

        boolean isParticipant = session.getParticipantOne().getUserId().equals(callerId) ||
                                session.getParticipantTwo().getUserId().equals(callerId);
        boolean isAdmin = hasRole("ROLE_ADMIN");

        if (!isParticipant && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view messages in this session");
        }

        Page<ChatMessage> messages = chatMessageRepository.findBySession_SessionIdAndIsDeletedFalse(sessionId, pageable);
        return messages.map(this::convertToMessageDTO);
    }

    /**
     * Send a message in a session (called by WebSocket or REST)
     */
    @Transactional
    public ChatMessageResponseDTO sendMessage(Long sessionId, SendMessageRequestDTO req) {
        Long callerId = getCurrentUserId();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionException("Chat session not found with id: " + sessionId));

        // Access check: caller must be a participant
        boolean isParticipant = session.getParticipantOne().getUserId().equals(callerId) ||
                                session.getParticipantTwo().getUserId().equals(callerId);
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this chat session");
        }

        // VEHICLE_OWNER constraint: if sessionType=RENTER_OWNER, owner may only write if session was initiated by renter
        if (session.getSessionType() == SessionType.RENTER_OWNER) {
            Long ownerUserId = null;
            if (session.getVehicle() != null) {
                ownerUserId = session.getVehicle().getVehicleOwner().getUser().getUserId();
            } else {
                // Fallback owner check
                if (vehicleOwnerRepository.existsByUser_UserId(session.getParticipantOne().getUserId())) {
                    ownerUserId = session.getParticipantOne().getUserId();
                } else if (vehicleOwnerRepository.existsByUser_UserId(session.getParticipantTwo().getUserId())) {
                    ownerUserId = session.getParticipantTwo().getUserId();
                }
            }

            if (ownerUserId != null && callerId.equals(ownerUserId)) {
                // Caller is the owner. Verify owner is not the initiator
                if (session.getInitiator().getUserId().equals(callerId)) {
                    throw new AccessDeniedException("Vehicle owner is not allowed to initiate or write in this session");
                }
            }
        }

        // Verified owner gate: check if the owner participant is approved
        Long ownerUserIdToCheck = null;
        if (session.getVehicle() != null) {
            ownerUserIdToCheck = session.getVehicle().getVehicleOwner().getUser().getUserId();
        } else {
            if (vehicleOwnerRepository.existsByUser_UserId(session.getParticipantOne().getUserId())) {
                ownerUserIdToCheck = session.getParticipantOne().getUserId();
            } else if (vehicleOwnerRepository.existsByUser_UserId(session.getParticipantTwo().getUserId())) {
                ownerUserIdToCheck = session.getParticipantTwo().getUserId();
            }
        }

        if (ownerUserIdToCheck != null) {
            VehicleOwner owner = vehicleOwnerRepository.findByUser_UserId(ownerUserIdToCheck)
                    .orElseThrow(() -> new ChatSessionException("Vehicle owner profile not found"));
            if (owner.getVerificationStatus() != VerificationStatus.APPROVED) {
                throw new ChatSessionException("Vehicle owner verification status is " + owner.getVerificationStatus() + ". Communication disabled.");
            }
        }

        // Validate payload completeness per MessageType
        validateMessagePayload(req);

        User sender = userRepository.findById(callerId)
                .orElseThrow(() -> new ChatSessionException("Sender not found"));

        // Persist ChatMessage
        ChatMessage message = new ChatMessage();
        message.setSession(session);
        message.setSender(sender);
        message.setMessageType(req.getMessageType());
        message.setTextContent(req.getTextContent());
        message.setFileUrl(req.getFileUrl());
        message.setLatitude(req.getLatitude());
        message.setLongitude(req.getLongitude());
        message.setIsRead(false);
        message.setIsDeleted(false);

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Update session lastMessageAt
        session.setLastMessageAt(savedMessage.getCreatedAt() != null ? savedMessage.getCreatedAt() : LocalDateTime.now());
        chatSessionRepository.save(session);

        ChatMessageResponseDTO responseDTO = convertToMessageDTO(savedMessage);

        // Publish to STOMP topic `/topic/session.{sessionId}`
        WebSocketMessageDTO wsMessage = new WebSocketMessageDTO(sessionId, responseDTO);
        messagingTemplate.convertAndSend("/topic/session." + sessionId, wsMessage);

        return responseDTO;
    }

    /**
     * Mark all unread messages in session as read for caller
     */
    @Transactional
    public void markAsRead(Long sessionId) {
        Long callerId = getCurrentUserId();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ChatSessionException("Chat session not found with id: " + sessionId));

        boolean isParticipant = session.getParticipantOne().getUserId().equals(callerId) ||
                                session.getParticipantTwo().getUserId().equals(callerId);
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this chat session");
        }

        chatMessageRepository.markAllReadInSession(sessionId, callerId);
    }

    /**
     * Soft delete a message (only sender or admin can delete)
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        Long callerId = getCurrentUserId();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ChatSessionException("Message not found with id: " + messageId));

        boolean isSender = message.getSender().getUserId().equals(callerId);
        boolean isAdmin = hasRole("ROLE_ADMIN");

        if (!isSender && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this message");
        }

        message.setIsDeleted(true);
        chatMessageRepository.save(message);
    }

    /**
     * Total unread count across all sessions for current user
     */
    @Transactional(readOnly = true)
    public long getTotalUnreadCount() {
        Long callerId = getCurrentUserId();
        return chatMessageRepository.countTotalUnreadMessagesForUser(callerId);
    }

    /**
     * Get all sessions system-wide (Admin only)
     */
    @Transactional(readOnly = true)
    public Page<ChatSessionResponseDTO> getAllSessionsSystemWide(Pageable pageable) {
        Long callerId = getCurrentUserId();
        Page<ChatSession> sessions = chatSessionRepository.findAll(pageable);
        return sessions.map(session -> convertToSessionDTO(session, callerId));
    }

    /**
     * Get messages in any session system-wide (Admin only)
     */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponseDTO> getAnySessionMessages(Long sessionId, Pageable pageable) {
        Page<ChatMessage> messages = chatMessageRepository.findBySession_SessionIdAndIsDeletedFalse(sessionId, pageable);
        return messages.map(this::convertToMessageDTO);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return userDetails.getId();
    }

    private boolean hasRole(String roleName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleName));
    }

    private void validateMessagePayload(SendMessageRequestDTO req) {
        if (req.getMessageType() == null) {
            throw new MessageValidationException("Message type is required");
        }
        switch (req.getMessageType()) {
            case TEXT -> {
                if (req.getTextContent() == null || req.getTextContent().trim().isEmpty()) {
                    throw new MessageValidationException("Text content is required for TEXT message type");
                }
            }
            case IMAGE -> {
                if (req.getFileUrl() == null || req.getFileUrl().trim().isEmpty()) {
                    throw new MessageValidationException("File URL is required for IMAGE message type");
                }
            }
            case LOCATION -> {
                if (req.getLatitude() == null || req.getLongitude() == null) {
                    throw new MessageValidationException("Latitude and longitude are required for LOCATION message type");
                }
            }
        }
    }

    private ChatSessionResponseDTO convertToSessionDTO(ChatSession session, Long currentUserId) {
        ChatSessionResponseDTO dto = new ChatSessionResponseDTO();
        dto.setSessionId(session.getSessionId());
        dto.setSessionType(session.getSessionType());

        if (session.getVehicle() != null) {
            dto.setActiveVehicleId(session.getVehicle().getVehicleId());
            dto.setVehicleMake(session.getVehicle().getMake());
            dto.setVehicleModel(session.getVehicle().getModel());
        }

        // Determine other user
        boolean isParticipant = session.getParticipantOne().getUserId().equals(currentUserId) ||
                                session.getParticipantTwo().getUserId().equals(currentUserId);
        User otherUser;
        if (isParticipant) {
            otherUser = session.getParticipantOne().getUserId().equals(currentUserId)
                    ? session.getParticipantTwo()
                    : session.getParticipantOne();
        } else {
            // Default for non-participant admins
            otherUser = session.getParticipantTwo();
        }

        dto.setOtherUserId(otherUser.getUserId());
        dto.setOtherUserFullName(otherUser.getFullName());
        dto.setOtherUserEmail(otherUser.getEmail());

        // Get unread count
        dto.setUnreadCount(chatMessageRepository.countBySession_SessionIdAndSenderUserIdNotAndIsReadFalse(session.getSessionId(), currentUserId));

        // Get preview of last message
        Optional<ChatMessage> lastMsgOpt = chatMessageRepository.findFirstBySession_SessionIdAndIsDeletedFalseOrderByCreatedAtDesc(session.getSessionId());
        if (lastMsgOpt.isPresent()) {
            ChatMessage lastMsg = lastMsgOpt.get();
            dto.setLastMessageAt(lastMsg.getCreatedAt());
            String preview = "";
            switch (lastMsg.getMessageType()) {
                case TEXT -> preview = lastMsg.getTextContent() != null ? lastMsg.getTextContent() : "";
                case IMAGE -> preview = "[Image]";
                case LOCATION -> preview = "[Location]";
            }
            if (preview.length() > 60) {
                preview = preview.substring(0, 60) + "...";
            }
            dto.setLastMessagePreview(preview);
        } else {
            dto.setLastMessageAt(session.getLastMessageAt() != null ? session.getLastMessageAt() : session.getCreatedAt());
            dto.setLastMessagePreview(null);
        }

        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }

    private ChatMessageResponseDTO convertToMessageDTO(ChatMessage msg) {
        ChatMessageResponseDTO dto = new ChatMessageResponseDTO();
        dto.setMessageId(msg.getMessageId());
        dto.setSessionId(msg.getSession().getSessionId());
        dto.setSenderUserId(msg.getSender().getUserId());
        dto.setSenderFullName(msg.getSender().getFullName());
        dto.setMessageType(msg.getMessageType());
        dto.setTextContent(msg.getTextContent());
        dto.setFileUrl(msg.getFileUrl());
        dto.setLatitude(msg.getLatitude());
        dto.setLongitude(msg.getLongitude());
        dto.setRead(msg.getIsRead());
        dto.setDeleted(msg.getIsDeleted());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }
}
