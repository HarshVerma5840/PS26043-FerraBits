package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByConversation_ConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.conversationId = :conversationId AND m.createdAt > (SELECT p.joinedAt FROM ConversationParticipant p WHERE p.conversation.conversationId = :conversationId AND p.userId = :userId)")
    long countUnreadMessagesByConversationAndUser(UUID conversationId, UUID userId);
}
