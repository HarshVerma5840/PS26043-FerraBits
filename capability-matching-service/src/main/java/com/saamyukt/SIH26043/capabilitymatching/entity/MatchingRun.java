package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "matching_run")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MatchingRun {
    @Id
    @Column(name = "run_id")
    private UUID runId;

    @Column(name = "problem_id")
    private UUID problemId;

    @Column(name = "algorithm_version")
    private String algorithmVersion;

    @Column(name = "registry_version_id")
    private Integer registryVersionId;

    @Column(name = "fingerprint_version")
    private Integer fingerprintVersion;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "correlation_id")
    private UUID correlationId;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "result_json")
    private String resultJson;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
