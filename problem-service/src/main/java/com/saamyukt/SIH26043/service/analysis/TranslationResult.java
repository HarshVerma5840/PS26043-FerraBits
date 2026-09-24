package com.saamyukt.SIH26043.service.analysis;

import java.time.Instant;
import java.util.Map;

public record TranslationResult(
        String translatedText,
        String sourceLanguage,
        String targetLanguage,
        Double confidence,
        String providerName,
        String providerRequestId,
        Instant processingTimestamp,
        Map<String, Object> safeProviderMetadata
) {}
