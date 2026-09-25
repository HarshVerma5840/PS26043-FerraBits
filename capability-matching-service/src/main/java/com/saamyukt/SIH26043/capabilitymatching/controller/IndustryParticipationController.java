package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.IndustryParticipationDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.IndustryParticipationService;
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
public class IndustryParticipationController {

    private final IndustryParticipationService service;

    public IndustryParticipationController(IndustryParticipationService service) {
        this.service = service;
    }

    private boolean isAuthorizedForFinancials() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                                               || a.getAuthority().equals("ROLE_PROJECT_MANAGER")
                                               || a.getAuthority().equals("ROLE_FACULTY")
                                               || a.getAuthority().equals("ROLE_INDUSTRY_USER"));
    }

    @PostMapping("/industry/organizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER')")
    public ResponseEntity<IndustryOrganizationDto> createOrg(@RequestBody IndustryOrganizationDto dto) {
        return ResponseEntity.ok(service.createOrganization(dto));
    }

    @GetMapping("/industry/organizations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<IndustryOrganizationDto>> getOrgs() {
        return ResponseEntity.ok(service.getOrganizations());
    }

    @GetMapping("/industry/organizations/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<IndustryOrganizationDto> getOrg(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getOrganization(id));
    }

    @PatchMapping("/industry/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER')")
    public ResponseEntity<IndustryOrganizationDto> updateOrg(@PathVariable UUID id, @RequestBody IndustryOrganizationDto dto) {
        return ResponseEntity.ok(service.updateOrganization(id, dto));
    }

    @PostMapping("/projects/{projectId}/industry-participants")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER', 'FACULTY')")
    public ResponseEntity<ProjectIndustryParticipantDto> addParticipant(@PathVariable UUID projectId, @RequestBody ProjectIndustryParticipantDto dto) {
        return ResponseEntity.ok(service.addParticipant(projectId, dto));
    }

    @GetMapping("/projects/{projectId}/industry-participants")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectIndustryParticipantDto>> getParticipants(@PathVariable UUID projectId) {
        return ResponseEntity.ok(service.getParticipants(projectId));
    }

    @DeleteMapping("/projects/{projectId}/industry-participants/{participantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER', 'FACULTY')")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID projectId, @PathVariable UUID participantId) {
        service.removeParticipant(participantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/funding")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER')")
    public ResponseEntity<ProjectFundingDto> addFunding(@PathVariable UUID projectId, @RequestBody ProjectFundingDto dto) {
        return ResponseEntity.ok(service.addFunding(projectId, dto));
    }

    @GetMapping("/projects/{projectId}/funding")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectFundingDto>> getFunding(@PathVariable UUID projectId) {
        return ResponseEntity.ok(service.getFunding(projectId, isAuthorizedForFinancials()));
    }

    @PatchMapping("/funding/{fundingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER')")
    public ResponseEntity<ProjectFundingDto> updateFunding(@PathVariable UUID fundingId, @RequestBody ProjectFundingDto dto) {
        return ResponseEntity.ok(service.updateFunding(fundingId, dto));
    }

    @PostMapping("/funding/{fundingId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectFundingDto> approveFunding(@PathVariable UUID fundingId) {
        return ResponseEntity.ok(service.approveFunding(fundingId));
    }

    @PostMapping("/projects/{projectId}/mentorships")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER', 'FACULTY')")
    public ResponseEntity<ProjectMentorshipDto> assignMentor(@PathVariable UUID projectId, @RequestBody ProjectMentorshipDto dto) {
        return ResponseEntity.ok(service.assignMentor(projectId, dto));
    }

    @PostMapping("/mentorships/{mentorshipId}/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INDUSTRY_USER', 'FACULTY', 'STUDENT')")
    public ResponseEntity<MentorshipSessionDto> addSession(@PathVariable UUID mentorshipId, @RequestBody MentorshipSessionDto dto) {
        return ResponseEntity.ok(service.addSession(mentorshipId, dto));
    }
}
