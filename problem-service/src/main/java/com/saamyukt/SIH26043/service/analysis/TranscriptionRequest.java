package com.saamyukt.SIH26043.service.analysis;

import java.io.InputStream;
import java.util.UUID;

public record TranscriptionRequest(
        UUID problemId,
        UUID evidenceId,
        InputStream audioStream,
        String mimeType,
        String declaredLanguage,
        String correlationId
) {}
