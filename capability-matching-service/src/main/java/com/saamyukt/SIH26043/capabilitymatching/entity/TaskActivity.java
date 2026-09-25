package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "task_activity")
public class TaskActivity {
    @Id
    private UUID activityId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private ProjectTask task;
    
    private UUID actorId;
    private String action;
    private String details;
    private OffsetDateTime createdAt;
}
