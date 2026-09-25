package com.saamyukt.SIH26043.capabilitymatching.governance;

import com.saamyukt.SIH26043.capabilitymatching.dto.governance.GovernanceDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.RecommendationDecisionAudit;
import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import com.saamyukt.SIH26043.capabilitymatching.repository.RecommendationDecisionAuditRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.governance.RecommendationGovernanceService;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.security.AuthUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationGovernanceServiceTest {

    @Mock private RecommendationDecisionAuditRepository auditRepository;
    @Mock private MatchingRunRepository matchingRunRepository;

    private RecommendationGovernanceService service;

    private static final UUID RUN_ID = UUID.fromString("aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa");
    private static final UUID PROBLEM_ID = UUID.fromString("bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb");
    private static final UUID ACTOR_ID = UUID.fromString("cccccccc-cccc-4ccc-cccc-cccccccccccc");
    private static final UUID INST_ID = UUID.fromString("dddddddd-dddd-4ddd-dddd-dddddddddddd");

    private AuthUser adminUser;
    private MatchingRun run;

    @BeforeEach
    void setUp() {
        service = new RecommendationGovernanceService(auditRepository, matchingRunRepository, new ObjectMapper());
        adminUser = new AuthUser(ACTOR_ID, "9999999999", UserRole.ADMIN, KycStatus.VERIFIED);
        run = new MatchingRun();
        run.setRunId(RUN_ID);
        run.setProblemId(PROBLEM_ID);
        run.setAlgorithmVersion("v1");
        run.setCreatedAt(OffsetDateTime.now());
        run.setResultJson(null);
    }

    // ─── getReviews ────────────────────────────────────────────────────────────

    @Test
    void getReviews_returnsPageOfRuns() {
        when(matchingRunRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(run)));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of());

        var page = service.getReviews(PageRequest.of(0, 20));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getReviewId()).isEqualTo(RUN_ID);
        assertThat(page.getContent().get(0).getStatus()).isEqualTo("PENDING");
    }

    // ─── getReview ─────────────────────────────────────────────────────────────

    @Test
    void getReview_throwsWhenNotFound() {
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getReview(RUN_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getReview_returnsApprovedStatus_whenLatestAuditIsApprove() {
        RecommendationDecisionAudit approvedAudit = buildAudit("APPROVE", null, null);
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of(approvedAudit));

        var review = service.getReview(RUN_ID);

        assertThat(review.getStatus()).isEqualTo("APPROVED");
        assertThat(review.getAuditHistory()).hasSize(1);
        assertThat(review.getTopEvidenceCards()).isEmpty(); // no resultJson
    }

    // ─── approve ───────────────────────────────────────────────────────────────

    @Test
    void approve_createsAuditRecord() {
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of());
        when(auditRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var record = service.approve(RUN_ID, adminUser, "IP=127.0.0.1");

        assertThat(record.getAction()).isEqualTo("APPROVE");
        assertThat(record.getActorId()).isEqualTo(ACTOR_ID);
        assertThat(record.getActorRole()).isEqualTo("ADMIN");
        assertThat(record.getCurrentHash()).isNotBlank();
        assertThat(record.getPreviousHash()).isEqualTo(
                "0000000000000000000000000000000000000000000000000000000000000000");
    }

    @Test
    void approve_rejectsDuplicateDecision() {
        RecommendationDecisionAudit prev = buildAudit("APPROVE", null, null);
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of(prev));

        assertThatThrownBy(() -> service.approve(RUN_ID, adminUser, "IP=127.0.0.1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot repeat");
    }

    // ─── reject ────────────────────────────────────────────────────────────────

    @Test
    void reject_throwsWhenReasonBlank() {
        var req = GovernanceReviewDecisionRequest.builder()
                .reason("   ") // whitespace only
                .build();
        assertThatThrownBy(() -> service.reject(RUN_ID, req, adminUser, "IP=127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason");
    }

    @Test
    void reject_throwsWhenReasonNull() {
        var req = GovernanceReviewDecisionRequest.builder().build();
        assertThatThrownBy(() -> service.reject(RUN_ID, req, adminUser, "IP=127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason");
    }

    @Test
    void reject_createsAuditWithReason() {
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of());
        when(auditRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var req = GovernanceReviewDecisionRequest.builder().reason("not suitable").build();
        var record = service.reject(RUN_ID, req, adminUser, "IP=127.0.0.1");

        assertThat(record.getAction()).isEqualTo("REJECT");
        assertThat(record.getReason()).isEqualTo("not suitable");
    }

    // ─── override ──────────────────────────────────────────────────────────────

    @Test
    void override_throwsWhenReasonMissing() {
        var req = GovernanceReviewDecisionRequest.builder()
                .selectedInstitutionId(INST_ID)
                .build();
        assertThatThrownBy(() -> service.override(RUN_ID, req, adminUser, "IP=127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason");
    }

    @Test
    void override_throwsWhenSelectedInstitutionMissing() {
        var req = GovernanceReviewDecisionRequest.builder()
                .reason("better option exists")
                .build();
        assertThatThrownBy(() -> service.override(RUN_ID, req, adminUser, "IP=127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("institution");
    }

    @Test
    void override_preservesOriginalAndSetsSelected() {
        // Set up a result_json with a top-ranked institution different from INST_ID
        UUID originalInstId = UUID.fromString("eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee");
        run.setResultJson("{\"problemId\":\"" + PROBLEM_ID + "\",\"matches\":[{\"institutionId\":\"" + originalInstId + "\",\"institutionName\":\"IIT X\",\"overallScore\":0.9}]}");

        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of());
        when(auditRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var req = GovernanceReviewDecisionRequest.builder()
                .selectedInstitutionId(INST_ID)
                .reason("better option exists")
                .build();
        var record = service.override(RUN_ID, req, adminUser, "IP=127.0.0.1");

        assertThat(record.getAction()).isEqualTo("OVERRIDE");
        assertThat(record.getOriginalInstitutionId()).isEqualTo(originalInstId);
        assertThat(record.getSelectedInstitutionId()).isEqualTo(INST_ID);
        assertThat(record.getReason()).isEqualTo("better option exists");
    }

    // ─── hash chaining ─────────────────────────────────────────────────────────

    @Test
    void hashChaining_secondRecordUsesFirstRecordsHash() {
        // First approval
        when(matchingRunRepository.findById(RUN_ID)).thenReturn(Optional.of(run));
        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID)).thenReturn(List.of());
        when(auditRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var first = service.approve(RUN_ID, adminUser, "IP=127.0.0.1");

        // Second action — chain must reference first's hash
        RecommendationDecisionAudit savedFirst = buildAudit("APPROVE", null, null);
        savedFirst.setCurrentHash(first.getCurrentHash());

        when(auditRepository.findByMatchingRunIdOrderByCreatedAtDesc(RUN_ID))
                .thenReturn(List.of(savedFirst)); // already approved, different next action
        when(auditRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.of(savedFirst));

        var req = GovernanceReviewDecisionRequest.builder().reason("reject after approve").build();
        var second = service.reject(RUN_ID, req, adminUser, "IP=127.0.0.1");

        assertThat(second.getPreviousHash()).isEqualTo(first.getCurrentHash());
        assertThat(second.getCurrentHash()).isNotEqualTo(first.getCurrentHash());
    }

    // ─── helpers ───────────────────────────────────────────────────────────────

    private RecommendationDecisionAudit buildAudit(String decision, UUID selected, String reason) {
        return RecommendationDecisionAudit.builder()
                .id(UUID.randomUUID())
                .matchingRunId(RUN_ID)
                .problemId(PROBLEM_ID)
                .decision(decision)
                .actorId(ACTOR_ID)
                .actorRole("ADMIN")
                .originalInstitutionId(null)
                .selectedInstitutionId(selected)
                .reason(reason)
                .createdAt(OffsetDateTime.now())
                .previousHash("0000000000000000000000000000000000000000000000000000000000000000")
                .currentHash("somehash")
                .build();
    }
}
