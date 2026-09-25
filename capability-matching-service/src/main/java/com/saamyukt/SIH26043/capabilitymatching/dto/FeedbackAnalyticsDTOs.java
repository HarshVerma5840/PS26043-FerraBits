package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class FeedbackAnalyticsDTOs {

    @Data
    public static class CitizenFeedbackDto {
        private UUID feedbackId;
        private UUID projectId;
        private UUID userId;
        private Integer rating;
        private String category;
        private String comment;
        private String completionUsefulness;
        private Boolean isAnonymous;
        private String moderationStatus;
        private OffsetDateTime createdAt;
        // Never expose exact lat/lon unless admin, generally just geohash
        private String locationGeohash;
    }

    @Data
    public static class CreateFeedbackDto {
        private Integer rating;
        private String category;
        private String comment;
        private String completionUsefulness;
        private Boolean isAnonymous;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }

    @Data
    public static class FeedbackSummaryDto {
        private long totalFeedback;
        private double averageRating;
    }

    @Data
    public static class ImpactMetricsDto {
        private long projectsCompleted;
        private long projectsDeployed;
        private long districtsServed;
        private long institutionsInvolved;
        private long studentsInvolved;
        private long facultyInvolved;
        private long industryContributions;
        private long citizenFeedbackCount;
        private double averageSatisfaction;
        private double averageCompletionTimeDays;
        private double deploymentSuccessRate;
    }
}
