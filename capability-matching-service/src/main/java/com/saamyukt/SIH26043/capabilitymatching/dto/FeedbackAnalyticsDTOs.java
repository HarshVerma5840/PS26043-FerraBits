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

    @Data
    public static class DistrictAnalyticsDto {
        private String district;
        private String state;
        private long projectCount;
        private long deployedCount;
        private long activeStudents;
        private String geohash;
    }

    @Data
    public static class InstitutionAnalyticsDto {
        private String institutionId;
        private String institutionName;
        private long projectCount;
        private double successRate;
        private long totalStudents;
    }

    @Data
    public static class ProjectAnalyticsDto {
        private String projectId;
        private String projectName;
        private String status;
        private String deploymentStatus;
        private String district;
        private String institutionName;
        private double satisfactionScore;
    }
}
