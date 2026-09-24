package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProcessingRunResponse(
        UUID runId,
        UUID problemId,
        AiProcessingStatus status,
        Integer retryCount,
        String errorCategory,
        Map<String, Object> errorDetails,
        Instant startedAt,
        Instant completedAt,
        Instant createdAt,
        LanguageArtifactResponse languageArtifact,
        FingerprintVersionResponse fingerprintVersion
) {
    public static ProcessingRunResponse from(ProblemProcessingRun run, ProblemLanguageArtifact artifact, ProblemFingerprintVersion version) {
        return new ProcessingRunResponse(
                run.getRunId(),
                run.getProblemId(),
                run.getStatus(),
                run.getRetryCount(),
                run.getErrorCategory(),
                run.getErrorDetails(),
                run.getStartedAt(),
                run.getCompletedAt(),
                run.getCreatedAt(),
                artifact != null ? LanguageArtifactResponse.from(artifact) : null,
                version != null ? FingerprintVersionResponse.from(version) : null
        );
    }
}

record LanguageArtifactResponse(
        UUID artifactId,
        String sourceLanguage,
        String originalContent,
        String transcribedText,
        String translatedText,
        BigDecimal translationConfidence
) {
    public static LanguageArtifactResponse from(ProblemLanguageArtifact artifact) {
        return new LanguageArtifactResponse(
                artifact.getArtifactId(),
                artifact.getSourceLanguage(),
                artifact.getOriginalContent(),
                artifact.getTranscribedText(),
                artifact.getTranslatedText(),
                artifact.getTranslationConfidence()
        );
    }
}

record FingerprintVersionResponse(
        UUID versionId,
        Integer versionNumber,
        Boolean isLatest,
        com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload fingerprintData
) {
    public static FingerprintVersionResponse from(ProblemFingerprintVersion version) {
        return new FingerprintVersionResponse(
                version.getVersionId(),
                version.getVersionNumber(),
                version.getIsLatest(),
                version.getFingerprintData()
        );
    }
}
