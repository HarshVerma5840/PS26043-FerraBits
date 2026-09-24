package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.ProblemLanguageArtifactRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class TranslationNormalizationWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(TranslationNormalizationWorkflowService.class);

    private final TranslationProvider provider;
    private final ProblemProcessingRunRepository runRepository;
    private final ProblemLanguageArtifactRepository artifactRepository;
    private final int maxRetries;

    public TranslationNormalizationWorkflowService(
            TranslationProvider provider,
            ProblemProcessingRunRepository runRepository,
            ProblemLanguageArtifactRepository artifactRepository,
            @Value("${app.analysis.translate.max-retries:2}") int maxRetries) {
        this.provider = provider;
        this.runRepository = runRepository;
        this.artifactRepository = artifactRepository;
        this.maxRetries = maxRetries;
    }

    public Optional<ProblemLanguageArtifact> normalizeAndTranslate(UUID problemId, String citizenText, String asrTranscript, String declaredLanguage) {
        String idempotencyKey = "TRANSLATION_" + problemId;

        List<ProblemProcessingRun> existingRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        for (ProblemProcessingRun r : existingRuns) {
            if (idempotencyKey.equals(r.getIdempotencyKey()) && r.getStatus() == AiProcessingStatus.SUCCESS) {
                log.info("Translation already successfully processed for problem {}", problemId);
                return artifactRepository.findByRunId(r.getRunId());
            }
        }

        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setProblemId(problemId);
        run.setIdempotencyKey(idempotencyKey);
        run.setStatus(AiProcessingStatus.RUNNING);
        run.setStartedAt(Instant.now());
        run = runRepository.save(run);

        String textToTranslate = determineSourceText(citizenText, asrTranscript);
        
        if (textToTranslate == null || textToTranslate.isBlank()) {
            return markFailed(run, "Empty text provided for translation", false, null);
        }

        if ("en".equalsIgnoreCase(declaredLanguage)) {
            // Bypass
            return Optional.of(saveSuccessArtifact(run, citizenText, asrTranscript, textToTranslate, "en", 1.0));
        }

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                TranslationRequest req = new TranslationRequest(
                        textToTranslate,
                        declaredLanguage,
                        "en",
                        problemId,
                        UUID.randomUUID().toString()
                );
                
                TranslationResult result = provider.translate(req);
                
                return Optional.of(saveSuccessArtifact(run, citizenText, asrTranscript, result.translatedText(), result.sourceLanguage(), result.confidence()));

            } catch (ProviderException e) {
                log.warn("Translation provider error attempt {}: {}", attempt, e.getMessage());
                if (!e.isTransient()) {
                    markFailed(run, e.getMessage(), false, e);
                    return Optional.empty();
                }
                if (attempt > maxRetries) {
                    markFailed(run, "Max retries exceeded: " + e.getMessage(), true, e);
                    return Optional.empty();
                }
                run.setRetryCount(attempt);
                run.setStatus(AiProcessingStatus.RETRYING);
                runRepository.save(run);
            } catch (Exception e) {
                log.error("Unexpected error during translation: {}", e.getMessage(), e);
                markFailed(run, "Unexpected error: " + e.getMessage(), false, e);
                return Optional.empty();
            }
        }
        
        markFailed(run, "Failed after retries", true, null);
        return Optional.empty();
    }

    private String determineSourceText(String citizenText, String asrTranscript) {
        boolean hasText = citizenText != null && !citizenText.isBlank();
        boolean hasAudio = asrTranscript != null && !asrTranscript.isBlank();
        
        if (hasText && hasAudio) {
            // Based on prompt: "combined text and transcript only if the repository’s domain model requires it"
            return citizenText + "\n[Audio Transcript]: " + asrTranscript;
        } else if (hasText) {
            return citizenText;
        } else if (hasAudio) {
            return asrTranscript;
        }
        return null;
    }

    private ProblemLanguageArtifact saveSuccessArtifact(ProblemProcessingRun run, String citizenText, String asrTranscript, String translatedText, String sourceLanguage, Double confidence) {
        run.setStatus(AiProcessingStatus.SUCCESS);
        run.setCompletedAt(Instant.now());
        runRepository.save(run);

        ProblemLanguageArtifact artifact = new ProblemLanguageArtifact();
        artifact.setRunId(run.getRunId());
        artifact.setProblemId(run.getProblemId());
        artifact.setOriginalContent(citizenText);
        artifact.setTranscribedText(asrTranscript);
        artifact.setTranslatedText(translatedText);
        artifact.setSourceLanguage(sourceLanguage);
        if (confidence != null) {
            artifact.setTranslationConfidence(BigDecimal.valueOf(confidence));
        }
        
        return artifactRepository.save(artifact);
    }

    private Optional<ProblemLanguageArtifact> markFailed(ProblemProcessingRun run, String message, boolean transientErr, Throwable ex) {
        run.setStatus(AiProcessingStatus.FAILED);
        run.setErrorCategory(transientErr ? "TRANSIENT_ERROR" : "TERMINAL_ERROR");
        run.setErrorDetails(Map.of("message", message, "exception", ex != null ? ex.getClass().getSimpleName() : "None"));
        run.setCompletedAt(Instant.now());
        runRepository.save(run);
        return Optional.empty();
    }

    public Optional<ProblemLanguageArtifact> getLatestArtifact(UUID problemId) {
        List<ProblemProcessingRun> runs = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        for (ProblemProcessingRun run : runs) {
            if (run.getStatus() == AiProcessingStatus.SUCCESS && run.getIdempotencyKey().startsWith("TRANSLATION_")) {
                return artifactRepository.findByRunId(run.getRunId());
            }
        }
        return Optional.empty();
    }
}
