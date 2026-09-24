package com.saamyukt.SIH26043.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "problem_fingerprint_version")
@Getter
@Setter
public class ProblemFingerprintVersion {

    @Id
    @Column(name = "version_id")
    private UUID versionId;

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "is_latest", nullable = false)
    private Boolean isLatest = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fingerprint_data", nullable = false)
    private com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload fingerprintData;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (versionId == null) versionId = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (isLatest == null) isLatest = false;
    }
}
