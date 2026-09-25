package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "mentorship_session")
public class MentorshipSession {
    @Id
    private UUID sessionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentorship_id")
    private ProjectMentorship mentorship;
    
    private OffsetDateTime sessionDate;
    private String notes;
    private String commitments;
    private String completionStatus;
    private OffsetDateTime createdAt;
}
