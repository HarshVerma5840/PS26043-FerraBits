package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "algorithm_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlgorithmConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "config_id")
    private UUID configId;

    private String version;

    @Column(name = "semantic_weight")
    private Double semanticWeight;

    @Column(name = "skill_weight")
    private Double skillWeight;

    @Column(name = "infrastructure_weight")
    private Double infrastructureWeight;

    @Column(name = "past_performance_weight")
    private Double pastPerformanceWeight;

    @Column(name = "capacity_weight")
    private Double capacityWeight;

    @Column(name = "geography_weight")
    private Double geographyWeight;

    @Column(name = "capacity_threshold")
    private Integer capacityThreshold;

    @Column(name = "max_distance_km")
    private Double maxDistanceKm;

    private Boolean active;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
