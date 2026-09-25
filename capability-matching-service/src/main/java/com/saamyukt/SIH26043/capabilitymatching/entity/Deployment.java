package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "deployment")
public class Deployment {
    @Id
    private UUID deploymentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    private String deploymentTarget;
    private OffsetDateTime deploymentDate;
    private String status;
    private String version;
    private String responsibleTeam;
    private String verificationNotes;
    private String rollbackState;
    private OffsetDateTime createdAt;
}
