package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "message")
public class Message {
    @Id
    private UUID messageId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
    
    private UUID senderId;
    private String content;
    private String correlationId;
    
    private Boolean isDeleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
    private UUID deletedBy;
}
