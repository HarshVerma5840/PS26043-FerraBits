package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "project_task")
public class ProjectTask {
    @Id
    private UUID taskId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private ProjectMilestone milestone;
    
    private String title;
    private String description;
    private UUID assigneeId;
    private String priority;
    private OffsetDateTime dueDate;
    private String status;
    private Integer positionIndex;
    private String attachments;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskActivity> activities;
}
