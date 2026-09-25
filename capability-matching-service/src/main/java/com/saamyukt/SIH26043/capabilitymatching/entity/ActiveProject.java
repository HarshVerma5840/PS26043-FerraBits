package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "active_project")
public class ActiveProject {
    @Id
    private UUID projectId;
    private UUID problemId;
    private UUID institutionId;
    private String name;
    private String description;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<ProjectMilestone> milestones;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<ProjectTask> tasks;
}
