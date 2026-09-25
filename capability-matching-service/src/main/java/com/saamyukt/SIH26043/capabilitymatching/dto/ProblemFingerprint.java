package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ProblemFingerprint {
    private UUID problemId;
    private Integer fingerprintVersion;
    private Double latitude;
    private Double longitude;
    private Double maxDistanceKm;
    private String domain;
    private String subDomain;
    private List<String> interventionTypes;
    private Double urgencyScore;
    private List<RequiredCapability> requiredCapabilities;
    private List<String> requiredEquipment;
    private GeographicContext geographicContext;

    @Data
    public static class RequiredCapability {
        private String skill;
        private String importance;
    }

    @Data
    public static class GeographicContext {
        private String district;
        private Double latitude;
        private Double longitude;
    }
}
