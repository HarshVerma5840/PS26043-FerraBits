package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository;
import com.saamyukt.SIH26043.repository.ProblemLanguageArtifactRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProblemFingerprintWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(ProblemFingerprintWorkflowService.class);

    private final ProblemFingerprintProvider provider;
    private final ProblemProcessingRunRepository runRepository;
    private final ProblemLanguageArtifactRepository artifactRepository;
    private final ProblemFingerprintVersionRepository versionRepository;
    private final int maxRetries;

    public ProblemFingerprintWorkflowService(
            ProblemFingerprintProvider provider,
            ProblemProcessingRunRepository runRepository,
            ProblemLanguageArtifactRepository artifactRepository,
            ProblemFingerprintVersionRepository versionRepository,
            @Value("${app.analysis.fingerprint.max-retries:2}") int maxRetries) {
        this.provider = provider;
        this.runRepository = runRepository;
        this.artifactRepository = artifactRepository;
        this.versionRepository = versionRepository;
        this.maxRetries = maxRetries;
    }

    public Optional<ProblemFingerprintVersion> generateFingerprint(UUID problemId) {
        String idempotencyKey = "FINGERPRINT_" + problemId;

        List<ProblemProcessingRun> existingRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        for (ProblemProcessingRun r : existingRuns) {
            if (idempotencyKey.equals(r.getIdempotencyKey()) && r.getStatus() == AiProcessingStatus.SUCCESS) {
                log.info("Fingerprint already successfully processed for problem {}", problemId);
                return versionRepository.findByProblemIdAndIsLatestTrue(problemId);
            }
        }

        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setProblemId(problemId);
        run.setIdempotencyKey(idempotencyKey);
        run.setStatus(AiProcessingStatus.RUNNING);
        run.setStartedAt(Instant.now());
        run = runRepository.save(run);

        // Fetch related artifact for context
        String original = null;
        String transcript = null;
        String translated = null;
        for (ProblemProcessingRun r : existingRuns) {
            if (r.getStatus() == AiProcessingStatus.SUCCESS && r.getIdempotencyKey().startsWith("TRANSLATION_")) {
                ProblemLanguageArtifact art = artifactRepository.findByRunId(r.getRunId()).orElse(null);
                if (art != null) {
                    original = art.getOriginalContent();
                    transcript = art.getTranscribedText();
                    translated = art.getTranslatedText();
                    break;
                }
            }
        }

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                FingerprintExtractionRequest req = new FingerprintExtractionRequest(
                        problemId,
                        original,
                        transcript,
                        translated,
                        "Mock Location", // Usually loaded from Location repo
                        "Mock Evidence", // Usually loaded from Evidence summary
                        Map.of(),
                        1,
                        UUID.randomUUID().toString()
                );
                
                FingerprintExtractionResult result = provider.extract(req);

                run.setStatus(AiProcessingStatus.SUCCESS);
                run.setCompletedAt(Instant.now());
                run.setProviderMetadata(result.safeProviderMetadata());
                runRepository.save(run);

                // Invalidate old latest
                versionRepository.findByProblemIdAndIsLatestTrue(problemId).ifPresent(old -> {
                    old.setIsLatest(false);
                    versionRepository.save(old);
                });

                // Determine new version number
                int nextVersion = 1;
                List<ProblemProcessingRun> fpRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId).stream()
                        .filter(r -> r.getIdempotencyKey().startsWith("FINGERPRINT_") && r.getStatus() == AiProcessingStatus.SUCCESS)
                        .toList();
                nextVersion += fpRuns.size();

                ProblemFingerprintVersion version = new ProblemFingerprintVersion();
                version.setRunId(run.getRunId());
                version.setProblemId(problemId);
                version.setVersionNumber(nextVersion);
                version.setIsLatest(true);
                version.setFingerprintData(result.payload());
                
                return Optional.of(versionRepository.save(version));

            } catch (ProviderException e) {
                log.warn("Fingerprint provider error attempt {}: {}", attempt, e.getMessage());
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
                log.error("Unexpected error during fingerprint extraction: {}", e.getMessage(), e);
                markFailed(run, "Unexpected error: " + e.getMessage(), false, e);
                return Optional.empty();
            }
        }
        
        markFailed(run, "Failed after retries", true, null);
        return Optional.empty();
    }

    private Optional<ProblemFingerprintVersion> markFailed(ProblemProcessingRun run, String message, boolean transientErr, Throwable ex) {
        run.setStatus(AiProcessingStatus.FAILED);
        run.setErrorCategory(transientErr ? "TRANSIENT_ERROR" : "TERMINAL_ERROR");
        run.setErrorDetails(Map.of("message", message, "exception", ex != null ? ex.getClass().getSimpleName() : "None"));
        run.setCompletedAt(Instant.now());
        runRepository.save(run);
        return Optional.empty();
    }
}
