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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class Batch2OrchestrationWorkflowServiceTest {

    private ProblemRepository problemRepository;
    private EvidenceRepository evidenceRepository;
    private AudioTranscriptionWorkflowService audioService;
    private TranslationNormalizationWorkflowService translationService;
    private ProblemFingerprintWorkflowService fingerprintService;
    private ProblemProcessingRunRepository runRepository;
    private ProblemFingerprintVersionRepository versionRepository;
    private Batch2OrchestrationWorkflowService orchestrator;

    private UUID problemId;
    private Problem problem;

    @BeforeEach
    void setUp() {
        problemRepository = mock(ProblemRepository.class);
        evidenceRepository = mock(EvidenceRepository.class);
        audioService = mock(AudioTranscriptionWorkflowService.class);
        translationService = mock(TranslationNormalizationWorkflowService.class);
        fingerprintService = mock(ProblemFingerprintWorkflowService.class);
        runRepository = mock(ProblemProcessingRunRepository.class);
        versionRepository = mock(ProblemFingerprintVersionRepository.class);

        orchestrator = new Batch2OrchestrationWorkflowService(
                problemRepository, evidenceRepository, audioService,
                translationService, fingerprintService, runRepository, versionRepository
        );

        problemId = UUID.randomUUID();
        problem = new Problem();
        problem.setProblemId(problemId);
        problem.setDescription("test text");
        
        when(problemRepository.findById(problemId)).thenReturn(Optional.of(problem));
        when(evidenceRepository.findByProblemId(problemId)).thenReturn(Collections.emptyList());
        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(Collections.emptyList());
        
        when(runRepository.save(any())).thenAnswer(inv -> {
            ProblemProcessingRun r = inv.getArgument(0);
            if (r.getRunId() == null) r.setRunId(UUID.randomUUID());
            return r;
        });
    }

    @Test
    void testTextOnlyEnglishProblem() {
        // Mock translation success
        ProblemLanguageArtifact artifact = new ProblemLanguageArtifact();
        when(translationService.normalizeAndTranslate(eq(problemId), any(), any(), any())).thenReturn(Optional.of(artifact));
        
        // Mock fingerprint success
        ProblemFingerprintVersion fpVersion = new ProblemFingerprintVersion();
        when(fingerprintService.generateFingerprint(problemId)).thenReturn(Optional.of(fpVersion));

        AiProcessingSummaryResponse result = orchestrator.processProblem(problemId);

        assertThat(result.currentStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
        verify(audioService, never()).processAudioEvidence(any(), any());
        verify(translationService, times(1)).normalizeAndTranslate(eq(problemId), eq("test text"), eq(null), eq("hi"));
        verify(fingerprintService, times(1)).generateFingerprint(problemId);
    }

    @Test
    void testAudioPlusText() {
        Evidence audio = new Evidence();
        audio.setEvidenceId(UUID.randomUUID());
        audio.setEvidenceType(EvidenceType.AUDIO);
        when(evidenceRepository.findByProblemId(problemId)).thenReturn(List.of(audio));

        when(audioService.processAudioEvidence(problemId, audio.getEvidenceId()))
                .thenReturn(Optional.of(new TranscriptionResult("audio transcript", "hi", 0.9, "TEST", "1", null, Instant.now())));
        
        when(translationService.normalizeAndTranslate(eq(problemId), any(), any(), any())).thenReturn(Optional.of(new ProblemLanguageArtifact()));
        when(fingerprintService.generateFingerprint(problemId)).thenReturn(Optional.of(new ProblemFingerprintVersion()));

        AiProcessingSummaryResponse result = orchestrator.processProblem(problemId);

        assertThat(result.currentStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
        verify(translationService).normalizeAndTranslate(problemId, "test text", "audio transcript", "hi");
    }

    @Test
    void testFallbackOnFingerprintFailure() {
        // Translation succeeds
        when(translationService.normalizeAndTranslate(eq(problemId), any(), any(), any())).thenReturn(Optional.of(new ProblemLanguageArtifact()));
        
        // Fingerprint fails terminally
        when(fingerprintService.generateFingerprint(problemId)).thenReturn(Optional.empty());
        
        ProblemProcessingRun fpRun = new ProblemProcessingRun();
        fpRun.setIdempotencyKey("FINGERPRINT_X");
        fpRun.setStatus(AiProcessingStatus.FAILED);
        fpRun.setErrorCategory("TERMINAL_ERROR");
        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(List.of(fpRun));

        AiProcessingSummaryResponse result = orchestrator.processProblem(problemId);

        // Orchestrator intercepts and applies deterministic fallback
        assertThat(result.currentStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
        
        ArgumentCaptor<ProblemFingerprintVersion> fpCaptor = ArgumentCaptor.forClass(ProblemFingerprintVersion.class);
        verify(versionRepository).save(fpCaptor.capture());
        
        ProblemFingerprintPayload payload = fpCaptor.getValue().getFingerprintData();
        assertThat(payload.extractionModelMetadata()).containsKey("fallback");
    }
}
