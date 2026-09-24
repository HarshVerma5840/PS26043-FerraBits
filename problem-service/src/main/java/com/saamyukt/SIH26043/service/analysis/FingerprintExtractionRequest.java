package com.saamyukt.SIH26043.service.analysis;

import java.util.Map;
import java.util.UUID;

public record FingerprintExtractionRequest(
        UUID problemId,
        String originalText,
        String transcript,
        String translatedText,
        String locationSummary,
        String evidenceSummary,
        Map<String, Object> allowedTaxonomyValues,
        Integer schemaVersion,
        String correlationId
) {}
