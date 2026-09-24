package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProblemControllerFingerprintTest {

    private ProblemRepository problemRepository;
    private ProblemFingerprintVersionRepository versionRepository;
    private ProblemController controller;

    private UUID problemId;
    private AuthUser ownerUser;
    private AuthUser otherUser;
    private AuthUser adminUser;

    @BeforeEach
    void setUp() {
        problemRepository = mock(ProblemRepository.class);
        versionRepository = mock(ProblemFingerprintVersionRepository.class);
        controller = new ProblemController(
                null, null, problemRepository, null, null, null, null, versionRepository, mock(com.saamyukt.SIH26043.service.analysis.Batch2OrchestrationWorkflowService.class)
        );

        problemId = UUID.randomUUID();
        ownerUser = new AuthUser(UUID.randomUUID(), "owner", UserRole.SUBMITTER, KycStatus.VERIFIED);
        otherUser = new AuthUser(UUID.randomUUID(), "other", UserRole.SUBMITTER, KycStatus.VERIFIED);
        adminUser = new AuthUser(UUID.randomUUID(), "admin", UserRole.ADMIN, KycStatus.VERIFIED);

        Problem problem = new Problem();
        problem.setProblemId(problemId);
        problem.setSubmittedByUserId(ownerUser.getUserId());
        when(problemRepository.findById(problemId)).thenReturn(Optional.of(problem));
    }

    @Test
    void ownerCanAccessFingerprint() {
        ProblemFingerprintVersion version = new ProblemFingerprintVersion();
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(problemId, 1, "Dom", null, null, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        version.setFingerprintData(payload);
        when(versionRepository.findByProblemIdAndIsLatestTrue(problemId)).thenReturn(Optional.of(version));

        ProblemFingerprintPayload result = controller.getFingerprint(problemId, ownerUser);
        assertThat(result).isNotNull();
    }

    @Test
    void adminCanAccessFingerprint() {
        ProblemFingerprintVersion version = new ProblemFingerprintVersion();
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(problemId, 1, "Dom", null, null, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        version.setFingerprintData(payload);
        when(versionRepository.findByProblemIdAndIsLatestTrue(problemId)).thenReturn(Optional.of(version));

        ProblemFingerprintPayload result = controller.getFingerprint(problemId, adminUser);
        assertThat(result).isNotNull();
    }

    @Test
    void otherUserCannotAccessFingerprint() {
        ApiException ex = assertThrows(ApiException.class, () -> controller.getFingerprint(problemId, otherUser));
        assertThat(ex.getStatus().value()).isEqualTo(403);
    }

    @Test
    void testHistoryOrdering() {
        ProblemFingerprintVersion v1 = new ProblemFingerprintVersion();
        v1.setVersionNumber(1);
        v1.setProblemId(problemId);
        v1.setFingerprintData(new ProblemFingerprintPayload(problemId, 1, "Dom", null, null, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null));

        ProblemFingerprintVersion v2 = new ProblemFingerprintVersion();
        v2.setVersionNumber(2);
        v2.setProblemId(problemId);
        v2.setFingerprintData(new ProblemFingerprintPayload(problemId, 2, "Dom2", null, null, 6, null, null, null, null, null, null, null, null, null, null, null, null, null, null));

        when(versionRepository.findAll()).thenReturn(List.of(v1, v2));

        List<ProblemFingerprintPayload> history = controller.getFingerprintHistory(problemId);
        assertThat(history).hasSize(2);
        // Should be sorted by version descending
        assertThat(history.get(0).fingerprintVersion()).isEqualTo(2);
        assertThat(history.get(1).fingerprintVersion()).isEqualTo(1);
    }
}
