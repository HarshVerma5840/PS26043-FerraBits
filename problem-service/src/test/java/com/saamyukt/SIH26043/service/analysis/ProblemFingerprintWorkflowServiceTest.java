package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository;
import com.saamyukt.SIH26043.repository.ProblemLanguageArtifactRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProblemFingerprintWorkflowServiceTest {

    private ProblemFingerprintProvider mockProvider;
    private ProblemProcessingRunRepository runRepository;
    private ProblemLanguageArtifactRepository artifactRepository;
    private ProblemFingerprintVersionRepository versionRepository;
    private ProblemFingerprintWorkflowService service;
    private UUID problemId;

    @BeforeEach
    void setUp() {
        mockProvider = mock(ProblemFingerprintProvider.class);
        runRepository = mock(ProblemProcessingRunRepository.class);
        artifactRepository = mock(ProblemLanguageArtifactRepository.class);
        versionRepository = mock(ProblemFingerprintVersionRepository.class);
        service = new ProblemFingerprintWorkflowService(mockProvider, runRepository, artifactRepository, versionRepository, 2);
        problemId = UUID.randomUUID();

        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(Collections.emptyList());
        when(runRepository.save(any())).thenAnswer(inv -> {
            ProblemProcessingRun r = inv.getArgument(0);
            if (r.getRunId() == null) r.setRunId(UUID.randomUUID());
            return r;
        });
        when(versionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private FingerprintExtractionResult createSuccessResult() {
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                problemId, 1, "Dom", null, null, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );
        return new FingerprintExtractionResult(payload, "TEST", "123", "v1", "test-model", Map.of(), Instant.now());
    }

    @Test
    void testValidStructuredOutput() {
        when(mockProvider.extract(any())).thenReturn(createSuccessResult());

        Optional<ProblemFingerprintVersion> result = service.generateFingerprint(problemId);
        
        assertThat(result).isPresent();
        assertThat(result.get().getFingerprintData().domain()).isEqualTo("Dom");
        verify(mockProvider, times(1)).extract(any());
        
        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
    }

    @Test
    void testProviderTimeoutRetries() {
        when(mockProvider.extract(any())).thenThrow(new ProviderException("Timeout", true));

        Optional<ProblemFingerprintVersion> result = service.generateFingerprint(problemId);
        
        assertThat(result).isEmpty();
        verify(mockProvider, times(3)).extract(any());
    }

    @Test
    void testProvider5xxRetries() {
        when(mockProvider.extract(any())).thenThrow(new ProviderException("500 Server Error", true));
        service.generateFingerprint(problemId);
        verify(mockProvider, times(3)).extract(any());
    }

    @Test
    void testRetrySuccess() {
        when(mockProvider.extract(any()))
            .thenThrow(new ProviderException("Malformed JSON", true)) // 1st fails
            .thenReturn(createSuccessResult()); // 2nd succeeds

        Optional<ProblemFingerprintVersion> result = service.generateFingerprint(problemId);
        
        assertThat(result).isPresent();
        verify(mockProvider, times(2)).extract(any());
        
        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
    }

    @Test
    void testRetryExhaustion() {
        when(mockProvider.extract(any())).thenThrow(new ProviderException("Malformed JSON", true));

        Optional<ProblemFingerprintVersion> result = service.generateFingerprint(problemId);
        
        assertThat(result).isEmpty();
        verify(mockProvider, times(3)).extract(any());
        
        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStatus()).isEqualTo(AiProcessingStatus.FAILED);
    }

    @Test
    void testMockProviderBehavior() {
        MockProblemFingerprintProvider mockImpl = new MockProblemFingerprintProvider();
        
        FingerprintExtractionRequest reqValid = new FingerprintExtractionRequest(problemId, null, null, null, null, null, null, 1, "123");
        FingerprintExtractionResult result = mockImpl.extract(reqValid);
        assertThat(result.providerName()).isEqualTo("MOCK_FINGERPRINT");
        assertThat(result.payload().urgencyScore()).isEqualTo(8);
        
        FingerprintExtractionRequest reqTimeout = new FingerprintExtractionRequest(problemId, null, null, null, null, null, null, 1, "SIMULATE_TIMEOUT");
        ProviderException ex = org.junit.jupiter.api.Assertions.assertThrows(ProviderException.class, () -> mockImpl.extract(reqTimeout));
        assertThat(ex.isTransient()).isTrue();
    }
}
