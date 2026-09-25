package com.saamyukt.SIH26043.capabilitymatching.dto.retrieval;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class RetrievalDTOs {

    @Data
    @Builder
    public static class SparseRetrievalRequest {
        private String domainTerms;
        private List<String> requiredSkills;
        private List<String> requiredEquipment;
        private String district;
        private Integer topK;
        private Integer registryVersionId;
    }

    @Data
    @Builder
    public static class CapabilityCandidate {
        private UUID institutionId;
        private String name;
        private double score;
        private List<String> matchTerms;
        private boolean exactEquipmentMiss;
    }

    @Data
    @Builder
    public static class RrfResult {
        private UUID institutionId;
        private String name;
        private double rrfScore;
        private Integer denseRank;
        private Double denseScore;
        private Integer sparseRank;
        private Double sparseScore;
        private boolean exactEquipmentMiss;
    }
}
