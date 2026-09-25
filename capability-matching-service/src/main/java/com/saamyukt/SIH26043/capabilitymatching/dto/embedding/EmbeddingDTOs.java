package com.saamyukt.SIH26043.capabilitymatching.dto.embedding;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

public class EmbeddingDTOs {

    @Data
    @Builder
    public static class EmbeddingRequest {
        private String modelName;
        private String modelVersion;
        private Integer dimension;
        private String inputText;
        private String entityType;
        private UUID entityId;
        private String correlationId;
    }

    @Data
    @Builder
    public static class EmbeddingResult {
        private String correlationId;
        private java.util.List<Double> vector;
        private boolean success;
        private String errorMessage;
    }
}
