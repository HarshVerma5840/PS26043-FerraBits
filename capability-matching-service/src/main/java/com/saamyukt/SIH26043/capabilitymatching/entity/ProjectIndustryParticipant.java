package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "project_industry_participant")
public class ProjectIndustryParticipant {
    @Id
    private UUID participantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private IndustryOrganization organization;
    
    private String contributionType;
    private String deliverables;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String status;
    private OffsetDateTime createdAt;
}
