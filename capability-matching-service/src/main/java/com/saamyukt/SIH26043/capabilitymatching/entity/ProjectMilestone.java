package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "project_milestone")
public class ProjectMilestone {
    @Id
    private UUID milestoneId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    private String title;
    private String description;
    private OffsetDateTime dueDate;
    private String status;
    private OffsetDateTime createdAt;
    
    @OneToMany(mappedBy = "milestone")
    private List<ProjectTask> tasks;
}
