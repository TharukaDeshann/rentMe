package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDTO {
    private Long messageId;
    private Long sessionId;
    private Long senderUserId;
    private String senderFullName;
    private MessageType messageType;
    private String textContent;
    private String fileUrl;
    private Double latitude;
    private Double longitude;
    private boolean isRead;
    private boolean isDeleted;
    private LocalDateTime createdAt;
}
