package com.example.springrentMe.repositories;

import com.example.springrentMe.models.chat.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySession_SessionIdAndIsDeletedFalseOrderByCreatedAtAsc(Long sessionId);

    Page<ChatMessage> findBySession_SessionIdAndIsDeletedFalse(Long sessionId, Pageable pageable);

    long countBySession_SessionIdAndSenderUserIdNotAndIsReadFalse(Long sessionId, Long currentUserId);

    java.util.Optional<ChatMessage> findFirstBySession_SessionIdAndIsDeletedFalseOrderByCreatedAtDesc(Long sessionId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.session.sessionId IN " +
           "(SELECT s.sessionId FROM ChatSession s WHERE s.participantOne.userId = :userId OR s.participantTwo.userId = :userId) " +
           "AND m.sender.userId <> :userId AND m.isRead = false AND m.isDeleted = false")
    long countTotalUnreadMessagesForUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.session.sessionId = :sessionId AND m.sender.userId <> :recipientUserId AND m.isRead = false")
    void markAllReadInSession(@Param("sessionId") Long sessionId, @Param("recipientUserId") Long recipientUserId);
}
