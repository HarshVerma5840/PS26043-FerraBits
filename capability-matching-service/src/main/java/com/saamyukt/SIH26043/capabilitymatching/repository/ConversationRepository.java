package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId AND p.isActive = true")
    List<Conversation> findActiveConversationsByUserId(UUID userId);
}
