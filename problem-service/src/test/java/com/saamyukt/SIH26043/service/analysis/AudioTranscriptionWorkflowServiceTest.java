package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AudioTranscriptionWorkflowServiceTest {

    private SpeechToTextProvider mockProvider;
    private EvidenceRepository evidenceRepository;
    private ProblemProcessingRunRepository runRepository;
    private AudioTranscriptionWorkflowService service;

    @TempDir
    Path tempDir;

    private UUID problemId;
    private UUID evidenceId;
    private Evidence evidence;
    private Path tempFile;

    @BeforeEach
    void setUp() throws Exception {
        mockProvider = mock(SpeechToTextProvider.class);
        evidenceRepository = mock(EvidenceRepository.class);
        runRepository = mock(ProblemProcessingRunRepository.class);
        service = new AudioTranscriptionWorkflowService(mockProvider, evidenceRepository, runRepository, 2);

        problemId = UUID.randomUUID();
        evidenceId = UUID.randomUUID();

        tempFile = tempDir.resolve("test_audio.mp3");
        Files.writeString(tempFile, "fake audio data");

        evidence = new Evidence();
        evidence.setEvidenceId(evidenceId);
        evidence.setProblemId(problemId);
        evidence.setFileUrl(tempFile.toAbsolutePath().toString());
        evidence.setMetadata(Map.of("mimeType", "audio/mpeg"));

        when(evidenceRepository.findById(evidenceId)).thenReturn(Optional.of(evidence));
        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(Collections.emptyList());
        
        when(runRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testSuccessfulTranscription() {
        when(mockProvider.transcribe(any())).thenReturn(
                new TranscriptionResult("hello", "en", 0.9, "TEST", "123", Map.of(), null)
        );

        Optional<TranscriptionResult> result = service.processAudioEvidence(problemId, evidenceId);

        assertThat(result).isPresent();
        assertThat(result.get().transcriptText()).isEqualTo("hello");

        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        ProblemProcessingRun saved = runCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
    }

    @Test
    void testProviderTimeoutRetriesAndFails() {
        when(mockProvider.transcribe(any())).thenThrow(new ProviderException("Timeout", true));

        Optional<TranscriptionResult> result = service.processAudioEvidence(problemId, evidenceId);

        assertThat(result).isEmpty();
        verify(mockProvider, times(3)).transcribe(any()); // 1 initial + 2 retries

        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        ProblemProcessingRun saved = runCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo(AiProcessingStatus.FAILED);
        assertThat(saved.getErrorCategory()).isEqualTo("TRANSIENT_ERROR");
        assertThat(saved.getRetryCount()).isEqualTo(2);
    }

    @Test
    void testProvider4xxResponseNoRetry() {
        when(mockProvider.transcribe(any())).thenThrow(new ProviderException("Bad Request", false));

        Optional<TranscriptionResult> result = service.processAudioEvidence(problemId, evidenceId);

        assertThat(result).isEmpty();
        verify(mockProvider, times(1)).transcribe(any()); // No retries for non-transient

        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        ProblemProcessingRun saved = runCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo(AiProcessingStatus.FAILED);
        assertThat(saved.getErrorCategory()).isEqualTo("TERMINAL_ERROR");
    }

    @Test
    void testProvider5xxResponseRetries() {
        when(mockProvider.transcribe(any())).thenThrow(new ProviderException("Server Error", true));

        service.processAudioEvidence(problemId, evidenceId);
        verify(mockProvider, times(3)).transcribe(any());
    }

    @Test
    void testUnsupportedMimeType() {
        evidence.setMetadata(Map.of("mimeType", "audio/invalid"));
        when(mockProvider.transcribe(any())).thenThrow(new ProviderException("Unsupported format", false));

        service.processAudioEvidence(problemId, evidenceId);
        verify(mockProvider, times(1)).transcribe(any());
    }

    @Test
    void testDuplicateProcessingRequest() {
        ProblemProcessingRun existingRun = new ProblemProcessingRun();
        existingRun.setIdempotencyKey("AUDIO_TRANSCRIPTION_" + problemId + "_" + evidenceId);
        existingRun.setStatus(AiProcessingStatus.SUCCESS);

        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(List.of(existingRun));

        Optional<TranscriptionResult> result = service.processAudioEvidence(problemId, evidenceId);

        assertThat(result).isEmpty();
        verify(mockProvider, never()).transcribe(any());
    }

    @Test
    void testMissingAudioEvidence() {
        when(evidenceRepository.findById(evidenceId)).thenReturn(Optional.empty());

        Optional<TranscriptionResult> result = service.processAudioEvidence(problemId, evidenceId);

        assertThat(result).isEmpty();
        verify(mockProvider, never()).transcribe(any());
    }

    @Test
    void testUnauthorizedProblemAccess() {
        UUID wrongProblemId = UUID.randomUUID();
        // Request transcription for wrongProblemId, but the evidence belongs to problemId
        Optional<TranscriptionResult> result = service.processAudioEvidence(wrongProblemId, evidenceId);

        assertThat(result).isEmpty();
        verify(mockProvider, never()).transcribe(any());
    }

    @Test
    void testMockProviderBehaviorDirectly() {
        MockSpeechToTextProvider mockImpl = new MockSpeechToTextProvider();
        
        TranscriptionRequest reqValid = new TranscriptionRequest(problemId, evidenceId, null, "audio/mpeg", null, "123");
        TranscriptionResult result = mockImpl.transcribe(reqValid);
        assertThat(result.providerName()).isEqualTo("MOCK");
        assertThat(result.transcriptText()).contains("mock transcription");
        
        TranscriptionRequest reqInvalid = new TranscriptionRequest(problemId, evidenceId, null, "audio/invalid", null, "123");
        org.junit.jupiter.api.Assertions.assertThrows(ProviderException.class, () -> mockImpl.transcribe(reqInvalid));
        
        TranscriptionRequest reqTimeout = new TranscriptionRequest(problemId, evidenceId, null, "audio/mpeg", null, "SIMULATE_TIMEOUT");
        ProviderException ex = org.junit.jupiter.api.Assertions.assertThrows(ProviderException.class, () -> mockImpl.transcribe(reqTimeout));
        assertThat(ex.isTransient()).isTrue();
    }
}
