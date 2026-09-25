package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "conversation_participant")
public class ConversationParticipant {
    @Id
    private UUID participantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
    
    private UUID userId;
    
    private UUID lastReadMessageId;
    private OffsetDateTime joinedAt;
    private Boolean isActive;
}
