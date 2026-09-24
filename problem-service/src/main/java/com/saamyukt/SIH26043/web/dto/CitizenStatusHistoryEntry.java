package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.entity.AuditLog;

import java.time.Instant;
import java.util.UUID;

public record CitizenStatusHistoryEntry(
        UUID logId,
        Instant performedAt,
        String action,
        String citizenFriendlyMessage
) {
    public static CitizenStatusHistoryEntry from(AuditLog log) {
        String message = mapActionToMessage(log);
        return new CitizenStatusHistoryEntry(
                log.getLogId(),
                log.getPerformedAt(),
                log.getActionType().name(),
                message
        );
    }

    private static String mapActionToMessage(AuditLog log) {
        if (log.getActionType() == null) return "System updated the problem.";
        
        return switch (log.getActionType()) {
            case DRAFT_CREATED -> "Draft saved.";
            case DRAFT_UPDATED -> "Draft updated.";
            case CREATED -> "Problem submitted for review.";
            case UPDATED -> "Problem details updated.";
            case STATUS_CHANGED -> mapStatusChange(log);
            case EVIDENCE_ADDED -> "New evidence uploaded.";
            case SOURCE_VERIFICATION_INITIATED -> "Source verification process started.";
            case SOURCE_VERIFIED -> "Source verified successfully.";
            case SOURCE_VERIFICATION_FAILED -> "Source verification failed.";
            case REJECTED -> "Problem rejected.";
            case ARCHIVED -> "Problem archived.";
            case WITHDRAWN -> "Problem withdrawn.";
            default -> "System updated the problem.";
        };
    }

    private static String mapStatusChange(AuditLog log) {
        if (log.getAfterState() != null && log.getAfterState().containsKey("status")) {
            String newStatus = String.valueOf(log.getAfterState().get("status"));
            return "Status changed to " + mapInternalStatusToCitizen(newStatus) + ".";
        }
        return "Status changed.";
    }

    private static String mapInternalStatusToCitizen(String internalStatus) {
        if (internalStatus == null) return "Unknown";
        return switch (internalStatus) {
            case "DRAFT" -> "DRAFT";
            case "SUBMITTED" -> "SUBMITTED";
            case "SOURCE_VERIFYING" -> "UNDER_VERIFICATION";
            case "SOURCE_VERIFIED" -> "VERIFIED";
            case "REGISTERED" -> "ASSIGNED";
            case "REJECTED" -> "REJECTED";
            case "ARCHIVED" -> "ARCHIVED";
            default -> internalStatus;
        };
    }
}
