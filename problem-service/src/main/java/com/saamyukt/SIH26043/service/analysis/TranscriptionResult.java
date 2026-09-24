package com.saamyukt.SIH26043.service.analysis;

import java.time.Instant;
import java.util.Map;

public record TranscriptionResult(
        String transcriptText,
        String detectedLanguage,
        Double confidence,
        String providerName,
        String providerRequestId,
        Map<String, Object> rawResponseMetadata,
        Instant processingTimestamp
) {}
