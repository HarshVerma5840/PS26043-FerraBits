package com.saamyukt.SIH26043.capabilitymatching.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.TeamSynthesisResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.CapabilityCandidate;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.RrfResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.SparseRetrievalRequest;
import com.saamyukt.SIH26043.capabilitymatching.entity.AlgorithmConfig;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.repository.AlgorithmConfigRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.embedding.DenseRetrievalService;
import com.saamyukt.SIH26043.capabilitymatching.service.retrieval.ReciprocalRankFusionService;
import com.saamyukt.SIH26043.capabilitymatching.service.retrieval.SparseCapabilityRetriever;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MatchingAlgorithmService {

    private final MatchingRunRepository matchingRunRepository;
    private final AlgorithmConfigRepository configRepository;
    private final InstitutionRepository institutionRepository;
    private final DenseRetrievalService denseRetrievalService;
    private final SparseCapabilityRetriever sparseRetriever;
    private final ReciprocalRankFusionService rrfService;
    private final RerankingEngine rerankingEngine;
    private final TeamSynthesisService teamSynthesisService;
    private final ObjectMapper objectMapper;

    public MatchingAlgorithmService(
            MatchingRunRepository matchingRunRepository,
            AlgorithmConfigRepository configRepository,
            InstitutionRepository institutionRepository,
            DenseRetrievalService denseRetrievalService,
            SparseCapabilityRetriever sparseRetriever,
            ReciprocalRankFusionService rrfService,
            RerankingEngine rerankingEngine,
            TeamSynthesisService teamSynthesisService,
            ObjectMapper objectMapper) {
        this.matchingRunRepository = matchingRunRepository;
        this.configRepository = configRepository;
        this.institutionRepository = institutionRepository;
        this.denseRetrievalService = denseRetrievalService;
        this.sparseRetriever = sparseRetriever;
        this.rrfService = rrfService;
        this.rerankingEngine = rerankingEngine;
        this.teamSynthesisService = teamSynthesisService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MatchResult runMatching(ProblemFingerprint fingerprint) {
        AlgorithmConfig config = configRepository.findByActiveTrue().orElseGet(() -> {
            AlgorithmConfig defaultCfg = new AlgorithmConfig();
            defaultCfg.setVersion("v1.0.0-fallback");
            defaultCfg.setSemanticWeight(0.25);
            defaultCfg.setSkillWeight(0.20);
            defaultCfg.setInfrastructureWeight(0.20);
            defaultCfg.setPastPerformanceWeight(0.15);
            defaultCfg.setCapacityWeight(0.10);
            defaultCfg.setGeographyWeight(0.10);
            defaultCfg.setCapacityThreshold(100);
            defaultCfg.setMaxDistanceKm(5000.0);
            return defaultCfg;
        });

        // 1. Idempotency Check
        Optional<MatchingRun> existingRun = matchingRunRepository
                .findTopByProblemIdAndFingerprintVersionAndRegistryVersionIdAndAlgorithmVersionOrderByCreatedAtDesc(
                        fingerprint.getProblemId(),
                        fingerprint.getFingerprintVersion(),
                        fingerprint.getFingerprintVersion(), // Assume registry version mirrors or needs passing
                        config.getVersion());

        if (existingRun.isPresent() && existingRun.get().getResultJson() != null) {
            try {
                return objectMapper.readValue(existingRun.get().getResultJson(), MatchResult.class);
            } catch (JsonProcessingException e) {
                // fallback to rerunning if parse fails
            }
        }

        int topK = 50;
        List<DenseRetrievalService.DenseRetrievalResult> denseResults = 
                denseRetrievalService.retrieveTopK(fingerprint, topK, fingerprint.getFingerprintVersion());
        
        List<CapabilityCandidate> denseCandidates = new ArrayList<>();
        for (var dr : denseResults) {
            denseCandidates.add(CapabilityCandidate.builder()
                    .institutionId(dr.getInstitutionId())
                    .name(dr.getName())
                    .score(dr.getSimilarity())
                    .exactEquipmentMiss(false)
                    .build());
        }

        List<String> reqSkills = new ArrayList<>();
        List<String> reqEq = new ArrayList<>();
        if (fingerprint.getRequiredCapabilities() != null) {
            for (ProblemFingerprint.RequiredCapability cap : fingerprint.getRequiredCapabilities()) {
                reqSkills.add(cap.getSkill());
            }
        }
        if (fingerprint.getRequiredEquipment() != null) {
            reqEq.addAll(fingerprint.getRequiredEquipment());
        }

        SparseRetrievalRequest sparseReq = SparseRetrievalRequest.builder()
                .domainTerms(fingerprint.getDomain() + " " + fingerprint.getSubDomain())
                .requiredSkills(reqSkills)
                .requiredEquipment(reqEq)
                .topK(topK)
                .registryVersionId(fingerprint.getFingerprintVersion())
                .build();
        
        List<CapabilityCandidate> sparseCandidates = sparseRetriever.retrieve(sparseReq);

        List<RrfResult> fusedCandidates = rrfService.fuse(denseCandidates, sparseCandidates, topK);

        List<MatchResult.MatchedInstitution> matchedInstitutions = rerankingEngine.rerank(fusedCandidates, fingerprint, config);

        // Sub-step: Synthesize Teams for top N (e.g., top 10 to save time)
        int synthesizeLimit = Math.min(matchedInstitutions.size(), 10);
        for (int i = 0; i < synthesizeLimit; i++) {
            MatchResult.MatchedInstitution mi = matchedInstitutions.get(i);
            Optional<Institution> instOpt = institutionRepository.findById(mi.getInstitutionId());
            if (instOpt.isPresent()) {
                TeamSynthesisResult tsr = teamSynthesisService.synthesizeTeam(instOpt.get(), fingerprint, config);
                mi.setTeamSynthesis(tsr);
                mi.setTeamId(tsr.getTeamId());
                mi.setEvidence(tsr.getEvidence());
            }
        }

        MatchingRun run = new MatchingRun();
        run.setRunId(UUID.randomUUID());
        run.setProblemId(fingerprint.getProblemId());
        run.setAlgorithmVersion(config.getVersion());
        run.setFingerprintVersion(fingerprint.getFingerprintVersion());
        run.setRegistryVersionId(fingerprint.getFingerprintVersion()); // Simplification: pass mapping if needed
        run.setModelName("all-MiniLM-L6-v2");
        run.setModelVersion("v1");
        run.setCorrelationId(UUID.randomUUID());
        run.setCreatedAt(OffsetDateTime.now());
        
        MatchResult result = new MatchResult();
        result.setProblemId(fingerprint.getProblemId());
        result.setMatchingRunId(run.getRunId());
        result.setAlgorithmVersion(run.getAlgorithmVersion());
        result.setMatches(matchedInstitutions);

        try {
            run.setResultJson(objectMapper.writeValueAsString(result));
        } catch (JsonProcessingException e) {
            run.setResultJson("{}");
        }

        matchingRunRepository.save(run);

        return result;
    }
}
