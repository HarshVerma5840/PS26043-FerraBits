package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.entity.Location;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;

import java.time.Instant;
import java.util.UUID;

public record CitizenProblemResponse(
        UUID problemId,
        String title,
        String description,
        Instant submittedDate,
        Instant lastUpdatedDate,
        ProblemStatus internalStatus,
        String citizenStatus,
        String expectedNextStage,
        int evidenceCount,
        String locationSummary
) {
    public static CitizenProblemResponse from(Problem p, Location loc, int evidenceCount) {
        String citizenStatus = mapToCitizenStatus(p.getStatus());
        String expectedNextStage = mapToNextStage(p.getStatus());

        String locationSummary = "Unknown Location";
        if (loc != null) {
            if (loc.getDistrict() != null && !loc.getDistrict().isBlank()) {
                locationSummary = loc.getDistrict();
                if (loc.getBlockTehsil() != null && !loc.getBlockTehsil().isBlank()) {
                    locationSummary = loc.getBlockTehsil() + ", " + locationSummary;
                }
            } else if (loc.getState() != null && !loc.getState().isBlank()) {
                locationSummary = loc.getState();
            }
        }

        return new CitizenProblemResponse(
                p.getProblemId(),
                p.getTitle(),
                p.getDescription(),
                p.getSubmittedAt(),
                p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getSubmittedAt(),
                p.getStatus(),
                citizenStatus,
                expectedNextStage,
                evidenceCount,
                locationSummary
        );
    }

    private static String mapToCitizenStatus(ProblemStatus status) {
        if (status == null) return "UNKNOWN";
        return switch (status) {
            case DRAFT -> "DRAFT";
            case SUBMITTED -> "SUBMITTED";
            case SOURCE_VERIFYING -> "UNDER_VERIFICATION";
            case SOURCE_VERIFIED -> "VERIFIED";
            case REGISTERED -> "ASSIGNED";
            case REJECTED -> "REJECTED";
            case ARCHIVED -> "ARCHIVED";
        };
    }

    private static String mapToNextStage(ProblemStatus status) {
        if (status == null) return null;
        return switch (status) {
            case DRAFT -> "SUBMITTED";
            case SUBMITTED -> "UNDER_VERIFICATION";
            case SOURCE_VERIFYING -> "VERIFIED";
            case SOURCE_VERIFIED -> "ASSIGNED";
            case REGISTERED -> "IN_PROGRESS";
            case REJECTED, ARCHIVED -> null;
        };
    }
}
