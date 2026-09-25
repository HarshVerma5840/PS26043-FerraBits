package com.saamyukt.SIH26043.capabilitymatching.dto.admin;

import lombok.Data;
import java.util.UUID;
import java.util.List;

public class AdminDTOs {

    @Data
    public static class InstitutionDto {
        private String name;
        private String type;
        private String aisheIdentifier;
        private String state;
        private String district;
        private Double latitude;
        private Double longitude;
        private String verificationStatus;
        private Boolean activeStatus;
    }

    @Data
    public static class DepartmentDto {
        private UUID institutionId;
        private String name;
        private String description;
    }

    @Data
    public static class FacultyCapabilityDto {
        private UUID skillId;
        private String proficiencyLevel;
    }

    @Data
    public static class StudentSkillDto {
        private UUID skillId;
        private String proficiencyLevel;
    }

    @Data
    public static class LabDto {
        private UUID institutionId;
        private String name;
    }

    @Data
    public static class EquipmentDto {
        private String name;
        private Boolean isOperational;
    }

    @Data
    public static class CapacityDto {
        private Integer workloadCapacityPct;
        private Integer currentWorkloadPct;
    }

    @Data
    public static class TeamDto {
        private UUID institutionId;
        private String name;
        private String description;
    }

    @Data
    public static class TeamMemberDto {
        private UUID facultyId;
        private UUID studentId;
        private String role;
    }
}
