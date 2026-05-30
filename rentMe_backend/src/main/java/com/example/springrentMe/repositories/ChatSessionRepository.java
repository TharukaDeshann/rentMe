package com.example.springrentMe.repositories;

import com.example.springrentMe.models.chat.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findByParticipantOneUserIdAndParticipantTwoUserId(Long p1, Long p2);

    Page<ChatSession> findAllByParticipantOneUserIdOrParticipantTwoUserId(Long userId1, Long userId2, Pageable pageable);

    @Query("SELECT s FROM ChatSession s WHERE s.sessionId = :sessionId AND (s.participantOne.userId = :userId OR s.participantTwo.userId = :userId)")
    Optional<ChatSession> findBySessionIdAndParticipantOneUserIdOrParticipantTwoUserId(
            @Param("sessionId") Long sessionId,
            @Param("userId") Long userId
    );

    // Provide the spring-data signature version to guarantee complete compliance
    Optional<ChatSession> findBySessionIdAndParticipantOneUserIdOrSessionIdAndParticipantTwoUserId(
            Long sessionId1, Long p1, Long sessionId2, Long p2
    );
}
