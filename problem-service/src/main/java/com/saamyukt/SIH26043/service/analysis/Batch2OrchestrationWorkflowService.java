package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.enums.EvidenceType;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.web.dto.AiProcessingSummaryResponse;
import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class Batch2OrchestrationWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(Batch2OrchestrationWorkflowService.class);

    private final ProblemRepository problemRepository;
    private final EvidenceRepository evidenceRepository;
    private final AudioTranscriptionWorkflowService audioService;
    private final TranslationNormalizationWorkflowService translationService;
    private final ProblemFingerprintWorkflowService fingerprintService;
    private final ProblemProcessingRunRepository runRepository;
    private final ProblemFingerprintVersionRepository versionRepository;
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public Batch2OrchestrationWorkflowService(
            ProblemRepository problemRepository,
            EvidenceRepository evidenceRepository,
            AudioTranscriptionWorkflowService audioService,
            TranslationNormalizationWorkflowService translationService,
            ProblemFingerprintWorkflowService fingerprintService,
            ProblemProcessingRunRepository runRepository,
            ProblemFingerprintVersionRepository versionRepository) {
        this.problemRepository = problemRepository;
        this.evidenceRepository = evidenceRepository;
        this.audioService = audioService;
        this.translationService = translationService;
        this.fingerprintService = fingerprintService;
        this.runRepository = runRepository;
        this.versionRepository = versionRepository;
    }

    public void processProblemAsync(UUID problemId) {
        executorService.submit(() -> {
            try {
                processProblem(problemId);
            } catch (Exception e) {
                log.error("Unhandled error in E2E async orchestrator for problem {}", problemId, e);
            }
        });
    }

    @Transactional
    public AiProcessingSummaryResponse processProblem(UUID problemId) {
        String idempotencyKey = "ORCHESTRATOR_" + problemId;
        
        List<ProblemProcessingRun> existingRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        for (ProblemProcessingRun r : existingRuns) {
            if (idempotencyKey.equals(r.getIdempotencyKey()) && r.getStatus() == AiProcessingStatus.RUNNING) {
                log.warn("E2E Processing already running for problem {}", problemId);
                return getStatus(problemId);
            }
        }

        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setProblemId(problemId);
        run.setIdempotencyKey(idempotencyKey);
        run.setStatus(AiProcessingStatus.RUNNING);
        run.setStartedAt(Instant.now());
        run = runRepository.save(run);

        try {
            Problem p = problemRepository.findById(problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found"));
            String citizenText = p.getDescription();
            
            List<Evidence> evidenceList = evidenceRepository.findByProblemId(problemId);
            Evidence audioEvidence = evidenceList.stream()
                    .filter(e -> e.getEvidenceType() == EvidenceType.AUDIO)
                    .findFirst().orElse(null);

            String transcript = null;
            if (audioEvidence != null) {
                Optional<TranscriptionResult> tResult = audioService.processAudioEvidence(problemId, audioEvidence.getEvidenceId());
                if (tResult.isPresent()) {
                    transcript = tResult.get().transcriptText();
                } else {
                    // Check if there was a terminal error
                    if (hasTerminalError(problemId, "AUDIO_TRANSCRIPTION_")) {
                        return markFailed(run, "Audio transcription failed terminally", "AUDIO_TRANSCRIPTION_FAILED");
                    }
                }
            }

            // 4 & 5. Language Detection & Translation
            // For batch 2, we assume Hindi if not explicit. In a real system, the client provides it, or a lightweight detector runs.
            String declaredLanguage = "hi"; // Hardcoded default for fallback. Could be pulled from problem.metadata
            Optional<ProblemLanguageArtifact> langArtifact = translationService.normalizeAndTranslate(problemId, citizenText, transcript, declaredLanguage);
            
            if (langArtifact.isEmpty()) {
                if (hasTerminalError(problemId, "TRANSLATION_")) {
                    return markFailed(run, "Translation failed terminally", "TRANSLATION_FAILED");
                }
            }

            // 6 & 7. Fingerprint Extraction & Validation
            Optional<ProblemFingerprintVersion> fingerprintResult = fingerprintService.generateFingerprint(problemId);
            
            if (fingerprintResult.isEmpty()) {
                if (hasTerminalError(problemId, "FINGERPRINT_")) {
                    // LLM Provider failed or not configured. 
                    // Fallback to limited deterministic classifier
                    return handleDeterministicFallback(run, problemId);
                }
            }

            // Success
            run.setStatus(AiProcessingStatus.SUCCESS);
            run.setCompletedAt(Instant.now());
            runRepository.save(run);
            return getStatus(problemId);

        } catch (Exception e) {
            log.error("E2E Orchestrator failed for problem {}", problemId, e);
            return markFailed(run, "Unexpected error: " + e.getMessage(), "UNEXPECTED_ERROR");
        }
    }

    private AiProcessingSummaryResponse handleDeterministicFallback(ProblemProcessingRun run, UUID problemId) {
        log.warn("Falling back to deterministic classifier for problem {}", problemId);
        
        // Mark the orchestrator run as SUCCESS but flag it as fallback
        run.setStatus(AiProcessingStatus.SUCCESS);
        run.setCompletedAt(Instant.now());
        run.setProviderMetadata(Map.of("fallback", true, "reason", "LLM extraction failed or not configured"));
        runRepository.save(run);

        // Invalidate old latest
        versionRepository.findByProblemIdAndIsLatestTrue(problemId).ifPresent(old -> {
            old.setIsLatest(false);
            versionRepository.save(old);
        });

        int nextVersion = 1;
        List<ProblemProcessingRun> fpRuns = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId).stream()
                .filter(r -> r.getIdempotencyKey().startsWith("ORCHESTRATOR_") && r.getStatus() == AiProcessingStatus.SUCCESS)
                .toList();
        nextVersion += fpRuns.size();

        // Deterministic fallback fingerprint (minimal/empty but valid schema)
        ProblemFingerprintPayload fallbackPayload = new ProblemFingerprintPayload(
                problemId, nextVersion, "Unknown", null, null, 1, null, List.of(), List.of(), List.of(), List.of(), null, null, null, null, 0.0, List.of(), List.of("Fallback execution"), List.of(), Map.of("fallback", true)
        );

        ProblemFingerprintVersion fallbackVersion = new ProblemFingerprintVersion();
        fallbackVersion.setProblemId(problemId);
        fallbackVersion.setRunId(run.getRunId());
        fallbackVersion.setIsLatest(true);
        fallbackVersion.setVersionNumber(nextVersion);
        fallbackVersion.setFingerprintData(fallbackPayload);
        versionRepository.save(fallbackVersion);

        return getStatus(problemId);
    }

    private boolean hasTerminalError(UUID problemId, String prefix) {
        return runRepository.findByProblemIdOrderByCreatedAtDesc(problemId).stream()
                .filter(r -> r.getIdempotencyKey().startsWith(prefix))
                .anyMatch(r -> r.getStatus() == AiProcessingStatus.FAILED && "TERMINAL_ERROR".equals(r.getErrorCategory()));
    }

    private AiProcessingSummaryResponse markFailed(ProblemProcessingRun run, String msg, String category) {
        run.setStatus(AiProcessingStatus.FAILED);
        run.setErrorCategory(category);
        run.setErrorDetails(Map.of("message", msg));
        run.setCompletedAt(Instant.now());
        runRepository.save(run);
        return getStatus(run.getProblemId());
    }

    public AiProcessingSummaryResponse getStatus(UUID problemId) {
        List<ProblemProcessingRun> runs = runRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        
        ProblemProcessingRun orchestratorRun = runs.stream()
                .filter(r -> r.getIdempotencyKey().startsWith("ORCHESTRATOR_"))
                .findFirst().orElse(null);
        
        AiProcessingStatus status = orchestratorRun != null ? orchestratorRun.getStatus() : AiProcessingStatus.PENDING;
        String stage = determineStage(runs);
        String lastSuccess = determineLastSuccess(runs);
        boolean retryAvailable = orchestratorRun != null && orchestratorRun.getStatus() == AiProcessingStatus.FAILED && !"TERMINAL_ERROR".equals(orchestratorRun.getErrorCategory());
        
        Integer latestVersion = versionRepository.findByProblemIdAndIsLatestTrue(problemId)
                .map(ProblemFingerprintVersion::getVersionNumber)
                .orElse(null);

        return new AiProcessingSummaryResponse(
                problemId,
                stage,
                status,
                lastSuccess,
                orchestratorRun != null ? orchestratorRun.getErrorCategory() : null,
                retryAvailable,
                latestVersion,
                orchestratorRun != null ? orchestratorRun.getProviderMetadata() : Map.of(),
                orchestratorRun != null ? orchestratorRun.getUpdatedAt() : Instant.now()
        );
    }

    private String determineStage(List<ProblemProcessingRun> runs) {
        if (runs.isEmpty()) return "NOT_STARTED";
        ProblemProcessingRun latest = runs.get(0);
        if (latest.getIdempotencyKey().startsWith("AUDIO_")) return "AUDIO_TRANSCRIPTION";
        if (latest.getIdempotencyKey().startsWith("TRANSLATION_")) return "TRANSLATION";
        if (latest.getIdempotencyKey().startsWith("FINGERPRINT_")) return "FINGERPRINT_EXTRACTION";
        return "ORCHESTRATION";
    }

    private String determineLastSuccess(List<ProblemProcessingRun> runs) {
        return runs.stream()
                .filter(r -> r.getStatus() == AiProcessingStatus.SUCCESS)
                .map(ProblemProcessingRun::getIdempotencyKey)
                .findFirst()
                .orElse("NONE");
    }
}
