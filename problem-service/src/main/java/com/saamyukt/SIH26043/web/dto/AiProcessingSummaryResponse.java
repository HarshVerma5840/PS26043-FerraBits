package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AiProcessingSummaryResponse(
        UUID problemId,
        String currentStage,
        AiProcessingStatus currentStatus,
        String lastSuccessfulStep,
        String failureCategory,
        boolean retryAvailable,
        Integer latestFingerprintVersion,
        Map<String, Object> safeMetadata,
        Instant updatedAt
) {}
