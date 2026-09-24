package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.AuditLog;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.AuditAction;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.AuditLogRepository;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.LocationRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.service.DraftService;
import com.saamyukt.SIH26043.service.ProblemCollectionEngine;
import com.saamyukt.SIH26043.web.dto.CitizenProblemResponse;
import com.saamyukt.SIH26043.web.dto.CitizenStatusHistoryEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DraftControllerMyProblemsTest {

    private final DraftService draftService = mock(DraftService.class);
    private final ProblemCollectionEngine submissionEngine = mock(ProblemCollectionEngine.class);
    private final ProblemRepository problemRepository = mock(ProblemRepository.class);
    private final LocationRepository locationRepository = mock(LocationRepository.class);
    private final EvidenceRepository evidenceRepository = mock(EvidenceRepository.class);
    private final AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);

    private DraftController controller;
    private AuthUser me;
    private AuthUser otherUser;

    @BeforeEach
    void setUp() {
        controller = new DraftController(draftService, submissionEngine, problemRepository, locationRepository, evidenceRepository, auditLogRepository, org.mockito.Mockito.mock(com.saamyukt.SIH26043.service.ProblemStatusService.class));
        me = new AuthUser(UUID.randomUUID(), "111", UserRole.SUBMITTER, KycStatus.VERIFIED);
        otherUser = new AuthUser(UUID.randomUUID(), "222", UserRole.SUBMITTER, KycStatus.VERIFIED);
    }

    @Test
    void shouldReturnMyProblemsSanitized() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setSubmittedByUserId(me.getUserId());
        p.setTitle("Secret Title");
        p.setStatus(ProblemStatus.DRAFT);
        p.setSubmittedAt(Instant.now());

        when(problemRepository.findBySubmittedByUserId(me.getUserId(), Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(p)));
        when(evidenceRepository.countByProblemId(p.getProblemId())).thenReturn(2L);

        Page<CitizenProblemResponse> response = controller.listMyProblems(me, Pageable.unpaged());
        assertThat(response).hasSize(1);
        CitizenProblemResponse summary = response.getContent().get(0);
        assertThat(summary.title()).isEqualTo("Secret Title");
        assertThat(summary.evidenceCount()).isEqualTo(2);
        assertThat(summary.internalStatus()).isEqualTo(ProblemStatus.DRAFT);
        assertThat(summary.citizenStatus()).isEqualTo("DRAFT");
        assertThat(summary.locationSummary()).isEqualTo("Unknown Location"); // No location mock
    }

    @Test
    void shouldRejectAccessToOtherUsersProblem() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setSubmittedByUserId(otherUser.getUserId());

        when(problemRepository.findById(p.getProblemId())).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> controller.getMyProblem(p.getProblemId(), me))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
                
        assertThatThrownBy(() -> controller.getStatusHistory(p.getProblemId(), me))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void shouldReturnRejectedAndArchivedProblems() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setSubmittedByUserId(me.getUserId());
        p.setStatus(ProblemStatus.REJECTED);

        when(problemRepository.findById(p.getProblemId())).thenReturn(Optional.of(p));
        CitizenProblemResponse res = controller.getMyProblem(p.getProblemId(), me);
        assertThat(res.citizenStatus()).isEqualTo("REJECTED");

        p.setStatus(ProblemStatus.ARCHIVED);
        res = controller.getMyProblem(p.getProblemId(), me);
        assertThat(res.citizenStatus()).isEqualTo("ARCHIVED");
    }

    @Test
    void shouldReturnStatusHistoryOrdered() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setSubmittedByUserId(me.getUserId());

        AuditLog log1 = new AuditLog();
        log1.setLogId(UUID.randomUUID());
        log1.setActionType(AuditAction.CREATED);
        log1.setPerformedAt(Instant.now().minusSeconds(100));

        AuditLog log2 = new AuditLog();
        log2.setLogId(UUID.randomUUID());
        log2.setActionType(AuditAction.STATUS_CHANGED);
        log2.setAfterState(Map.of("status", "SUBMITTED"));
        log2.setPerformedAt(Instant.now());

        when(problemRepository.findById(p.getProblemId())).thenReturn(Optional.of(p));
        when(auditLogRepository.findByProblemIdOrderByPerformedAtAsc(p.getProblemId()))
                .thenReturn(List.of(log1, log2));

        List<CitizenStatusHistoryEntry> history = controller.getStatusHistory(p.getProblemId(), me);
        assertThat(history).hasSize(2);
        assertThat(history.get(0).citizenFriendlyMessage()).isEqualTo("Problem submitted for review.");
        assertThat(history.get(1).citizenFriendlyMessage()).isEqualTo("Status changed to SUBMITTED.");
        assertThat(history.get(0).performedAt()).isBefore(history.get(1).performedAt());
    }
    
    @Test
    void shouldMapInternalStatusProperly() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setSubmittedByUserId(me.getUserId());
        
        p.setStatus(ProblemStatus.SOURCE_VERIFYING);
        when(problemRepository.findById(p.getProblemId())).thenReturn(Optional.of(p));
        CitizenProblemResponse res = controller.getMyProblem(p.getProblemId(), me);
        assertThat(res.citizenStatus()).isEqualTo("UNDER_VERIFICATION");
        assertThat(res.expectedNextStage()).isEqualTo("VERIFIED");
        
        p.setStatus(ProblemStatus.REGISTERED);
        res = controller.getMyProblem(p.getProblemId(), me);
        assertThat(res.citizenStatus()).isEqualTo("ASSIGNED");
        assertThat(res.expectedNextStage()).isEqualTo("IN_PROGRESS");
    }
}
