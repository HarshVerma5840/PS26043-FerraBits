package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

public class ProjectExecutionDTOs {

    @Data
    public static class MilestoneDto {
        private UUID milestoneId;
        private UUID projectId;
        private String title;
        private String description;
        private OffsetDateTime dueDate;
        private String status;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class TaskDto {
        private UUID taskId;
        private UUID projectId;
        private UUID milestoneId;
        private String title;
        private String description;
        private UUID assigneeId;
        private String priority;
        private OffsetDateTime dueDate;
        private String status;
        private Integer positionIndex;
        private String attachments;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    @Data
    public static class TaskStatusUpdateDto {
        private String status;
    }

    @Data
    public static class TaskPositionUpdateDto {
        private Integer positionIndex;
    }

    @Data
    public static class FieldTestDto {
        private UUID testId;
        private UUID projectId;
        private String testPlan;
        private String location;
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        private String observations;
        private String evidence;
        private String result;
        private String approvalStatus;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class DeploymentDto {
        private UUID deploymentId;
        private UUID projectId;
        private String deploymentTarget;
        private OffsetDateTime deploymentDate;
        private String status;
        private String version;
        private String responsibleTeam;
        private String verificationNotes;
        private String rollbackState;
        private OffsetDateTime createdAt;
    }
}
