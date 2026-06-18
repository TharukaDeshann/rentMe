package com.example.springrentMe.models.chat;

import com.example.springrentMe.models.MessageType;
import com.example.springrentMe.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_messages_session_created", columnList = "session_id, created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 20)
    private MessageType messageType;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
