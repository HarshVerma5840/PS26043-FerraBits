package com.saamyukt.SIH26043.capabilitymatching.service.governance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.governance.GovernanceDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.entity.RecommendationDecisionAudit;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.RecommendationDecisionAuditRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationGovernanceService {

    private final RecommendationDecisionAuditRepository auditRepository;
    private final MatchingRunRepository matchingRunRepository;
    private final ObjectMapper objectMapper;

    public RecommendationGovernanceService(
            RecommendationDecisionAuditRepository auditRepository,
            MatchingRunRepository matchingRunRepository,
            ObjectMapper objectMapper) {
        this.auditRepository = auditRepository;
        this.matchingRunRepository = matchingRunRepository;
        this.objectMapper = objectMapper;
    }

    public Page<GovernanceReviewResponse> getReviews(Pageable pageable) {
        return matchingRunRepository.findAll(pageable).map(this::mapToReviewResponse);
    }

    public GovernanceReviewResponse getReview(UUID id) {
        MatchingRun run = matchingRunRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Matching run not found"));
        return mapToReviewResponse(run);
    }

    @Transactional
    public GovernanceAuditRecord approve(UUID id, AuthUser authUser, String requestMetadata) {
        return recordDecision(id, "APPROVE", null, null, authUser, requestMetadata);
    }

    @Transactional
    public GovernanceAuditRecord reject(UUID id, GovernanceReviewDecisionRequest request, AuthUser authUser, String requestMetadata) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Reject decisions require a reason.");
        }
        return recordDecision(id, "REJECT", null, request.getReason(), authUser, requestMetadata);
    }

    @Transactional
    public GovernanceAuditRecord override(UUID id, GovernanceReviewDecisionRequest request, AuthUser authUser, String requestMetadata) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Override decisions require a reason.");
        }
        if (request.getSelectedInstitutionId() == null) {
            throw new IllegalArgumentException("Override decisions require a selected institution ID.");
        }
        return recordDecision(id, "OVERRIDE", request.getSelectedInstitutionId(), request.getReason(), authUser, requestMetadata);
    }

    private GovernanceAuditRecord recordDecision(
            UUID matchingRunId, String decision, UUID selectedInstitutionId, 
            String reason, AuthUser authUser, String requestMetadata) {
        
        MatchingRun run = matchingRunRepository.findById(matchingRunId)
                .orElseThrow(() -> new IllegalArgumentException("Matching run not found"));

        List<RecommendationDecisionAudit> history = auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(matchingRunId);
        if (!history.isEmpty()) {
            RecommendationDecisionAudit lastAudit = history.get(0);
            if (lastAudit.getDecision().equals(decision)) {
                throw new IllegalStateException("Cannot repeat the same decision without an intervening action: " + decision);
            }
        }

        UUID originalInstitutionId = null;
        try {
            if (run.getResultJson() != null) {
                MatchResult matchResult = objectMapper.readValue(run.getResultJson(), MatchResult.class);
                if (matchResult.getMatches() != null && !matchResult.getMatches().isEmpty()) {
                    originalInstitutionId = matchResult.getMatches().get(0).getInstitutionId();
                }
            }
        } catch (Exception e) {
            // Log warning, allow null originalInstitutionId
        }

        String previousHash = getLatestHash();
        OffsetDateTime now = OffsetDateTime.now();
        UUID id = UUID.randomUUID();

        String dataToHash = id.toString() + matchingRunId + run.getProblemId() +
                decision + originalInstitutionId + selectedInstitutionId +
                authUser.getUserId() + authUser.getRole().name() + reason + now + previousHash;

        String currentHash = computeHash(dataToHash);

        RecommendationDecisionAudit audit = RecommendationDecisionAudit.builder()
                .id(id)
                .matchingRunId(matchingRunId)
                .problemId(run.getProblemId())
                .decision(decision)
                .originalInstitutionId(originalInstitutionId)
                .selectedInstitutionId(selectedInstitutionId)
                .actorId(authUser.getUserId())
                .actorRole(authUser.getRole().name())
                .reason(reason)
                .requestMetadata(requestMetadata)
                .createdAt(now)
                .previousHash(previousHash)
                .currentHash(currentHash)
                .build();

        auditRepository.save(audit);

        return mapToAuditRecord(audit);
    }

    private GovernanceReviewResponse mapToReviewResponse(MatchingRun run) {
        List<RecommendationDecisionAudit> audits = auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(run.getRunId());
        
        String status = "PENDING";
        UUID currentDecisionId = null;
        if (!audits.isEmpty()) {
            RecommendationDecisionAudit latest = audits.get(0);
            if (latest.getDecision().equals("APPROVE")) status = "APPROVED";
            else if (latest.getDecision().equals("REJECT")) status = "REJECTED";
            else if (latest.getDecision().equals("OVERRIDE")) status = "OVERRIDDEN";
            currentDecisionId = latest.getId();
        }

        List<EvidenceCard> topCards = new ArrayList<>();
        try {
            if (run.getResultJson() != null) {
                MatchResult matchResult = objectMapper.readValue(run.getResultJson(), MatchResult.class);
                if (matchResult.getMatches() != null) {
                    for (int i = 0; i < Math.min(3, matchResult.getMatches().size()); i++) {
                        MatchResult.MatchedInstitution mi = matchResult.getMatches().get(i);
                        
                        // Fallback logic for building evidence since it depends on the MatchResult structure
                        EvidenceCard card = EvidenceCard.builder()
                                .institutionId(mi.getInstitutionId())
                                .institutionName(mi.getInstitutionName())
                                .departmentName(String.join(", ", Optional.ofNullable(mi.getEvidence()).orElse(List.of())))
                                .labName("")
                                .equipment(mi.getMatchedEquipment() != null ? mi.getMatchedEquipment() : List.of())
                                .faculty(mi.getMatchedSkills() != null ? mi.getMatchedSkills() : List.of())
                                .teamCapability(mi.getTeamSynthesis() != null && mi.getTeamSynthesis().getEvidence() != null
                                        ? String.join("; ", mi.getTeamSynthesis().getEvidence()) : "")
                                .denseScore(mi.getScoreBreakdown() != null ? mi.getScoreBreakdown().getSemanticFit() : 0.0)
                                .sparseScore(mi.getScoreBreakdown() != null ? mi.getScoreBreakdown().getSkillAlignment() : 0.0)
                                .rerankingScore(mi.getScoreBreakdown() != null ? mi.getScoreBreakdown().getPastPerformance() : 0.0)
                                .finalScore(mi.getOverallScore())
                                .explanation(mi.getEvidence() != null ? String.join("; ", mi.getEvidence()) : "")
                                .build();
                        topCards.add(card);
                    }
                }
            }
        } catch (Exception e) {
            // If we can't parse, leave topCards empty
        }

        return GovernanceReviewResponse.builder()
                .reviewId(run.getRunId())
                .problemId(run.getProblemId())
                .status(status)
                .runCreatedAt(run.getCreatedAt())
                .currentDecisionId(currentDecisionId)
                .topEvidenceCards(topCards)
                .auditHistory(audits.stream().map(this::mapToAuditRecord).collect(Collectors.toList()))
                .build();
    }

    private GovernanceAuditRecord mapToAuditRecord(RecommendationDecisionAudit audit) {
        return GovernanceAuditRecord.builder()
                .id(audit.getId())
                .action(audit.getDecision())
                .actorId(audit.getActorId())
                .actorRole(audit.getActorRole())
                .reason(audit.getReason())
                .requestMetadata(audit.getRequestMetadata())
                .originalInstitutionId(audit.getOriginalInstitutionId())
                .selectedInstitutionId(audit.getSelectedInstitutionId())
                .timestamp(audit.getCreatedAt())
                .previousHash(audit.getPreviousHash())
                .currentHash(audit.getCurrentHash())
                .build();
    }

    private String getLatestHash() {
        return auditRepository.findTopByOrderByCreatedAtDesc()
                .map(RecommendationDecisionAudit::getCurrentHash)
                .orElse("0000000000000000000000000000000000000000000000000000000000000000"); // Genesis hash
    }

    private String computeHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
