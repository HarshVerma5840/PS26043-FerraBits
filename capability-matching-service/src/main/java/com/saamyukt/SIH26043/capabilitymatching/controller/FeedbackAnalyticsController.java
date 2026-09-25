package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.FeedbackAnalyticsDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.FeedbackAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import java.util.Collection;

@RestController
@RequestMapping("/capability/api/v1")
public class FeedbackAnalyticsController {

    private final FeedbackAnalyticsService service;

    public FeedbackAnalyticsController(FeedbackAnalyticsService service) {
        this.service = service;
    }

    private UUID getCurrentUserId() {
        try {
            return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            return null; // For truly public feedback if enabled, else null
        }
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @PostMapping("/projects/{projectId}/feedback")
    @PreAuthorize("permitAll()") // Citizen feedback can be open or authenticated based on config
    public ResponseEntity<CitizenFeedbackDto> submitFeedback(@PathVariable UUID projectId, @RequestBody CreateFeedbackDto dto) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(service.submitFeedback(projectId, dto, userId != null ? userId : UUID.randomUUID()));
    }

    @GetMapping("/projects/{projectId}/feedback")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<CitizenFeedbackDto>> getProjectFeedback(@PathVariable UUID projectId) {
        return ResponseEntity.ok(service.getProjectFeedback(projectId, isAdmin()));
    }

    @PatchMapping("/feedback/{feedbackId}/moderation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CitizenFeedbackDto> moderateFeedback(@PathVariable UUID feedbackId, @RequestParam String status) {
        return ResponseEntity.ok(service.moderateFeedback(feedbackId, status));
    }

    @GetMapping("/feedback/summary")
    @PreAuthorize("permitAll()")
    public ResponseEntity<FeedbackSummaryDto> getFeedbackSummary() {
        return ResponseEntity.ok(service.getFeedbackSummary());
    }

    @GetMapping("/analytics/impact")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ImpactMetricsDto> getImpactMetrics() {
        return ResponseEntity.ok(service.getImpactMetrics());
    }

    // Example endpoints for granular analytics (districts, institutions, projects)
    @GetMapping("/analytics/districts")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> getDistrictsAnalytics() {
        return ResponseEntity.ok("District analytics endpoint");
    }

    @GetMapping("/analytics/institutions")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> getInstitutionsAnalytics() {
        return ResponseEntity.ok("Institutions analytics endpoint");
    }

    @GetMapping("/analytics/projects")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> getProjectsAnalytics() {
        return ResponseEntity.ok("Projects analytics endpoint");
    }
}
