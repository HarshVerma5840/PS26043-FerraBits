package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "project_funding")
public class ProjectFunding {
    @Id
    private UUID fundingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private IndustryOrganization organization;
    
    private BigDecimal amount;
    private String currency;
    private String description;
    private String approvalState;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
