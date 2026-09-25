package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "past_project")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PastProject {
    @Id
    @Column(name = "project_id")
    private UUID projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private String title;
    private String description;

    @Column(name = "performance_score")
    private Double performanceScore;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
