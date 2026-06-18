package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.SessionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionResponseDTO {
    private Long sessionId;
    private SessionType sessionType;
    private Long activeVehicleId;
    private String vehicleMake;
    private String vehicleModel;
    
    // The "other" participant from the caller's perspective:
    private Long otherUserId;
    private String otherUserFullName;
    private String otherUserEmail;
    
    // Summary
    private String lastMessagePreview; // first 60 chars of last message content
    private LocalDateTime lastMessageAt;
    private long unreadCount;          // unread messages for the calling user
    private LocalDateTime createdAt;
}
