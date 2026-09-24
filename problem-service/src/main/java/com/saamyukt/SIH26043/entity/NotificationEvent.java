package com.saamyukt.SIH26043.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Citizen-facing notification event log. Each row represents an event the
 * citizen should be informed about (submission received, status change, etc.).
 *
 * <p>This is a lightweight event log, not a production push-notification
 * system. Production notifications (SMS, push) are out of Batch 1 scope.</p>
 */
@Entity
@Table(name = "notification_event")
@Getter
@Setter
public class NotificationEvent {

    @Id
    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "problem_id")
    private UUID problemId;

    /** e.g. PROBLEM_SUBMITTED, STATUS_CHANGED, EVIDENCE_UPLOADED, DRAFT_SAVED */
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "body", columnDefinition = "text")
    private String body;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "previous_status", length = 50)
    private String previousStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(name = "template_key", length = 100)
    private String templateKey;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Column(name = "channel", columnDefinition = "delivery_channel")
    private com.saamyukt.SIH26043.enums.DeliveryChannel channel = com.saamyukt.SIH26043.enums.DeliveryChannel.IN_APP;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Column(name = "delivery_state", columnDefinition = "delivery_status")
    private com.saamyukt.SIH26043.enums.DeliveryStatus deliveryState = com.saamyukt.SIH26043.enums.DeliveryStatus.PENDING;

    @Column(name = "last_attempt_at")
    private Instant lastAttemptAt;

    @Column(name = "deduplication_key", length = 255)
    private String deduplicationKey;

    @PrePersist
    void onCreate() {
        if (eventId == null) {
            eventId = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
