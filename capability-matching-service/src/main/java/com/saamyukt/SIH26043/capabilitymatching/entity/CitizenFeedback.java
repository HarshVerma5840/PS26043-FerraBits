package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "citizen_feedback")
public class CitizenFeedback {
    @Id
    private UUID feedbackId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    private UUID userId;
    private Integer rating;
    private String category;
    private String comment;
    private String completionUsefulness;
    private Boolean isAnonymous;
    private String moderationStatus;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String geohash;
    
    private OffsetDateTime createdAt;
}
