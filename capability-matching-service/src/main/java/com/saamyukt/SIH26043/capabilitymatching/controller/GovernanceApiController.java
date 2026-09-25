package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.governance.GovernanceDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.governance.RecommendationGovernanceService;
import com.saamyukt.SIH26043.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Governance Review API — admin desk for reviewing, approving, rejecting,
 * or overriding AI-generated capability-matching recommendations.
 *
 * All endpoints require ADMIN role.
 *
 * ## Endpoints
 *
 * ### GET /governance/reviews
 * Lists all matching runs (paginated). Each run represents one reviewable recommendation.
 *
 * Query params:
 *   - page (default 0)
 *   - size (default 20)
 *   - sort (default createdAt,desc)
 *
 * ### GET /governance/reviews/{id}
 * Returns full review detail for a matching run, including:
 *   - Top-3 evidence cards (institution, department, lab, equipment, faculty,
 *     team capability, dense/sparse/reranking/final scores, explanation)
 *   - Full audit history with cryptographic hash chain
 *
 * ### POST /governance/reviews/{id}/approve
 * Approves the AI recommendation as-is.
 * No body required.
 *
 * ### POST /governance/reviews/{id}/reject
 * Rejects the recommendation. Body:
 *   { "reason": "string (required, non-blank)" }
 *
 * ### POST /governance/reviews/{id}/override
 * Overrides the recommendation with a different institution. Body:
 *   {
 *     "selectedInstitutionId": "UUID (required)",
 *     "reason": "string (required, non-blank)"
 *   }
 *
 * ## Audit Rules
 * - Every action appends an immutable audit record (no UPDATE/DELETE).
 * - Records are SHA-256 hash-chained for tamper detection.
 * - Includes: actor ID, role, action, previous/new state, reason, timestamp, IP, request metadata.
 * - Repeating the same decision without an intervening different decision is rejected (409).
 */
@RestController
@RequestMapping("/capability/governance/reviews")
public class GovernanceApiController {

    private final RecommendationGovernanceService governanceService;

    public GovernanceApiController(RecommendationGovernanceService governanceService) {
        this.governanceService = governanceService;
    }

    /** GET /capability/governance/reviews — paginated list of all matching run reviews */
    @GetMapping
    public ResponseEntity<Page<GovernanceReviewResponse>> listReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal AuthUser authUser) {

        if (authUser == null || !authUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(governanceService.getReviews(pageable));
    }

    /** GET /capability/governance/reviews/{id} — full review detail with evidence cards and audit chain */
    @GetMapping("/{id}")
    public ResponseEntity<GovernanceReviewResponse> getReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthUser authUser) {

        if (authUser == null || !authUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            return ResponseEntity.ok(governanceService.getReview(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** POST /capability/governance/reviews/{id}/approve — approve the AI recommendation as-is */
    @PostMapping("/{id}/approve")
    public ResponseEntity<GovernanceAuditRecord> approve(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthUser authUser,
            HttpServletRequest httpRequest) {

        if (authUser == null || !authUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            GovernanceAuditRecord record = governanceService.approve(id, authUser, buildMetadata(httpRequest));
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).build();
        }
    }

    /** POST /capability/governance/reviews/{id}/reject — reject the recommendation with a mandatory reason */
    @PostMapping("/{id}/reject")
    public ResponseEntity<GovernanceAuditRecord> reject(
            @PathVariable UUID id,
            @RequestBody GovernanceReviewDecisionRequest request,
            @AuthenticationPrincipal AuthUser authUser,
            HttpServletRequest httpRequest) {

        if (authUser == null || !authUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            GovernanceAuditRecord record = governanceService.reject(id, request, authUser, buildMetadata(httpRequest));
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).build();
        }
    }

    /**
     * POST /capability/governance/reviews/{id}/override — override with a different institution.
     * Requires selectedInstitutionId and a non-blank reason. Preserves the original AI recommendation.
     */
    @PostMapping("/{id}/override")
    public ResponseEntity<GovernanceAuditRecord> override(
            @PathVariable UUID id,
            @RequestBody GovernanceReviewDecisionRequest request,
            @AuthenticationPrincipal AuthUser authUser,
            HttpServletRequest httpRequest) {

        if (authUser == null || !authUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            GovernanceAuditRecord record = governanceService.override(id, request, authUser, buildMetadata(httpRequest));
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).build();
        }
    }

    private String buildMetadata(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = req.getRemoteAddr();
        String requestId = req.getHeader("X-Request-ID");
        String userAgent = req.getHeader("User-Agent");
        return "IP=" + ip
                + (requestId != null ? ", RequestID=" + requestId : "")
                + (userAgent != null ? ", UA=" + userAgent : "");
    }
}
