package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AudioTranscriptionWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(AudioTranscriptionWorkflowService.class);

    private final SpeechToTextProvider provider;
    private final EvidenceRepository evidenceRepository;
    private final ProblemProcessingRunRepository runRepository;
    private final int maxRetries;

    public AudioTranscriptionWorkflowService(
            SpeechToTextProvider provider,
            EvidenceRepository evidenceRepository,
            ProblemProcessingRunRepository runRepository,
            @Value("${app.analysis.speech.max-retries:2}") int maxRetries) {
        this.provider = provider;
        this.evidenceRepository = evidenceRepository;
        this.runRepository = runRepository;
        this.maxRetries = maxRetries;
    }

    public Optional<TranscriptionResult> processAudioEvidence(UUID problemId, UUID evidenceId) {
        String idempotencyKey = "AUDIO_TRANSCRIPTION_" + problemId + "_" + evidenceId;

        // 7. Idempotent processing based on problem/evidence
        List<ProblemProcessingRun> existingRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        for (ProblemProcessingRun r : existingRuns) {
            if (idempotencyKey.equals(r.getIdempotencyKey()) && r.getStatus() == AiProcessingStatus.SUCCESS) {
                log.info("Audio transcription already successfully processed for evidence {}", evidenceId);
                return Optional.empty(); // Already successfully transcribed
            }
        }

        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setProblemId(problemId);
        run.setIdempotencyKey(idempotencyKey);
        run.setStatus(AiProcessingStatus.RUNNING);
        run.setStartedAt(Instant.now());
        run = runRepository.save(run);

        // 9. Authorization-safe audio retrieval (we are in the backend context, but we must verify evidence belongs to problem)
        Evidence evidence = evidenceRepository.findById(evidenceId).orElse(null);
        if (evidence == null || !evidence.getProblemId().equals(problemId)) {
            return markFailed(run, "Evidence not found or unauthorized", false, null);
        }

        Path filePath = Path.of(evidence.getFileUrl());
        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return markFailed(run, "File not readable", false, null);
            }
        } catch (Exception e) {
            return markFailed(run, "Error locating file: " + e.getMessage(), false, e);
        }

        String mimeType = (String) evidence.getMetadata().getOrDefault("mimeType", "audio/mpeg");

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try (InputStream is = resource.getInputStream()) {
                TranscriptionRequest request = new TranscriptionRequest(
                        problemId,
                        evidenceId,
                        is,
                        mimeType,
                        null,
                        UUID.randomUUID().toString()
                );

                TranscriptionResult result = provider.transcribe(request);

                run.setStatus(AiProcessingStatus.SUCCESS);
                run.setProviderMetadata(result.rawResponseMetadata());
                run.setCompletedAt(Instant.now());
                runRepository.save(run);

                return Optional.of(result);

            } catch (ProviderException e) {
                log.warn("Provider error on attempt {}: {}", attempt, e.getMessage());
                if (!e.isTransient()) {
                    // 5. Non-retry handling for invalid files or unsupported languages.
                    return markFailed(run, e.getMessage(), false, e);
                }
                if (attempt > maxRetries) {
                    return markFailed(run, "Max retries exceeded: " + e.getMessage(), true, e);
                }
                run.setRetryCount(attempt);
                run.setStatus(AiProcessingStatus.RETRYING);
                runRepository.save(run);
            } catch (Exception e) {
                log.error("Unexpected error during transcription: {}", e.getMessage(), e);
                return markFailed(run, "Unexpected error: " + e.getMessage(), false, e);
            }
        }

        return markFailed(run, "Failed after retries", true, null);
    }

    private Optional<TranscriptionResult> markFailed(ProblemProcessingRun run, String message, boolean transientErr, Throwable ex) {
        run.setStatus(AiProcessingStatus.FAILED);
        run.setErrorCategory(transientErr ? "TRANSIENT_ERROR" : "TERMINAL_ERROR");
        run.setErrorDetails(Map.of("message", message, "exception", ex != null ? ex.getClass().getSimpleName() : "None"));
        run.setCompletedAt(Instant.now());
        runRepository.save(run);
        return Optional.empty();
    }
}
