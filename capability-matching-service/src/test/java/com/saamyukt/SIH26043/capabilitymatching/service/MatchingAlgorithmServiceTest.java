package com.saamyukt.SIH26043.capabilitymatching.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.entity.AlgorithmConfig;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.repository.AlgorithmConfigRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.RegistryVersionRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.embedding.DenseRetrievalService;
import com.saamyukt.SIH26043.capabilitymatching.service.retrieval.ReciprocalRankFusionService;
import com.saamyukt.SIH26043.capabilitymatching.service.retrieval.SparseCapabilityRetriever;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

public class MatchingAlgorithmServiceTest {

    private MatchingAlgorithmService service;
    private MatchingRunRepository runRepo;
    private AlgorithmConfigRepository configRepo;
    private InstitutionRepository instRepo;
    private DenseRetrievalService denseRetrievalService;
    private SparseCapabilityRetriever sparseRetriever;
    private ReciprocalRankFusionService rrfService;
    private RerankingEngine rerankingEngine;
    private TeamSynthesisService teamSynthesisService;
    private ObjectMapper objectMapper;

    private RegistryVersionRepository registryVersionRepository;

    @BeforeEach
    void setUp() {
        runRepo = Mockito.mock(MatchingRunRepository.class);
        configRepo = Mockito.mock(AlgorithmConfigRepository.class);
        instRepo = Mockito.mock(InstitutionRepository.class);
        denseRetrievalService = Mockito.mock(DenseRetrievalService.class);
        sparseRetriever = Mockito.mock(SparseCapabilityRetriever.class);
        rrfService = Mockito.mock(ReciprocalRankFusionService.class);
        rerankingEngine = Mockito.mock(RerankingEngine.class);
        teamSynthesisService = Mockito.mock(TeamSynthesisService.class);
        registryVersionRepository = Mockito.mock(RegistryVersionRepository.class);
        objectMapper = new ObjectMapper();

        service = new MatchingAlgorithmService(runRepo, configRepo, instRepo, denseRetrievalService, 
                sparseRetriever, rrfService, rerankingEngine, teamSynthesisService, objectMapper, registryVersionRepository);
    }

    @Test
    void testRunMatchingOrchestration() {
        ProblemFingerprint fp = new ProblemFingerprint();
        fp.setProblemId(UUID.randomUUID());

        when(configRepo.findByActiveTrue()).thenReturn(Optional.empty()); // Should use fallback
        when(runRepo.findTopByProblemIdAndFingerprintVersionAndRegistryVersionIdAndAlgorithmVersionOrderByCreatedAtDesc(any(), any(), any(), any())).thenReturn(Optional.empty());
        
        MatchingRun run = new MatchingRun();
        run.setRunId(UUID.randomUUID());
        run.setAlgorithmVersion("v1.0.0-fallback");
        when(runRepo.save(any())).thenReturn(run);

        when(denseRetrievalService.retrieveTopK(any(), anyInt(), any())).thenReturn(Collections.emptyList());
        when(sparseRetriever.retrieve(any())).thenReturn(Collections.emptyList());
        when(rrfService.fuse(any(), any(), anyInt())).thenReturn(Collections.emptyList());
        when(rerankingEngine.rerank(any(), any(), any())).thenReturn(Collections.emptyList());

        MatchResult res = service.runMatching(fp, 1);
        assertEquals(0, res.getMatches().size());
        assertEquals("v1.0.0-fallback", res.getAlgorithmVersion());
    }
}
