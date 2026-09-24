package com.saamyukt.SIH26043.entity;

import com.saamyukt.SIH26043.enums.EvidenceType;
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
import java.util.UUID;

/**
 * Tracks a resumable/chunked file upload session so that citizens on
 * low-bandwidth connections can upload evidence in multiple HTTP requests.
 *
 * <p>Each session is bound to a problem and user. Chunks are appended to
 * local storage; once all bytes arrive the session is finalized into an
 * {@link Evidence} record.</p>
 */
@Entity
@Table(name = "upload_session")
@Getter
@Setter
public class UploadSession {

    @Id
    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "problem_id")
    private UUID problemId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "filename", nullable = false, length = 500)
    private String filename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "evidence_type", nullable = false, columnDefinition = "evidence_type")
    private EvidenceType evidenceType = EvidenceType.DOCUMENT;

    @Column(name = "total_bytes", nullable = false)
    private long totalBytes;

    @Column(name = "uploaded_bytes", nullable = false)
    private long uploadedBytes = 0;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount = 0;

    /** IN_PROGRESS, COMPLETED, FAILED, EXPIRED */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "IN_PROGRESS";

    @Column(name = "sha256_partial", length = 64)
    private String sha256Partial;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    void onCreate() {
        if (sessionId == null) {
            sessionId = UUID.randomUUID();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (expiresAt == null) {
            expiresAt = now.plusSeconds(86400); // 24 hours
        }
    }
}
