package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import com.saamyukt.SIH26043.repository.ProblemLanguageArtifactRepository;
import com.saamyukt.SIH26043.repository.ProblemProcessingRunRepository;
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

class TranslationNormalizationWorkflowServiceTest {

    private TranslationProvider mockProvider;
    private ProblemProcessingRunRepository runRepository;
    private ProblemLanguageArtifactRepository artifactRepository;
    private TranslationNormalizationWorkflowService service;
    private UUID problemId;

    @BeforeEach
    void setUp() {
        mockProvider = mock(TranslationProvider.class);
        runRepository = mock(ProblemProcessingRunRepository.class);
        artifactRepository = mock(ProblemLanguageArtifactRepository.class);
        service = new TranslationNormalizationWorkflowService(mockProvider, runRepository, artifactRepository, 2);
        problemId = UUID.randomUUID();

        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(Collections.emptyList());
        when(runRepository.save(any())).thenAnswer(inv -> {
            ProblemProcessingRun r = inv.getArgument(0);
            if (r.getRunId() == null) r.setRunId(UUID.randomUUID());
            return r;
        });
        when(artifactRepository.save(any())).thenAnswer(inv -> {
            ProblemLanguageArtifact a = inv.getArgument(0);
            if (a.getArtifactId() == null) a.setArtifactId(UUID.randomUUID());
            return a;
        });
    }

    @Test
    void testEnglishBypass() {
        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "Hello", null, "en");
        
        assertThat(result).isPresent();
        assertThat(result.get().getTranslatedText()).isEqualTo("Hello");
        verify(mockProvider, never()).translate(any());
        
        ArgumentCaptor<ProblemProcessingRun> runCaptor = ArgumentCaptor.forClass(ProblemProcessingRun.class);
        verify(runRepository, atLeastOnce()).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStatus()).isEqualTo(AiProcessingStatus.SUCCESS);
    }

    @Test
    void testHindiTranslation() {
        when(mockProvider.translate(any())).thenReturn(
                new TranslationResult("Hello", "hi", "en", 0.9, "TEST", "123", Instant.now(), Map.of())
        );

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "नमस्ते", null, "hi");
        
        assertThat(result).isPresent();
        assertThat(result.get().getTranslatedText()).isEqualTo("Hello");
        verify(mockProvider, times(1)).translate(any());
    }

    @Test
    void testUnknownLanguage() {
        when(mockProvider.translate(any())).thenThrow(new ProviderException("Unsupported language", false));

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "???", null, "xyz");
        
        assertThat(result).isEmpty();
        verify(mockProvider, times(1)).translate(any());
    }

    @Test
    void testEmptyText() {
        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "   ", null, "hi");
        
        assertThat(result).isEmpty();
        verify(mockProvider, never()).translate(any());
    }

    @Test
    void testProviderTimeoutRetries() {
        when(mockProvider.translate(any())).thenThrow(new ProviderException("Timeout", true));

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "नमस्ते", null, "hi");
        
        assertThat(result).isEmpty();
        verify(mockProvider, times(3)).translate(any());
    }

    @Test
    void testProviderFailureNoRetry() {
        when(mockProvider.translate(any())).thenThrow(new ProviderException("Bad format", false));

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "नमस्ते", null, "hi");
        
        assertThat(result).isEmpty();
        verify(mockProvider, times(1)).translate(any());
    }

    @Test
    void testDuplicateProcessing() {
        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setRunId(UUID.randomUUID());
        run.setIdempotencyKey("TRANSLATION_" + problemId);
        run.setStatus(AiProcessingStatus.SUCCESS);
        when(runRepository.findByProblemIdOrderByCreatedAtDesc(problemId)).thenReturn(List.of(run));
        
        ProblemLanguageArtifact existing = new ProblemLanguageArtifact();
        existing.setTranslatedText("Existing");
        when(artifactRepository.findByRunId(run.getRunId())).thenReturn(Optional.of(existing));

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "नमस्ते", null, "hi");
        
        assertThat(result).isPresent();
        assertThat(result.get().getTranslatedText()).isEqualTo("Existing");
        verify(mockProvider, never()).translate(any());
    }

    @Test
    void testPreservedOriginalContent() {
        when(mockProvider.translate(any())).thenReturn(
                new TranslationResult("Hello", "hi", "en", 0.9, "TEST", "123", Instant.now(), Map.of())
        );

        Optional<ProblemLanguageArtifact> result = service.normalizeAndTranslate(problemId, "Original text", "Transcript text", "hi");
        
        assertThat(result).isPresent();
        assertThat(result.get().getOriginalContent()).isEqualTo("Original text");
        assertThat(result.get().getTranscribedText()).isEqualTo("Transcript text");
        
        ArgumentCaptor<TranslationRequest> reqCaptor = ArgumentCaptor.forClass(TranslationRequest.class);
        verify(mockProvider).translate(reqCaptor.capture());
        assertThat(reqCaptor.getValue().originalText()).contains("Original text").contains("Transcript text");
    }
}
