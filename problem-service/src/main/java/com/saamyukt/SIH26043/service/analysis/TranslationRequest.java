package com.saamyukt.SIH26043.service.analysis;

import java.util.UUID;

public record TranslationRequest(
        String originalText,
        String sourceLanguage,
        String targetLanguage,
        UUID problemId,
        String correlationId
) {}
