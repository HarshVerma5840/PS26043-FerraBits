package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.RegistryImportRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.ImportResultSummary;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.entity.RegistryVersion;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.RegistryVersionRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.MatchingAlgorithmService;
import com.saamyukt.SIH26043.capabilitymatching.service.importing.CapabilityImportService;
import com.saamyukt.SIH26043.capabilitymatching.service.embedding.EmbeddingGenerationService;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/capability")
public class MatchingApiController {

    private final MatchingAlgorithmService matchingService;
    private final MatchingRunRepository runRepository;
    private final CapabilityImportService capabilityImportService;
    private final RegistryVersionRepository registryVersionRepository;
    private final EmbeddingGenerationService embeddingService;
    private final InstitutionRepository institutionRepository;
    private final ObjectMapper objectMapper;

    public MatchingApiController(MatchingAlgorithmService matchingService,
                                 MatchingRunRepository runRepository,
                                 CapabilityImportService capabilityImportService,
                                 RegistryVersionRepository registryVersionRepository,
                                 EmbeddingGenerationService embeddingService,
                                 InstitutionRepository institutionRepository,
                                 ObjectMapper objectMapper) {
        this.matchingService = matchingService;
        this.runRepository = runRepository;
        this.capabilityImportService = capabilityImportService;
        this.registryVersionRepository = registryVersionRepository;
        this.embeddingService = embeddingService;
        this.institutionRepository = institutionRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/runs")
    public ResponseEntity<MatchResult> createMatchingRun(
            @RequestBody ProblemFingerprint fingerprint,
            @RequestParam(required = false) Integer registryVersionId) {
        if (fingerprint == null || fingerprint.getProblemId() == null) {
            return ResponseEntity.badRequest().build();
        }
        MatchResult result = matchingService.runMatching(fingerprint, registryVersionId);
        return ResponseEntity.ok(result);
    }

    @Deprecated
    @PostMapping("/api/v1/matching/run")
    public ResponseEntity<MatchResult> createMatchingRunCompatibility(
            @RequestBody ProblemFingerprint fingerprint,
            @RequestParam(required = false) Integer registryVersionId) {
        return createMatchingRun(fingerprint, registryVersionId);
    }

    @GetMapping("/runs/{matchingRunId}")
    public ResponseEntity<MatchResult> getMatchingRun(@PathVariable UUID matchingRunId) {
        Optional<MatchingRun> run = runRepository.findById(matchingRunId);
        if (run.isEmpty() || run.get().getResultJson() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            MatchResult result = objectMapper.readValue(run.get().getResultJson(), MatchResult.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/problems/{problemId}/latest")
    public ResponseEntity<MatchResult> getLatestRunForProblem(@PathVariable UUID problemId) {
        Optional<MatchingRun> run = runRepository.findTopByProblemIdOrderByCreatedAtDesc(problemId);
        if (run.isEmpty() || run.get().getResultJson() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            MatchResult result = objectMapper.readValue(run.get().getResultJson(), MatchResult.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
