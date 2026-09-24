package com.saamyukt.SIH26043.entity;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "problem_processing_run")
@Getter
@Setter
public class ProblemProcessingRun {

    @Id
    @Column(name = "run_id")
    private UUID runId;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "ai_processing_status")
    private AiProcessingStatus status = AiProcessingStatus.PENDING;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "error_category", length = 100)
    private String errorCategory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_details")
    private Map<String, Object> errorDetails;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "provider_metadata")
    private Map<String, Object> providerMetadata;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (runId == null) runId = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = AiProcessingStatus.PENDING;
        if (retryCount == null) retryCount = 0;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
