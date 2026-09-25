package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "conversation")
public class Conversation {
    @Id
    private UUID conversationId;
    
    private String conversationType; // PROJECT, TEAM, FACULTY, INDUSTRY, ADMIN, SUPPORT
    private String name;
    private UUID referenceId;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<ConversationParticipant> participants;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<Message> messages;
}
