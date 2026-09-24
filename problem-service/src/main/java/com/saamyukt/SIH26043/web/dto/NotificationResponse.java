package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID eventId,
        UUID problemId,
        String eventType,
        String title,
        String body,
        String previousStatus,
        String newStatus,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(NotificationEvent e) {
        return new NotificationResponse(
                e.getEventId(),
                e.getProblemId(),
                e.getEventType(),
                e.getTitle(),
                e.getBody(),
                e.getPreviousStatus(),
                e.getNewStatus(),
                e.isRead(),
                e.getCreatedAt()
        );
    }
}
