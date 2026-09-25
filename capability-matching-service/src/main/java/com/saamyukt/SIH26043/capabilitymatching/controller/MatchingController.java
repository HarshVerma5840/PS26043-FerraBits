package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.service.MatchingAlgorithmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/matching")
public class MatchingController {

    private final MatchingAlgorithmService matchingAlgorithmService;

    public MatchingController(MatchingAlgorithmService matchingAlgorithmService) {
        this.matchingAlgorithmService = matchingAlgorithmService;
    }

    @PostMapping("/run")
    public ResponseEntity<MatchResult> runMatching(@RequestBody ProblemFingerprint fingerprint) {
        if (fingerprint == null || fingerprint.getProblemId() == null) {
            return ResponseEntity.badRequest().build();
        }
        MatchResult result = matchingAlgorithmService.runMatching(fingerprint);
        return ResponseEntity.ok(result);
    }
}
