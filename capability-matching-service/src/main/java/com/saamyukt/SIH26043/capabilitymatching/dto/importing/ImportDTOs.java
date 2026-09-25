package com.saamyukt.SIH26043.capabilitymatching.dto.importing;

import lombok.Data;
import java.util.List;
import java.time.OffsetDateTime;

public class ImportDTOs {

    @Data
    public static class RegistryImportRequest {
        private String source; // 'AISHE', 'UNIVERSITY', 'MANUAL'
        private List<InstitutionImportDto> institutions;
    }

    @Data
    public static class InstitutionImportDto {
        private String aisheIdentifier;
        private String name;
        private String type;
        private String state;
        private String district;
        private Double latitude;
        private Double longitude;
        private String rawJsonData; // Original payload snippet for preservation
        private List<String> departments;
        private List<String> labs;
        private List<String> equipment;
        private List<String> skills;
    }

    @Data
    public static class ImportResultSummary {
        private int acceptedCount;
        private int rejectedCount;
        private List<String> rejectedReasons;
        private Integer newRegistryVersionId;
    }
}
