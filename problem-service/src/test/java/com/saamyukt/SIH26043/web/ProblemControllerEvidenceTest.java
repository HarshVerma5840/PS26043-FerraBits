package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.service.EvidenceUploadService;
import com.saamyukt.SIH26043.service.ProblemStatusService;
import com.saamyukt.SIH26043.service.ProblemSubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

class ProblemControllerEvidenceTest {

    private final ProblemSubmissionService submissionService = mock(ProblemSubmissionService.class);
    private final ProblemStatusService statusService = mock(ProblemStatusService.class);
    private final ProblemRepository problemRepository = mock(ProblemRepository.class);
    private final EvidenceUploadService evidenceUploadService = mock(EvidenceUploadService.class);
    private final EvidenceRepository evidenceRepository = mock(EvidenceRepository.class);
    private final com.saamyukt.SIH26043.repository.LocationRepository locationRepository = mock(com.saamyukt.SIH26043.repository.LocationRepository.class);

    private ProblemController controller;
    private AuthUser me;
    private AuthUser otherUser;
    private AuthUser admin;
    private Problem problem;
    private Evidence evidence;

    @BeforeEach
    void setUp() {
        controller = new ProblemController(submissionService, statusService, problemRepository, locationRepository, evidenceUploadService, evidenceRepository, mock(com.saamyukt.SIH26043.service.AuditService.class), mock(com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository.class), mock(com.saamyukt.SIH26043.service.analysis.Batch2OrchestrationWorkflowService.class));
        me = new AuthUser(UUID.randomUUID(), "111", UserRole.SUBMITTER, KycStatus.VERIFIED);
        otherUser = new AuthUser(UUID.randomUUID(), "222", UserRole.SUBMITTER, KycStatus.VERIFIED);
        admin = new AuthUser(UUID.randomUUID(), "333", UserRole.ADMIN, KycStatus.VERIFIED);

        problem = new Problem();
        problem.setProblemId(UUID.randomUUID());
        problem.setSubmittedByUserId(me.getUserId());
        problem.setStatus(ProblemStatus.DRAFT);

        evidence = new Evidence();
        evidence.setEvidenceId(UUID.randomUUID());
        evidence.setProblemId(problem.getProblemId());
        evidence.setFileUrl("test.jpg");
    }

    @Test
    void shouldDeleteEvidenceIfDraftAndOwner() {
        when(problemRepository.findById(problem.getProblemId())).thenReturn(Optional.of(problem));
        when(evidenceRepository.findById(evidence.getEvidenceId())).thenReturn(Optional.of(evidence));

        controller.deleteEvidence(problem.getProblemId(), evidence.getEvidenceId(), me, mock(jakarta.servlet.http.HttpServletRequest.class));

        verify(evidenceRepository).delete(evidence);
    }

    @Test
    void shouldRejectDeleteEvidenceIfSubmitted() {
        problem.setStatus(ProblemStatus.SUBMITTED);
        when(problemRepository.findById(problem.getProblemId())).thenReturn(Optional.of(problem));

        assertThatThrownBy(() -> controller.deleteEvidence(problem.getProblemId(), evidence.getEvidenceId(), me, mock(jakarta.servlet.http.HttpServletRequest.class)))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(evidenceRepository, never()).delete(evidence);
    }

    @Test
    void shouldRejectDeleteEvidenceIfUnauthorized() {
        when(problemRepository.findById(problem.getProblemId())).thenReturn(Optional.of(problem));

        assertThatThrownBy(() -> controller.deleteEvidence(problem.getProblemId(), evidence.getEvidenceId(), otherUser, mock(jakarta.servlet.http.HttpServletRequest.class)))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void shouldRejectDownloadIfUnauthorized() {
        when(problemRepository.findById(problem.getProblemId())).thenReturn(Optional.of(problem));

        assertThatThrownBy(() -> controller.downloadEvidence(problem.getProblemId(), evidence.getEvidenceId(), otherUser))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }
}
