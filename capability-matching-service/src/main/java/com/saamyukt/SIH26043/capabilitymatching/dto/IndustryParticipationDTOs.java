package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class IndustryParticipationDTOs {

    @Data
    public static class IndustryOrganizationDto {
        private UUID orgId;
        private String name;
        private String description;
        private String contactEmail;
        private String contactPhone;
        private String website;
        private String address;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class ProjectIndustryParticipantDto {
        private UUID participantId;
        private UUID projectId;
        private UUID orgId;
        private String contributionType;
        private String deliverables;
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        private String status;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class ProjectFundingDto {
        private UUID fundingId;
        private UUID projectId;
        private UUID orgId;
        private BigDecimal amount;
        private String currency;
        private String description;
        private String approvalState;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class ProjectMentorshipDto {
        private UUID mentorshipId;
        private UUID projectId;
        private UUID orgId;
        private UUID mentorUserId;
        private String scope;
        private String status;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class MentorshipSessionDto {
        private UUID sessionId;
        private UUID mentorshipId;
        private OffsetDateTime sessionDate;
        private String notes;
        private String commitments;
        private String completionStatus;
        private OffsetDateTime createdAt;
    }
}
