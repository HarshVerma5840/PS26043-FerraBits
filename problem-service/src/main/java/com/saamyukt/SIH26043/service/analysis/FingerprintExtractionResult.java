package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;

import java.time.Instant;
import java.util.Map;

public record FingerprintExtractionResult(
        ProblemFingerprintPayload payload,
        String providerName,
        String providerRequestId,
        String promptVersion,
        String modelVersion,
        Map<String, Object> safeProviderMetadata,
        Instant processingTimestamp
) {}
