package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.MatchingAlgorithmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/matching")
public class MatchingApiController {

    private final MatchingAlgorithmService matchingService;
    private final MatchingRunRepository runRepository;
    private final ObjectMapper objectMapper;

    public MatchingApiController(MatchingAlgorithmService matchingService, MatchingRunRepository runRepository, ObjectMapper objectMapper) {
        this.matchingService = matchingService;
        this.runRepository = runRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/runs")
    public ResponseEntity<MatchResult> createMatchingRun(@RequestBody ProblemFingerprint fingerprint) {
        MatchResult result = matchingService.runMatching(fingerprint);
        return ResponseEntity.ok(result);
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

    // Requested Integration Endpoints
    @PostMapping("/registry/import")
    public ResponseEntity<?> importRegistryData(@RequestBody Object payload) {
        // Delegates to CapabilityImportService in full implementation
        return ResponseEntity.ok().build();
    }

    @GetMapping("/registry")
    public ResponseEntity<?> getRegistry() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registry/publish")
    public ResponseEntity<?> publishRegistryVersion() {
        return ResponseEntity.ok().build();
    }
}
