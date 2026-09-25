package com.saamyukt.SIH26043.capabilitymatching.dto.registry;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class RegistryDTOs {

    @Data
    public static class RegistryVersionDto {
        private Integer versionId;
        private String versionName;
        private OffsetDateTime publishedAt;
        private Boolean isActive;
    }

    @Data
    public static class RegistryInstitutionDto {
        private UUID institutionId;
        private String name;
        private String type;
        private String aisheIdentifier;
        private String state;
        private String district;
        private String verificationStatus;
        private Boolean activeStatus;
        private Integer registryVersionId;
    }

    @Data
    public static class CapabilityDetailDto {
        private String source; // e.g., "FACULTY", "STUDENT", "LAB", "EQUIPMENT", "TEAM"
        private String name;
        private String description;
        private String level; // proficiency or operational status
    }

    @Data
    @lombok.EqualsAndHashCode(callSuper = true)
    public static class RegistryInstitutionDetailDto extends RegistryInstitutionDto {
        private Double latitude;
        private Double longitude;
        private OffsetDateTime importedAt;
        private OffsetDateTime verifiedAt;
        private List<CapabilityDetailDto> capabilities;
    }

    @Data
    public static class RegistryFilterRequest {
        private String district;
        private String state;
        private String type;
        private String verificationStatus;
        private String skill;
        private String equipment;
        private String laboratory;
        private Boolean activeRegistryVersion;
    }
}
